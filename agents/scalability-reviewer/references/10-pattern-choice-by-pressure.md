# Step 10 — Choose patterns by the pressure they relieve

Atlas does not pick patterns from a catalogue page by page. It names the **pressure** that the bottleneck hunt (`03`) found, then chooses the least complex pattern that relieves that pressure with headroom. Pattern names follow the public Azure Architecture Center cloud design patterns catalogue, Kubernetes documentation and well-known papers, so readers can look each one up.

## MIKA pressure map
| # | Pressure (what `03` found) | Pattern options, simplest first | Rung |
|---|---|---|---|
| P1 | Same expensive work repeated | Lazy-fill cache → Materialized View → CDN for public content | 1–2 |
| P2 | Bursts above the sustainable rate | Queue-Based Load Leveling + a shared worker pool → Throttling / admission queue | 2 |
| P3 | Working set or write rate beyond one node | Bigger node → Sharding by key, each partition copied → lookup directory for very large customers | 2–3 |
| P4 | Tail latency from waiting on many backends | Fewer, larger partitions → fan-out/fan-in with per-backend timeouts → hedged requests and partial results | 2 |
| P5 | Exactly one actor must hold a role | Single instance restarted by the orchestrator → a leader chosen through a coordination service, with a lease and fencing tokens | 1 → 3 |
| P6 | Work in several stages at different speeds | Pipes and Filters with a queue between stages | 2 |
| P7 | Results of parallel work must be combined | Incremental (associative) reduce → full barrier only where every part must exist | 2 |
| P8 | Same cross-cutting behaviour needed on many services | Shared library → Sidecar / Ambassador / local adapter → Gateway Offloading | 1–2 |
| P9 | One failure or one customer hurts everyone | Isolated worker limits → Deployment Stamps (cells) → shuffle sharding | 2–3 |
| P10 | Compute bill does not fit the load shape | Functions for spiky load ↔ always-on containers for sustained load | 1 |

**Rungs**: 1 = configuration or an off-the-shelf component; 2 = a new component the team must run; 3 = new coordination or data movement between nodes.

**Decision rule**: choose the lowest rung that gives at least 2× headroom over the target from `01`. Climb a rung only when the arithmetic shows the lower one falls short, and write that arithmetic in the PATTERNS field as "pattern — where — why — trade-off".

## P2 and P6: smoothing and staging work
- **Queue-Based Load Leveling** puts a queue between bursty producers and a service that can only take a steady rate; a pool of workers sharing that queue drains it (`06` for sizing and back-pressure).
- **Pipes and Filters** chains stages, each with its own queue and worker pool: validate → enrich → store → notify. Common stage roles: duplicate a stream to several stages, filter, route by item type, spread by key across parallel queues, merge streams.
- The **slowest stage sets end-to-end throughput**; find it and scale it first. Trace items across stages (correlation IDs), bound every inter-stage queue, and check the graph has no cycles.

## P3: splitting state by key
- Each partition owns a slice of keys; a router, client library or local proxy sends each request to the owner. Consistent hashing (`04`) keeps re-partitioning cheap.
- Copy every partition so a node loss does not take a slice offline, and so hot partitions can gain extra read copies.
- The key used for routing must include exactly the attributes that determine the answer (`07` makes the same point for cache keys).
- Losing one partition of a cache sends its entire slice to the origin at once; plan for it.

## P4: fanning out without suffering the tail
Some requests are naturally split: search over a partitioned index, availability across all clinics in a region, ranking. A root sends sub-requests in parallel and merges the answers. This shape is sometimes called partition/aggregate.
- **Per-backend overhead** (request handling, network, merge) grows with the number of backends. Beyond some count adding backends hurts, exactly as the serial-fraction limit and the USL predict (`03`).
- **The slowest backend decides** response time, and the odds of hitting a slow one rise with the count (tail amplification, `03`). "The Tail at Scale" (Dean and Barroso, 2013) describes the standard defences: **hedged requests** (send a second copy to another copy after the expected p95 has passed, cancel the loser), tied requests, and returning **partial results** with a flag.
- **Availability**: one missing backend fails or degrades every request. Copy each backend and add throughput with copies, not with more partitions.
- **Sizing rule**: the smallest partition count that meets the latency target with each partition's data in memory; then add copies for throughput and availability.

