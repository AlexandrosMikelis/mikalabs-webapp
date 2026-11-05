# Traffic-management anti-patterns

Each entry: what it looks like → why it hurts → what to do instead. Typical severity in brackets (adjust for scale and criticality).

## API gateway loopback [High at scale, Medium when small]
- Looks like: internal services call each other via the public gateway URL because the gateway holds the only service directory. Hub-and-spoke.
- Hurts: internal traffic leaves and re-enters the network (latency, exposure, egress and cross-zone charges in the cloud); the gateway becomes a bottleneck and true single point of failure; traces loop and are hard to read. Doesn't scale past a handful of services.
- Instead: internal discovery and routing (platform DNS/service discovery, libraries, or a mesh); keep internal calls inside the network.

## Gateway as ESB [High]
- Looks like: business rules, orchestration or data transformation in gateway plug-ins/scripts (Lua, Wasm, Groovy, custom filters).
- Hurts: business logic split between gateway and services; plug-in and service must be released in lockstep; one plug-in change ripples across many teams; the gateway becomes hard to replace or remove after a migration.
- Instead: keep plug-ins to cross-cutting concerns (auth integration, filtering, logging, rate limits). Put composition in a dedicated service owned by a product team (e.g., backend-for-frontend) if needed.

## Service mesh as ESB [High]
- Looks like: payload transformation or translation in mesh filters, "smart pipes".
- Hurts and fix: as above. Smart endpoints, dumb pipes.

## Turtles all the way down (gateway layering) [Medium–High]
- Looks like: a chain of gateways per department or per concern ("TLS gateway", "auth gateway", "logging gateway").
- Hurts: simple changes need many teams; unclear ownership ("who owns tracing?"); every hop adds latency and a failure point.
- Instead: as few gateways as the organisational and trust boundaries really require; clear ownership of each concern; push per-team config to self-service on a shared platform.

## Service mesh used only as a gateway [Medium]
- Looks like: a mesh is installed only to use its ingress gateway because "we'll want a mesh later".
- Hurts: you pay mesh installation and operating costs without mesh benefits, and get a thinner gateway than a real API gateway.
- Instead: choose an API gateway for today's ingress problem; adopt a mesh when east–west needs justify it (choose a gateway that integrates with likely meshes).

## Too many networking layers [Medium–High]
- Looks like: teams add a mesh on top of existing platform networking features they don't know about or won't use; resilience implemented twice.
- Hurts: header stripping and protocol incompatibilities; extra proxy hops; double circuit breaking or retries that multiply (retry storms); confusing failures.
- Instead: map what each layer already does; decide which layer owns retries, timeouts, rate limits and TLS; coordinate network, platform and service teams.

## Monolith as the router for extracted services [High when extracting many services]
- Looks like: during a migration, the monolith keeps routing and cross-cutting duties for services extracted from it.
- Hurts: all traffic flows through the monolith (load and blast radius); routing changes wait on the monolith's release train; a failed monolith deploy blocks routing changes.
- Instead: move routing and edge concerns to a highly available gateway that teams can configure themselves; the monolith becomes one backend among others.

## Routing on payloads [Medium]
- Looks like: routing decisions read the request body.
- Hurts: gateway config couples to payload schemas; parsing cost on every request.
- Instead: route on host, path, headers; if needed, have the client or an upstream component set a header.

## Business logic in the migration proxy [High]
- Looks like: the strangler facade accumulates logic during migration.
- Hurts: the facade can't be removed at the end; it becomes the new legacy.
- Instead: facade routes only; logic lives in old or new service.

## Gateway drifting from facade to adapter [Medium]
- Looks like: a routing gateway gradually takes on protocol and data conversions.
- Hurts: coupling rises with each conversion; translation fidelity bugs; compute cost.
- Instead: when conversion is needed, make it an explicit adapter component with owners and tests, and ask whether the gateway is still the right home.

## API layer cake [Medium]
- Looks like: mandatory layers of APIs (engagement → differentiation → record) each request must pass through.
- Hurts: one business change touches every layer; teams shortcut layers or duplicate logic to avoid a hop; evolution slows.
- Instead: APIs aligned to cohesive business domains; layer only where it earns its keep.

## Synchronised releases across services [High]
- Looks like: several services must deploy together for a feature.
- Hurts: a distributed monolith; outages when the choreography slips.
- Instead: backward-compatible API changes, versioning, deploy/release separation (06); break the coupling (08).

## Feature flag debt and reuse [High]
- Looks like: old flags left in code; flag names reused.
- Hurts: a reused flag reactivating dead code has caused very large real-world losses in seconds.
- Instead: unique names, owners, expiry dates, removal once rollout completes.

## Shared "utils" API [Medium]
- Looks like: a grab-bag API of helpers used by all domains.
- Hurts: low cohesion; a change for one domain silently breaks another.
- Instead: put behaviour with the domain that owns it.
