# Service mesh

## What it is
An infrastructure layer that handles the calls between your own services: routing, resilience, observability and security, applied outside application code. Optimised for east–west traffic, where the caller is a known internal workload. Not to be confused with mesh networking (a low-level network topology).
- **Control plane**: where teams declare routes, policy and telemetry (e.g., as Kubernetes custom resources applied via pipeline); a controller turns that into data-plane config.
- **Data plane**: the proxies (or kernel/library equivalents) that carry traffic and enforce the config. In a mesh the planes are always separate deployments.
- Unlike a gateway, a mesh data plane maps roughly one-to-one with services and doesn't aggregate calls across services.
- Mesh proxies are **full proxies**: they terminate and re-originate connections on both sides, so they can observe, rewrite or drop anything, at a cost in resources and latency.

## Capabilities
- **Routing and discovery**: resolve logical service names to changing locations without code changes; normalise names across environments (same code, environment-specific targets).
- **Resilience**: consistent timeouts, retries, circuit breakers, outlier detection, bulkheads and fallbacks across all languages. Retries need budgets and idempotent operations, or they amplify overload.
- **Traffic control**: shaping (prioritise some traffic, e.g., paid vs free tier), policing (enforce a contract; stop a misbehaving internal caller from overloading a fragile dependency), splitting (weighted routing for canaries and A/B), mirroring (copy traffic to a dark version). These make the mesh a release tool (see 06).
- **Transparent observability**: L7 and L4 golden metrics per service and per caller/callee pair, topology graphs, sampling, without redeploying apps when telemetry changes. Apps still need their own business metrics, logs and trace-context propagation.
- **Security**: workload identity (e.g., SPIFFE-style certificates), automatic certificate issuance and rotation, mTLS, service-to-service authorization ("only A and B may call C", default-deny). Policy design → security review.
- **Polyglot consistency**: implement cross-cutting behaviour once in infrastructure instead of once per language ("infrastructure dependency injection").
- Some meshes add catalogue, portal or policy audit features, but this is less common than in gateways.

## Where it runs and how it fits the network
- Inside a cluster or network; large estates run several meshes, often one per network segment or business domain, optionally federated across clusters.
- Exposure outside the mesh uses ingress, egress, terminating or transit ("mesh") gateways; these have far fewer API features than an API gateway.
- It works between OSI layers 3 and 7, on top of platform networking (Kubernetes Services, NetworkPolicies, CNI plug-ins). It can add cross-cluster routing, L7 load balancing (important for long-lived multiplexed HTTP/2 and gRPC connections, which defeat L4 balancing), and identity-based policy. Network policy underneath is still needed for defence in depth (see 09).

## Implementation styles
| Style | How | Upgrades | Strengths | Limits |
|---|---|---|---|---|
| Libraries (incl. proxyless gRPC) | Networking logic linked into each app; proxyless variants get config from a control plane via xDS | Rebuild and redeploy apps | No extra hop or process; full in-app context | One implementation per language, kept in lockstep; subtle cross-language differences; proxyless gRPC only covers gRPC traffic |
| Sidecar proxy | A proxy process beside each app instance in the same network namespace | Redeploy/restart sidecars (often zero-downtime) | Language-agnostic; mature; most widely deployed | Resource cost multiplies with instance count (memory can grow with mesh size unless scoped); extra hops; injection and startup-ordering issues |
| Kernel / node-level (sidecarless) | eBPF in the kernel for L3/L4, plus a shared per-node or per-namespace proxy for L7 | Update node components or kernel programs | Lower resource use and latency; harder to bypass | Newer; L7 features depend on the shared proxy; noisy-neighbour and shared-fate concerns on a node |
General knowledge beyond the source (as of 2025–26, verify versions): the sidecarless direction now includes "ambient" designs that split a per-node L4 secure-overlay component from optional per-service or per-namespace L7 waypoint proxies; Istio's ambient mode reached general availability in late 2024. Cilium offers eBPF-based mesh features; Linkerd remains sidecar-based with a lightweight proxy. Hybrid meshes mixing sidecar and proxyless workloads exist. Choose the style by traffic types, resource budget, the L7 features you really need and operational maturity, not by trend.

## Cost of running a mesh
- Sizing: proxies × instances. Even a small estate can run a hundred proxies; tune the config each proxy receives (scope to the services it actually calls) to keep memory sane.
- Operational: installation, upgrades of control plane and data plane (in a defined order and version skew), certificate authority management, debugging an extra layer.
- Skills: the team must understand both the mesh and the underlying network.

## Failure
- The mesh is on the hot path of nearly every internal call; an outage hits everything within its blast radius. The more you rely on it, the bigger that radius.
- Config changes constantly (it drives releases), so treat mesh config like code: review, validate, stage, canary, roll back.
- The **control plane** is the most sensitive component: run it highly available, monitor it, restrict access to it, and know what the data plane does when the control plane is down (usually keeps last-known config; new workloads may not get identity or routes).
- Apply the gateway availability practices from 02: owner, on-call, SLOs, tested failover, post-incident learning.

## Libraries vs mesh — quick test
Single language or framework, simple routing, small team → libraries. Several languages, many services, need for uniform mTLS/policy/telemetry and traffic-based releases → mesh. Already have scattered partial solutions (libraries in one place, an ESB elsewhere, ad-hoc proxies) → consolidate on one standard rather than add another.
