# Hestia — Multitenant SaaS Architect by MIKA Labs

An architect for multitenant software-as-a-service, for people and for other AI agents. Named after the keeper of the shared hearth: many households, one fire, kept safe. Works with any capable LLM: ChatGPT, Gemini, Copilot, Claude, Mistral, local models and any API or agent framework. Free to download and use.

**Tier: worker.** It does one specialist job and returns a structured result, so it can be called directly by people or by higher-level orchestrator agents.

## What it does
- **Designs** a multitenant system from a product and its customers: what to share per customer segment and component (scored with the MIKA tenancy fit matrix), control plane and tenant catalog, lifecycle workflows, identity and request context, isolation (rated on the MIKA isolation assurance ladder), data layout per store, routing, noisy-neighbour controls, plans, metering and cost to serve, and operations.
- **Reviews** an existing SaaS product and returns findings rated Critical/High/Medium/Low with a transparent severity score, each with a location and a concrete fix, plus a verdict (Proceed / Proceed with conditions / Redesign / Do not proceed).
- **Plans** the move from hosted single-customer copies to one operated service along the MIKA convergence path: inventory, operate as one, converge versions, share where it pays, retire bespoke stacks.
- **Answers** questions: "Database per customer or shared tables?", "Where should the customer reference come from?", "How do we stop one customer slowing everyone down?", "How do we work out cost per customer?"

## How to use it
**As a person**: describe the product and customers, paste the architecture, or ask the question. Examples:
- "Design: practice-management SaaS for 2,000 veterinary clinic groups; a dozen large groups need their own database and EU-only data."
- "Review: one Postgres for all ferry operators, services filter by tenant_id from an X-Tenant header, nightly settlement job runs across all customers."
- "Plan: we host a separate copy of our app for each of 80 energy co-ops on four versions. How do we become one service?"
- "Namespace per customer or a shared namespace on Kubernetes?"

**From another agent**: send the request with optional headers:
```
MODE: review
FORMAT: structured
CONTEXT: veterinary practice software, EU, 1,200 tenants, three plans, Kubernetes
<architecture description>
```
With `FORMAT: structured`, designs and reviews come back as JSON. It never waits for answers: it states its assumptions and lists the open questions that would change a rating.

It stays in its lane and names the right agent for adjacent depth: API security → Argus; serverless specifics → Aeolus; general scalability → Atlas; microservice decomposition → Theseus.

## What it's built on
Open standards and public guidance: the AWS Well-Architected SaaS Lens and AWS SaaS whitepapers, the Azure Architecture Center multitenant guidance (tenancy models, Deployment Stamps), Google Cloud SaaS guidance and GKE multitenancy guidance, the Kubernetes multitenancy docs, PostgreSQL row security, OpenID Connect, OAuth 2.0 RFCs and SCIM, the OWASP API Security Top 10, OpenTelemetry, and the FinOps Framework and FOCUS. MIKA adds its own decision methods on top. Data residency (GDPR) and SOC 2 are raised as flags only.

## Limits
- **Architecture advice, not vendor selection.** Cloud services are named as examples; verify current features, limits and pricing with your provider.
- **Not legal or compliance advice.** Points on GDPR, data residency, SOC 2 and sector rules are flags to confirm with your compliance team.
- References were checked on 7 Nov 2026; provider features move, so re-verify for decisions that depend on specific limits.
- It works from what you describe. A vague description gets an answer full of assumptions; give it what a tenant is, customer count and spread, plans, stores and how the customer reference flows.
- It doesn't run, test or scan your systems.
- Provided as is, without warranty. You are responsible for the decisions you make with it.

## Install
See **`INSTALL.md`** for step-by-step setup in ChatGPT, Gemini, Copilot, Claude, Mistral, local models and APIs. In short:
- **Instructions**: `system-prompt.md` (paste into any tool's instructions / system prompt field).
- **Knowledge**: the 11 files in `references/` (upload as knowledge files).
- **One file only?** Use `saas-architect-all-in-one.md`.

## Maintenance
Re-check `references/05-identity-and-request-context.md`, `references/08-runtime-platforms-and-fairness.md` and `references/09-plans-metering-and-unit-economics.md` each half-year, and after major changes to cloud-provider multitenant guidance, identity-provider features, Kubernetes multitenancy projects or serverless concurrency models.

---
MIKA Labs · mikalaboratories.com · info@mikalaboratories.com

Independent work by MIKA Labs, written in its own words.
