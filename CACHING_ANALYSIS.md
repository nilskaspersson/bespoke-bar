# Next.js Caching Optimization Analysis

## Summary

This codebase already has a **mature caching architecture** at the data-fetching layer. The `"use cache"` directive is enabled (`next.config.ts:49`) and used in 14 files with a sophisticated event-based invalidation system via `cacheTag`/`updateTag`.

**Current coverage:**
- All core data fetching functions (`recipes`, `ingredients`, `lists`) are cached
- Cache invalidation is granular and multi-tenant scoped (prefixed by `orgId`)
- Prepared statements provide additional query-level caching

**Opportunities identified:**
1. **3 public pages** that can be fully cached (static content)
2. **3 data-fetching functions** from Clerk that could benefit from caching
3. **2 static UI components** that could be cached
4. **2 components** that could be restructured to enable caching

---

## 1. Recommended Changes

### High Priority: Cache Public Pages

#### `src/app/(public)/page.tsx` - Landing Page
- **What to cache:** Entire page component
- **Why safe:** Pure static content, no auth checks, no user-specific data
- **Refactoring needed:** None
- **Cache strategy:** Long-lived cache, no revalidation needed (deploy invalidates)

```typescript
// Add at top of component
export default async function LandingPage() {
  "use cache";
  // cacheLife("static"); // optional - for indefinite caching
  return (
    // ... existing JSX
  );
}
```

#### `src/app/(public)/privacy/page.tsx` - Privacy Policy
- **What to cache:** Entire page component
- **Why safe:** Static legal content with only a version date constant
- **Refactoring needed:** None
- **Suggested cacheTag:** `cacheTag("privacy-policy");` for manual invalidation on policy updates

```typescript
export default function PrivacyPage() {
  "use cache";
  cacheTag("privacy-policy");
  // ...
}
```

#### `src/app/(public)/terms/page.tsx` - Terms & Conditions
- **What to cache:** Entire page component
- **Why safe:** Static legal content with only a version date constant
- **Suggested cacheTag:** `cacheTag("terms-conditions");`

```typescript
export default function TermsPage() {
  "use cache";
  cacheTag("terms-conditions");
  // ...
}
```

---

### Medium Priority: Cache Clerk API Functions

These functions make external API calls to Clerk and are called multiple times per request.

#### `src/features/organisation/api/getClerkOrganization.ts`
- **What to cache:** `getClerkOrganization()` function
- **Why safe:** Organization data changes infrequently; safe to cache per request or with short TTL
- **Refactoring needed:** Extract org fetching from auth check, pass orgId as parameter
- **Current issue:** Uses `await auth()` directly, which prevents caching
- **Suggested change:**

```typescript
// Create a cacheable version that takes orgId
export async function getCachedClerkOrganization(orgId: string) {
  "use cache";
  cacheTag(`clerk-org-${orgId}`);
  // Consider cacheLife("minutes", 5) for short TTL

  const client = await clerkClient();
  return await client.organizations.getOrganization({
    organizationId: orgId,
  });
}

// Keep original for cases where auth() is needed
export async function getClerkOrganization() {
  const { orgId } = await auth();
  if (!orgId) return null;
  return getCachedClerkOrganization(orgId);
}
```

**Callsites to update:**
- `src/components/PageHeader/index.tsx:14` - Pass orgId from parent
- `src/app/bar/layout.tsx:47` - Already has orgId from auth()

#### `src/features/organisation/api/getUserById.ts`
- **What to cache:** `getUserById()` function
- **Why safe:** User profile data (name, image) changes infrequently
- **Refactoring needed:** None - already takes userId as parameter
- **Suggested change:**

```typescript
export async function getCachedUserById(id: string): Promise<PublicUserData> {
  "use cache";
  cacheTag(`clerk-user-${id}`);
  // cacheLife("minutes", 10); // Users don't change names often

  const client = await clerkClient();
  const user = await client.users.getUser(id);
  return {
    firstName: user.firstName,
    lastName: user.lastName,
    imageUrl: user.imageUrl,
    hasImage: user.hasImage,
    identifier: user.id,
  };
}
```

**Callsites:**
- `src/app/bar/recipes/[id]/[[...slug]]/page.tsx:82` (generateMetadata)

#### `src/features/organisation/api/readOrganisationMembers.ts`
- **What to cache:** Organization members list
- **Why safe:** Member list changes when users join/leave - relatively infrequent
- **Refactoring needed:** Extract auth and pass orgId as parameter
- **Suggested change:**

```typescript
// Create cacheable version
export async function getCachedOrganisationMembers(orgId: string) {
  "use cache";
  cacheTag(`org-members-${orgId}`);
  // cacheLife("minutes", 5);

  const client = await clerkClient();
  const response = await client.organizations.getOrganizationMembershipList({
    organizationId: orgId,
  });
  // ... transform logic
}

// Update callers to pass orgId
export async function readOrganisationMembers() {
  const { orgId } = await authOrForbidden();
  return getCachedOrganisationMembers(orgId);
}
```

**Callsites:**
- `src/app/bar/recipes/(lists)/page.tsx:38`

---

### Low Priority: Cache Static Components

#### `src/features/recipes/components/CreateRecipeNav/index.tsx`
- **What to cache:** Entire component
- **Why safe:** Pure static navigation menu, no props used, no dynamic data
- **Refactoring needed:** Convert to async function

```typescript
export async function CreateRecipeNav({
  className,
  ...props
}: Omit<ComponentProps<"nav">, "children">) {
  "use cache";
  return (
    // ... existing JSX (entirely static)
  );
}
```

