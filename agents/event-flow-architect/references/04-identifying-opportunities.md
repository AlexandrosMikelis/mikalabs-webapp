# Identifying flow opportunities (`assess`)

Find an integration problem first, then decide whether real-time events are the right answer. Prefer extending existing applications at their edges over rebuilding them.

## Four use-case categories
Almost every messaging or eventing use falls into one of four categories (taxonomy from practitioner Derek Collison). Each has a qualifying question:
| Category | Qualifying question | Typical patterns |
|---|---|---|
| **Addressing & discovery** | Where is the set of participating agents (vehicles, devices, servers, SKUs, partners) dynamic, and tracking who joins and leaves is hard to scale? | Collector (registration service publishes "agent joined"), Signal (discovery service watches traffic and assigns identity) |
| **Command & control** | Where does the organisation depend on a timely response to a change in state — someone or something must act? | Signal, Facilitator; centralised or edge-distributed control |
| **Query & observability** | Which *particular* things do we need to watch live or keep tracking (a patient, an intersection, a few stocks)? | Collector, Distributor |
| **Telemetry & analytics** | Which insights need the emerging behaviour of a *system* of many agents emitting lots of data? | Collector (many → one), Distributor (one → many), Signal (many → many) |

Notes per category:
- **Addressing & discovery**: must keep up with the rate of agents appearing and disappearing, and must detect or tolerate duplicate discovery — mis-applied identity corrupts downstream state and analytics. Network addresses are poor identities; prefer stable, meaningful IDs.
- **Command & control**: *centralised* (events → stateless horizontally scaled services, or a stateful processor holding a live model) is easier to reason about; *distributed/edge* (local controllers act, send aggregates upward) scales further and cuts latency. If the same agents send input and receive output, it leans to messaging; if inputs and outputs are different agents, it leans to eventing.
- **Query & observability**: for a synchronous question to one known object, use an API. Use events when the agents are many, self-declaring and the conversation must be asynchronous. Balance producer-side sorting (topic per agent or group — many topics) against consumer-side filtering (one wide topic — more consumer processing), or mix (coarse sort by region/type, fine filter at consumer).
- **Telemetry & analytics**: near-real-time versions of things done in batch today (sales, campaign, operations, inventory analytics). Value shows when decision-makers can react while it matters.

## Modelling the process: EventStorming
A facilitated workshop (Brandolini) that lays out a business activity as a timeline of domain events. Steps:
1. Pick the activity — a process where several parties exchange information to reach an outcome.
2. Get a long modelling surface (wall or online whiteboard).
3. Invite domain experts and those who must translate the knowledge (designers, developers, architects).
4. Write the events that matter, in past tense ("Item added to cart", "Payment authorised").
5. Order them on a timeline; debate and revise.
6. Add what influences the flow: people/roles, external systems, the **commands** that trigger events, the **policies** ("whenever X, then do Y") that react to events, and the outputs shown to people or systems.
7. Mark hotspots: constraints, pain points, open issues.
What it gives you: how the organisation really works, priorities for change, and — critically for flow — every integration with an external system. Each external system on the board is a flow candidate.

**API-or-event test at each external touchpoint**: if you detect something happening in another system, it is flow. If you are sending to another system and need an immediate answer, use an API. If you are sending asynchronously (even if a reply eventually comes), use events or messages.

## Signals that an opportunity is strong
- Work waits on a schedule, a poll or a person re-keying (lead time dominated).
- The same state change is needed by several units or partners (fan-out value; Distributor).
- Many independent sources feed one decision or view (Collector).
- Matching supply and demand quickly creates value (Facilitator).
- The value of the data decays fast (data half-life: minutes or seconds).
- A partner ecosystem could build on the stream (option value).

## Signals that it is not (or not yet) flow
- One consumer, stable interface, latency of hours is fine → scheduled batch or API.
- The interaction is a synchronous question with an immediate answer → API.
- No one acts on the data faster if it arrives faster.
- The producer can't make even minimal promises (no stable identity, no schema, no owner).
- Trust conditions can't be met (regulated data without provenance, consent or encryption).

## Assess procedure
1. **Scope** the business or process; name producers, consumers and the boundaries crossed.
2. **List state changes** (EventStorming, or from the description). For each: who produces it, who needs it, how fast, what they do.
3. **Classify** each candidate: use-case category, flow pattern (`06`), messaging vs eventing (`05`).
4. **Value**: LT/PT removed, CX, risk, new product, ecosystem option (`02`).
5. **Fit** rating: Strong (clear value, feasible trust conditions, producer can own it) / Moderate (value but significant prerequisites) / Weak (little gain over API or batch).
6. **Not flow**: state explicitly what should stay as API, batch or file.
7. **First step**: the smallest event-first pilot — one stream, one owner, a standard envelope, a real consumer — that proves value and builds the platform habits (`09`).
8. **Open questions** that would change a fit rating. Never block on them: assume, flag, continue.
