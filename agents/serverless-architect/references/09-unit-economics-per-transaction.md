# Step 9 — Unit economics: what one transaction costs

Use for the `COST SHAPE` field in `design` and the unit-economics lens in `review`. The aim is one number per business transaction (per booking, per imaging study, per meter-read file) that can be set against what the transaction earns and tracked month by month.

Grounding: the FinOps Foundation's unit economics guidance and the FOCUS specification for billing data, the public price lists of AWS, Azure and Google Cloud, the Green Software Foundation's Software Carbon Intensity specification (ISO/IEC 21031:2024), and MIKA's cost-per-transaction model below.

**Prices are indicative list prices for one AWS Region (us-east-1), read in late 2026, without free allowances or discounts. They change and differ by Region and provider. Tell the caller to confirm them with the provider's price estimator.**

## What does each unit of work cost?
| Driver | Billing unit (AWS names in brackets) | Indicative list price |
|---|---|---|
| Function calls | per invocation | $0.20 per million |
| Function run time | GB-seconds: memory × duration, now including initialisation for on-demand functions (since August 2025; verify) | about $0.0000167 per GB-s on x86, about $0.0000133 on Arm |
| API requests | per request (HTTP API / REST API) | about $1.00 / $3.50 per million at the first tier |
| Published events | per event, in 64 KB chunks | $1.00 per million |
| Queue operations | per request; send, receive and delete each count (SQS) | about $0.40 per million standard, $0.50 FIFO |
| Long-running workflow | per state transition | $0.025 per 1,000 |
| Short workflow | per request plus GB-seconds | $1.00 per million plus about $0.0000167 per GB-s |
| Key-value table, on demand | per read and write unit (DynamoDB) | about $0.125 per million reads, $0.625 per million writes (after the November 2024 reduction; verify) |
| Logs | per GB written, then per GB-month kept | about $0.50 per GB written (standard class) |
| Outbound internet from a private network | NAT gateway per hour plus per GB | about $0.045 per hour and $0.045 per GB |
| Monthly fixed items | secrets, keys, alerts, dashboards, pre-warmed or always-ready capacity | billed whatever the traffic |

Azure Functions Flex Consumption charges per execution and per GB-second, plus always-ready instances; Cloud Run charges vCPU-seconds, GiB-seconds and requests, or a per-instance rate. The shape is the same; the units and prices are not. Never carry one provider's prices to another.

## The MIKA cost-per-transaction model
**CPT = Σ (units of driver *i* per transaction × price of *i*) + (monthly fixed floor ÷ monthly transactions) + shared platform cost per transaction**

1. Follow one transaction across the system map (`01`) and count units per driver: calls and GB-seconds per function, API requests, events, queue operations (three per message), workflow transitions, table reads and writes, kilobytes of logs.
2. Price each line and keep the sheet in the design so anyone can check it.
3. Add the floor: monthly fixed items divided by expected monthly volume. At low volume the floor usually dominates; say so.
4. Spread shared platform cost (central logging, networking, security tooling) by a stated key, such as share of calls.
5. Compare with revenue or value per transaction. The ratio, not the absolute bill, tells you whether the shape is healthy.
6. Tag every resource with service, owner and environment; export billing data (FOCUS format where offered) and recompute CPT monthly from real usage.

## Worked example: one ferry booking
| Line | Units | Cost |
|---|---|---|
| API request | 1 | $0.0000010 |
| Function calls | 3 | $0.0000006 |
| Function run time | 3 × 0.2 s × 0.5 GB on Arm = 0.3 GB-s | $0.0000040 |
| Table writes / reads | 4 / 6 | $0.0000025 + $0.0000008 |
| Events | 2 | $0.0000020 |
| Queue operations | 3 | $0.0000012 |
| Logs | 6 KB | $0.0000029 |
| **Subtotal before the workflow** | | **≈ $0.000015** |
| Long-running workflow | 12 transitions | $0.000300 |
| **Total** | | **≈ $0.000315 per booking (≈ $0.32 per 1,000)** |

