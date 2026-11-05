# API design review procedure

Use for `review` requests: an OpenAPI/AsyncAPI/proto/GraphQL spec, a design document, a list of endpoints, a spec diff, a pull request touching an API contract, or an ADR about an API.

## Step 0 — Establish the facts (don't skip)
Extract or assume: what the API exposes and for whom; consumers (internal same-team, internal other-team, partner, public) and how many; traffic pattern (north–south / east–west) and expected volume; style (REST, gRPC, GraphQL, async); whether a previous version is live; the organisation's API standard, if any; data sensitivity (personal, financial, health); authentication model.
If something that would change a severity is missing, state the assumption and list it under OPEN QUESTIONS. Agent callers can't answer follow-ups: never block. Default assumptions when unstated: consumers are another team (loose coupling needed), no org standard (judge against widely used guidelines), data may include personal data.

## Step 1 — Fit of style (01)
Is the style right for the exchange? Flag: REST on a measured high-volume internal hot path where gRPC fits; gRPC exposed directly to browsers or broad external consumers; GraphQL used to paper over poorly designed back-end APIs; synchronous calls for long-running or fan-out work; generated cross-specifications (OpenAPI ↔ proto). Not every review needs a style finding; say "style fits" when it does.

## Step 2 — Compatibility (05)
If a previous version is given or the API is live: list each change, classify breaking / compatible, and check the version bump and migration plan. Breaking changes to live external consumers without a new major version or migration path are Critical or High.

## Step 3 — Run the checklists
Apply only what matters for this API, but consider each area:
| Area | Core question | Reference |
|---|---|---|
| Resource model & naming | Consumer-domain nouns? Consistent names and shapes? No internals or PII in URLs? | 02 |
| HTTP semantics | Methods used with correct semantics? Status codes accurate? `Location` on create? | 02 |
| Collections | Envelope, pagination with max size, deterministic order, one filter convention? | 03 |
| Errors | One error format, stable codes, no 2xx errors, no leaked internals? | 04 |
| Reliability | Idempotency on creates/payments, retry semantics, concurrency control, timeouts, rate limits? | 04 |
| Versioning | Scheme defined, deprecation policy, consumer tolerance rules published? | 05 |
| Spec quality | Complete, reusable components, examples valid, errors documented, security declared? | 06 |
| Testability | Contract approach, validation in CI, diff gate, key component tests? | 07 |
| Decisions | Are big choices recorded as ADRs with alternatives and consequences? | 08 |
| Security | AuthN on every non-public operation, object/property-level authZ, limits, PII handling? | 09 |
| Performance | Chattiness, payload size, caching, async for long work, SLOs? | 09 |

## Step 4 — Rate each finding
| Severity | Meaning | Typical action |
|---|---|---|
| **Critical** | Will break live consumers, lose or duplicate money/data, or expose data/operations without authorisation | Block release; fix first |
| **High** | Likely consumer breakage or integration failure soon; ambiguous failure semantics on important operations; hard-to-reverse design flaw about to be published | Fix before consumers integrate |
| **Medium** | Inconsistency or gap that costs consumers effort or will force a breaking change later; missing tests for risky behaviour | Fix in this iteration or next |
| **Low** | Style, naming polish, documentation, optional improvements | Optional |
Rate by consumer impact × likelihood × reversibility × number of consumers. The same flaw is more severe on a published external API than on a draft internal one; cheap-now-breaking-later problems (bare arrays, missing envelope, bad names) rise in severity as publication approaches.
Group repeated instances (e.g., twelve operations with no error responses) into one finding with all locations.

## Step 5 — Fix
Each fix is concrete and minimal: the corrected path, field, status code or schema fragment. Prefer, in order: an additive, compatible change → a deprecation plus replacement → a new major version with a migration guide. Don't propose breaking fixes to live APIs without the versioning path.

## Step 6 — Testing recommendations
Fill the TESTING section from the last part of 07: contract approach, spec validation and diff gate, the component tests the risky operations need, integration and E2E scope.

## Step 7 — Verdict
- **Approve** — no High or Critical findings.
- **Approve with changes** — High findings with clear, local fixes; list them as conditions.
- **Rework** — structural problems (wrong style, resource model, pagination or error model) that need redesign before consumers integrate.
- **Reject** — Critical findings that make the change unsafe to ship (e.g., unversioned breaking change to live public consumers, unauthenticated access to sensitive data).
Confidence: High / Medium / Low depending on how much was assumed (e.g., an endpoint list without schemas → Medium at best).

## Common patterns (quick reference)
- **CRUD service extracted from a monolith**: watch for table-shaped resources, internal IDs and column names leaking, added latency and a new single point of failure (needs an ADR), and the missing versioning plan now that several consumers exist.
- **Public/partner REST API**: Level 2 semantics, OpenAPI with examples, URL major versioning, RFC 9457 errors, cursor pagination, OAuth scopes, rate limits, deprecation policy, producer contracts.
- **Internal service-to-service API**: gRPC or REST by measured need; CDC contracts; timeouts and retries; idempotency; service identity.
- **Payments/orders/bookings**: Idempotency-Key on create, explicit state machine with 409 on invalid transitions, documented meaning of 5xx and timeouts, ETags, webhook signing.
- **Mobile/UI backend**: chattiness, payload size, sparse fieldsets or BFF/GraphQL, caching, offline-tolerant semantics.
- **Event/AsyncAPI contracts**: schema registry and compatibility mode, keys for ordering, idempotent consumers, dead-letter handling, versioning by new event types.
- **Spec diff in a pull request**: breaking-change classification first, then version bump check, then new-operation review.
- **gRPC proto review**: field numbers stable, `reserved` for removed fields, no required semantics on new fields, package versioning (`acme.attendees.v1`), deadlines, error model (google.rpc.Status).
- **GraphQL schema review**: nullability choices, pagination (connections), query cost limits, field-level authorisation, deprecation instead of versions.
