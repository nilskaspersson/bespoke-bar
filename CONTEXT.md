# Bespoke Bar

Cocktail-recipe management for bars. A small team (an **Organisation**) curates a private library of cocktail recipes, ingredients, and menus. Multi-tenant via `orgId`.

## Language

### Photo-to-Recipe

**Photo-to-Recipe**:
The feature that extracts a draft recipe from an uploaded photo, via a two-stage Vision OCR → LLM pipeline. Abbreviated `OCR` in code/identifiers; not in user-facing copy.

**Use**:
A single Photo-to-Recipe call that resulted in a 2xx response from Google Vision. Counts against the org's **Quota** regardless of whether text was extracted, the LLM produced anything, or the user saved a recipe. Network/SDK errors do **not** count.
_Avoid_: "Attempt" (ambiguous about success), "Parse" (overloaded).

**Quota**:
The maximum number of **Uses** an **Organisation** can consume in any rolling 22-hour window. Default `3`. Raised permanently by **Grants** and temporarily by an active Pro subscription. Rolling, not calendar-day — the next **Use** unlocks when the oldest counting **Use** rolls off. The window is intentionally shorter than a day so a daily user's unlock time doesn't drift later and later.
_Avoid_: "Limit" (overloaded with the slot-limit feature), "Allowance", "Daily limit" (overspecifies the policy).

**Grant**:
A signed-amount entry that permanently raises an **Organisation's** **Quota** ceiling. Sources: manual comp, referral bonus, activity bonus, refund. Pro-tier bonuses are not Grants — they're computed live from subscription state.

**Reservoir** (deferred):
A separate finite pool of **Uses** an **Organisation** could buy as a pack, drained independently of the **Quota**. Not implemented; the schema is designed so it can be added additively later without backfilling.

### Enrichment

**Enrichment**:
When a Recipe or Ingredient is created, a best-effort, fire-and-forget attempt to auto-populate its _empty_ metadata fields — a Recipe's **Cocktail Style**, glassware, ice, and preparation method; an Ingredient's category, abv, brand, and description. Non-blocking: it never delays or fails creation, and a failure leaves the field empty for the user to fill. It does not interrupt the user, but the fields it fills are not invisible — each is marked **Auto-filled** until the user changes it. Qualify as **Recipe Enrichment** / **Ingredient Enrichment** when a statement applies to only one.

**Auto-filled** (field state):
A metadata field whose current value was populated by **Enrichment** and has not since been changed by the user. Tracked per-field and surfaced in the UI with a sparkle indicator (accessible name "Auto-filled"). A field stops being Auto-filled the instant the user changes its value; re-saving an unchanged value keeps the state. A value the user typed that merely coincides with what Enrichment would have chosen is not Auto-filled.
_Avoid_: "AI-suggested", "AI-generated", "Enriched" (as the field-state label) — in user-facing copy say **Auto-filled**.

### Recipes

**Cocktail Style**:
The single broad family a Recipe belongs to (sour, martini, manhattan, negroni, fizz, highball, …), from a closed, curated set. Deliberately coarse — it captures the _major_ family, for filtering and at-a-glance grouping, not sub-genres. Finer character ("herbal", "sparkling", or a specific named drink like "Aviation") is expressed with tags, never new Style values. A Recipe has at most one. Shortened to **Style** in running text.
_Avoid_ minting a new Style for a recognisable drink (an Aviation is a `sour`); that nuance is a tag.

**Unclassified** vs **Other**:
**Unclassified** (no Style set) means "unknown / not yet determined" and stays a candidate for **Enrichment**. **Other** is an explicit Style value meaning "deliberately none of these." Enrichment may leave a Recipe **Unclassified** but never assigns **Other**.
