# Step 4 — Walk the store layer: copies and partitions

Atlas reviews tiers from the inside out, starting where state lives, because state cannot be thrown away and re-created like a service instance. This file covers how data is copied and split. How copies agree is in `05`.

## Which move comes next for this store?
MIKA's store-layer ladder. Climb one rung at a time and skip a rung only with a stated reason (for example, the write rate already exceeds what any single node can take).

| Rung | Move | Relieves | Costs |
|---|---|---|---|
| 1 | Tune: indexes for real queries, remove N+1 loops, shorter transactions, archive cold rows | Reads and writes | Engineering time only |
| 2 | Bigger machine | Reads and writes | Price curve steepens; one failure domain; ceiling |
| 3 | Cache hot reads (`07`) | Reads | Staleness; a new dependency |
| 4 | Copies that serve reads | Reads | Replication lag; failover work |
| 5 | Partition (shard) by key | Writes and storage | Cross-partition queries and transactions get hard |
| 6 | Different store for one workload | Whatever the old store did badly | Another synchronisation path and another system to run |

Rung 1 often buys 10× on its own. Atlas says so before recommending rung 5.

## What do reading copies buy, and what do they break?
- **Asynchronous replication** (the common default): the primary confirms before copies apply. Writes stay fast; copies lag from milliseconds to minutes under load; a failover can lose the last unreplicated writes.
- **Synchronous replication** to at least one standby: no loss on failover, slower writes (the "EC" half of PACELC, `02`).
- Copies scale **reads only**. Every copy still applies every write.
- Lag shows up to users: a clinic receptionist saves an appointment, the next screen reads a lagging copy, the appointment "vanishes". Remedies, matching the staleness budgets from `02`:
  - send a user's reads to the primary for a short window after that user writes (read-your-writes);
  - keep a session on one copy, so it never sees time run backwards;
  - carry the commit's log position and read only from a copy that has reached it.
- **Failover** needs fencing so a returning old primary cannot accept writes (split brain). Ask when it was last tested.

## How should the data be split?
Partitioning gives each node a subset of keys and its share of reads and writes. Each partition is normally replicated too.

### Choosing the partition key — MIKA key scorecard
Score each candidate key 0–2 on five questions; prefer the highest total, and reject any key that scores 0 on spread.

| Question | 0 | 1 | 2 |
|---|---|---|---|
| Spread: does load spread evenly at real skew? | One value dominates | Mild skew | High cardinality, no dominant value |
| Locality: do common transactions stay in one partition? | Rarely | Often | Almost always |
| Presence: do most queries carry the key? | Few | Most | Nearly all |
| Stability: does a record's key ever change? | Often | Rarely | Never |
| Growth: does it stay even at 10× data? | Gets worse | Unknown | Stays even |

House example — the energy co-op stores meter readings. Key `reading_date`: spread 0 (all of today's writes hit one partition). Key `meter_id`: spread 2, locality 2, presence 2, stability 2, growth 2. "All readings for one feeder this hour" then becomes a cross-partition query, which belongs in a separate analytics copy rather than the ingest store.

### How keys map to partitions
| Scheme | How | Good at | Weak at |
|---|---|---|---|
| Range | Contiguous key ranges | Range scans | Sequential keys (time, auto-increment IDs) pile onto one partition |
| Hash | Hash of key onto partitions | Even spread | Range queries touch every partition |
| Consistent hashing (Karger et al., 1997) | Keys and nodes on a ring; virtual nodes even out the spread | Adding a node moves about 1/N of keys | Slightly more routing logic |
| Lookup directory | Table from key or customer to partition | Moving one large customer on its own | The directory must itself scale and stay available |
| Compound | Hash on one part, order by another (meter, then time) | Even spread plus ordered reads within a key | Queries must carry the hashed part |

### What about the one key everyone wants?
Real traffic is skewed even with a good key: the Friday car-deck sailing, the clinic network's flagship hospital, a feeder with a large solar farm.
- Split the hot key into sub-keys (`sailing-4711#0..7`) and merge on read; this trades read work for write spread. For the ferry, deck inventory can be split into deck blocks, each holding a fixed number of spaces.
- Give very large customers their own partition through a directory.
- Absorb reads with a cache and extra copies of the hot partition.
- Check what the store does automatically (splitting busy ranges, shifting throughput to hot keys) and how quickly; automatic help usually lags a sudden spike.

### How will the data move as it grows?
Prefer many small partitions spread over fewer nodes, then move whole partitions as nodes are added, over re-hashing everything. Throttle data movement so it does not starve live traffic. If the store cannot split partitions later, choose the partition count for several years of growth.

### What does partitioning take away?
- Transactions across partitions (need a commit protocol, `05`, or a redesign so they are not needed).
- Joins across partitions, and indexes on non-key fields: per-partition indexes force every query to visit every partition; whole-cluster indexes are usually updated asynchronously.
- Global uniqueness: use generated IDs, or a dedicated allocator.

## Which scale-out route fits a relational system?
- **Application-routed shards**: the code picks the database by key. Full control, high engineering cost (schema changes, rebalancing, cross-shard reports).
- **Routing proxies**: transparent routing with restrictions on queries.
- **Shared-storage clusters**: several compute nodes over one storage layer; reads and failover improve, write scale stays limited by coordination.
- **Auto-partitioning SQL systems**: ranges split automatically and each copied by consensus, with SQL and multi-range transactions. Easiest to use; pays latency for cross-range and cross-region commits.

## When is a non-relational store the right call?
| Shape | Fits | Watch for |
|---|---|---|
| Key-value | Sessions, carts, tallies, holds with expiry | Nothing beyond key lookup |
| Document | Aggregates read and written together (a pet's record with vaccinations) | Cross-document transactions; documents that grow without bound |
| Wide-column | High write rates, time series (meter readings) | Model around queries; no ad-hoc joins |
| Graph | Deep relationship traversal (which clinics share which suppliers) | Hard to partition; many scale up first |
| Search / columnar analytics | Full text, aggregation | A derived copy, not the system of record |

Start from access patterns: list each query with its rate and latency target, then design keys and denormalised tables so each is served from one partition.

Products as examples only (verify current behaviour): in-memory key-value stores often replicate asynchronously by default, so confirmed writes can be lost on failover; document stores typically let each write choose how many copies must confirm; managed key-value services bound throughput per partition, so a hot key gets throttled, and their whole-cluster indexes usually lag the main data.

## Is every extra store justified?
Each additional store adds a synchronisation path (usually change-data-capture or events, `06`) and an operational burden. Atlas asks for the requirement the existing store cannot meet. "We might need it" is not one.

## Questions Atlas asks at this step
- At peak, is the primary limited by reads or by writes?
- Which screens break under replication lag, and which remedy covers them?
- What is the partition key, how does it score, and which queries cannot use it?
- How will data move at 10× size?
- Which operations need atomicity across partitions?
