# @bespoke/mobile

The Bespoke Bar iOS app — an Expo (SDK 57, React Native 0.86, New Architecture) client of the same tRPC API the web app serves. Read-only for now: browse, search, and read recipes, with the full library available offline. Recipes are managed on the web.

Agents: also read [AGENTS.md](./AGENTS.md) before writing code.

## Toolchain prerequisites

- **Node + pnpm** — install workspace deps from the **repo root**: `pnpm install`
- **Full Xcode** (not just CLT) with an iOS Simulator runtime installed
- **CocoaPods** (`pod --version` should work) and **watchman**
- Optional: `xcbeautify` (brew) for readable build logs

No Apple Developer account is needed for Simulator development. Expo Go is **not** used — this app runs as a dev-client build.

## First-time setup

1. Create `apps/mobile/.env` (gitignored):

   ```sh
   EXPO_PUBLIC_API_URL=http://localhost:3000
   EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_…   # dev instance key, see eas.json preview profile
   ```

2. Generate the native project (required on first run, and again after changing `app.json`, plugins, fonts, or native dependencies):

   ```sh
   npx expo prebuild --clean
   ```

   `ios/` is generated and **not** in git — `app.json` is the source of truth. Always `--clean`; incremental prebuild leaves stale Xcode references.

3. Run the API: the app talks to the bar dev server at `localhost:3000`. Start it with **real Clerk auth** (`NEXT_PUBLIC_OFFLINE_DEV_AUTH` off) — the app sends real Clerk Bearer tokens; the offline-auth stub would answer as the wrong user.

   ```sh
   pnpm --filter bar dev
   ```

## Daily commands (run from `apps/mobile`)

| Command | What it does |
| --- | --- |
| `pnpm ios` | Build + install + launch on a Simulator, then start/reuse Metro. Optional device: `pnpm ios "iPhone 17"` or `SIM=…` |
| `pnpm start` | Metro only (`expo start --dev-client`) when the app is already installed |
| `pnpm lint` / `pnpm check-types` | Biome / `tsc` (also run repo-wide via `pnpm turbo run lint check-types`) |
| `pnpm bundle` | Metro export smoke test (what CI runs) — catches bundle-time breakage `tsc` can't |
| `pnpm build:ios:preview` / `build:ios` / `submit:ios` | EAS build/submit (requires `eas init` + real values in `eas.json` — pending) |

`pnpm ios` drives `scripts/dev-ios.sh` (plain `xcodebuild` + `simctl`) instead of `expo run:ios`: the Clerk plugin adds the Sign-in-with-Apple entitlement, which makes Expo's CLI demand a signing certificate even for Simulator builds. Ad-hoc `xcodebuild` needs none. Set up a personal team in Xcode if you ever want `expo run:ios` back.

## Testing gotchas

- **Offline testing:** kill the bar dev server, don't disable Wi-Fi — the Simulator keeps loopback alive, so `localhost:3000` stays reachable with Wi-Fi off.
- **Metro must be restarted** after a `tsconfig.json` `paths` change (its TS resolver initializes lazily). `pnpm ios` reuses a running Metro — kill it first.
- Version-floor UX: raise `min-app-version-ios` in the dev Edge Config to see the update banner.
- Theme: the in-app picker (Settings tab) overrides the OS scheme via `Appearance.setColorScheme`; the splash alone always follows the OS.

## Architecture in one paragraph

Routes live in `app/` (expo-router: `(app)` = the auth gate, `(recipes)` stack + `settings` under native bottom tabs); shared code in `src/` (`theme/` hand-mirrored design tokens per ADR-0014, `offline/` MMKV-persisted TanStack Query cache, `trpc/` client + version-floor store, `auth/` Clerk gate screens). Mobile imports **values** only from `@bespoke/schema` and `@bespoke/domain`, plus `import type { AppRouter }` from `@bespoke/api` — never `@bespoke/ui`/`@bespoke/db` (Biome-enforced). The wire is plain JSON, additive-only, with `x-app-version`/`x-platform` on every request.

Deeper context (committed): `docs/adr/0009` (API versioning + version floor), `0010` (monorepo purity split), `0013` (plain-JSON wire), `0014` (platform-first design — read before styling anything), `docs/monorepo.md` (where code belongs), and root `CONTEXT.md` (domain terms).
