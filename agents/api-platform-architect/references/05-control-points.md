# Which component enforces routing and policy on each call?

A **control point** is any component that can route, observe or refuse a call: a load balancer, a reverse proxy, a gateway, a client library, a per-pod proxy or a node agent. Daedalus chooses control points per row of the call ledger (see 01), aiming for the fewest that cover every row, with one owner per concern.

## For calls entering the system: the entry ladder
Climb only as far as the ledger forces you. Each rung adds capability, cost and something new to run.
| Rung | Component | Climb to it when |
|---|---|---|
| 0 | Platform load balancer or Kubernetes `Service` of type LoadBalancer | One service, TLS handled by the platform, no per-consumer needs |
| 1 | Reverse proxy or layer-7 load balancer | Several backends behind one hostname; path or host matching; health checks |
| 2 | Gateway (routing tier) | Per-route timeouts, rate limits, request validation, auth integration, trace start, weighted routes for releases, declarative config owned by service teams |
| 3 | Gateway with API management | Product rows with outside consumers: per-consumer credentials and quotas, developer portal, usage analytics, plans or chargeback |
Rules: rows with caller trust A/C/P and contract kind Product usually justify rung 2; rung 3 only when someone owns the API-as-product work (onboarding, documentation, plans). Check what already exists before climbing: a second gateway is a cost, not a feature. Whatever the rung, it routes and protects; business rules, cross-service orchestration and body-based routing belong in services (a composition need is met by a small backend-for-frontend owned by the consuming team).

### Kubernetes Gateway API as the configuration model
The Kubernetes Gateway API (SIG Network; v1.0 GA in October 2023, now in the v1.x series) splits configuration by role, which maps onto ownership: the platform team picks the implementation (`GatewayClass`) and owns listeners, hostnames and certificates (`Gateway`); application teams own their `HTTPRoute` or `GRPCRoute` objects in their own namespaces. Prefer it over vendor-specific CRDs or annotation-heavy Ingress objects where the implementation supports it: routes become portable and role boundaries are enforced by RBAC rather than convention. The Ingress API remains available but is frozen. Check the implementation's conformance report for the features you rely on (weights, header matching, mirroring, timeouts).

### Placement
- **Small estate**: one gateway deployment, several replicas across zones, in front of everything.
- **Larger estate**: a shared entry point at the perimeter plus further gateways only where trust or ownership genuinely differs (product line, region, regulated domain). Each extra one must mark a real boundary; otherwise it is the relay of gatekeepers smell (08).
- **Global consumers**: anycast or DNS-based global load balancing, CDN and DDoS protection in front of regional entry points; each layer has a named owner.

## For calls between your own workloads: libraries, mesh or neither?
Platform service discovery (cluster DNS) plus sensible client defaults is enough for many estates. Climb to a shared library or a mesh only when the ledger's W rows demand it. MIKA's **mesh readiness score** makes the call explicit; score each criterion 0–2:

| Criterion | 0 | 1 | 2 |
|---|---|---|---|
| Languages and frameworks in production | one | two | three or more |
| Services that call other services | < 10 | 10–40 | > 40 |
| Need for workload identity and encryption on every internal call | none stated | some regulated paths | mandated everywhere |
| Need for per-request steering between services (weighted routes, fault injection, per-caller limits) | none | occasional | every release |
| Consistency of metrics and traces today | uniform via shared library | patchy | absent or inconsistent |
| Platform team capacity to run it (upgrades, certificates, on-call) | none | part-time | dedicated |

- **0–4**: platform discovery plus a shared resilience and observability library (or framework defaults). Revisit at the next big change.
- **5–7**: pilot a mesh on one namespace or domain with a narrow goal (identity and metrics first), or adopt a lighter style (06). Define what would make you stop.
- **8–12**: a mesh is likely the better long-term fit. Choose a carrying style (06), plan control-plane availability, and record it as a one-way-door decision.
A 0 on platform capacity caps the result at "pilot", whatever the total: an unowned mesh is worse than none.
When an estate ends up with both a gateway and a mesh, the gateway keeps the outside contract (consumer identity, quotas, published versions) and the internal layer keeps workload identity and internal resilience. Using Gateway API routes on both sides (GAMMA, 06) keeps release tooling uniform.

## One owner per concern
For every path that crosses more than one control point, fill this table. Two ticks in a row is a finding (retry echo, duplicated limits, TLS ended twice with the client identity lost in between).
| Concern | Entry gateway | Mesh / library | Application |
|---|---|---|---|
| Timeouts (per hop, shrinking toward the back) | | | |
| Retries (one layer only, with a budget, idempotent calls only) | | | |
| Rate limits and quotas | | | |
| Where TLS ends and is re-established | | | |
| Authentication of the caller | | | |
| Authorisation decision | | | |
| Trace start and propagation | | | |
| Circuit breaking / outlier detection | | | |

## Who runs the control points? The operating model
A control point nobody runs well is worse than none. For each one, Daedalus checks:
| Question | Healthy answer |
|---|---|
| Which team is accountable, and is it staffed for it? | One named team; on-call matching the SLO the component supports |
| How do service teams get a change made? | Self-service through pull requests to their own route and policy files, validated in CI, with platform review only for shared settings |
| How is a bad change undone? | Configuration in version control, progressive rollout, one-step revert |
| What happens when it fails? | Replicas across failure domains, failover tested on a schedule, documented behaviour when its control plane or data store is down, declared fail-open or fail-closed per security filter (07) |
| How are its costs shared? | Compute and licence costs visible per consuming team (showback or chargeback), so growth decisions have an owner |
| How do teams learn it? | A paved-path template, short docs, office hours; adoption measured, not mandated |
| How is it kept current? | Upgrade calendar inside the supported version window; end-of-life dates tracked (see "proxy on borrowed time", 08) |
An entry gateway outage is usually a full outage; a mesh control-plane outage usually freezes configuration rather than dropping traffic, but new pods may get no identity or routes. Write down which applies before go-live, and publish an SLO for the control point itself.
