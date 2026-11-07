# Operations, resilience, security basics and scaling

With one process, a failure has one place to look. With fifty services, a slow response may come from any hop, and partial failure is the normal state. This file covers what every service and the estate need to be operable. Depth handoffs: security → Argus (API Security Reviewer); gateway and mesh controls → Daedalus; load and capacity engineering → Atlas (Scalability Reviewer).

## Observability
**Monitoring** watches for known failure modes; **observability** is the ability to ask new questions of the system from its outputs and understand behaviour you didn't predict. Microservices need the second.

### Building blocks
- **Log aggregation**: every service writes structured logs (JSON, consistent field names) to one searchable store. Include timestamp, service, version, instance, severity, correlation/trace ID, and business identifiers where safe. Never log secrets or unnecessary personal data. This is the first thing to have — before the first service goes live.
- **Correlation IDs**: generated at the edge, propagated on every call and message, logged everywhere. Without them, a request across services can't be followed.
- **Metrics aggregation**: request rate, errors, duration (RED) per endpoint; saturation of resources; business metrics (bookings per minute). Watch label cardinality: per-user labels can blow up metric stores.
- **Distributed tracing**: spans per hop show where time goes and where failures start. OpenTelemetry is the vendor-neutral standard for instrumenting traces, metrics and logs; instrument with it and choose back ends freely. Sample sensibly; keep all traces for errors where possible.
- **Events over pillars**: think of telemetry as rich, structured events with context, from which logs, metrics and traces are views. The goal is answers, not three separate tools.

### Are we OK? SLOs and alerting
- Define **service level indicators** (what users experience: success rate, latency) and **service level objectives** (targets, e.g. 99.5% of searches succeed within 300 ms over 28 days).
- An **error budget** (the allowed failure) guides trade-offs: budget left → ship faster; budget burnt → slow down and fix reliability.
- **Alert on symptoms users feel** (SLO burn rate, failed checkouts), not on every CPU spike. Every alert needs an owner, a runbook, and must be actionable. Alert fatigue makes real alerts get ignored.
- **Semantic monitoring**: check that the system does its job end to end — synthetic transactions and business-outcome metrics ("no orders in 10 minutes at 7 pm is wrong").
- Know what **normal** looks like: baselines by time of day and season.

### Operating a changing estate
- Systems with many services run partly degraded most of the time; design dashboards and alerts to show impact, not every blip.
- Make **what changed recently** easy to see: deployments, flag changes, config changes on one timeline.
- **Health checks**: liveness (restart me) and readiness (route to me) separately; readiness shouldn't fail because a non-critical dependency is down.
- Standardise across services: log format, trace propagation, metric names, dashboards per service. Put these in the service template.
- Choose tools that are easy for every team to use, integrate with open standards, show context, are near real time, and scale to your volume.

## Resilience
Resilience covers absorbing expected failures (robustness), recovering from incidents (rebound), coping with surprises, and learning continuously. Most technical work targets robustness and rebound; the last two are cultural (blameless reviews, see `09`).

### Decide how much is enough
Per service and per user journey: how much downtime or degradation is acceptable, at what cost? Express as SLOs. A recommendation feature can be off; a payment confirmation cannot. Plan **degraded functionality**: what does the page show if a dependency is down? (Hide the widget, show cached data, accept the order and confirm later.)

### Stability patterns (apply to every remote call)
- **Timeouts** on every call, set from observed latency of the callee plus a margin; total budget for a user request split across its hops. No timeout = threads pile up until the caller dies.
- **Retries** only for safe, idempotent operations, with exponential backoff and jitter, and a cap. Retries multiply load during an outage; budget them.
- **Idempotency**: operations that may be repeated (retries, redelivered messages) must produce the same result; use idempotency keys or natural keys and de-duplication.
- **Bulkheads**: separate resource pools (connection pools, thread pools, instances) per dependency or per type of work, so one failing dependency can't exhaust everything.
- **Circuit breakers**: after repeated failures, stop calling the dependency for a while and fail fast (or fall back); probe to recover. Prevents cascading failure.
- **Load shedding and rate limiting**: reject excess work early rather than slowing everyone down.
- **Asynchrony**: queue work that doesn't need an immediate answer; the caller stays up when the worker is down.
- **Redundancy**: multiple instances across zones; no single points of failure in the path.
- **Fast start-up and graceful shutdown**, so the platform can replace instances freely.
- **Caching** of reads to survive dependency outages (serve stale with a warning).
Make these defaults in the platform or service template, not per-team inventions. Mesh or gateway implementation of retries and breakers → Daedalus.

