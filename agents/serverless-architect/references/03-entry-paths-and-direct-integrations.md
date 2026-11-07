# Step 3 — How requests enter, and when no code is needed

Use for the `API LAYER` field in `design` and the entry-path lens in `review`. Covers the front door, whether the caller waits, wiring managed building blocks together without code, and how the edge protects what is behind it.

Grounding: RFC 9110 (HTTP semantics, including `202 Accepted` and `429`), RFC 9457 (problem details for HTTP APIs), the API gateway and HTTP trigger documentation of AWS, Azure and Google Cloud, the public pattern catalogues of AWS Prescriptive Guidance and Serverless Land, and MIKA's synchronous-reach rule below.

## Which front door?
| Need | AWS | Azure | Google Cloud |
|---|---|---|---|
| Low-cost HTTP API with token checks | API Gateway HTTP API | API Management consumption tier, or an HTTP-triggered function with built-in sign-in | API Gateway, or Cloud Run behind Identity-Aware Proxy |
| Request schemas, API keys and plans, private APIs, firewall | API Gateway REST API | API Management policies | Apigee or API Gateway |
| One function on its own HTTPS address | Lambda function URL | HTTP-triggered function | Cloud Run service URL with access control |
| GraphQL with subscriptions | AppSync | API Management GraphQL | Apigee, or a container |
| Many small real-time pushes to browsers and apps | API Gateway WebSocket APIs | Web PubSub | Firestore listeners, or Cloud Run with WebSockets |
| Container service behind a load balancer | Application Load Balancer | Container Apps ingress | Cloud Run |

Put a CDN and a web application firewall in front of anything public. Throttle per client at the edge, not only per account. Cache at the edge whatever tolerates it: the ferry timetable answers from the CDN for 60 seconds, which removes most of the request load from the functions during the 07:00 rush and keeps latencies flat.

## Must the caller wait?
For each journey on the system map, decide whether the caller needs the outcome now or only an acknowledgement.

**MIKA synchronous-reach rule.** A request that the caller waits on may reach at most **one compute step and one store** before it answers. Anything further (a second function, a partner API, a slow calculation, a fan-out) goes behind a queue, a bus or a workflow. An exception is allowed when the extra hop has a measured p99 that still fits the latency budget and a timeout shorter than the caller's; write the exception into the design.

Why it holds: each extra waiting hop multiplies the chance of failure, stacks timeouts, and with one-request-per-environment functions you pay for two while one sits idle waiting.

### The accept-then-process shape
1. The API checks the request (schema, sign-in, an `Idempotency-Key` header) and hands it to a queue, a bus or a workflow start.
2. It answers `202 Accepted` with a status URL or operation id.
3. Workers do the job asynchronously and safely repeatable (`06`).
4. The client learns the outcome by polling the status URL, through a WebSocket or server-sent events, or by a push notice.

House example: the ferry operator's group booking (40 passengers, vehicle-deck allocation, a partner rail connection) is acknowledged in under 300 ms and confirmed within a minute by push notice. A single-seat booking with no partner call stays synchronous under the reach rule.

Synchronous errors share one body format; RFC 9457 problem details (`type`, `title`, `status`, `detail`, `instance`) is a sound default.

## When can two managed building blocks talk without code?
A function whose only job is to carry data from one managed service to another adds start-up delay, code, spend, and a permission set to maintain. Prefer a direct service integration (configuration that connects the two) when there is no business logic:

| Path | AWS | Azure | Google Cloud |
|---|---|---|---|
| API straight to a queue, bus, table or workflow | API Gateway integrations (REST mapping templates; first-class HTTP API integrations for several services) | API Management policies that send to Service Bus | Apigee policies; otherwise a thin Cloud Run service is the usual bridge |
| Queue, ordered log or table change to a bus or workflow, with filtering and light reshaping | EventBridge Pipes | Event Grid subscriptions, Logic Apps | Eventarc triggers, Pub/Sub push |
| Bus to a partner's HTTPS endpoint with auth and a rate limit | HTTP targets on the bus | Event Grid HTTP delivery, Logic Apps connectors | Workflows HTTP calls, Cloud Tasks |
| Workflow step calling a cloud API | workflow service API integrations | Logic Apps connectors, Durable Functions activities | Workflows connectors |
| One-off or recurring schedule | Scheduler service | Logic Apps recurrence, timer triggers | Cloud Scheduler |

**Keep a function instead** when the transformation is non-trivial and needs tests; when error handling must do more than the integration allows; when a mapping template is turning into a program nobody can read; or when the team cannot test the integration and the path is high-risk. Untestable configuration is not cheaper than testable code.

## How does the edge protect the rest?
- **Sign-in at the edge** (token check, platform identity), **permission per record inside the service**. A gateway can confirm who is calling; only the service knows whether this clinic may open this pet's record. Deep API security goes to **Argus**.
- **Schema validation at the edge** so malformed requests never wake compute.
- **Per-client throttling** with plans or rate policies; answer `429` with `Retry-After`.
- **Idempotency keys on requests that create things** (bookings, payments, appointments): the client sends a key, the service stores the first outcome and replays it for repeats (`06`).
- **Uploads go straight to object storage** with short-lived signed URLs; the API only issues the URL and records the intent.

## Worked mini-example
Veterinary clinic network, the opt-out link in an appointment reminder text:
- Before: CDN → API → `optout` function → `update` function → table → `notify` function → messaging service. Three functions chained while the caller waits; p99 2.1 s; up to two cold environments on one click.
- After: CDN → HTTP API → `optout` function (checks the signed token, conditional write to the table, answers 200) → table change feed → pipe → bus → `notify` function. One compute step and one store on the waiting path; the confirmation text goes later.

## Signals for the review
- A function waits on another function behind an API → High on a key journey, Medium elsewhere.
- The API holds a connection open for long work instead of accept-then-process → High when it meets the gateway timeout.
- A pass-through function that only forwards to a queue, bus or table → Low to Medium (spend, latency, attack surface).
- A public endpoint without throttling or a firewall → High when it fronts a database or a paid partner API.
- Record-level permission left to the gateway → High for personal or health data; hand to **Argus**.
