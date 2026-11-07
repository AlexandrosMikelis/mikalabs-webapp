# Can input corrupt the service, or volume and cost exhaust it?

Step 6 covers what callers send: its shape, its content, and how much of it. Ground truth: OWASP cheat sheets (Input Validation, Injection Prevention, Mass Assignment, SSRF Prevention, GraphQL, REST Security), the validation and business-logic chapters of OWASP ASVS 5.0, CWE entries named below, and RFC 9457 for error responses.

## Is input checked against a contract before it is used?
- Every operation has a machine-readable contract (OpenAPI 3.x, JSON Schema, GraphQL SDL, AsyncAPI) that states types, formats, lengths, ranges and required fields.
- Validation is strict: unknown fields rejected (or explicitly ignored), not silently bound (CWE-915).
- The first component may validate against the contract; the service validates again for its own rules. Edge validation is defence in depth, never the only layer.
- Validation happens on the server, after decoding and normalisation (Unicode, URL encoding, content type), not on what the client claims it sent.
- Files: check type by content, cap size, store outside the web root under generated names, scan where the data class warrants it.

## Is untrusted data kept out of interpreters?
Injection still matters even without its own slot in the 2023 Top 10.
| Interpreter | Control | CWE |
|---|---|---|
| SQL | parameterised queries or a query builder; no string concatenation | CWE-89 |
| NoSQL | typed queries; reject operator objects in user input | CWE-943 |
| OS commands | avoid shells; fixed argument arrays | CWE-78 |
| Templates | logic-less templates or sandboxing; never render user input as a template | CWE-1336 |
| Logs | structured logging; encode user values | CWE-117 |
| LLM prompts | treat model output that drives tool calls as untrusted; authorise every tool call server-side | (no stable CWE yet) |

## Does the API fetch URLs it was given?
Webhook registration, file import, link previews and "fetch my avatar" features make the API a client of the caller's choosing (API7:2023, CWE-918).
- Allowlist destinations where possible.
- Resolve the hostname, then block private, loopback, link-local and cloud-metadata ranges on the resolved address; repeat after each redirect, or do not follow redirects.
- Send outbound fetches through an isolated egress proxy with its own network policy.
- On cloud hosts, require the token-based metadata service (IMDSv2 on AWS, or equivalent).

## Is consumption bounded by identity, cost and flow?
Unbounded consumption (API4:2023, CWE-770) covers more than request counts. Argus checks five budgets, the **MIKA consumption budgets**:

| Budget | Bound | Examples |
|---|---|---|
| Rate | requests per identity per time window | 600/min per client on reads; 10/min per person on sign-in |
| Size | bytes and items per request and response | max body 1 MB; page size ≤ 100; upload ≤ 20 MB |
| Work | compute per request | GraphQL depth ≤ 8 and a cost ceiling; query timeouts; no unbounded sorts or regexes |
| Spend | paid side effects | SMS, email, payment-provider calls, AI model calls: per-identity and global caps with alerts |
| Concurrency | simultaneous work | per-client connection caps; worker-pool limits; shed low-priority traffic when saturated |

Design notes:
- Key limits on the strongest identity available: person, then client, then API key, then IP (IP-only limits fail behind carrier NAT). The counting algorithm matters less than the key, the number and the response; many products ship with no limits at all, so load-test.
- Answer over-limit calls with `429 Too Many Requests` and `Retry-After`. The IETF `RateLimit` header fields are still an Internet-Draft; fine to use, cite as draft.
- When the system itself is saturated, reject by system state and protect priority traffic (ferry check-in over timetable browsing), independent of per-caller limits.
- Internal calls need timeouts, retry budgets with jitter and circuit breakers too; retry storms between your own workloads are a denial of service you inflict on yourself.

## Are sensitive business flows protected from automation?
API6:2023 concerns legitimate flows abused at scale, which limits per request do not catch.
House examples: bulk-booking the last car-deck slots on a holiday sailing to resell them; creating member accounts to farm the co-op's referral credit; scripted appointment grabbing at a popular clinic.
Controls: identify the flows with business value; limit per person and per payment instrument, not only per client; add friction where justified (device signals, proof-of-work, human checks); monitor business metrics (bookings per card per hour) as well as technical ones.

## Do errors reveal too much?
- One consistent error format, ideally RFC 9457 problem details (`type`, `title`, `status`, `detail`, `instance`).
- No stack traces, SQL fragments, internal hostnames or library versions in responses (CWE-209); keep those in internal logs keyed by a correlation ID returned to the caller.
- Sign-in and recovery endpoints give the same answer whether or not an account exists.
- Remove version banners from response headers.

## Is the API safe as a consumer of other APIs?
API10:2023: data from partners and third parties is input too.
- Validate responses against an expected schema; cap their size; set timeouts.
- TLS with certificate verification on every outbound call; credentials from a vault.
- Do not follow redirects from third parties blindly.
- Assess what happens if the supplier is compromised: which of your data classes would it reach?

## Typical findings
| Finding | Starting rating |
|---|---|
| String-built SQL on a D2+ path | Critical |
| Caller-supplied URLs fetched without destination controls | High; Critical if cloud metadata is reachable |
| No rate limits on sign-in, recovery or one-time-code endpoints | High |
| Paid side effects without spend caps | High |
| No page-size or GraphQL cost limits | Medium; High at D3+ list endpoints |
| Stack traces in responses | Medium |
| Sensitive business flow without abuse controls | Medium–High by impact |
Confirm with the scoring rule in `11-severity-and-verdict.md`.
