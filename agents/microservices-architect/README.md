# Theseus — Microservices Architect by MIKA Labs

A microservices decomposition and migration architect, for people and for other AI agents. Named after the ship of Theseus, rebuilt plank by plank while it stayed afloat — which is how a monolith should become services. Works with any capable LLM: ChatGPT, Gemini, Copilot, Claude, Mistral, local models and any API or agent framework. Free to download and use.

**Tier: worker.** It does one specialist job and returns a structured result, so it can be called directly by people or by higher-level orchestrator agents.

## What it does
- **Assesses** whether microservices fit at all: the goals behind the request, readiness across domain, teams, delivery, operations, platform and leadership, and an honest recommendation (Microservices now / Prepare first / Modular monolith / Keep current architecture) with cheaper alternatives and first steps.
- **Plans** the move from a monolith: candidate services with the data each owns and the team that owns it, what to split first, and step-by-step migration using strangler fig, branch by abstraction, parallel run, wrapping proxy, change data capture and UI composition — each step with its data strategy, risks, rollback and exit criterion.
- **Reviews** an existing microservice architecture across coupling, data ownership, communication, resilience, testing, deployment, observability, security basics and organisation, and returns findings rated Critical/High/Medium/Low with concrete fixes, plus a verdict (Healthy / Healthy with changes / Restructure / Consolidate).
- **Answers** questions: modular monolith vs services, sagas vs distributed transactions, orchestration vs choreography, shared databases, consumer-driven contracts, team topologies, platform teams, service granularity.

## How to use it
**As a person**: describe the organisation, the system or ask the question. Examples:
- "Assess: 30 engineers, one Rails monolith, releases every two weeks with a manual QA phase. The CTO wants microservices."
- "Plan: split appointment booking and invoicing out of our clinic-management monolith; both use one PostgreSQL schema."
- "Review: 35 services on Kubernetes, one shared database, a nightly end-to-end suite gates all releases."
- "When is a modular monolith better than microservices?"

**From another agent**: send the request with optional headers:
```
MODE: review
FORMAT: structured
CONTEXT: e-commerce, 6 teams, Kubernetes, ~800 req/s peak
<architecture description>
```
With `FORMAT: structured`, assess, plan and review results come back as JSON. It never waits for answers: it states its assumptions and lists the open questions that would change a rating.

**Works alongside**: Daedalus (API Platform Architect) for gateways, service mesh and release traffic; Gaia (Domain Modeller) for deep domain modelling; Nereus (Event Streaming Architect) for streaming platforms; Hermes (API Design Reviewer) for API contracts; Argus (API Security Reviewer) for security depth. Theseus names the handoff instead of duplicating their work.

## What it's built on
Widely used public practice: domain-driven design, Conway's law, Team Topologies, DORA metrics, consumer-driven contracts, the strangler fig pattern, sagas, OpenTelemetry, SLOs and error budgets, chaos engineering.

## Limits
- **Architecture advice, not vendor selection.** Products are named as examples; verify current versions, pricing and support.
- It works from what you describe. Give it the services, data stores, teams, release process and goals; a vague description gets an answer full of assumptions.
- It doesn't inspect code, run tests or load-test your systems, and doesn't replace security review or capacity engineering.
- Rules of thumb (team sizes, hop counts) are general guidance, not laws; adapt them to your context.
- Provided as is, without warranty. You are responsible for the decisions you make with it.

## Install
See **`INSTALL.md`** for step-by-step setup in ChatGPT, Gemini, Copilot, Claude, Mistral, local models and APIs. In short:
- **Instructions**: `system-prompt.md` (paste into any tool's instructions / system prompt field).
- **Knowledge**: the 10 files in `references/` (upload as knowledge files).
- **One file only?** Use `microservices-architect-all-in-one.md`.

## Maintenance
Re-check the general-knowledge parts (OpenTelemetry, platform and tooling examples, DORA research) each year.

---
MIKA Labs · mikalaboratories.com · info@mikalaboratories.com

Independent work, written by MIKA Labs in its own words.
