# Event design

Use for `design` (STREAMS field) and for review findings on event shape. The shape of an event decides what consumers can do with it, how hard it is to evolve, and whether the stream can be shared outside its domain.

Grounding: Martin Fowler's 2017 martinfowler.com article separating the patterns behind "event-driven" (event notification, event-carried state transfer, event sourcing), CloudEvents 1.0 (envelope attributes, `dataschema`, `dataref` extension for claim-check payloads), Debezium's change-event envelope (`before`/`after`/`op`), Kafka log-compaction docs, and MIKA's own classification below.

## What does every event carry?
- **Key**: identifies the entity or grouping the event belongs to. Drives partitioning, ordering and compaction (`04`).
- **Value**: the payload, defined by a schema (`03`).
- **Metadata / headers**: event ID, event time, producer, schema version, correlation and causation IDs, trace context (W3C `traceparent`). Keep business data out of headers; keep plumbing out of the value. CloudEvents gives standard names for the envelope (`id`, `source`, `type`, `time`, `subject`, `datacontenttype`, `dataschema`) and has Kafka, AMQP, MQTT and HTTP bindings.

How the key is chosen:
| Key choice | Use |
|---|---|
| **No key** | Independent records where order across items does not matter (raw click logs). Round-robin or sticky partitioning. |
| **Entity ID** | Each event is about one entity (a booking, a vessel, a meter). Can be materialised into a table by key. The usual choice for shared streams. |
| **Grouping attribute** | Records co-located for processing, e.g. all readings of one inverter. Not a full entity. |

## How does MIKA classify an event's payload?
Choosing the payload profile is the most consequential event-design decision. MIKA classifies on four independent axes, then names the common combinations.

| Axis | Question | Values |
|---|---|---|
| **Rebuild power** | Can a consumer reconstruct the entity from this event alone? | self-sufficient · needs earlier events · needs a callback |
| **Payload scope** | How much of the entity is in the payload? | whole entity · changed part only · identifier only · a single reading |
| **Intent** | Is it a fact, an observation, or a request? | fact (it happened) · observation (it was measured) · request (please do) |
| **Retention fit** | What retention keeps the stream useful? | compact by key · time window · keep all |

### The named profiles
| MIKA profile | Axes | Public term | Typical retention |
|---|---|---|---|
| **Full-picture event** | self-sufficient · whole entity · fact | Fowler's *event-carried state transfer*; Debezium's `after` image | compact by key (plus archive if history matters) |
| **Before-and-after event** | self-sufficient · whole entity twice · fact | Debezium envelope with `before` and `after` | keep all or time window |
| **Change-only event** | needs earlier events · changed part · fact | Domain events as used in *event sourcing* | keep all (it is the history) |
| **Annotated full picture** | self-sufficient · whole entity + change note · fact | ECST with a change reason | compact by key |
| **Reading** | self-sufficient for its moment · single reading · observation | Telemetry / time series | time window, then aggregates |
| **Ping** | needs a callback · identifier only · fact | Fowler's *event notification*; claim check via CloudEvents `dataref` | short |
| **Command** | n/a · request parameters · request | Command message | short |

### Full-picture events
The payload is the whole public view of the entity after the change. A consumer builds its own copy without calling the owner, a compacted stream gives new consumers a cheap bootstrap, and replay reproduces every past view. Cost: size, and the producer assembles the whole entity on every change. **Default for streams shared across domains.**
Before-and-after is the variant for consumers that need the difference and cannot keep their own copy. It doubles payload size and doubles exposure of sensitive fields.

### Change-only events
The payload says what changed ("berth reassigned", "credit applied"). Natural inside a domain and the basis of event sourcing. To know the current entity, a consumer replays every change in order and reimplements the producer's aggregation rules: business logic is duplicated across teams, a new change kind breaks every consumer, and the producer's internal model becomes a published contract.
Rule: keep fine-grained change-only streams **private** to the domain. Publish a full-picture stream across domains. Publish a change-only stream outward only when the change itself is the signal (a security team watching "payout account changed") and both sides accept the coupling.

### Annotated full picture
A full-picture event plus a governed note on what changed (`changeReason: BERTH_REASSIGNED`, or a list of changed field paths). Consumers get self-sufficiency and a cheap filter. Keep the reason enum governed; never let it grow into a second, hidden change-only contract.

### Readings
Measurements at a point in time: meter readings, GPS fixes, temperatures. High volume, keyed by device or not at all. Sources are lossy (devices offline, sampling), so consumers tolerate gaps. Time handling matters more than anywhere else: record device time and ingestion time, decide which is authoritative, plan late data (`05`). Usually aggregated into windows before other domains use them.

