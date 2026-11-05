# API gateways

## What it is
A management point at the edge of a system (or of a subsystem) that is the single entry for a defined group of APIs. Two planes:
- **Control plane**: where operators and teams declare routes, policies and telemetry.
- **Data plane**: where requests are actually routed, policies enforced and telemetry emitted.
They may ship together or be deployed separately. At the network level a gateway behaves as a reverse proxy (protects servers), unlike a forward proxy (protects clients).

## What it is for
- **Reduce coupling**: act as a facade (new, simpler interface) or adapter (bridge between existing interfaces). As long as the published contract holds, backends can move, change language or be split without consumers noticing. This is what makes gateways useful in migrations.
- **Simplify consumption**: aggregate several backend APIs into one consumer-facing API, run independent backend calls in parallel, translate protocols (e.g., SOAP behind a REST-like facade, gRPC behind JSON). Costs: fidelity testing of translations, compute per request, and the risk that business logic leaks into the gateway. Aggregation that reorders calls can change results when backends aren't idempotent.
- **Protect from overuse and abuse**: rate limiting, load shedding, IP allow/deny lists, request/contract validation, TLS termination, WAF integration. For small organisations the gateway may be the first line of defence; enterprises usually have CDN, WAF and DMZ in front. Design of authN/Z and threat model → security review.
- **Observe consumption**: the edge sees almost every request, so it is the place for top-line rate, errors and latency, and for injecting correlation/trace IDs that downstream services propagate. Data only helps with dashboards, alerts and owners.
- **Manage APIs as products**: lifecycle from planning to retirement (build, test, publish, secure, manage, onboard with docs/portal/sandbox, analyse, promote, monetise, retire). Lifecycle features couple tightly to the gateway product, so choose carefully if API management is a goal.
- **Monetise**: plans, quotas, billing integration, internal chargeback.

## The edge stack
Typical layers from outside in: DNS → global/regional L4 load balancing → CDN / edge cache → WAF / DDoS protection → API gateway → services. These are often separate components with separate owners (or third-party services); some gateways bundle several layers. Many layers with many teams slow every change; when migrating to a new platform, question whether all layers are still needed.

## Placement
- **Startup / SMB**: one gateway (multiple instances for availability) at the edge of the cloud or data centre, fronting the whole backend.
- **Enterprise**: a gateway in the perimeter edge stack plus further gateways per product, line of business or region, often different products with different features, governance and hardware constraints.

## Gateway types (taxonomy)
| Type | Built for | Typical traits |
|---|---|---|
| Traditional enterprise gateway | Exposing and managing business APIs with full lifecycle management | Admin UI, developer portal, catalogue, per-consumer metering; often open-core/commercial; depends on external data stores that must themselves be highly available and in DR plans |
| Microservices / micro gateway | Routing ingress to backend services | Declarative config shipped with each service's deployment; developer-focused metrics; uses the platform (e.g., Kubernetes) for state; often built on modern proxies (e.g., Envoy) and integrates well with meshes |
| Service mesh gateway | Getting external traffic into a mesh | Minimal API features, limited identity-provider/WAF integration; coupled to the mesh's lifecycle; poor first choice if you don't run that mesh |
Naming is inconsistent in the industry: "edge proxy" usually means a general L3/L4 proxy without API features; "ingress controller" is the Kubernetes mechanism for traffic entering a cluster. Clarify which one a design means.

## Routing practice
- Route on host, path, headers or query; use path rewrites so extracted services don't depend on the public prefix.
- Add one route per extracted capability during a strangler migration; the legacy app keeps the catch-all route until it shrinks to nothing (see 08).
- Don't route on request bodies: it couples the gateway to payload schemas and costs parsing time.
- Keep routing and policy config in version control, reviewed and deployed through pipelines; give service teams self-service within guardrails.

## Availability and failure
- A gateway at the edge is on the critical path: its outage is usually a full outage; a downstream gateway's outage takes out a subsystem. The more logic in it, the larger the risk.
- Its configuration changes with almost every release, so config errors are a leading failure cause. Validate, canary and be able to roll back gateway config like code.
- Run multiple instances across zones/regions; configure and **regularly test** health checks and failover in the load balancer in front. Be careful with active/passive or leader-based modes.
- Failover pitfalls: sticky sessions breaking because state didn't move; users routed to a distant region when a nearer one is healthy; leader-election bugs that cascade into total outage.
- Know whether security components **fail open** or **fail closed** on error; the right answer differs between, say, a content site and a payment system. Flag for security review.
- One accountable owning team, on call proportionate to the SLA; SLOs published to consumers; blameless post-incident reviews shared widely.
