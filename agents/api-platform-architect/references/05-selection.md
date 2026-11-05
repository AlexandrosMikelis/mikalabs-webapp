# Selecting a gateway or mesh

## Start from requirements, not products
List current pain points and the 12–24-month roadmap. Group needs under:
- **Gateway**: reduce coupling between frontends and backends; simplify consumption (aggregation, translation); protect APIs from overuse and abuse; understand consumption; manage APIs as products (lifecycle, portal); monetise or charge back.
- **Mesh**: reduce internal coupling; consistent resilience across languages; internal traffic control for releases; uniform service-level telemetry; workload identity, mTLS and service-level authorization; manage internal APIs (catalogue).
Rank them. A requirement no one can name an owner for is a nice-to-have.

## Take stock of what exists
- Is a gateway or mesh already in use anywhere? Is there an organisation mandate?
- Has a combination already been assembled (hardware load balancer + monolith doing auth and routing; homegrown libraries; sidecars deployed by an SRE team; an ESB)?
- How many components make up the edge stack today, and who owns each?
- Partial, scattered implementations are common in older distributed estates; the goal is usually to standardise, not to add one more.

## Constraints
Team skills and size, people available to run the platform, budget, licensing model, on-premises vs cloud vs hybrid, Kubernetes or not, protocols in use (REST, gRPC, WebSockets, events), latency budget, regulatory and data-location rules, support needs (vendor SLA, community).

## Build vs buy
Default: adopt an open-source or commercial product; don't build your own gateway or mesh. Common errors when building:
- **TCO underestimated**: engineering, ongoing maintenance, upgrades, security patches, on-call.
- **Opportunity cost ignored**: unless you are a platform vendor, a custom gateway or mesh is no competitive advantage.
- **Operational cost of variety**: several in-house solutions to the same problem multiply onboarding and support.
- **Landscape unawareness**: this market moves fast; keeping current is part of the technical leader's job.

## Selection checklist (record the answers in the ADR)
1. Requirements identified and prioritised, with owners?
2. Existing solutions and mandates inventoried?
3. Team and organisational constraints known (skills, staffing, budget)?
4. Future roadmap considered (more APIs, more languages, cloud move, multi-cluster)?
5. Build vs buy costed honestly (TCO of current DIY pieces vs candidates)?
6. Landscape surveyed (analyst reports, community health, release cadence, real references)?
7. Stakeholders consulted: developers, QA, architecture board, platform team, InfoSec, operations, finance?
8. Proof of concept on a real, non-critical path, including upgrade and failure drills?
9. Exit plan: how hard is it to replace? Is config portable (standard APIs vs proprietary resources)?

## Evaluation criteria to score
- Fit: protocols, routing features, policy model, extensibility without business logic.
- Operations: HA model, external dependencies (data stores that must also be HA and in DR), upgrade path and version skew, config validation, rollback of config.
- Developer experience: declarative config in the service repo, self-service within guardrails, local development story, portal/catalogue if needed.
- Observability: native metrics/traces in open formats (OpenTelemetry, Prometheus), trace-context propagation.
- Security features (to be assessed by a security specialist): identity integration, mTLS, policy engine integration, fail-open/closed behaviour.
- Cost: licences, compute for proxies, people.
- Portability and lock-in.

## Current landscape — general knowledge beyond the source (2025–26; verify before relying on versions)
- **Kubernetes Gateway API** is the standard successor to the Ingress resource: role-oriented resources (GatewayClass for infrastructure providers, Gateway for cluster operators, HTTPRoute/GRPCRoute etc. for application teams), richer matching, header modification and weighted backends for traffic splitting. Its core reached v1.0 (GA) in 2023. Many gateways and meshes implement it, and the GAMMA initiative applies the same route resources to east–west mesh traffic. Prefer it over proprietary routing resources where your products support it: it eases portability and ownership boundaries.
- The community ingress-nginx controller has been announced for retirement (best-effort maintenance ending in 2026); designs still depending on it should plan a move to a Gateway API implementation or another maintained controller. Verify current status.
- Meshes: sidecar, ambient/sidecarless and eBPF-based options coexist (see 03). Envoy remains a common data-plane proxy for gateways and meshes.
- Feature-flag standardisation: OpenFeature (CNCF) offers a vendor-neutral flag API.
- Don't state product-specific capabilities as fact without checking the product's current documentation.

## Type of decision
Choosing to adopt a mesh, and which one, is a **one-way door** (costly to reverse): research, prototype, record. Choosing a gateway product is close to that when API management, portal and consumer keys are involved. Route definitions and release policies are two-way doors: iterate.
