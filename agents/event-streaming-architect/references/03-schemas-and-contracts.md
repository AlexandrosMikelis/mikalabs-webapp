# Schemas and contracts

Use for the SCHEMAS and DATA PRODUCTS fields in `design`, and for contract findings in `review`. In an event-driven system the schema is the contract between a producer and consumers it may never meet. Treat it as an API with a lifecycle.

## 1. Why explicit schemas
Implicit contracts ("it's JSON, look at a sample") push interpretation onto every consumer, so each one guesses differently and breaks differently. Explicit schemas give:
- validation at write time, so bad data never enters the stream;
- generated code and types for producers and consumers;
- documentation in one place (field comments describe meaning, units, allowed values, null semantics);
- machine-checked compatibility rules, so a change that would break readers is rejected before deployment.
"Schema on read" (dump raw data, let consumers figure it out) shifts cost downstream and multiplies it by the number of consumers. For shared streams, use **schema on write**.

## 2. Format options
| Format | Strengths | Weaknesses | Typical fit |
|---|---|---|---|
| **Apache Avro** | Compact binary; schema resolution rules well defined; strong registry support; schemas as JSON documents | Needs the writer schema to read (registry); less natural for hand-written JSON tooling | Kafka-family data products, analytics pipelines |
| **Protocol Buffers** | Compact; fast; field numbers make evolution explicit; excellent multi-language code generation; well known to service teams | No required fields in proto3; default values hide "unset"; maps and one-of need care | Service-to-service events, gRPC-heavy organisations |
| **JSON Schema** | Human-readable payloads; universal tooling; easy for web and low-code consumers | Verbose; evolution semantics weaker and easy to get wrong (open vs closed content models); validation cost | Lower-volume streams, external edges, teams new to schemas |

Selection criteria: the organisation's languages and code-generation needs, evolution guarantees, registry support, payload size and throughput, analytics-tool compatibility, and team familiarity. Pick **one primary format** per organisation (governance, `09`) and allow exceptions only with reason. Plain unschematised JSON or CSV is not acceptable for a shared stream.

## 3. Compatibility and evolution
Schemas change; the question is whether existing readers and writers keep working.
| Mode | Guarantee | Allowed changes (typical) | Deploy order |
|---|---|---|---|
| **Backward** | New readers can read data written with the previous schema | Remove fields; add optional fields with defaults | Upgrade consumers first |
| **Forward** | Old readers can read data written with the new schema | Add fields; remove optional fields with defaults | Upgrade producers first |
| **Full** | Both | Add or remove optional fields with defaults only | Any order |
| **Transitive** variants | The guarantee holds against *all* previous versions, not just the last | Same, stricter | Needed when consumers may replay old data |

Recommendations:
- For data products that consumers replay from the beginning, use **full transitive** or at least **backward transitive** compatibility, so the newest reader can process the oldest event.
- Every new field gets a sensible default and a documented meaning for "absent".
- Renaming is a remove plus an add; use aliases where the format supports them.
- Changing a field's type or meaning, changing the key, or tightening optional to required are **breaking**.
- Never reuse a removed field's name or number for something else.

## 4. The schema registry
A registry stores every version of every schema, assigns IDs, and enforces compatibility per subject (usually per stream value and per stream key). Producers serialise with a schema ID in the record; consumers fetch the writer schema by ID.
Practices:
- **Register schemas in CI**, not at runtime by whichever producer starts first. Disable automatic registration in production clients.
- Keep schemas in the **producer's repository** (or a shared schema repository with clear ownership), versioned with the code, reviewed like an API.
- Run **compatibility checks in the build** against the registry, failing the pipeline on breaking changes.
- Publish schema-change notifications so consumers see new versions coming (`08` tooling).
- Key schemas matter as much as value schemas: changing the key breaks partitioning and compaction.
Examples of registries: Confluent Schema Registry, Apicurio, AWS Glue Schema Registry, Karapace (check licences and features).

