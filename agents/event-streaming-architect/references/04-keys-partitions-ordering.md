# Keys, partitions and ordering

Use for the STREAMS, PROCESSING and TIME & ORDER fields in `design`, and for scaling and correctness findings in `review`. Partitioning decides what order consumers see, how far a service can scale and whether joins work at all.

## 1. Key, partition, order: the chain
- A producer assigns each event a **key**. The broker maps the key to a **partition**, typically by hashing the key modulo the partition count (product-dependent default partitioners).
- All events with the same key go to the same partition, so they are **ordered relative to each other**.
- There is **no order across partitions**. A global order needs a single partition, which caps throughput and parallelism; avoid it unless volume is trivial.
- Ordering also depends on the producer: retries without idempotent producers, or several in-flight requests, can reorder within a partition on some brokers. Enable idempotent producers where available.

## 2. Choosing the key
The key should be **the entity whose events must be processed in order**.
- Order lifecycle: key by order ID.
- Account balance: key by account ID.
- Device telemetry with per-device logic: key by device ID.
Questions to ask:
1. Which invariants depend on order? Those decide the key.
2. Will consumers need to join this stream with others? The join key should be the partition key, or a repartition will be needed.
3. Is the key stable for the life of the entity? Never key by a mutable attribute (status, email, region if it can change).
4. Is the key distribution even? A handful of huge keys (one marketplace seller with half of all orders) create **hot partitions**.
For streams without a key (independent readings), round-robin or sticky partitioning spreads load; accept that there is no per-entity order.

Key format is part of the contract: use a governed key schema, consistent across streams that share an entity (same type, same encoding, same casing). Two streams keyed by "customer ID" as a string and as an integer will not co-partition. Cross-domain key conventions are a federated-governance topic (`09`).

## 3. Partition count
- Partitions are the unit of parallelism for a consumer group: N partitions allow at most N active instances per group.
- Too few: cannot scale consumers, hot partitions overload instances.
- Too many: more broker overhead, longer rebalances, more open files and state-store shards, small batches (product-dependent limits).
- Changing the partition count later **remaps keys** to different partitions, breaking per-key order across the change and invalidating co-partitioning and local state. Treat it as a migration: create a new stream with the new count and move consumers, or accept a controlled ordering gap.
Rule of thumb: size for expected peak consumer parallelism over the next couple of years, plus headroom, and keep counts consistent across streams that will be joined.

## 4. Repartitioning
When a service needs events grouped by a different key than the producer used, it **repartitions**: reads the source stream, re-keys each event, and writes to an internal intermediate stream partitioned by the new key, then consumes that.
- Example: a stream of `delivery-attempt` events keyed by parcel ID, but a service needs counts per depot. It re-keys by depot ID into an internal repartition stream, then aggregates.
- Stream-processing frameworks (Kafka Streams, Flink keyBy) do this automatically when you group or join by a new key; the intermediate stream adds latency, storage and broker traffic.
- The repartition stream is **internal** to the service: name it accordingly, do not let other teams depend on it.
- Order after repartitioning is per new key and reflects arrival order at the repartition step, not original event time. If original order matters across sources, handle it with event time (`05`).

## 5. Co-partitioning
To join two streams locally (each instance joining the same keys from both), the streams must be **co-partitioned**:
- same key (same type and serialisation);
- same partition count;
- same partitioning function.
Then partition 3 of stream A and partition 3 of stream B hold the same keys, and one instance can be assigned both. If any condition fails, repartition one side first.
Co-partitioning failures are silent: the join simply misses matches. In review, check partition counts and key formats of every joined pair.

Global or broadcast tables avoid co-partitioning for small reference data: every instance holds a full copy (e.g. a table of depots or currency codes) and enriches events locally (`06`).

## 6. Partition assignment
Consumer instances in a group divide partitions among themselves; a coordinator (broker- or client-side, product-dependent) reassigns when instances join, leave or fail.
- **Range / round-robin**: simple spreads; can be uneven.
- **Sticky / cooperative**: keep existing assignments where possible and move only what is needed, reducing pauses and state reshuffling (cooperative rebalancing in Kafka clients, static membership).
- **Co-partition-aware**: assigns the same partition numbers of joined streams to the same instance. Stream frameworks handle this.
- **Custom**: e.g. pin certain partitions to instances with special resources. Rarely justified.
Stateful services care most: moving a partition moves its state (`06`). Prefer sticky/cooperative assignment and standby replicas.

## 7. Failure recovery for stateless consumers
A stateless instance that fails loses nothing but its in-flight batch. Its partitions move to another instance, which resumes from the last committed offset. Consequences:
- Events after the last commit are **reprocessed** → consumers must be idempotent or transactional (`06`).
- Commit offsets **after** processing (and after side effects), never before, or you risk loss.
- Long processing per event can exceed session or poll timeouts and trigger rebalances; tune batch sizes and timeouts, or move slow work out of the poll loop.

## 8. Compaction and key semantics
- Compacted streams keep the latest event per key; key choice therefore defines "what is an entity".
- Tombstones (null value) delete a key after a retention period.
- Composite keys (tenant + entity) are fine if consistent; document their encoding.
- If you need both latest state and history, either keep a compacted stream plus an archive, or a non-compacted stream with long retention plus materialised state.

## 9. Ordering beyond the partition
When consumers combine several streams or receive retried events:
- Carry a **per-entity version or sequence number** in each event; consumers discard or buffer events older than what they have applied.
- Use **event time** for business ordering across streams (`05`).
- Accept that "happened before" across domains is often unknowable without a shared clock; design so that it does not matter (commutative updates, last-writer-wins by version, or explicit causation IDs).

## 10. Multi-tenant and multi-region notes
- Tenant per stream vs tenant in key: separate streams isolate access and retention; shared streams with tenant keys scale better but need careful ACLs and can create hot keys.
- Cross-region replication (mirroring) keeps per-partition order but offsets differ between clusters; consumers failing over need offset translation or idempotency (product-dependent).
- Active-active writing of the same key in two regions breaks single-writer ordering; assign each key a home region.

## Review checks
- Is every stream's key documented, stable and matching the ordering invariant?
- Are joined streams co-partitioned (key type, count, partitioner)?
- Any hot keys? Evidence of skewed partition lag?
- Is the partition count sized for parallelism, and is there a plan for changing it?
- Are repartition streams internal and named as such?
- Are offsets committed after processing?

## Example (invented)
A parking-operator platform keys `bay-occupancy` by bay ID (60 partitions) and `payment-session` by licence plate (24 partitions). A team joins them by bay ID and finds 30% of matches missing: wrong key and different partition counts. Fix: the payment service repartitions `payment-session` by bay ID into an internal 60-partition stream with the same key schema as `bay-occupancy`, then joins locally; the key schema is added to governance so future streams about bays use the same encoding.
