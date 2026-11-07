# Chronos — Architecture Fitness Advisor by MIKA Labs

An advisor that keeps software architecture healthy over time, for people and for other AI agents. Named after the Greek personification of time, because architecture decays not in a day but over many small changes. Works with any capable LLM: ChatGPT, Gemini, Copilot, Claude, Mistral, local models and any API or agent framework. Free to download and use.

**Tier: worker.** It does one specialist job and returns a structured result, so it can be called directly by people or by higher-level orchestrator agents.

## What it does
- **Designs** fitness functions from your goals and quality characteristics: for each one the metric, the threshold, its design card (single or composite, on-change, always-on or scheduled, fixed or contextual threshold, automated or manual), the tool class, where it runs (commit, pull request, nightly, pre-release stage, production) and what happens when it fails. Adds an architecture-metrics scorecard (delivery metrics, coupling and modularity, technical debt, SLOs) with targets, cadence, audience and the action each reading triggers.
- **Reviews** an existing architecture, metrics dashboard or governance setup and returns findings rated Critical/High/Medium/Low, each with its basis and a concrete fix, plus a verdict (Healthy / Healthy with conditions / Needs rework / At risk).
- **Answers** questions: coupling strength, autonomy units, incoming and outgoing package coupling, propagation cost, DORA metrics, error budgets, Goodhart's law, how to govern a migration, how to add fitness functions to a legacy system.

## How to use it
**As a person**: describe the system and its goals, paste your metrics or governance rules, or ask the question. Examples:
- "Design: B2B invoicing platform, 6 teams, moving from a modular monolith to services over 18 months. We care most about deployability, data integrity and keeping modules independent."
- "Review: our dashboard shows deployment frequency per team, code coverage (target 85%) and SonarQube debt in days. Nobody acts on it."
- "Review: we have ArchUnit layer rules in CI but services all share one Postgres schema."
- "What is the difference between build-time and run-time coupling between autonomy units?"

**From another agent**: send the request with optional headers:
```
MODE: design
FORMAT: structured
CONTEXT: fintech, 40 engineers, Kubernetes, GitHub Actions, migrating from monolith
<goals, characteristics, current architecture>
```
With `FORMAT: structured`, design and review results come back as JSON. It never waits for answers: it states its assumptions and lists the open questions that would change a rating.

**Hand-offs**: choosing an architecture style goes to Pallas; release, canary and rollout mechanics to Daedalus; scalability load-test design to Atlas. Chronos names the hand-off rather than guessing.

## What it's built on
Widely used public practice: fitness functions and automated governance, coupling analysis and autonomy units, DORA research (dora.dev), the SPACE framework, SRE-style SLOs and error budgets, ISO/IEC 25010:2023, Goal-Question-Metric, ADRs, established coupling measures (incoming/outgoing coupling, instability, propagation cost), and rule-checking tools of the ArchUnit, jQAssistant and dependency-cruiser class. On top of that, MIKA's own design card, readiness check, coupling and structure scores, and governance maturity ladder.

## Limits
- **Governance design, not tool operation.** It does not run analysers, tests or monitors against your code or systems; tools are named as examples of a class, so verify current versions and support.
- Thresholds it proposes are starting points to calibrate against your own baseline, not industry standards.
- It works from what you describe. A vague description gets an answer full of assumptions; give it the goals, team shape, current metrics and pipeline.
- Metrics about people's work are sensitive; it will not help rank or appraise individuals with delivery metrics.
- Provided as is, without warranty. You are responsible for the decisions you make with it.

## Install
See **`INSTALL.md`** for step-by-step setup in ChatGPT, Gemini, Copilot, Claude, Mistral, local models and APIs. In short:
- **Instructions**: `system-prompt.md` (paste into any tool's instructions / system prompt field).
- **Knowledge**: the 10 files in `references/` (upload as knowledge files).
- **One file only?** Use `architecture-fitness-advisor-all-in-one.md`.

## Maintenance
Re-check `references/07-architecture-metrics.md` each year when new DORA research is published, and after a new edition of ISO/IEC 25010 (current: 2023).

---
MIKA Labs · mikalaboratories.com · info@mikalaboratories.com

Independent work by MIKA Labs, written in its own words.
