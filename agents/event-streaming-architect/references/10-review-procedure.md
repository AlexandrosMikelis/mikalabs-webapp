# Streaming and data mesh review procedure

Use for `review` requests: an existing or proposed event-driven microservice design, a topic/stream inventory, a set of schemas, a stream-processing topology, a CDC or outbox pipeline, a data product, or a self-serve platform plan inside one organisation. Cross-organisation flows and business-case questions → Okeanos.

## Step 0 — Establish the facts (don't skip)
Extract or assume: domains and owning teams; services and what they produce and consume; streams with keys, partition counts, retention/compaction; event types and schemas, format and compatibility mode; how each stream is produced (native, outbox, CDC, query, dual write); stateful operations and where state lives; joins; time semantics; delivery guarantee assumed; workflows spanning services; consumers' lag tolerance; data products and their contracts; governance standards; platform capabilities (registry, catalogue, ACLs, lag monitoring, reset tooling); testing and deployment practice; volumes and peaks; personal or regulated data.
If something that would change a severity is missing, state the assumption and list it under OPEN QUESTIONS. An agent caller can't answer follow-ups, so never block: assume, flag, continue.

## Step 1 — Map streams and owners
Build a quick inventory: stream → owner (one writer?) → payload profile (full-picture, before-and-after, change-only, annotated, reading, ping, command; `02`) → key → consumers. Run the rebuild test from `02` on each shared stream. Early findings often appear here: shared writable streams, commands mixed with facts, raw CDC tables used as published contracts, unowned streams, products without consumers.

