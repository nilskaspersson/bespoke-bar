# Recipe Enrichment classifies Style heuristic-first, calling the LLM only on low confidence

**Recipe Enrichment** resolves a Recipe's **Cocktail Style** with a zero-cost,
deterministic heuristic (`matchShapeWithStyle`) that reads the recipe's *shape* —
ingredient roles, ratios, and build. When the heuristic is confident (at or
above a fixed threshold) its answer stands and **no LLM is called**. Only when it
falls below the threshold or abstains does **Recipe Enrichment** fall back to a
single cheap, batched LLM call, fed the recipe name plus the shape as a prior.

Serve (glassware, preparation method, ice) follows confidence too. On the
trusted path it derives deterministically from the Style via `STYLE_TO_SERVE` —
free and consistent (a `sour` is always coupe/shaken/none). On the LLM path the
model returns the whole `{style, serve}` package and we **trust its serve**,
since deriving serve from a Style we were unsure of would just second-guess the
model with a family default; the map is only a per-field fallback for serve the
LLM leaves null (and for occasion families the map has no entry for).

Most recipes are confidently classifiable from structure alone, so the common
path is instant and free; the LLM is reserved for the genuinely ambiguous tail
(occasion families, unusual builds) where a name actually helps. This keeps
spend and latency low without sacrificing coverage, and keeps **Style** — the
most-watched field — off any path where a cheap model could overwrite a
confident, correct structural answer.

## Considered options

- **Always call the LLM** (optionally with the heuristic as a tie-breaker).
  Uniform and simplest, but spends tokens on every create — including bulk
  imports — and lets the model degrade a confident-correct heuristic result.
  Rejected: cost and risk on the highest-volume path, for no gain on the easy
  cases.
- **Heuristic only, never call the LLM.** Cheapest, but can't classify occasion
  families (`tiki`, `punch`, `aperitif`) or name-dependent drinks the structure
  can't see; too many recipes stay **Unclassified**.
- **Await Ingredient Enrichment, then classify from enriched categories.**
  Better signal in theory, but couples Recipe Enrichment to a separate async job
  and delays the most-visible field. The heuristic reads ingredient *names*
  (always present at create), so the marginal gain didn't justify the coupling.

## Consequences

- On the trusted path, serve is a function of **Style**; a wrong-but-confident
  Style propagates to its serve. On the LLM path, serve is the model's own call.
  Either way it's a best-effort, user-overridable suggestion.
- **Recipe Enrichment** runs independently of **Ingredient Enrichment** —
  fire-and-forget, not awaiting it. The two race; the heuristic tolerates
  not-yet-categorised ingredients by reading names.
- Under the **Enrichment Ceiling** (`0004`), the LLM step degrades to
  heuristic-only: confident recipes still get a free Style; ambiguous ones stay
  **Unclassified** until budget returns.
- The confidence threshold and the style→serve map are tuning surfaces —
  adjusting them shifts the heuristic/LLM split and the derived serves without
  changing the policy.
