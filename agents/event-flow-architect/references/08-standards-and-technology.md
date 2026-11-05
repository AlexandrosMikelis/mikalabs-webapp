# Standards and technology evaluation

Checked against public specifications on 1 Nov 2026 (general knowledge beyond the flow literature unless noted). Products are examples of technology classes, not recommendations; verify versions and support before deciding. Vendor surveys from 2021 are dated — use the criteria, not the lists.

## CloudEvents 1.0 (CNCF, graduated)
A common **envelope** for event metadata, independent of transport. Strongest candidate for the flow metadata layer.
- **Required attributes**: `id` (unique within the source), `source` (URI-reference identifying the context that produced it), `specversion` ("1.0"), `type` (reverse-DNS style, e.g. `com.acme.shipment.delayed.v1`).
- **Optional**: `datacontenttype`, `dataschema`, `subject` (the thing the event is about, within the source), `time` (RFC 3339). Plus `data` (the payload).
- **Extensions** (custom attributes, lower-case alphanumerics); documented ones include distributed tracing, partitioning (`partitionkey`), sequence, dataref (claim-check reference), authcontext.
- **Modes**: *binary* (attributes in transport headers, payload as body — efficient, payload untouched) and *structured* (whole event as one document, e.g. `application/cloudevents+json`); *batch* in some bindings.
- **Bindings** for HTTP, Kafka, AMQP, MQTT, NATS, WebSockets and others; formats JSON, Avro, Protobuf, XML.
- Dedupe key: `source` + `id`. Encryption of payloads is left to the user.
- Related CNCF work: subscriptions and discovery APIs and **xRegistry** (registry of endpoints, message definitions and schemas) — still maturing; check status before relying on them.

## AsyncAPI 3.0
Machine-readable **contract** for event-driven APIs, the async counterpart to OpenAPI.
- Core objects: `info`, `servers` (brokers/endpoints + protocol), `channels` (addresses/topics with their messages), `operations` (`send` or `receive` on a channel, from the application's point of view), `components` (reusable messages, schemas, security schemes), protocol **bindings** (Kafka, AMQP, MQTT, WebSockets, HTTP, …).
- 3.0 separates channels from operations and supports request/reply. Payload schemas can be JSON Schema, Avro, etc. CloudEvents can be described as message headers/traits.
- Use it to publish partner-facing streams, generate docs and code, and validate in CI.

## Transport and messaging protocols
| Protocol | Character | Use when |
|---|---|---|
| **MQTT** (OASIS; 3.1.1 and 5.0) | Lightweight pub/sub via broker; topics; QoS 0/1/2; retained messages; v5 adds user properties, shared subscriptions, expiry | Devices, constrained networks, many publishers |
| **AMQP 1.0** (OASIS/ISO) | Wire-level messaging; immutable message body; rich delivery states | Enterprise messaging, cross-vendor brokers |
| **HTTP** + **webhooks** | Request–response; push via consumer callback URIs | Low-friction partner push; firewall-friendly. Sign deliveries; retry with backoff; consider the Standard Webhooks spec conventions |
| **WebSocket** / **Server-Sent Events** | Long-lived connection; WebSocket two-way, SSE server → client | Browsers, live UIs, simple streaming to partners |
| **gRPC streaming** | HTTP/2 bidirectional streams with Protobuf | Internal service-to-service streams |
| **Kafka protocol** | De-facto log protocol, many compatible implementations | Ordered, replayable streams; internal backbone |
| **NATS** | Subject-based pub/sub, JetStream persistence | Lightweight, multi-cloud/edge meshes |
HTTP/3 over QUIC reduces head-of-line blocking for multiplexed streams.

## Schema management
- **Schema registry** (Confluent-, Apicurio-, cloud-native-class): stores versions, enforces compatibility (backward, forward, full, none; transitive variants). Distinguish from a **stream registry/catalogue**, which says which streams exist, where, at what volume, under what terms — a schema registry alone doesn't provide discovery.
- Formats: JSON Schema (readable, weaker evolution discipline), Avro (compact, strong evolution rules), Protobuf (compact, field numbers).

## Technology classes (map to value-chain components)
| Class | Examples | Component(s) | Fits |
|---|---|---|---|
| Message queue / broker | RabbitMQ, ActiveMQ/Artemis, IBM MQ, SQS, Service Bus | Queue | Work distribution, commands, messaging conversations |
| Enterprise service bus / iPaaS | MuleSoft, Boomi-class | Queue + Processor (connectors, transforms) | Stable app-to-app integration; beware contextual lock-in and central bottlenecks |
| Log-based streaming | Kafka (and compatible), Pulsar, Kinesis, Event Hubs | Queue + Processor | Fan-out, replay, series, event sourcing |
| Event router / bus | EventBridge, Eventarc, Event Grid, Knative Eventing | Interface + routing | Discrete events to functions, SaaS event intake |
| Functions / serverless | Lambda, Azure Functions, Cloud Run functions | Processor | Single actions per event |
| Workflow engine | Step Functions, Logic Apps, Temporal, Camunda, Argo | Processor | Multi-step, long-running, human steps, sagas |
| Stream processor | Flink, Kafka Streams, Spark Structured Streaming, Beam | Processor | Windows, joins, aggregations, enrichment |
| Stateful / digital-twin processor | Flink stateful functions, twin platforms | Processor | Live model of many related entities |
| IoT broker | MQTT brokers (Mosquitto, HiveMQ, EMQX), cloud IoT hubs | Queue + Interface | Device fleets |
| Event mesh / global messaging | Solace, NATS-based utilities | Queue + Interface | Multi-site, edge-to-core distribution |
| Low-code event platforms | Various | Processor | Visual event logic; check that it is truly event-native |

## Evaluation criteria (use in design and review)
1. **Fit to classification**: messaging vs eventing, discrete vs series, single action vs workflow (`05`).
2. **Semantics**: delivery guarantee, ordering scope, retention and replay, consumer groups, dead-lettering, back-pressure.
3. **Scale and latency**: throughput, partitions/fan-out, geo-replication, edge options, measured tail latency.
4. **Openness**: open protocol or de-facto standard; CloudEvents binding; AsyncAPI support; portability out of one cloud's event shapes.
5. **Security**: mTLS/OAuth, per-topic ACLs, encryption at rest and payload, key management, audit logging, multi-tenancy isolation for partners.
6. **Manageability**: metrics (lag, rate, errors), tracing propagation, schema registry, self-service subscription, quotas.
7. **Cross-org readiness**: partner onboarding, entitlements, metering/billing hooks, discovery/catalogue.
8. **Operations and cost**: managed vs self-run, skills available, pricing model at expected volume, lock-in exit cost.
9. **Maturity**: community, release cadence, vendor viability. Prefer commodity components for plumbing; spend custom effort on domain processing.
