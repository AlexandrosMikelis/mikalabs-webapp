# Rating and prioritising API threats

## Principle
Rate by **likelihood × impact**, adjusted for exposure. A finding's rating should survive a sceptical engineer asking "how, exactly, and so what?". Be explicit about what you assumed.

## Factors to weigh
| Factor | Higher when… |
|---|---|
| Exposure | Internet-facing, unauthenticated, documented or easily discovered, used by third parties |
| Attacker effort | Needs only a valid low-privilege account, a changed ID, a replayed token, a script |
| Impact on data | Personal, financial, health, credentials, secrets, cross-tenant data |
| Impact on integrity | Money movement, account takeover, configuration or permission changes |
| Impact on availability | Shared edge component (gateway, IdP) or a contractual/safety SLA |
| Scale | Many users or tenants affected at once; bulk extraction possible |
| Detectability | No logging/alerting, so abuse would go unnoticed |
| Reversibility | Leaked data and stolen funds can't be recalled |
| Compensating controls | Real, tested controls elsewhere lower the rating; assumed ones don't |

## DREAD (qualitative scoring)
Score each threat 1–10 on **D**amage, **R**eproducibility, **E**xploitability, **A**ffected users, **D**iscoverability; average them. Useful for ranking a long list consistently, but scores are subjective, so define anchors first (e.g., Affected users: 10 = everyone, 7 = all of one user population, 3 = a fraction of one group, 0 = nobody).
- **DREAD-D** drops Discoverability, because scoring a threat lower for being hard to find rewards security through obscurity. Prefer DREAD-D.
- **CVSS** (v3.1/v4.0) rates the technical severity of a known vulnerability (used by NIST for CVEs). Good for third-party component vulnerabilities; less good for design threats because it ignores business context.
- **OWASP Risk Rating Methodology** (likelihood factors × technical and business impact) is a reasonable middle ground (general knowledge).

## Mapping to this agent's severity scale
| Severity | Typical API examples | Expected action |
|---|---|---|
| **Critical** | Unauthenticated access to sensitive data or admin functions; BOLA across tenants on a public API; JWT signature not verified or `alg: none` accepted; secrets or private keys exposed; auth bypass via injectable trusted header | Block release; fix now; consider incident response if already live |
| **High** | BOLA/BFLA requiring a valid account; long-lived bearer tokens to third parties without sender constraint; ROPC or implicit grant on a public client; ID tokens accepted as access tokens; no rate limiting on login, OTP or password reset; mass assignment of privileged fields; fail-open authn at the gateway on a financial API | Fix before launch or exposure to new consumers; named owner |
| **Medium** | Excessive data exposure of non-sensitive fields; missing audit trail for sensitive actions; verbose errors; weak CORS policy; no inventory of versions; coarse scopes; service-to-service traffic unauthenticated inside one trusted cluster | Fix in roadmap with a date; monitor meanwhile |
| **Low** | Hardening and hygiene: security headers, shorter token lifetimes, documentation gaps, defence-in-depth duplicates | Optional / backlog |

Adjust one level up for regulated or sensitive data, for many tenants, or for missing detection; one level down when a tested compensating control exists. Never lower a rating because a vulnerability "is hard to discover".

## Accepting risk
Accepted risks need a named owner, a reason, a review date and, where possible, a detective control. "We'll fix it later" without these is not acceptance.
