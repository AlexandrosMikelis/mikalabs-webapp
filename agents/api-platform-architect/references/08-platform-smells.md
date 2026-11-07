# MIKA catalogue of platform smells

A smell is a pattern that usually signals trouble, not a rule violation. Each entry gives the **symptom** (what you see in the design), the **detection signal** (how to confirm it in config, telemetry or the call ledger), the **fix**, and a **default severity** that you adjust for scale, criticality and blast radius (see 10). Names are MIKA's own; use them in findings so callers can look them up.

Smells are grouped by the step of Daedalus' procedure where they usually surface.

## Surfacing in the call ledger (step 1)

### Hairpin route — default High at > 5 services, Medium below
- Symptom: internal workloads call each other through the public hostname of the entry gateway, because that is the only place that knows where services live.
- Detection: ledger rows with caller trust W whose control point is the entry gateway; gateway access logs with source addresses inside the cluster or data centre; traces that leave and re-enter the perimeter; outbound data-transfer or NAT charges for calls that never needed to leave.
- Fix: platform service discovery (cluster DNS, `Service` objects) or a mesh for internal calls; keep the entry gateway for outside callers only.

### Orphan hop — default High on the critical path
- Symptom: a proxy, gateway, flag service or mesh control plane with no team on call for it.
- Detection: ledger "hop owner" column empty or "everyone"; no alert routes to a named rotation; no SLO.
- Fix: assign one accountable team, on-call matching the SLO it supports, a runbook and a tested failover.

### Stretched conversation — default High during migrations
- Symptom: two services that exchange many synchronous calls per user request end up on opposite sides of a network or cloud boundary.
- Detection: traces showing many sequential cross-boundary spans per request; latency step change after a move; a rising cross-site data-transfer bill.
- Fix: move the pair together, batch or cache the calls, or keep them co-located until both can move (see 02).

## Surfacing in the release plan (step 3)

### Canary without eyes — default High
- Symptom: traffic is shifted in steps, but nothing decides whether a step passed.
- Detection: rollout definitions with pauses but no analysis; no baseline; promotion done by elapsed time only.
- Fix: a gate card per step (04) and automated abort; until then call it a slow rollout, not a canary.

### Shadow with side effects — default Critical if payments or messages to people are involved
- Symptom: mirrored traffic reaches a version that writes data or calls third parties.
- Detection: mirror rules pointing at a backend with write paths or outbound integrations not stubbed; duplicate records or messages during a dark launch.
- Fix: sandbox or stub every side effect for the shadow target; compare intended effects offline.

### Zombie flag — default Medium, High if names are reused
- Symptom: flags still in code long after reaching 100%; flag names recycled for new features.
- Detection: flag inventory with no owner, no removal date or > 90 days at a fixed value; code search showing branches for flags that no longer exist in the flag service.
- Fix: owner, type and removal date on every flag; a pipeline check that fails on expired flags; never reuse a name.

### Big-bang data switch — default High
- Symptom: a release that changes a schema or message format in the same step as the code, with no period where both forms work.
- Detection: migration scripts that drop or rename in the same release; no expand/contract plan; rollback plan says "restore backup".
- Fix: parallel change: expand, migrate, contract over separate releases (03).

## Surfacing in signals and gates (step 4)

### Cached canary — default High
- Symptom: a shared cache in front of the service answers for both versions.
- Detection: cache hit ratio high on canary routes; canary error rate suspiciously identical to stable; failures appear only at 100%.
- Fix: exclude canary-routed requests from shared caches or include the version in the cache key; measure at the service.

### Broken thread — default Medium
- Symptom: traces stop at a proxy, queue or service that does not pass trace context on.
- Detection: many root spans starting mid-system; traces with gaps at the same component; message headers without `traceparent`.
- Fix: OpenTelemetry instrumentation or propagators on that component; a fitness function that fails deployment without propagation.

## Surfacing at control points (step 5)

### Smart pipe — default High
- Symptom: business rules, orchestration, enrichment or data reshaping in gateway plug-ins, scripts or proxy filters (Lua, Wasm, custom filters).
- Detection: plug-in code that references domain fields; gateway changes required for business features; plug-in and service released together.
- Fix: keep plug-ins and filters to cross-cutting concerns (limits, validation, auth integration, metrics and traces); move composition to a service owned by the consuming team.

