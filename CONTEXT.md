# Bespoke Bar

Cocktail-recipe management for bars. A small team (an **Organisation**) curates a private library of cocktail recipes, ingredients, and menus — both an archive of finished drinks and a workbench for drafting and developing new ones. Multi-tenant via `orgId`.

## Language

### Organisation

**Organisation**:
The tenant boundary — the unit `orgId` scopes every row to, and the owner of a private library of **Recipes**, **Ingredients**, and **Menus**. Every query is scoped to exactly one Organisation (resolved by `authOrForbidden()`); nothing is global or cross-org. Usually a shared team, but the term names the _ownership boundary_, not a headcount: a single-member Organisation (one person's private workspace) is valid and intended. A **User** belongs to one or more Organisations and acts within one **Active Organisation** at a time.
_Avoid_: defining Organisation as "a team" — that's the common case, not the meaning; it is the tenancy/ownership boundary, one member or many. "Account", "Workspace", "Tenant" as the canonical word — the term is **Organisation**.

**Active Organisation**:
The single **Organisation** a request acts within, resolved server-side from the auth session as `orgId`; every read and write is implicitly scoped to it. A **User** with several Organisations has exactly one Active at a time. "Authenticated" and "has an Active Organisation" are distinct states — a User may be signed in with none selected.

**Bar**:
The private, back-of-house workspace — the authenticated application surface over an **Organisation's** library, where the team develops and manages **Recipes**, **Ingredients**, and **Menus**. Scoped to the **Active Organisation** (what `barRecipes` / `barMenus` read).
_Avoid_: treating **Bar** as a synonym for **Organisation** — the Organisation is the tenant/ownership boundary; the Bar is the working surface over it. Both may be a workspace of one.

**Lounge**:
The public, front-of-house surface over an **Organisation's** library: guest-facing **Menus**, anonymous and unauthenticated. The Lounge is _why_ a **Recipe's** **Description** is menu-facing while its **Instructions** stay internal to the **Bar** — one library, two audiences.
_Avoid_: surfacing Bar-only (internal) data in the Lounge; the guest surface shows only what is menu-facing.

### Photo-to-Recipe

**Photo-to-Recipe**:
The feature that extracts a draft recipe from an uploaded photo, via a two-stage Vision OCR → LLM pipeline. Abbreviated `OCR` in code/identifiers; not in user-facing copy.

**Use**:
A single Photo-to-Recipe call that resulted in a 2xx response from Google Vision. Counts against the org's **Quota** regardless of whether text was extracted, the LLM produced anything, or the user saved a recipe. Network/SDK errors do **not** count.
_Avoid_: "Attempt" (ambiguous about success), "Parse" (overloaded).

**Quota**:
The maximum number of **Uses** an **Organisation** can consume per calendar month. Default `3`. Raised permanently by **Grants** and temporarily by an active Pro subscription (to `50`). Calendar-month, not rolling — the tally resets on the 1st (UTC), so the policy reads exactly as it sells ("3 a month") and a cap shows one fixed reset date, not a drifting unlock countdown. Monthly (not daily) accounting is deliberate: the same number as a daily quota would cost ~30× more in worst-case free usage.
_Avoid_: "Limit" (overloaded with the slot-limit feature), "Allowance", "Daily limit" (wrong cadence — the quota is monthly).

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

**Recipe**:
A cocktail's full record — its **Ingredient Lines** plus metadata (**Cocktail Style**, glassware, ice, preparation method, dilution target, garnish, description, instructions, tags). Identified by an opaque id, never by name. Because the app is both an archive of finished drinks and a workbench for developing them, a Recipe may be **incomplete** — it's normal for a drink to have lines before it has a name.
_Avoid_: equating a Recipe with its formula alone — that's the Recipe's **Spec**; the Recipe is the whole record (Spec + name, Style, serve, prose).

**Name** (of a Recipe):
A Recipe's display label — optional, non-unique, and never an identifier. A nameless Recipe is a valid, complete state, shown as "Unnamed Recipe". (Contrast **Ingredient**, whose name _is_ its identity: required, unique per org, case-normalized. The two core entities have opposite naming contracts.)
_Avoid_: treating the name as a key, or assuming names are unique — duplicates are allowed by design.

**Spec**:
A **Recipe's** formula — the collective set of its **Ingredient Lines**, taken as a whole ("the spec for a Negroni is gin, Campari, sweet vermouth in equal parts"). A Recipe has exactly one Spec and is _more_ than it: the Recipe adds name, **Cocktail Style**, serve, and prose on top of the Spec. The bartender's word for the build, and the name for the collective concept a **Recipe** is not.
_Avoid_: **Spec** for a _single_ line — that's an **Ingredient Line**; a Spec is the whole set. "Formula"/"Build" as the canonical term (fine as prose glosses; **Spec** is the word).

**Ingredient Line**:
One **Ingredient's** appearance in a **Recipe** — a reference to an Ingredient, optionally measured (a quantity + unit) and optionally marked optional. A Recipe's **Spec** has many; collectively they are the Recipe's **lines**. The measure may be absent: an unmeasured line ("soda, to top"; "mint, to muddle") is valid and intentional. Shortened to **line** in running text and UI.
_Avoid_: **Spec** _for a single line_ — a **Spec** is the whole formula (the set of lines), not one line. **Pour**, **Measure** (both imply a measured liquid, excluding unmeasured and non-liquid lines).

**Unmeasured** (line state):
An **Ingredient Line** with no explicit quantity. The amount is _implied by context_, not missing — usually a top-up ("soda, to top"), sometimes a gesture ("absinthe rinse") or to-taste. The blank amount is itself the instruction, so the line is complete and deliberate. Unlike an unset **Cocktail Style** — which is genuinely **Unclassified** and a candidate for **Enrichment** — an unmeasured line is never treated as data still to be filled in.
_Avoid_: "incomplete", "missing amount" (both imply a gap to be filled; there is none).

**Optional** (line state):
An **Ingredient Line** the recipe works well without — the bartender may omit it entirely. Shown with an "(optional)" suffix ("optionally spritz with absinthe"). Independent of measure: an Optional line may be measured or **Unmeasured**.
_Avoid_: conflating with **Unmeasured** — Optional = may be omitted; Unmeasured = present, amount implied.

**Cocktail Style**:
The single broad family a Recipe belongs to (sour, martini, manhattan, negroni, fizz, highball, …), from a closed, curated set. Deliberately coarse — it captures the _major_ family, for filtering and at-a-glance grouping, not sub-genres. Finer character ("herbal", "sparkling", or a specific named drink like "Aviation") is expressed with tags, never new Style values. A Recipe has at most one. Shortened to **Style** in running text.
_Avoid_ minting a new Style for a recognisable drink (an Aviation is a `sour`); that nuance is a tag.

**Unclassified** vs **Other**:
**Unclassified** (no Style set) means "unknown / not yet determined" and stays a candidate for **Enrichment**. **Other** is an explicit Style value meaning "deliberately none of these." Enrichment may leave a Recipe **Unclassified** but never assigns **Other**.

**Description**:
A Recipe's prose blurb — what the drink _is_ (character, flavour, story). **Menu-facing**: it may surface on a guest-facing **Menu**. Distinct from **Instructions**.

**Instructions**:
How to _make_ the drink — method, technique, timing — as free prose. **Internal / operational**, never shown to guests. The free-text counterpart to the structured serve fields (glassware, ice, preparation method).

**Garnish** (field):
A Recipe's finishing note — free text ("orange twist"), shown on the card. Deliberately **cosmetic and uncosted**: it is _not_ an **Ingredient Line**, so it has no measure, cost, or inventory. A garnish that must be costed is modelled as a normal line instead. A future line **role** (see `plans/ingredient-line-role.md`) would give garnishes a first-class home; not built yet.

### Ingredients

**Ingredient**:
A reusable, org-scoped library entry for a substance a drink is built from (a spirit, juice, syrup, garnish…). Its **name is its identity**: required, unique per **Organisation**, normalized (`lower(trim)`) — there is exactly one "Gin" per org. **Recipes reference Ingredients** — an **Ingredient Line** points at one and never copies it — so cost and ABV are derived _live_ from the current Ingredient: edit "Gin" and every Recipe using it re-computes (no snapshot). Typing a known name into a recipe line _reuses_ the existing Ingredient (**find-or-reference**); the standalone create form rejects a duplicate. An Ingredient that's in use can't be deleted — every referencing line must be removed first (no cascade, no force-delete).
_Avoid_: treating an Ingredient as recipe-local (it's shared); using **Brand** as identity (identity is the name, not the brand).

**Ingredient Category**:
The _kind_ of substance an **Ingredient** is, from a curated set (gin, rum, citrus, syrup, vermouth, bitters…) — closed to end-users today, maintainer-curated (values change by migration, as with **Cocktail Style**); user-defined categories remain a possible, non-near-term future. Shortened to **category** where the ingredient context is clear (the `ingredient.category` field). Matched from the name heuristically and used to seed a default ABV. **Cocktail Style's structural twin**: `null` = **Unclassified** (unknown — an **Enrichment** target), the explicit value **other** = "deliberately none of these." Encodes _kind only_, never _function_: a garnish is categorized by what it _is_ (its kind, or **other**), with its garnish-ness expressed on the **Ingredient Line** / Recipe — not the Category. (Legacy `garnish` value being removed: `plans/remove-garnish-category.md`.)
_Avoid_: bare "Category" as the standalone term — too generic; qualify as Ingredient Category. "Ingredient Type" — collides with **Measurement Type**. A category for a **Brand** (separate field) or for a role/function ("garnish" is a line/recipe concern, not a kind).

### Units & Measurement

**Unit**:
The amount marker on an **Ingredient Line** — `ml`, `cl`, `fl_oz`, `tsp`, and the gestural bartending units (`dash`, `rinse`, `float`, `drop`, `spray`, `barspoon`). Every Unit is volume-dimensioned today. A Line may carry none (see **Unmeasured**).

**Unit System**:
A family of **Units**: `metric`, `imperial`, or `bartending`. The **bartending** system holds the gestural units — deliberately approximate volumes (a drop ≈ 0.05 ml, a dash ≈ a dozen drops) for when a bartender measures by gesture, not by number. Used for conversion and display.

**Measurement Type**:
The dimension an **Ingredient** is measured and priced in — `volume`, `mass` (solids), or `pieces` (countable items: cherries, umbrellas). A property of the **Ingredient**, not the Line; an **Ingredient Line's** **Unit** must share its ingredient's Measurement Type (no cross-dimension measuring — you can't measure a per-kg ingredient by the tablespoon). Today only **volume** participates in cost and volume/ABV math; **mass** and **pieces** are selectable and roadmapped ("solids soon") but not yet wired — a knowingly-accepted gap.
_Avoid_: bare "measurement"/"measure" — overloaded (the conversion library's _measure_ is volume/length; this enum is volume/mass/pieces). Don't conflate with **Unit** — Unit is the Line's amount marker, Measurement Type is the Ingredient's dimension.
