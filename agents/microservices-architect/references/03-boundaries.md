# Service boundaries

Boundaries are the most expensive decision in a microservice architecture: moving logic between services means changing two contracts, two teams' backlogs and possibly migrating data. Spend time here. For deep domain modelling (EventStorming facilitation, context maps, aggregate design), hand off to Gaia (Domain Modeller); this file gives what a migration architect needs to judge and propose boundaries.

## Three principles behind every good boundary
1. **Information hiding**: a service exposes what consumers need and keeps everything else private. The less it exposes, the more freely it can change. Start with a narrow interface; widening later is easy, narrowing is a breaking change.
2. **Cohesion**: behaviour that changes for the same business reason lives in one service. Test it against recent history: list the last ten feature requests and see how many services each touched.
3. **Loose coupling**: a change in one service rarely forces a change in another. Coupling should be to stable concepts and explicit contracts, never to internals.

## A vocabulary of coupling
Use these names in `review` findings. They run from most acceptable to most harmful.

| Type | What it looks like | Verdict |
|---|---|---|
| **Domain coupling** | Service A calls B because A needs a capability B provides (Scheduling asks Availability for free slots). | Normal and unavoidable. Watch for a service that depends on very many others: it may be doing too much. |
| **Pass-through coupling** | A passes data to B only because C, further downstream, needs it. A change in what C needs forces changes in A and B. | Smell. Let A talk to C directly, have B hide the data entirely, or make B treat the data as opaque. |
| **Common coupling** | Several services read or write the same shared data: a shared table, a shared cache entry, a shared file. | Harmful when more than one writer exists; tolerable for read-only reference data with one owner. |
| **Content coupling** | A service reaches into another's internals: writes to its database, calls private endpoints, depends on its internal state transitions. | Severe. No service may change another's data except through its API. |

Two further couplings matter in practice:
- **Temporal coupling**: A only works if B is up right now (synchronous chains). Mitigate with asynchronous interaction, caching or degraded modes (see `06`, `08`).
- **Deployment coupling**: services must be released together. Any lockstep release is a finding.

## Finding candidate boundaries
### Business capabilities and domain language
Start from what the business does, not from the data model. Useful prompts:
- What are the distinct things the business is responsible for? (Pricing, Claims intake, Fraud scoring, Payout.)
- Where does the same word mean different things? ("Policy" in underwriting vs in customer service.) A change of meaning marks a context boundary.
- Which concepts must be consistent at once (an aggregate), and which can lag?

A **bounded context** (domain-driven design) is a region in which a model and its language are consistent. It is the best default unit for one or a few services. An **aggregate** is a cluster of data changed together under one consistency rule; never split an aggregate across services.

A collaborative workshop that maps business events on a timeline (EventStorming is the usual technique) quickly shows clusters of events, commands and actors that form contexts. Facilitation detail → Gaia.

### Other drivers (combine with the domain view)
- **Volatility**: separate parts that change often from stable parts, so frequent changes ship without risking the stable core.
- **Data sensitivity and compliance**: isolate personal, payment or health data to shrink audit scope and access surface.
- **Tolerance for failure**: separate what must never fail (checkout) from what can degrade (recommendations).
- **Scale profile**: separate a hot path with very different load from the rest — only if load really differs.
- **Technology**: a capability that genuinely needs a different runtime or store (search, ML inference, geospatial).
- **Location and time zones**: where teams sit can shape which capabilities they own.
- **Team ownership**: boundaries should allow one team per service with no shared ownership.

Avoid technical-layer splits (UI service, business-logic service, data service). They maximise coupling: every feature crosses all layers.

### Mixing models
It is normal to use the domain as the primary cut and then make exceptions for compliance, failure tolerance or scale. Record each exception and why.

## Granularity
- Start **coarser** than you think. A service per bounded context is a safer first step than a service per entity. Splitting a service later is far easier than merging two that have diverged.
- Split further only when a concrete driver appears: two teams contend on it, parts need different scaling, or one part changes far more than the rest.
- Warning signs of **too fine**: a single user action triggers a long chain of synchronous calls; services that always deploy together; "entity services" (CustomerService, AddressService) that are thin CRUD wrappers with logic smeared across callers; one team owning 15 services.
- Warning signs of **too coarse**: several teams contend on one service; one part's incidents regularly take down unrelated features; a service has so many responsibilities nobody can describe it in a sentence.

## Testing a proposed boundary
Ask, for each candidate service:
1. Can one sentence in business language state what it does?
2. Does it own the data it needs to do that, and can others get that data only through it?
3. Would the last ten feature requests mostly touch only this service?
4. Can it be deployed alone, and can it run (perhaps degraded) when its dependencies are down?
5. Is one team able to own it end to end without overload?
6. Is the interface narrower than the implementation?
Three or more "no" answers: the boundary is probably wrong.

## Signals that existing boundaries are wrong
Use in `review`:
- Features routinely require coordinated changes in several services and teams.
- Services share a database or write each other's tables.
- Contracts change often, with frequent breaking versions.
- Long synchronous call chains (more than three hops) for common requests.
- A "god" service that everything depends on and that changes in every release.
- Circular dependencies between services.
- Teams negotiate constantly about who owns a feature.
- Large amounts of the same data copied into many services with no clear source of truth.

Fixes: merge services that always change together, move a capability to where its data lives, introduce a clear owner for shared data, replace chatty calls with a coarser API or published events, or re-draw team responsibilities (see `09`).

## Output for `plan` — candidate services
For each candidate list: name, capability (one sentence), data it will own, owning team, coupling it has to others (type), split priority (see `04`), and any boundary exception with reason. Example (invented, a home-insurance monolith):
```
Quoting — calculates premiums for new policies — owns rating tables, quote history — Team Pricing — domain coupling to Customer, Property data — priority 1 (high change rate, clear seam)
Claims intake — records and triages first notice of loss — owns claim drafts, attachments — Team Claims — domain coupling to Policy (read) — priority 2
Policy admin — stays in monolith for now — tangled with billing; extract after billing schema split
```
