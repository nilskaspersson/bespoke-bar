# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server with Turbo
npm run build        # Production build
npm run lint         # Biome check (linting + formatting)
npm run test         # Run all tests (vitest)
npm run ci           # Full CI: lint, typecheck, test, migrate, build

# Database (Drizzle)
npm run drizzle:push      # Push schema to DB (dev)
npm run drizzle:generate  # Generate migrations
npm run drizzle:migrate   # Run migrations
npm run drizzle:studio    # Open Drizzle Studio
```

Run a single test: `npx vitest run path/to/test.ts`

## Architecture

### Directory Structure
- `src/app/` - Next.js App Router routes
- `src/features/` - Feature modules (recipes, ingredients, lists, organisation)
- `src/ui/` - Reusable UI components (atomic design)
- `src/db/` - Drizzle ORM schema and database config
- `src/hooks/` - React custom hooks
- `src/utils/` - Shared utilities

### Feature Module Pattern
Each feature in `src/features/` follows this structure:
- `actions/` - Server actions and mutation components (e.g., DeleteButton)
- `api/` - Data fetching functions with caching
- `components/` - Feature-specific UI components
- `utils/` - Feature-specific utilities

### Database & Caching
- **Drizzle ORM** with PostgreSQL (Neon serverless on Vercel, node-postgres locally)
- **Multi-tenant**: All queries scoped by `orgId` from Clerk auth
- **Caching**: Uses Next.js `"use cache"` directive with `cacheTag`/`cacheEvents` system
- Cache invalidation via explicit `cacheEvents.*.emit()` calls after mutations
- Prepared statements used for query caching

### Forms & Validation
- **Conform.js** for progressive form enhancement with server actions
- **Zod** schemas, often generated via **drizzle-zod**
- Composite schemas in `src/db/schema/composite.ts` for complex operations

### Authentication
- **Clerk** for auth with organization support
- Use `authOrForbidden()` from `src/utils/auth.ts` in protected routes/actions
- Returns `{ userId, orgId }` or throws 403

### Styling
- CSS Modules with TypeScript plugin
- `clsx` for conditional class names
- Theme variables in `src/app/_theme/`

## Key Patterns

### Server Actions
```typescript
"use server";
// 1. Auth check
const { userId, orgId } = await authOrForbidden();
// 2. Parse/validate with Zod
// 3. Database transaction
// 4. Emit cache events
// 5. Redirect on success
```

### Cached Data Fetching
```typescript
export async function getCachedData(orgId: string, id: string) {
  "use cache";
  cacheTag(...cacheTags.dataWithRelations(orgId, id));
  return await readData(orgId, id);
}
```

### Route Structure
- `/bar/` - Protected bar management (recipes, ingredients, lists)
- `/org/` - Organization settings
- `(public)/` - Public routes (no auth)
- `[[...slug]]` - Optional catch-all for SEO-friendly URLs

## Skills to Consider
- `vercel-react-best-practices` - Invoke when I ask for performance review or when creating new components/pages
- `web-design-guidelines` - Invoke when I ask for UI review or before completing significant UI changes

## Code Style
- Biome for linting/formatting (`npm run lint`)
- **Tabs** for indentation (not spaces)
- Strict React linting rules enabled
- Prefer `function` over `const` for function declarations
