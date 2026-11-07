# 05 · Shaping the integration (`design`)

The shape code from `04` already answers most questions. This file turns it into concrete design decisions, in the order MIKA takes them. Each decision names the default and when to deviate.

## D1 · Does the producer need anything back?
Taken from the **Intent** axis.
- **Fact** → publish to a channel; the producer keeps no state about consumers. Default for cross-organisation work, because consumers can join, test and leave without the producer noticing or changing.
- **Command** → send to one handler through a queue; return the outcome as its own event or reply message (AsyncAPI 3 models request/reply explicitly). Set a timeout and say what happens when it expires.
- **Exchange** → model the conversation as a workflow (D5). Every party keeps conversation state keyed by a correlation ID, and every step needs a recovery path.

Why prefer facts: conversation state must be stored, partitioned, recovered after failure and kept consistent; it limits how far a system scales and how freely parties change. Most organisations' volumes are comfortably within what ordinary message brokers handle, so this is about coupling first and scale second.

## D2 · Who opens the connection, and who pushes?
| Option | How it works | Fits | Watch for |
|---|---|---|---|
| **Webhook push** | Consumer registers a callback URL; producer (or its router) POSTs each event | B2 partners, low-to-moderate volume, firewall-friendly | Signing, retries, consumer downtime, a delivery log (`09`, `10`) |
| **Broker subscription** | Consumer subscribes to a topic or subject on a broker (NATS subjects, MQTT topics, AMQP addresses) | Devices, internal services, steady streams | Per-party credentials and topic permissions |
| **Log read** | Consumer reads a partitioned log at its own position (Kafka-protocol, Pulsar, cloud log services) | Replay, many independent readers, sequences | Retention promises; giving partners log access is a strong coupling |
| **Server push on a held connection** | WebSocket or Server-Sent Events | Browsers, live dashboards | Reconnect and resume-from-position logic |
| **Polling adapter** | One adapter polls a legacy source and emits change events | Producers that cannot emit events | Poll interval sets the latency floor; deduplicate |

For mandated collection (every member must report to one body), it is often simpler for producers to push to one well-known endpoint than for the consumer to subscribe to thousands of sources. Decide explicitly who owns the channel and who initiates.

## D3 · How much state does each event carry?
Taken from the **Payload** axis.
- **Signal events** (a reference to fetch details; also known as the *claim check* approach): keep the event small and let authorisation happen at fetch time. Cost: a second call, a dependency on the producer's API being up, and the risk of reading state newer than the event. CloudEvents offers a `dataref` extension for the reference.
- **Delta events**: compact, but consumers must apply them in order and need a way to resynchronise (a snapshot endpoint or compacted topic).
- **Snapshot events** (event-carried state transfer): consumers act without calling back; late joiners recover from the latest event per key. Cost: larger events and more data exposed to every consumer — check the ⚑ Personal flag.
- **Sequences**: design around windows and keys (D4) rather than single events.

## D4 · Does order carry the meaning?
- If yes (Sequence payloads, delta events, state machines), choose a **key** that matches the entity whose order matters — meter ID, sailing ID, patient ID — and use a partitioned log or ordered queue per key. Never promise order across keys.
- Consumers handle late and out-of-order arrivals using event time, not arrival time; windowed aggregations need a policy for late data.
- For pattern detection over sequences (what precedes a battery fault?), a stream processor or streaming SQL over the log saves building bespoke state.
- When decisions depend on the live state of many related entities (a ferry fleet, a local grid), a stateful processor that keeps a current model of those entities, updated by events, is often simpler than reconstructing state on every query.

## D5 · One step or many?
- **Single step**: one reaction per event. Route with an event router to a function or a queue in front of workers. Requirement: the router can read the envelope attributes it filters on (CloudEvents `type`, `source`, `subject`).
- **Multi-step, long-running, or with human tasks** (claims, onboarding, referral between vet clinics): use a workflow engine. It keeps process state, versions process definitions and lets other parties perform steps. For cross-party processes use a **saga** — local transactions with compensating actions — rather than distributed transactions.
- Choose **orchestration** (one coordinator, easy to see end to end) or **choreography** (each service reacts to others' events, looser but harder to trace) on purpose and write the choice down. For detailed process design hand over to `process-automation-architect`.

## D6 · Where does processing sit?
- **Central**: sources → channel → processing → consumers. Easiest to see and operate.
- **Regional or edge**: process near the participants (a ferry terminal, a substation, a clinic) and send only summaries or exceptions onwards. Lower latency and less traffic; harder global analytics.
- **Tiered**: small local brokers per site or device group, each forwarding a reduced stream to a regional tier and then to a central store. Act locally where the usefulness window is short; aggregate centrally where it is long.
- Avoid one central event bus that every team must change for every integration. Prefer domain-owned channels under shared standards, with observability that spans them.

## D7 · What does the direction demand?
| Direction | Main problems | Design responses |
|---|---|---|
| **1→N** | Output scale; distant consumers receive later; per-consumer entitlement; withdrawing access | Regional channels or edge replication; make the timing promise explicit (best effort vs equal-time release); per-consumer credentials; signal events with authorised fetch for sensitive detail |
| **N→1** | Producer onboarding at scale; mixed formats and quality; a stopped producer looks like "nothing happened"; bursts | Automated registration with stable IDs; one envelope for all; normalise in an anti-corruption layer; per-source health and expected-rate checks; back-pressure and partitioning by source |
| **N↔N** | Routing sprawl; unclear ownership of derived events; feedback loops (A triggers B triggers A) | Each processing stage owns its output types; hop counts or cause IDs in attributes; circuit breakers and rate limits (`10`) |
| **1→1** | Over-engineering | Keep it simple, but still use standard envelope attributes so the event can be widened later |

### When something can be taken only once (⚑ Exclusive)
Matching or allocating a scarce item — a car-deck slot, a charger booking, an urgent-care appointment — needs a **single allocation authority** per item: a compare-and-set on the item's state, a reservation with expiry, or a consistent store keyed by item. Eventual consistency alone sells the same slot twice. Events announce the outcome; they do not decide it. Model the item lifecycle explicitly (offered → held → confirmed → released/expired).
