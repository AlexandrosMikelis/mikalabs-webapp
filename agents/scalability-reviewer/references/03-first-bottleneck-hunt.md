# Step 3 — Hunt the first bottleneck

A system scales only as far as its least scalable shared resource. Atlas looks for **the one resource that saturates at the lowest multiple of today's load**, says at what multiple it bites, and leaves the rest for later. A list of every theoretical weakness is not a review.

## Where do systems usually serialise?
In rough order of how often Atlas finds them:
1. A single relational primary: write rate, connection count, long transactions, lock contention on a hot row.
2. Fixed-size worker or connection limits sized for last year's traffic.
3. State kept inside service processes (sessions, in-memory tallies), which blocks adding instances.
4. Synchronous fan-out to many downstream services, where tail delays add up.
5. Hot keys and hot partitions: one sailing, one clinic, one feeder, one huge customer.
6. Third-party quotas: payment providers, SMS and email gateways, map APIs.
7. Coordination: distributed locks, leader-only work, whole-cluster cache invalidation.

## Which laws explain what we see?
- **Little's law** (`L = λ × W`). If latency doubles at constant traffic, in-progress work doubles too, and so do memory and pool usage. Slowness turns into exhaustion.
- **Queueing near saturation.** For a simple single-server queue, average response time ≈ service time ÷ (1 − utilisation). At 50% utilisation requests take about twice the service time; at 90%, about ten times. Latency-sensitive tiers should run at 50–70% in steady state.
- **Serial-fraction limit** (Amdahl, 1967). With a serial fraction `s`, speed-up on `N` workers is at most `1 / (s + (1 − s)/N)`. With 5% serial work the ceiling is 20×, however many machines are added.
- **Universal Scalability Law** (Gunther). Throughput `X(N) = λN / (1 + σ(N − 1) + κN(N − 1))`, where σ is contention (waiting for a shared resource) and κ is coherency (nodes keeping each other in step). With κ > 0 throughput peaks at `N* = √((1 − σ)/κ)` and then **falls**. Fit σ and κ from three or four load-test points; the fit tells you whether to remove a queue (σ) or remove chatter (κ).
- **Tail amplification** (Dean and Barroso, "The Tail at Scale", 2013). If a request waits for `n` backends and each is slow 1% of the time, the request is slow with probability `1 − 0.99ⁿ`: about 26% at n = 30, about 63% at n = 100.

### Worked example — energy co-op meter ingest (house example)
The co-op's ingest workers each add readings to a per-feeder running total protected by a distributed lock. One worker handles 2,000 readings/s. A load test fits σ ≈ 0.05 and κ ≈ 0.002.

| Workers | Predicted readings/s |
|---|---|
| 8 | ~10,900 |
| 16 | ~14,400 |
| 22 (peak, N*) | ~14,800 |
| 32 | ~14,100 |
| 48 | ~12,200 |

Adding workers beyond about 22 makes ingest slower. The co-op needs 25,000 readings/s at full rollout, so no worker count is enough. The finding is the shared lock (the κ term). Fix: partition the running totals by feeder so each worker owns its feeders outright, or aggregate locally and merge per minute. Both remove coherency traffic instead of adding hardware.

## MIKA bottleneck triage table
Match the symptom, confirm with the cheap check, then apply the first fix. If the check does not confirm, move to the next row.

| Symptom under load | Likely suspect | Confirm by | First fix | Detail in |
|---|---|---|---|---|
| Latency climbs, CPU low everywhere | Pool or lock waits | Pool-wait time, lock-wait stats, thread dumps | Size worker limits with Little's law; shorten locked code paths | this file, `08` |
| Database refuses connections after a scale-out | Instances × pool size > connection limit | Count instances × pool | Connection pooler, smaller per-instance connection limits, cap autoscaler | `08` |
| Throughput flat or falling as nodes are added | Contention or coherency (USL) | Fit σ, κ from load tests | Remove shared lock or chatter; partition ownership | this file, `10` |
| One partition or shard far busier than the rest | Hot key | Per-key or per-partition request counts | Split the key, cache it, dedicated partition | `04`, `07` |
| p99 bad, p50 fine, request fans out | Tail amplification | Per-backend latency at p99 | Fewer, larger partitions; hedged requests; partial results | `10` |
| Primary CPU high, mostly reads | Read load on writer | Read/write ratio per query | Cache, then copies serving reads, with read-your-writes | `07`, `04` |
| Errors from an external API at peak | Third-party quota | Provider's 429s and documented limits | Queue and smooth calls; batch; negotiate quota | `06` |
| Memory grows until restart under load | Unbounded queue or buffer | Queue length and heap over time | Bound it; reject or shed when full | `06`, `09` |
| Queue age grows all day | Consumers slower than arrivals | Arrivals per second vs drain rate | More consumers *if* downstream can take it | `06` |
| Spikes on the hour, every hour | Synchronised clients or cron | Request timestamps | Jitter schedules; single scheduler | `09`, `10` |

## Does each node use its own resources well?
Scaling out does not excuse poor use of one machine.
- **Worker limits** cap how much runs at once. Size them with Little's law against the callee's latency; unbounded thread creation leads to memory exhaustion and context-switch thrashing.
- **Event loops** carry many connections per thread, but one blocking call (a synchronous driver, CPU-heavy work) stalls every connection on that loop.
- **Overwritten changes** come from two workers doing read-modify-write on the same data without coordination. Use atomic operations, optimistic version checks, or give each piece of state one owner.
- **Circular lock waits** freeze workers. Lock in a fixed order, keep locked regions tiny, use timeouts.
- **Barriers** (wait for all parallel parts) run at the pace of the slowest part.
- **Shared structures protected for concurrent use** reduce bugs but become contention points at high core counts. Per-core or partitioned structures scale better.

The same problems return at cluster scale: locks become leases (`10`), overwritten changes become colliding copy writes (`05`), barriers become join steps in pipelines (`10`).

## How does Atlas report it?
In the CAPACITY line: "First bottleneck: <resource>, saturates at about <multiple>× today (<arithmetic>)". In FINDINGS: the bottleneck first, rated by how far below the target it bites. A bottleneck at 0.5× target is Critical; at 1.2× target, High; at 5× target, Medium at most.

## Questions Atlas asks at this step
- Which shared resource saturates first, and at what multiple of today?
- Is there load-test evidence, or is every number an estimate?
- Does throughput keep rising with nodes, or has it flattened?
- Which keys or tenants are far hotter than average?
- What changes first if latency doubles: running out of workers, memory, timeouts?
