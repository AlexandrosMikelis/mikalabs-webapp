# Step 8 — Check the service tier and how traffic reaches it

The request-serving tier is usually the easiest to grow, provided it keeps nothing it cannot lose. Atlas checks it after the store layer because adding service instances mostly moves load downwards; the question is whether the tiers below can take it.

## Can any instance be killed right now without anyone noticing?
An instance is stateless when any instance can serve any request, because nothing needed between requests lives only in its memory or on its local disk. State still exists; it sits in a shared store or travels with the request (a signed token).

What this buys: instances can be added, removed, replaced and crashed at any moment; any request can go to any instance; a crash costs only the requests in flight.

### Hidden state Atlas looks for
| Hidden state | Why it hurts at scale | Usual fix |
|---|---|---|
| Sessions or baskets in process memory | Lost on scale-in or crash; forces sticky routing | Shared session store or signed client token |
| Uploads written to local disk first | Next request may land elsewhere; disk fills | Direct upload to object storage via pre-signed URL (Valet Key pattern) |
| In-process caches users expect to change | Instances disagree | Shared cache, or only read-only reference data with short TTL |
| Scheduled jobs on every instance | Runs N times; contention | One scheduler, or a leader (`10`) |
| WebSocket subscriptions held in one process | Messages miss users connected elsewhere | Shared pub/sub fan-out layer |
| Rate-limit tallies per instance | Effective limit grows with every instance added | Central counter, or per-instance limit = total ÷ instances |

## Does each request do a bounded amount of work?
- **Coarse, purposeful APIs**: one call returning what a screen needs beats ten chatty ones. Paginate and allow field selection.
- **Caps everywhere**: page size, query complexity, payload size. One unbounded request is how a single client takes down a tier.
- **Idempotent writes**: accept a client-generated request key on creates and payments so retries are safe.
- **Slow work later**: acknowledge and hand off to a queue (`06`).
- **Separate worker limits per dependency** so one slow dependency cannot take every worker (`09`).

## How much can one instance carry?
- **Thread-per-request** runtimes are capped by pool size. Little's law: at 500 rps and 200 ms, about 100 workers are busy; add headroom for latency spikes.
- **Event-loop** runtimes carry many connections cheaply; any blocking call freezes the loop.
- **Memory**: concurrency × memory per request must fit, with room for garbage collection.
- **Database connections**: instances × pool size must stay under the database's connection limit. Atlas sees this ceiling right after autoscaling is switched on more often than almost any other: the service tier grows and the database starts refusing connections. A connection pooler or proxy, smaller per-instance connection limits and an autoscaler maximum fix it.

## What must be true before adding identical instances helps?
Statelessness, configuration from the environment, quick start-up, a **clean drain** on shutdown (stop taking new work, finish what is in flight, then exit — Kubernetes sends SIGTERM and waits for a grace period), and a shared store that can absorb the combined load. Adding instances moves the bottleneck down the stack, so Atlas always checks the next tier.

## How is traffic spread across instances?
### At which layer?
- **DNS / global routing**: sends users to a region or edge; coarse; changes slowly because resolvers cache answers.
- **Transport (L4)**: balances transport-level connections (TCP or UDP); fast; blind to individual requests on a long-lived connection.
- **Application (L7)**: understands HTTP and gRPC; routes by path, header or customer; terminates TLS; balances each request even on multiplexed connections.
- **Client-side**: the caller chooses from a registry; no central hop; needs a capable client library or a local proxy.

### Which policy?
| Policy | Behaviour | Fits |
|---|---|---|
| Round robin | Next in turn | Uniform requests, identical instances |
| Weighted | Proportional to weight | Mixed sizes, canary releases |
| Least outstanding requests | Fewest in flight | Uneven request cost; a strong L7 default |
| Two random choices (Mitzenmacher) | Sample two, pick the less loaded | Large fleets, near-optimal with little coordination |
| Key hash (consistent hashing) | Same key → same instance | Cache locality, per-key state (`04`, `10`) |
| Latency-weighted (EWMA) | Prefer recently faster instances | Noisy or mixed environments |

HTTP/2 and gRPC keep one long-lived connection with many requests on it. An L4 balancer then pins all of them to one backend. Use L7 or client-side balancing for these protocols.

## How does the balancer know an instance is fit?
- **Liveness**: is the process alive? Failure restarts it. Keep it cheap and independent of dependencies, or one database blip restarts the whole fleet.
- **Readiness**: should it get traffic now? Fail it during start-up (cache pre-loading, loading data), during drain, and when overloaded. Kubernetes maps these to liveness, readiness and startup probes; the startup probe shields slow starters from premature restarts.
- **Outlier ejection**: remove instances that return errors or respond slowly in real traffic.
- Avoid checks that all fail together because of a shared dependency; that removes every instance at once.

## Does the fleet grow before users feel the load?
- Scale on a **leading** signal: request rate, in-progress requests or queue depth beat CPU for I/O-bound services.
- **Start-up time sets the buffer**. If a new instance needs 90 seconds to be ready, the scaler must act before saturation. Keep utilisation targets around 50–70% and add scheduled scaling for known peaks (the ferry release at 09:00, the clinics opening at 08:00).
- **Minimums** survive a zone loss; **maximums** cap cost and protect downstream tiers.
- **Stabilisation windows** stop flapping.
- **Scale to zero** saves money and adds cold starts; fine for internal tools, rarely for latency-critical paths.
- Kubernetes: the Horizontal Pod Autoscaler on CPU, memory or custom metrics; KEDA on queue length or other external signals; cluster autoscaling adds nodes when pods cannot be placed, which takes minutes, not seconds.

## Why is pinning a client to one instance a warning sign?
Routing a client back to the same instance hides in-memory state rather than removing it. Load becomes uneven, scale-in and crashes lose sessions, and new instances stay idle until new sessions arrive. Accept stickiness only as a locality optimisation over state that can be rebuilt, never as the only copy of anything important.

## What can the edge absorb?
- **TLS termination** at the edge offloads crypto; re-encrypt inside where policy requires.
- **Rate limits and admission control** stop abusive or runaway clients; answer 429 with a retry hint. Shared limits need a shared counter or an approximation.
- **Admission queue for flash events**: for the ferry release, a waiting room that admits customers at the rate the inventory tier can sustain (from `01`, roughly 150 holds/s on the hottest sailing) turns an overload into a fair queue. It is cheaper than scaling the store layer for ten minutes a year.
- **Compression and HTTP-level caching** (`07`); **CDN** for public content.
- Gateway and service-mesh design is out of scope: hand off to Daedalus.

## Questions Atlas asks at this step
- Can any instance be killed now without user-visible loss?
- How was per-instance capacity measured?
- What does the autoscaler watch, how fast is a new instance ready, and what caps it?
- What happens to the database when this tier doubles?
- Does the balancing policy suit long-lived connections and uneven request cost?
