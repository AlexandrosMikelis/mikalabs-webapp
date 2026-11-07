# Step 2 — Choosing the compute shape and its settings

Use for the `COMPUTE` and `QUOTAS TO CHECK` fields in `design`, and the compute-and-latency and limits lenses in `review`.

Grounding: the function and container hosting documentation of AWS (Lambda, ECS), Azure (Functions hosting plans, Container Apps scale rules built on KEDA) and Google Cloud (Cloud Run instance concurrency, minimum instances, billing modes), Little's law from queueing theory, open-source memory-sweep tools, and MIKA's concurrency sheet below.

**Every number in this file is a reading taken in late 2026.** Platform limits, defaults and prices change, differ by Region and account, and many can be raised on request. Always tell the caller to verify current values on the provider's limits pages.

## Which compute shape for which component?
Start from the fit label in `01`, then pick the shape.

| Need | First choice | Why |
|---|---|---|
| Short handler for an event, a queue message or an API call | function | per-use billing, native triggers, no image to maintain |
| Moves data between two managed building blocks with no logic | no compute: direct integration (`03`) | nothing to patch, scale or pay per GB-second |
| HTTP service with many concurrent requests per instance, existing framework, or a container image already built | serverless container (Cloud Run, Container Apps, ECS tasks behind a load balancer) | one instance serves many requests; no function packaging |
| Run-to-completion task from minutes to hours | container job (Cloud Run jobs, Container Apps jobs, ECS task started by a workflow) | no function time ceiling |
| Many steps with waits, retries and branching | workflow engine (`05`) | state and retries move out of code |
| Steady, high, flat load | containers on committed capacity, then compare cost (`09`) | per-request billing loses at high utilisation |

**Concurrency model is the biggest difference.** A Lambda execution environment serves one request at a time; an Azure Functions instance and a Cloud Run instance serve many at once (Cloud Run defaults to 80 concurrent requests per instance, configurable up to 1,000; verify). Code that is not safe for concurrent requests needs concurrency set to 1 on the many-per-instance platforms, which raises cost.

AWS added two variants in late 2025 that change this picture; check their status and Region coverage before relying on them: Lambda Managed Instances (functions on EC2 capacity you choose, many requests per environment) and Lambda durable functions (checkpointed, long-lived function code). Treat both as options to evaluate, not defaults.

## What happens on a cold start, and when does it matter?
A new execution environment downloads code, starts the runtime and runs initialisation code outside the handler. Warm requests reuse it. Since August 2025 AWS bills the initialisation phase for on-demand functions packaged as ZIP as well as container images (verify), so heavy initialisation now costs money as well as latency.

Cold starts matter on interactive synchronous journeys and hardly at all on queue consumers. Work down this list, stopping when the latency SLO is met:
1. **Move the work off the request path** (accept, enqueue, return 202; see `03`).
2. **Shrink the package**: bundle and tree-shake, import only the client libraries used, drop dev dependencies.
3. **Initialise once, outside the handler**: service clients, configuration, connection pools. Lazy-load what only rare paths need.
4. **Pick the runtime with the cost in mind**: lean interpreted runtimes and compiled native binaries start quickly; for Java, Python and .NET on Lambda use SnapStart (verify runtime coverage); for JVM elsewhere consider ahead-of-time compilation.
5. **Keep capacity warm where the SLO needs it**: provisioned concurrency (Lambda), always-ready instances (Azure Functions Flex Consumption and Premium), minimum instances (Cloud Run, Container Apps). It bills while idle; schedule it to the busy hours and add it to the cost shape.
6. Do not rely on scheduled "ping" invocations; they warm one environment and do nothing for a burst.

## Memory, CPU and processor architecture
- On Lambda, CPU and network bandwidth scale with configured memory (from 128 MB to 10,240 MB; around 1,769 MB equals one full vCPU). A CPU-bound function often costs the same or less at higher memory because it finishes sooner. Measure with a power-tuning run rather than guessing.
- Arm (Graviton) functions are priced about 20% lower per GB-second than x86 on Lambda and often perform as well or better; check native dependencies.
- On Cloud Run and Container Apps, CPU and memory are set separately; choose whether CPU is billed only during requests or for the instance's whole life (Cloud Run "request-based" vs "instance-based" billing). Background work after the response needs the latter.

## The MIKA concurrency sheet
Fill one row per compute node on a synchronous or high-volume path.

