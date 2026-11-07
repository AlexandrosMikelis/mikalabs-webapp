# Step 11 — Weigh the evidence, rate the findings, give the verdict

This file holds the full `review` walk-through, the evidence Atlas expects (observability and load tests), the severity scale and the verdict rules. Use it for every review: an existing or proposed architecture with a load, a load-test result, an incident under load, or "will this hold for launch / peak season?".

## The walk-through at a glance
| Step | Question | File |
|---|---|---|
| 1 | What grows, by how much, and what counts as good enough? | `01` |
| 2 | What must each important operation guarantee? | `02` |
| 3 | Which shared resource saturates first, and at what multiple? | `03` |
| 4 | How is data copied and split? | `04` |
| 5 | Do the copies agree as promised, including during failover? | `05` |
| 6 | What happens on the asynchronous paths? | `06` |
| 7 | Do caches protect the store layer, and survive going cold? | `07` |
| 8 | Is the service tier stateless, balanced and scaling early enough? | `08` |
| 9 | Do failures stay small? | `09` |
| 10 | Which patterns relieve the pressures found? | `10` |
| 11 | What evidence exists; how severe is each finding; what is the verdict? | this file |

**Never block.** If a fact that would change a severity is missing, assume a value **with a number**, list it under ASSUMPTIONS and add an OPEN QUESTION saying which finding would change. Agent callers cannot answer follow-ups.

**Check proportion early.** Flag over-engineering (sharding, multi-region or a stream processor where a bigger instance, a cache or a nightly job meets the target with headroom) as readily as under-engineering (one primary and in-memory sessions facing a 20× flash peak).

## How do lenses map to steps?
The FINDINGS `lens` field uses these names.

| Lens | Main steps |
|---|---|
| capacity & bottlenecks | 1, 3 |
| statelessness & elasticity | 8 |
| load balancing | 8 |
| caching | 7 |
| data replication & partitioning | 4 |
| consistency | 2, 5 |
| async & back-pressure | 6 |
| resilience & failure modes | 9, 10 |
| observability | this file |
| cost of scale | 1, this file |

## What evidence should exist?
### Signals
- The four **golden signals** from the Google SRE book: latency (successes and failures separately, as p50/p99/p99.9), traffic, errors, and **saturation** of the most constrained resource (pool usage, queue depth, partition throughput, connection count).
- **RED** (rate, errors, duration) for each service; **USE** (utilisation, saturation, errors) for each resource.
- Do not average p99 values across instances; merge the underlying latency distributions.
- **Distributed tracing** across services *and* queues (trace context carried in message headers, e.g. W3C Trace Context).
- **Structured logs** with request and trace IDs, sampled at high volume; log volume grows with traffic and can become a major cost.
- **Alerts on symptoms users feel** (SLO burn rate), not on every cause.

### SLOs and error budgets
- **SLI**: a measured ratio (requests under 400 ms ÷ all requests). **SLO**: its target over a window. **Error budget**: the allowed shortfall; when spent, reliability work comes before features.
- Latency SLOs per user journey; per-hop budgets derived from them.

### Load evidence
| Test | Shows | Atlas expects it when |
|---|---|---|
| Load test at 1.5–2× target, realistic key skew | Throughput and latency curve per tier, the knee | Before any launch or seasonal peak |
| Stress beyond target | What breaks first, and whether it fails fast (503s) or collapses slowly | Critical paths |
| Soak (hours) | Leaks, compaction, log and disk growth | Long-running services holding state |
| Spike | Autoscaler reaction, cold caches | Flash events (ferry release, clinic opening) |
| Failure injection with a hypothesis and a stop switch | Whether containment (`09`) works | Systems with Critical containment findings |

Run against production-like limits: pool sizes, quotas and connection limits are where staging usually differs.

### Delivery and operations
Infrastructure as code, repeatable deployments, progressive delivery with automatic rollback on SLO regression, and a capacity review at each tenfold growth step and before known peaks. Orchestration gives restarts, probes, autoscaling and rolling updates; it does not make a stateful service stateless.

### Cost evidence
Cost per unit of work tracked next to latency; idle off-peak compute, cross-zone traffic, storage growth with copies and indexes, observability volume and premium tiers reviewed; capacity bought for a growth plan that slipped right-sized. Make trades explicit: "an extra zone of capacity costs X per month and protects Y per hour of outage".

