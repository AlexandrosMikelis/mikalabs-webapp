# Authorisation enforcement

Authorisation is the most common source of serious API vulnerabilities. The rule: **every request to every operation is checked for (a) is this caller allowed this function, and (b) is this caller allowed this specific object and these specific properties** — server-side, after authentication, before any data is read or changed.

## Three levels
| Level | Question | Failure (OWASP 2023) | Where to enforce |
|---|---|---|---|
| Function | May this caller invoke this operation (method + route)? | BFLA — API5 | Gateway (coarse: scope/role per route) **and** service |
| Object | May this caller act on *this* record (owner, tenant, sharing)? | BOLA — API1 | Service / data layer only — the gateway doesn't know ownership |
| Property | May this caller see/set *these* fields? | BOPLA — API3 (excessive data exposure, mass assignment) | Service: response and request DTOs per role |

## Object level (BOLA)
- Typical cause: the handler loads `/accounts/{id}` by ID and returns it without checking it belongs to the caller. Changing the ID in path, query, body, header or GraphQL argument exposes other records.
- Controls: derive the owner/tenant from the **verified token**, never from client input; build queries scoped to it (`WHERE tenant_id = :tokenTenant AND id = :id`); return 404 rather than 403 where existence itself is sensitive; centralise the check (policy function, repository layer, row-level security) so new endpoints can't forget it.
- Random/UUID identifiers reduce enumeration but are not authorisation.
- Test: automated tests with two users/tenants trying each other's IDs for every object-taking operation.

## Function level (BFLA)
- Typical causes: admin endpoints on the same host with only "hidden" paths; checks on GET but not PUT/DELETE; role decided by a client flag; trusting headers like `X-Role` or `X-User-Id` that an attacker can add.
- Controls: deny by default; explicit permission per operation; separate admin APIs (different host, audience, client, network path); **strip all identity/privilege headers at the edge** and only accept them from the gateway over an authenticated channel; enumerate routes × methods × roles in tests.

## Property level (BOPLA)
- **Excessive data exposure**: returning whole entities and relying on the client to hide fields. Anyone can read raw responses with browser dev tools or a proxy. Assumptions about "who calls this" decay as APIs move from internal to partner to public.
- **Mass assignment**: frameworks that bind request bodies onto ORM/active-record entities let callers set fields they shouldn't (role, owner, balance, verified flags, read-only lists). The gateway usually can't catch this; the service must.
- Controls: explicit input and output models per use case and role; allowlist writable fields; ignore or reject unknown fields; response schema validation at the gateway as a last-resort backstop, not the primary control.

## Scopes vs permissions vs entitlements
- OAuth scopes = what the **user let the client do**. User permissions = what the **user** may do. Object rules = which **records**.
- Effective access is the **intersection**. A client granted `users:manage` by a user who isn't an admin gains nothing; a user who is an admin, using a client granted only `users:read`, can only read.
- For client-credentials (machine) tokens, scopes/roles are pre-arranged per client; still enforce object rules (e.g., a partner sees only its own customers).

## Models
- **RBAC** (roles → permissions): simple, common; watch for role explosion and roles used as a proxy for data ownership.
- **ABAC** (attributes of subject, resource, action, context): handles tenancy, region, data class, time.
- **ReBAC** (relationship graphs, Zanzibar-style): fits sharing and hierarchies (documents, orgs, projects).
- **Policy engines** (e.g., OPA/Rego, Cedar; general knowledge): externalise rules, version and test them, evaluate at gateway, mesh or service. Still need correct inputs (verified identity, true resource attributes).
- The model is a design choice; what matters in review is that **some** explicit check exists on every operation and it's tested.

## Multi-tenant APIs
- Tenant ID from the token (or from a verified mapping of the client), not from a path segment alone.
- Per-tenant issuer/audience validation if tenants bring their own IdP.
- Data-layer isolation (separate schemas/DBs or row-level security) as defence in depth; cross-tenant tests in CI.
- Caches and search indexes keyed by tenant.

## Review questions
1. Where is the object-ownership check for each operation that takes an ID? Show the code path or design.
2. Can any client-controlled value (header, body field, path) set identity, tenant or role?
3. Are admin functions reachable with user tokens on any method?
4. Do responses return only fields the caller's role needs? Are request bodies bound to entities?
5. Are authorisation tests automated with multiple users, roles and tenants?
