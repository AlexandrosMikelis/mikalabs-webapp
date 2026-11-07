# What evidence says a step worked, and who stops it if not?

A traffic shift without agreed evidence is a guess. Before any release or migration step, Daedalus wants a **gate card**: the signals, their thresholds relative to a baseline, the minimum sample, the observation window and the person or tool that stops the step.

## Where does the evidence come from?
- **OpenTelemetry** (CNCF) is the vendor-neutral way to produce traces, metrics and logs and to export them over OTLP. Its semantic conventions give HTTP, RPC and messaging attributes common names, so dashboards and gates work across languages. Traces and metrics are stable in the specification and in the main language SDKs; logs support matures per language, so check the SDK you use.
- **W3C Trace Context** (`traceparent`, `tracestate`) carries the trace across HTTP hops; **W3C Baggage** carries a few business keys (clinic id, route) when needed. Every proxy, gateway and service must pass these headers on; message producers put them in message headers so traces survive a queue.
- **The mesh or gateway sees hops; only the application sees meaning.** Proxy metrics give per-route rate, errors and latency without code changes. It cannot tell a successful booking from a polite failure page, so applications still emit business counters and propagate context.
- Start the trace as close to the caller as possible, usually at the entry gateway, and return the trace id in a response header so support staff can find a failing request.

## Which signals gate a release
| Family | Examples | Use as gate? |
|---|---|---|
| Request health per route (rate, errors, duration) | 5xx ratio, p95/p99 latency, request rate | Yes: primary gate |
| Saturation of what the change touches | CPU throttling, connection-pool use, queue depth, database locks | Yes, as early warning |
| Client-side errors | 400/422 ratio, 401/403 bursts | Watch: a 400 jump can mean an unannounced breaking change; a 401/403 burst can mean probing or leaked credentials (security hand-off) |
| Hidden failure | retry count, timeout count, circuit-breaker opens | Yes: retries can make a failing version look healthy |
| Business outcome | bookings completed, readings ingested, invoices issued | Yes, for anything user-facing: technically healthy can still be commercially harmful |

SLOs and error budgets (public SRE practice) turn these into policy: if a service has spent its error budget, risky releases pause until reliability work restores it.

## The gate card
```
Step: <name and traffic share>
Baseline: <metric values from the stable version over the same hours last week>
Pass if, over <window> and at least <N> requests to the new version:
  - 5xx ratio ≤ max(baseline × 1.5, <floor>)
  - p95 latency ≤ baseline + <ms>
  - <business counter> per request within ±<x>% of stable
Abort if any of: <hard limits>
Decides: <release tool> automatically / <role> for manual gates
On abort: traffic back to stable within <seconds>; page <owner>
```
Compare the canary with the stable version over the same period (side by side), not with yesterday: traffic mix changes by hour and day.

### How long is long enough?
A gate that sees 40 requests proves little. Rule of thumb: to see whether an error rate near *p* has doubled, you need enough exposure to expect at least about ten errors at the baseline rate, so roughly `10 / p` requests per step at minimum (more for subtle regressions). At a 0.5% baseline that is about 2,000 requests to the canary per step. Low-traffic services need longer windows or a larger first step with a manual gate, not a 1% canary that never collects evidence.

## Worked mini-example: energy co-op meter-readings API
- Baseline (stable v3.7, weekdays 08:00–18:00): 0.2% 5xx, p95 180 ms, 1.00 readings stored per accepted request.
- Canary v3.8 steps: 5% for 30 min, 25% for 1 h, 50% for 2 h, then 100%.
- Pass: 5xx ≤ 0.3% (floor 0.3%), p95 ≤ 230 ms, readings stored per request ≥ 0.99, at least 5,000 requests per step.
- Abort: any data-validation rejection spike above 2%; readings-ingested counter flat for 5 minutes.
- At month end (billing run) the release tool pauses automatically: no promotions during the peak.

## Things that make gates lie
- **Caches in front of the canary.** An edge or gateway cache keeps serving good responses from the old version while the new one is broken, then full rollout fails everywhere. Exclude canary-routed requests from shared caches, put the version in the cache key, or measure at the service rather than only at the edge.
- **Lost context.** A component that terminates a request and starts new downstream calls without copying trace headers splits the trace; the failing hop disappears. Forwarding identity headers is a separate decision: passing a caller's credentials downstream can let a service act as that caller (security hand-off, see 07).
- **Averages and fixed thresholds.** Means hide the slow tail users feel (gate on percentiles); fixed thresholds misfire at night and on holidays (scale by volume).
- **Two versions writing differently.** During coexistence, reconcile counts between old and new stores before declaring success.

## Is the release process itself healthy?
Per-release gates judge one change; the four key measures from the DORA research programme judge the delivery system over months: how often you deploy, how long a commit takes to reach production, what share of deployments cause a failure, and how fast service comes back after one. A platform change (new gateway, new mesh, new release tool) should move these in the right direction; if change failure rate rises after adopting a mesh, the adoption is not finished. Pair them with regular game days: inject a fault (slow dependency, failed zone, expired certificate) in a controlled window and check that gates, alerts and rollbacks behave as the plan says.

## Making signals non-optional
- A pipeline check (an architectural fitness function) fails the deployment when a service lacks health endpoints, OpenTelemetry export or trace propagation.
- Each gating metric has an alert, and each alert has an owner. A dashboard nobody watches is not a signal.
- A platform team can make the signals free: a starter template or paved path that wires in tracing, the flag SDK, release tooling and default policies, so the safe way is also the easiest way. Run it as a product for the teams that build features: keep it the thinnest platform that removes real cognitive load, measure adoption rather than mandating it, and plan how existing services get upgrades, not just new ones.