Reading the sheet: the per-transition workflow is about 95% of the variable cost. The booking steps finish in about 2 seconds, so the short workflow type (1 request plus about 0.125 GB-s at 64 MB for 2 s ≈ $0.000003) brings the total near **$0.018 per 1,000 bookings**. Keep the per-transition type for parts that wait hours (refund approvals) or need exactly-once steps with full history. At 400,000 bookings a month the variable cost is small either way, and one NAT gateway (about $33 a month before data) or pre-warmed capacity left on all night can outweigh it. At low volume look at the floor first; at high volume, at the per-transaction lines.

## When do containers cost less than functions?
Compare like with like on the component's real load, then add the people cost of running each option.

Illustration (late-2026 list prices, verify): a steady 50 requests per second, 0.2 s each, at 1 GB on Arm functions is about 25.9 million GB-s (≈ $346) plus 130 million calls (≈ $26): about **$370 a month**. Two Arm container tasks of 1 vCPU and 2 GB on a managed container service, each serving several requests at once, cost about $57 a month plus a load balancer (roughly $16 plus capacity units): roughly **$80–100**. For a flat, busy, I/O-bound load, containers that serve many requests per instance win on the bill. Functions win when the component is idle most of the day, when the team would otherwise patch and scale a cluster, or when bursts would force containers to be oversized.

Rule of thumb: when a function's busy time (concurrency × hours) fills a large part of every hour and the curve is flat, run this comparison and record it. Gate 3 of the fit score (`01`) sends you here.

## Where does the money leak?
- Log volume: debug output at scale, no retention period, metrics with high-cardinality labels.
- Functions inside a private network reaching public endpoints through a NAT gateway; use private endpoints or keep the function outside the network.
- Self-triggering storage and runaway retries (`06`).
- Memory far above need; pre-warmed capacity left on around the clock.
- Polling where a push notification exists; batch size 1 on busy queues and streams.
- Item-by-item workflow transitions on large fan-outs instead of batched child runs.
- Cross-Region and internet transfer.
- Forgotten experiments; enforce tags and expiry dates on sandbox accounts.

Controls: a budget per account and service, anomaly alerts on spend, a monthly CPT trend per key journey, and a named owner for any line growing faster than volume.

## Footprint per transaction
The Software Carbon Intensity (SCI) specification gives a rate, not a total: **SCI = ((E × I) + M) per R**, with E the energy used (kWh), I the grid intensity where it ran (gCO₂e per kWh), M the embodied share of the hardware, and R the functional unit. Use the same business transaction as R that the CPT model uses.

Managed platforms do not report E or M per request. Estimate instead: take the monthly figures per service and Region from each provider's footprint report (all three publish one; note the method and the delay), spread them over journeys with the CPT drivers, divide by transaction count, and track the trend rather than the third decimal.

Most levers also cut the bill: Arm processors, right-sized memory, filtering before invocation, shorter retention, no polling, grouped non-urgent work, and, where residency allows, a Region with a cleaner grid or a later start for deferrable jobs. The co-op's month-end settlement run has no fixed start, so it can be scheduled into cleaner hours.

## Output in `design`
`COST SHAPE` lists the drivers per service, the CPT sheet for the main journey, the monthly floor, the lines most likely to grow (logs, workflow transitions, data transfer), and what to confirm in the price estimator. Add one line on footprint when the caller asks or when a change is free.

## Signals for the review
- Nobody knows the cost per transaction or the main drivers → Medium.
- Per-transition workflow with many steps per item at volume → Medium; High when it threatens the business case.
- NAT gateway on a busy function path, logs kept forever, or debug logging at volume → Medium.
- Self-triggering storage or unbounded retries → High (`06`).
- No budgets, spend alerts or tags → Medium.
