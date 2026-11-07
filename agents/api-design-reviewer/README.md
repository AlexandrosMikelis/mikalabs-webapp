# Hermes — API Design Reviewer by MIKA Labs

A reviewer for API designs and specifications, for people and for other AI agents. Works with any capable LLM: ChatGPT, Gemini, Copilot, Claude, Mistral, local models and any API or agent framework. Free to download and use.

**Tier: worker.** Hermes does one specialist job and returns a structured result. Call it directly, or from a higher-level orchestrator agent (solution design, coding, documentation pipelines).

## What it does
- **Reviews** an OpenAPI, AsyncAPI, protobuf or GraphQL spec, an endpoint list, a design doc or a spec diff, and returns findings rated Critical/High/Medium/Low, each with its location, basis and a concrete fix, plus breaking changes, the tests the API needs and a verdict (Approve / Approve with changes / Rework / Reject).
- **Designs** an API from requirements: style choice (REST, gRPC, GraphQL, events) with reasons, resources and operations, a spec sketch, conventions, testing approach and an ADR for the main decision.
- **Answers** API design questions: versioning, pagination, error formats, idempotency, hypermedia and media types, evolving an API without breaking clients, multi-step workflows over HTTP, contract testing, REST vs gRPC, how to write an ADR.

## How to use it
**As a person**: paste the spec or describe the design, or ask the question. Examples:
- "Review this OpenAPI spec: [paste]"
- "Is this change breaking? [old spec] [new spec]"
- "Design an API for booking vet appointments, used by our clinic app and two partner booking sites."
- "Should our internal pricing service use gRPC or REST?"
- "How do we make POST /payments safe to retry?"

**From another agent**: send the request with optional headers:
```
MODE: review
FORMAT: structured
CONTEXT: public partner API, Zalando guidelines, ~2k req/s
<spec or design>
```
With `FORMAT: structured`, reviews come back as JSON. It never waits for answers: it states its assumptions and lists the open questions that would change a rating.

## What it's built on
Open standards and widely used industry practice: Fielding's REST constraints and the Richardson Maturity Model; Web Linking (RFC 8288), URI Templates (RFC 6570), profiles (RFC 6906, ALPS), service descriptions and API catalogues (RFC 8631, RFC 9727), HAL, JSON:API, Siren and JSON-LD; HTTP Semantics (RFC 9110); Problem Details (RFC 9457); Deprecation and Sunset headers (RFC 9745, RFC 8594); Semantic Versioning; Postel's robustness principle; Microsoft REST API Guidelines, Google API Improvement Proposals (AIP) and Zalando RESTful API Guidelines; OpenAPI, AsyncAPI, Protocol Buffers and GraphQL specifications; OWASP API Security Top 10 (2023); agile testing quadrants, the test pyramid, Pact and the Pact Broker; Architecture Decision Records; the C4 model.

## Limits
- **Not a security audit or load test.** Security and performance points are design-level flags; public or sensitive APIs need a dedicated security review and real measurements.
- It reviews what you give it. An endpoint list without schemas gets a review full of assumptions; give it the spec, the consumers and any house API standard.
- Standards versions (OpenAPI 3.x, RFCs, OWASP 2023) were current on 1 Nov 2026; re-check for decisions that depend on them.
- Provided as is, without warranty. You are responsible for the decisions you make with it.

## Install
See **`INSTALL.md`** for step-by-step setup in ChatGPT, Gemini, Copilot, Claude, Mistral, local models and APIs. In short:
- **Instructions**: `system-prompt.md` (paste into any tool's instructions / system prompt field).
- **Knowledge**: the 12 files in `references/` (upload as knowledge files).
- **One file only?** Use `api-design-reviewer-all-in-one.md`.

## Maintenance
Version 1.1 (Nov 2026): adds hypermedia and media types, evolvability rules for clients and services, discovery, multi-step workflows over HTTP and data-access patterns.
Re-check standards references (OpenAPI, AsyncAPI, IETF drafts for idempotency keys and rate-limit headers) twice a year.

---
MIKA Labs · mikalaboratories.com · info@mikalaboratories.com

Independent work, written by MIKA Labs in its own words.
