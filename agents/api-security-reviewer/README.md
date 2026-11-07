# Argus — API Security Reviewer by MIKA Labs

A reviewer for the security of APIs, for people and for other AI agents. Named after the hundred-eyed watchman. Works with any capable LLM: ChatGPT, Gemini, Copilot, Claude, Mistral, local models and any API or agent framework. Free to download and use.

**Tier: worker.** Argus does one specialist job — API security analysis — and returns results that people can act on and orchestrator agents can parse. It reviews designs and configurations; it never attacks anything.

## What it does
- **Threat-models** an API design or architecture: data classes (D0–D4) and trust boundaries, threats per boundary crossing (STRIDE, plus LINDDUN for personal data), cross-checked against the 2023 OWASP list of API risks, scored with a transparent Critical/High/Medium/Low rule, each with a concrete fix and the component that should own it.
- **Reviews** an existing sign-in and permission setup, OpenAPI document, gateway or platform configuration: which OAuth flows are used and how, token validation, scopes and claims, workload identity, API keys, consumption limits, browser-facing settings, secrets and audit records. Ends with a verdict: Approve / Approve with conditions / Rework / Block.
- **Answers** API security questions: "Do server-side apps need PKCE too?", "Is an API key enough for a partner integration?", "Where should object-level authorisation live?"

## How to use it
**As a person**: describe the design, paste the contract or config, or ask the question. Examples:
- "Threat-model: owner app and clinic portal calling our pet-records API through a gateway; hosted OIDC provider; partner labs push results nightly."
- "Review this OpenAPI document and gateway config: [paste]"
- "Our partner sends an API key plus an `X-User-Id` header. Is that OK?"
- "How long should access tokens live, and do we need refresh-token rotation?"

**From another agent**: send the request with optional headers:
```
MODE: review
FORMAT: structured
CONTEXT: fintech, EU, public API, third-party consumers
<contract, config or design description>
```
With `FORMAT: structured`, threat models and reviews come back as JSON. It never waits for answers: it states its assumptions and lists the open questions that would change a rating.

**Defensive only**: no exploit code, attack payloads or attack walkthroughs, and no testing of systems you don't own.

## What it's built on
Open standards and widely used industry practice: the OWASP 2023 list of API risks, OWASP ASVS 5.0 and the OWASP cheat sheets; STRIDE and LINDDUN; CWE, CAPEC and CVSS v4.0; the IETF OAuth family (RFC 6749, the Security Best Current Practice RFC 9700, RFC 7636, 8628, 8693, 7662, 8705, 9449, 9126, 9396, 9470); the JWT family (RFC 7519, 8725, 9068); OpenID Connect Core and the FAPI 2.0 Security Profile; RFC 9457 problem details; NIST SP 800-207 and SP 800-207A; SPIFFE/SPIRE. On top of these, MIKA's own review structure: data classes with control baselines, an exposure sheet, a credential ladder, an authorisation trace, a control placement matrix and the Argus severity score.

## Limits
- **Not a penetration test.** It reviews what you describe or paste; it doesn't scan, probe or verify running systems.
- **Not legal or compliance advice.** Points on GDPR, PCI DSS, PSD2 and similar are flags to confirm with your compliance team.
- Standards were checked on 7 Nov 2026; OAuth 2.1 is still an IETF draft, so re-verify for decisions that depend on it.
- A vague description gets a review full of assumptions; give it consumers, exposure, data classes, identity provider and grants.
- Provided as is, without warranty. You are responsible for the decisions you make with it.

## Install
See **`INSTALL.md`** for step-by-step setup in ChatGPT, Gemini, Copilot, Claude, Mistral, local models and APIs. In short:
- **Instructions**: `system-prompt.md` (paste into any tool's instructions / system prompt field).
- **Knowledge**: the 11 files in `references/` (upload as knowledge files).
- **One file only?** Use `api-security-reviewer-all-in-one.md`.

## Maintenance
Re-check `references/03-boundaries-and-threat-discovery.md`, `references/05-delegated-access-flows.md` and `references/07-token-handling.md` when OWASP publishes a new API Top 10 or ASVS, when OAuth 2.1 is published as an RFC, or when the OpenID Foundation revises FAPI 2.0.

---
MIKA Labs · mikalaboratories.com · info@mikalaboratories.com

Independent work, written by MIKA Labs in its own words.
