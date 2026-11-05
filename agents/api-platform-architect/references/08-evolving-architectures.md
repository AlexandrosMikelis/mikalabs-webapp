# Evolving toward API-driven architectures

## Why APIs are the lever
Successful systems have many users, inherent complexity and many integrations, which is exactly what makes them hard to change. An API is a boundary around a module or service, so it is the natural place to raise cohesion and loosen coupling, and to swap what sits behind it.

## Design properties to aim for
- **Cohesion**: everything behind an API belongs to one purpose. Cohesive APIs are easier to reason about, follow least surprise, and concentrate related changes in one place. Pitch the abstraction at the right level: a simple control set for a simple business task, not a cockpit "for future-proofing". Warning sign: a shared "utils" API.
- **Loose coupling**: components can change without breaking each other and know little of each other's internals; they can be replaced, stubbed or virtualised in tests. Warning sign: an API that exposes its data-store schema; changing the store then means either fragile translation code or forcing every consumer to migrate.
- **Information hiding**: expose domain operations, not implementation models. Expose as little as possible at first; it is easy to share more later, hard to take back.

## End-state options (be explicit about the destination)
- **Monolith**: one deployable, one process. Not wrong in itself, often fastest while product–market fit is sought. Risk: accidental coupling; counter with domain-driven design and hexagonal/ports-and-adapters structure inside.
- **Service-oriented architecture**: services over the network. Avoid heavyweight middleware with business logic in the pipes (ESBs, logic in gateways); hardest part is sizing services and assigning ownership.
- **Microservices**: small, independently deployable services with well-defined APIs; smart endpoints, dumb pipes; lightweight protocols (REST, gRPC, lightweight messaging). Hardest part: boundaries; use context mapping and event storming first.
- **Functions**: good for strongly event-driven workloads (reactive pipelines). Risk: functions so fine-grained that many must be orchestrated together and become tightly coupled; allow time for the team to adjust.
A migration with no stated destination drifts, burns budget and morale.

## Managing the evolution
1. **State goals**: functional (features, integrations) and cross-functional ("-ilities": maintainability, scalability, reliability, latency). Catalogue and communicate them; challenge wrong assumptions before coding.
2. **Fitness functions**: automated checks in the pipeline that keep the architecture on target. Categories: code quality (tests, complexity limits); resilience (synthetic traffic in pre-production, fault injection via gateway or mesh, error rate below threshold); observability (required metrics and traces emitted); performance (latency/throughput budgets with production-like data); compliance (audit and data evidence); security (dependency vulnerability and static scans → security specialist sets the rules); operability (monitoring and alerting present).
3. **Record decisions** as ADRs, especially irreversible ones. An irreversible decision is fine; an unexamined one isn't.
4. **Modularise first**: clear modules with one-directional dependencies (e.g., controller → service → data access) inside the monolith. Well-defined modules can later become services (monolith-first evolution) using shared pieces as libraries. Use language-level module enforcement and C4 component diagrams to make boundaries visible.
5. **Find seams**: points where one part meets another and can be substituted (via interfaces and dependency injection). Recipe for legacy code without tests: identify change points → break dependencies → write tests → change → refactor. A seam used in many places is a candidate for an inter-service API.
6. **Find change leverage points**: churn analysis from version control, complexity metrics, change-failure rate per subsystem, support-ticket volume, and teams' own confidence in changing an area. Hot, complex, failing areas are where extraction pays off first. Never waste a crisis: catalogue problem components after incidents.
7. **Continuous delivery and verification**: more deployables only pay off with automated deployment, release separation (06) and verification.

## Migration patterns
- **Strangler fig**: build new capabilities beside the old system and gradually move traffic until the old part can be removed. Two routing styles:
  - *In-process*: a feature flag in the legacy code calls the old path or the new API (good when the seam is inside the codebase).
  - *Facade at the edge*: a gateway or proxy routes each path to legacy or new; consumers keep the same API and don't notice. One route per extracted capability; legacy keeps the catch-all. Use when many out-of-process consumers exist.
  Cautions: the facade must be highly available (it's a new single point of failure) and must stay logic-free so it can be removed or kept as a plain gateway; keep data consistent while old and new run side by side (single writer per entity, change-data capture or dual-write with reconciliation); pick the first slice for value and low coupling, often a read-heavy, well-bounded capability.
- **Facade vs adapter**: a facade simplifies and routes; an adapter converts representations (e.g., SOAP-RPC to REST, JSON to gRPC). Adapters add coupling and fidelity risk; when a gateway starts converting rather than routing, reconsider the component.
- **Avoid API layer cake** (see 04).

## Breaking coupling
- Release choreography across services is the clearest symptom of coupled APIs; fix with compatible changes, versioning and contract tests.
- Legacy techniques: **sprout** (write new, tested code elsewhere and call it from an insertion point) and **wrap** (rename the old method, create a new one with the old signature that adds behaviour and delegates).
- Performance problems: measure current state → hypothesis → test → verify; optimise the whole path; watch for architectural causes such as calls across regions or the internet; automate measurement in the build.
- Working with legacy code is a skill: pair on hard areas, practise with katas.
