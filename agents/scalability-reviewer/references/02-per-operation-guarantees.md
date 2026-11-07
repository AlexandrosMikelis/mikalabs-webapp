# Step 2 — Decide what each operation must guarantee

Copies of data are how systems scale reads and survive failures. Copies also disagree for a while. Atlas settles, operation by operation, how much disagreement is tolerable **before** looking at stores and mechanisms, because the answer decides which mechanisms are even allowed. Mechanisms themselves are in `05`.

## Whose harm decides the guarantee?
For each important read and write ask two questions: *what goes wrong, and for whom, if a reader sees an outdated value?* and *what goes wrong if two writers both succeed?* Then pick the weakest guarantee that keeps the harm acceptable.

### MIKA staleness-budget table (house examples)
| Operation | Harm if stale or doubly written | Guarantee | Staleness budget |
|---|---|---|---|
| Ferry: hold the last car-deck space | Two cars sold one space; a car left at the quay | Linearisable on the sailing's inventory | 0 |
| Vet pharmacy: dispense a controlled drug | Stock record wrong; regulatory exposure | Linearisable on the stock item | 0 |
| Vet: owner edits contact number, then views it | Confusion, a repeat call to support | Read-your-writes | 0 for the editor, seconds for others |
| Energy co-op: member dashboard of today's usage | A slightly old figure | Eventual, bounded | 1–2 minutes |
| Ferry: "seats left" badge on the search page | Badge says 4, real figure is 2 | Eventual, bounded; re-checked at hold time | 5–10 seconds |
| Energy co-op: monthly settlement run | Wrong bills | Snapshot of a closed period | Period must be closed first |

Rules Atlas applies:
1. **Budget 0 means one writer decides.** Route those writes to a single authority (a leader, a consensus group, a conditional write). No cache, no async copy may answer them.
2. **Display reads may be stale if the commit re-checks.** The ferry badge may lag; the hold may not.
3. **A budget without a monitor is a wish.** Every non-zero budget needs a lag metric and an alert at, say, half the budget.
4. **Name the guarantee per operation in the DATA field**, never "the database is consistent".

## How do the guarantees relate to each other?
The Jepsen project publishes a freely available map of guarantees (jepsen.io/consistency), ordered by what each one implies. A condensed reading:
- **Strict serialisable** — transactions behave as if run one at a time, in real-time order. It implies both of the next two.
- **Serialisable** (multi-object transactions, any serial order) and **linearisable** (single objects, real-time order: once a write completes, every later read sees it).
- **Sequential** — everyone sees one order, not necessarily real-time order.
- **Cause-respecting (causal)** — effects never appear before their causes; unrelated writes may be seen in different orders.
- **Session guarantees** (Terry et al., Bayou project, 1994): **read-your-writes**, **monotonic reads** (a client never sees an older value after a newer one), **ordered writes** (a client's own writes apply in the order issued), **writes-follow-reads**.
- **Eventual** — copies converge once writes stop; no promise about any read before that.

The same map marks which guarantees can stay available while copies are cut off from each other. Linearisable, sequential and serialisable cannot. Cause-respecting order and read-your-writes can, provided a client keeps talking to the same copies ("sticky" availability). The remaining session guarantees can be served by any copy. This is the practical bridge to CAP and PACELC below.

Relational isolation levels are a separate ladder (read committed, snapshot, serialisable). Many databases default below serialisable. Know which anomalies the default allows (lost update, write skew) and use explicit row locks or version checks where the staleness-budget table says 0.

## What does a split between copies force?
- **CAP** (Brewer's 2000 conjecture, proved by Gilbert and Lynch in 2002): when copies cannot talk to each other, a system answering on both sides cannot also guarantee linearisable results. Partitions happen, so the real decision is which side of the trade each operation takes *while partitioned*.
- **PACELC** (Abadi, 2012) adds the everyday half: **if** Partitioned, choose Availability or Consistency; **else**, choose Latency or Consistency. Waiting for a majority of copies on every write costs latency even on a perfect day.
- Classify per operation, not per product. A one-writer relational database with synchronous standbys behaves PC/EC; a store in the Dynamo lineage (`05`) can be run PA/EL for one table and close to PC/EC for another by changing per-request copy counts (`05`).

Atlas writes the result as a pair: "hold-space: PC/EC; seats-left badge: PA/EL, budget 10 s".

## Can machine time decide which write came first?
Not on their own.
- Machine time drifts and jumps. NTP keeps skew to milliseconds on a good day; some clouds offer tighter, hardware-assisted time with a published error bound. Never zero.
- "Latest timestamp wins" across two machines a few milliseconds apart can keep the logically older write and silently drop the newer one.
- **Lamport timestamps** (1978) are counters passed along with messages, giving an order that respects cause and effect: if A could have influenced B, A's counter is smaller.
- **Per-copy counter vectors** go further: comparing two of them shows whether one version descends from the other or the two were written independently and need merging (`05`).
- **Hybrid logical-physical time (HLC)** (Kulkarni et al., 2014) pair physical time with a counter, so timestamps stay close to wall time while still respecting cause and effect.
- Some globally spread databases expose clock uncertainty as an interval and wait it out before committing, which buys real-time ordering at the price of a few milliseconds per commit.
- Use the operating system's non-decreasing clock for durations and timeouts inside a process.

Finding to raise: any correctness rule that depends on wall-clock time agreeing across machines.

## How much does each guarantee cost?
| Guarantee | Typical mechanism | Cost on every operation | Behaviour when copies are cut off |
|---|---|---|---|
| Linearisable / strict serialisable | One writer, or a consensus group per slice of keys | Round trip to a majority; leader hot spot | Minority side refuses or waits |
| Read-your-writes | Read from leader for a short window after own write, or carry a log position | Small; some reads go to the leader | Works while the client reaches its copy |
| Never-backwards reads | Pin a session to one copy, or position tracking | Very small | Works |
| Cause-respecting | Dependency tracking or counter-vector metadata | Metadata per write | Works with sticky clients |
| Eventual, bounded | Async replication plus lag monitoring | Lowest | Works; budget may be breached |

The common thread: strong guarantees are affordable when an operation stays inside one partition and one region. When a design needs them across partitions or continents, flag the latency and the failure behaviour explicitly.

## Questions Atlas asks at this step
- Which operations have a staleness budget of zero, and who is the single authority for each?
- Which display reads may lag, and is the commit path re-checking?
- What happens to each zero-budget operation during a zone or region split: refuse, queue or risk a double write?
- Does any rule depend on machine time agreeing across machines?
- Is replication lag measured against each non-zero budget?
