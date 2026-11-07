# Step 4 — From sign-up to erasure: lifecycle workflows

Use for the ONBOARDING & LIFECYCLE field in `design` and the onboarding lens in `review`.

Grounding: the Azure Architecture Center page on tenant lifecycle considerations, the AWS Well-Architected SaaS Lens (onboarding guidance), the documentation of durable workflow engines (AWS Step Functions, Azure Durable Functions, Temporal), GDPR Article 17 for erasure duties (flag only), and MIKA's state model and readiness checklist below.

## The baseline comes first
Before the first customer exists, infrastructure as code builds the baseline: control plane, shared serving infrastructure for each stamp, identity configuration, telemetry and pipelines. The same code must stand up staging, test and a new region on demand. Provider operator identities belong to the baseline and stay apart from customer identities (`03`).

## One lifecycle, many entry points
Self-service sign-up and sales-led contracts call the **same** provisioning workflow. "Assisted" may add an approval step; it must never mean manual. Self-service paths add abuse controls (email verification, payment-method check, sign-up rate limits, disposable-domain lists).

## MIKA lifecycle state model
```
requested ─▶ provisioning ─▶ active ─▶ suspended ─▶ active
                 │              │           │
                 ▼              ▼           ▼
              failed       relocating   retiring ─▶ retired (tombstone)
```
- Every transition is a workflow with named steps, recorded in the catalog with timestamps and reason codes.
- `failed` always names the step and keeps the partial inventory so cleanup is possible.
- `retired` keeps a tombstone: the opaque reference, dates, and the erasure evidence. The reference is never reused.

## Creating a customer
A typical workflow (adapt per product):
1. **Register**: allocate `tenant_ref`, write plan, region and status `provisioning` to the catalog.
2. **Identity**: create the organisation in the identity provider, invite the first admin, set the claim mapping (`05`). For enterprise customers, create the federation connection in a pending state.
3. **Place**: choose the stamp by the placement rule (`02`); record it.
4. **Build resources by option**: option A — seed rows and default configuration only; option B — create the dedicated schema, database or bucket and its key; option D — run the complete stack template.
5. **Apply entitlements and limits** from the plan definition.
6. **Billing**: create the billing customer and subscription.
7. **Activate**: status `active`, emit `tenant.created`, send the welcome.

Run it in a durable workflow engine, not inside one HTTP request. Option A finishes in seconds; option D may take tens of minutes and must report progress.

## Making steps safe to repeat
- Every step is **idempotent**: keyed by `tenant_ref` and step name, so a retry finds and reuses what exists.
- Retries with exponential backoff and a ceiling; then `failed` with an alert.
- Compensation for steps that cannot be retried: delete the half-made database, disable the half-made organisation. This is the saga pattern applied to provisioning.
- **No zombies**: never leave a customer who can sign in but has no data store, or a data store with no catalog record. A nightly reconciliation compares the catalog inventory with what actually exists (cloud tags, identity provider, billing) and reports differences.

## Readiness checklist for a provisioning workflow
| Check | Evidence |
|---|---|
| Same workflow for every plan and entry point | one workflow definition with plan branches |
| Steps idempotent | retry test per step |
| Inventory recorded | every created resource in the catalog with its region and key |
| Failure visible | state, failed step and reason shown to operations and to the customer admin |
| Burst tested | load test of a sign-up campaign and of a bulk import of existing customers |
| Limits checked | quota headroom for the next N customers (identity organisations, databases, accounts) |
| Reversible | retirement of a test customer leaves nothing behind (reconciliation is clean) |

## Suspending and resuming
Reasons: unpaid invoice, abuse, trial end, customer request, legal hold.
- Effect: block sign-in or switch to read-only, stop billable usage, pause scheduled jobs; keep data.
- Enforce at token issuance and at the gateway, and in background workers that act for the customer. A suspended customer whose nightly jobs still run is a common miss.
- Resuming is instant and lossless.
- HarbourLine nuance: an operator suspended for non-payment during the sailing season still needs read access to today's passenger manifests for safety. Model "restricted" as a distinct effect, not as full suspension.

## Changing plan
- A plan change may only flip entitlements and limits (fast), or may move placement (for example option A → B when a clinic group upgrades to Group Enterprise).
- A placement move is a **relocation workflow**: provision target, copy data, replicate or briefly pause writes, switch the mapping in the catalog, verify counts and checksums, clean up the old location after a grace period.
- The customer keeps its `tenant_ref`, URLs and integrations. Tokens carrying stale placement claims must expire or be refreshed (`05`).
- Downgrades reverse the path and must check that data fits the lower plan's quotas first.

## Moving between stamps
The same relocation workflow handles rebalancing: a GridShare co-op that grows from 2,000 to 60,000 meters outgrows its stamp's partition throughput. Rehearse relocation regularly on test customers; the first real move should not be the first run.

## Retiring a customer
1. Grace period from contract end, with the customer admin warned.
2. Export if promised (format and timeline in the contract).
3. Erase or archive per retention policy: every shared table row, object, search document, vector entry, cache key, analytics copy and log index holding the customer's data; dedicated resources deleted whole.
4. Backups: either expire within the stated retention window, or use per-customer encryption keys and destroy the key (crypto-shredding). Say which, and flag erasure duties under GDPR Article 17 and contract clauses for compliance confirmation.
5. Remove identity organisation, federation connections and API credentials; close billing.
6. Write the tombstone with erasure evidence.

The resource inventory recorded at creation is what makes complete retirement possible. Without it, retirement becomes a search.

## Output of this step
```
ONBOARDING & LIFECYCLE
  Entry: <self-service | sales-led> → one workflow (<engine>)
  Steps: register → identity → place → resources by option → limits → billing → activate
  Per plan: <plan: what is built, expected duration>
  Failure: <idempotency, retries, compensation, reconciliation>
  Suspend: <triggers, effects, enforcement points, restricted mode if needed>
  Plan change / relocation: <path, cut-over, verification>
  Retire: <grace, export, erasure scope incl. backups, evidence>
```

## Review checks
- Is provisioning automated for every plan, through one workflow?
- Are steps idempotent, with compensation and a reconciliation job?
- Is the full inventory recorded?
- Do suspension effects reach background jobs?
- Can a customer change plan or stamp without a new reference?
- Does retirement reach every copy, including backups, search, vectors and logs?

## Worked mini-example — VetFlow
Starter sign-up: register, organisation in the CIAM product, first admin invited, placement in stamp `eu-west-2`, seed species and vaccine catalogues, Starter limits, billing subscription, active in about eight seconds. Group Enterprise (sales-led, approval step): additionally a dedicated PostgreSQL database and a customer-managed key, federation to the group's Microsoft Entra ID tenant in pending state; about fifteen minutes with progress shown in the back office. Upgrade Practice → Group Enterprise runs the relocation workflow: logical replication of the group's rows into the new database, mapping switched at a quiet hour, shared rows removed after seven days.