| Column | Formula or source |
|---|---|
| Peak arrivals per second (λ) | workload card |
| Mean duration in seconds (W) | measured, or an estimate stated as an assumption |
| Concurrency needed (Little's law) | **C = λ × W**; for many-per-instance platforms, instances ≈ C ÷ per-instance concurrency |
| Headroom | × 1.5 for bursts unless measured |
| Account or plan pool | default regional pool (Lambda: 1,000 by default, lower for some new accounts; raisable) |
| Scale-out rate | Lambda: each function can add up to 1,000 environments every 10 seconds (verify); Azure and Google scale by instance with their own rates |
| Downstream ceiling | connections, partner rate limits, table partition limits |
| Protection | reserved concurrency, queue maximum concurrency, instance maximums |

Example: ferry booking quote function, λ = 120 per second at the 07:00 peak, W = 0.35 s → C = 42, with headroom 63. Well inside the default pool, but the fares database allows 100 connections: put RDS Proxy (or a data API) in front, or cap the function.

## Which timeouts need to line up?
Each layer's timeout must be shorter than the layer that waits for it, with room for one retry:
- Client > API layer > function > downstream call. Amazon API Gateway REST APIs have a 29-second default integration timeout, raisable for Regional and private REST APIs since 2024 at the cost of throttle quota; HTTP APIs cap at 30 seconds. Azure Functions HTTP triggers return after about 230 seconds because of the front-end load balancer idle timeout, whatever the function timeout. A function that outlives its caller keeps running and billing after the client has given up.
- Queue visibility timeout greater than the consumer function timeout. AWS advises at least six times the function timeout when Lambda polls SQS, so retries after throttling do not cause duplicate processing.
- Workflow task timeouts and heartbeats explicit, never left to the 1-year Standard maximum (`05`).

## Indicative platform limits (late-2026 reading; verify before use)
| Item | AWS Lambda | Azure Functions | Cloud Run |
|---|---|---|---|
| Max duration per invocation | 15 min | Consumption 10 min; Flex Consumption and Premium configurable well beyond (verify) | services: request timeout up to 60 min; jobs: long task timeouts (verify) |
| Memory | 128 MB–10,240 MB | by plan and instance size | up to 32 GiB per instance (verify) |
| Temporary disk | /tmp 512 MB default, up to 10,240 MB | by plan | in-memory filesystem counts against memory |
| Package | 50 MB zipped direct upload; 250 MB unzipped with layers; container image 10 GB | by plan | container image |
| Sync request/response payload | 6 MB each way (larger with response streaming) | HTTP limits by plan | 32 MiB request for HTTP/1 (verify) |
| Async invocation payload | raised from 256 KB to 1 MB in 2025 (verify) | n/a | n/a |
| Environment variables | 4 KB total | app settings | per-container limits |
| Layers | 5 per function | n/a | n/a |

Related managed-platform limits that designs often lean on (AWS, verify): API Gateway payload 10 MB and default account throttle of 10,000 requests per second with a 5,000 burst per Region; SQS message size raised to 1 MiB in 2025, retention up to 14 days, visibility timeout up to 12 hours; workflow state payload 256 KB and 25,000 history events per long-running execution; DynamoDB item 400 KB and per-partition throughput limits that apply even in on-demand mode; Kinesis about 1 MB/s or 1,000 records/s in per shard.

Never transfer one provider's numbers to another. Ask for limit increases before launches and seasonal peaks, and alert on limit usage where the provider publishes it.

## How do large payloads travel?
- Events carry identifiers and the facts consumers need, not documents.
- Large bodies go to object storage and the event carries the key: the claim-check pattern. Decide who may read the object (scoped role, pre-signed URL with short expiry).
- Uploads from clients go straight to object storage with a pre-signed URL; the function never touches the bytes.

## Where does each service keep its data?
Each service owns its stores; other services reach the data through its API or events, never by reading its tables. Pick by access pattern, then check the store's scaling unit against the concurrency sheet.

| Access pattern | AWS | Azure | Google Cloud | Watch |
|---|---|---|---|---|
| Key lookups and known queries at any scale | DynamoDB on-demand | Cosmos DB (serverless or autoscale) | Firestore | design keys for the queries; hot partitions |
| Relational queries, joins, existing SQL | Aurora Serverless v2 (can pause down to zero capacity since late 2024; verify), RDS with RDS Proxy or the Data API | Azure SQL Database serverless | Cloud SQL (sized instances) or AlloyDB | connection limits under function scale-out; resume latency after pause |
| Files, images, exports | S3 | Blob Storage | Cloud Storage | lifecycle rules; trigger loops (`06`) |
| Hot reads, sessions, rate counters | ElastiCache Serverless, DynamoDB with TTL | Azure Managed Redis | Memorystore | minimum charges on some serverless caches |
| Search and analytics | managed search collections, SQL queries over S3 | AI Search, Synapse serverless SQL | BigQuery | minimum capacity on some "serverless" search products |

House example: the clinic network keeps appointments in a key-value table keyed by `clinicId` and date, imaging studies in object storage with metadata in the same table, and monthly reporting in a query engine over exported data, so reports never load the appointment table.

## Will the data tier keep up when compute scales out?
Compute that scales in seconds moves the bottleneck to whatever it talks to. Check each store on the concurrency sheet:
- **Partition keys spread the load.** Throughput limits apply per partition even on on-demand tables. A key such as `sailingDate` concentrates the 07:00 rush on one partition; `sailingId` or `bookingRef` spreads it. Add a suffix (write sharding) for keys that are hot by nature, such as a co-op's single settlement period.
- **Connections are a scarce resource.** A relational database that accepts a few hundred connections cannot serve a thousand concurrent function environments each holding one. Use a connection pooler or proxy, an HTTP data API, or a cap on consumer concurrency; containers that serve many requests per instance share a pool naturally.
- **Read replicas and distributed caching take read load**, at the price of stale reads. State the acceptable staleness per read (timetable: minutes; seat availability at checkout: none) and cache only where it is acceptable. Functions and scale-out containers have no session affinity, so session state lives in a shared store or cache, never in instance memory.
- **Consistency is a choice per read.** Key-value stores default to eventually consistent reads; ask for strong consistency, or read from the primary, where a stale value changes the outcome. Replicated tables across Regions usually resolve conflicting writes by last writer wins; if two Regions may update the same booking, design the conflict resolution explicitly.
- **Back-pressure belongs before the store.** A queue with a capped consumer turns a burst into a steady drain at the rate the store can take; the backlog is visible and alerted, instead of throttling errors scattered across callers.
- **Load-test the data tier, not only the functions.** The functions rarely fail first.

## Signals for the review
Rate higher when: an interactive journey runs a heavy runtime cold with no mitigation; a function waits on another function; timeouts are inverted; a component needs more than half the regional pool at peak with no plan to raise the limit; a hot partition key or a connection-limited database sits behind a component that scales out; a downstream system has no protection from scale-out; payloads sit near a limit without claim-check. Rate lower for background paths that tolerate seconds of delay.
