# Streaming fundamentals

Use for every mode. This file sets the vocabulary the other references rely on: what an event is, what a stream is, how a log-based broker differs from a queue, why one service writes each stream, and when asynchronous event-driven services are worth their cost.

## 1. The core idea
An event-driven microservice architecture puts **durable, replayable streams of facts** at the centre. Services do not ask each other for data at the moment they need it; they read the facts other domains have published, keep the parts they care about in their own store, and publish their own facts in return. The stream becomes the organisation's shared record of what happened. Each service builds a private model from it, shaped for its own queries.

Three consequences follow, and most design questions trace back to one of them:
- **Decoupling in time.** A producer does not know or wait for consumers. A consumer can be offline, slow or brand new and still get every fact, because the broker keeps them.
- **Data access without the owner's runtime.** A new team can bootstrap from history instead of asking another team to build an endpoint. This is the main organisational payoff.
- **Eventual consistency.** Every reader lags the writer by some amount. Designs must say how much lag is tolerable and what a reader does while behind (see `08`).

## 2. Vocabulary
| Term | Meaning used here |
|---|---|
| **Event** | An immutable record that something happened or that an entity now has a certain state. It has a key (optional), a value, a timestamp and headers/metadata. |
| **Event stream / topic** | An append-only, ordered (per partition) sequence of events of one kind, owned by one domain. "Topic" is the Kafka-family term; Pulsar also says topic; Kinesis says stream (product facts). |
| **Partition** | A shard of a stream. Order is guaranteed only inside a partition. Events with the same key land in the same partition. |
| **Offset / position** | A consumer's place in a partition. Consumers own their offsets, so each consumer group reads independently. |
| **Consumer group** | A set of instances of one service sharing the partitions of a stream; each partition is read by exactly one instance in the group at a time. |
| **Producer** | The single service that writes a stream (see one writer per stream below). |
| **Materialised view / state store** | A table built by applying events in order, e.g. "latest state per customer". |
| **Message** | A generic word for something sent over a broker. Not every message is an event: commands and requests are messages too. |
| **Record** | The physical unit on the broker (key, value, headers, timestamp). |

## 3. Event broker versus message queue
Both move data asynchronously; they make different promises.

| Concern | Log-based event broker (Kafka, Pulsar, Kinesis, Event Hubs, Redpanda class) | Queue / message broker (RabbitMQ, SQS, ActiveMQ class) |
|---|---|---|
| Retention | Keeps events for a time or size limit, or forever, independent of consumption | Typically deletes a message once acknowledged |
| Readers | Many independent consumer groups, each at its own offset | Competing consumers share one queue; fan-out needs extra exchanges/queues |
| Replay | Rewind offsets and reprocess; bootstrap a new service from history | Usually not possible once acknowledged |
| Ordering | Per partition, strict | Often best effort; per-group ordering features vary |
| Scaling unit | Partitions (parallelism capped by partition count per group) | Consumers on a queue |
| Fit | Shared facts, history, data products, stream processing, rebuilding state | Work distribution, task queues, request buffering, short-lived commands |

Product details change; several brokers now offer both behaviours (e.g. queue-like share groups on log brokers, streams on queue brokers). The architectural question is which **promise** each stream needs: "keep the facts so anyone can read them again" or "hand this job to one worker and forget it".

A practical rule: use the log for anything another team may want to read, now or later; use a queue for internal work dispatch where history has no value. A log can carry commands, but a queue cannot serve as the organisation's record.

## 4. Immutability and the log as source of truth
- Events are **never edited in place**. Corrections are new events (a new state, a correction, a tombstone). This keeps every reader's view reproducible.
- Compacted streams keep only the latest event per key (plus tombstones for a while). They make "current state of every entity" cheap to bootstrap. Compaction is not deletion of history you need for audit: if audit matters, keep a non-compacted stream or archive to storage.
- The stream is the **source of truth for shared data**. Whatever store a service keeps is a derived, disposable view: you should be able to delete it and rebuild it from streams. If you cannot, the store has become a hidden source of truth and the design has a gap.
- Retention is a contract decision, not a disk setting. Infinite retention (often with tiered storage, product-dependent) is what makes bootstrapping new consumers possible; short retention forces every new consumer to rely on a snapshot mechanism instead.

## 5. Why does each stream have exactly one writer?
Exactly **one service owns and writes each stream**. Others read it. Reasons:
- One place defines the schema and its evolution.
- One place guarantees the business invariants behind each event.
- Debugging has a single origin; no two writers race on the same key.
If two services both need to emit facts about an entity, either they emit different streams (each states its own facts) or one of them owns the entity and the other sends it a command. Shared writable topics are a finding in every review.

## 6. Domains, bounded contexts and team ownership
Streams follow domain boundaries. A bounded context (a term from domain-driven design) is the area within which a model and its words mean one thing. Each stream belongs to exactly one context; the context's team owns its schema, quality and lifecycle. Communication structures in software tend to mirror those of the organisation, so the stream map is also an ownership map.

Nereus assumes a domain split exists. When the split is missing or contested, say so and hand the modelling to Gaia (domain modeller); continue with a stated assumption.

Choosing what a domain exposes: publish facts others need to make their own decisions, in the domain's public language, not its internal tables. Keep internal working state private. One private model, several public streams is normal.

## 7. Asynchronous versus synchronous services
Synchronous request-response between services is simple to write and reason about, gives immediate answers and suits user-facing reads. Its costs grow with the number of services: chained calls compound latency and failure, every caller depends on the callee's uptime, and historical data is hard to get because endpoints usually serve the present only.

Asynchronous event-driven services decouple failure and scaling, let consumers own their read models and make history available. Their costs: eventual consistency, more infrastructure (broker, registry, tooling), harder end-to-end visibility and a learning curve around time, ordering and state.

Guidance:
- Use streams for **sharing facts across domains** and for anything consumed by more than one reader.
- Use request-response for **user-facing queries** against a service's own materialised state, for commands that need an immediate answer, and at the edge with third parties that only offer APIs (see `07`).
- Mixing is normal. A service can consume streams, keep state and serve an API over that state.
- Do not use events as remote procedure calls in disguise (publish a "please compute" event and block until a reply event arrives) unless you accept the latency and design for timeouts.

## 8. The platform tax
Event-driven microservices need shared capabilities before they pay off: a managed broker, a schema registry, stream creation with ownership metadata, access control, consumer-lag monitoring, a way to reset or rebuild a service's state, container or function hosting, CI/CD, and observability that spans streams. Organisations that skip this pay it later as inconsistent topics, orphaned streams and fragile services. In a design, list which of these exist and which are assumed; in a review, missing tooling is often a Medium or High finding depending on scale (`08`, `09`).

## 9. When not to stream
Say so plainly when:
- One team, one service and one database meet the need, and nobody else needs the data.
- A nightly batch suits the decision cadence and the data half-life is long.
- A strongly consistent read-your-write interaction is required and cannot be relaxed.
- Volume is tiny and there is no operations capacity for a broker; a managed queue or a simple webhook may do.
Streaming is a means to share facts and decouple teams, not a goal.

## Example (invented)
A regional bicycle-sharing company has a Rides service, a Billing service and a Fleet Maintenance service, all calling each other's REST APIs. Billing fails whenever Rides is slow; the new Demand Forecasting team needs two years of ride history that no endpoint offers. A streaming design: Rides publishes `ride-state` (keyed by ride ID, compacted plus a full-history archive), Fleet publishes `bike-condition` (keyed by bike ID). Billing and Forecasting materialise what they need. The REST APIs remain for the mobile app's reads. One writer per stream, history retained, consumers decoupled.