## Step 2 — Check the need
Is streaming justified for each piece (`01` §9)? Flag over-engineering (a broker for one producer and one consumer that a direct call would serve, streaming SQL for a monthly report) as well as under-engineering (services replicating each other's databases, nightly extracts where decisions need minutes, synchronous call chains six services deep).

## Step 3 — Run the areas
Consider each; report only what matters for this system.
| Area | Core questions | Reference |
|---|---|---|
| Ownership & boundaries | One writer per stream? Streams aligned to domains? Internal vs public streams separated? | 01, 09 |
| Event design | Right payload profile for the purpose? Full-picture events on shared streams? One schema per stream? Narrow types, stable IDs, event time, versions? No events as signals/locks? | 02 |
| Schemas & contracts | Registered schemas, enforced compatibility (transitive where replayed)? Auto-registration off? Breaking-change path? Contracts with semantics, SLOs, owners? | 03 |
| Keys & partitioning | Key matches the ordering invariant? Stable? Hot keys? Joined streams co-partitioned? Partition count plan? | 04 |
| Time & reprocessing | Event-time logic? Late/out-of-order handling? Watermarks, idle partitions? Can services replay safely, side effects suppressed? Retention supports replay? | 05 |
| State & delivery | State stores sized, recoverable (changelog/checkpoints, standbys)? Guarantee claimed vs real? Idempotent consumers? DLQ with owner? Offsets committed after work? | 06 |
| Sourcing & sinks | Dual writes? Outbox/CDC? Deletes captured? Public projection layer? Source DDL gated? Idempotent sinks? Sink-then-source coupling? | 07 |
| Workflows & consistency | Choreography vs orchestration deliberate? Sagas with idempotent compensations and timeouts? Process instances monitored? Lag SLOs, staleness exposed? | 08 |
| Testing & deployment | Unit, topology, schema, integration, replay tests? Deployment pattern fits change type? Blue-green/rebuild for stateful services? Reset tooling? | 08 |
| Operations & tooling | Lag and silence alerts, ACLs, quotas, ownership registry, topology view, tracing, runbooks | 08 |
| Data products & governance | Domain ownership, product tiers (origin / composite / purpose-built), product card, catalogue, standards for keys/time/card fields/overloaded terms, lifecycle | 09 |
| Security & privacy | Deny by default, per-service identities, encryption, field-level protection, erasure strategy (crypto-shredding), retention by purpose, lineage | 09 |
| Platform capability | Do the six capability scores meet the target for the number of products and domains? Commodity pieces bought, not built? | 09 |

## Step 4 — Rate each finding
| Severity | Meaning | Typical action |
|---|---|---|
| **Critical** | Data loss, silent corruption, duplicate money/stock effects, or exposure of personal or confidential data is likely or already possible; a design that cannot meet a legal obligation (e.g. erasure) | Stop or contain before go-live / now; escalate |
| **High** | Significant inconsistency, outage, or inability to evolve is likely under normal faults, growth or schema change; several teams affected | Fix before launch or next release; named owner |
| **Medium** | Real but containable operational, evolution or cost risk | Plan in roadmap; monitor |
| **Low** | Good-practice improvement | Optional |
Rate by impact × likelihood × blast radius (number of consuming teams and products) × reversibility (can it be fixed by replay, or is the history already wrong?). Weigh financial, stock and regulated data more heavily. Severity measures consequence, not how unusual the design is.

## Step 5 — Recommend
Each fix is concrete (who changes what), proportionate and tied to a finding. Prefer, in order:
1. **Fix ownership and shape**: one writer, correct payload profile, split mixed streams, separate internal and public streams.
2. **Make publication and consumption safe**: outbox or CDC instead of dual writes; idempotent consumers; correct keys and co-partitioning; offsets after work; DLQ with owner.
3. **Make change safe**: registered schemas, compatibility rules, breaking-change path, deployment pattern.
4. **Make time and replay safe**: event time, late-data policy, replay runbooks, side-effect suppression.
5. **Add governance and platform controls**: catalogue, ACLs, lineage, privacy measures, standards.
6. **Add operations**: lag alerts, tracing, topology view, tests.
Say "use an API / batch / queue here" when that is the honest answer.

## Step 6 — Verdict
- **Proceed** — no High/Critical findings.
- **Proceed with conditions** — High findings with clear fixes; list the conditions.
- **Redesign** — the core shape creates High/Critical issues local fixes can't solve (shared writers everywhere, raw tables as the contract organisation-wide, change-only shared streams that every consumer must reinterpret, a central team owning all data).
- **Do not proceed** — Critical findings that make the design unsafe or unlawful as designed (e.g. personal data in infinite-retention streams with no erasure path), or no need for streaming.
Confidence: High / Medium / Low, depending on how much was assumed.

## Common patterns (quick reference)
- **Save then publish**: dual write → lost or phantom events. Outbox (relayed by CDC) or CDC + public projection; consumers dedupe on event ID.
- **Raw CDC topics consumed across the company**: internal schema becomes public; every table change breaks consumers. Project into a public stream; restrict raw streams to the owning domain.
- **Two services write the same topic**: conflicting schemas, races, unclear truth. One writer; the other sends commands or publishes its own stream.
- **Change-only events as the shared stream**: each consumer re-implements aggregation and breaks on each new change kind. Publish full-picture (or annotated full-picture) events; keep change-only streams inside the domain.
- **Pings as the only shape**: callbacks return current data, replay gives wrong history, load spikes on the owner. Carry the full picture, or accept and document the limits.
- **Many event types in one topic "for convenience"**: consumers filter and break. One schema per stream unless cross-type ordering per key is truly needed.
- **No schema registry / JSON by convention**: silent breaking changes. Registry, compatibility checks in CI, auto-registration off.
- **Backward (non-transitive) compatibility on replayed products**: newest reader fails on the oldest events. Use transitive compatibility.
- **Join returns too few matches**: streams not co-partitioned (key type, count). Repartition one side; standardise key schemas.
- **Hot partition**: skewed key. Re-key with a finer key or composite key where ordering allows; isolate giant tenants.
- **`now()` in business logic**: replay gives different answers. Event time; time-consistent lookups.
- **External API called inside the processing loop**: non-deterministic, slow, duplicates on retry. Separate service with idempotency keys; publish results as events.
- **"Exactly-once" claimed while sending emails or calling payment APIs**: the guarantee stops at the broker. Idempotency keys for side effects.
- **Offsets committed before processing**: silent loss on crash. Commit after work, or store offsets with state.
- **DLQ nobody watches**: silent data gaps. Owner, alert, replay procedure; consider parking the key.
- **Choreography with no process view**: stuck orders found by customers. Correlation IDs and a process-monitoring consumer; or move to orchestration.
- **Saga without idempotent compensations**: double refunds on retry. Idempotency keys; irreversible steps last.
- **Stateful service deployed by rolling update after a topology change**: corrupted or lost state. Blue-green with rebuild, or compatible operator IDs.
- **Personal data in infinite-retention streams, no erasure plan**: regulatory exposure. Crypto-shredding, field-level encryption, or references instead of personal data; retention by purpose.
- **Central data team republishing everyone's data**: bottleneck, no domain accountability. Move ownership to domains; central team becomes platform.
- **Batch extract plus stream of the same table**: analytics and services disagree. One data product, multiple modes from the same stream.
- **Short retention on a product that new consumers must bootstrap from**: new teams fall back to database reads. Long or infinite retention (tiered storage) or compacted state stream plus documented snapshot path.
