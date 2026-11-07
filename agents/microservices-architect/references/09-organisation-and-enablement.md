# Organisation, ownership and enablement

Microservices are as much an organisational choice as a technical one. The architecture only delivers autonomy if teams are structured, empowered and supported to use it. Most failed migrations failed here.

## Conway's law and its inverse
**Conway's law**: systems end up mirroring the communication structure of the organisation that builds them. Three component teams produce a three-layer system; two teams that never talk produce two subsystems with a crude interface.
- **Use it deliberately**: shape teams around the business capabilities you want as services, and the architecture tends to follow — often called the inverse Conway manoeuvre.
- **Check alignment in reviews**: map services to teams. A service owned by several teams, or a team whose services span unrelated domains, signals friction.
- A reorganisation is a cheaper experiment than a re-architecture — but a disruptive one. Don't reorganise every quarter.

## What does a team that can own services look like?
Traits MIKA looks for in teams that run services well:
- **Aligned to a business area** and long-lived, so they accumulate domain knowledge and care about outcomes.
- **Cross-functional**: the skills to design, build, test, release and operate their services without hand-offs. Individuals are T-shaped: deep in one area, able to contribute across.
- **Right-sized**: roughly 5–9 people (general rule of thumb); small enough for trust and quick decisions.
- **Strong ownership** of a defined set of services.
- **Sustainable cognitive load**: the team can hold its services, domain and tooling in mind. Too many services, too many technologies or too broad a domain causes slow delivery and incidents. Cognitive load (from Team Topologies) is a better limit on service count per team than service size.
- **Autonomy, mastery and purpose** as motivators; high trust and psychological safety so problems surface early.
- A culture that is open, learning-oriented and empowering. The Westrum typology distinguishes pathological, bureaucratic and generative cultures; DORA research links generative culture with delivery performance.

## Team types and interaction modes
Team Topologies (Skelton & Pais) offers a useful vocabulary:
- **Stream-aligned teams**: own a flow of business change (a product area, a customer journey) end to end. Most teams should be these.
- **Platform teams**: provide internal self-service capabilities (deployment, observability, data stores) as a product, to reduce stream teams' cognitive load.
- **Enabling teams**: specialists who help other teams adopt a capability (testing practice, security, observability), then step away.
- **Complicated-subsystem teams**: own a part needing rare expertise (a pricing engine, video encoding).
Interaction modes: **collaboration** (working closely for a period, e.g. during a discovery), **X-as-a-service** (consume with minimal coordination — the target for platforms), **facilitating** (coaching). Make the current mode explicit and expect it to change.

## Autonomy, and its limits
Autonomy means a team can make decisions and ship without waiting for others. It needs:
- **Alignment on outcomes**: teams know the goals and measures (OKRs or similar) and choose how to meet them.
- **Light-touch governance**: guardrails rather than approval gates; trust but verify through automated checks and visibility.
- **Responsibilities in return**: autonomous teams actively own their services, communicate changes that affect others, meet agreed standards, and keep a short public team page (what they own, how to contact them, on-call).
- **Limits**: autonomy stops at choices that affect others or the organisation's risk (security, data protection, shared contracts, costly technologies).
- **Minimum competencies**: agree what every team must be able to do (deploy, monitor, respond to incidents, patch) and fund the learning time.

## Ownership models
| Model | Description | Fit |
|---|---|---|
| **Strong ownership** | One team owns a service; others propose changes (e.g. by pull request) which the owner reviews | Default for microservices; clear accountability |
| **Collective ownership** | Any team may change any service | Works in small, high-trust organisations with shared standards; erodes as scale grows |
| **Owner in name only** | A team is listed as owner but has no time or knowledge | Common for "finished" services; a risk — nobody patches, nobody understands |
| **No ownership** | Orphaned services | High risk; find or assign an owner, or decommission |

**Real ownership** applies when a service is "feature complete" as well: someone keeps dependencies patched, runs migrations, supports it in production, keeps docs current and can respond within hours to an urgent vulnerability. Track ownership in a **service catalogue**: services, owners, dependencies, runtimes and libraries, data classifications, runbooks, SLOs. It should be API-driven, extensible and able to show views across the estate (e.g. "which services use library X version Y?"). Expect services to be retired: decommissioning is part of ownership.

When transferring ownership: agree quality expectations (tests, docs, alerts) before handover, do an operational handover with shadowing, or consider replacing the service if it is cheaper.

