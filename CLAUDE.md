# CLAUDE.md

## Commands

- `npm run lint` / `npm run lint -- --fix` — Biome (lint + format)
- `npm run test -- path/to/test.ts` — single test

## Key Rules

- **Multi-tenant**: All DB queries must be scoped by `orgId` from `authOrForbidden()` (`src/utils/auth.ts`)
- Prefer `function` over `const` for function declarations
- Tabs for indentation

## Skills

- `vercel-react-best-practices` — invoke for performance review or new components/pages
- `web-design-guidelines` — invoke for UI review or before completing significant UI changes
