# Microservice architecture review procedure

Use for `review` (an existing or proposed service estate: diagram, service list, design document, repository layout, incident history). The same steps check the feasibility of a `plan` when a caller asks for a plan review. Work through every step; skip a lens only if the input clearly makes it irrelevant, and say so.

## Step 0 — Establish the facts (don't skip)
Extract or assume:
- **Services**: names, what each does, approximate count, languages and runtimes.
- **Data**: which store each service uses; any shared schemas or tables; reporting path.
- **Interactions**: synchronous calls, messages and events between services; anything with more than two hops on a user request.
- **Teams**: how many, how many people, which team owns which service, who is on call.
- **Delivery**: repositories, pipelines, how often each service deploys, whether releases are coordinated.
- **Platform and operations**: hosting, orchestration, logging, metrics, tracing, alerting, SLOs.
- **Context**: business domain, scale (requests, data volume), regulatory constraints, the goal that led to microservices.
If a fact that would change a rating is missing, state an assumption and list it under OPEN QUESTIONS. Agent callers can't answer follow-ups: never block — assume, flag, continue.

## Step 1 — Restate the system and its purpose
One line for SYSTEM. Then note the goal (from the caller, or inferred) — the review measures the architecture against it. An estate that serves its goal with some untidiness is healthier than a textbook estate that doesn't.

## Step 2 — Map services to capabilities and teams
Build a quick table: service → capability → data owned → team. Look for:
- Services without a business capability (technical-layer services, entity CRUD services).
- Services owned by several teams, or by none.
- Teams owning more services or domains than they can carry (cognitive load).
Use `03` and `09`.

## Step 3 — Walk the lenses
For each lens, note concrete evidence. Each finding needs a location (service, interaction, table, team) and a reason.

| Lens | Key questions | Reference |
|---|---|---|
| **Coupling** | Lockstep releases? Pass-through, common or content coupling? Circular dependencies? Shared libraries carrying domain models? | `03`, `06` |
| **Data** | Shared databases or tables? One writer per data set? Cross-service transactions and how they're handled? Reporting path? | `05` |
| **Communication** | Synchronous chain lengths? Explicit schemas? Breaking-change detection and versioning? Event quality? | `06` |
| **Resilience** | Timeouts, bounded retries, idempotency, bulkheads, breakers? Degraded modes? Redundancy? Tested failover and restores? | `08` |
| **Testing** | Per-service tests; contract tests; size and ownership of end-to-end suites; production verification? | `07` |
| **Deployment** | Independent pipeline per service? Build once, promote? Zero-downtime? Rollback time? | `07` |
| **Observability** | Central structured logs, correlation IDs, tracing, SLOs, actionable alerts with owners? | `08` |
| **Security (basics)** | Per-service credentials, service-to-service authentication, user context for authorisation, secrets handling, patching? Depth → Argus. | `08` |
| **Organisation** | Team–service alignment, real ownership, on-call model, platform and paved road, guardrails, UI ownership? | `09` |

## Step 4 — Spot the classic patterns
Check explicitly for these recurring problems:
- **Distributed monolith**: services that must deploy together, shared database, or a combined version set tested as one release.
- **Shared database**: several services writing the same tables.
- **Chatty synchronous chains**: many hops per user request; outages cascade.
- **Entity services**: thin CRUD services with logic scattered among callers.
- **Nanoservices**: so many tiny services that operational cost exceeds benefit; one team owning very many.
- **God service**: one service everything depends on and every change touches.
- **Orphaned services**: no real owner; outdated dependencies.
- **Logic in the pipes**: business rules in gateways, BFFs, mesh filters or message routers (pipes routing logic → Daedalus).
- **End-to-end test bottleneck**: a long shared suite gating all releases.
- **Missing platform**: each team hand-builds pipelines, logging and infrastructure.
- **Org mismatch**: component teams (front end, back end, database) owning slices of every service.
- **Front-end bottleneck**: one UI team must change for every feature.

