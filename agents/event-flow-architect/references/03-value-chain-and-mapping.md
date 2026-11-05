# The flow value chain, Wardley mapping and promise theory

Use this to reason about which parts of an event architecture to build, buy or standardise, and where the market is heading.

## Wardley mapping in four steps
1. **Scope** — one sentence, neither too broad nor too narrow, that contains the user need. Example: "near-real-time integration between our firm and its carriers through events". State what is out of scope (batch, request–response, hard real-time control).
2. **Users and need** — for flow the users are always **producers** and **consumers**; the need is **flow integration**.
3. **Value chain** — the components required to meet the need, ordered by visibility to the user (top) down to invisible infrastructure (bottom).
4. **Evolution** — place each component on the evolution axis:
   - **Genesis** — novel, rare, uncertain, changing constantly.
   - **Custom-built** — understood enough to build, but bespoke per environment.
   - **Product (+rental)** — repeatable, increasingly alike; focus shifts to features and operation.
   - **Commodity (+utility)** — standardised, high-volume, undifferentiated; focus on efficiency; nobody notices it.
A map differs from a diagram because position has meaning: the **anchor** is the user need, **position** is evolution, and **movement** is consistent (everything drifts towards commodity over time).

## The generic flow value chain
| Layer | Component | Role |
|---|---|---|
| Users | Producer, Consumer | Publish / subscribe |
| Need | Flow integration | Lets streams move between independent parties |
| Integration | **Interface** → logical connection, discovery | Find streams; negotiate, open, manage, close subscriptions |
| Integration | **Protocol** → metadata format, payload format | Describe and package events consistently |
| Interaction | **Source** | Device or software that captures a state change (sensor, webhook, app, API gateway feeding a stream) |
| Interaction | **Processor** | Acts on incoming events: filter, transform, route, aggregate, trigger; may be both consumer and producer; may be a "sidecar" watching the stream |
| Interaction | **Queue / log** | Stores and forwards events, decoupling producer and consumer in time |
| Interaction | **Sink** | Where the stream stops: dashboard, database, warehouse, UI |
| Base | **Infrastructure** | Compute, storage, network, physical connections, commodity services |
The physical connection (network) is a commodity; the logical connection (subscription semantics) is what flow must standardise.

## Validating the chain with promise theory
Promise theory (Burgess) models cooperation between **autonomous agents** that can only promise their own behaviour; no agent can force another to comply (an attempted command is an *imposition*). A promise has a **promiser**, a **promisee** and a **body** (what is promised, and its bounds). A promise only becomes useful when the promisee makes a matching promise to accept or use it (often written +body / −body). Each agent judges for itself whether a promise was kept.
How to use it on an architecture:
- Walk from the bottom up and ask "what does this less visible component promise the one above?" Draw a dependency only where there is a real promise.
- If two components exchange no promise, they shouldn't be connected — a useful check on over-drawn diagrams.
- Example conclusions from the generic chain: the producer doesn't promise the consumer a stream directly when an intermediary routes events — the integration layer makes promises to both; queues promise to processors, not to sources or sinks, because data almost always needs processing on the way in and out.
- In reviews, list the **promises between producer and consumer** explicitly (delivery, ordering, retention, schema stability, rate). Every extra promise costs scalability and adds failure modes; keep them minimal and written down.

## Where components stood (as published in 2021 — re-check today)
The published map placed processors, queues, sinks and infrastructure at commodity/utility; sources at product; logical connection at product; metadata format and payload format at custom; discovery at genesis — so flow integration overall sat between custom and product. Since then (general knowledge): CloudEvents has become a CNCF graduated specification and is widely supported in event routers; AsyncAPI is a common contract format; registry/discovery work (e.g., xRegistry) is still maturing. Payload standards remain mostly industry-specific. Treat discovery and payload formats as the least mature parts; standardise what you can control.

## Gameplay — asking questions of the map
Strategy "plays" are context-specific moves on a map (Wardley lists dozens: open approaches, standards games, exploiting network effects, co-creation, alliances, defensive regulation, etc.). Those most relevant to flow:
- **Standards game** — when integration is a commodity, vendors differentiate on their data, algorithms and service quality, not on the plumbing. Owners of valuable streams gain by adopting open event standards.
- **Exploiting network effects** — the cost of serving one more consumer is small; join or shape open specifications early and publish streams others can build on.
- **Co-creation** — producer and consumer have a chicken-and-egg problem; consumer demand can justify a producer. Industry groups, consortia and cloud-led alliances have solved this before (payments, IoT messaging, health data).
Some plays are aggressive or deceptive (e.g., dressing up legacy assets, harvesting complementors' ideas); recognise them when evaluating a vendor's strategy.

## Inertia
- **Vendor inertia**: ecosystems built on proprietary event formats and APIs (notably the large clouds) resist portability, though the same vendors back open specs. Moving automation built on one provider's event shapes elsewhere costs mapping code.
- **Enterprise inertia**: large portfolios are complex; a major technology shift typically takes about three years (explore, pilot, scale). Common objections: security, performance, cost.
- **Unknown future uses** ("here be dragons"): once integration is commodity, new uses appear that nobody can predict. Design for optionality rather than for one forecast.

## Using maps in this agent
- `assess`: map the client's specific chain (their sources, processors, queues, sinks, partner interfaces) and mark which components are custom where a product or utility exists (waste) and which are commodity where differentiation matters (risk).
- `design`: build on commodity components, keep the custom effort for payload semantics and domain processing, standardise envelopes and contracts.
- `review`: flag bespoke plumbing (home-made brokers, custom envelopes) where commodity options exist, and proprietary lock-in at organisational boundaries.
