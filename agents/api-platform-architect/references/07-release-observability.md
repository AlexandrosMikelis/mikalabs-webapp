# Observability for releases and API platforms

## Why it matters more after decomposition
A single application has one log and one process to inspect. Every extracted service adds hops, failure points and places to look. Without observability, distributed systems are hard to reason about and releases can't be judged.

## The three signal types
- **Metrics**: numeric measurements at intervals (throughput, latency, error counts, CPU, memory, GC pauses, queue depth). Cheap to store, good for alerts and release gates.
- **Logs**: detailed records from a component. Use structured logs; separate **journal** entries (key business events and their outcomes, used sparingly) from **diagnostic** entries (failures and unexpected errors) with a log-type field, so either can be pulled quickly.
- **Traces**: follow one request across components. A trace ID is set as close to the origin as possible (often the gateway) and propagated by every hop, including through queues (in the message envelope).
Standard: **OpenTelemetry** (CNCF) for instrumentation and export of traces, metrics and logs, avoiding vendor lock-in; use W3C Trace Context headers for propagation (general knowledge: traces and metrics are stable; check current status of logging support for your language SDKs).

## Which metrics
- **RED** (rate, errors, duration) per API/route; **four golden signals** (latency, traffic, errors, saturation); **USE** (utilisation, saturation, errors) for resources.
- Business KPIs alongside: conversions, sign-ups, orders, active sessions. A release can be technically healthy and commercially harmful.
- Example set for a service API: requests per minute; latency against its SLO (watch percentiles, not only averages); availability; CPU and memory; unauthorised responses from a partner integration (possible leaked credential); a business count (e.g., total registered users).

## Make errors API-aware
- 5xx: provider or infrastructure fault. Gate releases on these.
- 4xx: usually the client, but don't ignore them: a spike in 400s after a release can mean an unannounced breaking change; a burst of 401/403 can mean credential theft or probing (→ security).
- Count timeouts and retries separately; retries can hide failures and multiply load.

## Reading the signals
- Establish a baseline per signal and alert on meaningful deviation, not on fixed guesses.
- Look for leading indicators (rising GC time, saturation, queue depth) before the lagging one (latency SLO breach) and the outage.
- Avoid false positives: low-traffic alerts fire on weekends and holidays; scope them to business hours or tie them to activity (e.g., logins).
- In an incident, traces first to locate the failing hop; then logs and metrics for that component.
- Tie each important metric to an alert with an owner; dashboards nobody watches don't count.

## Gotchas that break releases
- **Response caching**: a gateway or proxy cache can serve good old responses while the canary is broken; full rollout then fails everywhere. For release validation, ensure canary traffic bypasses caches (e.g., `Cache-Control: no-cache, no-store` on validation requests, or cache keys including version) and measure at the service, not only at the edge.
- **Header propagation**: services that terminate a request and make new downstream calls must copy trace/correlation headers, or traces break. For identity headers, decide explicitly what may travel downstream; forwarding credentials can let a service impersonate a user or another service → security review.
- **Eventual consistency**: during migrations and canaries, two versions may read and write differently; reconcile before declaring success.
- **Mesh vs app telemetry**: the mesh gives per-hop network metrics; only the app knows business meaning and must propagate context.

## Fitness functions for observability (see 08)
Fail the build or deployment when a service doesn't emit the agreed metrics, trace propagation or health endpoints.

## Opinionated platform / paved path
- Decisions like these (telemetry libraries, header propagation, caching rules, release strategy, network policy defaults) otherwise get made inconsistently by each team, or not at all.
- A platform team can offer a **paved (golden) path**: the easiest way to production also gives observability, release tooling and policy by default.
- Treat developers as customers: involve them in the design, collect feedback, make features as transparent as possible (e.g., telemetry configured automatically).
- Plan how existing users get upgrades, not only new services.
- Opinions are constraints: balance consistency against team freedom; centre on a small set of supported languages where possible.
