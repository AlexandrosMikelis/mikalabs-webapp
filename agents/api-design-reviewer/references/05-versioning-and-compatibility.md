# Versioning and compatibility

## Who feels a change, and when?
A deployed API change reaches every caller at once; nobody gets to "upgrade later" unless you give them a way to. So the first review question is not "what version number?" but "who has to do something, and by when?". An API that others call needs a written change policy (how changes are classified, announced and retired) before its first release.

## MIKA change-path table
| Path | Caller effort | Server cost | Use when |
|---|---|---|---|
| **Additive release** (new optional fields, new operations) | None, provided callers tolerate additions | Low | The default for almost every change. Note that even fixing a misspelt field name is not additive |
| **Parallel major** (`/v2` or a new version header value) | Each caller migrates on its own schedule | Two versions to run, patch and secure until the old one retires | A breaking change is genuinely needed and callers cannot all move together |
| **Forced cut-over** (everyone must move by a date) | All callers change in lockstep | Low afterwards, high coordination before | Only for security or legal emergencies, with direct contact to every caller |
Veterinary clinic example: adding `species` to appointment responses is additive; changing `appointmentTime` from local time to UTC changes meaning, so it needs a parallel major or a new field (`appointmentTimeUtc`) beside the old one.

## Version numbers (Semantic Versioning 2.0.0, applied to contracts)
- **Major**: incompatible. Callers opt in, so publish a migration guide and track per caller who has moved.
- **Minor**: compatible addition; callers get it without code changes.
- **Patch**: fixes with no contract change.
- Callers see only the major (in the path or a header); minor and patch live in the spec's `info.version` and the changelog.

## Where to put the version
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
- **Robustness principle** (Postel's law): consumers should ignore unknown fields and tolerate additions; producers should be strict in what they send. Write this into the API's consumer guidance; it is what makes additive change safe.

A quick test for any proposed change is the compatibility checklist in 10 (fields, meaning, enums, links, status codes). If a change fails it and is truly needed, run old and new side by side, move callers across, then retire the old one.
- Data model changes behind a live API follow the same pattern: expand (add the new field or table, write both), migrate readers, then contract (stop writing the old one) only after no consumer reads it. Keep a release reversible: rolling back code must not lose data written by the new version.

**Protobuf / gRPC** (binary layout is defined by field numbers, so the rules are stricter than JSON)
- Breaking: change a field number; change a field's type (in most cases); remove a field and reuse its number or name; rename a service or method or package; change a method's request/response type; change streaming mode.
- Compatible: add a new field with a new number (new fields are optional in proto3); add a method or service. Mark removed fields `reserved` (number and name) so they can't be reused.
- Renaming a field is wire-compatible but breaks generated code and JSON transcoding; treat as breaking for consumers.
- Never generate field numbers automatically (e.g., alphabetically from another spec).

**GraphQL**: adding types/fields is compatible; removing or renaming fields, making arguments required, or changing a field's type is breaking. Evolve with `@deprecated(reason:)` and usage monitoring instead of versions.

**Events / AsyncAPI**: consumers you may not know about read old and new messages, often replaying history. Use a schema registry with a compatibility mode (backward, forward, full); add optional fields only; publish a new event type or topic for incompatible changes.

## Deprecation and sunset
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
