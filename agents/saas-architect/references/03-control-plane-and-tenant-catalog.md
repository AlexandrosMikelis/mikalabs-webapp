# Step 3 — Who runs the customers? Control plane and tenant catalog

Use for the CONTROL PLANE and APPLICATION PLANE fields in `design` and the control-plane lens in `review`.

Grounding: the AWS Well-Architected SaaS Lens (control plane and application plane), the Azure Architecture Center page "Considerations for multitenant control planes" (control plane and data plane), CloudEvents 1.0 for lifecycle event envelopes, and MIKA's catalog schema and knowledge-graph mapping below.

## Two sides of the system
- **Control plane**: the services that create, configure, observe, bill and retire customers. It serves the provider, spans every customer, and is not itself shared in the tenancy sense. One control plane, however many stamps or dedicated deployments exist.
- **Serving side**: the product the customers use. AWS calls it the application plane; Azure calls it the data plane. Sharing, isolation, data layout and request routing live here.

The split stops provisioning, billing and usage reporting from becoming loose scripts. It also lets the serving side mix options A–D (`02`) while operations stay single.

## What belongs in the control plane
| Capability | Job | Notes |
|---|---|---|
| **Tenant catalog** | System of record: identifier, plan, status, region, placement per component, resource inventory, contacts | Every other capability asks it "who is this customer and where do they live?" |
| **Provisioning orchestrator** | Runs the lifecycle workflows: create, change plan, relocate, suspend, retire (`04`) | Durable workflow engine; idempotent steps |
| **Identity administration** | Customer organisations in the identity provider, first admin, federation setup, claim mapping (`05`) | Usually a bought CIAM product |
| **Entitlements and limits** | Plan definitions as data: features, quotas, rate limits | Read by gateways and services; changed only here |
| **Usage and metering** | Collects billable usage and operational signals from the serving side (`09`) | Two streams with different accuracy needs |
| **Billing connector** | Pushes plans and usage to the billing platform; reacts to payment events | Billing itself is rarely built in-house |
| **Release and fleet manager** | Knows every deployment target (stamps, dedicated stacks) and rolls changes through them (`10`) | Reads targets from the catalog |
| **Operator back office** | Provider staff manage customers: create, suspend, inspect, support | Separate workforce identity, strong audit |

Common additions: audit-log service, notification service, per-customer backup and restore orchestration, data export service.

## The tenant catalog schema (MIKA baseline)
| Group | Fields | Who may change |
|---|---|---|
| Identity | `tenant_ref` (opaque, immutable), slug, display name, parent group | control plane only (slug: customer admin) |
| Commercial | plan, billing account, contract dates, trial end | control plane, billing events |
| Placement | option per component (A–D), stamp, region, endpoints | provisioning orchestrator only |
| Inventory | every created resource: IDs, region, encryption key reference | provisioning orchestrator only |
| Configuration | settings, branding, notification preferences | customer admin within plan bounds |
| Limits | quotas and rate limits derived from plan, plus approved overrides | control plane only |
| Lifecycle | status, state history, timestamps, reason codes | provisioning orchestrator |

Keep **placement and inventory** (where the customer lives, set by the platform) apart from **configuration** (what the customer chose). Mixing them lets a settings screen break routing.

Use an opaque identifier (UUID or ULID) as `tenant_ref`. Not the company name, not a domain, not a sequence: names change and sequences leak customer counts.

## The catalog as a knowledge graph
MIKA models the catalog as a small graph, because the questions operators ask are relationship questions ("which customers share this database?", "who is affected if stamp eu-2 fails?", "which resources must be erased for this co-op?").

```
(Tenant)-[:ON_PLAN]->(Plan)-[:GRANTS]->(Entitlement)
(Tenant)-[:PLACED_IN]->(Stamp)-[:IN_REGION]->(Region)
(Tenant)-[:OWNS]->(Resource {type, id, key_ref})
(Resource)-[:HOSTED_ON]->(SharedResource)
(Tenant)-[:CHILD_OF]->(Tenant)
(User)-[:MEMBER_OF {role}]->(Tenant)
(Tenant)-[:FEDERATES_WITH]->(IdentityProvider)
```
Typical queries: blast radius of a shared database = all Tenants with a Resource HOSTED_ON it; erasure scope = all Resources OWNED by the Tenant plus shared resources holding its rows; plan drift = Tenants whose Limits differ from their Plan's Entitlements without an approved override.

## Who owns what in the grey zone
Some capabilities touch both sides. Write the owner down; ambiguity produces orphan scripts.
| Capability | Defined in | Enforced or produced in |
|---|---|---|
| Plans and limits | control plane (data) | gateway and services (throttles, feature checks) |
| Provisioning | control plane (workflow) | serving side (the templates that build resources) |
| Identity | control plane (organisations, claims) | serving side (token validation, roles) |
| Usage signals | serving side (emits) | control plane (aggregates, bills) |

## How the two sides talk
- **Events for lifecycle and usage.** `tenant.created`, `tenant.plan_changed`, `tenant.suspended`, `tenant.relocated`, `tenant.retired` from the control plane; usage and health events from the serving side. Use CloudEvents 1.0 envelopes (with the customer reference in an extension attribute) so tooling can route and audit them.
- **Synchronous reads, cached.** Entitlement and placement lookups are cached near the services or carried in token claims (`05`). The catalog must not sit on the hot path of every request.
- **Failure behaviour.** If the control plane is down, existing customers keep working; only sign-ups, plan changes and back-office actions pause. A control plane in the request path of normal traffic is a finding (one failure takes every customer down).
- **Security boundary.** The control plane can touch every customer. Put it in its own cloud account, project or subscription, give provisioning roles least privilege, and audit everything.

## Three kinds of user
| User | Example | Scope |
|---|---|---|
| End user | a vet nurse at one practice | inside one customer, within their role |
| Customer admin | the clinic group's practice manager | users, settings and billing details of their own organisation |
| Provider operator | VetFlow support engineer | many customers, only through the back office, with just-in-time elevation and audit |

Provider operators use a workforce identity (separate directory, MFA, short sessions), never an account inside a customer. "View as user" features need customer consent, time limits and a visible audit trail.

## Technology fit
- Control plane: low traffic, high importance, workflow-heavy. Managed and serverless services fit well (functions, a durable workflow engine such as AWS Step Functions, Azure Durable Functions or Temporal, a managed database).
- Serving side: whatever the product needs.
- The two sides do not need the same stack; a Kubernetes serving side with a serverless control plane is common.
- Buy identity and billing; build the catalog and orchestrator, because they encode your plans and placement rules. Open-source and cloud-provider reference implementations exist; treat them as starting points.

## Review checks
- One tenant catalog, or several services each with their own list of customers?
- Can operations see every customer, whatever its placement, in one place?
- Is the control plane off the request path?
- Are provider operators separated from customer identities, with audit?
- Do lifecycle changes travel as events, or as manual steps?
- Does the catalog record the full resource inventory needed for relocation and erasure?

## Worked mini-example — GridShare
Control plane on serverless functions and a workflow engine in its own account. Tenant catalog in a managed document database keyed by `tenant_ref`, mirrored into a graph store for blast-radius and erasure queries. CIAM product holds one organisation per co-op with a `tenant_ref` claim. Meter-reading volumes stream from the serving side as usage events; a daily aggregate goes to the billing platform. The serving side runs as regional shared stamps on Kubernetes; two large co-ops with their own grid-operator contracts get dedicated databases (option B), recorded as placement entries in the catalog.
