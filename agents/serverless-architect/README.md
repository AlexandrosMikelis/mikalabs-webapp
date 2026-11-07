# Aeolus — Serverless Architect by MIKA Labs

An agent that designs and reviews systems built on functions, on-demand containers and managed platform services, for people and for other AI agents. AWS first, with Azure and Google Cloud equivalents. Named after the keeper of the winds in Greek myth, who released exactly as much as was needed. Works with any capable LLM: ChatGPT, Gemini, Copilot, Claude, Mistral, local models and any API or agent framework. Free to download and use.

**Tier: worker.** It does one specialist job and returns a structured result, so it can be called directly by people or by higher-level orchestrator agents.

## What it does
- **Designs** from requirements. It scores each component for serverless fit (and names what should run on containers, VMs or batch instead), then sets compute and storage, entry paths, a channel per asynchronous edge with versioned event contracts, workflows where a coordinator earns its place, a failure-path card per edge, permissions and secrets, journey SLOs and alerts, infrastructure code and release method, a cost-per-transaction sheet and the platform limits to verify.
- **Reviews** an existing design or infrastructure code across eleven lenses: fit, compute and latency, entry paths, events and contracts, workflows, failure paths, limits and downstream protection, access and data, telemetry, delivery, and unit economics. Findings are rated Critical/High/Medium/Low, each with its basis and a concrete fix, plus an overall call (Proceed / Proceed with conditions / Redesign / Do not proceed).
- **Answers** questions: should this run on functions or containers? A long-running or a short workflow type? Queue, ordered log or bus? How to make a consumer idempotent? What does one booking cost? How to release a function change safely?

## How to use it
**As a person**: describe the requirements, the system or ask the question. Examples:
- "Design: online booking for a regional ferry operator; peaks at 07:00 and 17:00 and when weather cancels sailings; payments through a third-party provider."
- "Review: our clinic network's radiograph uploads land in S3, trigger a Lambda that converts them and writes the result back to the same bucket; a second Lambda calls the reporting Lambda synchronously."
- "Our ferry refund process waits up to two days for approval. Which workflow type, and what happens if nobody answers?"
- "Is serverless a good fit for our energy co-op's meter readings, which arrive at a flat rate all day?"

**From another agent**: send the request with optional headers:
```
MODE: review
FORMAT: structured
CONTEXT: ferry operator, EU, peak 400 req/s, team of 5, Terraform
<architecture or IaC description>
```
With `FORMAT: structured`, design and review results come back as JSON. It never waits for answers: it states its assumptions and lists the open questions that would change a rating.

Hands off by name when a question goes deeper: **Atlas** (general scalability), **Argus** (API threats), **Hestia** (multitenant SaaS), **Nereus** (event streaming).

## What it's built on
Open standards and public guidance: the providers' own architecture frameworks and service documentation for AWS, Azure (including Functions and Container Apps) and Google Cloud (including Cloud Run, Eventarc and Workflows); the CNCF Serverless Whitepaper and Knative; CloudEvents and AsyncAPI; OpenTelemetry and W3C Trace Context; public SRE guidance on SLOs; unit-economics practice and the FOCUS billing format; the Green Software Foundation's SCI specification. On top: MIKA's own serverless-fit score, concurrency sheet, synchronous-reach rule, channel chooser, coordinator test, failure-path checklist, permission ledger, alert set, cost-per-transaction model, verification matrix and severity calibration.

## Limits
- **Architecture advice, not deployment or a quote.** It does not run, deploy, load-test or price your systems.
- **Platform limits, defaults and prices change** and vary by Region and account. The figures in the references are a late-2026 reading and must be verified against current provider documentation before you rely on them.
- Azure and Google Cloud equivalents are approximate; behaviour, limits and pricing differ.
- It works from what you describe. A vague description gets an answer full of assumptions; give it traffic, latency needs, data classes and the services in use.
- It doesn't replace a security review, a compliance assessment or a cost analysis by your finance team.
- Provided as is, without warranty. You are responsible for the decisions you make with it.
- AWS, Amazon Web Services, AWS Lambda and other service names are trademarks of Amazon.com, Inc. or its affiliates; Azure and Google Cloud names belong to their owners. They are used here only to describe the technologies. MIKA Labs is not affiliated with, sponsored or endorsed by Amazon Web Services, Microsoft or Google.

## Install
See **`INSTALL.md`** for step-by-step setup in ChatGPT, Gemini, Copilot, Claude, Mistral, local models and APIs. In short:
- **Instructions**: `system-prompt.md` (paste into any tool's instructions / system prompt field).
- **Knowledge**: the 11 files in `references/` (upload as knowledge files).
- **One file only?** Use `serverless-architect-all-in-one.md`.

## Maintenance
Re-check the quota table in `references/02-compute-shapes-and-runtime-tuning.md` and the price table in `references/09-unit-economics-per-transaction.md` each half-year and after major provider announcements.

---
MIKA Labs · mikalaboratories.com · info@mikalaboratories.com

Independent work by MIKA Labs, built on open standards and established engineering practice.
