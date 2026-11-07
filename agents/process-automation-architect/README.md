# Ergane — Process Automation Architect by MIKA Labs

An architect for business processes that have to run, wait and recover on their own, for people and for other AI agents: what to automate, how to model it with open notations, and how the runtime and integrations behave when things go wrong. Named after Athena's title as patron of craft and skilled work. Works with any capable LLM: ChatGPT, Gemini, Copilot, Claude, Mistral, local models and any API or agent framework. Free to download and use.

**Tier: worker.** It does one specialist job and returns a structured result, so it can be called directly by people or by higher-level orchestrator agents.

## What it does
- **Assesses** a business process: a fit score out of 30 (volume, duration, integrations, waiting, compliance, human judgement), then per step a treatment (API integration, business-rule table, AI step, routed work for people, interim UI automation job, device, or leave manual) with value, effort, risk, a value case and a three-slice rollout.
- **Designs** a runnable process: a BPMN 2.0.2 flow written as structured text (events, steps, gateways, deadlines, error and escalation paths, undo steps), business rules in DMN, work-item and AI step sheets with autonomy levels and gates, a coordination decision per interaction (orchestrate or choreograph), call sheets for every integration, and the runtime architecture (topology, versioning, sagas, observability).
- **Reviews** an existing BPMN diagram, a workflow in code, or an automation design and returns findings rated Critical/High/Medium/Low, each with its basis and a concrete fix, plus a verdict (Proceed / Proceed with conditions / Redesign / Do not proceed).
- **Answers** questions: token semantics, hit policies, where a failure should be handled, orchestrate or choreograph for a given interaction, sagas and undo steps, retries on Step Functions or other durable runtimes, changing flows while cases run, where LLM agents fit, how flow models feed a knowledge graph.

## How to use it
**As a person**: describe the process, the model or ask the question. Examples:
- "Assess: specialist referrals at our veterinary clinic network take up to a month; referrals arrive as PDFs, the pet insurer has only a portal, our practice system has a REST API."
- "Design: weather cancellations at our ferry company: rebook or refund about 3,000 passengers a month, with an LLM reading free-text complaints."
- "Review: our energy co-op's member onboarding diagram has nine gateways for eligibility and waits for the grid operator with no timeout."
- "When should a failed call be caught as a business deviation instead of being retried?"

**From another agent**: send the request with optional headers:
```
MODE: review
FORMAT: structured
CONTEXT: regional ferry operator, EU, ~3k disruption cases/month, cases run up to 14 days
<diagram or architecture description>
```
With `FORMAT: structured`, assess, design and review results come back as JSON. It never waits for answers: it states its assumptions and lists the open questions that would change a rating.

**Neighbours**: event streaming infrastructure goes to Nereus, cross-organisation event flows to Okeanos, domain boundaries to Gaia.

## What it's built on
Open standards and public practice: OMG BPMN 2.0.2 (ISO/IEC 19510), DMN 1.5 and FEEL, CMMN 1.1, the control-flow and resource pattern catalogue at workflowpatterns.com, OASIS WS-HumanTask, the saga model (Garcia-Molina and Salem, 1987), transactional outbox and idempotent receivers, public documentation of durable-execution and serverless services (AWS Step Functions, Lambda, EventBridge and SQS dead-letter queues; Temporal), OpenTelemetry and W3C Trace Context, event-log standards (IEEE 1849 XES, OCEL 2.0), and current practice for LLM agents in governed workflows (EU AI Act human oversight, NIST AI RMF, OWASP Top 10 for LLM Applications, W3C PROV-O for audit provenance). Its scoring rubrics, decision tables and sheets are MIKA Labs' own.

## Limits
- **Architecture advice, not vendor selection.** Products are named only as examples of categories; verify current versions, licences, pricing and support.
- Standards and practice were checked on 1 Nov 2026; AI agent practice and AI regulation timelines move fast, so re-verify for decisions that depend on them.
- It works from what you describe. A vague description gets an answer full of assumptions; give it the trigger, outcomes, participants, systems, volumes and how long a case runs.
- It doesn't execute, test or migrate your processes, and doesn't replace legal or compliance review of automated decisions or AI use.
- Provided as is, without warranty. You are responsible for the decisions you make with it.

## Install
See **`INSTALL.md`** for step-by-step setup in ChatGPT, Gemini, Copilot, Claude, Mistral, local models and APIs. In short:
- **Instructions**: `system-prompt.md` (paste into any tool's instructions / system prompt field).
- **Knowledge**: the 11 files in `references/` (upload as knowledge files).
- **One file only?** Use `process-automation-architect-all-in-one.md`.

## Maintenance
Re-check `references/05-decisions-dmn-and-case-work.md`, `10-runtime-operations-and-improvement.md` and `09-agents-and-knowledge-graphs.md` each half-year and after new OMG revisions, major runtime releases or changes in AI regulation.

---
MIKA Labs · mikalaboratories.com · info@mikalaboratories.com

Independent work by MIKA Labs, written in its own words.
