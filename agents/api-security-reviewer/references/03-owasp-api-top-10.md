# OWASP API Security Top 10 (2023 edition)

The OWASP API Security Top 10 is a prompt list of the most frequent and damaging API weaknesses, built from breach data, bug bounties and practitioner input. It is not exhaustive and is revised periodically. The 2023 list below is general knowledge (OWASP publication); the 2019 names still appear in older material and are mapped in the last table.

| ID | Name | What goes wrong | Primary controls | STRIDE |
|---|---|---|---|---|
| **API1:2023** | Broken Object Level Authorization (BOLA) | Caller changes an object ID (path, query, body, header) and reads or changes another user's or tenant's object | Check ownership/entitlement of **every** object on **every** request in the service layer; scope queries by tenant/user; unguessable IDs are defence in depth, never the control | E, I |
| **API2:2023** | Broken Authentication | Weak or missing authn, credential stuffing, no lockout/throttling on login/OTP/reset, unverified tokens, tokens in URLs, API keys used as user identity | Standard protocols (OAuth 2.x/OIDC), strict token validation, MFA, rate limits on auth endpoints, no home-grown auth | S |
| **API3:2023** | Broken Object Property Level Authorization (BOPLA) | Merges 2019's *Excessive Data Exposure* (response returns properties the caller shouldn't see) and *Mass Assignment* (request sets properties the caller shouldn't set) | Explicit response DTOs per role; allowlist of writable fields; never bind request bodies straight to persistence entities; response schema validation as a backstop | I, T, E |
| **API4:2023** | Unrestricted Resource Consumption | No limits on rate, payload size, page size, query complexity, upload size, execution time, or on paid downstream resources (SMS, email, AI calls) | Rate limits and quotas per identity, max sizes, pagination caps, GraphQL depth/cost limits, timeouts, spending limits on third-party integrations | D |
| **API5:2023** | Broken Function Level Authorization (BFLA) | Regular user reaches admin or other-role functions (often by guessing paths or switching HTTP method) | Deny by default; role/permission check per operation; separate admin APIs and audiences; test every method on every route | E |
| **API6:2023** | Unrestricted Access to Sensitive Business Flows | Automated abuse of legitimate flows: ticket scalping, referral or coupon abuse, mass account creation, comment spam | Identify sensitive flows; per-flow limits; device/behaviour signals; human verification where justified; business-level monitoring | D, E |
| **API7:2023** | Server-Side Request Forgery (SSRF) | API fetches a caller-supplied URL (webhooks, imports, previews) and reaches internal services or cloud metadata | Allowlist destinations; resolve and block private/link-local ranges; disable redirects; isolated egress; IMDSv2 on cloud hosts | S, I, E |
| **API8:2023** | Security Misconfiguration | Missing TLS, permissive CORS, verbose errors, default credentials, unnecessary HTTP methods, missing security headers, unpatched components, fail-open controls | Hardened, versioned, reviewed config; automated config scanning; header allowlists; patching process | all |
| **API9:2023** | Improper Inventory Management | Unknown, old, beta or debug endpoints and versions still live; undocumented hosts; data flows to third parties not tracked | API catalogue/registry with owner, version, exposure and data class; retire old versions; route all traffic through managed gateways; detect calls to unregistered paths | I |
| **API10:2023** | Unsafe Consumption of APIs | Trusting data from third-party or partner APIs more than user input; following their redirects; no TLS or validation on outbound calls | Validate and sanitise responses from integrations; TLS and authn on outbound; timeouts and limits; assess suppliers' security | T, I |

## 2019 → 2023 mapping (for older documents)
| 2019 | 2023 |
|---|---|
| API1 BOLA | API1 BOLA |
| API2 Broken User Authentication | API2 Broken Authentication |
| API3 Excessive Data Exposure | API3 BOPLA |
| API4 Lack of Resources & Rate Limiting | API4 Unrestricted Resource Consumption |
| API5 BFLA | API5 BFLA |
| API6 Mass Assignment | API3 BOPLA |
| API7 Security Misconfiguration | API8 Security Misconfiguration |
| API8 Injection | Folded into API8/general input validation (still relevant: SQL, NoSQL, command, LDAP, template, log injection) |
| API9 Improper Assets Management | API9 Improper Inventory Management |
| API10 Insufficient Logging & Monitoring | Dropped from the list; still essential (see `09-secrets-logging-operations.md`) |
| — | New: API6 Sensitive Business Flows, API7 SSRF, API10 Unsafe Consumption |

## Using it in a review
- Use it as a checklist **after** STRIDE per element, to catch omissions — not as the review itself.
- Cite IDs in findings as `API1:2023` so callers can aggregate.
- Injection and logging gaps are still findings even though they no longer have their own slot.
- Where controls sit: the gateway can enforce authn, coarse scopes, schemas, limits and header hygiene; **BOLA, BOPLA and fine-grained BFLA must be enforced in the service that owns the data**.
