# Tenancy is one-or-many Organisations per User; every User has a personal Organisation; member invites are deferred

The app is multi-tenant via `orgId`, and every request acts within an **Active
Organisation** (CONTEXT.md). To allow an eventual "personal org + work org" world *without
a data-model change*, a personal workspace is modelled as an ordinary single-member
**Organisation**, not as a user-scoped mode — so every row stays `orgId`-scoped and the
existing local-org bootstrap (ADR-0008) provisions it unchanged.

For v1 we assume **every signup is for personal use**: one **Organisation** per **User**,
present from onboarding, always Active. The model permits one-or-many Organisations per
User with one Active; only the single-org slice ships now.

The mobile contract is built against the invariant **authenticated ⇒ has an Active
Organisation**, and every call carries an *explicit* `org_id` — never an implicit "the
user's only org." That makes multi-org purely additive (ADR-0009): a binary shipped today
keeps working the day a second Organisation appears, because it already names the org it
means.

## Considered options

- **Model "personal" as the auth provider's personal-account mode (no org).** Rejected: it
  produces user-scoped data with no `orgId`, detonating the scoping invariant every query
  relies on. Everything is an **Organisation**, including a workspace of one.
- **Keep manual org creation as a permanent gate, with no personal-org guarantee.**
  Rejected: it leaves a "signed in, no Active Organisation" state that the *mobile* contract
  would have to model from its first build — the exact surface we don't want to freeze early.

## Consequences

- **Member invites are deferred**, and one edge is left **deliberately unresolved**: when a
  User's first touch is a work-org invitation, whether (and how) they also get a personal
  **Organisation**. Revisit when invites are built; it does not block v1 because the
  contract is additive.
- Personal-org creation should have a **single home** (the `setup` flow *or* a
  `user.created` webhook, not both), so the future invite path has one clear place to decide
  and cannot double-provision.
- **Multi-membership multiplies billing and Quota.** Quota, Grants, and Pro are all
  per-**Organisation**, so a User in a personal *and* a work org has two independent quotas, and
  a work-org Pro subscription does not cover their personal org. A real pricing decision hides
  here — name it before invites ship.
- The org-switcher UI is deferred; the plumbing (explicit `org_id`, server resolves the
  Active Organisation) is not.
