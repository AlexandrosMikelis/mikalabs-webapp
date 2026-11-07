# 07 · Contracts, envelopes and schemas

An event that crosses a boundary is an interface. Consumers will build on every field, so the producer needs three things written down: the **envelope** (context every event carries), the **data schema** (domain content and how it may change), and the **channel contract** (where events are sent, how to connect, with what promises).

## Why separate envelope from data?
Routers, gateways, auditors and observability tools need to know what an event is, where it came from and when — without understanding the domain. Domain consumers need the content. Keeping the two apart means intermediaries can route, filter, trace and even carry encrypted content without parsing it, and the domain schema can evolve on its own schedule. Standardise the envelope now; let data schemas start per stream and converge on industry formats where they exist.

## The envelope: CloudEvents 1.0
CloudEvents (CNCF, graduated project; spec version string `"1.0"`, current patch release 1.0.2) defines the envelope attributes. Okeanos uses it as the default at B1 and above.

| Attribute | Required | Meaning | House example |
|---|---|---|---|
| `id` | yes | Unique within the `source` | `9f1c…` |
| `source` | yes | URI-reference for the context that produced the event | `https://ops.ferry.example/control-room` |
| `specversion` | yes | `"1.0"` | |
| `type` | yes | Kind of occurrence, reverse-DNS by convention | `example.ferry.sailing.cancelled.v1` |
| `subject` | no | What the event is about, within the source | `sailing/2026-11-07/ARD-0815` |
| `time` | no | When it happened (RFC 3339) | `2026-11-07T06:42:10Z` |
| `datacontenttype` | no | Media type of `data` | `application/json` |
| `dataschema` | no | URI of the schema `data` follows | registry URL |

**Extensions** add attributes (lower-case alphanumeric names). Documented extensions worth knowing: distributed tracing (`traceparent`, `tracestate`), partitioning (`partitionkey`), sequence (`sequence`), dataref (a reference for signal events), and authcontext (who caused the event). Define your own sparingly and register them in the contract.

**Content modes**: *binary* — attributes in protocol headers, `data` as the body (efficient; body untouched, so encrypted content passes through); *structured* — the whole event as one document, e.g. `application/cloudevents+json`; some bindings also define *batched* mode.

**Protocol bindings** map attributes onto HTTP, Kafka, NATS, MQTT, AMQP and WebSockets, among others; **event formats** exist for JSON, Avro, Protobuf and XML. A gateway can therefore move an event from an MQTT device to a Kafka topic to a partner webhook without changing its identity.

CloudEvents deliberately leaves payload encryption and signing to the user (`09`).

## The data schema
- **Formats**: JSON Schema (readable, permissive), Avro (compact, explicit evolution rules), Protobuf (compact, numbered fields). Pick per channel; do not mix within one event type.
- **Registry**: store each version and enforce a compatibility mode (backward, forward, full, or none; transitive variants check against all earlier versions). A schema registry tells you what an event looks like; it does not tell you which streams exist or who may read them — that is a catalogue (below).
- **Industry formats**: prefer them where a domain has one. Public-transport disruption data has CEN's SIRI (Situation Exchange) and timetable formats NeTEx and GTFS; energy has IEC Common Information Model profiles. Inventing a private format where an industry one exists raises every partner's cost.

### MIKA change rules
| Change | Allowed without a new event type version? |
|---|---|
| Add an optional field | Yes |
| Add an enum value | Only if consumers were told to tolerate unknown values |
| Make an optional field required | No |
| Rename, retype or remove a field | No |
| Change a field's meaning | Never in place — new field or new version |

Version in the `type` (`…cancelled.v2`) when meaning changes; publish old and new in parallel for an announced migration window; retire the old type only when the catalogue shows no active consumers.

## Naming
- Event names are past-tense facts in domain language: `LabResultValidated`, `SailingCancelled`, `MeterReadingRecorded`. Avoid CRUD names (`ResultUpdated`) that hide what happened.
- `type` = organisation prefix + domain + entity + fact + version.
- `source` identifies a producing context, not a host name that will change.
- Never expose internal table or class names at B2+; publish a curated external event and translate at the boundary.

## The channel contract: AsyncAPI 3
AsyncAPI is a machine-readable description for event-driven interfaces, the asynchronous counterpart to OpenAPI. Version 3.0 (released December 2023) is the current major line; check for later 3.x minor releases.
- `info` — title, version, owner, terms.
- `servers` — broker or endpoint hosts with protocol and security.
- `channels` — addresses (topics, subjects, queues, webhook paths) and the messages they carry.
- `operations` — `send` or `receive` on a channel, from the described application's viewpoint; `reply` for request/reply.
- `components` — reusable messages, schemas (JSON Schema, Avro and others), security schemes, traits.
- **bindings** — protocol-specific settings (Kafka, HTTP, NATS, MQTT, Solace, AMQP and others).
CloudEvents attributes can be described as message headers or a reusable message trait. Use AsyncAPI documents to publish partner contracts, generate documentation and code, and check messages in CI.

## How do consumers find streams? (catalogue and registry)
Large estates need a **catalogue**: which event types exist, who owns them, where they are served, at what volume, under what terms, and who consumes them. Options:
- **xRegistry** — a CNCF specification family, grown out of CloudEvents' discovery and subscription work, for registries of endpoints, message definitions and schemas. Check its release status before relying on it.
- An AsyncAPI document set published in a developer portal.
- The knowledge graph from `01`, which already links event types, channels, contracts and consumers.

## Contract checklist (B2 and above)
1. CloudEvents envelope with `subject` and `time` set.
2. Registered schema with a stated compatibility mode.
3. AsyncAPI document listing channels, operations, security and bindings.
4. Promise sheet from `06` (delivery, identity, ordering, retention, failure).
5. Usage terms and access process from `09`.
6. Deprecation policy and a named owner.
For deep review of request–response APIs that sit alongside the events, hand over to `api-design-reviewer`.
