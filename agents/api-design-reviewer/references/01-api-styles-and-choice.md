# API styles and how to choose

## What counts as an API here
- An API is an **abstraction over an implementation**: consumers should be able to keep working while the producer refactors behind it. If the API mirrors tables, classes or internal service boundaries, the abstraction has failed.
- It is described by a **specification with types** (OpenAPI, protobuf, GraphQL SDL, AsyncAPI) from which consumers can generate code.
- It has **defined semantics**: behaviour under success, failure, retries and edge cases, not just shapes.
- This agent deals with **networked** APIs (calls cross a process and network boundary). Moving an in-process call out of process adds latency, partial failure, versioning and security concerns that did not exist before; review for them explicitly.
- **API-first**: design the contract from the consumer's needs before building, rather than exposing whatever the service happens to do.

## Traffic patterns and coupling
- **External callers**: browsers, mobile apps, partners, the internet. Untrusted, high latency, many consumers you don't control. Caller identity is checked where traffic enters, typically at a gateway.
- **Internal callers**: other services inside your estate. Partly trusted (still secure them), latency-sensitive because one external request often fans out into many internal calls; slow internal hops compound.
- **Who owns the consumer?** If the same or a closely coordinated team owns both sides, tighter coupling is acceptable and changes can be coordinated. If an external or loosely related team owns it, design for loose coupling and treat every breaking change as a managed migration.
- Coupling is not always bad: on a high-volume internal path, a tighter, more efficient contract can be the right trade.

## REST
- An architectural style (Fielding), usually over HTTP. Practical requirements: the producer exposes **resources**; requests are **stateless** (each request carries the context it needs); responses state their **cacheability**; a **uniform interface** (standard methods, media types, status codes); a **layered system** (consumers don't know what sits behind the interface).
- **Richardson Maturity Model** (a heuristic, not a standard):
  - Level 0 — one endpoint, HTTP used as a tunnel for procedure calls.
  - Level 1 — distinct resources with identity in the URI.
  - Level 2 — HTTP methods used with their proper semantics (safe GET, idempotent PUT/DELETE) and meaningful status codes. **The practical target** for most APIs.
  - Level 3 — hypermedia (HATEOAS): responses carry links and forms describing the next possible actions, so clients depend on relation names instead of URL layouts. Worth it when many independent, long-lived clients must survive server-side change, or when the valid actions depend on state; rarely worth it for tightly coupled service-to-service calls, where a full spec is known up front and link-following adds chattiness. See 10.
- Evolvability is the real goal behind the upper levels: can the producer change URLs, workflows and messages without forcing client releases? Judge a design on that question, not on its level number.
- Strengths: low barrier to entry, universal tooling, cache-friendly, a domain model consumers can understand. Default choice for public and partner APIs.
- Weaknesses: verbose text payloads, over/under-fetching, many round trips for composite views.

## RPC and gRPC
- RPC exposes **operations** (methods) rather than a resource model; a client stub makes the remote call look local.
- gRPC: protobuf schema, binary encoding, HTTP/2, streaming (client, server, bidirectional), code generation in most languages. Strict schema; consumers must understand the methods.
- State may be built up across an exchange depending on implementation, which helps performance but complicates routing and reliability.
- Best fit: high-volume, latency-sensitive **internal** calls between services under close control; large or frequent payloads; streaming. Not browser-native (needs gRPC-Web or a proxy). Measure before choosing on performance grounds.

## GraphQL
- A query layer over existing services and data: one schema, clients ask for exactly the fields they need, possibly spanning several back-end APIs.
- Best fit: client-driven aggregation (mobile apps with constrained bandwidth, rich UIs, reporting) over many interconnected sources; a single evolving schema can spare consumers from juggling versions of many APIs.
- Works best as a facade over well-designed APIs, not as a fix for poor ones.
- Watch query cost (depth/complexity limits), N+1 resolver fetches, authorisation per field, caching (POST-heavy, no HTTP caching by default), and error semantics (200 with an `errors` array).

## Asynchronous / event-driven
- Two families: client–server streaming (e.g., gRPC streams, WebSockets, SSE) and client–broker messaging (Kafka, AMQP, MQTT). Describe with **AsyncAPI**.
- Best fit: notifications, decoupled workflows, fan-out, long-running work, high-throughput data flows. Costs: eventual consistency, ordering, duplicates (consumers must be idempotent), harder debugging and testing.
- Decide event type (notification vs state transfer), keying/partitioning for ordering, schema registry and compatibility mode, dead-letter handling, at-least-once delivery as the default assumption.

## MIKA style picker
Start from REST (Level 2) with OpenAPI and move off it only when a row below clearly applies to this exchange.
| If this is true… | …consider | Check before switching |
|---|---|---|
| The caller does not need an answer to continue; many parties react; work takes minutes | Events or messages (AsyncAPI) | Who owns the schema? What happens to duplicates and out-of-order delivery? |
| Both ends are internal, owned by teams that ship together, and latency or payload size has been **measured** as a problem | gRPC with Protocol Buffers | Browser callers need gRPC-Web or a proxy; field-number discipline (see 05) |
| Many client screens each need a different slice of data from several services | GraphQL as an aggregation layer owned by the client team | Query-cost limits, caching, authorisation per field |
| Outside callers, unknown languages, long-lived integrations | Stay with REST; consider links (10) | Versioning and deprecation policy in place |
Ferry operator example: the public timetable stays REST; the port gate scanners call the boarding service over gRPC (measured: 200 scans per minute per gate, tight latency); vessel position updates go out as events. One estate, three styles, each chosen per exchange.

## Offering several styles for one service
- Possible (REST + gRPC + GraphQL), but costly: each representation has its own compatibility rules.
- **No golden specification**: generating protobuf from OpenAPI (or the reverse) is fragile. Example risk: a converter that assigns protobuf field numbers by alphabetical order renumbers every field when one is added, silently breaking the wire format. Proxies that map gRPC to REST (e.g., grpc-gateway) produce best-effort REST that tends to look like RPC.
- A resource model and a function-call model are different abstractions; forcing one into the other creates awkward APIs that are hard to evolve.
- Recommended default: design the internal RPC contract and the external REST contract **independently**, so each evolves on its own terms. Record the decision in an ADR.
