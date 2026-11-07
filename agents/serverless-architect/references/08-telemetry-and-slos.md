# Step 8 — Telemetry, objectives and paging

Use for the `OBSERVABILITY` field in `design` and the telemetry lens in `review`.

Grounding: the OpenTelemetry specifications and semantic conventions (FaaS, messaging and HTTP), W3C Trace Context, the tracing extension of the event-envelope standard (`04`), the public Google SRE material on SLOs and multi-window burn-rate alerting, and the monitoring documentation of each provider (all three accept OpenTelemetry data). MIKA's journey objectives and minimum alert set sit on top.

## What should each journey promise?
For each key journey on the workload card, write one or two indicators (SLIs) and an objective (SLO) over a rolling window.

| Journey | Indicator | Objective (28 days) |
|---|---|---|
| Ferry: single-seat booking | share of booking requests answered with success within 1.5 s | 99.5% |
| Ferry: cancellation notice | share of `SailingCancelled` messages whose passenger notices go out within 5 minutes | 99% |
| Clinic: radiograph viewable by the vet | share of uploads viewable within 3 minutes | 99% |
| Co-op: meter reads stored | share of half-hour periods with reads stored by 02:00 the next day | 99.9% |

The gap to 100% is the error budget. Page on how fast the budget is being spent, not on single errors: for example a fast-burn page at 14.4× over one hour and a slow-burn page at 6× over six hours, the multi-window pattern in public SRE guidance. Hand-off-style journeys need freshness and completion indicators, not only request latency.

## The MIKA minimum alert set
Every component type gets a minimum set. Each alert has an owner and a runbook link; anything lacking either is a dashboard panel, not an alert.

| Component | Alert on | Why |
|---|---|---|
| Function or container | error rate; sustained throttling; p99 duration above 80% of the timeout; concurrency close to its cap or the account pool | failures and capacity before they bite |
| Queue | age of the oldest message beyond the journey's freshness budget; any message in the dead-letter queue | backlog and silent loss |
| Ordered-log consumer | how far behind the newest record the consumer is | stuck partition, poison record |
| Bus | failed deliveries to targets; dead-letter depth | routing works but delivery does not |
| Workflow | failed, timed-out and aborted runs; runs open longer than expected | stuck cases |
| API | 5xx rate; p99 latency against the objective; sudden 4xx rise | user-visible failure or abuse |
| Table or database | throttled requests; connections close to the limit | hot keys, connection storms |
| Account | usage of any platform limit above 80%; budget and spend-anomaly alerts | headroom, runaway spend |
| Journey | fast and slow burn rate | the page that should fire first |

Page on journey burn rates and on dead-letter arrivals for key journeys. Send component alerts to tickets or chat unless they predict a breach.

Synthetic probes (each provider has a scripted-probe service) cover journeys with little real traffic, such as early-morning ferry bookings or weekend clinic uploads.

## What should every log line carry?
Structured JSON with the same keys everywhere:

| Key | Example |
|---|---|
| `timestamp`, `level` | ISO 8601, `INFO` |
| `service`, `component`, `version` | `bookings`, `quote`, alias or revision name |
| `trace_id`, `span_id` | from W3C Trace Context |
| `event_id`, `correlation_id` | the envelope `id` (`04`); a journey-level id |
| business keys | `bookingRef`, `clinicId`, `meterId` |
| `outcome` | `accepted`, `rejected:validation`, `failed:timeout` |

- Log decisions and state changes, not every line executed. Debug level off in production unless sampled.
- Never log secrets, tokens or whole personal records (`07`).
- Give every log store a retention period; some platforms keep logs forever by default. Use cheaper infrequent-access log classes for logs rarely searched.
- Derive business counts from structured log lines (the embedded metric formats the platforms offer) instead of many separate metric API calls; avoid high-cardinality labels, which multiply metric cost.

## How are traces joined across hand-offs?
- Instrument with OpenTelemetry, the vendor-neutral standard, so the back end can change later; the providers' own tracers also accept or emit it.
- Carry `traceparent` in HTTP headers and inside messages (the envelope tracing extension, or message attributes on queues and topics). Where a platform does not carry it, put it in the payload and restore it in the consumer.
- For fan-out and batches use span links instead of parent and child, so one batch span can point to the many producer spans it consumed.
- Apply the semantic conventions (`faas.trigger`, `faas.coldstart`, `messaging.system`, `messaging.destination.name`) so dashboards read the same across providers.
- Sample on purpose: head sampling for healthy high-volume traffic; keep every error trace where the back end offers tail sampling.
- Attach a few searchable business keys to each trace to find a case fast.

House example: the energy co-op traces a meter-read file from the partner callback endpoint through the boundary bus, the validation function, the settlement queue and the settlement workflow. One trace per file, span links from settlement to each contributing file; support staff find any member's missing half-hour by `meterId`.

## How do we investigate when something breaks?
1. Check the journey objective view: is it real, and how wide?
2. Check what changed: deployments, configuration, limits, partner status pages.
3. Slice indicators and traces by version, Region, component, error type and business key until the cause narrows; compare latencies hop by hop to find where time is spent.
4. Contain before you cure: roll back the alias or revision, pause a consumer, raise a limit, drop optional work.
5. Fix, then replay dead-lettered or archived messages, watching idempotency.
6. Blameless write-up; add the missing alert, test or failure-path card item.

## Signals for the review
- Key journeys with no objective, or no alert on their dead-letter queue → High.
- No correlation across hand-offs → Medium; High when an incident on a key journey cannot be followed end to end.
- Logs with no retention, or debug logging at volume in production → Medium (spend); High if personal data is logged.
- Alerts with no owner or runbook, or a dozen alerts per incident → Medium (noise hides real pages).
