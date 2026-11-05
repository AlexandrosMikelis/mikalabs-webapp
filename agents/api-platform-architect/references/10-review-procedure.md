# Review and planning procedure

Use for `review` (an architecture, design document, diagram description, config summary or proposal) and as the backbone of `plan`.

## Step 0 — Establish the facts (don't skip)
Extract or assume: what the system does and for whom; consumers (browser, mobile, partners, internal); traffic volume and peaks; platform (Kubernetes, VMs, serverless, on-premises, cloud, hybrid); protocols (REST, gRPC, GraphQL, events, WebSockets); number of services and languages; current edge stack and internal communication; ownership of each component; deployment and release process; observability in place; SLAs/SLOs; regulatory or data-location constraints; the change being proposed and its goal.
If information that would change a finding's severity is missing, state the assumption and list it under OPEN QUESTIONS. Agent callers can't answer follow-ups: assume, flag, continue.

## Step 1 — Draw the traffic map
Trace a typical external request and a typical internal call hop by hop: DNS → load balancer → CDN/WAF → gateway → services → data stores; service → service. For each hop note: component, owner, what it does (routing, TLS, auth integration, rate limit, retries, telemetry), and whether it is redundant. This exposes loopbacks, duplicated resilience, missing owners and single points of failure.

## Step 2 — Run the lenses
Consider each; report only what matters for this system.
| Lens | Core questions | Reference |
|---|---|---|
| Fit of the traffic tools | Simplest option that meets needs? Gateway, mesh, libraries or both justified? | 01, 05 |
| Gateway design | Facade not ESB? Right type for the job? Routing on host/path/header? Config as code? | 02, 04 |
| Mesh design | Needed? Style fits (sidecar, ambient, proxyless)? Cost sized? Control plane HA? One owner of retries/timeouts? | 03, 04 |
| Availability & failure | Critical-path components redundant, owned, on call? Failover tested? Fail-open/closed known? | 02, 03 |
| Anti-patterns | Loopback, ESB, layering, mesh-as-gateway, too many layers, monolith router, layer cake? | 04 |
| Release safety | Deploy separated from release? Strategy fits change type and coupling? Automated gates and rollback? Data rollback plan? | 06 |
| Versioning & lifecycle | Breaking-change detection in build? Deprecation windows and usage tracking? | 06 |
| Observability | Metrics/logs/traces with propagation? API-aware errors? Baselines and owned alerts? Cache and header gotchas handled? | 07 |
| Evolution | Destination stated? Goals and fitness functions? Seams and first slice sensible? Facade logic-free? Data consistency during coexistence? | 08 |
| Cloud & hybrid | Strategy per workload? Latency/cost of new boundaries? Edge-first? Network policy under the mesh? | 09 |
| Platform & people | Paved path? Self-service with guardrails? Skills and staffing to run it? Decisions recorded? | 05, 07 |
| Security hand-off | AuthN/Z, mTLS policy, zero trust, header/credential forwarding, WAF, threat model → list under SECURITY REVIEW NEEDED, don't design them | — |

## Step 3 — Rate each finding
| Severity | Meaning | Typical action |
|---|---|---|
| **Critical** | Likely to cause a full or prolonged outage, data loss/corruption, or an irreversible bad release; or the design can't meet a hard requirement (SLA, regulation) | Stop; fix before go-live or before the next step |
| **High** | Significant outage risk, unsafe releases, or a structural problem that will block evolution (e.g., loopback at scale, business logic in the gateway, no rollback) | Fix before launch or before scaling; named owner |
| **Medium** | Real but containable: inefficiency, missing signals, duplicated layers, avoidable cost | Plan in roadmap; monitor |
| **Low** | Good-practice improvement | Optional |
Rate by impact × likelihood × reversibility × blast radius. Critical-path components and data changes weigh more. Severity is about consequences, not about deviation from fashion: an unfashionable but working design is fine.

## Step 4 — Recommend
Concrete (who changes what), proportionate, tied to a finding. Prefer, in order: simplify or remove a component → change responsibility (move logic out of infrastructure, move routing out of the monolith) → add safeguards (redundancy, gates, automated rollback, default-deny) → add process (ADRs, fitness functions, runbooks, drills) → document. "Don't adopt a mesh yet" or "keep the monolith for now" are valid recommendations.

## Step 5 — Verdict
- **Sound** — no High/Critical findings.
- **Sound with changes** — High findings with clear fixes; list them as conditions.
- **Rework** — the core design creates High/Critical issues that local fixes can't solve (wrong tool, wrong boundaries, no deploy/release separation for a high-change system).
- **Stop and rethink** — Critical findings, or the goal itself is unclear or unachievable as framed.
Confidence: High / Medium / Low depending on how much was assumed.

## Planning (`plan` mode)
1. Restate goal and destination (end-state option, see 08) plus cross-functional targets.
2. Inventory starting point (Step 0, Step 1).
3. Slice into steps; each step independently releasable and leaves the system working. Typical order for monolith → services: gateway in front of the monolith (catch-all route) → observability baseline and deploy/release separation → first extracted capability behind its own route with canary → internal discovery (libraries or mesh) before internal calls multiply → further slices → retire legacy routes. For cloud: duplicate gateway in cloud → isolated PoC → one service with progressive traffic shift → connectivity (private links or multicluster mesh) → expand → retire on-premises.
4. For each step: ADR (decision, options, choice, consequences, reversibility), release strategy with signals and thresholds, rollback trigger and mechanism, exit criterion (fitness function).
5. Risks with mitigations; security items to hand off; options rejected.

## ADR template (short form)
```
ADR-<n>: <decision title>
Status: proposed | accepted | superseded by ADR-<m>
Context: <forces, constraints, goals>
Options: <a> / <b> / <c>
Decision: <chosen option>
Consequences: <what gets easier, what gets harder, new risks, cost>
Reversibility: one-way door | two-way door
Review by: <date or trigger>
```

## Common patterns (quick reference)
- **Monolith exposing a first public/mobile API**: a gateway (micro or enterprise depending on API-management needs) in front, monolith as catch-all; separate auth design → security review; baseline metrics before extraction.
- **Extracting the first service**: strangler route at the gateway, not routing via the monolith; feature flag or weighted routing for the cut-over; single writer per entity during coexistence; plan internal discovery before the legacy app calls the new service (avoid loopback).
- **Many polyglot services, inconsistent resilience**: mesh candidate; decide one owner layer for retries/timeouts; size proxy cost; control plane HA; start with telemetry and mTLS, then traffic policy.
- **Mesh proposed "for ingress"**: usually an API gateway instead; mesh later if east–west needs appear.
- **Several chained gateways in an enterprise**: map ownership; collapse layers that don't mark a real trust or organisational boundary.
- **Canary without metrics**: not a canary; add analysis gates and rollback first; check caches.
- **Breaking API change**: new major version side by side, deprecation window, usage tracking, migration guide; spec diff in CI.
- **Lift-and-shift with chatty cross-boundary calls**: move interacting services together or accept and measure latency; private connectivity; review SLAs.
- **Hybrid cloud with zonal on-premises network**: multicluster mesh plus default-deny network policy for consistency; security review of the new perimeter.
- **Kubernetes ingress on a retiring or proprietary controller**: plan a move to a Kubernetes Gateway API implementation (verify current product support).
