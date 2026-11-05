# Security and performance at design level

Design-review flags only. Anything public or handling personal, financial or health data needs a proper security review and threat model (e.g., STRIDE). Much of this file is general knowledge, based on the OWASP API Security Top 10 (2023), OAuth 2.0 / OpenID Connect and HTTP standards.

## Security checks in a design review
- **Authentication declared and applied** on every operation that needs it; explicitly list public operations. North–south traffic must verify client identity at the edge; east–west traffic is more trusted but still needs service identity (mTLS, workload identity) and authorisation.
- **Object-level authorisation** (OWASP API1, BOLA): every operation that takes an ID must check the caller may access *that* object. Sequential, guessable IDs make this worse. Flag any design where access depends only on knowing an ID.
- **Property-level authorisation** (API3): don't return fields the caller shouldn't see; don't accept writes to fields they shouldn't set (mass assignment of `role`, `price`, `ownerId`). Use separate read and write schemas.
- **Function-level authorisation** (API5): admin operations separated and scoped.
- **Unrestricted resource consumption** (API4): page-size limits, payload and upload limits, rate limits, query-cost limits for GraphQL, timeouts.
- **Sensitive business flows** (API6): bulk sign-ups, ticket purchases, referral abuse; need rate limiting and anti-automation.
- **SSRF** (API7): operations that accept URLs (webhooks, imports) need allow-lists.
- **Inventory** (API9): old versions and undocumented endpoints left running; every version in the catalogue with an owner and a sunset date.
- **Unsafe consumption of third-party APIs** (API10): validate what you receive from upstream APIs too.
- **Personal data**: never in URLs or query strings (they're logged and cached); minimise fields; mark sensitive fields in the spec; mind logs and recorded test fixtures.
- **OAuth 2.0 scopes** designed per capability (read vs write, per resource family), declared in the spec. Don't use API keys alone for user-level access.
- **Errors** don't leak internals (04). CORS configured narrowly for browser APIs. TLS everywhere.
- **Spec validation at the edge** (gateway/DMZ) rejects non-conforming requests early.
- **Webhooks**: signed payloads (HMAC with timestamp), replay protection, retries with idempotent receivers.

## Performance and exchange design
- **Compounding latency**: an external request crossing the internet often triggers several internal calls. Chatty designs (many small calls to render one screen) multiply round trips. Offer composite or batch operations, sparse fieldsets, or a GraphQL facade for UI aggregation.
- **High-traffic services**: central services (identity, customer, catalogue) are hit by everything. At volume, payload size and protocol overhead become real money and time; measure before optimising.
- **Payload size and parsing**: JSON is verbose and parsing cost varies a lot by language. Human readability is a weak argument for JSON on high-volume internal paths, given modern tracing and logging. Binary formats (protobuf) shrink payloads and parse faster.
- **HTTP/2**: binary framing, header compression, multiplexing many requests over one connection (avoids opening a connection per request). gRPC uses it by default. **HTTP/3** runs over QUIC (UDP) and removes TCP head-of-line blocking; semantics (methods, status codes) are unchanged, but proxies and ingress need support.
- **Caching**: make GETs cacheable where data allows (`Cache-Control`, `ETag` + `If-None-Match` → 304). Stateless requests make horizontal scaling and caching simpler.
- **Large or long-running work**: async job pattern (202 + status resource), streaming, or events rather than huge synchronous responses (02, 03).
- **Legacy components** in the path set the floor for latency and availability; include them in performance budgets.
- **SLOs**: state latency and availability targets per operation class; performance tests check them (07).

## Severity hints
- Missing authentication or object-level authorisation on non-public data: **Critical**.
- Personal data in URLs, internals in errors, no rate or size limits on a public API: **High**.
- Chatty design on a measured hot path; missing caching headers on read-heavy public data: **Medium**.
- Theoretical optimisations without measurements: **Low** or note only.
