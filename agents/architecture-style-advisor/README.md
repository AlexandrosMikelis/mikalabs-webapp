# Pallas — Architecture Style Advisor by MIKA Labs

An advisor for the big shaping decisions in software: which quality targets matter, which style fits, and what each option really costs. For people and for other AI agents. Named after Pallas Athena, the Greek goddess of wisdom and strategic craft. Works with any capable LLM: ChatGPT, Gemini, Copilot, Claude, Mistral, local models and any API or agent framework. Free to download and use.

**Tier: worker.** It does one specialist job and returns a structured result, so it can be called directly by people or by higher-level orchestrator agents.

## What it does
- **Designs** from requirements: translates business drivers into a short, measurable list of quality targets (top three marked), captures constraints, maps the components, compares 3–4 candidate styles (modular monolith, layered, pipeline, microkernel, service-based, microservices, event-driven, space-based, combinations) in a trade-off table with a style-fit scoring sheet as cross-check, recommends one with what you give up, and writes the ADR.
- **Reviews** an existing architecture for style fit, quality targets, coupling, components, data ownership and decision hygiene, and returns findings rated Critical/High/Medium/Low, each with its basis and a concrete fix, plus a verdict (Keep / Keep with changes / Evolve / Re-architect).
- **Answers** questions: monolith or microservices, splitting code by technical role or by business capability, which decisions deserve an ADR, how to write an ADR, when space-based or microkernel pays off, how to limit "-ilities".
- **Hands off** by name when depth belongs to another specialist: domain boundaries → Gaia; fitness functions and metrics → Chronos; decomposition and migration → Theseus; scalability → Atlas.

## How to use it
**As a person**: describe the product, the requirements or the existing system, or ask the question. Examples:
- "Design: booking platform for a ferry operator, 6 developers, big spikes when holiday sailings are released, must integrate with the port's systems."
- "Review: we have 28 microservices, one shared Postgres, deploys go out together every two weeks, and the team is 9 people."
- "Should our pricing rules live in plug-ins or in a rules engine?"
- "How do I stop our list of non-functional requirements from growing to 20 items?"

**From another agent**: send the request with optional headers:
```
MODE: design
FORMAT: structured
CONTEXT: B2B SaaS, EU, 3 teams, AWS, launch in 6 months
<requirements or architecture description>
```
With `FORMAT: structured`, design and review results come back as JSON. It never waits for answers: it states its assumptions and lists the open questions that would change a decision or rating.

## What it's built on
Public standards and practice: ISO/IEC 25010:2023, ISO/IEC/IEEE 42010, SEI quality-attribute scenarios and ATAM, Nygard-style ADRs and the MADR template, the C4 model, the fallacies of distributed computing, Conway's law and established coupling metrics. Plus MIKA's own method: an elicitation script, three component-discovery methods, five shape axes, style cards and a style-fit scoring sheet.

## Limits
- **Advice, not a guarantee.** It reasons from what you describe; it does not read your whole codebase, run load tests or measure your system.
- A vague description gets an answer full of assumptions. Give it scale, peaks, team size, operations capability, budget and the top qualities you care about.
- It recommends styles and structure, not products or vendors. Technology names are examples only.
- Regulatory and security points are flags for your specialists to confirm.
- Provided as is, without warranty. You are responsible for the decisions you make with it.

## Install
See **`INSTALL.md`** for step-by-step setup in ChatGPT, Gemini, Copilot, Claude, Mistral, local models and APIs. In short:
- **Instructions**: `system-prompt.md` (paste into any tool's instructions / system prompt field).
- **Knowledge**: the 10 files in `references/` (upload as knowledge files).
- **One file only?** Use `architecture-style-advisor-all-in-one.md`.

## Maintenance
Re-check `references/02-quality-attributes.md` when ISO/IEC 25010 is revised, and review the style guidance in `07`–`09` yearly as practice evolves.

---
MIKA Labs · mikalaboratories.com · info@mikalaboratories.com

Independent work, written by MIKA Labs in its own words.