## How severe is each finding?
| Severity | Meaning | Action |
|---|---|---|
| **Critical** | Fails, loses or corrupts data, or goes fully down at target load or on one common fault (one instance, one zone, one dependency slowing) | Fix before the peak; escalate |
| **High** | Serious degradation (SLO breach, partial outage, runaway cost) likely at target or under normal faults; slow or manual recovery | Fix before launch or next release; named owner |
| **Medium** | Limits growth beyond the target, or adds containable operational or cost risk | Roadmap item with an alert |
| **Low** | Good practice or efficiency gain | Optional |

Rate by impact × likelihood at the stated load × blast radius × reversibility. A bottleneck at 0.5× target outranks one at 8×. Severity measures consequence, not how unusual the design looks.

### MIKA calibration examples (house domains)
| Finding | Rating | Why |
|---|---|---|
| Ferry deck inventory row serialises holds at ~200/s; hottest sailing needs ~360/s at peak | Critical | Fails at about half of target; oversell or timeouts on the busiest sailing |
| Vet booking cache has no stampede guard; clinic database would take 8× load on a cold cache | High | Plausible on any deploy at 08:00; partial outage, recoverable |
| Energy co-op ingest workers share a feeder lock; USL peak below full-rollout target | High now, Critical at rollout | Retrograde scaling; cannot be fixed with hardware |
| Dashboard tallies copied with W = 1 and no lag metric | Medium | Budget 1–2 min likely met but unwatched |
| Restart check (process-alive probe) calls the database | High | One database blip restarts every instance |
| Nightly reconciliation runs as a single restarted instance | No finding | Meets the need; a lease-holding leader would be over-engineering |

## What does Atlas recommend first?
Fixes are concrete (who changes what), proportionate, tied to a finding, with rough cost or effort. Preferred order: **remove work** (indexes, fewer calls, batching) → **remove state from services** → **cache** → **replicate reads** → **move work off the request path** → **partition** → **change store or topology** (cells, regions). Pair each scale change with its protection (timeouts, bounds, idempotency) and the signal that shows it working. Say "a bigger instance is enough for now" when true, and say at which load it stops being enough.

## Which verdict?
- **Scales as designed** — no High or Critical findings at target load.
- **Scales with conditions** — High findings with clear, local fixes; list the conditions.
- **Redesign** — the core shape (one shared write path, services holding state, a long synchronous chain, a wrong partition key) cannot reach the target with local fixes.
- **Will not scale** — Critical findings make failure at target near certain with no realistic fix in the timeline, or the target is unrealistic for the budget.

Confidence: High / Medium / Low, by how much was assumed and whether load-test evidence exists.

## Shapes Atlas recognises quickly
| Shape | What goes wrong | Usual fix |
|---|---|---|
| In-memory sessions + sticky routing | Uneven load; sessions lost on scale-in | Shared store or signed token; drop stickiness |
| Autoscaled services, fixed database | Connections run out first | Pooler, smaller per-instance connection limits, autoscaler cap, cache |
| One primary for all reads and writes | Read load saturates the writer | Cache, then copies with read-your-writes |
| Time-ordered partition key | Today's writes on one partition | Hash or compound key; sub-keys |
| Cache in front of a fragile database, no stampede guard | One expiry becomes an outage | Single-flight refill, jitter, pre-loading |
| Synchronous chain of five or more services | Latency and failure odds compound | Parallelise, cache, defer non-essential calls, fallbacks |
| Fan-out to many partitions without hedging | p99 set by the slowest partition | Fewer partitions, copies, hedged requests, partial results |
| Unbounded in-memory queue | Overload → latency → out of memory | Bound it; reject or shed |
| Retries at every layer, no backoff | Retry storm | One layer, jittered, budgeted; breakers |
| Scheduled job on every copy | Duplicate work | One scheduler or lease-holding leader |
| Duplicate-free delivery assumed across services | Duplicates on redelivery | Idempotency keys, conditional writes |
| Active-active regions without a collision rule | Silent lost updates | Home region per key, or a mergeable type / merge rule |
| Functions under sustained high load | Unit cost keeps rising | Steady load on containers; functions for bursts |
| Reports run on the transactional store | Reports starve users | Separate analytics store, or a copy reserved for reports |
| No load test since the architecture changed | Every capacity number is a guess | Test at 1.5–2× target with realistic skew |

## Can the review be kept as a graph?
MIKA's knowledge-graph habit makes reviews reusable. Record nodes `Component`, `Resource`, `Operation`, `Guarantee`, `Finding`, and edges `Component -depends_on-> Component`, `Component -uses-> Resource {capacity, utilisation}`, `Operation -requires-> Guarantee {staleness_budget}`, `Finding -affects-> Operation`. The first bottleneck is then the resource with the lowest headroom on any path a critical operation depends on, and a later review can diff the graph instead of starting from scratch.
