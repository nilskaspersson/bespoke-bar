#!/usr/bin/env bash
set -euo pipefail

# Build + install + launch the app on an iOS Simulator, then start Metro.
#
# Why this exists instead of `expo run:ios`:
#   The Clerk config plugin adds the `com.apple.developer.applesignin`
#   entitlement (Sign in with Apple). Expo's CLI treats any build whose
#   entitlements include applesignin/associated-domains as requiring a real
#   Apple Development signing identity — even for the Simulator — and aborts
#   with "No code signing certificates are available to use." Plain xcodebuild
#   for a Simulator destination signs ad-hoc and needs no certificate, so we
#   drive the build directly. (Set up a personal team in Xcode and this whole
#   script can go back to being `expo run:ios`.)
#
# Usage: pnpm ios ["iPhone 17"]   (device name optional; overrides $SIM)

cd "$(dirname "$0")/.."

SIM_NAME="${1:-${SIM:-iPhone 17}}"
SCHEME="BespokeBar"
WORKSPACE="ios/BespokeBar.xcworkspace"
BUNDLE_ID="app.bespoke-bar.bar"
DERIVED="ios/build"
APP_PATH="$DERIVED/Build/Products/Debug-iphonesimulator/$SCHEME.app"

if [[ ! -d "$WORKSPACE" ]]; then
  echo "✗ $WORKSPACE not found — run 'npx expo prebuild --clean' first." >&2
  exit 1
fi

echo "▸ Booting Simulator: $SIM_NAME"
xcrun simctl boot "$SIM_NAME" 2>/dev/null || true
open -a Simulator

echo "▸ Building $SCHEME (Debug, Simulator, ad-hoc signed)…"
# `xcodebuild -quiet` still emits pod deprecation warnings on a clean build; pipe
# through xcbeautify when it's on PATH (`brew install xcbeautify`) for clean logs.
if command -v xcbeautify >/dev/null 2>&1; then
  set -o pipefail
  xcodebuild \
    -workspace "$WORKSPACE" \
    -scheme "$SCHEME" \
    -configuration Debug \
    -destination "platform=iOS Simulator,name=$SIM_NAME" \
    -derivedDataPath "$DERIVED" \
    build | xcbeautify
else
  xcodebuild \
    -workspace "$WORKSPACE" \
    -scheme "$SCHEME" \
    -configuration Debug \
    -destination "platform=iOS Simulator,name=$SIM_NAME" \
    -derivedDataPath "$DERIVED" \
    -quiet \
    build
fi

echo "▸ Installing $BUNDLE_ID"
xcrun simctl install "$SIM_NAME" "$APP_PATH"

echo "▸ Launching"
xcrun simctl launch "$SIM_NAME" "$BUNDLE_ID" >/dev/null

# Reuse a dev server if one is already serving on 8081; otherwise start Metro
# in the foreground so the just-launched dev-client connects to it.
if curl -s --max-time 1 http://localhost:8081/status 2>/dev/null | grep -q "packager-status:running"; then
  echo "✓ App launched. Metro already running on :8081 — it will connect automatically."
else
  echo "✓ App launched. Starting Metro (Ctrl-C to stop)…"
  exec npx expo start --dev-client
fi
