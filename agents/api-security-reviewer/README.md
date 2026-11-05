# Argus — API Security Reviewer by MIKA Labs

A reviewer for the security of APIs, for people and for other AI agents. Named after the hundred-eyed watchman. Works with any capable LLM: ChatGPT, Gemini, Copilot, Claude, Mistral, local models and any API or agent framework. Free to download and use.

**Tier: worker.** Argus does one specialist job — API security analysis — and returns results that people can act on and orchestrator agents can parse. It reviews designs and configurations; it never attacks anything.

## What it does
- **Threat-models** an API design or architecture: data-flow model with trust boundaries, threats per element (STRIDE), mapped to the OWASP API Security Top 10 (2023), rated Critical/High/Medium/Low, each with a concrete fix and where it belongs (client, gateway, service, identity provider, mesh).
- **Reviews** an existing auth setup, OpenAPI spec, gateway or mesh configuration: OAuth 2.x grants and PKCE, OIDC and ID-token misuse, JWT validation, scopes and claims, mTLS and service identity, API keys, rate limiting, CORS, header hygiene, secrets and audit logging. Ends with a verdict: Approve / Approve with conditions / Rework / Block.
- **Answers** API security questions: "Do we still need PKCE for a confidential client?", "Is an API key enough for a partner integration?", "Where should object-level authorisation live?"

## How to use it
**As a person**: describe the design, paste the spec or config, or ask the question. Examples:
- "Threat-model: public SPA and mobile app calling our orders API through Kong; Auth0 as IdP; partners pull order data nightly."
- "Review this OpenAPI spec and gateway config: [paste]"
- "Our partner sends an API key plus an `X-User-Id` header. Is that OK?"
- "How long should access tokens live, and do we need refresh-token rotation?"

**From another agent**: send the request with optional headers:
```
MODE: review
FORMAT: structured
CONTEXT: fintech, EU, public API, third-party consumers
<spec, config or design description>
```
With `FORMAT: structured`, threat models and reviews come back as JSON. It never waits for answers: it states its assumptions and lists the open questions that would change a rating.

**Defensive only**: no exploit code, attack payloads or attack walkthroughs, and no testing of systems you don't own.

## What it's built on
Informed by *Mastering API Architecture* (James Gough, Daniel Bryant, Matthew Auburn; O'Reilly, 2022) for threat modelling, gateway, service-mesh and OAuth/OIDC foundations, updated with current published standards: OWASP API Security Top 10 (2023); STRIDE and DREAD; CVSS; IETF OAuth 2.0 (RFC 6749), PKCE (RFC 7636), OAuth 2.0 Security Best Current Practice (RFC 9700) and the OAuth 2.1 draft; Device Grant (RFC 8628); Token Exchange (RFC 8693); mTLS-bound tokens (RFC 8705); DPoP (RFC 9449); PAR (RFC 9126); JWT (RFC 7519), JWT BCP (RFC 8725) and JWT access-token profile (RFC 9068); OpenID Connect Core and FAPI 2.0; NIST SP 800-207 Zero Trust Architecture; SPIFFE.

## Limits
- **Not a penetration test.** It reviews what you describe or paste; it doesn't scan, probe or verify running systems.
- **Not legal or compliance advice.** Points on GDPR, PCI DSS, PSD2 and similar are flags to confirm with your compliance team.
- Standards were checked on 1 Nov 2026; OAuth 2.1 is still being finalised, so re-verify for decisions that depend on it.
- A vague description gets a review full of assumptions; give it consumers, exposure, data classes, identity provider and grants.
- Provided as is, without warranty. You are responsible for the decisions you make with it.

## Install
See **`INSTALL.md`** for step-by-step setup in ChatGPT, Gemini, Copilot, Claude, Mistral, local models and APIs. In short:
- **Instructions**: `system-prompt.md` (paste into any tool's instructions / system prompt field).
- **Knowledge**: the 10 files in `references/` (upload as knowledge files).
- **One file only?** Use `api-security-reviewer-all-in-one.md`.

## Maintenance
Re-check `references/03-owasp-api-top-10.md` and `references/05-oauth-and-oidc.md` when OWASP publishes a new API Top 10 or OAuth 2.1 is published as an RFC.

---
MIKA Labs · mikalaboratories.com · info@mikalaboratories.com

Independent work: written by MIKA Labs in its own words. MIKA Labs is not affiliated with, sponsored or endorsed by the authors or publishers of the works named above; titles and names are used only to credit the ideas.
