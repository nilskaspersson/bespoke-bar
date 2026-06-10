# An Ingredient's Measurement Type is the dimensional source of truth; a Line's Unit must match it

The dimension a substance is measured and priced in (`volume` / `mass` /
`pieces`) is a stable property of the **Ingredient**, not the **Ingredient
Line**. To cost a line, the line's **Unit** must share its ingredient's
**Measurement Type** — converting across dimensions (mass↔volume) needs a
per-ingredient density we don't store. So the unit picker is **hard-constrained**
to the ingredient's dimension (incompatible units aren't selectable) whenever the
ingredient declares one; an ingredient with no Measurement Type is — by the
`cost_requires_measurement_type` check — always uncosted, so its units stay
unconstrained. Cross-dimension use (a per-kg ingredient measured by the
tablespoon) is deliberately **not supported**.

This is latent today: every **Unit** is volume-dimensioned, so the constraint is
a no-op until the `mass`/`pieces` ("solids") feature ships. No existing data can
violate it.

## Considered options

- **Unit owns the dimension; Measurement Type is derived from it** (generalising
  today's inline-create behaviour, where a new ingredient's `measurementType` is
  read from the line's unit). Rejected: an Ingredient is shared across recipes;
  its dimension is a property of the *substance* and must not flip because one
  line happened to pick a different unit.
- **Leave Unit and Measurement Type independent; skip cost on mismatch.** Loosest,
  zero new constraint — but it reinstates a silent-uncostable trap across
  dimensions. The system's posture is to make wrong states unrepresentable, not
  tolerate them quietly (cf. the `mass`/`pieces` cost gap this very decision
  closes).
- **Store per-ingredient density and convert across dimensions.** The general
  solution, but heavy (a sourced, validated density per ingredient) for a need
  that is currently hypothetical. Deferred; this decision is additive-compatible
  with adding density later.

## Consequences

- The ingredient must be chosen before a line's **Unit** is meaningful; the
  picker narrows to the ingredient's dimension.
- An Ingredient's **Measurement Type** is near-immutable once lines depend on it:
  switching `mass`→`volume` would orphan every mass-measured line. Changing it
  must be guarded once solids ship.
- A substance legitimately used two ways (sugar by mass *and* by the teaspoon) is
  modelled as two Ingredients, or waits for the deferred density feature.
- Hard, not soft: an incompatible unit is unselectable rather than selectable-
  but-flagged, consistent with making uncostable lines unrepresentable.
