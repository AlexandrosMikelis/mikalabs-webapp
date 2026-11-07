# Step 11 — Review procedure, severity and verdict

Use for every `review`: an architecture description, a diagram in text, a design document, or infrastructure code in any common tool. Work in order. Skip a lens only when the input clearly does not touch it, and say so.

Grounding: the quality areas shared by the AWS, Azure and Google Cloud architecture frameworks (operations, security, reliability, performance, cost, sustainability) and MIKA's own lens set, severity calibration and decision rules below.

## Pass 1 — Establish the facts
Fill the workload card from `01`. Where a fact that could change a rating is missing, assume, write it under `ASSUMPTIONS`, and add the question to `OPEN QUESTIONS`. Agent callers cannot answer follow-ups: never block.

## Pass 2 — Draw the system map
Draw the graph from `01`: nodes (entry, compute, channel, store, external) and edges (`WAITS_ON`, `HANDS_OFF`, `READS`, `WRITES`, `TRIGGERS`). Mark owners. Count synchronous compute-to-compute hops per journey and list every asynchronous edge; each gets a failure-path card (`06`).

## Pass 3 — Walk the lenses
For each lens, cite the element (function, rule, queue, setting) that is the evidence.

| Lens | Reference | What to look for |
|---|---|---|
| **fit** | `01` | fit score per component; gates; flat high load on functions with no comparison; long jobs in functions |
| **compute & latency** | `02` | heavy cold paths on interactive journeys; inverted timeouts; untuned memory; functions in a VPC without need |
| **entry paths** | `03` | synchronous reach beyond one compute step and one store; long work held on a connection; glue functions; unthrottled public endpoints |
| **events & contracts** | `04` | channel choice per edge; no schema, version or owner; two-call write-and-publish; ordering assumed; boundary buses missing |
| **workflows** | `05` | coordinator test; hand-built state machines; callbacks with no timeout; missing compensation |
| **failure paths** | `06` | card items F1–F10 per edge; recovery tier claimed vs tested |
| **limits & downstream protection** | `02` | concurrency sheet vs pool; scale-out rate vs burst; payloads near limits; downstream connection and partner limits. Always say "verify current value" |
| **access & data** | `07` | permission ledger; secrets; event trust; personal data leak paths; supply chain; edge protection |
| **telemetry** | `08` | journey SLOs; alert set; trace joins across hand-offs; log retention and content |
| **delivery** | `10` | IaC coverage; environment separation; verification matrix gaps; gradual release and rollback |
| **unit economics** | `09` | cost-per-transaction known; floor vs variable; leaks; footprint levers where free |

## Pass 4 — Rate each finding
| Severity | Meaning | Typical action |
|---|---|---|
| **Critical** | will cause, or is causing, data loss, a breach, a financial or clinical error, or an outage of a key journey | stop and fix now |
| **High** | likely failure, serious exposure or major cost overrun under realistic load or misuse; or a core control missing on a key journey | fix before launch or the next peak, with a named owner |
| **Medium** | real weakness with bounded impact, or missing detection or defence in depth on a key journey | planned fix with a date |
| **Low** | hygiene, efficiency, clarity | optional |

### Calibration rules
- **Up one level** when the journey moves money, affects animal or human care, carries health or payment data, or a failure would be silent (no alert, no dead-letter visibility).
- **Down one level** when a compensating control is in place and tested, or the path is background, low-volume and easily replayed.
- **Never down** because a failure is rare. A one-in-ten-thousand duplicate on a payment path still charges real people twice.
- **One finding per root cause.** Group symptoms that share a fix; cite all elements in the issue line.

### Calibration examples (house domains)
| Situation | Rating | Why |
|---|---|---|
| Ferry refund handler triggered asynchronously by a bus, no idempotency, refund API has no idempotency key | Critical | retries refund twice; money movement; card item F4 |
| Clinic radiograph conversion writes the converted file to the same storage location that starts it | High | loop, cost and outage; F9; up one level would apply only if clinical results were lost |
| Co-op meter-read stream consumer without batch bisection or on-failure destination | High | a poison record blocks the shard and settlement data goes stale; F5, F8 |
| Booking API calls quote function, which synchronously calls fare function, then a partner rail API | High | breaks the synchronous-reach rule on a key journey; stacked timeouts |
| Reminder SMS queue with a dead-letter queue but no alert on its depth | Medium → High | silent loss; up one level because owners would never notice |
| Log groups with no retention on a low-volume admin tool | Low | hygiene; small cost |
| Arm not used for CPU-light functions | Low | efficiency only |

## Pass 5 — Write the findings
Each finding: severity, title, lens, **Issue** (what breaks, costs or leaks, for whom; 1–3 lines), **Basis** (the rule, pattern, quota, card item or provider guidance), **Fix** (the concrete setting, pattern or code change, and the owner role). Name strengths honestly; a sound design deserves to hear it.

## Pass 6 — Decide the verdict
| Verdict | Rule |
|---|---|
| **Proceed** | no Critical or High findings |
| **Proceed with conditions** | High findings with clear, bounded fixes; list each as a condition |
| **Redesign** | the structure itself causes High or Critical risk that point fixes cannot remove (a synchronous chain across teams on a key journey; a Poor-fit workload forced onto functions; services sharing one database) |
| **Do not proceed** | unresolved Critical findings; for a live system with a Critical issue, recommend incident handling first |

Confidence: **High** when IaC or detailed configuration was seen; **Medium** for a detailed description; **Low** for a sketch or many assumptions.

## Pass 7 — Hand off
Name the right agent for deeper work: **Atlas** (general scalability and capacity, non-serverless scaling), **Argus** (API threat analysis in depth: OAuth, JWT, OWASP API threats), **Hestia** (multitenant SaaS isolation, plans, per-customer noisy neighbours), **Nereus** (event streaming and cross-organisation event flow).

## Recurring shapes and what to check
- **Web or mobile back end**: CDN and firewall → HTTP API with token check → one function → table; side effects via bus. Check: start-up delay on interactive paths, object-level authorisation in code, per-client throttling.
- **Accept-then-process**: API → queue or workflow start → 202 with status URL → workers. Check: idempotency key at the API, visibility timeout, dead-letter alert.
- **Upload pipeline**: signed upload URL → storage notification → queue → function or batched child runs → separate output location. Check: loop guard, size limits vs function memory and duration, malware scan where needed.
- **Scheduled job**: scheduler → workflow or container job, idempotent per run id. Check: missed-run alert; jobs creeping toward the function ceiling.
- **Change events from a store**: table stream → pipe → bus. Check: stream retention, poison records, schema of emitted events.
- **Partner integration**: bus → queue → function, or a managed HTTP target with a rate limit. Check: partner limits, retry amplification, signature verification on the way in.
- **Long process with people**: Standard workflow with callback tokens, timeouts, compensations, status events. Check: heartbeats, versioning of in-flight executions.
- **Steady heavy compute**: continuous transcoding or simulation at flat load. Usually containers or batch on committed capacity; say so plainly.
