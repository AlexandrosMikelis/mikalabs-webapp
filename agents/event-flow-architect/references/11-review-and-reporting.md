# 11 · Reviewing an event architecture (`review`)

Use for an existing or proposed event-driven, streaming or messaging design, an AsyncAPI document, a partner integration or a technology choice. The procedure reuses the earlier references in working order and ends with rated findings and a verdict.

## Step 1 · What is actually built?
Run the intake (`01`) with the review additions: technology in use, envelope and schema practice, how events leave the system of record, assumed delivery guarantee, retention and replay, security model, who operates what. Record the boundary grade of every channel. Missing facts that would change a severity become assumptions and open questions; agent callers cannot answer follow-ups, so never block.

## Step 2 · Is each stream described correctly?
Give every main stream its shape code and flags (`04`). Mismatches between shape and technology are often the first findings:
- a work queue asked to deliver the same facts to several readers or support replay;
- a log used for request/reply conversations;
- chained functions standing in for a multi-day process;
- eventual consistency used to allocate an ⚑ Exclusive item.

## Step 3 · Is an event the right answer here?
Apply the ledger (`03`). Flag **over-engineering** (streaming where a daily file or an API call serves) and **under-engineering** (polling or batch where delay costs money, trust or safety) with equal care.

## Step 4 · Check the areas
Consider all; report only what matters for this system.

| Area | Core questions | See |
|---|---|---|
| Shape fit | Does the technology match direction, intent, payload and latency? | 04, 05 |
| Readiness | Does the design assume a readiness band the organisation lacks? | 02 |
| Reliability & delivery | Dual writes? Outbox or CDC? Promised vs real guarantee? Idempotent consumers? Ordering key? Retries, dead-letter owner, poison events? | 06 |
| Contracts & evolution | Standard envelope? Registered schemas and compatibility mode? Versioned types? AsyncAPI for exposed channels? Internal models hidden from partners? | 07 |
| Security | Per-party identity, per-channel authorisation, tested withdrawal, signed delivery, content encryption across intermediaries, secrets | 09 |
| Lineage & usage rights | Can consumers verify origin? Derived events traceable? Terms and entitlements recorded? | 09 |
| Privacy | Personal data minimised? Purpose, retention, erasure, cross-border placement | 09 |
| Latency & retention | Hop budget fits the usefulness window? Retention covers outages? Resync path? | 10 |
| Visibility & control | Lag, quiet-producer and duplicate detection? Trace context? Pause, replay, throttle per side? | 10 |
| Runaway reactions | Loops, cascades, synchronised device reactions, breakers, overrides | 10 |
| Topology & ownership | Central bus bottleneck? Domain ownership? Provider-specific event shapes at a boundary? Regional design where needed? | 05 |
| Cost & lock-in | Bespoke plumbing where a rentable component exists? Exit cost? Skills? | 03, 08 |

## Step 5 · Rate each finding
| Severity | Meaning | Typical action |
|---|---|---|
| **Critical** | Data loss, corruption or exposure is likely or already possible; an unauthorised party can trigger actions; a regulatory breach across a boundary; a loop that can cause physical or financial harm | Contain now or before go-live; escalate |
| **High** | Significant failure, inconsistency or lock-in likely under ordinary faults or growth; partners or customers affected | Fix before launch or next release; named owner |
| **Medium** | Real but containable operational, evolution or cost risk | Plan into the roadmap; monitor |
| **Low** | Good-practice improvement | Optional |

**MIKA severity factors.** Start from impact, then adjust:
- +1 level if the boundary grade is B2 or B3, or the data is personal or regulated (cap at Critical);
- +1 level if many parties are affected and the effect is hard to reverse (events already consumed and acted on);
- −1 level if a reliable compensating control exists and is tested.
Severity measures consequence, not how unusual the design is.

### Calibration examples
| Situation | Rating | Why |
|---|---|---|
| Vet lab posts results to clinics via unsigned webhooks; payload includes owner name and phone | **Critical** | Spoofable deliveries of personal data at scale; B1 but personal data, hard to reverse |
| Ferry control room saves a cancellation, then publishes in a separate step | **High** | Dual write: partners may never hear of a cancellation; B2 |
| Energy co-op battery alert broadcast with no stagger or rate limit | **Critical** | Synchronised discharge can stress the local grid: physical harm possible |
| Meter readings kept 5 years in the operational log "in case" | **High** | Personal data, replayable, no purpose; move history to an archive with access control |
| Partner channel with JSON but no registered schema | **Medium** | Breakage on change; containable with registry and CI checks |
| Internal topic names differ from the naming convention | **Low** | Cosmetic, cheap to fix later |

## Step 6 · Recommend
Each fix is concrete (who changes what), proportionate and tied to one finding. MIKA fix order — earlier items usually remove later ones:
1. **Reshape** — correct the shape code, split streams, move to the right technology class.
2. **Make publication and consumption safe** — outbox or CDC, idempotency, keys, dead-letter ownership.
3. **Fix trust** — per-party identity, signing, authorisation, encryption, minimised payloads.
4. **Write the contract** — envelope, schema rules, AsyncAPI, promise sheet.
5. **Add operations** — visibility, loop protection, replay drills.
Say "use an API, a file or a batch job here" when that is the honest answer.

## Step 7 · Verdict
- **Proceed** — no High or Critical findings.
- **Proceed with conditions** — High findings with clear, local fixes; list them as conditions.
- **Redesign** — the core shape causes High or Critical issues that local fixes cannot solve (wrong intent or payload class, central bottleneck, no workable trust model at the boundary grade).
- **Do not proceed** — Critical findings that make the integration unsafe or unlawful as designed, or no business need.
Confidence: **High** (facts given), **Medium** (some key facts assumed), **Low** (shape or boundary assumed).

## Frequent findings (quick reference)
| Seen in the design | Usual problem | Usual fix |
|---|---|---|
| Save, then publish from service code | Lost or phantom events | Outbox or CDC; consumers deduplicate on `source` + `id` |
| "Exactly once" claimed across parties | False promise | At-least-once promise; idempotent consumers |
| Partners read an internal topic | Schema leak, no per-partner access or withdrawal | Curated external event per partner via gateway, router or signed webhooks |
| Webhooks without signatures, retries or delivery log | Spoofing and silent loss | Standard Webhooks signing, backoff, delivery log, replay endpoint |
| Whole customer or owner profile in each event | Privacy exposure in every copy and replay | IDs and changed fields; authorised fetch; short retention |
| Functions chained for a multi-day process | Lost state, no visibility | Workflow engine or saga |
| One central bus team in every change | Bottleneck | Domain-owned channels with shared standards |
| Polling a partner API every few minutes | Latency floor and cost | Ask for events or webhooks; one adapter that emits change events |
| No key or sequence on state updates | Out-of-order application | Key by entity; `sequence` attribute; apply only newer |
| MQTT device fleet straight into core systems | Broker load, weak device identity | Per-device credentials, edge aggregation, bridge to a log |
| Provider-specific event shapes at a partner boundary | Lock-in and mapping cost | Neutral CloudEvents envelope at the edge |

## Output
Use the `review` template in `SKILL.md`. Order findings by severity; `area` uses the names in the Step 4 table. Open questions are only those whose answer would change a rating.
