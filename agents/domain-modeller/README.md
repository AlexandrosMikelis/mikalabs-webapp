# Gaia — Domain Modeller by MIKA Labs

A domain-driven design modeller, for people and for other AI agents. Named after Gaia, the earth in Greek myth, because it maps the whole territory of a business domain. Works with any capable LLM: ChatGPT, Gemini, Copilot, Claude, Mistral, local models and any API or agent framework. Free to download and use.

**Tier: worker.** It does one specialist job and returns a structured result, so it can be called directly by people or by higher-level orchestrator agents.

## What it does
- **Models** a business from a description: subdomains scored with MIKA's investment profile and given a label (core for the differentiators; generic for commodities; supporting for the rest), with sourcing advice and a scored build shape for each, a ubiquitous-language glossary, bounded contexts with owners, a relationship map whose patterns are chosen by who sets the terms and how far apart the models are, the core's aggregates (plus value types), and the events they raise, with Mermaid diagrams.
- **Reviews** an existing domain model, service boundaries or map of context relationships and returns findings rated Critical/High/Medium/Low, each with its basis and a concrete fix, plus a verdict (Sound / Sound with changes / Remodel / Do not build as designed).
- **Answers** questions: what counts as core, bounded context vs microservice, how big an aggregate should be, when event sourcing pays off, separate read and write models, sagas vs orchestrated coordinators, anticorruption layers, how to run EventStorming.
- **Bridges to knowledge graphs**: turns the glossary, relationship map and event catalogue into a context-scoped domain graph (SKOS/RDF or property graph, with SHACL checks) that AI agents can query, and scores how agent-ready a model is.

It does not pick the overall architecture style (use **Pallas**), plan a microservice migration (use **Theseus**) or design event-streaming infrastructure (use **Nereus**).

## How to use it
**As a person**: describe the business, paste the model or ask the question. Examples:
- "Model: we run six veterinary clinics with shared out-of-hours surgery, treatment estimates that owners must approve, and pet-insurance claims."
- "Review: our ferry booking services are Customer, Booking, Vessel, Notification and Utils; all share one Postgres schema."
- "Should our energy co-op's matching ledger use event sourcing?"
- "How do I run a remote event-discovery workshop with eight people?"

**From another agent**: send the request with optional headers:
```
MODE: review
FORMAT: structured
CONTEXT: regional ferry operator, 3 teams, monolith being split
<model, service list or relationship map>
```
With `FORMAT: structured`, model and review results come back as JSON. It never waits for answers: it states its assumptions and lists the open questions that would change a decision.

## What it's built on
Open, citable sources: Evans' DDD Reference (CC-BY 4.0), DDD-Crew canvases and cheat sheets (CC BY-SA 4.0), Fowler's public pattern catalogue, EventStorming, Domain Storytelling, Wardley Mapping, Enterprise Integration Patterns, event sourcing with separate read and write sides, the transactional outbox and sagas, and W3C knowledge-graph standards (RDF, SKOS, SHACL, PROV-O) plus labelled property graphs. The decision frameworks (investment profile, boundary scorecard, Terms & Distance guide, build-shape scorecard, review scoring) are MIKA Labs' own.

## Limits
- **Modelling advice, not a finished design.** A domain model is a working hypothesis; validate it with domain experts and change it as you learn.
- It works from what you describe. A vague description gets a model full of assumptions; give it the business goals, actors, processes, rules and team setup.
- It doesn't read or run your code unless you paste it, and doesn't replace workshops with the people who know the business.
- Provided as is, without warranty. You are responsible for the decisions you make with it.

## Install
See **`INSTALL.md`** for step-by-step setup in ChatGPT, Gemini, Copilot, Claude, Mistral, local models and APIs. In short:
- **Instructions**: `system-prompt.md` (paste into any tool's instructions / system prompt field).
- **Knowledge**: the 11 files in `references/` (upload as knowledge files).
- **One file only?** Use `domain-modeller-all-in-one.md`.

## Maintenance
DDD practice changes slowly. Re-check `references/10-knowledge-graph-view.md` yearly, as knowledge-graph and agent tooling moves faster than the modelling ideas.

---
MIKA Labs · mikalaboratories.com · info@mikalaboratories.com

Independent work, written by MIKA Labs in its own words.
