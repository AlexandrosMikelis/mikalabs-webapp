# Candidate cards: styles spread across several deployables

Use when a candidate, or the system under review, has several deployables talking over a network. Every card here pays the network bill from `06` (latency, partial failure, consistency, operations). Each must earn that bill through a top-3 target a single deployable cannot meet (P5 in `01`). Judgements are Pallas's own qualitative guidance.

---

## Service-based — a few coarse capability services
Often the most pragmatic step into distribution.

**Axes:** A1 capability · A2 a few (commonly about 4–12) · A3 mostly synchronous · A4 one shared store or a store per business area · A5 any.

**How it is built.** A handful of separately deployed services, each covering a whole business area (sales, operations, finance), usually sharing one database or a few area-scoped ones. Often one user interface, sometimes one per area; an API layer is optional.

**Choose it when**
- you need some independent release, fault isolation and scaling, but not dozens of services;
- transactions inside one business area must stay ACID (one service owns the whole area's workflow);
- team count and operations maturity are moderate;
- as a step from a modular monolith (modules become services).

**Avoid it when**
- per-function elasticity is needed;
- the shared database has become the coupling or scaling bottleneck;
- many teams need to release parts of one area independently.

**Review checks**
- shared-schema changes breaking several services (mitigate with area-scoped schemas and versioned shared entity libraries);
- heavy service-to-service calls, a sign the areas are drawn wrongly.

**House example.** The ferry operator: Sales, Sailing Operations, Customer Care and Finance as four services; Sales and Customer Care share a customer schema owned by Sales.

---

## Microservices — many small services, each owning its data
**Axes:** A1 capability · A2 many · A3 synchronous APIs, messaging or events · A4 store per deployable · A5 per deployable.

**How it is built.** Many small, independently deployable services, each with one purpose and exclusive ownership of its data, usually fronted by an API gateway or backend-for-frontend. Boundaries follow bounded contexts from domain-driven design (Eric Evans) — each service has its own model of its part of the domain (boundary design → **Gaia**).

**Rules that make it work.**
- **Owned data**: others reach a service's data only through the service. This is what makes independent deployment real, and it rules out shared tables.
- **Sizing is the hard part.** Pressures towards *smaller*: parts with different purposes, change rates, load profiles, failure tolerance or security levels. Pressures towards *larger*: a workflow that needs one transaction, chatty conversations between candidate services, heavy shared code, tightly related data. Weigh them per case and record why (decomposition and migration → **Theseus**).
- **Sharing code**: a shared library (no network hop, but version drift and coordinated redeploys) versus a shared service (one place to change, but a runtime dependency and an extra failure point). Decide by how often the shared code changes and how many services use it.
- **Coordinating workflows**: *orchestration* (one service directs the steps — clear state and error handling, more coupling to the orchestrator) versus *choreography* (services react to each other's events — looser, harder to see and debug). Orchestrate workflows with important error paths; choreograph simple, loosely related reactions.
- **Cross-cutting runtime concerns** (mTLS, retries, telemetry) can come from sidecars or a service mesh instead of shared code.

**Choose it when**
- many teams must release independently and often;
- parts have very different scale, availability or security needs;
- change speed, fault isolation and evolvability are top-3 targets;
- the organisation already has strong automation (CI/CD, infrastructure as code), observability and on-call practice.

**Avoid it when**
- the team is small, the budget tight, or the domain uncertain (boundaries will move, and moving them across services is expensive);
- workflows need strong consistency across many services;
- performance depends on long synchronous call chains;
- operations maturity is low.

**Review checks**
- **distributed monolith**: services released together, sharing databases, or chained synchronously;
- services sized by table (CRUD-wrapper components at service level, `04`);
- no contract versioning; no timeouts, circuit breakers or bulkheads, so failures cascade;
- more services per team than the team can sensibly own.

**House example.** A national pet-insurance partner of the clinic network, with twelve teams: Quotes, Policies, Claims Intake, Claims Assessment, Payments and Partner API each as separate services with their own stores.

---

## Event-driven — parts react to published facts
**Axes:** A1 business reactions · A2 several to many · A3 asynchronous events through a broker · A4 shared, per area or per handler · A5 add new subscribers.

**How it is built.** Components (**event handlers**) react asynchronously to events delivered by a broker or event channels. A handler takes an event, does its work, and may publish new events saying what it did. Nobody waits for anybody; work fans out and runs in parallel.

**Ideas to get right.**
- **Event or command?** An event states a fact that has happened ("Sailing cancelled"); the publisher neither knows nor cares who reacts. A command asks a specific receiver to do something ("Send refund") and expects it done. Name which is which; it settles ownership and coupling. Events are named in the past tense.
- **Where facts come from**: some events enter from outside (a passenger action, a meter reading, a port signal); others are published by handlers as they finish their work. Trace both kinds when mapping a workflow.
- **Extensibility**: a new handler subscribes to existing events without touching publishers.
- **Choreography or orchestration**, per workflow: handlers reacting to each other (loose, hard to see end to end) or a workflow engine routing steps and holding state and errors (easier control, coupling to the engine).
- **Async trade**: fast acknowledgement and burst absorption, paid for with eventual consistency, harder error handling and less determinism. Keep synchronous calls where the caller needs the result or strong consistency is required.
- **Durability**: anything that must not be lost needs durable channels and idempotent handlers; fire-and-forget suits notifications.

**Data options.** One shared store (simple, but couples handlers and limits scale), a store per business area, or a store per handler (most independent, most duplication). Decide by how independently handlers must change and scale.

**Choose it when**
- responsiveness, scale and extensibility are top-3 targets;
- work splits into independent reactions that can run in parallel (notifications, fulfilment steps, analytics, integrations);
- the system reacts to many outside signals (devices, markets, user activity);
- new consumers of the same facts keep appearing.

**Avoid it when**
- workflows need strict ordering, synchronous answers or strong consistency across steps;
- end-to-end visibility, testability and simple debugging are top concerns;
- failures need precise compensation;
- the team lacks experience with async systems and tracing tools.

**Review checks**
- nobody owns the end-to-end workflow; nobody can say whether a refund completed;
- missing correlation IDs and tracing;
- lost events (no durable broker, dual writes without an outbox), duplicate processing without idempotency, unhandled poison messages;
- events carrying too much (privacy, coupling to the publisher's model) or too little (consumers call back synchronously);
- event loops.
- Event contracts, delivery guarantees and streaming design → **Okeanos**; Pallas stays at style level.

**House example.** Ferry disruption handling: "Sailing cancelled" fans out to Rebooking, Refunds, Passenger Notices and Port Liaison, each reacting independently.

---

## Space-based — replicated in-memory compute for extreme bursts
**Axes:** A1 hot path · A2 many identical nodes · A3 routed requests, async persistence · A4 in-memory replicas, database behind · A5 rare.

**How it is built.** The aim is to take the database out of the request path when load is extreme and spiky. The idea traces back to tuple spaces (the Linda coordination language, 1980s) and to in-memory data grid products. In outline:
- identical **compute nodes** each hold the application logic and the working data in memory;
- a **request router** sends each request to an available node;
- an **in-memory data grid** keeps the working data in step across nodes (by replication or partitioning);
- an **elastic controller** adds or removes nodes as load changes;
- **write-behind persistence** passes changes from memory to the database asynchronously, and a **warm-up loader** fills new nodes from the database at start.

**Ideas to get right.**
- Elasticity comes from adding nodes fast, with no database in the hot path.
- **Replicated** data (every node holds everything — fastest reads, limited by memory and update rate) versus **partitioned or central cache** (larger data sets, better consistency, one network hop). Decide by data size and update rate.
- **Update collisions**: two nodes may change the same item before replication catches up. The risk grows with update rate, node count and replication lag. Design for it: partition by key, define conflict rules, or accept rare inconsistency where the business allows.
- Durability is eventual: the database trails the in-memory state.

**Choose it when**
- concurrency is extreme and spiky: summer-sailing release day, limited-ticket events, live votes, launch-day sign-ups;
- elasticity and performance are the top targets and occasional eventual consistency is acceptable;
- the working data per request fits in memory.

**Avoid it when**
- data is too large for memory, or changes constantly across many nodes;
- strong consistency and immediate durability are required (ledgers, payment settlement);
- budget, skills or tooling are limited; it is complex to build, test realistically and run.

**Review checks**
- no plan for collisions or replication lag;
- load tests that never reach realistic spikes, leaving the top targets unverified;
- write-behind persistence falling behind under sustained load;
- chosen for steady, moderate load where a simpler shape would do (capacity analysis → **Atlas**).

**House example.** The ferry operator's seat-and-deck hold engine on summer release day only, with the rest of the system service-based.

---

## Bus-centred service-oriented architecture (legacy estates)
An older enterprise shape: services classified by technical role and coordinated through a central orchestration engine or enterprise service bus, aiming for maximum reuse. Mostly met when reviewing legacy estates. Typical problems: the bus becomes a bottleneck and a change gate for every team; reuse turns into tight coupling; business changes cut across many services and teams. The usual direction is towards capability-aligned services with lighter, team-owned integration; migration detail → **Theseus**.

---

## Picking among networked styles
| If the deciding need is … | Look first at | Watch out for |
|---|---|---|
| some independence and resilience without heavy operations | service-based | the shared database becoming the bottleneck |
| many teams releasing independently, different profiles per capability, mature operations | microservices | a distributed monolith; team overload |
| fast acknowledgement, parallel reactions, new consumers appearing | event-driven (alone or as the backbone of services) | invisible workflows; lost or duplicated events |
| extreme, spiky elasticity with in-memory speed | space-based, for the hot path only | collisions; untested spikes; cost |

Mix deliberately — event-driven microservices; a service-based system with a space-based hold engine — and record each part's reason in an ADR.
