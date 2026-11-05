# Daedalus — API Platform Architect by MIKA Labs

An architect for API traffic management, safe releases and step-by-step modernisation, for people and for other AI agents. Named after the master builder of Greek myth. Works with any capable LLM: ChatGPT, Gemini, Copilot, Claude, Mistral, local models and any API or agent framework. Free to download and use.

**Tier: worker.** It does one specialist job and returns a structured result. Call it directly, or let a higher-level orchestrator agent call it as one step in a pipeline.

## What it does
- **Reviews** an architecture: API gateways and the edge stack (north–south), service mesh (east–west), whether you need either or both, and how they fail. Returns a traffic map, findings rated Critical/High/Medium/Low with their basis and a concrete recommendation, and a verdict (Sound / Sound with changes / Rework / Stop and rethink).
- **Plans** a release or a migration: canary, blue-green, traffic mirroring, feature flags, analysis-driven rollouts and rollback; strangler-fig extraction from a monolith; moving to the cloud with the gateway and mesh as migration tools. Every step comes with a decision record (options, choice, reversibility), success signals, a rollback trigger and an exit criterion.
- **Answers** questions such as "gateway or mesh?", "sidecar or ambient?", "how do we version a breaking change?" with a recommendation and the trade-offs.

It doesn't design security. Where authentication, authorization, mTLS policy or zero-trust design matter, it lists them under "Security review needed" for a security specialist.

## How to use it
**As a person**: describe the system, the goal or the question. Examples:
- "Review: our mobile app calls a Java monolith through NGINX; we're extracting a Sessions service in Go and want internal calls to go via the public gateway."
- "Plan: move our Attendee API from our data centre to the cloud without downtime."
- "Plan a canary release for v1.3 of our Orders API on Kubernetes."
- "Do we need a service mesh for 12 services in two languages?"

**From another agent**: send the request with optional headers:
```
MODE: review
FORMAT: structured
CONTEXT: Kubernetes on-prem, 12 services, Java + Go, 99.9% SLA
<architecture description>
```
With `FORMAT: structured`, reviews and plans come back as JSON. It never waits for answers: it states its assumptions and lists the open questions that would change a rating.

## What it's built on
Informed by *Mastering API Architecture* (James Gough, Daniel Bryant, Matthew Auburn; O'Reilly, 2022), distilled and restructured in our own words, plus widely used published patterns and open standards: the strangler fig pattern (Fowler); Newman, *Monolith to Microservices*; Feathers, *Working Effectively with Legacy Code* (seams, sprout, wrap); fitness functions (Ford, Parsons, Kua, *Building Evolutionary Architectures*); architecture decision records; the fallacies of distributed computing; Google SRE golden signals, RED and USE methods; the "six Rs" of cloud migration (Gartner, AWS); NIST SP 800-207 Zero Trust Architecture; OpenTelemetry; the Kubernetes Gateway API.

## Limits
- **Not a security review.** Security-relevant items are flagged for a security specialist.
- Product capabilities and versions change quickly. Statements about the 2025–26 landscape (Gateway API, ambient mesh, controller retirements) are marked as general knowledge; verify them against current vendor documentation before you decide.
- It reviews what you describe. A vague description gets a review full of assumptions; give it the traffic paths, platform, scale, languages, owners and release process.
- Provided as is, without warranty. You are responsible for the decisions you make with it.

## Install
See **`INSTALL.md`** for step-by-step setup in ChatGPT, Gemini, Copilot, Claude, Mistral, local models and APIs. In short:
- **Instructions**: `system-prompt.md` (paste into any tool's instructions / system prompt field).
- **Knowledge**: the 10 files in `references/` (upload as knowledge files).
- **One file only?** Use `api-platform-architect-all-in-one.md`.

## Maintenance
Re-check `references/05-selection.md` (current landscape) and the implementation-styles section of `references/03-service-mesh.md` every six months.

---
MIKA Labs · mikalaboratories.com · info@mikalaboratories.com

Independent work: written by MIKA Labs in its own words. MIKA Labs is not affiliated with, sponsored or endorsed by the authors or publishers of the works named above; titles and names are used only to credit the ideas.
