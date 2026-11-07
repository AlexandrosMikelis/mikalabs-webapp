# Okeanos — Event Flow Architect by MIKA Labs

An architect for event-driven, real-time integration between systems and between organisations, for people and for other AI agents. Named after the world-encircling river of Greek myth. Works with any capable LLM: ChatGPT, Gemini, Copilot, Claude, Mistral, local models and any API or agent framework. Free to download and use.

**Tier: worker.** It does one specialist job and returns a structured result, so it can be called directly by people or by higher-level orchestrator agents.

## What it does
- **Assesses** a business or process for event integration opportunities: which state changes are worth publishing, to whom, how urgently, scored on MIKA's event case ledger; what stays as API, file or batch; and the smallest pilot your readiness allows.
- **Designs** an event-driven integration: the four-axis shape code (direction · intent · payload · latency), event names and keys, CloudEvents envelope and AsyncAPI contract, delivery guarantees, idempotency, retention, trust controls for the boundary crossed, and the right technology class.
- **Reviews** an existing event or streaming architecture and returns findings rated Critical/High/Medium/Low, each with its basis and a concrete fix, plus a verdict (Proceed / Proceed with conditions / Redesign / Do not proceed).
- **Answers** questions: queue vs log, exactly-once, outbox, schema change rules, webhooks vs brokers, CloudEvents attributes, AsyncAPI, signing webhooks.

## How to use it
**As a person**: describe the business, the system or ask the question. Examples:
- "Assess: we run a network of 30 veterinary clinics; lab results are checked on a portal and owners phone for news."
- "Design: push sailing delays and cancellations from our ferry control room to the port, the bus operator and travel agents."
- "Review: our energy co-op's meter service saves readings to Postgres, then publishes to Kafka; two aggregators read the same topic."
- "When should I use a log instead of a queue?"

**From another agent**: send the request with optional headers:
```
MODE: review
FORMAT: structured
CONTEXT: community energy, EU, two external aggregators, ~2k events/s peak
<architecture description>
```
With `FORMAT: structured`, assess, design and review results come back as JSON. It never waits for answers: it states its assumptions and lists the open questions that would change a rating.

## What it's built on
Open standards and established practice: CloudEvents 1.0, AsyncAPI 3, MQTT 5, AMQP 1.0, Standard Webhooks, HTTP Message Signatures, W3C Trace Context and OpenTelemetry messaging conventions, log and queue semantics, delivery guarantees, outbox and change data capture, idempotent consumers, schema registries, EventStorming — plus MIKA's own instruments: boundary grades, the event case ledger, the readiness score and the shape code. For strategy questions it can also apply optional lenses such as Wardley Maps, a promise check or a DDD context map.

## Limits
- **Architecture advice, not vendor selection.** Products are named as examples of technology classes; verify current versions, pricing and support.
- Standards and products were checked in November 2026; they move, so re-verify for decisions that depend on specific versions or features.
- It works from what you describe. A vague description gets an answer full of assumptions; give it the producers, consumers, volumes, latency need and boundaries crossed.
- It doesn't run, test or load-test your systems, and doesn't replace security or legal review of cross-organisation data sharing.
- Provided as is, without warranty. You are responsible for the decisions you make with it.

## Install
See **`INSTALL.md`** for step-by-step setup in ChatGPT, Gemini, Copilot, Claude, Mistral, local models and APIs. In short:
- **Instructions**: `system-prompt.md` (paste into any tool's instructions / system prompt field).
- **Knowledge**: the 11 files in `references/` (upload as knowledge files).
- **One file only?** Use `event-flow-architect-all-in-one.md`.

## Maintenance
Re-check `references/08-standards-and-technology.md` each half-year and after major releases of CloudEvents, AsyncAPI or the main streaming platforms.

---
MIKA Labs · mikalaboratories.com · info@mikalaboratories.com

Independent work by MIKA Labs, written in its own words.
