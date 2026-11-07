# Step 2 — Choosing what to share: the MIKA tenancy fit matrix

Use for the TENANCY MODEL and TIERS fields in `design` and the tenancy lens in `review`. The output is a sharing decision per customer segment and per component, with a score that can be checked.

Grounding: the AWS Well-Architected SaaS Lens (silo, pool and bridge vocabulary), the Azure Architecture Center pages on tenancy models and the Deployment Stamps pattern, the AWS whitepaper on cell-based architecture, and MIKA's own scoring method below.

## Shared words, public origin
The industry already has names for the options. Hestia uses plain MIKA labels and maps them to both major public vocabularies so a reader can check either.

| MIKA option | What it means | AWS SaaS Lens term | Azure Architecture Center term |
|---|---|---|---|
| **A. Shared everything** | One deployment and shared stores serve all customers; separation is by identifier and policy | pool | fully multitenant deployment |
| **B. Shared app, dedicated data** | Shared compute; each customer (or each large customer) gets its own database, schema, bucket or key | bridge | horizontally partitioned deployment |
| **C. Shared stamps** | Several identical copies of option A, each serving a bounded group of customers | pool, replicated into cells | Deployment Stamps pattern |
| **D. Dedicated stamp** | A full, automated copy of the stack for one customer | silo | automated single-tenant deployment |

Most real products mix these by customer segment (Azure calls mixing by segment a vertically partitioned deployment) and by component. Sharing is not the same as isolation: a shared table can be well protected, and a dedicated database reached with broad credentials can still leak (see `06`).

## The five axes
Score the context on each axis from 1 (low) to 5 (high). Score separately for each customer segment that buys differently.

| Axis | 1 | 3 | 5 |
|---|---|---|---|
| **I — Isolation need** | public or low-value data | personal data, ordinary contracts | special-category data, contractual dedication, hostile workloads |
| **K — Cost pressure** | price per customer is high; cost hardly matters | normal B2B margins | free or low-price plans; cost per customer must be tiny |
| **O — Ops constraint** | large platform team, mature automation | average team | very small team, little automation |
| **N — Customer count** | under 20 | 100–1,000 | over 10,000 |
| **R — Compliance pressure** | none identified | GDPR-level duties | sector rules or contracts demand dedicated resources, keys or regions |

Use 2 and 4 for in-between cases. For N the bands are fixed: 1 = under 20, 2 = 20–100, 3 = 100–1,000, 4 = 1,000–10,000, 5 = over 10,000.

## Affinity table
How well each option suits a context as each axis rises. +2 = fits much better as the axis rises; −2 = fits much worse.

| Option | I | K | O | N | R |
|---|---|---|---|---|---|
| A. Shared everything | −2 | +2 | +2 | +2 | −2 |
| B. Shared app, dedicated data | +1 | 0 | −1 | −1 | +1 |
| C. Shared stamps | 0 | +1 | 0 | +2 | +1 |
| D. Dedicated stamp | +2 | −2 | −2 | −2 | +2 |

**Score** = Σ affinity × (axis score − 3). Highest score wins. A gap under 3 points is a tie: choose the cheaper option and add a dedicated variant for the segment that needs it.

## Gates applied before the score
1. **Contract or regulation names a dedicated resource** → that resource is dedicated for that segment, whatever the score (at least option B).
2. **N ≥ 4 for a segment** → option D is not the default for that segment; offer it only as a paid exception.
3. **I ≥ 4 with option A or C** → valid only if the data path reaches rung L3 or higher on the isolation ladder (`06`).
4. **One shared deployment would exceed a hard provider limit** (connections, partitions, accounts, function concurrency) within three years → use option C.
5. **Residency in more than one region** → at least one stamp per region (option C or D), with data, backups and logs inside the region.

## Score per component, not only per product
Run the matrix again for components whose context differs. Typical results:
- Web front end, API layer, notification sender: I low, K high → A.
- Transactional database with personal data: I high → A with rung L2–L3, or B for regulated segments.
- Heavy batch or rendering engine: noisy-neighbour risk → A with fairness controls (`08`), or a dedicated worker pool per plan.
- Search and AI retrieval indexes: shared index with a mandatory server-side filter, or one index per customer (`07`).

Write the result per component and per segment in the tenant catalog (`03`), so routing and deployment can read it.

## Worked example — VetFlow
**Starter and Practice segment** (≈3,900 clinic groups): I=4, K=4, O=3, N=4, R=3.
- A: (−2·1)+(2·1)+(2·0)+(2·1)+(−2·0) = 2
- B: (1·1)+0+0+(−1·1)+0 = 0
- C: 0+(1·1)+0+(2·1)+0 = 3
- D: (2·1)+(−2·1)+0+(−2·1)+0 = −2

C and A tie (gap 1). Decision: option A inside regional stamps of about 800 groups each (that is C). Gate 3 applies: the clinical-record store must reach rung L3.

**Group Enterprise segment** (12 groups): I=5, K=2, O=3, N=1, R=4.
- A: −4 −2 +0 −4 −2 = −12
- B: 2 +0 +0 +2 +1 = 5
- C: 0 −1 +0 −4 +1 = −4
- D: 4 +2 +0 +4 +2 = 12

D wins clearly. Gate 1 confirms (contracts name a dedicated database and customer-managed keys). Check the ops cost: twelve dedicated stamps, all on the same release and pipeline. If the platform team cannot carry that, fall back to B and say which contract clause still holds.

## Stamps: sizing, placement and moves
A stamp (AWS: cell) is a complete deployment unit with a capacity ceiling. Stamps cap blast radius, sidestep provider limits, give a natural unit for regional placement, and let releases roll out one stamp at a time.

Design points:
- **Ceiling**: set it from the tightest limit inside the stamp (database connections, partition throughput, function concurrency), with 30–40% headroom.
- **Placement rule**: which stamp gets a new customer (region first, then fill level, then plan). Record it in the tenant catalog.
- **Request mapping**: a thin, highly available router maps customer → stamp (Azure: "map requests to tenants"). Keep it simple; it is shared by everyone.
- **Moves**: a relocation workflow copies data, switches the mapping, verifies, and cleans up (see `04`). Without one, the first oversized customer becomes an emergency.
- **No drift**: every stamp runs the same release. A stamp that falls behind is a version fork in disguise.

## Parts that run in the customer's environment
Some products must place a component on the customer's side: HarbourLine's quay-side manifest appliance, a GridShare meter-data collector inside a co-op's network, data that contractually stays in the customer's cloud account.
Settle before accepting:
- who owns, pays for and patches the remote part;
- how releases reach it and how far it may lag (a support window, not open-ended);
- how health and usage report back to the control plane;
- what happens if the customer revokes access or the link drops (HarbourLine: manifests keep working offline, then sync);
- whether a regional stamp run by you would meet the need instead. Prefer that when the only driver is residency.

## Review checks
- Is the sharing decision explicit per segment and per component, with a reason?
- Does any segment sit on option A or C with I ≥ 4 but below rung L3?
- Are dedicated parts on the same release, pipeline and provisioning workflow as shared ones?
- Is the blast radius of one shared deployment acceptable, or are stamps needed?
- Have provider limits been checked against the three-year customer count?
- Can a customer move between options or stamps without a new identifier?

## Output of this step
```
TENANCY MODEL: <segment → option A/B/C/D, per component exceptions, score and gates applied>
TIERS: <plan → option, limits, isolation rung, SLO>
STAMPS: <ceiling, placement rule, router, relocation path>
```
