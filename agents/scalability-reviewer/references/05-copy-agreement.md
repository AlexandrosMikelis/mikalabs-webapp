# Step 5 — Check how the copies agree

`02` set a guarantee and a staleness budget per operation. This file checks whether the chosen replication mechanism actually delivers them, including during failures. The mechanisms below are described from their public papers; product behaviour varies, so verify the store in question.

## Which family of mechanism is in play?
| Family | Public anchor | Who accepts writes | Typical guarantee | Failure behaviour |
|---|---|---|---|---|
| One writer, async copies | Classic primary/standby | One node | Linearisable on the writer; copies eventual | Failover may lose recent writes |
| Majority log | Raft paper (USENIX ATC 2014) | One chosen leader per group | Linearisable | Smaller side stops; short pause on leader change |
| Any-copy sets | Amazon's Dynamo paper (SOSP 2007) | Any of N copies for a key | Chosen per request via R and W | Stays writable; conflicts possible |
| Mergeable data types | CRDT paper (Shapiro et al., 2011) | Any copy | Strong eventual (copies that saw the same updates hold the same state) | Always writable; merges deterministic |

Atlas names the family in the DATA field for every replicated store.

## How do per-request copy counts work?
That paper describes keys stored on N copies chosen by consistent hashing, with each operation choosing how many must answer:
- A write waits for **W** confirmations; a read asks **R** copies.
- When **R + W > N**, the set of copies read always overlaps the set written, so a read can observe the latest confirmed write. The overlap weakens under simultaneous writes and under the substitute-node mode below.
- With N = 3: W = 2, R = 2 is balanced; W = 3, R = 1 gives fast reads but writes are refused when any copy is down; W = 1, R = 1 is fastest and gives only eventual results.
- **Substitute nodes**: when home copies are unreachable, another node takes the write with a note to forward it later. Writes stay available; the overlap guarantee is suspended until those notes are delivered.
- Across regions, "majority in my region" keeps latency local; "majority overall" pays a cross-region round trip for a stronger read.

House example — the energy co-op keeps member dashboard tallies in an any-copy store with N = 3, W = 1, R = 1 (budget 1–2 minutes, `02`). Meter-to-member assignments, which settlement depends on, use W = 2, R = 2. Same store, two settings, written down per table.

## How do lagging copies catch up?
Copies fall behind when one misses writes. Mechanisms from the same paper's lineage:
- **Fix-up on read**: a read that sees disagreeing copies writes the newest version back to the stale ones. Only data that is read gets fixed.
- **Background reconciliation**: copies compare checksum trees over slices of keys, so only differing slices are exchanged. Fixes everything; costs I/O; schedule and monitor it.
- **Forwarding held writes**: replay of the notes kept for a copy that was briefly away.
- **Deletes** are recorded as markers (often called tombstones) and must be kept until every copy has seen them. Purge too early and deleted data reappears.

Atlas checks that lag, reconciliation progress and delete-marker counts are on a dashboard.

## What happens when two writers collide?
| Strategy | How it decides | Loses data? | Fits |
|---|---|---|---|
| Latest timestamp wins | Higher timestamp kept | Yes, silently; clock error can keep the older write | "Last seen at" fields |
| Per-copy counter vectors (Parker et al., 1983) | Detects whether versions are ordered or written independently; independent versions go back to the application | No, if the app merges | Records with a sensible merge |
| Domain merge rule | App logic (union of items, max of two tallies, flag for review) | Depends on rule | Carts, care notes needing review |
| Mergeable types | Data type defines a merge that is commutative, associative and idempotent | No | Counters, sets, flags, collaborative text |
| Avoid collision | Each key has one home writer or region | No | Anything with a zero staleness budget |

Mergeable-type reminders: a **grow-only counter** keeps one count per copy and sums them; a **positive-negative counter** pairs two of those; an **observed-remove set** tags each add so a simultaneous add and remove resolve predictably. State-based variants ship whole states and merge them; operation-based ones ship operations over a channel that delivers each once and respects cause-and-effect order. They fit only operations whose merge makes business sense: a stock level that must never go negative is not one of them.

## How does a majority log stay correct?
A summary of the published Raft design:
- Time is divided into numbered **terms**. Each term has at most one leader.
- The leader appends client commands to its log and sends them to the other copies. An entry becomes **final** once a majority has stored it; final entries are applied in log order everywhere.
- A copy that hears nothing from a leader for a randomised timeout asks the group to back it in a new term. It needs support from a majority. A copy refuses to back a contender whose log is less complete than its own, judged first by the term of the last entry and then by log length. That rule keeps final entries from being lost.
- During a partition only the side holding a majority can commit. The smaller side keeps refusing writes.
- **Leader change is visible**: a pause of typically hundreds of milliseconds to a few seconds. Clients must retry idempotently.
- **Reads**: a leader that has been replaced without noticing may serve stale data. Linearisable reads first confirm leadership (a round to a majority, or a time-bounded leader lease that relies on bounded clock error). Reads from non-leaders are cheaper and may lag.
- **Sizing**: 2f + 1 copies survive f failures. Three survive one; five survive two. Even counts add cost without adding resilience.
- **Geography**: a group spread over three regions waits for a cross-region majority on every write. Place the group, or the leader of each slice of keys, near its writers.

Background facts worth citing: no deterministic protocol can guarantee agreement in a network with no timing bounds if even one node may crash (Fischer, Lynch and Paterson, 1985). Practical protocols therefore always keep their safety rules and move forward whenever timing is reasonable. Use an existing coordination service or a store with agreement built in; do not write a new one.

## What if one operation spans several partitions or services?
**Two-phase commit** (described by Gray in the late 1970s): a transaction manager asks each participant to *prepare* (make the change durable and promise to commit), then sends *commit* if all agreed, *roll back* otherwise.
- Cost: at least two round trips, durable writes at every participant, rows kept locked throughout.
- The blocking problem: if the manager disappears after participants prepared, they keep rows locked and cannot decide alone. A timeout cannot safely resolve an in-doubt transaction.
- Mitigation: replicate the manager's decision log through a majority group; keep transactions short with few participants.
- Auto-partitioning SQL systems combine a majority group per slice of keys with a commit protocol across slices; single-range transactions stay cheap, multi-range ones pay extra round trips.
- Between independently owned services, prefer a **saga** (local steps with compensations) or a **transactional outbox** (write the change and the outgoing message in one local transaction, publish later). Service decomposition itself belongs to Theseus.

## MIKA agreement check (per replicated store)
| Check | Pass condition |
|---|---|
| Family named | DATA field says which family and settings |
| Budget met | Mechanism's worst case fits the staleness budget from `02` |
| Failover safe | Zero-budget operations cannot be accepted twice during failover (fencing, majority, conditional write) |
| Collisions handled | A collision strategy is named; silent loss only where harmless |
| Lag visible | Lag, reconciliation and delete markers monitored |
| Placement sane | Majorities are not paying cross-region latency for local writers |

A failed "Failover safe" on a zero-budget operation is Critical. A failed "Lag visible" is usually Medium.

## Questions Atlas asks at this step
- Which family is each store, with which settings per table or operation?
- Does the worst case during failover fit the staleness budget?
- How are colliding writes resolved, and is anything lost silently?
- Does any transaction span services or regions, and what if its transaction manager dies?
- Are reconciliation and delete-marker clean-up running and watched?
