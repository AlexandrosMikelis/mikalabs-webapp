# Step 9 — Check that failures stay small

At scale something is always failing: a node, a zone, a dependency, a network path. Atlas checks failure containment after walking the tiers because it cuts across all of them. A design scales only if its failures stay local while load is high.

## Why is a remote call different from a local one?
Client libraries give a network request the same syntax as a function call. The semantics differ:
- It can be a thousand to a million times slower.
- It can fail in ways a local call cannot: the request never arrives; it arrives and runs but the reply is lost; it is still running when the caller gives up.
- **The caller cannot tell these apart.** A timeout means "unknown outcome", not "failed".
- Packets are lost, duplicated, delayed and reordered. TCP and QUIC hide loss at the cost of latency spikes; retries above the transport can still duplicate whole requests.
- Connections cost memory and file descriptors at both ends. Thousands of instances each holding a pool to one database exhaust its connection limit long before its CPU. Poolers, proxies and multiplexed protocols (HTTP/2, gRPC) help.

### Delivery promises
- **At most once**: send and forget; loss possible.
- **At least once**: resend until confirmed; duplicates possible. The practical default.
- **Exactly once** holds only inside one system that controls both the message and its effect. Across independent systems: at-least-once delivery plus idempotent processing (`06`).

## What kinds of partial failure must the design survive?
| Failure | Looks like | Why it is hard |
|---|---|---|
| Crash | Node stops | Easy to detect; in-progress work lost |
| Omission | Messages dropped | Looks like slowness until timeouts fire |
| Grey / slow | Responds, but slowly or intermittently | Health checks pass; callers pile up |
| Correlated | Many copies fail together (shared zone, config push, expired certificate, one bug) | Redundancy only helps against independent failures |
| Arbitrary (Byzantine) | Wrong answers | Rare inside a trusted data centre; usually out of scope |

## How do small failures become outages?
- **Cascades**: a slow dependency holds callers' workers and connections; callers run out and slow down; their callers follow. Slow is often worse than down, because down fails fast. The Google SRE book's chapter on cascading failures is the standard public treatment.
- **Retry amplification**: three retries at each of four layers can turn one user request into 3⁴ = 81 attempts at the bottom.
- **Synchronised herds**: clients that all reconnect after a deploy, a cache flush or on the hour.
- **Running out**: workers, file descriptors, disk (logs, queues), memory (unbounded buffers), provider quotas.
- **Metastable failure** (Bronson et al., HotOS 2021): the trigger goes away but the system stays down, because recovery load — retries, cold caches, backlog — exceeds capacity. Recovery needs shedding or a throttled restart, not just waiting.

## Which defences does each remote call need?
### Timeouts and deadlines
Every remote call has a timeout set from the callee's latency distribution (just above its p99) and the caller's remaining budget. Pass a **deadline** down the chain so downstream services stop work the caller already abandoned.

### Retries
Only for idempotent or idempotency-keyed operations, only for transient errors, with exponential backoff, **jitter** and a cap. Retry at one layer (the edge or the immediate caller), not all of them. The AWS Builders' Library article on timeouts, retries and backoff with jitter, and the SRE book's per-client **retry budget** (retries limited to a small fraction, around 10%, of normal traffic), are good public anchors.

### Circuit breakers
Count failures to a dependency; past a threshold, **open** and fail fast (or serve a fallback) for a cool-down; then **half-open** and let a few trial requests through; close if they succeed. The breaker stops callers wasting resources and gives the dependency room to recover.

### Bulkheads and cells
Partition resources so one failure cannot consume all of them:
- separate worker and connection limits per dependency (a slow lab-results service exhausts only its own pool, never the appointment-booking pool);
- separate instance groups for critical and non-critical traffic, and for batch versus interactive work;
- per-customer quotas;
- **cells**: complete, independent copies of the stack, each serving a subset of customers, so a bad deploy or a poison request hurts one cell;
- **shuffle sharding** (AWS Builders' Library): give each customer a random small combination of workers so two customers rarely share all of them, shrinking the blast radius of one noisy customer.

### Load shedding and admission control
When demand exceeds capacity, reject some work early and cheaply rather than serving everyone badly. Prioritise explicitly: holds and payments over browsing, interactive over batch, emergency appointments over routine. Shed at the edge where possible; inside a service, reject when the expected queue wait exceeds the request's remaining deadline. The SRE book's chapter on handling overload and the Builders' Library article on load shedding describe the practice.

### Planned degradation
Decide reduced modes in advance, behind feature flags: serve cached schedules, hide usage forecasts, accept bookings and confirm by message later, switch search to a simpler index. Prefer modes that need no new code path during the incident; the Builders' Library article on avoiding fallback warns that rarely exercised fallbacks fail when needed.

## Does redundancy actually remove the single point?
- **N+1 or N+2 per tier**, measured at peak. With three zones, each must carry 50% of peak to survive losing one.
- **Static stability** (Builders' Library): keep enough capacity running in each zone *before* a failure, so surviving a zone loss does not depend on launching instances during the incident.
- Automatic, tested failover; documented manual failover where automation is riskier.
- Look for shared single points: one NAT gateway, one DNS provider, one secrets store without a local cache, one certificate.

## MIKA blast-radius scorecard
Score each critical user journey; any row at 0 is at least a High finding.

| Question | 0 | 1 | 2 |
|---|---|---|---|
| Timeouts on every remote call? | Missing somewhere | Present, defaults | Set from latency data, deadlines propagated |
| Retries bounded across layers? | Several layers retry | One layer, no budget | One layer, jittered, budgeted |
| Slow dependency isolated? | Shares worker limits with everything | Partly | Own pool or breaker |
| Overload behaviour? | Accepts all, slows down | Rejects late | Sheds early by priority |
| Zone loss? | Outage | Degraded, manual work | Absorbed by pre-provisioned capacity |
| Recovery after outage? | Untested | Manual throttle | Tested, with drain plan |

## Questions Atlas asks at this step
- What happens when the slowest dependency becomes ten times slower?
- Where are timeouts, retries, breakers and bulkheads, and how many layers retry?
- What is shed first under overload?
- Which redundant parts share a failure domain?
- Could the system stay down after the trigger is gone?
