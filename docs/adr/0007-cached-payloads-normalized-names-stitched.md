# A cached Recipe carries reference IDs, not display names; names are stitched in after the cache boundary

The cache event model (`cacheEvents` / `cacheTags` in `src/utils/cache.ts`) lets a
cached read "subscribe" to the entity mutations it cares about. A cached **Recipe**
read (`getCachedRecipe`, `getCachedBarRecipes`) therefore has to decide whether to
bake in the display names of the entities a Recipe *references* — its tags, and the
**Ingredient** on each **Ingredient Line** — or store only their ids and resolve the
names elsewhere.

We store **only ids**. Cached Recipe payloads are normalized: the read joins the
bare junction/reference rows (`tags` → `RecipeTagsTable`, i.e. `tagId`; the `specs`
relation → `ingredientId`) and never the `Tag` or `Ingredient` entity. Display names
are **stitched in after the cache boundary** (`stitchRecipe` / `stitchRecipes`), from
the separately-cached `tagsList` / `ingredientsList`, which *do* invalidate on
`tag.update` / `ingredient.update`. The same contract holds for any cached read that
embeds Recipe content (e.g. Menu detail).

The point is cache stability across rename churn. A tag rename is common, and an
**Ingredient's name _is_ its identity** — mutable and frequently edited. If names
were denormalized into the Recipe payload, every rename would have to invalidate
*every* Recipe cache in the org — a popular-ingredient relabel would bust hundreds of
`cacheLife("max")` entries for a purely cosmetic change. With normalize-then-stitch,
a rename invalidates only the one small shared list; the next render re-stitches the
fresh name onto the still-cached Recipe junctions. So `cacheTags.recipe` subscribes to
`tag.delete` — a delete *cascades* the junction row (`recipeTags.ts` `onDelete:
"cascade"`), changing the Recipe's own `tagId` set — but deliberately **not**
`tag.update` or any `ingredient` event, because a rename changes a name the payload
does not contain. `cache.test.ts` locks this in.

## Considered options

- **Denormalize — join the `Tag` / `Ingredient` entity into the cached payload.**
  Simpler reads (no stitch step), but forces the Recipe cache to subscribe to
  `tag.update` *and* `ingredient.update`; one rename busts every Recipe cache in the
  org. Rejected: broad invalidation on cosmetic edits, on the highest-value cache.
- **Scope the rename event per-id so only affected Recipes invalidate.** Needs a
  Recipe↔tag / Recipe↔ingredient membership index to target, and still re-reads the
  Recipe rows on a relabel. The post-cache stitch is cheaper and needs no index.
- **Don't cache Recipe reads.** Sidesteps the question but discards the whole point
  of the cache-event model on the busiest read path.

## Consequences

- **A cached Recipe read must never join the `Tag` or `Ingredient` entity** (e.g.
  `with: { tags: { with: { tag: true } } }`). Doing so silently bakes a name into a
  `cacheLife("max")` payload the Recipe cache never invalidates on rename → stale
  labels until the next `recipe.update`. The invariant is asserted in `cache.test.ts`
  (recipe subscriptions exclude `tag.update` and all `ingredient` events) but **not**
  yet enforced at the query or type level.
- **Recommended guard (not yet applied):** `RecipeTagWithTag = RecipeTag & { tag: Tag }`
  is currently the *default* generic of `RecipeWithRelations` (`recipes.ts`) — a
  fossil of the pre-stitch denormalized model, pointing the wrong way (the
  name-bearing shape is the path of least resistance). Invert it: make the normalized
  junction the default and the stitched `RecipeTagWithTag` opt-in only at a render
  boundary with live tag data, so a denormalized cached read becomes a compile error.
- Client stores that hold a fully-stitched Recipe snapshot (e.g.
  `recipeCardModalStore`) carry embedded names that don't refresh on a rename until
  the surface is re-opened. Accepted as rare, self-healing, and harmless, consistent
  with the race-tolerant posture of ADR-0004 / ADR-0005 — not worth a re-sync bridge.
- Stitching is the deliberate seam (`stitchRecipe` / `stitchRecipes`,
  `stitchRecipeTags`, `stitchSpecs`): it runs at render time, outside every
  `"use cache"` boundary. Moving a stitch *inside* a cached read reintroduces the
  staleness this decision avoids.