### Retry echo — default High under load
- Symptom: retries configured at several layers on one path.
- Detection: the one-owner table in 05 shows more than one tick for retries; retry counters rising in several layers during an incident. Arithmetic: 3 attempts at the gateway × 3 in the pod's proxy × 3 in the client = up to 27 calls per user action at the slowest moment.
- Fix: one layer retries, with a budget and only for idempotent operations; timeouts shrink toward the back.

### Synchronised stampede — default Medium, High for shared dependencies
- Symptom: clients retry at fixed intervals, or all reconnect the moment a dependency recovers.
- Detection: request spikes at exact multiples of the retry interval; a recovered service falling over again within seconds; client code with constant back-off.
- Fix: exponential back-off with jitter and a retry cap (public practice documented in the AWS Builders' Library and gRPC retry design), plus load shedding at the server.

### Probe cascade — default High
- Symptom: Kubernetes liveness probes check downstream dependencies, so a slow database makes every pod restart.
- Detection: probe handlers that call databases or other services; restart storms correlated with a dependency's latency.
- Fix: liveness checks only the process itself; readiness may reflect dependencies; startup probes for slow boots (as the Kubernetes probe documentation advises).

### Relay of gatekeepers — default Medium, High if it blocks changes
- Symptom: a chain of gateways or proxies, each added by a different team for one concern.
- Detection: more than two request-level hops before the first service; a route change needs tickets to several teams; nobody can say which hop sets a header.
- Fix: keep only hops that mark a real trust or ownership boundary; move per-team configuration into self-service on a shared control point.

### Snowflake routes — default Medium, High for the entry gateway
- Symptom: gateway or mesh configuration changed by hand in an admin console.
- Detection: no repository for routes and policies; drift between environments; incidents traced to an unreviewed change.
- Fix: configuration as code, validated in CI, rolled out progressively, revertible in one step.

### Proxy on borrowed time — default Medium, High if internet-facing
- Symptom: the estate depends on a routing proxy or its Kubernetes integration that is no longer maintained or is past its announced end of maintenance.
- Detection: version older than the project's supported window; retirement notices. Dated example: in November 2025 Kubernetes SIG Network announced the retirement of the community ingress-nginx controller, with best-effort maintenance only until March 2026 and no further releases or security fixes after that. Verify the current status before citing it.
- Fix: plan a move to a maintained implementation, preferably one supporting the Kubernetes Gateway API (05), as a release-managed migration with routes moved in batches.

## Surfacing at trust boundaries (step 6)

### Open lobby — default High
- Symptom: inside the cluster or data centre any workload can call any other.
- Detection: no network policies, or allow-all ones; no workload authorisation policies; flat VPCs with broad security groups.
- Fix: default deny at the network tier plus explicit allows, and identity-tier policy where a mesh exists (07). Policy design → security review.

### Certificate cliff — default High
- Symptom: service certificates issued and rotated by hand or by calendar reminder.
- Detection: certificates valid for a year or more; expiry-driven incidents in the history; no automation (cert-manager, mesh CA, SPIRE).
- Fix: automated issuance and short-lived rotation; alert on time-to-expiry.

### Undeclared fail mode — default Medium, High on regulated paths
- Symptom: nobody can say whether an auth filter, rate limiter or WAF blocks or lets traffic through when it errors.
- Detection: absent from runbooks; defaults never tested.
- Fix: decide per path, document, test in a game day; security review of the choice.

## Surfacing during evolution (step 2)

### Immortal strangler router — default High
- Symptom: the routing layer introduced for a strangler migration accumulates conversions and business rules.
- Detection: router code or scripts growing release by release; no removal date; new features implemented in the router.
- Fix: the router routes only; conversions become explicit adapters with owners and an end date; logic lives in the old or the new service.

### Version pile-up — default Medium
- Symptom: many major versions of an API live at once with no plan to retire any.
- Detection: no per-consumer usage metrics per version; no `Deprecation` or `Sunset` headers; versions older than their announced support window.
- Fix: usage tracking, deprecation headers and a published retirement policy (03).