## P5: when exactly one node must act
First ask whether a chosen leader is needed at all. One instance under an orchestrator that restarts it within seconds and reschedules it within minutes after a node failure may already meet the availability target. The ferry's nightly fare-import job runs exactly like that.

When it is needed (a scheduler that must never double-run, a writer that owns a file or partition):
- Use a coordination service with consensus inside (etcd, ZooKeeper, Consul, or a database with conditional writes) (the Azure catalogue lists this as a pattern of its own). Do not build the agreement protocol yourself.
- **Leases** (Gray and Cheriton, 1989) are time-bounded ownership: the holder renews regularly and must stop acting before the lease can expire, allowing for clock error.
- **Fencing tokens**: each new owner receives a higher number; the protected resource rejects writes carrying an older one. Without fencing, a paused former owner (long garbage-collection pause, network stall) can wake up and write after a new owner took over. Acquiring a lock alone does not guarantee exclusive access.
- Check the **gap between owners**: what is missed, what is delayed, what retries.

## P7: combining parallel work
- **Incremental reduce**: when the combine step is associative (sums, counts, histograms, merged indexes), partial results can be merged as they arrive and in any grouping — the shape behind MapReduce (Dean and Ghemawat, 2004) and its successors. Parallel phases scale out; the final merge is the serial fraction.
- **Full barrier (join)**: proceed only when every part is complete. The slowest part sets the pace and one missing part stalls everything; add timeouts, retries, and speculative re-execution of stragglers.
- House example: the energy co-op's monthly settlement sums meter readings per member per tariff band. Sums are associative, so each partition's totals merge incrementally; only the final "period closed" step is a barrier.

## P8: helpers next to the application
Several containers scheduled together in one Kubernetes pod share network and, optionally, storage. Kubernetes now supports **sidecar containers** natively (init containers with `restartPolicy: Always`), which fixes start-up and shutdown ordering.
- **Sidecar** (Azure catalogue): extends the app without changing it — refreshes configuration, ships logs, renews certificates, adds a local encrypting proxy.
- **Ambassador** (Azure catalogue): a local proxy representing remote services, so the app talks to `localhost` while the helper handles discovery, routing across cache partitions, retries or protocol detail.
- **Local adapter**: the reverse direction — presents the app to the platform in a standard shape (metrics format, structured logs, a health endpoint that actually tests the app).
- Scaling notes: a helper runs once per application instance, so its CPU and memory multiply with instances; keep it lean, parameterised and with a documented interface. Service-mesh sidecars are a large special case — hand off to Daedalus.

## P9: limiting blast radius
Bulkheads and cells are covered in `09`. In pattern terms: isolated worker limits per dependency, **Deployment Stamps** (independent copies of the stack per group of customers or regions), and shuffle sharding. Each adds operating cost; justify by the revenue or safety at risk per incident.

## P10: functions or containers?
Per-invocation pricing suits spiky, low-utilisation work: glue between systems, event handlers, short pipelines. Challenges: cold starts, execution time limits, no in-memory state between calls, harder tracing, accidental self-triggering loops. At sustained high load, always-on containers usually cost less per unit of work. Expect to revisit the choice as traffic grows. Deep serverless design goes to Aeolus.

## Worked example — vet network lab-results pipeline (house example)
Pressures found: P2 (overnight bursts of 30,000 results), P6 (validate → match patient → store → notify owner), P5 (one nightly reconciliation job).
- P2 at rung 2: one queue plus 50 workers drains a burst in about two minutes (`06`). Enough; no streaming platform needed.
- P6 at rung 2: three stages with their own queues; "notify owner" is the slowest (SMS quota), so it gets its own throttled worker pool.
- P5 at rung 1: the reconciliation job runs as a single scheduled instance with orchestrator restart; a missed night is caught up the next night, so a lease is not worth its complexity.
- Rejected: partitioning the clinic database (P3). The arithmetic shows 250 writes/s, well within one primary.

## Questions Atlas asks at this step
- Which pressure, from `03`, is each pattern meant to relieve?
- Is there a lower rung that gives 2× headroom?
- For every single-owner role: is a chosen leader needed, and is there fencing?
- For every fan-out: how many backends, and what happens at p99?
- Does each helper's per-instance cost still make sense at target instance counts?
