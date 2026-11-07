# Which gateway, mesh or proxy product, and how sure are we?

Daedalus does not recommend a product from memory. It turns the call ledger and the control-point decisions into requirements, scores candidates against them, and insists on a proof of concept that includes failure and upgrade drills. Product facts change monthly; anything version-specific is stated with a date and a "verify" note.

## 1. Requirements with owners
Write each requirement as a sentence tied to a ledger row or a release need, then tag it:
- **Must**: a named owner and a date when it is needed (e.g., "per-partner quotas for the Fares API by the spring timetable launch; owner: partner team").
- **Should**: valuable, with an owner, but a workaround exists.
- **Could**: nobody owns it yet. Treat as nice-to-have until someone does.
Add constraints: runtime (Kubernetes or not, which clouds, on-premises), protocols (HTTP/2, gRPC, WebSockets, MQTT bridging), latency budget per hop, regulatory and data-residency limits, team skills and headcount, licence and support model.

## 2. Inventory before shopping
- What already routes, protects or observes traffic? Include appliance load balancers, a monolith doing authentication, home-grown client libraries, proxies someone installed for one team, a legacy integration bus.
- Is there an organisational standard or contract already signed?
- Which of these could be extended instead of replaced?
Older estates usually need consolidation onto one standard more than they need one more component.

## 3. Build, adopt or buy
Default: adopt an open-source project or buy a supported distribution; build your own gateway or mesh only if it is your product. Honest costing includes engineering, patching, upgrades, on-call, documentation, onboarding and the cost of several home-grown variants side by side.

## 4. MIKA's control-point scorecard
Score each candidate 1–5 per criterion; multiply by the weight; a 1 on any criterion marked ◆ disqualifies regardless of total.
| Criterion | Weight | What a 5 looks like |
|---|---|---|
| ◆ Meets every Must requirement | 5 | All Musts in the PoC, not just in the datasheet |
| Standard configuration model | 4 | Kubernetes Gateway API conformance for the features you use (and GAMMA for a mesh); config portable to another implementation |
| Operability | 4 | Clear HA model; no extra stateful dependency, or one that is itself HA and in DR plans; documented upgrade order and version skew; config validation; one-step revert |
| ◆ Failure behaviour understood | 4 | You have watched it fail in the PoC: control plane down, data store down, bad config pushed |
| Developer self-service | 3 | Teams own their routes in their repositories within guardrails set by the platform team |
| Open formats for metrics and traces | 3 | OpenTelemetry traces and metrics or Prometheus metrics; W3C Trace Context propagation out of the box |
| Release tooling fit | 3 | Works with your progressive delivery tool (03) for weights, mirroring and header routing |
| Security integration (assessed by a security specialist) | 3 | Identity provider and policy engine integration, workload identity, declared fail modes |
| Community or vendor health | 2 | Regular releases, responsive security process, several maintainers or a support contract |
| Total cost (licences, compute, people) | 2 | Fits the budget at the scale expected in 24 months |
Record scores, evidence and dissent in the decision record (10).

## 5. Proof of concept that proves something
Run it on a real, non-critical route of one of your systems, for example the ferry operator's timetable lookup or the clinic network's opening-hours API:
1. Route, rate-limit and observe real traffic; confirm traces join up end to end.
2. Shift traffic between two versions with your release tool and roll it back.
3. Kill the control plane; kill one traffic-carrying instance; push a deliberately broken configuration. Record what users would have seen.
4. Upgrade the product by one minor version under traffic.
5. Hand a route change to a service team and time how long it takes without platform help.
6. Estimate the exit: how much configuration would need rewriting to move to another implementation?

## 6. What kind of door is it?
- Adopting a mesh, and choosing which one: one-way door. Research, pilot, record, state the exit cost.
- A product with developer portal, consumer keys and billing integration: close to one-way, because consumers and contracts attach to it.
- A gateway that implements Kubernetes Gateway API, used through standard resources: closer to two-way.
- Individual routes, timeouts and release policies: two-way. Iterate.

## Landscape notes (as of November 2026; verify before deciding)
- **Kubernetes Gateway API** is the standard routing API for Kubernetes clusters; core resources have been GA since v1.0 (October 2023), GRPCRoute since v1.1 (2024), and the project ships regular v1.x releases with conformance reports per implementation. The Ingress API is frozen but not removed.
- **ingress-nginx**: Kubernetes SIG Network announced its retirement in November 2025, with best-effort maintenance until March 2026; after that, no new releases or security fixes were planned. Estates still on it should treat migration as a priority (see "proxy on borrowed time" in 08). Confirm the current state on kubernetes.io before quoting dates.
- **Meshes**: see the style table in 06. Linkerd's release and support model has changed in recent years; check how its stable releases are distributed today before assuming a free supported channel.
- **Standards worth preferring**: the SPIFFE identity format (07), OpenFeature for flags and OpenTelemetry for traces and metrics (03, 04).
Never present a product capability as fact without the product's current documentation; say it is general knowledge and suggest verification.
