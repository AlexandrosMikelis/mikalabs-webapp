# Step 8 — Running shared services fairly: platforms and noisy neighbours

Use for APPLICATION PLANE and NOISY NEIGHBOUR in `design`, and the services, platform and noisy-neighbour lenses in `review`. Service boundaries → **Theseus**; serverless depth → **Aeolus**; capacity planning and load testing → **Atlas**.

Grounding: the Kubernetes documentation page "Multi-tenancy" and the GKE guide to enterprise multi-tenancy, Kubernetes docs on ResourceQuota, LimitRange, NetworkPolicy, Pod Security Standards and PriorityClass, the Azure Architecture Center Noisy Neighbor antipattern, the Amazon Builders' Library articles on shuffle sharding and on fairness in multitenant systems, AWS Lambda concurrency docs, and MIKA's fairness ladder below.

## What a shared service must do on every request
Each service in a shared deployment needs the same five behaviours. Put them in shared code so service authors write domain logic, not plumbing.
1. **Read the verified customer context** from the token or a gateway-only header (`05`).
2. **Tag telemetry**: customer reference and plan on logs, trace spans and (carefully) metrics (`10`).
3. **Use the right placement**: resolve which store or stamp holds this customer's data (`07`).
4. **Enforce isolation**: obtain scoped credentials or set the row-security context (`06`).
5. **Emit usage**: billable events with an idempotency key (`09`).

| Delivery mechanism | Fits |
|---|---|
| Shared library or SDK (`context()`, `scopedDb()`, logger with customer fields, `meter()`) | one or two languages; owned and versioned by a platform team |
| Web framework middleware or filters | rejects requests with no customer context before handlers run |
| Sidecar proxy or service mesh | polyglot estates; mTLS, context injection and metrics without code changes |
| Function layers or extensions | serverless functions |
| Gateway plugins | token validation, host–claim checks and per-customer limits at the edge |

## Which services deserve dedicated capacity?
Dedicate a service (for everyone, or for one plan) only for: resource-heavy or long-running work (rendering, ML inference, bulk imports), a data set under its own regulatory rule, a plan that promises dedicated performance, or interference that fairness controls cannot contain. Every dedicated copy multiplies deployments and cost. Use per-customer metrics (request rate, latency, errors, CPU-seconds, bytes) to find the services that actually need it, rather than guessing at launch.

## Noisy neighbours
One customer's activity degrades service for others. Usual sources: request bursts, expensive queries, large imports, scheduled jobs that all start at 02:00, hot partitions, exhausted shared limits (connections, function concurrency, provider API quotas).

### The MIKA fairness ladder
Apply from the top; each rung is cheaper and less disruptive than the one below.

