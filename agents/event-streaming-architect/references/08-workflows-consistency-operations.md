# Workflows, consistency, testing and operations

Use for the WORKFLOWS and TEST & DEPLOY fields in `design` and for the corresponding review areas. Process notation and BPMN engines belong to Ergane; business-level flow design across organisations belongs to Okeanos.

## 1. Workflows across services
A business process that spans services (order → payment → stock → dispatch) needs a coordination style.

### Choreography
Each service reacts to events from others and publishes its own; nobody holds the whole picture.
- Pros: loose coupling; services added without changing a coordinator; no central bottleneck.
- Cons: the process exists only implicitly across services; changing step order means changing several services; end-to-end monitoring needs correlation across streams; cyclic reactions are possible.
- Make it workable: a correlation ID on every event in the process; a **process-monitoring consumer** that materialises the state of each process instance from all relevant streams and alerts on stuck instances; document the choreography (event flow diagram) next to the code.
- Fit: short, stable processes with few steps and independent teams.

### Orchestration
A coordinator service owns the process: it sends commands (or calls) to workers and listens for their results, keeping per-instance state.
- **Event-driven orchestration**: the orchestrator publishes commands to worker streams and consumes result streams. Decoupled in time; workers scale independently; the orchestrator's state is materialised from its own events.
- **Direct-call orchestration**: the orchestrator calls workers synchronously (HTTP/gRPC). Simpler, immediate failures, but couples availability and needs retry logic.
- Pros: process visible and changeable in one place; easy to monitor; explicit error handling.
- Cons: the orchestrator is a dependency for every worker change in the process; risk of a "god service" that accumulates domain logic. Keep business rules in the workers; the orchestrator sequences.
- Fit: long or frequently changing processes, many steps, compliance visibility.
Workflow engines (Temporal, Camunda, cloud step-function services, Conductor-class) provide durable orchestration out of the box; when BPMN models or human tasks dominate, hand to Ergane.

### Distributed transactions and sagas
Two-phase commit across services and brokers is rarely available or wise. Use **sagas**: a sequence of local transactions, each publishing an event or result, with **compensating actions** to undo completed steps when a later step fails.
- **Choreographed saga**: each service listens for failure events and compensates itself.
- **Orchestrated saga**: the orchestrator triggers compensations in reverse order.
- Compensations are business actions, not database rollbacks ("refund payment", "release reservation", "send apology voucher"). Some actions cannot be undone (an email sent, goods shipped): order steps so irreversible ones come last, or design semantic compensations.
- Make every step and compensation **idempotent**; a retried compensation must not double-refund.
- Define timeouts per step and what happens when a worker never answers.
- Saga state must be durable and observable: which instances are pending, compensating, failed.

## 2. Eventual consistency
Every consumer lags the producer. Strategies:
1. **Prevent avoidable failures** that cause long divergence: schema validation at write, idempotent consumers, tested deployments, monitored lag.
2. **Prefer reading data products over synchronous calls** for other domains' data: a local copy is eventually consistent but available; a remote call is fresh but fragile. Choose per use case.
3. **Expose staleness**: APIs over materialised state can return the offset or event time they reflect, or a "processing" status after a write. UIs can show "updating…" rather than wrong data.
4. **Read-your-writes where needed**: return the write result directly to the caller, or have the client wait until the read model's position passes the write's offset.
5. **Plan for new services and reprocessing**: a new consumer bootstrapping from history will be far behind for a while; gate its go-live on caught-up lag.
6. **Align on time boundaries**: when combining products that update at different speeds (a daily batch product and a real-time stream), join on event-time windows and wait for both to pass the boundary before emitting final results.
7. **Handle out-of-order and late events** with versions, grace periods and corrections (`05`).
Define, per data product and per critical read model, the acceptable lag (SLO) and alert on breaches.

