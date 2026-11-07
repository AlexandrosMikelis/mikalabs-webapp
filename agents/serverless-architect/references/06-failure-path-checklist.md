# Step 6 — The MIKA failure-path checklist

Use for the `RELIABILITY` field in `design` and the failure-path lens in `review`. Every `HANDS_OFF` and `TRIGGERS` edge on the system map (`01`) gets one card. A design is not finished until every card is complete or the gap is written down as a risk.

Grounding: each provider's documentation on trigger types, retries, dead-letter handling and batch responses (AWS Lambda, Azure Functions, Pub/Sub and Cloud Run), open-source idempotency and batch helper libraries, public guidance on timeouts and backoff with jitter, recovery objectives as defined in business continuity practice, and MIKA's card below.

## How does each trigger retry by default? (AWS, verify)
| Invocation model | Who retries | Default behaviour | Terminal destination |
|---|---|---|---|
| Synchronous (API, function URL, direct `RequestResponse` call) | the caller | none by Lambda | the caller handles errors |
| Asynchronous (storage notifications, topics, the bus, direct `Event` call) | the function service's internal queue | 2 retries (configurable 0–2), event kept up to 6 hours | an on-failure destination (queue, topic, function, bus or bucket) or a dead-letter queue |
| Queue polling | the queue | message reappears after the visibility timeout until `maxReceiveCount` | the queue's dead-letter policy |
| Stream polling (Kinesis, DynamoDB Streams) | the event source mapping | retries the batch until success or record expiry, blocking the shard | on-failure destination; set maximum retry attempts, maximum record age and batch bisection |
| Bus to a target | the bus | retries for up to 24 hours and 185 attempts | dead-letter queue per target |

Azure Functions and Cloud Run functions differ: Service Bus moves a message to its dead-letter sub-queue after the maximum delivery count; Storage queues use a `-poison` queue after five attempts by default; Pub/Sub uses dead-letter topics with a maximum delivery attempts setting. Do not assume AWS behaviour on another provider.

## The card
For each edge, record ten answers. Missing items map to a default severity for the review (`11`); adjust with the calibration rules there.

| # | Question | Good answer looks like | Default severity if missing |
|---|---|---|---|
| F1 | What delivery semantics does this edge give? | "at least once, unordered" written on the edge | Medium |
| F2 | Who retries, how often, with what backoff? | bounded attempts, exponential backoff with jitter, no retry layered on retry | Medium; High if retries multiply across three layers |
| F3 | Where does a message go when retries run out, and who is told? | a dead-letter queue or on-failure destination, an alert on its depth, an owner and a replay runbook | High on key journeys |
| F4 | Is the consumer idempotent? What is the key and for how long is it remembered? | key from the event `id` or business key; record kept at least as long as the longest retry or replay window | Critical for money movement or clinical actions; High otherwise |
| F5 | What happens when one item in a batch fails? | partial batch response (`ReportBatchItemFailures`) or per-item handling; no whole-batch retry | High on high-volume queues and streams |
| F6 | Do the timeouts line up? | caller > callee; visibility timeout ≥ 6 × function timeout when a function polls a queue (AWS guidance) | Medium; High if it causes duplicate processing |
| F7 | Does order matter, and does the channel give it? | order need stated; FIFO group or partition key chosen, or the consumer tolerates reordering by version or timestamp | High where order changes the result |
| F8 | What happens to a message that can never succeed (malformed, oversize, refers to deleted data)? | validated early, parked with reason, not retried forever | Medium; High on streams (blocks a shard) |
| F9 | Can this edge start itself again? | output never lands where it triggers the same function; loop detection left on; a concurrency cap | High (cost and outage) |
| F10 | Can we replay after a fix? | bus archive, stream retention, or dead-letter redrive tested | Medium |

