# Event architecture review procedure

Use for `review` requests: an existing or proposed event-driven, streaming or messaging architecture, a design document, an AsyncAPI file, an integration with partners, or a technology choice.

## Step 0 — Establish the facts (don't skip)
Extract or assume: business purpose and the state changes that flow; producers and consumers (internal teams, partners, customers, devices); boundaries crossed (team, company, cloud, jurisdiction); volumes and peaks; latency need and data half-life; technology in use (broker, log, router, functions, workflow engine); envelope and schema practice; how events are published from the system of record; delivery guarantee assumed; retention and replay; security model; who operates what.
If something that would change a severity is missing, state the assumption and list it under OPEN QUESTIONS. An agent caller can't answer follow-ups, so never block — assume, flag, continue.

## Step 1 — Classify
For each main stream: messaging vs eventing; discrete vs series; single action vs workflow (`05`); pattern Collector / Distributor / Signal / Facilitator (`06`); use-case category (`04`). A mismatch between classification and technology is often the first finding (e.g., a work queue used for fan-out and replay; a log used for request/reply conversations; a chain of functions standing in for a long-running workflow).

## Step 2 — Check the need
Is event-driven integration justified here (`02`, `04`)? Flag over-engineering (streaming where a daily file or an API call fits) as well as under-engineering (polling or batch where delay costs money or trust).

## Step 3 — Run the areas
Consider each; report only what matters for this system.
| Area | Core questions | Reference |
|---|---|---|
| Fit & classification | Does the shape match the technology and pattern? | 05, 06 |
| Contracts & agility | Standard envelope? Registered schemas, compatibility rule, versioning? AsyncAPI for external streams? Consumers insulated from internal models? | 07, 08 |
| Reliability & delivery | Dual writes? Outbox/CDC? Guarantee assumed vs real? Idempotent consumers? Ordering key? Retries, DLQ with owner, poison messages? | 05 |
| Security | Authentication of all parties, per-topic authorisation, revocation, payload encryption across intermediaries, signed webhooks, secrets handling | 07 |
| Provenance & IP | Can consumers verify source and integrity? Lineage through processors? Usage terms, entitlements? | 07 |
| Privacy & data governance | Personal data in events, purpose, retention in logs, erasure, cross-border flows | 07 |
| Timeliness | Latency budget per hop, geography, retention fits offline consumers | 07 |
| Manageability | Lag/silence/duplicate detection, tracing across boundaries, ability to pause/replay/throttle, runbooks | 07 |
| Systemic behaviour | Feedback loops, circular triggers, cascades, circuit breakers, rate limits | 06, 07 |
| Memory | Replay and audit needs met? Event sourcing where history matters? Snapshots? | 05, 07 |
| Coupling & topology | Central bus bottleneck? Proprietary event shapes at org boundaries? Edge/regional design where needed? Ownership per domain | 03, 05 |
| Evolution & cost | Bespoke plumbing where a commodity exists? Lock-in exit cost? Skills? | 03, 08 |

## Step 4 — Rate each finding
| Severity | Meaning | Typical action |
|---|---|---|
| **Critical** | Data loss, corruption or exposure is likely or already possible; a security or regulatory breach across a boundary; a feedback loop that can take systems down | Stop or contain before go-live / now; escalate |
| **High** | Significant failure, inconsistency or lock-in likely under normal faults or growth; partners or customers affected | Fix before launch or next release; named owner |
| **Medium** | Real but containable operational, evolution or cost risk | Plan in roadmap; monitor |
| **Low** | Good-practice improvement | Optional |
Rate by impact × likelihood × blast radius (how many parties) × reversibility. Weigh cross-organisation and regulated data more heavily. Severity measures consequence, not how unusual the design is.

## Step 5 — Recommend
Each fix is concrete (who changes what), proportionate and tied to a finding. Prefer, in order: change the shape (reclassify, split, move to the right technology class) → make publication and consumption safe (outbox, idempotency, keys, DLQ) → add contracts and controls (envelope, schema rules, auth, encryption, breakers) → add operations (observability, runbooks, replay tests) → document promises. Say "use an API / batch here" when that is the honest answer.

## Step 6 — Verdict
- **Proceed** — no High/Critical findings.
- **Proceed with conditions** — High findings with clear fixes; list the conditions.
- **Redesign** — the core shape creates High/Critical issues that local fixes can't solve (wrong classification, central bottleneck, no viable trust model across the boundary).
- **Do not proceed** — Critical findings that make the integration unsafe or unlawful as designed; or no business need.
Confidence: High / Medium / Low, depending on how much was assumed.

## Common patterns (quick reference)
- **"Save then publish" from a service**: dual write → lost or phantom events. Outbox or CDC; dedupe downstream.
- **Exactly-once claimed end to end**: only true inside a bounded system. Require idempotent consumers keyed on `source`+`id` or business keys.
- **Partners on a shared internal topic**: internal schema leaks, no per-partner access or revocation, no payload encryption. Put a gateway/router per partner, publish a curated external event (CloudEvents + AsyncAPI), per-consumer credentials, signed webhooks or partner-scoped topics.
- **Webhooks without signing, retries or replay**: spoofing and silent loss. HMAC signatures with timestamps, retry with backoff, delivery log, replay endpoint.
- **Event carries a whole customer profile**: privacy exposure in every log and replay. Send IDs and changed fields; fetch details with authorisation; short retention.
- **Functions chained to run a multi-day process**: lost state, no visibility. Use a workflow engine or saga with compensation.
- **ESB / central bus for everything**: bottleneck and single team in every change. Domain-owned platforms with shared standards.
- **Polling partner APIs every few minutes**: lead time and cost. Ask for webhooks/events, or wrap polling in one adapter that emits change events.
- **No ordering key**: consumers see updates out of order. Partition by entity ID; include a version or sequence number.
- **Automated reactions across systems** (pricing, trading, stock reorders): feedback-loop risk. Circuit breakers, rate limits, causation IDs, human override.
- **Device fleets on MQTT straight into core**: scale and security of the broker. Per-device credentials, edge aggregation, bridge to a log for analytics.
- **Long retention "just in case"**: cost and privacy. Retention per stream by purpose; archive to a sink; compaction for latest-state topics.
- **Cloud-specific event shapes at an organisational boundary**: lock-in and mapping cost. Convert to a neutral envelope at the edge.
