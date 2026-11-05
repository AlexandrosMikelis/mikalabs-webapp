# Event-first architecture (`design`)

Architecture choice depends on functional needs (processing, retention, user interaction), scale (events in, processing, events out) and resilience (service levels, performance, adaptability). Three questions — after Clemens Vasters' event decision tree — settle most of the shape.

## Decision 1 — messaging or eventing?
- **Messaging**: parties cooperate on a task and need a conversation ("received", "done", "failed", "here is the result"). Both sides keep conversation state. Examples: order fulfilment with a 3PL, payment authorisation, booking confirmation.
- **Eventing**: the producer states facts for whoever is interested and needs little or no feedback. Examples: notifications, alerts, state updates, price changes, inventory levels.
Prefer **eventing** for flow: consumers can connect, experiment and leave without disturbing the producer; nothing is left mid-transaction. Messaging carries distributed-state costs (sharding by transaction ID, consensus, eventual consistency, recovery) that cap scale; hyperscale systems minimise it. Most enterprises are fine with standard messaging at their volumes; at billions of messages per day, localise it.
**Scaling messaging**: localise conversations at the edge — a message bus per group of related agents near those agents, passing only filtered or aggregated activity to core services ("leaf → branch → limb → trunk"). Act locally, forward to the core for storage where latency matters less.

## Decision 2 — discrete events or event series?
- **Discrete**: each event stands alone (carries context plus payload, or a reference to it). Producer pushes.
- **Series**: meaning lies in the sequence (tickers, telemetry, clinical monitoring, behaviour analytics); consumers fetch ranges. Producer must retain ordered history and offer range reads (pull).

### Discrete events
- Keep producer–consumer promises minimal: ideally "I send each event when available". Every extra promise (keep history for audit, guarantee at least one consumer got it, throttle when a consumer is overwhelmed) is valid in context but costs scale and adds failure modes. Write down the ones you keep.
- **Push** delivery: the consumer gives the producer (or router) a callback endpoint — a webhook URI — rather than the producer calling a fixed consumer API. Callbacks change independently of the producer; avoid designs that force consumers to redeploy when the producer changes.
- **Thin events / reference payloads** (claim-check, general knowledge name): send metadata plus a URL to fetch the payload. Use when volume is high and consumers act on few events, or when events are broadcast widely but payload access must be authorised per consumer. Embed the payload when frequency is low or the consumer must act at once (saves a round trip, avoids a dependency on the producer's API being up, and avoids reading a newer state than the event describes).

### Event series
- **Log-based platforms** (Kafka, Pulsar, Kinesis, Event Hubs class) keep events in order per partition for a retention period; consumers track their own offsets and can rewind. Several consumers read the same topic at different positions. The log can act as a system of record (**event sourcing**: rebuild state by replaying an entity's events).
- Order matters for pattern detection (what sequence precedes an error or a purchase?) and for some ML features. Streaming SQL layers over logs save development time; a database alone is a poor trigger for "act on the latest anomaly".
- **Stateful stream processors** keep a live model of the domain (often digital twins with relationships) updated by the stream, and act on state changes, timers or queries. Fit when decisions need current state of many related entities (traffic, fleets, grids).

## Decision 3 — single action or workflow?
- **Single action**: one processor step per event (a function, one API call). Route with an **event router** (cloud event buses, Knative Eventing brokers/triggers) to a function or a queue feeding functions. Only requirement: the router and the function can read the envelope. Use a stateful processor instead if you must track entity state event by event.
- **Workflow**: several interdependent steps, possibly waiting for another event, a timer or a human (claims, triage, onboarding). Use a workflow/orchestration engine (cloud step-function services, Temporal-, Camunda-, Argo-class engines — examples, general knowledge). It separates the process definition from the actions, versions it, and lets third parties perform steps. For long cross-party processes use **sagas** with compensating actions rather than distributed transactions (general knowledge). Choose orchestration (central coordinator, clear visibility) or choreography (services react to each other's events, looser but harder to see end to end) deliberately.

Expect discrete push eventing to be the most common flow shape; design for it first.

## Delivery semantics (general knowledge — beyond the book)
- **Queue vs log**: a queue (RabbitMQ, SQS, AMQP brokers, JMS) removes a message once acknowledged and spreads work across competing consumers; a log retains events and each consumer group keeps its own position. Queues suit work distribution; logs suit fan-out, replay and series.
- **Guarantees**: at-most-once (may lose), at-least-once (may duplicate), exactly-once. Exactly-once exists only inside bounded systems (e.g., Kafka transactions within Kafka, or a processor with transactional sinks). End to end across organisations, assume **at-least-once** and make consumers **idempotent**: dedupe on event `id` (+ `source`), use natural idempotency keys, or make state updates commutative/upsert-based.
- **Ordering**: guaranteed only within a partition/key. Choose the partition key to match the entity whose order matters (order ID, account ID). Don't promise global order. Consumers should tolerate late and out-of-order events (event time vs processing time; watermarks for windows).
- **Dual-write problem**: writing to the database and publishing to the broker as two steps loses or invents events on failure. Use the **transactional outbox** (write the event to an outbox table in the same transaction; relay publishes it) or **change data capture** from the database log. Pair with the **inbox**/dedupe pattern on the consumer side.
- **Failure handling**: bounded retries with backoff, **dead-letter queues** with an owner and a replay procedure, poison-message detection, back-pressure or rate limits towards slow consumers.
- **Replay safety**: consumers must survive reprocessing; side effects (emails, payments) need idempotency keys.

## Control topologies
- **Centralised**: sources → (queue) → processing → sinks/consumers. Easy to see and operate; scaling means routing the right events to the right instances.
- **Distributed / edge**: decisions near the agents (store, plant, PoP), aggregates to the core. Lower latency, larger scale, harder global analytics.
- Large organisations: avoid a single central event bus that every team must go through (the old ESB trap). Prefer domain-owned platforms with shared standards and cross-domain observability.

## Design output hints
Name each event as a past-tense fact (`OrderPlaced`, `ShipmentDelayed`), give its key (ordering scope), owner, payload or reference, schema and version rule, delivery guarantee, retention, and the consumers' idempotency strategy.
