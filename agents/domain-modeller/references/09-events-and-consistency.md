# Connecting: events, history and work that spans several units

Use when a model includes event sourcing, separate query views, flows across aggregates, or event-based integration between contexts. Gaia covers the domain design; brokers, topics, partitions and retention go to **Nereus**.

Grounding: Fowler's 2017 bliki article separating four meanings of "event-driven" (notifications, events that carry state, event sourcing, command–query segregation); Garcia-Molina and Salem's 1987 paper "Sagas"; the public Enterprise Integration Patterns catalogue at enterpriseintegrationpatterns.com (idempotent receiver, message translator, and its stateful coordinator pattern); the transactional outbox and change-data-capture patterns as documented on microservices.io and in the Debezium project; the CloudEvents 1.0 specification (CNCF) for event envelopes. The event-design checklist, the coordination decision table and the examples are MIKA's.

## What makes a good domain event?
A domain event records a business fact that experts care about, named in the past tense in the vocabulary (`OwnerConsentRecorded`, not `PlanUpdated`).

MIKA event-design checklist:
- [ ] Past tense, business words, one fact per event.
- [ ] Raised by exactly one aggregate in exactly one context (the owner).
- [ ] Carries identifiers, the facts that changed, when it happened and the aggregate version; not the whole record "just in case".
- [ ] Marked **internal** (free to change, used inside the context) or **published** (a contract, versioned, fewer and coarser).
- [ ] Published only after the state change commits (outbox, below).
- [ ] Has a named consumer or a stated purpose; speculative events are noise.
- [ ] For published events: a schema in a registry or an AsyncAPI document, and a CloudEvents-style envelope (`id`, `source`, `type`, `time`, `subject`).

Translate internal events into published ones at the edge of the context; never let other teams subscribe to internals.

### Event catalogue entry (MIKA template)
Keep one entry per published event in the repository; the knowledge graph (`10`) and AsyncAPI documents are generated from it.
```yaml
event: SailingCancelled
version: 2
owner_context: Sailing Allocation
owner_team: Sailings
scope: public                 # public = published contract, private = internal
kind: state-carrying          # notification | state-carrying
meaning: >
  A scheduled departure will not run. Holds and bookings on it are no longer valid.
raised_by: Sailing (aggregate) on cancel
payload: [sailingId, route, scheduledDeparture, reason, cancelledAt]
envelope: cloudevents-1.0     # id, source, type, time, subject
consumers: [Passenger App, Freight Billing, Manifest Filing]
compatibility: backward       # schema-registry rule
deprecates: SailingCancelled v1 (sunset 2027-03-31)
glossary_terms: [Sailing, Hold]
```
Partitioning keys, retention and broker topics are left to **Nereus**; the catalogue only records the business contract.

## Storing history as events
With event sourcing, every change to an aggregate is stored as an append-only sequence of events; current state is computed by folding over them from the start. The log is the source of truth; tables, documents and search indexes are derived.

