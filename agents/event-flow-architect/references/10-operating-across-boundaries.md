# 10 · Running it: latency, retention, visibility and runaway reactions

An integration that works on launch day still has to be operated by parties who each see only their own side. This file covers four operating questions MIKA asks of every design.

## O1 · Will events arrive while they are still useful? (latency budget)
Start from the **usefulness window** (`01`) and split it into a budget per hop.

| Hop | Typical cost | Ways to cut it |
|---|---|---|
| Capture in the system of record | ms to minutes (polling adapters set the floor) | Outbox relay or CDC instead of polling |
| Producer → broker/router | ms within a region | Same region; persistent connections |
| Routing, filtering, enrichment | ms per stage, adding up | Fewer stages; enrich in parallel; move enrichment to the consumer |
| Long-distance network | tens of ms between continents, set by physics | Regional channels; process near consumers |
| Consumer processing and retries | ms to minutes | Scale consumers by partition; bounded retries |

MIKA rule: the sum of p99 hop budgets must fit within half the usefulness window, leaving the rest for retries and incidents. Measure end-to-end latency as `arrival time − time` attribute, per consumer.

*Ferry example*: the bus operator needs a cancellation 10 minutes before departure to hold a bus. Budget 5 minutes: capture 30 s (outbox), routing 5 s, webhook delivery 5 s, retries up to 4 minutes. The current email path averages 25 minutes.

## O2 · How long are events kept, and can they be replayed? (retention)
- **Retention is a promise**: state it per channel ("7 days"). Too short and an offline consumer silently loses events and builds wrong state; too long and storage and privacy costs grow.
- Size retention to the **longest consumer outage you intend to survive**, plus margin. Give consumers that fall further behind a **resync path**: a snapshot endpoint, a compacted latest-state topic, or a bulk export.
- **Long-lived history** is a separate need: audit, settlement, incident reproduction, model training. Serve it from an archive sink, an immutable audit channel, or an event-sourced store — not by keeping every operational topic forever.
- Data copied into a consumer's database follows that consumer's data-at-rest rules and the usage terms (`09`).

## O3 · Can each side see what is happening? (visibility)
Push delivery has no natural error channel back to the producer, and each party sees only its own systems. Design visibility in:
- **Producer side**: publish rate per event type, outbox backlog, delivery failures per consumer, dead-letter counts with owners.
- **Consumer side**: lag (behind by how many events or how much time), duplicate rate, processing errors, age of the newest event.
- **Quiet-producer detection**: a stopped producer looks exactly like a quiet day. Use expected-rate checks per source, or heartbeat events on channels with irregular traffic. Essential for `N→1` designs with thousands of meters or devices.
- **Tracing across hops**: propagate W3C Trace Context (`traceparent`, `tracestate`) in the CloudEvents tracing extension or protocol headers, and name spans with the OpenTelemetry messaging conventions so tools from different parties line up.
- **What to share across a boundary**: enough to trace a failure (delivery status, event IDs, timestamps, error class) but not internal topology or other consumers' data. Offer partners a delivery log or status page; webhook senders commonly expose per-endpoint attempt history.
- **Control actions**: each side should be able to pause, resume, replay from a point and throttle its own part without calling the other — producer platforms usually set these rules, as API providers do.

## O4 · Can automated reactions run away? (feedback loops)
When consumers act automatically and their actions produce new events, independent parties can form loops nobody designed: A's price change triggers B's, which triggers A's again; every home battery discharges at the same second on a grid-stress alert.
Defences:
- **Hop count or cause ID** in an envelope extension; drop or alert past a limit, and detect cycles in derived events.
- **Rate limits and circuit breakers** on automated reactions, with a safe default state when tripped.
- **Jitter and staggering** for `1→N` commands to device fleets (the co-op alert includes a randomised response window per battery).
- **Human override** for high-impact actions, and dashboards that show reaction rates, not just event rates.
- **Game days**: rehearse broker loss, a partner flood and a replay storm before go-live.

## Severity hints for reviews
- Automated reactions across parties with no rate limit or breaker → **Critical** where physical or financial harm is possible (batteries, payments), **High** otherwise.
- No quiet-producer detection on an `N→1` channel feeding billing or safety decisions → **High**.
- Retention shorter than a normal weekend outage for a consumer that rebuilds state → **High**.
- Trace context missing across an internal hop → **Low** to **Medium**.
For platform-level internal streaming operations (cluster sizing, partition planning, stream processing state), hand over to `event-streaming-architect`.