| Rung | Control | Examples |
|---|---|---|
| **F1 Admit** | Per-customer rate limits and quotas at the edge, by plan | token bucket per customer; `429 Too Many Requests` with `Retry-After`; payload and page-size caps |
| **F2 Queue fairly** | Asynchronous work scheduled across customers, not first-come-first-served | a queue or partition per customer or plan; round-robin or weighted fair scheduling; per-customer concurrency caps on workers |
| **F3 Bound the store** | Limits inside shared stores | statement timeouts; per-customer connection caps; write-sharding for heavy keys; per-customer throughput where the store supports it |
| **F4 Bulkhead** | Separate worker pools, node pools or clusters per plan | free-plan load cannot touch paying customers' capacity |
| **F5 Shuffle-shard** | Each customer is assigned a small random combination of workers out of a larger set, so two customers rarely share all of theirs | one customer's poison request takes out its own few workers, not everyone's (Amazon Builders' Library) |
| **F6 Move** | Relocate the heavy customer to its own shard, stamp or dedicated service (`04`), often with a plan change | the 60,000-meter co-op on its own shard |

Elastic autoscaling sits beside the ladder: necessary, never sufficient, because scaling lags bursts and turns one customer's spike into everyone's bill.

Without per-customer consumption metrics, every noisy-neighbour incident is guesswork. Measure first.

### Making limits humane
- Tell customers their limits and current usage in the product and through response headers.
- Warn at 80% of a quota; do not cut off a paying customer without notice.
- Offer burst allowances for known peaks (HarbourLine: bank-holiday weekends, the first sailing after a storm).
- Give a clear upgrade route. Silent throttling of a paying customer is a commercial problem as well as a technical one.

## Kubernetes as the shared runtime
The Kubernetes documentation separates **multi-team** tenancy (trusted internal teams) from **multi-customer** tenancy (SaaS customers, sometimes running untrusted code). Choose controls by that distinction.

| Pattern | Boundary | Fits | Watch |
|---|---|---|---|
| Shared namespaces per service | software isolation (`06`) | option A | horizontal autoscaling on aggregate load; fairness rungs F1–F3 |
| Namespace per customer | namespace + RBAC + NetworkPolicy + ResourceQuota + LimitRange | option B/D for hundreds to low thousands of customers per cluster | namespaces are a soft boundary; control-plane object counts grow |
| Hierarchical or grouped namespaces | policies inherited by a customer's namespaces (Hierarchical Namespace Controller, Capsule) | customers with several namespaces each | check each project's maintenance status before adopting |
| Virtual cluster per customer | each customer gets its own API server running inside a host cluster (vCluster and similar) | customers who need cluster-level APIs (CRDs, admission) without a real cluster | shared nodes unless combined with node isolation |
| Cluster per customer | full cluster | regulated or very large customers; untrusted code | fleet management (GitOps, cluster API) |

Controls for any shared cluster:
- NetworkPolicy deny-by-default per namespace, then allow-lists.
- Pod Security Standards at `restricted` via Pod Security Admission.
- A service account per customer bound to cloud roles that reach only that customer's resources (workload identity on EKS, GKE or AKS).
- Dedicated node pools with taints and tolerations for sensitive or enterprise customers; sandboxed runtimes (gVisor, Kata Containers) for customer-supplied code.
- PriorityClass by plan; requests and limits on every pod; quotas per namespace.
- Provisioning through templates (Helm, Kustomize) applied by GitOps tools (Argo CD, Flux) from a per-customer desired state.

## Serverless as the shared runtime (outline; depth → **Aeolus**)
- **Shared functions**: one deployment for all customers; context from the authoriser; scoped credentials per invocation (L3).
- **Dedicated function stacks**: deployed by the provisioning workflow for enterprise customers; routed by hostname or gateway stage.
- **Concurrency is a shared limit**: account and region concurrency is shared by every function. Use reserved concurrency per critical function, maximum concurrency on queue event sources, and per-customer usage plans and API keys at the gateway, so one customer cannot drain the pool.
- **Cold starts** matter more for dedicated stacks with little traffic; measure them per plan.
- Per-account quotas on functions, queues and roles limit how far dedicated stacks scale; check them against the three-year count.
- The control plane itself is a good serverless fit: low traffic, event-driven, workflow-heavy (`03`).

## Output of this step
```
APPLICATION PLANE: <service → option, runtime, context source, isolation rung>
SHARED CODE: <library / middleware / sidecar / layer>
NOISY NEIGHBOUR: <F1 limits by plan; F2 queues; F3 store limits; F4 bulkheads; F5 shuffle sharding if used; F6 move path>
PLATFORM: <Kubernetes or serverless controls in use>
```

## Review checks
- Do services share one context library or middleware, or does each reimplement it?
- Are per-customer limits enforced by plan at the edge and for asynchronous work?
- Is there a tested path to move a heavy customer?
- Kubernetes: namespace isolation backed by network policies, quotas, restricted pod security and scoped service accounts? Untrusted code sandboxed?
- Serverless: concurrency protected per function or plan? Scoped credentials per invocation?

## Worked mini-example — HarbourLine
Booking and manifest services shared on Kubernetes per regional stamp. Gateway limits: 20 requests/second on Harbour plan, 200 on Fleet, with burst credit on bank holidays (F1). Timetable imports go to a queue per plan and a weighted fair scheduler, so one operator's 40,000-row winter timetable cannot delay another's same-day change (F2). PostgreSQL statement timeout of 5 seconds for interactive roles (F3). Fleet operators' workers on a separate node pool (F4). The PDF manifest renderer runs as a dedicated deployment per Fleet operator in its own namespace with a scoped service account. Shared middleware reads context, tags telemetry and hands out scoped data clients.
