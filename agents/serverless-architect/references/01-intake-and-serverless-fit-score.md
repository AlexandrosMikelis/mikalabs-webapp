# Step 1 — Intake, system map and the MIKA serverless-fit score

Use this file first in every `design` and `review`. It turns a request into a workload card, a system map drawn as a small graph, and a fit score for each component. Later steps (`02`–`10`) read from these three artefacts; the review procedure (`11`) refers back to them.

Grounding: the CNCF Serverless Whitepaper (functions-as-a-service and backend-as-a-service as the two halves of serverless), the AWS guidance on serverless workloads, the Azure Architecture Center guidance on choosing a compute service, Google Cloud's guidance on choosing between Cloud Run and other compute, and MIKA's own scoring method below.

## What counts as serverless in this agent?
A component is serverless when the provider owns capacity, patching and scaling, and the bill follows use rather than reserved size. Three families qualify:

| Family | AWS | Azure | Google Cloud |
|---|---|---|---|
| **Functions** (event in, short unit of work out) | Lambda | Azure Functions (Flex Consumption, Consumption, Premium plans) | Cloud Run functions (formerly Cloud Functions) |
| **Serverless containers** (any container image, shrinking to zero or near zero when idle) | ECS tasks on managed capacity, Lambda container images | Azure Container Apps (apps and jobs) | Cloud Run services and jobs |
| **Managed back-end services** (no capacity to size, or a single dial) | API Gateway, managed queues and buses, workflow service, DynamoDB, S3 | API Management (consumption tier), Event Grid, Service Bus, Durable Functions, Cosmos DB serverless, Blob Storage | API Gateway, Eventarc, Pub/Sub, Workflows, Cloud Tasks, Firestore, Cloud Storage |

Products with a minimum capacity charge (some "serverless" databases keep a floor) are hybrids: say so in the cost shape. Knative brings the idle-to-nothing container model to any Kubernetes cluster and is the portable reference for the serverless-container family; Cloud Run implements the Knative Serving API.

## The workload card
Fill one card per request. Unknown fields become assumptions, never blockers.

| Field | What to capture | Why it matters later |
|---|---|---|
| Purpose and users | one line; who waits on the result | latency budget (`02`, `03`) |
| Key journeys | the two to five flows that earn money or carry duty of care | SLOs (`08`), severity (`11`) |
| Demand shape | mean and peak per second, peak-to-mean ratio, idle hours per day, batch windows | fit score, concurrency (`02`) |
| Unit of work | typical and worst-case duration, memory, payload size | compute choice, limits (`02`) |
| Latency need per journey | interactive (under 1 s), near real time (seconds), background (minutes or more) | sync vs async (`03`) |
| Data classes | personal, health, payment, credentials, public | access and protection (`07`) |
| State and connections | sessions, long-lived sockets, relational connections, large in-memory sets | fit score, entry paths |
| Team | size, on-call, IaC tool, pipeline maturity | fit score, delivery (`10`) |
| Constraints | residency, compliance (flag only), budget, existing contracts, portability | fit gates, equivalents |

## Drawing the system map as a graph
Write the system as nodes and edges before judging anything. This is the same shape MIKA uses for agentic knowledge graphs, so the map can be stored and queried later.

- **Node types**: `Entry` (API, schedule, upload, partner callback), `Compute` (function, container, workflow), `Channel` (queue, topic, bus, stream), `Store` (table, bucket, database, cache), `External` (partner API, payment provider).
- **Edge types**: `WAITS_ON` (caller waits), `HANDS_OFF` (caller hands off), `READS`, `WRITES`, `TRIGGERS` (store change starts compute).
- **Edge properties** to fill as you go: delivery semantics, retry policy, terminal destination, timeout, owner.

Text form: `Entry:BookingAPI -WAITS_ON-> Compute:quote-fn -READS-> Store:fares-table`. Every `HANDS_OFF` and `TRIGGERS` edge later gets a failure-path card (`06`). Every chain of two or more `WAITS_ON` edges between compute nodes is a review signal (`03`).

## The MIKA serverless-fit score
Score each component (not the whole system) on seven factors, 0 to 3, where 3 favours functions. Use the descriptions as anchors and 1 or 2 for in-between cases.

