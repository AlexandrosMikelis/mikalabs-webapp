# Time, determinism and reprocessing

Use for the TIME & ORDER field in `design` and for correctness findings in `review`. A streaming service should produce the same results whether it processes events live or replays a year of history. Time handling is where that usually fails.

## 1. Three clocks
| Time | Set by | Meaning | Use |
|---|---|---|---|
| **Event time** | The producer, when the fact occurred | When it happened in the real world | Business logic, windows, joins, ordering across streams |
| **Ingestion (log-append) time** | The broker, when the record was written | When the platform received it | Monitoring delay; fallback when the producer cannot set event time |
| **Processing time** | The consumer's wall clock, when it handles the event | When the service saw it | Timeouts, operational metrics; almost never business logic |

Rule: **business results depend on event time**. Processing time makes results depend on when the service happened to run, so a replay or a lagging consumer gives different answers.

Practical points:
- Producers must stamp event time at the source, in UTC, with a defined precision. Governance should fix the convention (`09`).
- Device clocks drift and may be wrong; record both device time and ingestion time for readings (`02`) and decide which is authoritative.
- Server clocks are synchronised by NTP or similar, but skew of milliseconds to seconds remains; never rely on cross-host timestamps for fine-grained ordering.
- A consumer can extract event time from the payload or header with a timestamp extractor; frameworks support this (Kafka Streams TimestampExtractor, Flink WatermarkStrategy).

## 2. Determinism
A processor is deterministic if, given the same input streams, it produces the same output regardless of timing, restarts or parallelism. Threats:
- **Processing-time logic** (`now()` in business code).
- **Consuming several partitions or streams in arbitrary interleaving**: the order in which a consumer reads from different inputs depends on fetch timing. Frameworks reduce this by choosing the next record with the lowest timestamp across inputs (event scheduling); results become reproducible when inputs are available, but not perfectly when one input is delayed.
- **Calling external services during processing**: the answer depends on when you call. Replaying a year of events against today's API state gives wrong historical results. Prefer joining against a stream of that service's state (materialised locally) so lookups are time-consistent; if a call is unavoidable, record its response as an event.
- **Random numbers, unordered collections, non-idempotent side effects.**
Perfect determinism is not always achievable; aim for **reproducible within documented bounds** and say where the bounds are.

## 3. Watermarks and stream time
A stream processor needs to know when it has probably seen all events up to some event time, so it can close a window and emit a result.
- **Watermark**: an assertion flowing with the data that "no events earlier than T are expected any more". Generated from observed event times minus an allowed out-of-orderness. Common in Flink, Beam, Spark Structured Streaming.
- **Stream time**: the highest event time seen so far by a task (Kafka Streams' approach); windows close relative to it plus a grace period.
- In parallel processing, a downstream operator's notion of time is the **minimum** across its input partitions; one idle or slow partition holds everyone back. Configure idle-source handling so a quiet partition does not stall results.
Choosing the allowed lateness is a business trade-off: longer waits mean more complete but later results.

## 4. Out-of-order and late events
Causes: producers buffering and retrying, devices offline then reconnecting, multiple producers with skewed clocks, repartitioning, cross-region replication, upstream batch loads.
Effects: windows emit before all data arrives, joins miss, "latest state" goes backwards if an older event arrives after a newer one.
Strategies:
1. **Per-entity version numbers** so consumers ignore stale updates to state.
2. **Grace periods / allowed lateness** on windows; then decide what happens to events arriving later still:
   - **Drop** (count them; alert on volume).
   - **Update and re-emit** the window result as a correction (consumers must handle updates, e.g. upsert by window key).
   - **Side output** to a late-events stream for separate handling or reconciliation.
3. **Reconcile on time boundaries**: for reports that must be complete (end-of-day financials), produce a provisional result in real time and a final result after a cut-off, clearly labelled.
4. **Reorder buffer**: hold events briefly and emit in event-time order. Adds latency equal to the buffer.

## 5. Windows
| Window | Shape | Example |
|---|---|---|
| **Tumbling** | Fixed size, non-overlapping | Deliveries per depot per hour |
| **Hopping / sliding** | Fixed size, overlapping, advancing by a step | 15-minute moving average updated every minute |
| **Session** | Bounded by inactivity gaps per key | A customer's browsing session ending after 20 minutes idle |
| **Global with triggers** | One window, custom emit rules | Running totals emitted every N events |
Design notes: windowed state needs retention at least window size plus grace; emission mode (every update vs final only) changes downstream load; window keys should include window start for idempotent upserts downstream.

## 6. Reprocessing versus live processing
A well-designed service can be reset and run from the start of its input streams:
- to fix a bug and recompute outputs;
- to build a new service or a new version side by side;
- to recover lost state.
What changes during reprocessing:
- **Throughput**: events arrive in bulk, all "late" by processing time; processing-time logic breaks immediately.
- **Watermarks and windows** advance quickly; grace periods based on wall time misbehave.
- **Side effects** (emails, payments, external calls) must be suppressed or made idempotent. A replay must not re-send a year of notifications.
- **Output streams**: reprocessing writes outputs again. Downstream consumers see duplicates or corrections. Options: write to a new output stream version and switch consumers; or rely on idempotent keyed upserts downstream.
- **Retention**: you can only reprocess what the inputs still hold. If inputs are short-retention, reprocessing needs an archive or snapshot path.
Write a **reprocessing runbook** per service: how to reset offsets, how to wipe or rebuild state, how to suppress side effects, how downstream is informed.

## 7. Intermittent failures and connectivity
- A producer that loses its broker connection buffers or fails. Buffered events arrive late, possibly out of order; local buffers can overflow and drop events. Decide: block, buffer to disk, or drop with metrics.
- Network partitions between a consumer and the broker cause rebalances and reprocessing from the last commit.
- Upstream outages create gaps followed by bursts; downstream windows must not treat a burst as a real spike without event-time logic.

## 8. Testing time logic
- Test with controlled timestamps (test drivers that advance stream time deterministically; e.g. Kafka Streams TopologyTestDriver, Flink test harnesses).
- Include out-of-order, late, duplicate and missing events in test data.
- Replay a production-like slice of history and compare results with the live run.

## Review checks
- Which time does each piece of business logic use? Any `now()`?
- Are external lookups during processing time-consistent on replay?
- Watermarks/grace defined? What happens to late events? Measured?
- Idle partitions handled?
- Can the service be reset and replayed? Are side effects suppressed? Is there a runbook?
- Does input retention support the reprocessing promise?

## Example (invented)
A wind-farm operator computes 10-minute average output per turbine for grid reporting. Turbines buffer readings when the radio link drops and send them up to an hour late. Design: event-time tumbling windows with a 15-minute grace period emitting provisional results to `turbine-output-10m` (upsert by turbine + window start); a late-events side stream feeds a nightly reconciliation job that publishes final values to `turbine-output-10m-final` before the regulator's cut-off. Reprocessing for a bug fix writes to `turbine-output-10m.v2` and the reporting service switches once the backfill catches up.
