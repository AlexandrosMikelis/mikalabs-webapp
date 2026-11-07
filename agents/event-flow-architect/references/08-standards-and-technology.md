# 08 · Standards and technology classes

Checked against public specifications and project documentation in November 2026 (2026-11). Products are examples of technology classes, not recommendations. Versions, features and pricing change; verify before deciding.

## Which open standards matter, and where do they sit?
| Concern | Standard | Steward | Status at check | Notes |
|---|---|---|---|---|
| Event envelope | **CloudEvents 1.0** (patch 1.0.2) | CNCF (graduated Jan 2024) | Stable | Protocol bindings and event formats listed in `07` |
| Channel contract | **AsyncAPI 3.x** | AsyncAPI Initiative (Linux Foundation) | 3.0 released Dec 2023 | Channels, operations, bindings (`07`) |
| Registry / discovery | **xRegistry** | CNCF (from CloudEvents work) | Maturing — check | Endpoints, message definitions, schema registries |
| Device and edge pub/sub | **MQTT 5.0** (also 3.1.1) | OASIS; 3.1.1 also ISO/IEC 20922 | Stable | QoS 0/1/2, retained messages, shared subscriptions, message expiry, user properties, request/response via response topic and correlation data, reason codes |
| Enterprise messaging wire protocol | **AMQP 1.0** | OASIS; ISO/IEC 19464 | Stable | Immutable bare message, rich delivery states, link credit flow control |
| HTTP semantics | RFC 9110; HTTP/2 RFC 9113; HTTP/3 RFC 9114 over QUIC (RFC 9000) | IETF | Stable | HTTP/3 avoids transport-level head-of-line blocking across streams |
| Webhooks | **Standard Webhooks** specification | Open community spec | Stable conventions | `webhook-id`, `webhook-timestamp`, `webhook-signature` headers; symmetric (HMAC-SHA256) or asymmetric (Ed25519) signatures |
| Message signing over HTTP | RFC 9421 HTTP Message Signatures | IETF (Feb 2024) | Stable | General-purpose alternative to bespoke signature headers |
| Trace propagation | **W3C Trace Context** | W3C Recommendation | Stable | `traceparent`/`tracestate`; CloudEvents tracing extension carries them in events |
| Telemetry naming | **OpenTelemetry messaging semantic conventions** | CNCF OpenTelemetry | Check stability level | Span and metric attributes such as `messaging.system`, `messaging.destination.name` |
| Server push to browsers | WebSocket (RFC 6455); Server-Sent Events (WHATWG HTML) | IETF / WHATWG | Stable | Long-lived connections; need resume logic |

## Protocols at a glance
| Protocol | Character | Reach for it when |
|---|---|---|
| HTTP webhooks | Push to consumer callback URLs | B2 partners, modest volume, firewall-friendly delivery |
| MQTT 5 | Lightweight broker pub/sub, small headers | Meters, batteries, vehicles, constrained networks |
| AMQP 1.0 | Interoperable broker messaging with delivery states | Enterprise queues, cross-vendor brokers |
| Kafka protocol | Partitioned, replayable log; many compatible implementations | Ordered streams, replay, high fan-out inside an organisation |
| NATS (with JetStream) | Subject-based pub/sub; optional persistence | Lightweight multi-site and edge meshes |
| gRPC streaming | HTTP/2 bidirectional streams, Protobuf | Internal service-to-service streams |
| WebSocket / SSE | Held connection to clients | Live UIs and dashboards |

## Technology classes
| Class | Examples (not endorsements) | Typical role | Fits |
|---|---|---|---|
| Message broker / queue | RabbitMQ 4.x (native AMQP 1.0, quorum queues, streams), ActiveMQ Artemis, IBM MQ, cloud queue services | Store and forward, work sharing | Commands, Exchange steps, decoupled workers |
| Partitioned log | Apache Kafka 4.x (KRaft only since 4.0, Mar 2025) and compatible services, Apache Pulsar, cloud log services | Durable ordered streams | Facts for many readers, sequences, replay |
| Event router | Cloud provider event routers (e.g., Google Eventarc), CloudEvents-aware gateways | Filter and route by envelope | Single-step reactions, SaaS event intake |
| Functions | Cloud functions services, OpenFaaS-class | One reaction per event | D5 single step |
| Workflow engine | Temporal, Camunda, AWS Step Functions, Argo Workflows | Long-running state, sagas, human tasks | D5 multi-step |
| Stream processor | Apache Flink, Kafka Streams, Apache Beam | Windows, joins, enrichment, stateful models | Sequences, live entity models |
| IoT / MQTT broker | Eclipse Mosquitto, HiveMQ, EMQX, cloud IoT hubs | Device connectivity | ⚑ Churn, fleets |
| Event mesh | Solace PubSub+, NATS superclusters | Multi-site distribution | Tiered and regional designs (D6) |
| Integration platform (iPaaS / ESB) | Commercial connector platforms | Prebuilt connectors and mapping | Stable app-to-app links; watch for central bottlenecks and lock-in to the vendor's extension points |
| Schema registry | Apicurio Registry, Confluent Schema Registry, cloud registries | Schema versions and compatibility | Every channel at B1+ |

## How should a technology be evaluated?
Score each criterion Fit / Partial / Gap for the specific shape code, not in general.
1. **Semantics match** — queue vs log, ordering scope, retention and replay, dead-lettering, back-pressure (`06`).
2. **Shape match** — handles the direction, payload style and latency class from `04`.
3. **Scale and geography** — throughput, partitions, fan-out, geo-replication, edge options, measured tail latency.
4. **Openness** — open protocol, CloudEvents binding, AsyncAPI support, exit path from provider-specific event shapes.
5. **Trust controls** — mTLS/OAuth, per-channel permissions, encryption at rest, support for opaque encrypted content, audit logs, partner isolation.
6. **Operability** — lag, rate and error metrics, trace propagation, quotas, self-service channel creation.
7. **Partner readiness** — onboarding, entitlements, metering hooks, catalogue integration.
8. **Run model and cost** — managed vs self-run, skills available, price at expected volume, exit cost.
9. **Project health** — release cadence, community, vendor viability.
Rule: rent commodity plumbing; spend custom effort on domain logic and contracts.

## Maintenance
Re-check this file every six months and after major releases of CloudEvents, AsyncAPI, Kafka, MQTT brokers or OpenTelemetry semantic conventions.
