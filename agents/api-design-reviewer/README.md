# Hermes — API Design Reviewer by MIKA Labs

A reviewer for API designs and specifications, for people and for other AI agents. Works with any capable LLM: ChatGPT, Gemini, Copilot, Claude, Mistral, local models and any API or agent framework. Free to download and use.

**Tier: worker.** Hermes does one specialist job and returns a structured result. Call it directly, or from a higher-level orchestrator agent (solution design, coding, documentation pipelines).

## What it does
- **Reviews** an OpenAPI, AsyncAPI, protobuf or GraphQL spec, an endpoint list, a design doc or a spec diff, and returns findings rated Critical/High/Medium/Low, each with its location, basis and a concrete fix, plus breaking changes, the tests the API needs and a verdict (Approve / Approve with changes / Rework / Reject).
- **Designs** an API from requirements: style choice (REST, gRPC, GraphQL, events) with reasons, resources and operations, a spec sketch, conventions, testing approach and an ADR for the main decision.
- **Answers** API design questions: versioning, pagination, error formats, idempotency, contract testing, REST vs gRPC, how to write an ADR.

## How to use it
**As a person**: paste the spec or describe the design, or ask the question. Examples:
- "Review this OpenAPI spec: [paste]"
- "Is this change breaking? [old spec] [new spec]"
- "Design an API for booking conference sessions, used by our mobile app and a partner CFP system."
- "Should our internal pricing service use gRPC or REST?"
- "How do we make POST /payments safe to retry?"

**From another agent**: send the request with optional headers:
```
MODE: review
FORMAT: structured
CONTEXT: public partner API, Microsoft REST guidelines, ~2k req/s
<spec or design>
```
With `FORMAT: structured`, reviews come back as JSON. It never waits for answers: it states its assumptions and lists the open questions that would change a rating.

## What it's built on
Informed by *Mastering API Architecture* (James Gough, Daniel Bryant, Matthew Auburn; O'Reilly, 2022), together with published standards and guidelines: Fielding's REST constraints and the Richardson Maturity Model; HTTP Semantics (RFC 9110); Problem Details (RFC 9457); Deprecation and Sunset headers (RFC 9745, RFC 8594); Semantic Versioning; Postel's robustness principle; Microsoft REST API Guidelines, Google API Improvement Proposals (AIP) and Zalando RESTful API Guidelines; OpenAPI, AsyncAPI, Protocol Buffers and GraphQL specifications; OWASP API Security Top 10 (2023); agile testing quadrants (Marick; Crispin & Gregory), the test pyramid (Cohn), consumer-driven contracts (Pact); Architecture Decision Records (Nygard); the C4 model (Brown).

## Limits
- **Not a security audit or load test.** Security and performance points are design-level flags; public or sensitive APIs need a dedicated security review and real measurements.
- It reviews what you give it. An endpoint list without schemas gets a review full of assumptions; give it the spec, the consumers and any house API standard.
- Standards versions (OpenAPI 3.x, RFCs, OWASP 2023) were current on 1 Nov 2026; re-check for decisions that depend on them.
- Provided as is, without warranty. You are responsible for the decisions you make with it.

## Install
See **`INSTALL.md`** for step-by-step setup in ChatGPT, Gemini, Copilot, Claude, Mistral, local models and APIs. In short:
- **Instructions**: `system-prompt.md` (paste into any tool's instructions / system prompt field).
- **Knowledge**: the 10 files in `references/` (upload as knowledge files).
- **One file only?** Use `api-design-reviewer-all-in-one.md`.

## Maintenance
Re-check standards references (OpenAPI, AsyncAPI, IETF drafts for idempotency keys and rate-limit headers) twice a year.

---
MIKA Labs · mikalaboratories.com · info@mikalaboratories.com

Independent work: written by MIKA Labs in its own words. MIKA Labs is not affiliated with, sponsored or endorsed by the authors or publishers of the works named above; titles and names are used only to credit the ideas.