## Step 5 — Rate severity
| Severity | Meaning | Typical action |
|---|---|---|
| **Critical** | Causes or will soon cause serious outages, data loss or corruption, a security exposure, or blocks the organisation's main goal (e.g. no service can be released alone, defeating the reason for the architecture) | Act now; may justify pausing new feature work |
| **High** | Regularly slows delivery across teams, makes incidents long or likely, or puts data integrity at risk under realistic conditions | Fix this quarter; named owner |
| **Medium** | Real friction or risk with limited blast radius, or a missing safeguard that will matter as the estate grows | Put on the roadmap with a date |
| **Low** | Hygiene, consistency, documentation | Optional |
Rate by impact × likelihood × breadth (how many services or teams are affected). Move up when the issue affects customer-facing journeys, regulated data or many teams; move down only for working compensating measures, not for good intentions.

## Step 6 — Recommend fixes
Each fix is concrete (what changes), names an owner role (owning team, platform team, architecture group, leadership), and ties to a finding. Prefer, in order:
1. Remove the cause (merge services that always change together; give data one owner; delete the old path).
2. Change the interaction (asynchronous instead of synchronous; coarser API; publish events).
3. Add a safeguard (timeouts, breakers, contract tests, guardrails in the template).
4. Improve visibility (tracing, catalogue, dashboards).
5. Process and documentation.
Suggest the migration pattern from `04` or `05` when a fix requires moving code or data. Note what's already sound under STRENGTHS.

## Step 7 — Handoffs
List under HANDOFFS any topic that needs another specialist rather than a superficial answer:
- Gateways, service mesh, canary and release traffic → Daedalus (API Platform Architect).
- Deep domain modelling and context mapping → Gaia (Domain Modeller).
- Event streaming platforms, topics, stream processing → Nereus (Event Streaming Architect).
- API resource and contract design → Hermes (API Design Reviewer).
- Threat modelling and authentication/authorisation depth → Argus (API Security Reviewer).
- Load testing and capacity planning → Atlas (Scalability Reviewer).

## Step 8 — Verdict
- **Healthy** — no Critical or High findings; the estate serves its goal.
- **Healthy with changes** — High findings with clear, bounded fixes; list them as conditions.
- **Restructure** — boundaries, data ownership or team alignment are wrong in ways that point fixes won't solve; re-draw boundaries or ownership, using incremental patterns.
- **Consolidate** — the estate is too fine-grained, or the organisation can't support it; merge services back into fewer services or a modular monolith. Say so plainly; consolidation is a valid outcome, not a failure.
Confidence: **High** when you saw concrete artefacts (service lists, dependency graphs, pipeline configs, incident data); **Medium** for a detailed description; **Low** for a sketch with many assumptions.

## Plan feasibility check (when reviewing a plan)
Check that each step: has a goal tied to an outcome; uses a suitable pattern; keeps the system releasable; addresses data ownership, not just code; has a rollback trigger and mechanism; has a measurable exit criterion; puts irreversible steps last. Flag big-bang steps, missing data moves, and plans that extract the hardest capability first.

## Common situations (quick reference)
- **"We have 40 services and release weekly together"** — distributed monolith. Per-service pipelines; contract tests; break the combined release; merge services that always change together.
- **"All services share one big database"** — introduce ownership per table set, wrapping services or views as coping steps, then move data per service (`05`).
- **"Checkout calls eight services"** — shorten the synchronous path: local copies via events, coarser APIs, asynchronous fulfilment (`06`).
- **"Three engineers, twelve services"** — consolidate toward a modular monolith or a few coarse services.
- **"Every incident takes hours to diagnose"** — correlation IDs, tracing with OpenTelemetry, SLO-based alerts, a change timeline (`08`).
- **"Platform team builds what nobody uses"** — treat the platform as a product; start from stream teams' biggest toil (`09`).
- **"Our ops team runs everything we build"** — shift production support to the teams that own each service, beginning with business-hours rotations (`09`).
- **"We want to move to microservices next quarter"** — run `assess` first; check readiness (`02`).