Illustration (community energy co-op, a member's matching ledger for one day):
1. `MemberLedgerOpened { member: M-118, tariff: "community-2026" }`
2. `SurplusMatched { interval: 11:00–11:30, kWh: 1.4, from: array Oakfield }`
3. `SurplusMatched { interval: 11:30–12:00, kWh: 1.1, from: array Oakfield }`
4. `MatchReversed { interval: 11:30–12:00, reason: "meter reading corrected" }`
5. `SurplusMatched { interval: 11:30–12:00, kWh: 0.9, from: array Oakfield }`
Folding gives 2.3 kWh matched. A state table would hold only the total; the log also shows the correction and why.

### What it buys
- **Explanation**: why a value is what it is, who caused it, when.
- **Point-in-time answers** and debugging by replay.
- **New views later**: project old history into views nobody planned (e.g. which arrays reliably cover which streets).
- **Intent kept**: a reverse-then-rematch stays visible instead of collapsing into a final number.

### How an aggregate stored as events handles a command
1. Load the stream; rebuild state by applying events.
2. Decide: check the command against state; produce new events or a rejection.
3. Write them with the expected version; if another writer got there first, reload and retry.
4. Publish to query views and other consumers.
Keep *decide* (command → events) apart from *apply* (event → state). Apply must never fail and never have side effects, or replay breaks.

### Event storage
Any store that appends events per stream and reads them back in order with optimistic concurrency: `appendToStream(streamId, expectedVersion, events)`, `read(streamId, fromVersion)`. Dedicated event databases exist; a relational table with a unique `(stream_id, version)` key also works.

### Costs and answers
| Concern | Answer |
|---|---|
| Learning curve | Real. Pilot in one area with H = 3 (`07`) and a willing team |
| Long streams | Snapshots: store folded state with its version, load snapshot plus later events. Snapshot only when measured; a long stream can also signal an aggregate that should be split by period |
| Querying | The log is not for queries; build query views |
| Changing event shapes | Events are history. Version types; upcast old shapes on read or add new types; never rewrite silently |
| Personal data (GDPR erasure) | Keep personal data out of events (refer by ID); otherwise encrypt per data subject and delete the key ("crypto-shredding"). Check legal advice |
| "Isn't an audit table enough?" | An audit table written beside state can drift from it; an event log cannot, because it *is* the state. If a simple who-changed-what trail suffices (H ≤ 2), choose the table |

## Query views built from events
- Each view subscribes to the events it needs, stores a checkpoint and is idempotent.
- To change one, build the new version alongside, replay from the start, switch over, then retire the old.
- Be honest with users about lag: return the command result at once, show "processing" states, or read the user's own write from the write side.

## Publishing reliably
Writing to the database and then sending a message is a dual write: a crash in between loses the message, or a send followed by a failed commit creates a phantom.
**Transactional outbox**: in the same transaction as the state change, insert outgoing events into an outbox table (or the event store). A relay publishes unsent rows and marks them, or a change-data-capture tool tails the table. Delivery is at-least-once, so every consumer deduplicates on event ID (EIP *Idempotent Receiver*).

## How is work coordinated across aggregates and contexts?
Rule from `08`: each transaction touches a single consistency unit. Work spanning several is coordinated by reacting to events.

| Situation | Coordination style |
|---|---|
| One event leads to one command, no memory needed | **Policy** ("whenever a sailing is cancelled, release its holds"), stateless |
| 2–3 steps, each participant knows the next, failures undone step by step | **Choreographed saga**: local transactions linked by events, with compensating actions |
| Many steps, branches, deadlines, or a process the business names | **Orchestrated coordinator** with its own state (the EIP coordinator pattern), often modelled as an aggregate, sometimes stored with event sourcing; workflow engines are one implementation |

Notes:
- A saga gives eventual consistency. Model intermediate states as visible business states (`AwaitingInsuranceApproval`).
- Compensation undoes *meaning*, not rows: refund a fare, release a hold, re-credit a member.
- A coordinator owns the sequence and the deadlines ("if the insurer has not replied within 5 working days, ask the owner to pay and claim later").
- Choreography beyond three steps with no visible owner is a warning sign.

### Worked example: veterinary insurance claim
`TreatmentPlanCompleted` → Billing raises invoice → `InvoiceRaised` → Claims coordinator submits claim → waits for `ClaimApproved` / `ClaimRejected` / 5-day deadline → on approval, marks invoice as insurer-paid; on rejection or timeout, issues `OwnerPaymentRequested`. The coordinator is named *Claim Handling* because the business uses that name, owns the deadline, and is the only place the sequence is written down.

## Which kind of event between contexts?
| Kind | Content | Good for | Watch for |
|---|---|---|---|
| **Notification** | "This happened" plus IDs; consumer asks for details | Signalling change; sensitive data stays upstream; consumer gets fresh data | Callback load; consumer depends on upstream being up |
| **State-carrying** | The changed state (snapshot or delta) so consumers keep a local copy | Downstream autonomy; reference data; fast reads | Duplication, eventual consistency, bigger contracts |
| **Internal domain event** | The fact as modelled inside the context | Event sourcing, local policies, audit | Exposing it couples others to your internals; translate it first |

Event, command, message: a message is the envelope; an event states a past fact and expects no reply; a command asks one receiver to do something and may be refused.

## Event-driven is not automatically decoupled
- **Structural coupling**: consumers depend on the publisher's internal event shapes; every refactor breaks them. Fix: published contracts translated from internals.
- **Rule duplication**: several consumers re-derive the same business fact from raw events (each computing "is this member in arrears?"). Fix: the owner computes it once and publishes `MemberFellIntoArrears`.
- **Timing coupling**: a consumer needs events from several sources in a particular order or window. Fix: one coordinator, or carry the needed state in the event.
- **Event soup**: everything subscribes to everything; nobody can say what one event sets off. Fix: fewer, coarser published events per context, event flows drawn on the relationship map, an owner for every event.

Heuristics: assume duplicates and retries; publish events an outsider would understand without reading your code; add fields, never change meanings; consider consumers' needs without letting one consumer shape your model; prefer one event per business fact over a generic `EntityChanged`.

## Output guidance
In model output, mark each event internal or published (scope `private` / `public` in the JSON), name the raising aggregate and consumers, and say notification or state-carrying where it matters. Mention the outbox for any context that publishes.
