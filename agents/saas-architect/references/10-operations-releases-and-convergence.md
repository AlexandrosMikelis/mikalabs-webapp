# Step 10 — Seeing every customer, releasing to all of them, and converging from hosted copies

Use for OPERATIONS in `design`, the operations and migration lenses in `review`, and any request to turn a single-tenant or hosted product into one operated service.

Grounding: OpenTelemetry specification and semantic conventions, the Google SRE material on service level objectives and error budgets, DORA's software delivery metrics, the Azure Architecture Center guidance on deployment stamps and safe deployment practices, Fowler's Strangler Fig application pattern, and MIKA's convergence path below.

## Seeing the service through customers
Infrastructure health alone (CPU, memory, node count) cannot answer the questions that matter in a shared service: which customers does this incident affect, is it only this customer, who is about to hit a limit, which plan consumes what.

### Instrumentation
- Every log line, trace span and usage event carries the customer reference and plan, added by the shared library or sidecar (`08`).
- OpenTelemetry has no stable standard attribute for a SaaS customer; choose a namespaced attribute (for example `app.tenant.ref`) and use it everywhere. Put it on spans and logs; on metrics only where the backend can afford the cardinality.
- With thousands of customers, per-customer metric series get expensive. Keep metrics per plan and per stamp, and get per-customer views from logs, traces or usage events aggregated later.
- Telemetry stores contain cross-customer data: restrict access, and include them in erasure (`04`).

### Signals worth tracking
| Group | Examples |
|---|---|
| Experience | latency and error rate per customer and per plan, against each customer's own baseline |
| Activity | active customers, active users per customer, feature use |
| Consumption | requests, CPU-seconds, storage, jobs per customer and plan |
| Cost and margin | cost to serve per unit (`09`) |
| Lifecycle | sign-ups, provisioning duration and failures, relocations, suspensions |
| Delivery | the four DORA measures: how often you deploy, change lead time, share of changes that fail, recovery time |
| Commercial | trial conversion, falling activity (churn signal), customers near limits (expansion signal) |

### SLOs by plan
Set service level objectives per plan where plans promise different performance, and track error budgets per plan and per stamp. A shared error budget hides the enterprise customer whose dedicated stack has been failing all week.

### One operator view
- Covers every placement: shared stamps, dedicated stacks, regions, customer-hosted parts.
- Views: overall health; health by plan and by stamp; a single customer's health, usage, errors, recent changes and open tickets; provisioning pipeline status.
- Alerts: a customer's errors or latency deviating from its own baseline; customers approaching quotas; failed provisioning; a noisy customer consuming an unusual share.
- Persona views for operations, support, customer success, product and finance over the same data.

## Releasing to every customer
- **One pipeline** deploys to every shared stamp and every dedicated stack, reading targets from the catalog (`03`).
- **Scoped targets**: a change can target everything, one plan, one stamp, or one customer (for example during provisioning).
- **Release rings**: internal customer → a handful of canary customers who opted in → one stamp → stamp by stamp → dedicated stacks. Halt automatically when error budgets burn.
- **Feature flags** per customer or plan expose features gradually and separate deploy from release. Remove stale flags; each one is a branch to test.
- **No version drift**: a dedicated stack that failed to update is retried and visible; it must not quietly stay behind. Allow a short, explicit support window for customer-hosted parts (`02`).
- **Database migrations** are tracked per customer database with expand–contract steps (`07`).

## Converging from hosted copies: the MIKA convergence path
For products that run a separate copy per customer, often on several versions. Each stage has an exit test; do not start the next stage before the current exit test passes.

| Stage | Goal | Main work | Exit test |
|---|---|---|---|
| **C0 Inventory** | know the estate | list every customer environment, version, customisation, integration and contract constraint | inventory complete and owned |
| **C1 Operate as one** | one operating model, whatever the hosting | tenant catalog, identity with customer reference, provisioning workflow, one pipeline and one operator view; existing copies brought under it as dedicated stacks (option D) | single-service test items 2, 3 and 4 pass (`01`) |
| **C2 Converge versions** | one release for all | move customer-specific code into configuration, entitlements or extension points; upgrade every customer to the current release | single-service items 1 and 5 pass |
| **C3 Share where it pays** | lower cost to serve | re-run the fit matrix (`02`) per component; move stateless edges and new features to shared deployments; carve shared services out of the legacy code with the Strangler Fig approach (decomposition depth → **Theseus**) | cost per customer falls; isolation rungs proven (`06`) |
| **C4 Retire bespoke stacks** | finish | decommission dedicated stacks for every segment the matrix places on options A or C; keep dedicated ones only where a gate demands it | item 6 passes; no undocumented dedicated stack remains |

Rules of thumb:
- C1 first, even if the hosting barely changes. A shared database without a control plane is still hosting; dedicated stacks with one control plane are already one service.
- Never freeze the roadmap for a big rewrite. Run convergence alongside feature work and ship new features in the shared target only.
- Rehearse every customer's data move and keep it reversible until verified.
- Measure cost per customer before and after each stage.

### Readiness questions
- How many customers, on how many versions, with how many customisations?
- Can the team release continuously today? If not, that is the first problem to fix.
- Which customers have contractual or regulatory reasons to stay dedicated?
- How will existing user stores join the new identity model: merge, federate, or map (`05`)?

### The non-technical half
Convergence stalls on commercial habits more often than on code. Flag them:
- **Sales**: no more custom builds or version pinning in deals.
- **Pricing and packaging**: plans defined as data (`09`); a migration offer for existing customers.
- **Support and customer success**: customer-level views and health signals.
- **Finance**: revenue recognition changes and cost per customer.
- **Communication**: a timeline for moving existing customers, and a decision on those who refuse.

## Output of this step
```
OPERATIONS: <telemetry attribute and coverage; SLOs per plan; operator views; alerts; release rings; flags; drift control>
CONVERGENCE (if relevant): <current stage C0–C4; next exit test; blockers; non-technical flags>
```

## Review checks
- Can operations see one customer's health across every service and placement?
- Is telemetry tagged with the customer reference, with cardinality handled?
- Are SLOs and error budgets tracked per plan where plans differ?
- Does one pipeline reach every target, in rings, with per-target status and no drift?
- For a converging product: is the control plane (C1) in place before shared components are built?

## Worked mini-example — HarbourLine (continued from `01`)
C0: 35 operators, three versions, 22 customisations (11 are report layouts, 7 fare rules, 4 integrations). C1 (four months): catalog, CIAM with operator organisations, provisioning workflow, one pipeline; all 35 copies brought under it as dedicated stacks; single-service score from 1 to 4. C2 (three months): report layouts and fare rules become configuration, integrations become webhooks; all operators on one release; score 5 (item 6 waits for C3 and C4). C3: fit matrix puts small operators on shared regional stamps; booking and timetable services carved out first with the Strangler Fig approach; manifest storage stays dedicated per operator for the two operators with safety-authority contracts. C4: 29 dedicated stacks retired over two winters; cost per sailing booked fell by about half.
