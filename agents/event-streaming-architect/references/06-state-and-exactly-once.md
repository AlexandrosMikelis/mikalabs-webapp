# State, exactly-once and processing frameworks

Use for the PROCESSING and DELIVERY fields in `design` and for reliability findings in `review`.

## 1. Stateless versus stateful
- **Stateless** operations look at one event at a time: filter, map, route, branch, merge, enrich with a constant. Easy to scale and recover.
- **Stateful** operations remember: aggregations, counts, joins, deduplication, windows, materialised tables, pattern detection. They need a **state store** and a recovery story.
Compose stateless steps freely (filter → transform → branch to several outputs, or merge several inputs with the same schema). Introduce state deliberately and size it.

## 2. Materialising state from streams
A service builds a table by applying events in order per key: a full-picture stream becomes "latest value per key", a change-only stream becomes an aggregate (`02`). That table is a **derived view**; the stream remains the source of truth.

### Internal (local) state
State lives with the processing instance (in memory or embedded on disk, e.g. RocksDB in Kafka Streams and Flink), sharded by partition.
- Every change is also written to a **changelog stream** (compacted, keyed like the store) or checkpointed to durable storage, so state can be restored on another instance.
- Pros: very fast lookups, no network hop, scales with partitions, state and offsets can be committed together.
- Cons: recovery requires replaying the changelog (minutes to hours for large state), disk on each instance, instance moves trigger restoration. Mitigate with **standby replicas** (hot copies on other instances) and sticky assignment.
- **Global state**: a full copy of a small stream (reference data) on every instance; no co-partitioning needed; every instance pays the memory and restore cost.

### State in a remote database
State lives in a separate database (Postgres, Cassandra, Redis, a document store).
- Pros: survives instance loss without restore, easy to query from other tools, independent scaling of storage and compute, familiar to teams.
- Cons: network latency per lookup, harder to make offset commits and state writes atomic, shared database becomes a coupling point if other services read it.
- Recovery: if the store survives, resume; if not, rebuild from the stream.
- Keep remote state **private** to the service. If others need it, publish a stream or serve an API.

### Rebuilding versus migrating state
When the state model changes (new field, new aggregation):
- **Rebuild**: reset the service (or deploy a new version with a new state store and consumer group), replay inputs from the start, switch over when caught up. Clean and reproducible; needs input retention and time.
- **Migrate**: transform the existing store in place. Faster for huge state but error-prone and not reproducible from streams. Prefer rebuild unless the time cost is prohibitive, and still keep the rebuild path working.

## 3. Delivery guarantees
| Guarantee | Meaning | Typical cause |
|---|---|---|
| At-most-once | May lose, never duplicates | Commit offset before processing |
| At-least-once | Never loses, may duplicate | Commit after processing; retries |
| Exactly-once (effectively once) | Each event's effect is applied once | Transactions or idempotency |
"Exactly-once" in streaming normally means **effectively once**: an event may be read and processed more than once, but the observable result (state and outputs) reflects it once.

### With broker transactions
Some brokers let a client atomically write output records, update state changelogs and commit input offsets in one transaction (Kafka transactions; Kafka Streams `exactly_once_v2`; Flink two-phase-commit sinks). Consumers of the outputs must read with **read-committed** isolation to avoid seeing aborted writes.
Scope: this holds only for the **read → process → write loop inside the broker** (and sinks that participate). The moment a side effect leaves that loop (an email, an HTTP call, a write to a non-transactional database), duplicates are possible again.
Costs: some latency (transaction commit interval) and throughput overhead; zombie-instance fencing; operational complexity.

### Without broker transactions
Achieve effectively-once by **idempotency** in the consumer:
- Store the last applied offset (or event ID / per-entity version) **in the same database transaction** as the state change; on restart, resume from the stored offset rather than the broker's committed one.
- Use idempotent writes: upserts keyed by entity and version, `INSERT … ON CONFLICT DO NOTHING` on event ID, conditional updates (`WHERE version < :new`).
- Deduplicate on event ID with a bounded dedupe store (time-limited window).
- For external side effects, pass an **idempotency key** derived from the event (payment APIs commonly support this).

