# Are hops encrypted, and does each workload know who is calling it?

Step 7 looks at the plumbing: transport encryption, workload identity, browser-facing settings, and which component carries which control. Ground truth: NIST SP 800-207 and SP 800-207A, NIST SP 800-52 Rev. 2 (TLS guidance), RFC 8446 (TLS 1.3), the SPIFFE specifications (CNCF), Kubernetes documentation on network policy, the public security guidance of the major cloud providers, and the OWASP cheat sheets on TLS and HTTP headers.

## Is every hop encrypted, with the right versions?
- TLS 1.2 minimum with modern AEAD cipher suites, TLS 1.3 preferred; older versions disabled (NIST SP 800-52 Rev. 2).
- HSTS on browser-facing hosts; certificates issued and renewed automatically, with expiry alerts.
- At D3 and above, re-encrypt after the first component: an internal hop in clear text is where one compromised workload reads everything.
- Certificate verification is never switched off in code that reaches production.

## How do workloads prove who they are to each other?
- Each workload gets an identity the platform issues and rotates, not a secret someone copies. Options: SPIFFE identities (`spiffe://trust-domain/path`) in short-lived certificates or JWTs, issued by SPIRE or by a sidecar or node proxy layer; Kubernetes service-account tokens projected with an audience and short expiry; cloud workload identities (IAM roles for AWS compute, managed identities on Azure, service accounts with workload identity federation on Google Cloud).
- Certificates on both ends of each connection (mutual TLS) then authenticate caller and callee.
- **Identity is not permission.** Mutual TLS without call-level policy means every authenticated workload can call every other. Expect rules such as "bookings may call payments on `POST /charges` only", whether written as proxy policy, cloud IAM policy or code.
- After a migration, check that modes accepting plain text are switched off and that cron jobs, batch tasks and legacy hosts outside the proxy layer are accounted for.
- Proxies only see traffic routed through them. Underneath, default-deny network rules per workload for ingress and egress (Kubernetes network policy, cloud security groups), then allow only the required flows, DNS included.
- When the person behind a request matters downstream, pass a verified token as well (token exchange, RFC 8693, narrows it per hop). SP 800-207A asks for both service identity and end-user identity in each access decision.

## Serverless and managed-gateway specifics
- Each function gets its own execution role with only the actions and resources it needs; a shared "lambda-admin" style role across functions is a finding at D2+.
- Managed gateways can validate JWTs or call a custom authoriser function before the backend runs; the backend must still make object-level decisions, and authoriser results that are cached must be keyed on the full token, not on a header that varies less.
- Function URLs, default stage endpoints and storage-bucket URLs can bypass the gateway; check that they are disabled or protected.
- Event-driven paths (queues, topics, storage events) are callers too: restrict who may publish, and validate event payloads as input.
- Provider audit trails (CloudTrail, Azure Activity Log, Cloud Audit Logs) record changes to roles, keys and gateway settings; confirm they are on and retained.

## Which component should carry which control?
The **MIKA control placement matrix**: ✔ = primary home, ◐ = useful extra layer, ✖ = cannot do it reliably.

| Control | CDN / WAF | Gateway | Proxy layer / platform | Service | Identity provider |
|---|---|---|---|---|---|
| Volumetric DDoS absorption | ✔ | ◐ | ✖ | ✖ | ✖ |
| TLS termination for outside callers | ✔ | ✔ | ✖ | ✖ | ✖ |
| Token validation | ✖ | ✔ | ◐ | ✔ (if it reads claims) | ✖ |
| Scope or role per route | ✖ | ✔ | ◐ | ✔ | ✖ |
| Object-level and field-level decisions | ✖ | ✖ | ✖ | ✔ | ✖ |
| Contract validation | ◐ | ✔ | ✖ | ✔ | ✖ |
| Per-identity rate limits | ◐ | ✔ | ◐ | ◐ | ✖ |
| Strip client-set identity headers | ◐ | ✔ | ◐ | ✖ | ✖ |
| Workload identity, mutual TLS | ✖ | ◐ | ✔ | ✖ | ✖ |
| Call-level policy between workloads | ✖ | ✖ | ✔ | ◐ | ✖ |
| Sign-in, MFA, consent | ✖ | ✖ | ✖ | ✖ | ✔ |
| Audit of business actions | ✖ | ◐ | ✖ | ✔ | ◐ |

A design that puts a service-only control anywhere else is a finding. The matrix feeds the `control_point` field in structured output (`mesh` there covers any proxy layer).

## Can traffic bypass the component that checks it?
- If services trust the gateway's validation, they refuse traffic that did not come through it (network rules plus workload identity of the gateway).
- Headers that carry identity (`X-User-Id`, `X-Org`, forwarded-for headers used in decisions) are removed from client requests at the first component and set only by it.
- Direct service URLs, debug ports, metrics and admin endpoints are unreachable from outside.

## Are browser-facing settings tight?
- Cross-origin sharing: an explicit list of allowed origins; never echo an arbitrary `Origin` back with credentials; no wildcard with credentials. It relaxes a browser rule; it does not stop scripts or servers.
- Response headers: `Content-Type` with charset, `X-Content-Type-Options: nosniff`, `Cache-Control: no-store` on D2+ responses, a restrictive `Content-Security-Policy` and `frame-ancestors` on any HTML.
- Session cookies: `Secure`, `HttpOnly`, `SameSite=Lax` or `Strict`, host-only (`__Host-` prefix).

## What happens when a security component fails?
For each component that makes a security decision (gateway, policy engine, identity provider, rate-limit store), the design states whether it fails **closed** (deny) or **open** (allow). The baseline in `02-data-classes-and-baselines.md` expects closed from D2 upward. Undocumented fail-open behaviour on authentication or limits is a finding; check vendor defaults rather than assuming them.

## Typical findings
| Finding | Starting rating |
|---|---|
| D3+ data over plain HTTP anywhere | High |
| Services or function URLs reachable without the validating component | High |
| Mutual TLS on, but no call-level policy | Medium; High at D4 |
| One broad execution role shared by many functions | Medium; High at D3+ |
| Cross-origin policy echoes any origin with credentials | High |
| Fail-open authentication at the gateway on a D3/D4 API | High |
Confirm with the scoring rule in `11-severity-and-verdict.md`.