### Consistency vs availability
When the network partitions, a distributed data store must choose: keep answering with possibly stale data (available) or refuse until consistent (consistent) — the CAP trade-off. Most business capabilities tolerate staleness for some data (catalogue, profile) and not for other data (balance, seat allocation). Decide per capability; it isn't all-or-nothing within a system.

### Proving resilience
- **Chaos engineering**: controlled experiments injecting failure (kill instances, add latency, cut a dependency) to confirm the system behaves as expected; start in pre-production, then production with a small blast radius.
- **Game days**: rehearsed incident scenarios with the people involved.
- Test **backups by restoring** them and failovers by doing them.
- **Learn from incidents** in blameless reviews; feed findings back into defaults.

## Security basics
Covered here only as a microservices architect needs it; depth → Argus.
- **Least privilege**: each service gets its own credentials with only the access it needs; no shared database users or super-tokens.
- **Defence in depth**: don't rely on one perimeter; assume an attacker can reach the internal network.
- **Zero trust direction**: authenticate and authorise every service-to-service call (mutual TLS, workload identity), encrypt in transit everywhere, rather than trusting the internal network implicitly.
- **Secrets**: in a secrets manager, rotated, never in code or images.
- **Patching**: owners keep runtimes, base images and libraries up to date; an inventory of what runs where makes urgent patches possible (see `09`).
- **User context**: services must make authorisation decisions with the end user's identity, not only "a trusted service called me" — the confused deputy problem. Propagate a token (e.g. a JWT) with user claims, or exchange it; avoid authorisation solely at the edge.
- **Data**: classify; keep sensitive data in as few services as possible; encrypt at rest where it matters; back up and test restores.
- **Security in the pipeline**: dependency and image scanning, infrastructure policy checks.

## Scaling
Four axes (general framing):
1. **Vertical**: bigger machines. Fast and simple; limited and costly at the top.
2. **Horizontal duplication**: more identical instances behind a load balancer; needs stateless services or shared state handled elsewhere.
3. **Data partitioning**: split work by key (customer, region) so each instance or shard handles a subset.
4. **Functional decomposition**: separate capabilities to scale independently — the axis microservices add.
Combine them; start with the simplest. Many monolith scaling problems are solved by axes 1–3 without decomposition. Measure before scaling: find the bottleneck with load tests and profiling.

### Caching
- Places: client side, at a proxy or CDN, or inside the service. Closer to the consumer is faster but harder to invalidate.
- Purposes: performance (lower latency), scale (fewer calls to the origin), robustness (serve when the origin is down).
- Invalidation: time-to-live is simplest; event-driven invalidation is fresher but more complex. Avoid many layers of cache for the same data — staleness compounds.
- Beware of caching responses that should never be cached (personalised data behind shared keys).

### Autoscaling
Scale on load signals (CPU, queue depth, request rate) and on schedules for predictable peaks. Test scaling behaviour, set upper limits for cost safety, and remember that scaling a service can overwhelm its database or downstream dependencies.

### When to start again
A design that served 10x less load may need rethinking at 10x more. That's normal; plan for evolution rather than designing for loads you may never see. Capacity engineering in depth → Atlas (Scalability Reviewer).

## Review prompts for this lens
- Can a request be traced across all services it touches?
- Are SLOs defined for user journeys, and are alerts tied to them?
- Do all remote calls have timeouts? Are retries bounded and only for idempotent operations?
- What happens to the main journey when each dependency is down?
- Do services authenticate each other? Is the user's identity available for authorisation?
- Has failover or restore been tested this year?