### Pings
An identifier and little else ("invoice 812 approved"); consumers call back for details. Cheap and privacy-friendly, but couples consumers to the owner's API availability, breaks replay (the callback returns today's data, not the data at event time) and creates read spikes after every burst. Use for authorisation-sensitive or very large payloads (claim check); never as the main shape of a shared stream.

### Commands
A request for one specific handler, which may refuse it ("reserve berth 4 for sailing 0715"). Legitimate on a stream (often in orchestration, `08`), but name them as imperatives and keep them in streams separate from facts.

### Which profile for which consumer need?
| Consumer need | Choose |
|---|---|
| Keep a local copy of another domain's entity | Full-picture |
| React to a specific kind of change and also keep a copy | Annotated full picture |
| Compute the difference, no local copy | Before-and-after |
| Audit trail or rebuild inside the owning domain | Change-only (private) |
| Monitor, aggregate, detect anomalies on measurements | Readings |
| Payload too large or too sensitive to broadcast | Ping + authorised fetch |
| Ask one service to act | Command |

**Rebuild test (use in reviews).** Delete a consumer's store, replay the stream from offset zero with no calls to other services. Does the consumer reach the same state it has today? Yes → self-sufficient. Needs callbacks or the producer's rules → record which axis failed and rate by how many consumers depend on it (`10`).

## Which design rules does every event follow?
1. **True and complete for its purpose.** Include the fields consumers need to interpret it; leave out speculative or derived values the producer cannot stand behind.
2. **One event definition per stream.** A stream holds one schema and its versions. Exception: closely related entity events that need cross-type ordering per key; then use a deliberate union / one-of schema and document why.
3. **Narrowest correct types.** Enums for closed sets; integers in minor units or decimals with explicit scale for money (never floating point); UTC timestamps with stated precision; explicit optionality.
4. **One kind of fact.** A "generic update" with a type field and a bag of optional attributes is a smell: split it.
5. **Reasonably small.** Large blobs go to object storage with a reference. Respect the broker's message-size limit (product-dependent).
6. **Designed with first consumers**, without coupling to one consumer's quirks.
7. **No events as locks or "you may start now" flags.** Model the business fact ("timetable for week 46 published").
8. **Past tense for facts, imperative for commands.** `SailingDeparted`, `ReserveBerth`.
9. **Stable identifiers.** Never key by something mutable such as an email address.
10. **Event time plus a per-entity version or sequence**, so consumers detect duplicates, gaps and reordering.

## What belongs in the payload, and what stays out?
- **In**: the entity's public view in the domain's language; fields consumers need to act without callbacks; IDs of entities owned by other domains.
- **Out**: technical columns (row versions, audit columns); copies of other domains' data unless governance agreed a shared enrichment; secrets; personal data beyond the purpose (see `09` on field encryption and crypto-shredding).
- Joining several internal tables into one public event (public projection, `07`) is usually right: consumers should not reverse-engineer the producer's normal forms. Copying *other domains'* data into your event is usually wrong: you become answerable for its correctness.

## How is a deletion published?
A deletion is an event too. On a compacted entity stream, publish an explicit `Deleted` full-picture event, then a tombstone (key with null value) so compaction removes the key. Set and document `delete.retention.ms` (Kafka) or the equivalent so late consumers still see the tombstone.

## How are streams named and catalogued?
- Governed convention, e.g. `<domain>.<entity-or-fact>.<version>` (`sailings.sailing.v1`). Avoid team names.
- Each stream has an owner, description, schema, key description, payload profile, retention/compaction policy, data classification and SLO, registered in the catalogue (`09`). In a knowledge graph: `(Stream)-[:OWNED_BY]->(Domain)`, `(Stream)-[:HAS_PROFILE]->(Profile)`, `(Stream)-[:CONFORMS_TO]->(SchemaVersion)`, `(Service)-[:READS]->(Stream)`.

## Worked example (house domain)
A regional ferry operator's Booking service event-sources its booking model from private change-only events (`SeatHeld`, `VehicleAdded`, `FareAdjusted`). At confirmation it publishes `bookings.booking.v1`, a full-picture stream keyed by booking ID: passengers, vehicle class, fare in minor units, status enum, sailing ID (reference). Port Operations, Finance and Analytics read it. Fraud reads a narrow change-only `payments.payout-account-changed.v1` stream owned by Payments, because the change itself is the signal. Vessel GPS fixes travel as readings keyed by vessel ID with 7-day retention; a windowed job publishes `fleet.vessel-position-5m.v1`. Commands to the check-in gates (`OpenGate`) live in a separate command stream.
