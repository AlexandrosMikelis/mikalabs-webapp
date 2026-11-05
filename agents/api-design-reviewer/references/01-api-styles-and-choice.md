# API styles and how to choose

## What counts as an API here
- An API is an **abstraction over an implementation**: consumers should be able to keep working while the producer refactors behind it. If the API mirrors tables, classes or internal service boundaries, the abstraction has failed.
- It is described by a **specification with types** (OpenAPI, protobuf, GraphQL SDL, AsyncAPI) from which consumers can generate code.
- It has **defined semantics**: behaviour under success, failure, retries and edge cases, not just shapes.
- This agent deals with **out-of-process** APIs (calls cross a network). Moving an in-process call out of process adds latency, partial failure, versioning and security concerns that did not exist before; review for them explicitly.
- **API-first**: design the contract from the consumer's needs before building, rather than exposing whatever the service happens to do.

## Traffic patterns and coupling
- **North–south** (ingress): traffic from outside the producer's environment (browsers, mobile apps, partners, the internet). Untrusted, high latency, many consumers you don't control. Needs identity checks at the edge, typically an API gateway.
- **East–west** (service-to-service): inside your estate. Partly trusted (still secure it), latency-sensitive because one external request often fans out into many internal calls; slow internal hops compound.
- **Who owns the consumer?** If the same or a closely coordinated team owns both sides, tighter coupling is acceptable and changes can be coordinated. If an external or loosely related team owns it, design for loose coupling and treat every breaking change as a managed migration.
- Coupling is not always bad: on a high-volume internal path, a tighter, more efficient contract can be the right trade.

## REST
- An architectural style (Fielding), usually over HTTP. Practical requirements: the producer exposes **resources**; requests are **stateless** (each request carries the context it needs); responses state their **cacheability**; a **uniform interface** (standard methods, media types, status codes); a **layered system** (consumers don't know what sits behind the interface).
- **Richardson Maturity Model** (a heuristic, not a standard):
  - Level 0 — one endpoint, HTTP used as a tunnel for procedure calls.
  - Level 1 — distinct resources with identity in the URI.
  - Level 2 — HTTP methods used with their proper semantics (safe GET, idempotent PUT/DELETE) and meaningful status codes. **The practical target** for most APIs.
  - Level 3 — hypermedia (HATEOAS): responses carry links to the next possible actions. Useful for flexible UIs; rarely worth it for service-to-service calls, where a full spec is known up front and link-following adds chattiness.
- Strengths: low barrier to entry, universal tooling, cache-friendly, a domain model consumers can understand. Default choice for public and partner APIs.
- Weaknesses: verbose text payloads, over/under-fetching, many round trips for composite views.

## RPC and gRPC
- RPC exposes **operations** (methods) rather than a resource model; a client stub makes the remote call look local.
- gRPC: protobuf schema, binary encoding, HTTP/2, streaming (client, server, bidirectional), code generation in most languages. Strict schema; consumers must understand the methods.
- State may be built up across an exchange depending on implementation, which helps performance but complicates routing and reliability.
- Best fit: high-volume, latency-sensitive **east–west** calls between services under close control; large or frequent payloads; streaming. Not browser-native (needs gRPC-Web or a proxy). Measure before choosing on performance grounds.

## GraphQL
- A query layer over existing services and data: one schema, clients ask for exactly the fields they need, possibly spanning several back-end APIs.
- Best fit: client-driven aggregation (mobile apps with constrained bandwidth, rich UIs, reporting) over many interconnected sources; a single evolving schema can spare consumers from juggling versions of many APIs.
- Works best as a facade over well-designed APIs, not as a fix for poor ones.
- General knowledge: watch query cost (depth/complexity limits), N+1 resolver fetches, authorisation per field, caching (POST-heavy, no HTTP caching by default), and error semantics (200 with an `errors` array).

## Asynchronous / event-driven
- Two families: client–server streaming (e.g., gRPC streams, WebSockets, SSE) and client–broker messaging (Kafka, AMQP, MQTT). Describe with **AsyncAPI**.
- Best fit: notifications, decoupled workflows, fan-out, long-running work, high-throughput data flows. Costs: eventual consistency, ordering, duplicates (consumers must be idempotent), harder debugging and testing.
- General knowledge: decide event type (notification vs state transfer), keying/partitioning for ordering, schema registry and compatibility mode, dead-letter handling, at-least-once delivery as the default assumption.

## Choosing a style (decision guide)
Ask:
1. North–south or east–west? Do we control the consumer code?
2. Is there a strong shared domain model, or do consumers need to compose their own queries?
3. How often does the underlying data model change, and how will versions be managed?
4. Is this proven to be high-traffic, or are bandwidth/latency concerns measured?
5. Does the interaction need to be synchronous at all?

Typical answers:
- External or partner consumers → **REST** (Level 2) with OpenAPI; loose coupling, low barrier.
- Internal high-volume service-to-service calls under one owner → consider **gRPC**.
- Client-driven aggregation across many services → **GraphQL** facade.
- Fire-and-forget, fan-out, long-running or decoupled workflows → **events/async**.
It is rarely "REST versus gRPC"; it is which fits this exchange. Mixed estates are normal.

## Offering several styles for one service
- Possible (REST + gRPC + GraphQL), but costly: each representation has its own compatibility rules.
- **No golden specification**: generating protobuf from OpenAPI (or the reverse) is fragile. Example risk: a converter that assigns protobuf field numbers by alphabetical order renumbers every field when one is added, silently breaking the wire format. Proxies that map gRPC to REST (e.g., grpc-gateway) produce best-effort REST that tends to look like RPC.
- A resource model and a function-call model are different abstractions; forcing one into the other creates awkward APIs that are hard to evolve.
- Recommended default: design the internal RPC contract and the external REST contract **independently**, so each evolves on its own terms. Record the decision in an ADR.
