# Traffic types and the core choices

## Two directions of traffic
- **North–south (ingress)**: requests that start outside the system (browser, mobile app, partner, third-party system) and enter it. The caller is largely unknown and untrusted; the target is a public or business-facing API. Typical tool: API gateway (or reverse proxy / load balancer). Typical owner: gateway, networking or edge team.
- **East–west (service-to-service)**: calls between internal services within a trust boundary (cluster, data centre, domain). The caller is a known workload; the target is a domain or component API. Typical tool: service mesh or communication libraries. Typical owner: platform / cluster team; configured mostly by developers.
- How they differ in practice:
  - Identity: ingress is about the end user (real-world entity); east–west adds machine (service) identity alongside the user.
  - Authorization: ingress by user role or plan; east–west by service identity or network segment plus user context.
  - TLS: ingress usually one-way and enforced at the edge; east–west can be mutual and made mandatory (strict mTLS).
  - Who writes policy: an ingress team decides who may call the public API; a service team decides which internal callers may reach its service.
- **The line blurs**: "your system" may mean your team, department, organisation or trusted partners. Hybrid and multi-cloud migrations push internal calls across networks. Some practitioners argue the north–south / east–west split matters less than whether a call is an API product (managed, versioned, possibly monetised) or plain service connectivity. Use the split to reason about trust and ownership, not as dogma.

## Choice 1 — How should ingress traffic reach backends?
Options in rising capability:
1. **Reverse proxy**: one entry point to one (or few) backends, TLS termination. Enough for a single app.
2. **Load balancer**: adds many backends, health checks, service discovery. Enough for scaled-out stateless services with no API-specific needs.
3. **API gateway**: adds API-level concerns: composition/aggregation, rate limiting, retries/timeouts, circuit breaking, authN/Z integration, request validation, logs/metrics/traces, and (in enterprise products) API management: keys, plans, developer portal, analytics, monetisation.
Decision questions:
- Is the routing simple (one endpoint → one service)?
- Are there cross-functional needs (rate limiting, auth integration, quotas, contract validation)?
- Is API management needed (keys/tokens per consumer, portal, chargeback/monetisation)?
- Is there already a mandated edge component or an existing gateway?
Guidance: pick the simplest option that meets today's needs and the known near-term roadmap. Advanced cross-cutting needs → gateway. Enterprise with many API consumers and products → gateway with API management. Always check existing mandates and components first; a second gateway is a cost, not a gift.

## Choice 2 — How should services call each other?
Options:
1. **Language libraries / SDKs / framework features**: retries, timeouts, discovery, tracing inside the code. Fine with one language or framework across the estate and modest needs.
2. **Service mesh**: the same concerns moved into infrastructure (proxies, node agents or managed libraries) with a central control plane.
Decision questions:
- One language/framework organisation-wide, or polyglot?
- Only simple REST/RPC routing, or advanced needs (mTLS everywhere, service-level authorization, traffic splitting, consistent resilience policy, uniform telemetry)?
- Is there already a partial solution (shared libraries, ESB, internal proxies)?
- Does the team have the skills and budget to operate a mesh?
Guidance: single stack and simple needs → libraries. Polyglot estate with advanced cross-functional needs → mesh is likely the better long-term fit. A mesh is a hard-to-reverse platform decision; treat it as a one-way door and research accordingly.

## Choice 3 — Gateway, mesh, or both?
- **Gateway only**: few internal hops, or internal calls handled well by libraries; the main pain is ingress.
- **Mesh only**: internal service traffic is the problem and external exposure is minimal. Don't count on the mesh's own ingress gateway to replace a full API gateway (see 04).
- **Both** (common at scale): gateway owns the external contract, consumer management and edge protection; mesh owns internal routing, mTLS, service-level policy, resilience and telemetry. Keep the responsibilities distinct, document which layer does retries, timeouts and rate limits, and avoid duplicating them.
- **Neither yet**: a monolith with a load balancer may be right today. Revisit when you start extracting services or exposing APIs to new consumers.

## Signals that the current choice is outgrown
- Internal services call each other through the public gateway address (loopback, see 04).
- Retry/timeout/circuit-breaker behaviour differs between services written in different languages.
- Certificates and service identity are handled differently in each codebase.
- Routing changes wait on the release train of a monolith.
- Every new API exposure needs tickets to several edge teams.
