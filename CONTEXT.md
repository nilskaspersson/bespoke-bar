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