## Making consumers idempotent
- **Natural idempotency first**: "set appointment status to `confirmed`" is safe to repeat; "add 1 to the reminder count" is not. Prefer absolute writes over increments.
- **Conditional writes**: write with a condition such as "attribute does not exist" or "version equals N" (DynamoDB condition expressions, Cosmos DB ETags, Firestore transactions). A repeat fails the condition and is treated as success.
- **Idempotency record**: store key → status (`in_progress`, `completed`) → stored response, with an expiry. Open-source helper libraries implement this on a key-value table and return the stored result for repeats.
- **Key choice**: the event `id` for technical duplicates; a business key (`paymentId`, `studyUid`, `meterId + period`) when the same intent can arrive in different events.
- **Side effects outside your store** (emails, partner calls, payments): pass the key on to the partner if it supports one; otherwise record "sent" before acknowledging and accept the narrow window, stated as a risk.
- **Exactly once is a property of the whole path**, not a setting. FIFO queue deduplication and exactly-once workflow steps help, but the store write and side effects still need the measures above.

## Retries that help rather than hurt
- Retry only errors that may succeed later (throttling, timeouts, 5xx). Do not retry validation or authorisation failures.
- Backoff with jitter spreads retries so they do not arrive as a second spike.
- Retry at one layer. A client retrying three times, a gateway retrying three times and a function retrying three times turns one failure into 27 calls.
- Protect downstreams: cap consumer concurrency (maximum concurrency on the queue trigger, a reserved concurrency cap, maximum replicas on containers) so a backlog drains at a rate the database or partner can take.
- For a failing partner, stop calling for a while (the circuit breaker pattern, documented in the Azure Architecture Center and AWS Prescriptive Guidance): pause the queue's event source mapping, or store state in a fast table and skip calls while open.

## When demand outruns what a dependency can take
Elastic compute does not make the whole system elastic. When requests arrive faster than a database, a partner or a downstream service can absorb, choose deliberately among four responses and write the choice per journey:

| Response | Use when | House example |
|---|---|---|
| **Queue and drain** | the work can wait; the backlog's age stays inside the freshness objective | meter reads queue overnight and drain at the settlement database's safe write rate |
| **Shed** | the work has no value if late; reject early with `429` or `503` and `Retry-After` | live departure-board refreshes during a storm cancellation spike |
| **Degrade** | a cheaper answer is acceptable; serve cached or partial data | timetable served from cache while the fares service recovers |
| **Reserve** (bulkhead) | the journey must not be starved by others; give it its own capacity cap or pool | ticket validation at the gangway gets reserved concurrency apart from marketing jobs |

Measure throughput and tail latency (p95, p99) at the dependency, not only at the function; the response that protects the dependency is the one that protects the journey. Response times grow sharply as a shared resource nears full utilisation, so set caps well below the dependency's limit, typically around 70–80%.

## Loops and runaway cost
- A function that writes to the bucket, table or queue that triggers it loops. Write outputs to a different bucket or prefix and filter the trigger on prefix and suffix.
- The AWS function service detects some recursive loops through queues, topics and buckets and stops them after about 16 rounds (verify coverage); leave detection on and never rely on it alone.
- Budget alerts and anomaly detection catch the loops design misses.

## How fast must we recover, and how much may we lose?
Set a recovery time objective (RTO) and a recovery point objective (RPO) per journey, then pick the cheapest mechanism that meets both.

| Tier | RTO / RPO | Mechanisms (AWS; equivalents exist) | House example |
|---|---|---|---|
| R1 | hours / up to 24 h | infrastructure as code redeploy, AWS Backup daily, object versioning | co-op member newsletter archive |
| R2 | under 1 h / minutes | point-in-time recovery on tables (DynamoDB up to 35 days), cross-Region backup copies, tested restore runbook | clinic appointment history |
| R3 | minutes / seconds | active-passive across two Regions: replicated tables or databases across Regions, object replication, bus failover endpoints, health-checked DNS failover | ferry ticket validation at the gangway |
| R4 | near zero / near zero | active-active across Regions with explicit conflict resolution per record (replicated tables often default to last writer wins) | rarely justified; needs a written business case |

- Region-level services (functions, queues, buses) are already spread across availability zones; R3 and R4 add cost and complexity, so they need a business reason.
- Keep data, keys, secrets, platform limits and infrastructure code in step across Regions; a standby Region still on default limits is not a standby.
- Test restores and failovers on a schedule. An untested backup is an assumption.

## Signals for the review
Apply the card defaults, then the calibration in `11`. Common High and Critical findings: asynchronous payment or clinical handlers with no idempotency; no terminal destination on a key journey; whole-batch retries on a busy queue; self-triggering storage; poison records blocking a stream shard; a recovery tier claimed but never tested.
