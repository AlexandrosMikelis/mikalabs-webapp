# Communication and contracts

Calls that used to be in-process become network calls. That changes three things at once: speed (milliseconds instead of nanoseconds, plus serialisation), failure (timeouts, partial failure, duplicates), and change (an interface used by another team can no longer be refactored in one commit). Choose interaction styles deliberately, per interaction, not one style for the whole estate.

Boundary note: API design detail (resource modelling, HTTP semantics) → Hermes (API Design Reviewer); gateways and service mesh → Daedalus (API Platform Architect); event streaming platforms, topic design and stream processing → Nereus (Event Streaming Architect).

## Does the caller wait, and what does it want?
Two questions classify any interaction:
1. **Does the caller wait?** Synchronous blocking (caller waits for the answer) vs asynchronous non-blocking (caller carries on).
2. **What is the intent?** Request–response (ask someone to do or tell something), event-driven (announce that something happened, without knowing who cares), or common data (share via a store).

| Style | Strengths | Weaknesses | Use when |
|---|---|---|---|
| **Synchronous request–response** (HTTP/REST, gRPC) | Simple to reason about; immediate answer; familiar tooling | Temporal coupling: the caller fails if the callee is down or slow; long chains multiply latency and failure probability | The caller genuinely needs the answer to continue, and the chain is short |
| **Asynchronous request–response** (request on a queue, reply on another) | Caller isn't blocked; callee can be offline briefly; load levelling | More moving parts; correlating replies; timeouts on missing replies | Work is slow or bursty; caller can continue and react to the reply later |
| **Event-driven** (publish facts; subscribers react) | Lowest coupling: producer doesn't know consumers; new consumers join without producer changes | Harder to see end-to-end flow; eventual consistency; consumers must handle duplicates and ordering | Other parts of the business need to know something happened; fan-out; choreographed sagas |
| **Common data** (shared file, bucket, data lake) | Handles very large volumes; works with legacy and batch tools | Latency; coupling to format; polling; hard to know who depends on it | Large batch transfers, analytics, interop with systems that only speak files |

Heuristics:
- **Keep synchronous chains short** (one or two hops for a user-facing request; general rule of thumb). Long chains are a distributed monolith symptom.
- Prefer events for "tell others what happened" and requests for "ask someone to do something specific".
- Mixing styles is normal: a synchronous call to accept an order, events to notify fulfilment and analytics.

### What goes in an event
- **Thin events** (just an identifier and type): consumers call back for detail. Small and safe, but they put load and temporal coupling back on the producer.
- **Fat events** (full relevant state): consumers have what they need; the event schema becomes a bigger contract and may carry sensitive data to everyone.
- Default to a middle ground: enough for most consumers to act (identifiers, key fields, the change), no internal fields, nothing sensitive unless needed. Name events as past-tense business facts (`ClaimRegistered`, not `ClaimTableUpdated`).

## Technology choices
- **REST over HTTP**: ubiquitous, works through any infrastructure, good for resource-oriented APIs and external consumers.
- **gRPC / RPC with schemas**: efficient, typed, code generation; good for internal high-volume calls; harder for browsers and external parties.
- **GraphQL**: lets clients shape responses; useful as an aggregation layer for UIs; watch query cost and caching.
- **Message brokers and logs**: queues for work distribution, topics/logs for events and replay. Selection detail → Nereus.
Criteria: backward compatibility support, explicit interface definitions, technology neutrality (don't force consumers onto your language), ease of use for consumers, and not leaking internals.

## Schemas and explicit contracts
Make every interface explicit: OpenAPI for HTTP, protobuf for gRPC, a schema (Avro, JSON Schema, protobuf) and AsyncAPI document for events. Explicit schemas let tools catch breaking changes before release.

Distinguish two kinds of breakage:
- **Structural**: a field is removed, renamed or changes type; a required field is added. Schema checks catch these.
- **Semantic**: the shape is the same but the meaning or behaviour changes (an amount now includes tax; a status has a new value). Only tests and communication catch these — use consumer-driven contract tests (see `07`).

## Avoiding breaking changes
- **Expand, don't change**: add new fields or endpoints; never repurpose existing ones.
- **Tolerant reader**: consumers read only the fields they need and ignore unknown ones; don't bind to the whole document.
- **Postel's robustness principle** in moderation: be strict in what you send, lenient in what you accept — but validate inputs for security.
- **Catch breaks early**: schema compatibility checks and contract tests in each pipeline.

## Managing breaking changes when unavoidable
| Approach | How | Cost |
|---|---|---|
| **Lockstep release** | Change producer and consumers together | Destroys independent deployability; avoid except within one team's services |
| **Run two versions of the service** | Old and new deployed side by side; route consumers by version | Bug fixes twice; data shared between versions gets tricky |
| **Serve old and new interface from one service** | One deployment exposes v1 and v2 endpoints or event versions, mapping old to new internally | Usually the best default: one codebase, gradual consumer migration |

Then retire the old version deliberately:
- Know who calls what: require consumers to identify themselves (client IDs, tracing metadata) and track usage per version.
- Agree a **social contract**: deprecation notice period, migration support, a date. Who must change, by when, with whose help.
- For stragglers, last-resort measures exist (slowing down or rejecting old calls after the date); use only with agreement from leadership.

## Code reuse between services
- Avoid shared libraries that carry **domain models** or business logic across services; they create deployment coupling (everyone must upgrade together) and leak one team's model into others.
- Shared libraries are fine for **technical** concerns (logging, tracing, auth helpers, client SDKs) if versioned, optional to upgrade at each team's pace, and owned.
- Duplication of small amounts of logic between services is often cheaper than coupling. "Don't repeat yourself" applies within a service more than across services.
- Generated client libraries from the schema beat hand-written shared clients.

## Service discovery
Services need to find each other's current instances.
- **DNS** with a load balancer or platform service names (e.g. container orchestrator services) is enough for most estates.
- **Dynamic registries** (Consul, Kubernetes service discovery, cloud-native registries) for fast-changing instance sets.
- Humans need discovery too: a **service catalogue** listing each service, owner, API docs, dependencies and runbooks (see `09`).

## Documentation
- Publish schemas and API docs automatically from the source (OpenAPI, AsyncAPI) so they never drift.
- Keep a short human description per service: purpose, owner, how to call, SLOs, contacts.

## Review prompts for this lens
- Which user requests involve synchronous chains longer than two hops?
- Which interfaces have no explicit schema?
- How are breaking changes detected before deployment?
- Do any shared libraries carry domain types?
- Do events describe business facts or table changes?
- Can a consumer survive the producer being down for ten minutes?

## Example (invented)
A food-delivery platform's checkout calls Restaurant, Menu, Pricing, Promotions, Payment and Courier synchronously — six hops per order, p99 2.5 s, and any outage fails checkout. Redesign: checkout calls Pricing (which already holds menu and promotion data via events) and Payment synchronously; it publishes `OrderPlaced`; Restaurant and Courier react asynchronously. Two synchronous hops remain, both essential.
