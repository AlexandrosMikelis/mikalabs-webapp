# Step 9 — Plans, usage and what each customer costs to serve

Use for TIERS and METERING & BILLING in `design`, and the tiering and metering lenses in `review`.

Grounding: the FinOps Foundation's FinOps Framework (allocation, unit economics, invoicing and chargeback capabilities), the FinOps Open Cost and Usage Specification (FOCUS) for normalised cost data, cloud-provider cost allocation tagging docs, the AWS Well-Architected SaaS Lens (pricing and metering guidance), and MIKA's plan matrix and cost model below.

## Plans are a product decision with technical duties
Every plan the business sells implies limits, features, performance and placement that the platform must enforce and measure. A plan that exists only on the pricing page is a finding.

### What can differ between plans
| Lever | Example (VetFlow) | Technical duty |
|---|---|---|
| Volume | appointments per month, SMS reminders, storage | accurate metering; quotas; overage rules |
| Features | stock control, lab integrations, multi-practice reporting | entitlements as data; feature checks in services and UI |
| Performance | request rate, priority processing, response-time SLO | gateway limits by plan; priority queues; bulkheads (`08`) |
| Placement | shared vs dedicated database (`02`) | provisioning branches; relocation on upgrade (`04`) |
| Support and assurance | support hours, customer-managed keys, audit reports | operational process; key management (`07`) |

Keep the matrix small: every combination of levers is a configuration to test and support. Three or four plans with clear steps beat a dozen with overlapping options.

### Plans as data
- Define each plan once in the control plane: limits, entitlements, placement option, SLO, billing plan ID.
- Gateways, services and billing read the definition; changes travel as events (`03`).
- Approved per-customer overrides live in the catalog with an owner and expiry, never as code.
- Price changes and new packages should need a data change, not a release.

### Free and trial plans
Very low cost per customer is the requirement: shared everything, tight quotas, automatic clean-up of idle accounts, abuse controls, and a one-click upgrade. A free plan sharing unprotected capacity with paying customers is a High finding (paying customers absorb free-plan spikes).

## Two usage streams, two jobs
| Stream | Used for | Must be |
|---|---|---|
| **Billable usage** | invoices | complete, exactly-once in effect (idempotency keys), auditable, reconcilable; may lag |
| **Operational signals** | dashboards, alerts, capacity | timely, richly dimensioned; sampling acceptable |

Never bill from sampled telemetry. Never drive operations dashboards from the slow billing pipeline.

### Metering pipeline
1. The service that does the work emits a usage event: customer reference, dimension, quantity, timestamp, idempotency key (CloudEvents envelope).
2. A durable stream or queue carries events to an aggregator that deduplicates by key.
3. Aggregates land in a usage store; raw events are retained for disputes.
4. A scheduled job pushes aggregates to the billing platform; a reconciliation job compares totals with source records (for example GridShare: billed meter-readings vs readings stored).
5. Customers see their usage in near real time, with warnings before overage (no bill shock).

### Billing platforms
Usually bought: subscription billing platforms, usage-based billing services, or cloud marketplaces (which add their own entitlement and metering APIs). The control plane creates the billing customer at provisioning, maps plans to billing plans, sends usage, and reacts to billing events: payment failed → restricted or suspended (`04`).

## What does each customer cost to serve?
Without cost per customer, plans are priced blind and the margin of the largest customers is unknown.

### MIKA cost-to-serve model
```
cost(customer) = Σ dedicated_cost(customer)                 # read from tags
               + Σ_service shared_cost(service) × share(customer, service)
               + platform_overhead × weight(customer)        # control plane, tooling
```
- **Dedicated resources**: tag every resource with the customer reference at provisioning; read cost from the provider's billing export by tag. FOCUS-formatted exports make this comparable across clouds.
- **Shared resources**: allocate each service's cost by a measured driver: requests, CPU-seconds, stored gigabytes, or a weighted mix. Pick the driver that best tracks what makes that service expensive.
- **Overhead**: spread control-plane and tooling cost evenly or by revenue share; say which.
- Precision is not the goal; a consistent, explainable model that finance accepts is.

### Choosing the allocation driver
| Service shape | Driver |
|---|---|
| API-heavy, uniform calls | request count |
| Mixed light and heavy calls | CPU-seconds or weighted request classes |
| Storage-dominated | gigabyte-months |
| Queue workers and batch | job-seconds |
| Database shared by everyone | blend of query time and stored rows |

### Unit economics
Turn cost into the unit the business understands: cost per clinic group per month, cost per sailing booked, cost per meter per month. Compare with revenue per unit by plan; this is the FinOps unit-economics capability applied to customers. Typical discoveries: one plan subsidising another, a feature that costs more than its price, a few large customers with thin margins.

## Calibration examples for findings
| Situation | Severity | Why |
|---|---|---|
| Plans sold with different rate limits, but every customer gets the same limits | High | margin and noisy-neighbour risk |
| Enterprise contract promises dedicated performance, served from the shared pool | High | contract breach risk |
| Billing computed from sampled telemetry | High | inaccurate invoices, disputes |
| No idempotency on usage events | Medium | double-billing under retry; raise to High for usage-priced products |
| No cost per customer for a shared product | Medium | priced blind; High when margins are under pressure |
| Plan matrix of 14 combinations, no tests per combination | Medium | support and test load |
| No in-product usage view | Low | bill shock and support tickets |

## Output of this step
```
TIERS: <plan → volume limits, features, performance, placement option, isolation rung, SLO>
METERING & BILLING: <billable dimensions; usage events; pipeline; reconciliation; billing platform>
COST TO SERVE: <tags for dedicated parts; drivers per shared service; overhead rule; unit metric>
```

## Review checks
- Are plans enforced technically, and do premium promises match placement and capacity?
- Are plans defined as data with overrides tracked?
- Is billable usage separate from telemetry, deduplicated, reconciled and auditable?
- Is cost per customer measured, with a stated driver per shared service?
- Can customers see their own usage and limits?

## Worked mini-example — GridShare
Plans: Community (shared, 2,000 meters, 13 months of readings), Co-op Plus (shared, 20,000 meters, 7 years, priority settlement queue), Grid Partner (dedicated database in-region, customer-managed key, custom SLO). Usage events per meter-day flow through a stream into a daily aggregate synced to the billing platform and reconciled against stored readings. Shared ingestion cost is allocated by readings ingested, shared database cost by a blend of stored rows and query time. Unit metric: cost per meter per month, compared with price per meter by plan. The first run showed Community co-ops above 1,500 meters were unprofitable; the business moved the Community ceiling to 1,000 meters.
