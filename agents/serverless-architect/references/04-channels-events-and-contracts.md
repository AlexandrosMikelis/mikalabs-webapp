# Step 4 — Choosing channels and writing event contracts

Use for the `EVENTS` field in `design` and the events-and-contracts lens in `review`. Covers which channel to put on each asynchronous edge of the system map, how events are shaped and versioned, and how events cross team, account and partner boundaries.

Grounding: the CloudEvents 1.0 specification (CNCF), the AsyncAPI specification, the messaging documentation of AWS, Azure and Google Cloud, the transactional outbox pattern from public microservices pattern catalogues, and MIKA's channel chooser below.

## What kind of message is it?
Name the intent before the channel.

| Kind | Meaning | Typical name | Expected receivers |
|---|---|---|---|
| **Event** | something happened; the sender does not care who reacts | `SailingCancelled`, `ImagingStudyStored` | zero to many |
| **Command** | do this; one owner is expected to act | `IssueRefund`, `ConvertStudy` | exactly one |
| **Query reply / callback** | the answer to a request made earlier | `CreditCheckCompleted` | the requester |

Events in the past tense, commands in the imperative. A "command dressed as an event" (an event only one consumer can act on and the sender depends on) usually belongs on a queue owned by that consumer.

## The MIKA channel chooser
Answer the four questions in order for each asynchronous edge; the first "yes" picks the family.

1. **Must one consumer own and work through the messages, with back-pressure and redelivery?** → **Queue**: Azure Service Bus or Storage queues, Google Cloud Tasks (rate-controlled HTTP dispatch) or a Pub/Sub subscription, AWS SQS (standard, or FIFO for ordered groups).
2. **Must consumers read the same ordered sequence, replay it, or handle high-volume records in order per key?** → **Ordered log**: Azure Event Hubs, Pub/Sub with ordering keys or Managed Service for Apache Kafka, Kinesis Data Streams or MSK Serverless on AWS, or a table change feed. Streaming at depth → **Nereus**.
3. **Do many independent consumers need to react, chosen by content, possibly in other accounts?** → **Bus**: Event Grid (namespace topics for pull and push), Eventarc, or the AWS event bus.
4. **Is it plain fan-out of the same message to a few known subscribers?** → **Topic**: Service Bus topics, Pub/Sub topics, SNS (usually with one queue per subscriber behind it).

Then check three combinations that come up repeatedly:
- **Bus → queue → function**: the bus routes by content; a queue per consumer buffers bursts and gives the consumer its own retry and dead-letter policy. Default for important consumers.
- **Table change → pipe → bus**: publish domain events from the store's change stream (the change feed of the key-value or document store) instead of writing to the table and publishing in two separate calls that can disagree. Where no change stream exists, use a transactional outbox table.
- **Object upload → queue → function**: do not point bulk uploads straight at a function; a queue absorbs the burst and lets you cap concurrency.

## Delivery facts to put on each edge (verify per provider)
| Channel type | Examples | Delivery | Ordering | Retention and replay |
|---|---|---|---|---|
| Standard queue | SQS standard, Storage queues, Pub/Sub subscription | at least once | best effort | days (SQS up to 14; Pub/Sub 7 by default); usually no replay once acknowledged |
| Ordered queue | SQS FIFO, Service Bus sessions | duplicates suppressed within a window (5 minutes on SQS FIFO) | per group or session key | days |
| Topic | SNS, Service Bus topics, Pub/Sub topics | at least once to each subscription | none unless keyed | put a queue or subscription behind it |
| Bus | EventBridge, Event Grid, Eventarc | at least once to each target; long retry windows (24 hours by default on AWS) | none | archive and replay where enabled |
| Ordered log | Kinesis, Event Hubs, Kafka, DynamoDB Streams | at least once | per shard or partition key | hours to a year, by product and setting |

At least once means duplicates will happen. Every consumer is idempotent (`06`).

## How should an event be shaped?
Use the CloudEvents attributes as the envelope, whether or not the channel speaks CloudEvents natively (Eventarc and Event Grid do; on AWS put them inside the event detail).

```json
{
  "specversion": "1.0",
  "id": "7f3c2a8e-…",
  "source": "ferry/sailings",
  "type": "org.example.ferry.sailing.cancelled.v1",
  "subject": "sailing/2026-11-07/ARD-0730",
  "time": "2026-11-07T06:12:09Z",
  "datacontenttype": "application/json",
  "traceparent": "00-…",
  "data": { "sailingId": "ARD-0730", "reason": "weather", "affectedBookings": 212 }
}
```

House rules:
- **`id` is unique per occurrence** and is the default idempotency key for consumers.
- **`type` carries the major version.** Additive changes (new optional fields) keep the version; renaming, removing or changing the meaning of a field is a new type published alongside the old one until consumers move.
- **Carry identifiers and the facts most consumers need** ("thin enough to be safe, fat enough to avoid a callback storm"). If every consumer immediately calls back for the same data, add those fields.
- **No secrets, and personal data only when a consumer needs it**; prefer a reference that consumers resolve with their own permissions (`07`).
- **Trace context** travels in the event (`traceparent`, per the W3C Trace Context and the CloudEvents distributed tracing extension) so traces join across hops (`08`).

## Who owns the contract?
- The producer owns the event type and its schema. Publish schemas in a registry (each provider offers one) and describe channels and messages in AsyncAPI.
- Consumers declare what they rely on; a contract test in the producer's pipeline checks that a change does not break a declared consumer (`10`).
- Filter before delivery: rule patterns, subscription filters and event-source-mapping filters keep functions from waking for events they would discard. Filters cost less than invocations.

## How do events cross a boundary?
Between teams, accounts or organisations, place a **boundary bus** per domain:
- Producers inside the domain publish to the domain's own bus; only curated, versioned public event types are forwarded to the boundary bus.
- A resource policy on the boundary bus allows only named source accounts or principals to publish, and only named targets to subscribe.
- Incoming partner events are verified (signature or mutual TLS), validated against a schema, and re-published as internal event types; internal consumers never parse a partner's raw format.
- Cross-account, cross-subscription and cross-project routing is supported on all three clouds (bus-to-bus rules, partner topics, cross-project subscriptions); scope it with the identities on both sides.

House example: the energy co-op receives meter-read files from three metering agents. Each agent's callback lands on an ingestion endpoint that checks an HMAC signature, stores the file, and publishes `MeterReadBatchReceived.v1` on the boundary bus. Settlement, billing and the member portal subscribe; none of them knows the agents' formats.

## Choreography or a coordinator?
Choreography (services react to each other's events) suits loosely related reactions: a cancelled sailing triggers refunds, notifications and a manifest update independently. When the business needs one answer about the whole process (did the transfer complete? what step failed?) use a workflow (`05`). The rule of thumb in `05` decides.

## Signals for the review
- Events with no schema, version or owner → Medium; High when shared with partners.
- Database write and event publish as two separate calls with no outbox or change stream → High for money or bookings.
- Consumers that call the producer back for every event → Medium (coupling, load).
- Personal data broadcast on a bus with broad subscribe rights → High (`07`).
- Bus or topic subscription with no queue in front of an important consumer → Medium (no buffer, shared retry policy).
- Ordering assumed on a channel that does not give it → High where order changes the result (meter reads, account balances).
