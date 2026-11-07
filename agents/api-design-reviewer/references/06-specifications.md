# Specifications and spec-first workflow

## Why a specification
Once there is more than one consumer, they need a precise, shareable description of the API: structure, types, security requirements, metadata (licence, contact, terms) and documentation with examples. API catalogues and developer portals, code generators, validators, mocks and diff tools all run on it.

## The main formats
- **OpenAPI** (OAS; Swagger was its origin): JSON/YAML for HTTP APIs. Current lines: 3.0, 3.1 (aligned with JSON Schema 2020-12), 3.2. Many tools still lag or only support 2.0, so check tool support.
- **AsyncAPI**: the counterpart for event-driven and message-based APIs (channels, messages, bindings for Kafka, AMQP, MQTT, WebSockets). Younger standard; the variety of protocols makes tooling uneven.
- **Protocol Buffers (.proto)**: the schema for gRPC; stricter than OpenAPI because it defines the wire layout.
- **GraphQL SDL**: the schema for GraphQL APIs.
- JSON Schema for payloads; Arazzo for multi-step workflows across operations.

## Practical uses of a spec
- **Code generation**: client SDKs and server stubs in many languages (e.g., OpenAPI Generator). Fast integration; review the generated code's quality and pin generator versions.
- **Validation**: check real requests and responses against the spec, in tests (so the implementation can't drift from the contract) and at runtime, e.g., at a gateway or in a DMZ, dropping traffic that doesn't conform. Runtime validation makes the forgiving OpenAPI model stricter.
- **Examples and mocks**: examples document expected behaviour; mock servers built from them let consumers try the API before it exists. Trying an API is often more useful than reading a spec. Validate the examples against the schema (examples are free text and drift).
- **Change detection**: diff against the previous release in the pipeline (see 05).
- **Linting**: enforce the organisation's style guide automatically (e.g., Spectral rulesets, Redocly lint, buf lint).

## A spec is not the whole contract
OpenAPI describes **shape**, not full **semantics**: it doesn't say what happens on a retry, which state transitions are allowed or what a 500 means for state. Capture behaviour in descriptions, examples and, above all, contract tests (07). If the API is public, model and test the range of behaviours before launch, so you don't have to change it drastically afterwards.

## Spec-first vs code-first
- **Spec-first (API-first)**: write and review the spec with consumers, mock it, then implement. Best for multiple or external consumers, parallel front-end/back-end work and governance. Risk: spec and code drift unless validated in CI.
- **Code-first**: generate the spec from annotations. Fast for a single internal consumer; risk of leaking implementation detail into the contract and of accidental breaking changes. Still run the diff gate.
- Either way, design from the consumer's perspective and keep the abstraction: you should be free to refactor behind the API without breaking it.

## Spec quality checklist (for reviews)
- `info`: title, description, version, contact, licence/terms where external.
- `servers` correct per environment; no internal hostnames in public specs.
- Every operation has a unique, stable `operationId` (codegen depends on it), a summary, tags.
- Every operation documents success **and** error responses, using shared error schemas.
- Schemas in `components`, reused via `$ref`; no duplicated inline copies of the same object.
- `required` lists, `nullable`/type unions, formats (`date-time`, `uuid`), `minimum`/`maximum`, `maxLength`, `pattern`, `maxItems` defined; `additionalProperties` decided deliberately.
- Enums documented as closed or extensible.
- Security schemes declared and applied per operation (OAuth2 scopes, API keys); no operation unintentionally unauthenticated.
- Examples present and valid against schemas.
- Pagination, filtering and error conventions consistent (03, 04).
- Deprecated operations/fields marked `deprecated: true` with a replacement noted.

## Which style guide should the organisation follow?
- **Default**: adopt one public guide rather than writing your own from scratch: Zalando RESTful API Guidelines, Google AIP (aip.dev) or the Microsoft/Azure REST API guidelines. All three use RFC 2119 / RFC 8174 keywords (MUST, SHOULD, MAY), so teams can tell rules from advice.
- **Switch if**: most existing APIs already follow one house convention (keep it and write it down), or a dominant third-party platform you integrate with imposes its own (follow it at that boundary only).
- **Then**: add a short house supplement (domain data dictionary, ID format, error `type` URIs, pagination choice) and enforce the machine-checkable parts with a linter ruleset such as Spectral in CI.
- **Timing**: decide before the second public API ships; consistency added later means breaking changes.
- Community energy co-op example: three APIs, two naming styles. Decision: Zalando guidelines plus a one-page supplement; a Spectral ruleset flags snake_case in new specs; existing APIs converge at their next major.
