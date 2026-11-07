# Nereus — Event Streaming Architect by MIKA Labs

An architect for event streaming and shared streaming data products inside a company, for people and for other AI agents. Named after the old sea god of Greek myth who knew every current of the deep. Works with any capable LLM: ChatGPT, Gemini, Copilot, Claude, Mistral, local models and any API or agent framework. Free to download and use.

**Tier: worker.** It does one specialist job and returns a structured result, so it can be called directly by people or by higher-level orchestrator agents.

## What it does
- **Designs** event-driven microservices and streaming data products: event payload profiles (full-picture, change-only, readings, pings, commands), streams and their keys and partitions, schemas and compatibility rules, stateless and stateful processing, CDC vs outbox, choreography vs orchestration and sagas, data-product contracts, governance and the self-serve platform, plus how to test and deploy it all.
- **Reviews** an existing streaming or data mesh design and returns findings rated Critical/High/Medium/Low, each with its basis and a concrete fix, plus a verdict (Proceed / Proceed with conditions / Redesign / Do not proceed).
- **Answers** questions: exactly-once and where it stops, ordering and co-partitioning, event time and late data, reprocessing, state stores, schema compatibility modes, crypto-shredding, data product tiers and platform capability scores, Kafka Streams vs Flink vs functions.

It stays inside one organisation. For where real-time flow pays off in the business, and for event integration with partners and customers, use **Okeanos** (Event Flow Architect). For domain modelling use **Gaia**; for BPMN and process engines use **Ergane**.

## How to use it
**As a person**: describe the system or ask the question. Examples:
- "Design: our claims, policy and billing services share one Postgres; we want each to own its data and publish streams that analytics can use too."
- "Review: Orders writes to MySQL and then publishes to Kafka; three teams consume the Debezium topics of the orders tables directly."
- "Why does my Kafka Streams join miss events?"
- "Should our member data product carry full-picture events or change-only events?"

**From another agent**: send the request with optional headers:
```
MODE: review
FORMAT: structured
CONTEXT: retail, 14 domains, Kafka on a managed service, ~30k events/s peak
<design description>
```
With `FORMAT: structured`, design and review results come back as JSON. It never waits for answers: it states its assumptions and lists the open questions that would change a rating.

## What it's built on
Widely used open practice: the data-mesh principles published on martinfowler.com, domain-driven design, log-based brokers (Kafka, Pulsar, Kinesis as examples), Kafka Streams- and Flink-class processing, Debezium-class change-data capture, the transactional outbox, schema registries with Avro, Protobuf and JSON Schema, CloudEvents 1.0, AsyncAPI, data contracts (Open Data Contract Standard) and OpenLineage.

## Limits
- **Architecture advice, not vendor selection.** Products are named as examples; verify current versions, features, licences and pricing.
- Product facts were checked against general public knowledge in Nov 2026; they move, so re-verify for decisions that depend on specific features.
- It works from what you describe. Give it domains, streams, keys, volumes, latency needs and how data is produced today.
- It doesn't run, test or load-test your systems, and doesn't replace security, privacy or legal review.
- Provided as is, without warranty. You are responsible for the decisions you make with it.

## Install
See **`INSTALL.md`** for step-by-step setup in ChatGPT, Gemini, Copilot, Claude, Mistral, local models and APIs. In short:
- **Instructions**: `system-prompt.md` (paste into any tool's instructions / system prompt field).
- **Knowledge**: the 10 files in `references/` (upload as knowledge files).
- **One file only?** Use `event-streaming-architect-all-in-one.md`.

## Maintenance
Re-check the product notes in `references/03`, `06` and `09` each half-year and after major releases of the main brokers, stream processors and schema tooling.

---
MIKA Labs · mikalaboratories.com · info@mikalaboratories.com

Independent work, written by MIKA Labs in its own words.
