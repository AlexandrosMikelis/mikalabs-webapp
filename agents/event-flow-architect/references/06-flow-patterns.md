# Flow integration patterns

Four basic shapes describe how events move between parties. Real systems combine them. Classify each stream in `assess` and `design`; each pattern has its own scaling and trust problems.

## Collector — many producers → one consumer
**Shape**: a consumer subscribes to (or receives) streams from many producers and builds a consolidated view or stream.
**Examples**: real-time inventory across suppliers; an aggregator offering one virtual catalogue from hundreds of rental firms; sensor fleets feeding one processing service; regulators receiving sales or emissions events from all firms.
**Challenges**
- **Who initiates?** Normally consumers subscribe to producers' streams. In collection by mandate (e.g., every retailer reports sales to a tax authority) it may be simpler for producers to push to one well-known consumer endpoint — a URI that vendors can embed in their products. Decide who owns the topic and who opens the connection.
- **Input scale**: hundreds of thousands to millions of streams. Needs horizontally scalable ingestion, partitioning by source, back-pressure, and stateful processing where a live model is kept.
- **Heterogeneity**: producers send different formats and quality. Require a common envelope; normalise payloads at an anti-corruption layer; track provenance per source.
- **Duplicate and late data** from many sources; idempotent ingestion; per-source health monitoring (a silent source looks like "no events").
**Design questions**: How are new producers onboarded and authenticated? What happens when one producer floods or goes silent? Who validates payloads?

## Distributor — one producer → many consumers
**Shape**: each event is broadcast to many (up to millions of) consumers, like a broadcast network.
**Examples**: market data tickers; minute-by-minute weather and forecast updates; price lists, timetable changes, product recalls.
**Challenges**
- **Output scale and geography** — harder than Collector. Latency and bandwidth to distant consumers vary; one server or region can't serve the world.
- **Edge distribution** moves endpoints near consumers, but the producer still has to replicate each event to every edge point, so distant consumers still receive later. Options: publish only once all endpoints hold the event (fairness at the cost of latency), or **regional streams** with consumers aware of the trade-off. Partition by region where the data is regional.
- **Fairness and tiers**: some uses (trading) need equal access timing; others accept best effort. Make the timing promise explicit.
- **Access control at scale**: entitlements per consumer, revocation, thin events with authorised payload fetch, or per-consumer encryption keys.
**Design questions**: How many consumers, where? Does every consumer need every event? Is simultaneous delivery a requirement? How are entitlements and billing tied to subscriptions?

## Signal (Signal Processor) — many ↔ many via processing
**Shape**: processors take in streams, detect conditions or derive new information, and emit events to whoever must act — a traffic controller between producers and consumers. Large systems contain many small Signal processors, each handling one concern.
**Examples**: industrial control services coordinating sensors and machines; a central bank-style service analysing economic data from many sources and alerting subscribers; fraud detection; operational automation reacting to platform events.
**Challenges**
- **Complexity and emergent behaviour**: each agent sees only its own connections and can't see system-wide feedback loops. Expect cascading failures and circular dependencies (A → B → C → A). Build each agent to be resilient to known problem classes, observe the whole through logs and metrics, and add **circuit breakers** that halt or damp flow when loops or rate anomalies appear.
- **Centralisation temptation**: big central routing/processing platforms will reappear (an ESB with standard protocols). They tend to give way to smaller, domain-owned platforms with distributed decision-making. Integrate with general observability tooling rather than relying on a platform's own dashboard.
**Design questions**: Which events can trigger which actions, and can any action re-trigger its own input? Where are rate limits and breakers? Who owns each processor?

## Facilitator — matching supply and demand
**Shape**: a special Signal processor acting as a broker: it receives offers from "sellers" (anyone with something to offer) and needs from "buyers" (anyone who wants it), matches them, notifies both and may complete the transaction.
**Examples**: matching spare truck capacity with small cargo lots; ride-hailing; ad exchanges; marketplaces for energy, labour, equipment.
**Challenges**
- **Scale** of matching (exchanges and ad platforms show it is solvable).
- **Exclusivity**: an item must not be "sold" twice — needs a single authority for allocation (reservation with expiry, compare-and-set on the item's state, or a consistent store keyed by item), not just eventual consistency. Mostly an application concern, not a protocol one.
- **Fairness, transparency and trust** in matching rules; disputes; regulatory exposure as an intermediary.
- Facilitators can become the most valuable "middle" positions in a flow economy — and natural monopolies.
**Design questions**: What is the unit being matched and its lifecycle (offered → reserved → confirmed → expired)? What consistency is needed at allocation? How are both sides notified and how are conflicts resolved?

## Pattern ↔ use-case mapping
| Use-case category (`04`) | Usual patterns |
|---|---|
| Addressing & discovery | Collector (registration), Signal (discovery from traffic) |
| Command & control | Signal; Facilitator when matching |
| Query & observability | Collector, Distributor |
| Telemetry & analytics | Collector, Distributor; Signal when many-to-many |