## 5. Negotiating a breaking change
Sometimes the model is simply wrong and must change incompatibly. Treat this as a migration project, not a deploy.
1. **Design the new model** with the owning team and record why the old one fails.
2. **Iterate with known consumers** and the governance group (`09`): who reads the stream, what they need, what it costs them to move.
3. **Plan the release**: a new stream (e.g. `.v2`), a data migration plan (do you backfill history into v2, and how?), a dual-publishing period, a deprecation date for v1 and a communication plan.
4. **Execute**: publish v1 and v2 in parallel (from the same source of truth, so they agree); consumers migrate on their own schedule; monitor v1 consumer lag and offsets to see who is still reading; retire v1 after the date.
Deployment patterns for this are in `08` ("eventual migration via two streams" and "synchronised migration").
Avoid versioning by headers inside one stream for breaking changes: consumers cannot tell from the stream name what they are reading, compaction mixes versions, and replay becomes a minefield.

## 6. Data contracts
A data contract is the **schema plus the promises around it**. For a data product (aligning with the data-as-a-product principle):
- schema and compatibility mode;
- semantics: field meanings, units, time zone, null rules, allowed values, keys and their uniqueness;
- quality expectations: completeness, validity rules, freshness/latency SLO, expected volume range;
- ownership: team, contact, escalation route;
- lifecycle: version, deprecation policy, notice periods for breaking change;
- access and classification: personal data, sensitivity, permitted purposes;
- lineage: upstream sources (`09`).
Keep the contract machine-readable where possible (schema plus metadata in the catalogue or a YAML descriptor alongside the code). Open specifications for contract descriptors exist (e.g. the Open Data Contract Standard and AsyncAPI for channel descriptions; check current versions). Enforce what can be enforced in CI and in the producer (schema validation, data-quality checks before publish); monitor the rest.

## 7. Envelopes and CloudEvents
CloudEvents (a CNCF specification, version 1.0.x) standardises event metadata: `id`, `source`, `specversion`, `type`, plus optional `time`, `subject`, `datacontenttype`, `dataschema`. It has bindings for Kafka, HTTP, AMQP, MQTT and others, carrying attributes as headers.
- Inside a Kafka-centric organisation, a registry-backed value schema plus standard headers often suffices; CloudEvents adds portability when events cross brokers, clouds or reach HTTP-based consumers.
- Whatever envelope you choose, govern the core metadata: unique event ID, producer identity, event time, schema reference, correlation/causation IDs, trace context.
- Do not wrap a registry-encoded payload in a JSON envelope inside the value; use the binary/structured mode the binding defines.

## 8. Schemas in the codebase
- Generate classes from schemas; do not hand-write mirror classes.
- Keep the public schema separate from internal persistence models; map explicitly (an anti-corruption layer). Internal refactors then cannot break consumers.
- Add schema-evolution tests: serialise with old schema versions, deserialise with the new code, and the reverse (`08`).
- Document each field in the schema itself (doc comments are part of the contract).

## 9. Review checks
- Is every shared stream schematised with a registered schema and an enforced compatibility mode?
- Are key schemas registered and protected?
- Does compatibility match replay needs (transitive where consumers replay)?
- Is auto-registration disabled in production?
- Is there a documented breaking-change path and has it been used?
- Do contracts cover semantics, quality and ownership, not just types?
- Are internal tables (CDC output) leaking as the published contract? (`07`)

## Example (invented)
An insurer's Policy domain publishes `policy-state` in Protobuf with full-transitive compatibility. A team wants to change `premium` from a float to a decimal with currency. That is breaking: they create `policy-state.v2` with `premium_minor_units` and `currency`, dual-publish from the policy table's outbox for three months, notify the four consuming teams through the catalogue, watch v1 consumer lag drop to zero readers, then retire v1. The v2 history is backfilled from the policy snapshot so new consumers can start from the beginning.