## 3. Testing event-driven services
### Unit tests
- **Stateless functions**: plain unit tests of transforms, filters and mappers.
- **Stateful functions**: test aggregators and joiners with an in-memory store; include duplicates, out-of-order, late and tombstone events.
- **Topology tests**: run the whole processing graph in a test driver with controlled time (Kafka Streams TopologyTestDriver, Flink MiniCluster / test harnesses). Assert on output streams and state.
### Schema tests
- Compatibility checks against the registry in CI (`03`).
- Round-trip tests: data written with old schema versions read by new code, and new data read by old consumer code where forward compatibility is promised.
### Integration tests
- **Local, in-process or containerised**: start a broker and registry in the test (embedded brokers or Testcontainers-style containers). Fast feedback on serialisation, configuration and connector behaviour.
- **Hosted services** that cannot run locally (cloud functions, managed queues): use emulators, simulators or mocks; accept lower fidelity.
- **Full remote integration**: a temporary, programmatically created environment per test run (best isolation, highest cost); a shared integration environment (cheaper, but tests interfere and data drifts); or carefully controlled tests in production (synthetic events with test markers, dark launches; highest fidelity, needs strict isolation of side effects).
- Seed integration environments with realistic, anonymised event history, including edge cases.
### Contract and replay tests
- Consumer-driven contract tests for event schemas and semantics (Pact supports message contracts).
- Replay a slice of production history through a new version and diff its outputs against the current version before cut-over.

## 4. Deploying event-driven services
Principles: each service deploys independently; deployments are automated (CI/CD); a deploy must not corrupt state or outputs; rollback must be possible or forward-fix must be fast.
| Pattern | How | Use when |
|---|---|---|
| **Full stop** | Stop all instances, deploy, start | State migrations or topology changes that cannot run mixed; acceptable downtime/lag |
| **Rolling update** | Replace instances one by one | Compatible changes; no topology or state-format change |
| **Blue-green** | Run the new version alongside (new consumer group, new state stores, new output stream version), switch consumers or traffic when caught up | Changes in logic or state; safe rollback by switching back |
| **Breaking schema change via two streams, eventual migration** | Producer publishes v1 and v2 in parallel; consumers move at their own pace; v1 retired later | Many consumers, independent teams |
| **Breaking schema change, synchronised migration** | Producer and all consumers switch to v2 together in a coordinated release | Few consumers, tight coupling acceptable, dual publishing too costly |
Notes:
- Topology changes in embedded stream frameworks (new operators, renamed stores) can invalidate state and internal stream names; deploy as a new application ID with rebuild, or use savepoint-compatible operator IDs in Flink-class frameworks.
- Reset tooling (offsets to a timestamp, state wipe) must be scripted and permissioned.
- Canary by partition subset is possible but complicates state; prefer blue-green for stateful services.

## 5. Supportive tooling and operations
The platform should provide (`09` covers the data-product layer):
- **Ownership registry**: every service and stream mapped to a team.
- **Self-service stream creation** with naming rules, partitions, retention, metadata tags and quotas, through code (GitOps) rather than tickets.
- **Schema registry** with change notifications.
- **Access control** per stream (read/write ACLs per service identity).
- **Offset and state management**: inspect, reset, rewind; delete or rebuild state stores; safe application reset.
- **Consumer-lag monitoring** per group and partition, with alerts on growth and on silence (no events when some are expected).
- **Quotas** to protect the broker from noisy producers and consumers.
- **Container or function platform** with standard templates for new services (one-command service bootstrap with logging, metrics, tracing, DLQ wiring).
- **Cluster management**: programmatic creation of brokers, compute and tooling; cross-cluster replication.
- **Dependency tracking and topology visualisation**: who produces and consumes what, generated from ACLs, consumer groups and lineage, not drawn by hand.
- **Distributed tracing** through streams (propagate trace context in headers; OpenTelemetry has messaging conventions).
Runbooks per service: lag spike, poison event, rebuild state, reprocess, failover.

## Review checks
- Is each cross-service process's coordination style explicit? Monitored per instance?
- Sagas: compensations defined, idempotent, ordered? Timeouts?
- Consistency: lag SLOs, staleness exposed, read-your-writes handled where users need it?
- Test layers present: unit, topology, schema, integration, replay?
- Deployment pattern fits the change type? Blue-green or rebuild path for stateful services?
- Tooling: lag alerts, reset tooling, ACLs, ownership, topology view?

## Example (invented)
A car-rental firm's booking process: reserve vehicle → authorise card → confirm → assign at pickup. Five teams, steps change often for promotions. Design: event-driven orchestration by a Booking Process service publishing commands to `fleet.reserve-vehicle` and `payments.authorise-card`, consuming result streams, with an orchestrated saga: if authorisation fails, it commands `fleet.release-vehicle`. Booking state is materialised and exposed to the call centre with an "as of" timestamp. Deployment of the orchestrator is blue-green with a new consumer group; in-flight instances finish on blue.
