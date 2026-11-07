# Step 6 — How is one customer kept from reaching another's data?

Use for the ISOLATION field in `design` and the isolation lens in `review`. Isolation findings are usually the most severe in a review.

Grounding: OWASP API Security Top 10 2023 (API1: Broken Object Level Authorization is the usual shape of a cross-customer leak), the OWASP Cheat Sheet Series guidance on multitenant security, the PostgreSQL documentation on row security policies, AWS IAM documentation on attribute-based access control and session tags, the Kubernetes documentation page "Multi-tenancy", and MIKA's isolation assurance ladder below.

## What isolation means
Code acting for customer X **cannot** reach customer Y's resources, not merely does not. The guarantee comes from a mechanism outside the business logic, so one developer mistake (a missing filter, a cache key without the customer reference) is contained.

It is easy to confuse with four neighbours:
- **Not the sharing choice.** A shared table can be well isolated; a dedicated database reached with an all-customers credential is not.
- **Not authentication.** A token says who and for which customer (`05`); isolation enforces that on every resource access.
- **Not in-customer authorisation.** Roles decide what a user may do inside their organisation. Isolation is the boundary between organisations. A design needs both.
- **Not fairness.** Performance interference is a separate concern (`08`).

## The MIKA isolation assurance ladder
Each rung adds an independent control. A data path's rung is the highest rung that is **proven** by evidence, not the highest one claimed.

| Rung | Name | What enforces the boundary | Survives a missing filter in one query? | Evidence that proves it |
|---|---|---|---|---|
| **L0** | Convention | Each developer writes the filter by hand | No | none possible |
| **L1** | Central guard | A shared data-access layer or middleware adds the customer filter and refuses unscoped queries (fails closed) | Yes, if all access goes through it | unit tests that call without context and expect failure; a lint rule or architecture test banning raw access |
| **L2** | Store-enforced | The store checks every row or object: PostgreSQL row security with `FORCE`, a DynamoDB `dynamodb:LeadingKeys` condition, an S3 prefix condition, search document-level security | Yes, even for raw queries | cross-customer tests against the store with the application's own role |
| **L3** | Scoped credential | The service holds no standing access to all customers; per request it gets short-lived credentials limited to one customer (ABAC with session tags, a per-customer database role, a narrowed internal token) | Yes, even if the service is compromised mid-request for another customer | policy tests; proof that the service role alone cannot read data |
| **L4** | Dedicated resource | Separate database, schema, bucket, index or encryption key per customer, reached only with credentials for that resource | Yes | inventory shows one resource per customer; credentials scoped to it |
| **L5** | Dedicated boundary | Separate cloud account, project or subscription, network and, where relevant, cluster | Yes, including most misconfigurations inside one account | account-level policy and network tests |

L1 is a good engineering habit but not a boundary on its own: anything that bypasses the layer (a report script, an ad hoc migration, a new service in another language) is back at L0.

## Which rung is required?
| Data on the path | Required rung | Example |
|---|---|---|
| Public or low-value data | L1 | VetFlow species catalogue |
| Ordinary business or personal data | L2 | HarbourLine bookings, GridShare member contact details |
| Special-category, health, financial, credentials, or isolation axis I ≥ 4 (`02`) | L3, or L4 | VetFlow clinical notes and controlled-drug registers; GridShare members' bank details |
| Contract names a dedicated resource, key or account | L4 or L5 as written | VetFlow Group Enterprise databases |

**Rating a gap**: one rung below required → Medium for ordinary data, High for sensitive data. Two or more rungs below → High, or Critical for sensitive data or when a known bypass exists. A customer reference taken from a client-settable value is Critical regardless of rung, because every rung is then enforcing the wrong customer.

## Getting to L2 in PostgreSQL
- `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` **and** `FORCE ROW LEVEL SECURITY`; table owners bypass policies unless forced.
- The application role is not a superuser and has no `BYPASSRLS`.
- A policy per table compares the row's customer column to a session setting, for example `USING (tenant_ref = current_setting('app.tenant_ref', true)::uuid)`, with a matching `WITH CHECK` so writes cannot plant rows in another customer.
- Set the value with `SET LOCAL` inside each transaction, so it cannot leak to the next borrower of a pooled connection (important with transaction-mode connection poolers). If the setting is missing, `current_setting(..., true)` returns null and the policy matches nothing; once the setting has been used earlier in the session it may return an empty string instead, and the cast to `uuid` raises an error. Either way it fails closed; test both cases.
- Put the customer column first in composite indexes; policies add a predicate to every query.

