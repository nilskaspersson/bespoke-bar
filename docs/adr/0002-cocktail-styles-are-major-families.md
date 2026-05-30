# `cocktail_styles` holds only major families; finer distinctions are tags

The **Cocktail Style** enum (`cocktail_styles`) is deliberately coarse — one
broad family per Recipe (`sour`, `martini`, `manhattan`, `negroni`, `fizz`,
`highball`, `flip`, `smash`, `julep`, `spritz`, `tiki`, `oldFashioned`,
`aperitif`, `digestif`, `punch`, `cooler`, `other`). A recognisable drink that
is really a flavour of an existing family does **not** get its own value: a
Paper Plane is a `sour`, an Aviation is a `sour`. That nuance lives in tags. The
bar for a new Style is "a major family people filter by", not "a named drink".

We did split `manhattan` and `negroni` out of `martini`, because each is a
high-volume, instantly recognisable family in its own right — they clear the
bar. **Style** gets heavy special treatment (static filters, a per-Style colour,
distribution charts), so every value carries real UI and data cost; a small,
closed set keeps the buckets meaningful, while the unbounded long tail of
"herbal sour", "sparkling", or specific drink names is better served by tags.

## Considered options

- **A value per recognisable drink.** Maximises precision but explodes the
  enum, dilutes filters, and demands a colour/graphic per value — most of which
  would hold one or two recipes.
- **A single "spirit-forward stirred" bucket** instead of
  martini/manhattan/negroni. Simpler, but collapses three families guests
  genuinely distinguish and lose useful filtering. We split them *because* they
  each clear the major-family bar.
- **No Style at all; only tags.** Tags can't drive the at-a-glance grouping,
  colour, and distribution UX **Style** does, and you lose the curated, closed
  vocabulary.

## Consequences

- A recognisable drink classifies as its broad family (Aviation → `sour`); "it
  is specifically an Aviation" is a tag, not a Style. **Enrichment** is held to
  the same rule and never mints nuance.
- Adding a Style is a deliberate, multi-part change — an enum value (migration),
  a colour token, a label, and a classifier rule — so it stays reserved for
  genuine families.
- The `manhattan`/`negroni` split was an additive enum migration; the
  classifier separates them on base spirit (whiskey/brandy → `manhattan`) and a
  Campari-type aperitivo (→ `negroni`).
- **Unclassified** (no Style) stays distinct from **Other**: automation leaves
  unknowns **Unclassified** and never assigns **Other**.