## Who carries the pager for a service?
Microservices imply DevOps: the team that builds a service also supports it in production.
- Teams release on demand and own operational features (health checks, alerts, runbooks, dashboards).
- Getting comfortable in production: dedicated in-hours support rotation within the team, improving alerts and documentation, deliberately exploring the fragile corners of the system that everyone avoids, and regular practice.
- **Night and weekend on-call**: reserve it for services whose SLO demands it; make pages rare by fixing what causes them; pay for it fairly; allow opt-outs where the rota can absorb them; give responders runbooks and a clear escalation path.
- **Incident management**: blameless culture; clear roles (incident lead, communications, scribe); a simple way to raise an incident; post-incident reviews focused on learning, with tracked actions.

## What should a platform team provide, and when?
A **platform** removes undifferentiated work from stream teams: provisioning, pipelines, observability, secrets, data stores, service templates.
- Build the **thinnest viable platform**: start with documentation and curated managed services before building custom tooling.
- Treat the **platform as a product**: talk to users, measure adoption and satisfaction, market it, retire what nobody uses.
- Cover the common case first: the default path should fit most services; teams with unusual needs may leave it, owning what they pick instead. When an exception proves useful, fold it into the default.
- **Tests for a good paved road**: teams choose it because it saves them time, not because they are forced; they can use it without raising a ticket; a named team maintains it and answers questions; the secure, observable option is the easiest one; and teams can swap out or add a piece without abandoning the rest.
- Contents: a service template with pipeline, logging, tracing, health checks and security scanning wired in; client libraries and examples; a service catalogue; an internal developer portal if scale warrants (Backstage is a common open-source option).
- **Measure impact**: time to first deploy of a new service, lead time, adoption share, developer satisfaction surveys.
- **When to invest**: once several teams repeat the same setup work; not before the first few services exist and the needs are understood.

## Governance and standardisation
Governance exists so that the estate stays secure, compliant, affordable and understandable — not to approve every decision.
- **Know your estate** (the catalogue above). Insight leads to action.
- **Guardrails and policies**: a short list of non-negotiables (e.g. every service has an owner, structured logs with trace IDs, encryption in transit, no secrets in code, supported runtime versions). Automate checks in pipelines and the platform; publish compliance dashboards.
- **A technical governance group** of senior engineers from teams to agree guardrails and technology choices, with decisions recorded (architecture decision records).
- **Technology choice**: manage a lifecycle (assess → trial → adopt → hold → retire; technology-radar style). Spend innovation where it differentiates the business; elsewhere prefer proven, "boring" technology. Limit alternatives per category (e.g. two languages, one queue technology) to keep support and hiring manageable. Be explicit about where duplication is acceptable.
- **Keeping things up to date**: plan for emergency patches, minor routine upgrades and major migrations; prefer managed services; immutable infrastructure; decide who decides, schedule the work, and communicate clearly. Unmaintained services become the next incident.

## User interfaces
UI ownership must follow the service decomposition, or a single front-end team becomes the bottleneck for every feature.
- **Dedicated front-end team** with a monolithic UI: works for small organisations; becomes contention as teams grow.
- **Stream-aligned teams owning UI slices**: each team ships its part of the experience; share design specialists and a design system for consistency.
Technical patterns:
- **Monolithic front end**: simple; one team or one deploy.
- **Page-based decomposition**: different pages/paths served by different teams' front ends. Simple, effective for web.
- **Widget-based decomposition / micro frontends**: components from different teams composed on one page; needs agreed integration contracts, shared design system, and care over payload size and dependencies.
- **Central aggregating gateway**: one API layer aggregating calls for all UIs; becomes a bottleneck and a shared-ownership problem.
- **Backend for frontend (BFF)**: an API layer per user experience (mobile, web, partner), owned by the team building that experience; aggregates and tailors calls. Keep business logic in services, not BFFs.
- **GraphQL** as an aggregation layer: flexible queries for clients; watch performance and ownership.

## Growing pains to anticipate
Problems tend to arrive in roughly this order as an estate grows; flag the next one before it bites.

| Stage (approximate) | Typical new pain | Prepare with |
|---|---|---|
| First few services | Nobody can follow a request across services; outages cascade through unprotected calls | Correlation IDs, tracing, timeouts and breakers as template defaults (`08`) |
| Around ten services | Shared test environment queues; interface changes break other teams; analysts lose their single database | Contract tests and per-service pipelines (`07`), versioning rules (`06`), a reporting feed (`05`) |
| Several teams | Laptops can't run the system; every team picks different tools; operational toil multiplies | Stubs and remote environments, guardrails and a technology lifecycle, a platform with managed services |
| Dozens of services and reorganisations | Services with no real owner; finished services nobody patches | Service catalogue, real ownership, decommissioning |

## Review prompts for this lens
- Does every service have exactly one active owning team? Who patches finished services?
- Do team boundaries match service boundaries?
- How long does it take to create and deploy a new service on the paved road?
- What are the guardrails, and are they checked automatically?
- Who supports services out of hours, and how often are they paged?
- Is a single front-end team a bottleneck?