## Getting to L3
- **Cloud object and key-value stores**: the service assumes a role per request with the customer reference as a session tag; the role policy allows only resources or keys matching that tag (`${aws:PrincipalTag/...}` in AWS policies; equivalent conditions exist on other clouds). Cache the credentials per customer for their short lifetime.
- **Relational**: one database role per customer (practical for hundreds, not tens of thousands), or keep L2 and add L3 only for the most sensitive tables.
- **Internal services**: an RFC 8693 token exchange that narrows the audience and carries one customer reference; the downstream service checks it against the resource.
- Keep the credential-vending component small, separately deployed, audited and well tested. It is a high-value target.

## Apply the ladder to every layer
1. **Edge**: token validation; host hint matches the claim; per-customer rate limits.
2. **Compute**: dedicated deployments, or shared compute that gets scoped credentials per request.
3. **Stores**: rungs as above, per store.
4. **Caches**: customer reference in every key (`t:{tenant_ref}:...`); a separate namespace or instance for sensitive data. Caches are a frequent leak.
5. **Queues and jobs**: per-customer job execution with scoped credentials. A nightly job over all customers under an all-powerful role is High on its own.
6. **Files and exports**: temporary files, generated reports and pre-signed URLs scoped per customer and short-lived.
7. **Logs, analytics, data warehouse**: customer data in telemetry and analytics needs access control and the same erasure path.
8. **AI features**: retrieval indexes, vector stores, conversation memory and fine-tuning data filtered per customer on the server side. A shared vector index queried without a mandatory filter leaks one customer's documents into another's answers.
9. **Customer-supplied code** (plugins, scripts, custom reports): treat as hostile. Sandboxed runtimes (gVisor, Kata Containers, Firecracker micro-VMs) or dedicated clusters, never shared nodes with plain namespaces.

## Make the safe path the easy path
Developers should not have to remember isolation:
- a shared library or middleware that reads the verified context and returns pre-scoped data clients;
- data-access layers that refuse unscoped queries;
- gateway plugins or sidecars that inject verified context;
- policy as code (Open Policy Agent with Rego, Cedar) for authorisation decisions, versioned and tested like code;
- build checks that fail on raw database access outside the shared layer.

Keep the shared layer thin and stable: a bug there reaches every service and every customer.

## Policies at scale
- Generate policies from templates with the customer reference as a variable; one dynamic policy beats one policy per customer (provider limits on policy count and size).
- Review policy changes like code; keep them in version control.
- Least privilege for operator tools; break-glass access with approval, time limit and audit.

## Proving it
- **Cross-customer suite in CI**: two synthetic customers, A and B. With A's credentials, try to read, list, search, update, delete and export B's data through every API, job and file path. Every attempt must fail.
- **Fail-closed tests**: data-layer calls with no customer context must error.
- **Policy tests**: unit tests for row security policies and IAM conditions.
- **Periodic review** of every component that runs with cross-customer privileges.
- Cross-customer scenarios in threat models and penetration tests (depth → **Argus**).

## Output of this step
```
ISOLATION
  Edge: <token validation, host–claim check, per-customer limits>
  <component/store> — <option A–D> — required rung <Lx> — proven rung <Ly> — mechanism — evidence
  Caches / jobs / files / telemetry / AI: <how scoped>
  Safe path: <library, middleware, policy engine, build checks>
  Proof: <cross-customer CI suite, fail-closed tests, policy tests>
```

## Worked mini-example — VetFlow clinical records
Shared PostgreSQL per stamp. Required rung: L3 (clinical notes, controlled drugs). Current state: a repository layer adds `WHERE tenant_ref = ?` (L1 proven), row security enabled on 31 of 34 tables without `FORCE`, and the service connects as the table owner, so in practice the store enforces nothing: proven rung L1. Findings: Critical — sensitive clinical data two rungs below required; Medium — three tables without policies. Fix: new application role without ownership or `BYPASSRLS`, `FORCE ROW LEVEL SECURITY` on all tables, `SET LOCAL` per transaction from the shared data library; for attachments in object storage, per-request session-tagged credentials limited to the group's prefix (L3). Evidence: the cross-customer suite extended to raw SQL with the application role.