| Factor | 0 | 3 |
|---|---|---|
| **D — Demand shape** | flat and high around the clock, utilisation above ~60% | idle most of the day, bursts, peak-to-mean above 10 |
| **U — Unit-of-work length** | hours, not splittable | under a few seconds, independent |
| **L — Latency tolerance** | strict single-digit-millisecond tail on every call | seconds acceptable, or the caller does not wait |
| **S — State and connections** | long-lived stateful sessions, thousands of persistent sockets, large in-memory working set | stateless, state in managed stores |
| **H — Runtime and hardware** | special kernels, licensed hosts, large GPUs | standard managed runtime or container |
| **T — Team operating capacity** | strong platform team that already runs clusters well | small team, little appetite for patching and capacity planning |
| **P — Portability pressure** | contract or regulation demands running unchanged on another provider or on-premises | no portability duty, or portability met by standards (containers, standard event envelopes, OpenTelemetry) |

**Fit = D + U + L + S + H + T + P (0–21).**

| Score | FIT label | Default compute |
|---|---|---|
| 17–21 | Strong | functions plus managed building blocks; direct integrations where no logic is needed |
| 10–16 | Partial | serverless containers (Cloud Run, Container Apps, ECS) or functions with pre-warmed capacity; keep queues, buses and workflows serverless around them |
| 0–9 | Poor | containers on a cluster, VMs or a batch service on committed capacity; serverless only at the edges (queues, schedules, events) |

### Gates applied before the score
1. Unit of work routinely exceeds the function ceiling (15 minutes on Lambda, 10 minutes on Azure Functions Consumption; verify) and cannot be split into steps → not functions. Use a workflow with steps, a serverless container job, or batch.
2. Needs GPUs → not functions. Cloud Run and Container Apps offer serverless GPUs (verify Regions and limits); otherwise instances.
3. Sustained utilisation above ~60% for most hours with a flat curve → run the cost comparison in `09` before choosing functions; record the result.
4. Thousands of concurrent long-lived connections → use a managed connection service (API Gateway WebSocket APIs, Azure Web PubSub, Firebase/Firestore listeners) or containers, not functions holding sockets.
5. A hard residency or dedicated-host clause → check the managed service is available in that Region and tenancy before scoring.

A gate overrides the score. Write it as `FIT: Partial (score 14; gate 1 on the nightly fare rebuild)`.

## Worked mini-examples (house domains)
**Regional ferry operator, booking API.** Peaks at 07:00 and 17:00 and when weather cancels sailings; near idle overnight. D3 U3 L2 S3 H3 T3 P2 = **19, Strong**. Functions behind an HTTP API, events for tickets and manifests.

**Regional ferry operator, vessel telemetry.** 40 vessels send position every 2 s, every hour of the day. D0 U3 L2 S2 H3 T2 P2 = **14, Partial**. A stream with a container consumer or batched function consumer; store aggregates, not every point, in the hot store.

**Veterinary clinic network, radiograph conversion.** 150 clinics upload during opening hours; each conversion takes 20–90 s and 3 GB memory. D2 U2 L3 S3 H3 T3 P2 = **18, Strong**, but check gate 1 for the 4-minute worst case: still under 15 minutes, so functions with high memory are fine; move to a container job if studies grow.

**Community energy co-op, half-hourly settlement.** A flat load of meter reads around the clock plus a heavy month-end run of 6 hours. Month-end run: gate 1 applies → container job, or a workflow fanning out batched child runs. Ingest path: D1 U3 L3 S3 H3 T3 P1 = **17, Strong**.

## Moving an existing system step by step
- Put a routing layer (API gateway or load balancer) in front of the legacy system and move one route or one event consumer at a time: the strangler fig approach Martin Fowler named.
- Emit events from the legacy database with change data capture rather than adding a second write in old code.
- Give each moved slice its own store; keep a reconciliation report until the old path is retired.
- Set a retirement date per slice. A slice with no date tends to run twice forever, and both copies bill.

## Switching cost, stated honestly
Lock-in is a cost to estimate, not a reason to stop. Name the parts that would be expensive to move (workflow definitions, event rules, permission policies, provider-specific triggers) and the parts that are cheap (container images, business logic modules, events in a standard envelope, OpenTelemetry instrumentation, SQL schemas). Keep domain logic out of handler glue so the expensive part stays thin.

## How this feeds the output
- `CONTEXT` comes from the workload card; `FIT` carries label, score and any gate per component.
- Components scoring Partial or Poor are named in `FIT` with the compute they should use instead.
- The system map's edges drive `EVENTS`, `RELIABILITY` and the review lenses.