#### `src/features/landing-page/components/LandingPageHero/index.tsx`
- **What to cache:** The static shell of the hero section
- **Why safe:** Accepts children (dynamic content passed through), rest is static
- **Note:** Already works well - children pattern allows caching the shell

---

## 2. Architecture Suggestions

### Pattern: Hoist Auth to Page, Pass Down as Props

**Current pattern (in many pages):**
```typescript
// Data component calls auth
async function IngredientsTableWithData() {
  const { orgId } = await authOrForbidden();  // ❌ Can't cache
  const ingredients = await getCachedIngredients(orgId);
  return <IngredientTable ingredients={ingredients} />;
}
```

**Recommended pattern:**
```typescript
// Page handles auth once
export default async function IngredientsPage() {
  const { orgId, userId } = await authOrForbidden();

  return (
    <Suspense fallback={...}>
      <IngredientsTableWithData orgId={orgId} />
    </Suspense>
  );
}

// Data component is cacheable
async function IngredientsTableWithData({ orgId }: { orgId: string }) {
  "use cache";
  cacheTag(...cacheTags.ingredientsList(orgId));

  const ingredients = await getCachedIngredients(orgId);
  return <IngredientTable ingredients={ingredients} />;
}
```

**Benefits:**
- Component output can be cached per org
- Reduces database queries for repeat visits
- Auth check still happens at page level

**Files to refactor with this pattern:**
- `src/app/bar/recipes/(lists)/page.tsx` - `RecipeViewsWithData`
- `src/app/bar/ingredients/page.tsx` - `IngredientsTableWithData`
- `src/app/bar/lists/page.tsx` - `RecipeListData`
- `src/features/lists/featured/components/FeaturedList/index.tsx`

### Pattern: Split PageHeader into Cached Shell + Dynamic Org Name

**Current:**
```typescript
// PageHeader fetches org on every render
export async function PageHeader({ heading, actions }) {
  const organization = await getClerkOrganization();  // API call every time
  return (
    <header>
      <Text>{organization?.name || FALLBACK_BAR_NAME}</Text>
      <Heading>{heading}</Heading>
      {actions}
    </header>
  );
}
```

**Recommended:**
```typescript
// Option A: Pass org name from parent
export function PageHeader({
  heading,
  orgName,
  actions
}: {
  heading: string;
  orgName: string;
  actions?: ReactNode;
}) {
  return (
    <header>
      <Text>{orgName}</Text>
      <Heading>{heading}</Heading>
      {actions}
    </header>
  );
}

// In pages, pass org name from layout context
<PageHeader
  heading="Ingredients"
  orgName={organisation.name || FALLBACK_BAR_NAME}
  actions={...}
/>
```

---

## 3. Do Not Cache

The following items might look cacheable but should NOT be cached:

### `src/app/bar/layout.tsx`
- **Why not:** Calls `auth()` which is request-specific
- **Alternative:** Already properly structured - auth at layout, cached data fetching

### `src/components/AppHeader/index.tsx`
- **Why not:** Contains `AuthButtonsLoader` which depends on current user session
- The auth buttons are client-side rendered (`ssr: false`)

### `src/components/AppSidebar/index.tsx`
- **Why not:** Contains:
  - `OrganisationSwitcherLoader` - User's org list
  - `UserOrSignupLoader` - Current user avatar/info
- These are inherently user-specific

### `src/app/bar/page.tsx` (Bar dashboard)
- **Why not:** `FeaturedList` component calls `authOrForbidden()` internally
- **Could become cacheable:** If refactored to pass orgId as prop

### `src/components/SecondaryNavigation/index.tsx`
- **Why not:** Although static, it uses `NavLink` which needs current pathname
- `activeClassName` logic requires request context

### Pages with `params` or `searchParams`
- **Why not:** Dynamic route params are request-specific
- Examples: `/bar/recipes/[id]`, `/bar/lists/[id]`

### Any component using these APIs:
- `cookies()` - Request-specific
- `headers()` - Request-specific
- `auth()` or `authOrForbidden()` - Returns current session
- `redirect()` or `forbidden()` inside the cache boundary

---

## 4. Implementation Priority

| Priority | File | Change | Impact |
|----------|------|--------|--------|
| 1 | `src/app/(public)/page.tsx` | Add `"use cache"` | Landing page fully cached |
| 2 | `src/app/(public)/privacy/page.tsx` | Add `"use cache"` | Privacy page fully cached |
| 3 | `src/app/(public)/terms/page.tsx` | Add `"use cache"` | Terms page fully cached |
| 4 | `src/features/organisation/api/getUserById.ts` | Add cached wrapper | Reduce Clerk API calls |
| 5 | `src/features/organisation/api/getClerkOrganization.ts` | Add cached wrapper | Reduce Clerk API calls |
| 6 | `src/components/PageHeader/index.tsx` | Accept org name as prop | Enable parent caching |
| 7 | `src/features/organisation/api/readOrganisationMembers.ts` | Add cached wrapper | Reduce Clerk API calls |

---

## 5. Monitoring Recommendations

After implementing these changes:

1. **Verify cache hits** using Next.js dev tools or Vercel analytics
2. **Monitor Clerk API usage** - should decrease with caching
3. **Test cache invalidation** - ensure mutations still trigger proper revalidation
4. **Watch for stale data** - especially on Clerk-sourced data (org members, user info)

---

## Summary

The existing caching architecture is well-designed. The main opportunities are:

1. **Quick wins:** Cache 3 static public pages (no refactoring needed)
2. **Medium effort:** Add caching to 3 Clerk API functions (reduces external calls)
3. **Larger refactor:** Restructure auth pattern to hoist auth checks to pages, enabling component-level caching

The codebase correctly avoids caching auth-dependent components and properly uses the cache tag system for invalidation.
