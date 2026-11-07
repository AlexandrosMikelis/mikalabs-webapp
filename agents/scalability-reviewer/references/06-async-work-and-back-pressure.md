# Step 6 — Follow the asynchronous paths

Moving work off the request path is one of the strongest scaling moves: the caller gets a quick acknowledgement and the backend works at a rate it can sustain. It also creates backlogs, duplicates and reordering. This file covers the scaling behaviour of queues, logs and stream processors. Event contracts, topic design and cross-team event flows go to Nereus.

## Should this work leave the request path?
Move it when at least one is true:
- the caller does not need the result to continue (send the vaccination reminder, update the search index);
- the work is slow or calls a fragile or rate-limited dependency (payment provider, SMS gateway);
- arrivals are bursty and the backend can absorb only a steady rate;
- one event needs several independent reactions.

Keep it synchronous when the user must see the outcome now and the outcome cannot be provisional (the ferry hold either succeeded or it did not).

The price: completion becomes eventual, tracing gets harder, duplicates and reordering must be handled, and a broker must be run.

## Which delivery shape fits: queue, topic or log?
| Shape | Each message goes to | Kept after reading? | Fits |
|---|---|---|---|
| Work queue | One consumer | No | Distributing tasks |
| Publish/subscribe topic | Every subscriber | No | Notifying many independent parties |
| Partitioned append-only log | Every consumer group; one consumer per partition within a group | Yes, by time or size; can replay | High-volume streams, rebuilding state, several independent readers |

Settings that change scaling behaviour:
- **Acknowledge after processing**, not before. Early acknowledgements lose work on a crash; late acks cause duplicates on a crash. Duplicates are fixable (below); loss is not.
- **Durability**: a durable message is on disk, usually on several brokers, before the producer hears "accepted". Producers choose how many broker copies must confirm, the same latency-for-durability trade as database write settings.
- **Visibility timeout / redelivery delay**: shorter than the slowest legitimate processing time and messages get processed twice in parallel.

## How many workers drain the backlog?
Several consumers take from one queue, each message going to one of them (a shape the Azure Architecture Center's public pattern catalogue documents).
- Size with Little's law: draining 2,000 messages/s at 50 ms each needs about 100 concurrent workers.
- Scale on **queue depth or age of the oldest message**, not CPU. Kubernetes event-driven autoscaling (KEDA, a CNCF project) does exactly this.
- Cap total concurrency at what the downstream store or API can take. The queue is the buffer; the database is not.

House example — the vet network's lab partner delivers results in batches: up to 30,000 at once after each overnight analyser run, then quiet. The ingest endpoint only enqueues; workers write to the clinic database, which takes 250 writes/s comfortably. Fifty workers at 200 ms each drain 250/s: the burst clears in about two minutes, and the database never sees more than its comfortable rate.

## Can order be kept without losing parallelism?
Global order means one consumer at a time. Order only what needs it — **per key**: per meter, per booking, per patient. A log does this by routing each key to one partition, so parallelism is capped by the partition count. Choose it for the consumer count expected at future peak; changing it later reshuffles keys. Hot keys make hot partitions, as in `04`.

## How is duplicate delivery made harmless?
- Assume **at-least-once** delivery. Make the effect **idempotent**: store processed message IDs for a retention window; use naturally idempotent writes ("set status = DISPATCHED"); or use conditional writes ("apply only if version = 7").
- Some platforms offer end-to-end exactly once processing *within* the platform (for example a log with transactional producers, or a stream processor with checkpointed state and transactional output). Effects outside it — an SMS, a card charge — still need an idempotency key.
- **Writing to the database and then to the broker is a dual write**; a crash between them loses or invents messages. Use a transactional outbox or change-data-capture.

## What happens to a message that always fails?
A malformed message, or one that triggers a bug, will be retried forever and occupy workers. Set a maximum delivery count, then move it to a **dead-letter queue** that has an owner, an alert and a replay tool. Separate **transient** failures (retry with backoff) from **permanent** ones (dead-letter at once).

## How does a slow stage tell faster ones to slow down?
Back-pressure keeps overload local instead of letting it spread.
- **Bound every queue**: in-memory buffers, executor queues, broker queues. An unbounded queue converts overload into latency, then memory exhaustion, then a crash, and hides the problem until then.
- **When full, choose deliberately**: block the producer (pull-based flow control, as in the Reactive Streams specification); reject with a retryable error (HTTP 429 or 503 with `Retry-After`); shed low-priority work; or sample (acceptable for telemetry).
- **Pull beats push** for consumers: a puller cannot be overrun; a pushed-to consumer needs credit or prefetch limits.
- **Make backlog age an SLO**: "95% of meter readings processed within 60 seconds".
- **Plan the drain after an outage.** Retries enlarge the backlog during the outage; recovery then faces backlog plus live traffic. The AWS Builders' Library article on avoiding insurmountable queue backlogs describes the usual defences: bounded retries, separate queues for fresh and aged work, and draining newest-first when old work has lost its value.

## How does a partitioned log grow?
- Throughput grows with **partitions and brokers**.
- Within a consumer group, partitions are divided among consumers; consumers beyond the partition count sit idle.
- Each partition is copied to several brokers with one leader; producers choose how many in-sync copies must confirm.
- Retention by time or size, or **compaction** (keep the newest value per key) for state-like topics.
- **Reassigning partitions** pauses consumption when members join or leave; keep membership stable and use incremental reassignment where offered.

Sizing (house example): the co-op's 400,000 meters each report every 30 seconds ≈ 13,300 messages/s. At 400 bytes and three copies that is about 16 MB/s of broker writes; seven days' retention ≈ 9.7 TB across the cluster before compression.

## What changes when processing is continuous?
- **Stateless steps** (filter, map, route) scale by partition with no further thought.
- **Stateful steps** (counts, windows, joins) keep state per key, partitioned like the input, stored locally and **checkpointed** to durable storage. Checkpoint size and interval set recovery time.
- **Windows**: fixed (tumbling), overlapping (sliding/hopping), or gap-based (session). Pick by the business question.
- **Event time vs arrival time**: readings arrive late and out of order. The Dataflow model (Akidau et al., 2015) uses watermarks — an estimate that earlier data has arrived — plus an allowed lateness, and decides what happens to stragglers (drop, side output, correction).
- **Parallelism** per step is capped by input partitions; key skew makes hot tasks; rescaling moves state and takes time.
- **End-to-end correctness**: replayable input + checkpointed state + idempotent or transactional output gives exactly once *results* inside the pipeline.
- **Keep batch when it is enough.** A nightly job is simpler for the co-op's monthly statements. Stream when up-to-the-minute data has value (demand-response alerts).

## What about long operations behind an API?
Accept, return `202 Accepted` with a status URL, process through a queue, let the client poll at a suggested interval or receive a callback. Make the submit idempotent with a client-generated key so a retry does not create a second job.

## Questions Atlas asks at this step
- What sits on the synchronous path that could be deferred?
- Is every queue bounded, and what happens when it fills?
- What limits consumers downstream, and what is the backlog-age SLO?
- Is processing idempotent, and where do permanently failing messages go?
- Is order needed globally or per key, and are there enough partitions for future peak?
- How long does recovery take after a consumer or dependency outage?
