# Okeanos — Event Flow Architect by MIKA Labs

An architect for event-driven, real-time integration between systems and organisations ("flow"), for people and for other AI agents. Named after the world-encircling river of Greek myth. Works with any capable LLM: ChatGPT, Gemini, Copilot, Claude, Mistral, local models and any API or agent framework. Free to download and use.

**Tier: worker.** It does one specialist job and returns a structured result, so it can be called directly by people or by higher-level orchestrator agents.

## What it does
- **Assesses** a business or process for flow opportunities: which state changes are worth streaming, to whom, in which pattern (Collector, Distributor, Signal, Facilitator), what stays as API or batch, and the smallest pilot to start with.
- **Designs** an event-driven integration: messaging vs eventing, discrete events vs event series, single action vs workflow, event names and keys, envelope and contract (CloudEvents, AsyncAPI), delivery guarantees, idempotency, retention, security and the right technology class.
- **Reviews** an existing event or streaming architecture and returns findings rated Critical/High/Medium/Low, each with its basis and a concrete fix, plus a verdict (Proceed / Proceed with conditions / Redesign / Do not proceed).
- **Answers** questions: queue vs log, exactly-once, outbox, schema evolution, webhooks vs brokers, CloudEvents attributes, AsyncAPI, flow patterns.

## How to use it
**As a person**: describe the business, the system or ask the question. Examples:
- "Assess: we're a regional food distributor; orders come in by EDI overnight and stock is updated hourly."
- "Design: push shipment status from our TMS to 40 retail customers in near real time."
- "Review: our order service writes to Postgres then publishes OrderPlaced to Kafka; partners read the same topic."
- "When should I use a log instead of a queue?"

**From another agent**: send the request with optional headers:
```
MODE: review
FORMAT: structured
CONTEXT: logistics, EU, three external partners, ~2k events/s peak
<architecture description>
```
With `FORMAT: structured`, assess, design and review results come back as JSON. It never waits for answers: it states its assumptions and lists the open questions that would change a rating.

## What it's built on
Informed by *Flow Architectures: The Future of Streaming and Event-Driven Integration* (James Urquhart, O'Reilly 2021) — the flow definition and value chain, Wardley mapping and promise theory as applied there, the Collector/Distributor/Signal/Facilitator patterns, flow requirements and readiness steps — together with the event decision tree (Vasters), use-case categories (Collison), EventStorming (Brandolini), Wardley Mapping (Wardley), Promise Theory (Burgess & Bergstra), and established practice and open standards: log and queue semantics, delivery guarantees, transactional outbox, idempotent consumers, schema registries and evolution, CloudEvents 1.0, AsyncAPI 3.0, MQTT, AMQP.

## Limits
- **Architecture advice, not vendor selection.** Products are named as examples of technology classes; verify current versions, pricing and support.
- Standards and products were checked on 1 Nov 2026; they move, so re-verify for decisions that depend on specific versions or features.
- It works from what you describe. A vague description gets an answer full of assumptions; give it the producers, consumers, volumes, latency need and boundaries crossed.
- It doesn't run, test or load-test your systems, and doesn't replace security or legal review of cross-organisation data sharing.
- Provided as is, without warranty. You are responsible for the decisions you make with it.

## Install
See **`INSTALL.md`** for step-by-step setup in ChatGPT, Gemini, Copilot, Claude, Mistral, local models and APIs. In short:
- **Instructions**: `system-prompt.md` (paste into any tool's instructions / system prompt field).
- **Knowledge**: the 10 files in `references/` (upload as knowledge files).
- **One file only?** Use `event-flow-architect-all-in-one.md`.

## Maintenance
Re-check `references/08-standards-and-technology.md` each half-year and after major releases of CloudEvents, AsyncAPI or the main streaming platforms.

---
MIKA Labs · mikalaboratories.com · info@mikalaboratories.com

Independent work: written by MIKA Labs in its own words. MIKA Labs is not affiliated with, sponsored or endorsed by the authors or publishers of the works named above; titles and names are used only to credit the ideas.
