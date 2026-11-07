# Is every function, object and property checked on every call?

Authorisation flaws are the most frequent serious API finding, because a single forgotten check exposes everything behind it. Argus applies one rule: **on every call, after authentication and before any data is read or changed, the server decides whether this caller may run this operation, on this object, touching these fields.** Three decisions, made server-side, from verified identity.

## The three decisions
| Decision | Question | When missing (OWASP 2023, CWE) | Who can enforce it |
|---|---|---|---|
| Function | May this caller run this operation (method + route, mutation, RPC)? | API5:2023 · CWE-285 | gateway for coarse scope or role per route, **and** the service |
| Object | May this caller act on this particular record? | API1:2023 · CWE-639 | only the service or its data layer; nothing in front knows who owns what |
| Property | May this caller see, or set, these particular fields? | API3:2023 · CWE-213, CWE-915 | the service, through explicit input and output models |

When a design relies on the gateway for object or property decisions, say so as a finding: the gateway can confirm `records:read`, it cannot confirm that this owner owns pet 8812.

## The MIKA authorisation trace
For each exposure-sheet row that takes an identifier or a body, write a one-line trace. A missing link is a finding.

`identity source → function check → object scope → field filter (out) → field allowlist (in) → test`

Example (energy co-op, `PATCH /members/{id}/payout-account`, D4):
`token sub+org → role "member" or "treasurer" → member.id = sub OR (treasurer AND member.org = token.org) → n/a → {iban, holder_name} only → two-member and cross-org tests in CI`
If the trace stops at "role member" with no object scope, any member can redirect any other member's payouts.

## How to check object-level decisions
- The owner, organisation or customer comes from the **verified token** (or from a verified mapping of the client), never from a path segment, query parameter, body field or header alone.
- Queries are built already scoped: `WHERE org_id = :tokenOrg AND id = :id`, not "load by id, then compare".
- The check lives in one place new endpoints cannot bypass: a policy function, the repository layer, or database row-level security.
- Return `404` instead of `403` where the mere existence of a record is sensitive.
- Unguessable identifiers (UUIDs) slow enumeration; they are not authorisation.
- Look for identifiers in every position: path, query, body, headers, GraphQL arguments and nested object references in batch calls.

## How to check function-level decisions
- Deny by default; every operation declares the permission it needs.
- Every HTTP method on every route is covered, not only `GET`.
- Admin operations sit on a separate surface: different host or audience, different client, ideally a different network path.
- No identity or privilege arrives from a client-settable header (`X-Role`, `X-User-Id`, `X-Org`). Such headers are stripped at the first component and set only by it, over an authenticated hop.
- Tests enumerate route × method × role and expect a denial wherever the matrix says so.

## How to check property-level decisions
- **Outbound**: responses use explicit models per use case and role. Returning whole entities and leaving the client to hide fields is over-sharing (OWASP's earlier name was "excessive data exposure"): anyone can read raw responses.
- **Inbound**: frameworks that bind request bodies straight onto persistence entities let callers set fields they should not (role, owner, balance, verified flags). Allowlist writable fields per operation; reject or ignore unknown fields.
- Response-schema validation at the gateway is a backstop, not the control.
- GraphQL resolvers need field-level rules; a type-level check is not enough.

## The intersection rule
Effective access = what the **client** was granted (scopes) ∩ what the **subject** may do (roles, attributes, relationships) ∩ which **objects** the subject may touch.
- A client granted `members:manage` by a person who is not a treasurer gains nothing.
- A treasurer using a client granted only `members:read` can only read.
- Machine clients (client credentials) have pre-arranged grants; object rules still apply (a partner booking agency sees only its own bookings).

## Which policy model fits?
The model is a design choice; the review question is only whether some explicit check exists on every operation and is tested.

| Model | Fits | Watch for |
|---|---|---|
| Roles (RBAC, NIST's model) | small, stable permission sets | role explosion; roles standing in for ownership |
| Attributes (ABAC, NIST SP 800-162) | organisation, region, data class, time of day | attributes taken from untrusted input |
| Relationships (ReBAC, as in Google's Zanzibar paper) | sharing and hierarchies: clinic → vet → pet → owner | stale relationship data after transfers |
| Policy engines (OPA/Rego, Cedar, OpenFGA) | versioned, tested rules shared across services | correct inputs still required; decision logs needed for audit |

Relationship models are natural knowledge graphs: `(Owner)-[:OWNS]->(Pet)<-[:TREATS]-(Vet)-[:WORKS_AT]->(Clinic)`. An object check becomes "is there a path of the allowed shape from subject to object?", which is easy to test and to explain in an audit.

## Shared deployments serving many customer organisations
- Organisation identifier from the token; if customers bring their own identity provider, validate issuer and audience per customer.
- Isolation in the data layer as defence in depth: separate schemas or databases, or row-level security keyed on the organisation.
- Caches, search indexes, object-storage prefixes and background jobs keyed by organisation too.
- Cross-organisation tests in CI for every ID-taking operation.

## Typical findings
| Finding | Starting rating |
|---|---|
| No object check on a D3/D4 read or write | Critical |
| Object check missing but identifiers are UUIDs | still High or Critical; obscurity does not lower it |
| Admin operation reachable with an ordinary user token | High; Critical at D4 |
| Request bodies bound straight to entities with privileged fields | High |
| Full entities returned and filtered client-side | Medium; High if D3 fields included |
| Organisation taken from the path, not the token | High |
Confirm with the scoring rule in `11-severity-and-verdict.md`.
