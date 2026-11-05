# Versioning and compatibility

## Why APIs are different from libraries
A library change waits until the consumer recompiles. An API is a running service: a change is live for every consumer the moment it deploys. With several consumers, every change is a coordination question. Not planning versioning for an API that others consume is dangerous; versioning should be a deliberate product decision, with a defined way of telling consumers about it.

## The three upgrade options (use all three, under rules)
1. **New version at a new location** (e.g., `/v2`) — old consumers carry on; the producer must run, patch and secure several versions in parallel.
2. **Backward-compatible release** — additive changes only; no consumer action needed. Even a "small fix" such as correcting a misspelt field name breaks compatibility.
3. **Breaking release that all consumers must adopt** — sometimes unavoidable (security, legal), but forces lockstep, coordinated change. Last resort.

## Semantic versioning applied to APIs
- **MAJOR**: incompatible change. Adopting it is an active decision by the consumer; provide a migration guide and track who has moved.
- **MINOR**: backward-compatible addition; consumers can receive it without changing code.
- **PATCH**: bug fixes with no contract change.
- Expose only the major version to consumers in the URL or header; record minor/patch in the spec's `info.version` and changelog.

## Where to put the version (general knowledge)
- **URL path** (`/v1/...`): explicit, cache- and gateway-friendly, easy to route; most common for public APIs.
- **Header** (`Api-Version: 2026-11-01`) or **media type** (`application/vnd.acme.v2+json`): cleaner URLs, harder to test in a browser.
- **Date-based versions** (Stripe, Azure): good for frequent, small breaking changes with per-account pinning.
- Choose one and be consistent. Style choice, not a defect, unless it is inconsistent or missing on an externally consumed API.

## Breaking-change catalogue
**JSON/REST — breaking**
- Remove or rename a field, operation, path, parameter or enum value.
- Change a field's type, format, meaning, unit or nullability (nullable → required, or a value can now be null in a response).
- Make an optional request field/parameter required; add a new required field to a request.
- Tighten validation (shorter max length, narrower pattern) on requests.
- Change status codes, error codes or error shape that consumers branch on.
- Change default values, sort order, pagination shape, or a bare array to an object.
- Change authentication or required scopes.
- Change resource IDs or URL structure without redirects.
**JSON/REST — usually compatible**
- Add an optional request field or query parameter; add a response field; add an operation or resource; relax validation.
- Add an enum value to a **response** — compatible only if consumers were told enums are extensible and to handle unknown values. Otherwise treat as breaking.
- **Robustness principle** (Postel's law; general knowledge): consumers should ignore unknown fields and tolerate additions; producers should be strict in what they send. Write this into the API's consumer guidance; it is what makes additive change safe.

**Protobuf / gRPC** (binary layout is defined by field numbers, so the rules are stricter than JSON)
- Breaking: change a field number; change a field's type (in most cases); remove a field and reuse its number or name; rename a service or method or package; change a method's request/response type; change streaming mode.
- Compatible: add a new field with a new number (new fields are optional in proto3); add a method or service. Mark removed fields `reserved` (number and name) so they can't be reused.
- Renaming a field is wire-compatible but breaks generated code and JSON transcoding; treat as breaking for consumers.
- Never generate field numbers automatically (e.g., alphabetically from another spec).

**GraphQL** (general knowledge): adding types/fields is compatible; removing or renaming fields, making arguments required, or changing a field's type is breaking. Evolve with `@deprecated(reason:)` and usage monitoring instead of versions.

**Events / AsyncAPI** (general knowledge): consumers you may not know about read old and new messages, often replaying history. Use a schema registry with a compatibility mode (backward, forward, full); add optional fields only; publish a new event type or topic for incompatible changes.

## Deprecation and sunset (general knowledge)
- Announce, document and date it: `Deprecation` header (RFC 9745) and `Sunset` header (RFC 8594), changelog, direct notice to known consumers.
- Measure usage per consumer before removal; give a migration window proportional to consumer count and type (months for public APIs).
- Run old and new versions side by side; route via the gateway.

## Detecting breaking changes automatically
- Diff each spec change against the last released version in CI (e.g., openapi-diff, oasdiff, buf breaking for protobuf, GraphQL Inspector) and fail the build on unapproved breaking changes. Check that the tool supports your spec version (OpenAPI 2.0 vs 3.x vs 3.1); unsupported versions can silently report "no changes".
- Spec diffs only catch shape changes. **Behavioural** changes (semantics, defaults, ordering, error conditions) need contract tests (see 07).

## Review procedure for a diff
1. List every change between versions.
2. Classify each as breaking / compatible / compatible-if-tolerant.
3. For each breaking change: is it necessary? Can it be made additive (new field alongside old, deprecate old)? If not, is there a major version and migration plan?
4. Check the version number reflects the change (breaking under a minor bump is a **High** finding for external APIs).
