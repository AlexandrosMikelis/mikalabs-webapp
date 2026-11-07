# What security and performance questions belong in a design review?

Hermes raises design-level flags only. Anything public, or handling personal, financial or health data, needs a dedicated security review: hand it to **Argus (API Security Reviewer)**, which owns threat modelling, the full OWASP API Security Top 10 (2023) walk-through and risk rating. This file keeps the checks that change the *shape* of an API, because fixing them after release is a breaking change.

## Security questions that change the contract
| Question | Why it is a design issue | Where it shows in the spec |
|---|---|---|
| Is every operation's authentication stated, and are public operations listed explicitly? | Adding auth later breaks anonymous callers | `security` requirement per operation in OpenAPI; an empty array only where deliberately public |
| Does every operation that takes an identifier check the caller may act on *that* resource? | The most common API flaw (OWASP API1:2023); guessable sequential IDs make it worse | Path parameters; prefer opaque IDs (UUIDs) and say who may access what |
| Are read and write shapes separate? | One schema for both invites mass assignment of `role`, `price` or `ownerId` (OWASP API3:2023) | Separate request and response schemas; `readOnly` / `writeOnly` in JSON Schema |
| Are admin capabilities a separate set of operations or scopes? | Mixed endpoints hide privilege checks (OWASP API5:2023) | Distinct paths or tags; distinct OAuth scopes |
| Are limits part of the contract? | Missing limits become outages and bills (OWASP API4:2023) | Max `pageSize`, max body size, documented **429** with `Retry-After`, rate-limit headers |
| Does any operation accept a URL from the caller? | Webhooks and imports invite server-side request forgery (OWASP API7:2023) | Document allow-lists and schemes; validate on registration |
| Does personal data ever travel in a URL? | Paths and query strings are logged, cached and kept in browser history | Use bodies or opaque references; mark sensitive fields (`x-sensitive` or `format` notes) |
| Are OAuth 2.0 scopes designed per capability? | Coarse scopes cannot be narrowed later without breaking clients | `securitySchemes` with scopes such as `appointments:read`, `appointments:write` |
| Do errors stay generic to the caller? | Stack traces and SQL leak internals | RFC 9457 problem types with safe `detail` (04) |
For webhooks, also require a signed payload (HMAC over body plus timestamp), replay protection and idempotent receivers; the Standard Webhooks specification is a usable public reference. Calls from outside the organisation need caller identity checked at the entry point; calls between internal services still need their own identity and authorisation. Infrastructure for that (mutual TLS, workload identity) is Daedalus' and Argus' territory.

## Performance questions that change the contract
- **How many calls does one screen or task need?** Count them for the top three journeys. More than a handful of sequential calls suggests a composite resource, `include`/`expand` options, sparse fieldsets (`fields=`), or a client-shaped aggregation layer (a backend-for-frontend or GraphQL), each owned by the consuming team.
- **Which operations are hot?** Shared lookups (identity, customer, catalogue, timetable) are called by everything. For those, payload size and serialisation matter; for the rest, clarity wins. Measure before switching formats.
- **Is JSON the right encoding here?** For high-volume internal calls, Protocol Buffers over gRPC cut payload size and parse time; for public and browser clients, JSON with compression (`Content-Encoding: br` or `gzip`) is usually enough.
- **Can reads be cached?** Declare `Cache-Control` and `ETag` and support `If-None-Match` → **304** (RFC 9110, RFC 9111). Stateless requests make caching and horizontal scaling easier.
- **Is long work kept off the request?** Use **202 Accepted** plus a status resource, a webhook, or an event (02, 03, 11), not a request held open for minutes.
- **Which transport features are assumed?** HTTP/2 multiplexing and HTTP/3 over QUIC (RFC 9114) change connection behaviour, not API semantics; check that every proxy on the path supports what the design assumes.
- **What are the targets?** State latency and availability objectives per operation class; performance tests check them (07). Older systems on the path usually set the floor, so include them in the budget.

## Worked mini-example: ferry operator check-in API
`GET /bookings/{bookingRef}` used a six-character sequential reference and no ownership check: **Critical** (anyone can enumerate passengers). Fix in the contract: opaque booking IDs, an explicit rule that only the booking holder or port staff (scope `checkin:staff`) may read, and a **404** rather than **403** for bookings the caller may not see, so existence is not revealed. The same review found the departure board making 40 calls per refresh: a `GET /sailings?date=…&include=vessel,status` composite brought it to one, rated **Medium** because it was a measured hot path.

## Severity hints
- Missing authentication or per-resource authorisation on non-public data: **Critical**.
- Personal data in URLs, internals in errors, no size or rate limits on a public API: **High**.
- Chatty design on a measured hot path; no caching headers on read-heavy public data: **Medium**.
- Optimisations without measurements: **Low**, or a note.
Always add "security review recommended → Argus" when the API is public or handles regulated data, whatever the severity of the design findings.
