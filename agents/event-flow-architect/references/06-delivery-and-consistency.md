# 06 · Delivery, ordering and consistency

What can each party rely on when events cross processes, networks and organisations? This file covers the guarantees worth promising, the ones that are not, and the patterns that make publication and consumption safe.

## Queue or log?
| | Queue (AMQP brokers, JMS, SQS-class, RabbitMQ classic and quorum queues) | Log (Kafka-protocol, Pulsar, cloud log services, RabbitMQ streams, NATS JetStream streams) |
|---|---|---|
| After consumption | Message removed once acknowledged | Event retained for a configured time or size |
| Many consumers | Compete for messages (work sharing) | Each consumer group keeps its own position |
| Replay | Not natively | Rewind to an offset or time |
| Ordering | Per queue, weakened by competing consumers and redelivery | Per partition/key |
| Best for | Commands, work distribution, Exchange steps | Facts read by many, sequences, replay, rebuilding state |

The line is blurring: Kafka added *share groups* (KIP-932, queue-style consumption, early access from 4.0) and several brokers now offer both models. Choose by the semantics needed, then check the product supports them.

## Which delivery guarantee can honestly be promised?
- **At most once** — may lose events. Acceptable only for high-frequency readings where the next one replaces the last.
- **At least once** — may duplicate. The realistic default between independent parties.
- **Exactly once** — achievable only *inside* a bounded system that controls both the read position and the write (for example Kafka transactions from topic to topic, or a stream processor with transactional sinks). It does not extend across an HTTP call, a partner's database or an email.

MIKA rule: across any boundary of grade B1 or above, promise **at least once** and require **idempotent consumers**. Treat any "exactly once end to end" claim in a review as a finding.

## How do consumers stay correct with duplicates?
- **Deduplicate on identity**: CloudEvents defines `source` + `id` as unique per event; keep a store of processed IDs for at least the redelivery window.
- **Natural idempotency**: make updates upserts keyed by business ID with a version or sequence number ("apply only if newer").
- **Commutative updates** where possible (set membership, max-of), so order and duplicates matter less.
- **Side effects** — emails, payments, battery commands — carry an idempotency key to the downstream system so retries do not repeat them.
- **Inbox pattern**: record the event ID in the same transaction as the state change it causes.

## How do events leave the system of record safely?
Writing to the database and then publishing (or the reverse) as two separate steps is the *dual-write problem*: a crash in between loses an event or announces something that never committed.
- **Outbox**: write the event to an outbox table in the same transaction as the business change; a relay publishes it and marks it sent. Publication is at least once; consumers deduplicate.
- **Change data capture (CDC)**: read the database's change log (for example with Debezium) and turn committed changes into events. Good for legacy systems you cannot change; the raw change shape is internal, so map it to a curated event before it leaves the owning team.
- **Event sourcing**: the event store *is* the system of record; state is rebuilt from events. Powerful where history matters (ledgers, clinical audit), costly elsewhere. Do not adopt it just to publish events.

## Ordering: what is promised, and to whom?
- Order holds only within a partition, queue or key. Name the key in the contract.
- Include a per-subject **version or sequence number** (CloudEvents has a `sequence` extension) so consumers can detect gaps and discard stale updates.
- Retries, dead-letter reprocessing and parallel consumers all reorder. Design consumers to tolerate it, or serialise per key deliberately.

## Failures: retries, dead letters and poison events
- **Bounded retries with exponential backoff and jitter**; give up after a defined count or age.
- **Dead-letter channel** with a named owner, an alert and a written replay procedure. A dead-letter queue nobody watches is silent data loss.
- **Poison events** (always fail): detect by repeated failure of the same ID; quarantine without blocking the partition behind them.
- **Back-pressure**: slow consumers must not take down producers. Use broker quotas, consumer-paced pulls, or rate limits on webhook delivery.
- **Webhook delivery**: retry on network errors and 5xx/429 responses, honour `Retry-After` (RFC 9110), disable endpoints after sustained failure and tell the owner.

## Replay without harm
Replays are needed for recovery, for new consumers and for reproducing incidents. Make them safe:
- Consumers are idempotent (above).
- Side-effecting consumers can be switched to "rebuild state only" mode.
- Replayed events keep their original `id` and `time`; add an attribute if consumers must know it is a replay.
- Retention covers the longest outage you intend to survive (`10`).

## Allocation consistency (⚑ Exclusive)
When an item can be allocated once, events are not enough. Use one authority per item (database row with compare-and-set, a single-writer partition per item, or a reservation service with expiry) and publish the outcome as a fact. Consumers that saw "held" must handle a later "released" or "expired".

## Worked mini-example — ferry car-deck holds
`DeckSpaceHeld` and `DeckSpaceReleased` are keyed by sailing ID, published from the booking database through an outbox, with a `sequence` per sailing. The port's gate system deduplicates on `source` + `id`, applies only higher sequence numbers, and rebuilds its view from a compacted topic of the latest `SailingDeckState` snapshot after an outage. Allocation itself stays a synchronous call to the booking service.

## Promise sheet (put in the contract)
| Promise | Example wording |
|---|---|
| Delivery | At least once; duplicates possible |
| Identity | `source` + `id` unique; stable across retries and replays |
| Ordering | Ordered per `subject` (sailing ID) only |
| Retention | Available for 7 days; latest state per sailing kept indefinitely |
| Failure | Webhook retries for 24 h with backoff; then endpoint paused and owner notified |
