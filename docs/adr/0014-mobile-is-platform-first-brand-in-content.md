# The mobile app is platform-first: system-native chrome, brand only in content pockets

The Expo app uses native iOS components and conventions wherever they exist — native
navigation stack (large titles, header search bar, swipe-back), SF Symbols, system
materials, context menus, system font for chrome — and reserves bespoke design for
*content*: recipe cards, metrics displays, and other surfaces where the product's identity
lives. This is the opposite instinct to the web app, which is bespoke throughout
(CSS Modules, cascade layers, a full token suite), so it is recorded deliberately: do not
"fix" mobile by porting the web design system over.

Why platform fidelity wins here: system chrome tracks Apple's design language automatically
(custom-drawn chrome ages with every iOS redesign), dark mode and accessibility behaviours
come free, and a one-developer app cannot afford to rebuild what UIKit already does better.
The brand still shows where users actually look — their own recipes — including the
serif-for-user-created-text rule (chrome uses the system sans; recipe/ingredient/menu names
render in Newsreader via `expo-font`).

## Consequences

- `packages/ui` (web DOM primitives + theme CSS) stays web-only, per ADR-0010; mobile does
  not grow a parallel shared component package until a second native surface exists.
- Design tokens are hand-mirrored values in the mobile theme module, not extracted to a
  shared package — mobile is visually kin to the web, deliberately not identical, so a
  shared source of truth would encode false coupling. Revisit if drift starts to hurt.
- Styling stays at the `StyleSheet` + typed-theme-module level; a styling library (e.g.
  unistyles) is adopted only when interactive custom UI grows enough to want variants and
  re-render-free theming — not as a foundation.
