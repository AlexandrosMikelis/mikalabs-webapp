# Threat modelling for APIs

## Why and when
- Threat modelling = a structured way to find what can go wrong in a design, how likely and how bad it is, and which countermeasures are worth their cost. It prevents "security theatre": heavy controls in one place while an obvious hole stays open elsewhere.
- Do it **at design time** (cheapest point to change things) and **again** whenever the system changes materially: a new consumer type (third party, public, partner), a new data class (PII, payments, health), a new trust boundary (cloud move, new region, vendor), or a new grant/identity flow. It is iterative; each pass finds things the previous one missed.
- No specialist is required to start. Required: the people who know each part (client, gateway, services, data stores, identity provider) in the room, and the habit of asking "what would an attacker do here?". Security specialists sharpen it; they don't replace the builders.
- Vendor products and open-source components are part of the model. Hold them to the same standard as your own code; track CVEs and be able to rebuild and redeploy affected components quickly.

## The six-step method
1. **Objectives** — what must not happen, in business terms, sourced from across the organisation (not only the team or InfoSec). Examples: no cross-tenant data access; personal data never leaves the EU region; 99.9 % availability under hostile load (availability is a security objective when an SLA penalty or safety issue depends on it); every money-moving action attributable to a person.
2. **Gather information** — architecture, API specs (OpenAPI/AsyncAPI/GraphQL schema), identity setup, deployment topology, data classification, existing controls. Surface hidden assumptions ("only our app calls this", "internal network is trusted").
3. **Decompose** — draw a data-flow diagram (below). One diagram per significant flow if needed.
4. **Identify threats** — systematically, element by element, using STRIDE (below) and the OWASP API Top 10 (`03-owasp-api-top-10.md`) as a prompt list. Tools (e.g., Microsoft Threat Modeling Tool, OWASP Threat Dragon) can generate a starting list; it is never complete.
5. **Evaluate risk** — rate and prioritise (`02-risk-rating.md`), choose mitigations for the likely and severe ones, accept or transfer the rest explicitly.
6. **Validate** — were the objectives met? Are mitigations actually in place and tested? Schedule the next pass.

## Data-flow diagrams (DFD)
DFDs show how data moves (dynamic view); C4 and similar show structure (static view). Threat modelling needs the dynamic view.
| Element | Meaning | API examples |
|---|---|---|
| External entity | Outside your control | Mobile app, browser SPA, partner system, webhook sender, end user |
| Process | Code you run | API gateway, BFF, microservice, worker, authorization server |
| Data store | Where data rests | Database, cache, object store, queue, log store, secrets vault |
| Data flow | A connection carrying data | Client → gateway (HTTPS), service → DB, service → third-party API |
| Trust boundary | Where the level of trust changes | Internet/edge, edge/internal, tenant/tenant, your cloud account/vendor, user-controlled device |

**Every flow that crosses a trust boundary is where authentication, authorisation, validation, encryption and logging decisions must be made explicitly.** Typical API boundaries: internet → gateway; gateway → services; service → service across teams or namespaces; service → data store; service → outbound third-party API (often forgotten); CI/CD → production; admin plane → runtime.

## STRIDE
Apply to **each element and each flow** ("STRIDE per element"), not to the system as a whole.
| Threat | Property violated | API-specific shape | Main control families |
|---|---|---|---|
| **S**poofing | Authentication | Stolen/guessable API keys, replayed tokens, forged JWTs, client impersonation, unauthenticated internal calls | Strong authn (OAuth 2.x, mTLS), short-lived sender-constrained tokens, MFA for users |
| **T**ampering | Integrity | Injection via any input, mass assignment, modified tokens, traffic interception, poisoned cache | Schema validation, parameterised queries, allowlisted bindable fields, signed tokens, TLS |
| **R**epudiation | Non-repudiation | No record of who did what; shared credentials; logs that can be altered | Per-identity credentials, audit logs with actor/action/object/result, tamper-evident storage |
| **I**nformation disclosure | Confidentiality | Over-broad responses, verbose errors and stack traces, version banners, forgotten old/beta endpoints, secrets in URLs or logs | Response shaping per role, error hygiene, inventory and retirement, encryption |
| **D**enial of service | Availability | Floods, expensive queries (deep GraphQL, large pages, unbounded uploads), retry storms, internal call loops ("friendly-fire DoS") | Rate limits, quotas, load shedding, payload/complexity limits, timeouts, DDoS service |
| **E**levation of privilege | Authorisation | Accessing other users' objects (BOLA), calling admin functions (BFLA), injected role headers, over-scoped service credentials | Object- and function-level checks on every request, header stripping, least privilege |

Other methods exist (PASTA, Trike, LINDDUN for privacy, attack trees). STRIDE is the default here because it maps cleanly onto API elements.

## Zonal vs zero-trust assumptions
- **Zonal (perimeter) model**: segments into zones (public, public-access/DMZ, operations, restricted) with controls at each perimeter. Limits blast radius, but tends to authenticate once at the edge and trust everything inside.
- **Zero trust**: never trust by network location; authenticate and authorise every request, everywhere; know every user, service and device identity; authorise via policy; monitor all access. Cloud platforms, supply-chain attacks and insider risk make the "trusted interior" assumption weak.
- In a review, treat "it's internal, so it's safe" as an assumption to test, not a control.

## Good threat-model output
- Scope and objectives stated; assumptions listed.
- Elements and boundaries enumerated (a text DFD is fine).
- Each threat: element, STRIDE category, OWASP mapping where it fits, rating, mitigation, where the control sits (client, gateway, service, IdP, platform), owner role, residual risk.
- Explicit list of accepted risks and of what was out of scope.
