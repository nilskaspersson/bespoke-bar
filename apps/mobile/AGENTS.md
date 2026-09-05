# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code — your training data is stale for this SDK. When docs and installed source disagree, the source under `node_modules/` wins.

Start with [README.md](./README.md) for setup, commands, and the architecture map. Binding rules: ADR-0014 (platform-first: native chrome, brand only in content pockets — never port the web design system), ADR-0010 import discipline (values from `@bespoke/schema`/`@bespoke/domain` only, `import type { AppRouter }` from `@bespoke/api`, never `@bespoke/ui`/`@bespoke/db`), additive-only wire (ADR-0009), and the first shipped binary is read-only — no mutations.
