# Daedalus — API Platform Architect by MIKA Labs

An architect for how requests are routed and controlled, how changes reach users safely, and how systems are modernised step by step, for people and for other AI agents. Named after the master builder of Greek myth. Works with any capable LLM: ChatGPT, Gemini, Copilot, Claude, Mistral, local models and any API or agent framework. Free to download and use.

**Tier: worker.** It does one specialist job and returns a structured result. Call it directly, or let a higher-level orchestrator agent call it as one step in a pipeline.

## What it does
- **Reviews** an architecture: how requests enter the system and travel between services, which control points (proxies, gateways, client libraries, a mesh) enforce routing and policy, whether you need any of them yet, and how they fail. Returns a call ledger summary, findings rated Critical/High/Medium/Low with their basis and a concrete recommendation, and a verdict (Sound / Sound with changes / Rework / Stop and rethink).
- **Plans** a release or a migration: canary, blue-green, shadow traffic, feature flags, gated exposure and rollback; strangler-fig extraction from a monolith; moving workloads to a cloud platform route by route. Every step comes with a decision record (options, choice, one-way or two-way door), gate signals, a rollback trigger and an exit criterion.
- **Answers** questions such as "do we need a mesh yet?", "per-pod proxies or per-node agents?", "how do we retire an old API version?" with a recommendation and the trade-offs.

It doesn't design security. Where authentication, authorization, certificate policy or identity-based access design matter, it lists them under "Security review needed" for a security specialist.

## How to use it
**As a person**: describe the system, the goal or the question. Examples:
- "Review: our ferry booking app reaches a .NET monolith through NGINX; we're carving out a Timetable service in Go and the monolith will call it through the public hostname."
- "Plan: move our clinic network's patient-records API from our data centre to the cloud without downtime."
- "Plan a canary release for v3.8 of our energy co-op's meter-readings API on Kubernetes."
- "Do we need a mesh for 12 services in two languages?"

**From another agent**: send the request with optional headers:
```
MODE: review
FORMAT: structured
CONTEXT: Kubernetes on-prem, 12 services, Java + Go, 99.9% SLA
<architecture description>
```
With `FORMAT: structured`, reviews and plans come back as JSON. It never waits for answers: it states its assumptions and lists the open questions that would change a rating.

## What it's built on
Open standards, public project documentation and widely used practice: the Kubernetes Gateway API and its GAMMA sub-project; Envoy and the CNCF proxy projects; workload identity standards and NIST SP 800-207 / 800-207A; OpenTelemetry and W3C Trace Context; OpenFeature; open-source progressive delivery tools; strangler fig, branch by abstraction and parallel change; fitness functions; decision records; SLOs and error budgets; the public migration guidance of AWS, Microsoft Azure and Google Cloud; the HTTP `Deprecation` and `Sunset` headers. On top: MIKA's own call ledger, mesh readiness score, cost card, release route chooser, gate card, control-point scorecard, catalogue of platform smells and a knowledge-graph view of findings.

## Limits
- **Not a security review.** Security-relevant items are flagged for a security specialist.
- Product capabilities and versions change quickly. Statements about the current landscape (Gateway API releases, mesh modes, controller retirements such as ingress-nginx) carry a date; verify them against current project documentation before you decide.
- It reviews what you describe. A vague description gets a review full of assumptions; give it the traffic paths, platform, scale, languages, owners and release process.
- Provided as is, without warranty. You are responsible for the decisions you make with it.

## Install
See **`INSTALL.md`** for step-by-step setup in ChatGPT, Gemini, Copilot, Claude, Mistral, local models and APIs. In short:
- **Instructions**: `system-prompt.md` (paste into any tool's instructions / system prompt field).
- **Knowledge**: the 10 files in `references/` (upload as knowledge files).
- **One file only?** Use `api-platform-architect-all-in-one.md`.

## Maintenance
Re-check the dated landscape notes in `references/09-product-choice.md`, the style table in `references/06-mesh-styles-and-costs.md` and the "proxy on borrowed time" entry in `references/08-platform-smells.md` every six months.

---
MIKA Labs · mikalaboratories.com · info@mikalaboratories.com

Independent work, written by MIKA Labs in its own words.
