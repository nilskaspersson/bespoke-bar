# Handoff carries extracted text over a Redis-backed nonce, polled from the desktop

A desktop has no usable camera, so **Photo-to-Recipe** gains a **Handoff**: the
**Bar** shows a QR code, the phone that scans it takes the photo, and the result
lands back in the desktop session. Four coupled decisions:

1. **Only extracted text crosses back.** The phone submits the image to the same
   Vision → LLM pipeline the desktop uses, under the Handoff's delegated
   credential, and only the resulting text is parked for the desktop. The image
   is never stored anywhere, so the consent copy and privacy policy ("we do not
   store these images") hold unchanged. The desktop gets no image preview.
2. **The Handoff Link is an opaque nonce.** 128 random bits, base64url, and
   nothing else in the URL. Minting writes the record the phone will act under
   (`orgId`, `userId`, `expiresAt`) and the nonce is the whole credential;
   there is no signature and no signing secret. The mint refuses without
   **Use** consent or at **Quota** cap, and sits behind the shared rate limit,
   which bounds unwanted mints.
3. **Upstash Redis is the only state**, one hash per nonce with a TTL of expiry
   plus grace: the mint record and a `result` field written with `HSETNX` so
   the first successful extraction closes the Handoff and failures can retry
   without rescanning. The desktop writes the same field as a tombstone when
   it leaves the page or starts a new code, so a stray later submission is
   refused *before* a Use is spent. Every write re-applies the TTL, so a write
   racing the key's expiry cannot leave an immortal hash.
4. **The desktop polls** a `protectedProcedure` (session must match the
   record's org) at a flat 3 s while the dialog is open, halting on a terminal
   phase from the server (`done`, `closed`, `expired`, the last one reported
   once grace has passed) or a terminal error. Around 140 polls worst case,
   none once done. The server also reports `lapsed` between expiry and the end
   of grace, so the dialog's inactive state is derived from the poll rather
   than from a client clock. Polls go through the app, not straight to Upstash.

## Considered options

- **A stateless HMAC-signed Link** (the first draft of this ADR) carried
  `orgId`, `userId`, expiry and a nonce in the URL, so minting wrote nothing.
  It cost a signing secret, a token parser with its own failure modes (charset,
  byte-length, a separator that could read as a file extension to the proxy's
  static-asset matcher) and a URL three times longer, to save one Redis write
  per mint on a store the feature already requires. Dropped 2026-09-15.
- **A timeline-based poll schedule** derived from server timestamps, so a
  reload or hidden tab resumed on the same curve. Resume-after-reload was never
  a requirement; without it the schedule reduces to one expression over the
  query's fetch count, and the halts above make the cost bound explicit.
- **Peer-to-peer image transfer (WebRTC, PairDrop-style).** Restores the preview
  and keeps the image off every server, but needs a signaling exchange and a
  TURN relay for the common case (phone on cellular, desktop on venue wifi),
  plus a peer library on the desktop bundle. Can be layered on later: the Link
  is the signaling channel it would need.
- **An `openedAt` handshake** (the phone pinged a route on load) drove a
  "phone connected" line and a faster poll once scanned. Dropped 2026-09-16:
  a route, a store field, a phase and a poll branch for a status line the
  desktop doesn't need, since the text landing is the signal that matters.
- **Raw image via temporary storage (Vercel Blob / Redis).** Runs the existing
  desktop flow untouched, preview included, but contradicts the privacy promise
  and adds a storage dependency and cleanup.
- **A stored Link record in Postgres.** A row per Link with a lifecycle
  (pending → opened → done), revocable and auditable, but the most database
  traffic of any option: the poll is the hottest uncacheable read in the
  feature, and Postgres is deliberately kept under minimal load.
- **Postgres for the result only.** Works without Upstash (local/offline dev),
  but costs a migration and an `after()` prune path for a value that lives
  minutes, and still polls the database.
- **Push (SSE, or Vercel's WebSocket beta).** Fluid Compute bills Provisioned
  Memory for the instance's whole lifetime, waiting included, so a held
  connection costs ~30× the polling budget per Handoff and scales with
  wall-clock rather than activity. It also still has to poll Redis (or hold a
  pub/sub connection) to learn about the phone, whose submission lands in a
  different invocation.
- **Polling Upstash directly from the browser.** Removes ~95 Vercel invocations
  per worst-case Handoff (about $0.0001 on Pro) but requires a public
  credential: the database read-only token can read every key; an ACL-scoped
  token (`~handoff:* +hgetall`) needs a paid database. Deferred; the read is a
  single `HGETALL`, so the switch is mechanical if volume ever warrants it.

## Consequences

- No desktop preview; the preview slot shows a "taken on your phone"
  placeholder.
- Handoff is unavailable wherever Upstash is not configured. This is the first
  feature where Redis holds load-bearing state rather than rate-limit counters.
- Anyone holding a live Link can spend the org's Uses until expiry (5 minutes)
  or until the desktop tombstones it. The page owns the Link and the dialog
  owns the polling: closing the dialog keeps the Link, and reopening extends a
  still-live one by a full TTL (`handoff.extend`) instead of minting again;
  leaving the page tombstones it, and a reload forgets it (at most one Use
  lands unreceived). No automatic re-mint while a code is live; an expired
  code offers a new one in place, and the dialog switches to that inactive
  state on its own clock rather than announcing how long the code lasts.
- A Use spent by a submission that completes after the desktop closed the
  dialog is discarded, consistent with the definition of a Use.
- The phone page is a **Bar** surface under a delegated credential (see
  CONTEXT: Bar, Handoff Link), not a **Lounge** page. It nests under the
  existing root layout, so it shows the header's sign-in buttons; accepted.
  The page sends no referrer, since its URL is the credential.
- The desktop half loads on first click (`next/dynamic`), so the photo page
  carries none of the Handoff code by default.
- The poll interval bounds how late a result or expiry is noticed (≤ 3 s).
- The whole worst-case poll budget costs about a third of the Vision call it
  accompanies, on Pro on-demand rates (Frankfurt), before included credit.
- Vercel preview deployments have Deployment Protection on by default, so a
  phone cannot open a preview's Link unless protection is bypassed for
  `/handoff/*`. Production is unaffected.