### Producing without duplicates
- Enable idempotent producers so broker-side retries do not create duplicates within a partition.
- Never publish as a separate step after a database commit (dual write); see outbox and CDC in `07`.

## 4. Failure handling
- **Retries**: bounded, with backoff, for transient errors. Retrying in place blocks the partition (order preserved); moving to a retry stream unblocks the partition but breaks per-key order. Choose per stream and document.
- **Poison events** (cannot be deserialised or always fail validation): send to a **dead-letter stream** with the error and original coordinates; alert; have a named owner and a replay procedure. Never silently skip.
- **Downstream outage**: pause consumption (back-pressure) rather than dropping; lag grows and alerts fire.
- **Ordering-sensitive keys**: if one event for a key goes to the DLQ, later events for the same key may be invalid. Consider parking the whole key until resolved.

## 5. Framework classes
Choosing how to build a streaming service (classes and examples only; verify current features):

| Class | Examples | Strengths | Limits | Fit |
|---|---|---|---|---|
| **Basic producer/consumer** | Plain client libraries in any language | Simple; any language; easy integration with legacy and with a database that does the heavy work | You build state, joins, time handling, exactly-once yourself | Stateless transforms, sinks, work where order across events doesn't matter, logic mostly in a database |
| **Lightweight embedded library** | Kafka Streams, Samza embedded mode | Runs as a normal app in your containers; local state with changelogs; joins, windows, exactly-once; no separate cluster | Tied to its broker; JVM-centric; scaling bound to partitions; large state restores | Stateful microservices owned by product teams |
| **Heavyweight cluster framework** | Apache Flink, Spark Structured Streaming, Beam on a runner | Rich time semantics, large state, checkpoints/savepoints, SQL, many connectors, batch + stream | Separate cluster or managed service to run; multitenancy and resource isolation to manage; job submission model differs from normal services | Complex event-time analytics, very large state, platform-run data products, streaming SQL |
| **Function-as-a-Service** | AWS Lambda, Azure Functions, Google Cloud Run functions, Knative with event sources | No servers; scales to zero; quick to build | Cold starts; execution time limits; state must be external; batching and offset semantics vary by trigger; harder ordering | Simple stateless reactions, low or bursty volume, glue code |
| **Streaming SQL / managed processing** | Flink SQL, ksqlDB, cloud stream analytics, RisingWave-class engines | Fast to express joins/aggregations; accessible to analysts | Harder to test and version as code; vendor-specific dialects | Building composite and purpose-built data products (`09`), prototyping |

FaaS design rules (from practice): keep each function inside one bounded context; commit offsets only after the function's work completes; keep functions few and coarse rather than a web of tiny ones calling each other; choose triggers deliberately (new event, consumer lag threshold, schedule, webhook, storage event); tune batch size and memory; plan for concurrency limits per partition.

Hybrid: a basic consumer service can delegate a hard join to a stream-processing job that publishes the joined result, then consume that stream.

## 6. Serving state
Stateful services often serve queries over their state:
- **Internal state**: interactive queries against local stores; requests must be routed to the instance that holds the key (frameworks expose metadata for this). During rebalances, some keys are unavailable or stale.
- **Remote database**: serve from the database; simpler routing; consistent with how most teams build APIs.
Either way, the API returns **eventually consistent** data; expose freshness (e.g. the event time or offset the state reflects) when callers care (`08`).

## Review checks
- Is every stateful operation identified with its store, size estimate and recovery time?
- Are changelogs or checkpoints configured? Standby replicas for large state?
- What guarantee is claimed and where exactly does it stop? Any side effects outside the transaction?
- Are consumers idempotent? How?
- DLQ with owner and replay? Ordering impact of retries considered?
- Is the framework class fitting the team, the state size and the time semantics?

## Example (invented)
A loyalty programme credits points when `order-state` reaches `DELIVERED`. The service uses Kafka Streams with exactly-once processing to update a local `points-balance` store and emit `points-ledger` events. Sending the "you earned points" email is a side effect outside the transaction, so the email service consumes `points-ledger` and calls the email provider with an idempotency key of `ledger-entry-id`. Refunds produce negative ledger entries rather than edits. Reprocessing for a bug fix suppresses emails by running the new version with a flag and writing to `points-ledger.v2`.
