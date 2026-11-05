# API security review procedure

Use for `threat-model` (a design, architecture or new API) and `review` (an existing auth setup, OpenAPI spec, gateway/mesh config, code excerpt or design doc). Same steps; `review` spends less time on decomposition and more on checking concrete settings.

## Step 0 — Establish the facts (don't skip)
Extract or assume: what the API does and its data classes (personal, financial, health, credentials); consumers (own web/SPA/mobile app, third parties, partners, internal services, devices); exposure (public internet, partner network, internal); identity provider and grants; token format and lifetime; gateway/mesh/WAF/CDN in place; multi-tenancy; regulatory context (GDPR, PCI DSS, PSD2/open banking, HIPAA — flag for compliance, don't conclude); hosting; who owns what.
If something that would change a rating is missing, state the assumption and list it under OPEN QUESTIONS. Agent callers can't answer follow-ups: never block — assume, flag, continue.

## Step 1 — Objectives
Write 2–5 security objectives in business terms (e.g., no cross-tenant reads; third parties never see users' credentials; payment initiation attributable and non-repudiable; API stays available under abuse). Use the caller's if given.

## Step 2 — Decompose (`01-threat-modelling.md`)
List external entities, processes, data stores, flows and trust boundaries as a text DFD. Mark every flow crossing a boundary. Include outbound integrations, admin paths, CI/CD and logging pipelines if relevant.

## Step 3 — Identify threats
1. STRIDE per element and per boundary-crossing flow.
2. Sweep the OWASP API Top 10 2023 (`03`) for anything missed; cite IDs.
3. Run the topic checklists that apply: authentication and identity (`04`), OAuth/OIDC (`05`), tokens/JWT (`06`), authorisation levels (`07`), gateway/mesh/edge (`08`), secrets/logging/inventory (`09`).
4. Prefer specific, evidenced threats over generic ones. "Gateway doesn't strip `X-User-Id`; orders service trusts it" beats "consider header injection".

## Step 4 — Rate (`02-risk-rating.md`)
| Severity | Meaning | Typical action |
|---|---|---|
| **Critical** | Exploitable by an unauthenticated or any authenticated caller with little effort, leading to broad data exposure, account takeover, money movement or full compromise | Block; fix now; check whether already exploited |
| **High** | Serious compromise likely for a motivated attacker or a subset of users; or a core control missing on a sensitive flow | Fix before launch/exposure; named owner |
| **Medium** | Real weakness with limited impact, or a missing defence-in-depth/detection layer on a sensitive flow | Fix on roadmap with date |
| **Low** | Hardening and hygiene | Optional |
Rate by likelihood × impact × exposure; move up for sensitive data, many tenants or no detection; move down only for tested compensating controls. Never down-rate for obscurity.

## Step 5 — Mitigate
Each mitigation: concrete (what to change), **where** it sits (client, gateway, service, IdP/AS, mesh/platform, process), owner role, and tied to a finding. Prefer, in order: remove the exposure (don't expose it, don't store it, narrow the scope) → standard protocol or platform control → service-level check → detective control (logging, alerting) → process/documentation. Name standards (RFC numbers, OWASP IDs) so engineers can look them up. Point out what's already done well.

## Step 6 — Verdict
- **Approve** — no Critical/High findings.
- **Approve with conditions** — High findings with clear, bounded fixes; list them as conditions.
- **Rework** — the design itself creates High/Critical risk that point fixes won't solve (e.g., third parties asserting user identity with an API key; authorisation only at the gateway for object-level data).
- **Block** — Critical findings unresolved, or the API is already exposed with a Critical issue (recommend incident response).
Confidence: High / Medium / Low, depending on how much was assumed and whether you saw the actual config/spec or only a description.

## Common patterns (quick reference)
- **Public SPA + own API**: authorization code + PKCE; BFF preferred over tokens in `localStorage`; strict CORS; short access tokens; refresh rotation; CSRF protection if cookies are used.
- **Mobile app API**: code + PKCE via system browser; no embedded client secrets (they're extractable); app attestation as a signal, not identity; certificate pinning optional with a rotation plan; BOLA tests on every ID-taking route.
- **Third-party/partner access to user data**: OAuth with consent and granular scopes; never API key + user-ID header; sender-constrained tokens for high-value data; per-partner rate limits and audit; revocation path for users.
- **B2B machine-to-machine**: client credentials with `private_key_jwt` or mTLS; per-client scopes and object restrictions; key rotation; IP allowlist as an extra layer only.
- **Internal microservices**: mesh mTLS in strict mode + service authorisation policies + NetworkPolicies; propagate or exchange user tokens where needed; don't trust gateway-set headers unless the hop is authenticated and the headers are stripped at the edge.
- **Multi-tenant SaaS API**: tenant from token; tenant-scoped queries and caches; cross-tenant tests; per-tenant limits; per-tenant issuer validation if federated.
- **Webhooks (outbound)**: sign payloads with timestamp, document verification; retry with backoff; don't send sensitive data the receiver can fetch securely. **(Inbound)**: verify signature and timestamp, replay window, idempotency, rate limits.
- **GraphQL**: depth/complexity/cost limits; disable introspection in production if not public; field-level authorisation (BOPLA); batching and alias abuse limits; persisted queries for first-party clients.
- **Open banking / payments**: FAPI 2.0 profile (PAR, sender-constrained tokens, strong client auth); fail-closed; strong audit; flag PSD2/PCI for compliance.
- **Legacy API with API keys and Basic auth**: plan staged migration to OAuth (client credentials first); meanwhile key hygiene (entropy, hashing, rotation, scoping, header-only), rate limits, inventory.
- **LLM/agent tools calling APIs** (general knowledge): treat the agent as a client with its own narrowly scoped credentials; user-delegated tokens rather than a shared super-token; human approval for destructive actions; prompt-injected instructions can drive tool calls, so server-side authorisation must not assume the agent is benign.
