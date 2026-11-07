# Should responses carry links and actions, and how does the API change without breaking anyone?

Read this when a design says it is "Level 3" or "HATEOAS", picks a linked-data or hypermedia format, serves many clients it does not control, or asks how to change the API safely over years. Level 2 (01) stays the default target. Links are a tool for letting clients survive change, not a maturity badge.

## Is it worth it here? MIKA link-value check
Score each line 0 or 1. Total 0–1: plain Level 2 with a good OpenAPI description. 2–3: add links where they remove URL-building (pagination, related resources, status of async jobs). 4–5: adopt a registered linked format across the API and publish client guidance.
| Question | 1 if… |
|---|---|
| Who writes the clients? | Partners, the public or other organisations, not the team that owns the server |
| How long do clients live between upgrades? | Months or years (installed apps, devices, partner integrations) |
| Does the set of allowed actions depend on state? | Yes, e.g. "cancel" only while a ferry booking has not been checked in |
| Do URL layouts or hosts change (migrations, regions, sharding)? | Yes, or likely within two years |
| Is a generated client from a full spec impractical for most consumers? | Yes |
Example: the community energy co-op's member portal API is called only by its own web app, released together with the server: score 1, so Level 2 plus a spec. The co-op's meter-data API used by four installer companies' field apps scores 4.

## What the standards already give you
- **Links**: RFC 8288 (Web Linking) defines typed links with a *relation type*, available as an HTTP `Link` header or inside a body format. Use relations from the IANA Link Relations registry (`self`, `next`, `prev`, `first`, `last`, `collection`, `item`, `edit`, `describedby`, `profile`, `service-desc`) before minting new ones; a custom relation should be an absolute URI you control.
- **Templated links**: RFC 6570 (URI Template) lets a server publish `https://api.example/clinics/{clinicId}/appointments{?date,vet}` so the client fills variables instead of concatenating strings.
- **Content negotiation**: RFC 9110 defines `Accept`, `Content-Type`, **406 Not Acceptable**, **415 Unsupported Media Type** and `Vary`. Send `Vary: Accept` when the representation depends on it.
- **Profiles**: RFC 6906 defines the `profile` relation, pointing at a document that says what the fields and actions mean (an ALPS description, JSON Schema with descriptions, or plain documentation).
- **OpenAPI 3.x Links**: the `links` object on a response describes how a value from one response (such as a new `bookingId`) feeds the next operation. It is design-time documentation, not runtime links, but it makes workflows explicit for generated clients and reviewers.

## Choosing a body format
| Need | Reasonable choice | Notes |
|---|---|---|
| Links and embedded related resources, minimal ceremony | HAL (`application/hal+json`; an expired IETF draft, still widely used) | `_links` by relation, `_embedded` for included items; no write actions in the base format |
| Consistent conventions for resources, relationships, includes, sparse fields, errors | JSON:API (`application/vnd.api+json`, v1.1) | Opinionated; strong for CRUD-heavy APIs; client libraries in many languages |
| Write actions discoverable at runtime (method, target, fields) | Siren | Entities with `links` and named `actions` |
| Linked data and shared vocabularies across organisations | JSON-LD (W3C), optionally Hydra | Higher learning curve; good with schema.org terms |
| Just links on a plain JSON API | RFC 8288 `Link` headers | Cheapest step; works with any body |
A private vendor type (`application/vnd.vetnet.appointment+json`) is fine inside one organisation; for outside consumers it adds a format only you document. Whatever you choose, list the media types per operation in the OpenAPI description.

## What should clients be told? (publish this guidance)
1. Store **one entry point** (or the spec's server URL) and reach other resources through links or templates.
2. Select links by **relation**, not by position in an array or by URL shape.
3. **Tolerate additions**: unknown fields, links and enum values must not break parsing (the robustness principle; Zalando's public API guidelines, for one, make it an explicit client rule).
4. Obey HTTP: redirects, `Cache-Control`, `ETag` with conditional requests, `Retry-After`, status classes; never parse human-readable error text (use RFC 9457 `type`).
5. Validate only the fields you use.
A review flags SDKs, samples or docs that build URLs by hand, validate the whole document strictly, or hard-code a fixed sequence of calls where links exist.

## What should the server guarantee?
- The entry point and `self` links never change meaning; moved resources answer with **301/308** and a `Location`.
- Each resource in a response has a stable identifier.
- Actions appear only when allowed in the current state; an absent action means "not now", and the operation still enforces the rule (links are hints, not authorisation).
- Representations are designed for consumers and mapped from storage (02); internal table shapes do not leak.
- Machine-readable descriptions are published: OpenAPI 3.1 (or AsyncAPI for events) for shape, a profile for meaning, and catalogue metadata (owner, lifecycle, docs) for people.

## How does an API change without breaking anyone?
Every published path, method, parameter, field, enum value and its meaning is a commitment. MIKA's compatibility checklist, which applies with or without links (details and catalogues in 05):
| Check | Compatible | Breaking |
|---|---|---|
| Fields and parameters | Added as optional with a documented default | Removed, renamed, made required, type narrowed |
| Meaning | Unchanged | Same name now means something else |
| Enums | Values added, and clients were told to tolerate unknown values | Values removed, or added where clients were told the list is closed |
| Links and actions | New relations added; old ones still served | Relation removed while clients still follow it |
| Status codes and errors | New `type` URIs for new problems | Different status for an existing case |
When a breaking change is unavoidable, publish the new version **beside** the old, point clients to it with links, docs and the `Deprecation` (RFC 9745) and `Sunset` (RFC 8594) headers, and retire the old one when usage reaches zero or the notice period ends (05). Design messages for growth from day one: objects rather than bare values, so a field can gain siblings later.

## How do consumers find the API and its state?
- **Design time**: a catalogue or developer portal entry per API: spec, owner, lifecycle state, support contact.
- **Run time**: an RFC 8631 `service-desc` / `service-doc` link from the entry point to the OpenAPI document and human docs; an RFC 9727 `/.well-known/api-catalog` (2025) where an organisation publishes many APIs.
- **Health**: a health resource with status and version for operators; keep dependency detail off public endpoints. (The IETF `application/health+json` work is a draft; treat it as a convention, not a standard.)
- Service registries and platform discovery are infrastructure topics: hand those to Daedalus (API Platform Architect).

## Worked mini-example: clinic appointments
`GET /appointments/8812` returns `self`, `clinic`, `patient` and, while the slot is in the future, `reschedule` and `cancel` links. After check-in, the response omits both; `POST /appointments/8812/cancellation` then returns **409** with an RFC 9457 problem of type `https://api.vetnet.example/problems/already-checked-in`. A partner booking app that follows links needs no release when the clinic network later splits appointments by region and the URLs change.

## Review questions
1. If the design claims hypermedia, which format, which registered relations, and how are writes described?
2. How many URLs must a client know in advance? Is there one stable entry point?
3. Does published client guidance tell consumers to tolerate additions and follow links?
4. Is there a profile or vocabulary, used consistently across the organisation's APIs?
5. Can the next likely change be made by adding only? If not, which commitment breaks?
6. Can a consumer find the spec, docs and lifecycle state from the API itself?
Severity: no links on a Level 2 API is not a finding by itself. Claiming Level 3 with no links or action descriptions, or SDKs that force URL construction on many external clients: **Medium**. Removing or redefining a published element is a breaking change, rated with 05.
