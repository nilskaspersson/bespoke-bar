# The tRPC wire stays plain JSON — no transformer, ever — and dates cross as ISO strings

A tRPC transformer (superjson et al.) is a property of the wire format itself: every client
must speak it, simultaneously. Per ADR-0009, the first shipped iOS binary freezes the wire —
a transformer can never be added (or removed) once a plain-JSON binary is on a phone, short
of standing up a parallel endpoint. We decide this deliberately, before the first build:
**the router has no transformer, permanently.** Values that don't survive JSON (`Date`,
`Map`, `undefined`) don't belong in procedure outputs; timestamps cross as ISO-8601 strings.

## Considered options

- **superjson (the common tRPC convention).** Rejected: it wraps every payload in a
  `{json, meta}` envelope, which makes the offline-persisted payloads (planned for the Expo
  app; ADR-0009's append-only persistence rule) more fragile and less inspectable than flat
  JSON; it adds a dependency to every client for a problem only dates actually pose here;
  and the repo already leans plain (no transformer anywhere, `billing.subscription`
  hand-serializes its date).
- **Defer — add a transformer when a non-JSON type genuinely needs it.** Rejected: that is
  precisely the option the first binary forecloses. Deciding "no" now is what makes the
  constraint enforceable rather than accidental.

## Consequences

- Timestamp columns are `timestamp(..., { mode: "string" })`, so raw rows already cross as
  the driver's naive `YYYY-MM-DD HH:MM:SS` strings — not ISO-8601; a phone would parse them
  as device-local time. Mobile-reachable procedures therefore get an explicit serialization
  pass normalizing timestamps to ISO-8601 UTC (the `billing.subscription` re-stamp pattern) —
  a deliberate, one-time **byte change**, made while it is free: no binary has shipped, and
  the web's tRPC call sites were verified not to read the affected fields.
- Clients parse dates at their own edge (Zod coercion) where they need real `Date`s.
- New procedure outputs must be JSON-representable by construction; a `Map`/`Set`/`undefined`
  in an output is a review-time error on any mobile-reachable procedure.
