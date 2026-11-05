# Gateway, service mesh and edge controls

## Layers
- **Edge stack** (outside in): DNS → CDN/DDoS protection → layer-4 load balancer → WAF → API gateway → services. Larger organisations add a DMZ/perimeter network; for smaller ones the API gateway is often the first real line of defence.
- **North–south** traffic (into the system) is the gateway's job; **east–west** traffic (service to service) is the mesh's or the platform's job. Reviews must cover both.
- Centralising controls at the edge reduces risk across the system and simplifies certificate and policy management — **but** the gateway becomes a high-value target and single point of failure, and edge controls never replace service-level authorisation.

## Gateway controls and what to check
| Control | Purpose | Check |
|---|---|---|
| TLS termination | Confidentiality/integrity in transit, server identity | TLS 1.2+ (1.3 preferred), strong ciphers, certificates managed and auto-renewed centrally, HSTS; re-encrypt to backends in zero-trust designs |
| Authentication | Reject unauthenticated calls early | Token validation per `06-tokens-and-jwt.md`; which routes are anonymous and why |
| Coarse authorisation | Scope/role per route | Deny-by-default route table; admin routes not exposed publicly |
| Schema/contract validation | Reject malformed input early (OpenAPI, JSON Schema, GraphQL schema) | Strict mode (reject unknown fields), size and type limits; services still validate and use parameterised queries — defence in depth |
| Header hygiene | Stop injected trust headers | Allowlist inbound headers; strip `X-User-*`, `X-Role`, `X-Forwarded-*` from clients and set them only at the gateway; remove server/version banners outbound |
| CORS | Control which browser origins may call | Explicit origin allowlist; never reflect arbitrary `Origin` with credentials; no `*` with credentials; limit methods/headers; CORS is a browser relaxation, not an access control for non-browser clients |
| IP allow/deny lists | Restrict partner/admin access | Useful as an extra layer; IPs are not identity |
| WAF | Known attack patterns | Tuned to the API (JSON bodies), not only web forms; logging mode vs block mode |
| Rate limiting | Per-caller fairness and abuse control | See below |
| Load shedding | Protect the system when saturated | See below |
| Response checks | Last-resort data-leak detection | Backstop only; owners must design responses correctly |
| Inventory | Know what's exposed | Every public route registered with owner/version; alert on calls to unknown paths |

## Rate limiting and load shedding
- **Rate limiting** rejects traffic based on properties of the request: too many from this user, client ID, API key, token, IP or region. Choose the key carefully — IP-only limits fail behind NAT and against distributed attackers; per-identity limits need authentication first.
- Algorithms: **fixed window** (N per period; bursty at window edges), **sliding window** (N in the last period; smoother), **token bucket** (allows bursts up to bucket size, refilled at a steady rate), **leaky bucket** (processes at a fixed rate, queues or drops the excess).
- Tighter, dedicated limits on sensitive endpoints: login, token, OTP, password reset, signup, search, export, anything triggering paid side effects (SMS, email, AI inference).
- Also limit cost, not just count: page size, payload size, upload size, GraphQL depth/complexity, batch sizes, request timeouts.
- **Load shedding** rejects requests based on the state of the system (DB saturated, worker pool exhausted), protecting availability for everyone; prioritise critical traffic.
- Return `429` with `Retry-After`; make clients back off with jitter. Many gateways and servers ship with **no** limits by default and undefined behaviour under overload — load-test to find breaking points.
- Large-scale (distributed) DoS is best handled by specialist CDN/DDoS services in front of the gateway.
- **Friendly-fire DoS**: internal services calling each other in loops or retry storms. Apply limits, timeouts, circuit breakers and error monitoring on internal calls too.

## Fail-open vs fail-closed
Know what each security component does when it (or its dependency, e.g., the IdP or policy engine) fails. **Fail-open** keeps serving without the control (sometimes right for emergency-access or public-information services); **fail-closed** blocks (default for financial, government, personal-data APIs). Undocumented fail-open behaviour on an authn or rate-limit component is a finding. Challenge vendor defaults.

## Gateway as single point of failure
The more you put into the gateway, the bigger the blast radius of its outage or misconfiguration — and its configuration changes constantly with releases. Require: config as code with review, staged rollout, automated tests of security policy, monitoring and alerting, a named owning team with SLOs.

## Service mesh and zero trust
- A mesh's data plane (sidecar or node proxies) sits in every service-to-service call, so it can enforce security consistently across languages without library drift: workload identity (e.g., SPIFFE), automatic certificate issuance and rotation, **mTLS**, and service-level authorisation policy ("orders may call payments on POST /charges only").
- Check for **permissive mode** (plaintext still accepted) left on after migration, services or jobs outside the mesh, and whether authorisation policies exist or only mTLS does (mTLS without policy = encrypted, authenticated, but anyone-can-call-anyone).
- The mesh only covers traffic through its proxies. Underneath, lock down the platform: Kubernetes NetworkPolicies default-deny ingress and egress per workload, then allow only required flows (including DNS); node and cluster hardening; supply-chain controls on images.
- **Zero-trust principles**: know your architecture and every user/service/device identity; assess health and behaviour; authorise each request by policy; authenticate and authorise everywhere; monitor all access; trust no network, including your own (NIST SP 800-207 is the reference).
- Edge: strong challenge on ingress (OAuth). Inside: mTLS + workload policy, plus propagated or exchanged user tokens where user context matters.

## Outbound (egress) traffic
- Outbound calls to third parties are a boundary too: TLS with verification, credentials from a vault, timeouts, response validation (`API10:2023`), egress allowlists.
- Features that fetch caller-supplied URLs (webhooks, imports, link previews) need SSRF controls (`API7:2023`): destination allowlists, block private/link-local/metadata addresses after DNS resolution, no redirect following, isolated egress proxy.
