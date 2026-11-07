# Step 1 — Pin down the workload and the targets

Every review and every design opens here. Atlas does not judge an architecture until it has numbers for what grows, how fast, and what "good enough" means. If the caller gives no numbers, assume them, write them down, and carry on.

## What exactly is growing?
Name the axis before anything else. Systems that cope well on one axis often fail on another.

| Axis | Ask for | Typical trap |
|---|---|---|
| Request rate | rps at average and at peak, peak shape | Planning for the daily average when the business lives on a 10-minute spike |
| Concurrent connections | open connections, WebSockets, long polls | Memory and file descriptors run out before CPU |
| Write rate | writes/s, rows/s, events/s | Read tricks (caches, copies) do nothing for writes |
| Stored data | GB/TB now, growth per year, retention | Indexes and extra copies double or triple the raw figure |
| Fan-out | downstream calls per request, recipients per event | Rare slowness becomes common slowness |
| Population | tenants, devices, clinics, vessels | One very large member skews every partition |
| Geography | regions, latency to the farthest user | Physics sets a floor no code removes |

A useful sentence for the SYSTEM line: "what it does, the main moving parts, load today → target, on which axis".

## What does "good enough" mean for this system?
Collect or assume four targets. Without them no finding can be rated.
- **Latency target** per user journey, as a percentile: "p99 below 400 ms for seat search".
- **Availability target** as an SLO over a window: 99.9% over 30 days allows about 43 minutes of failure; 99.99% about 4.3 minutes (Google SRE practice, freely published).
- **Freshness / correctness target** per important operation — carried into Step 2 (`02`).
- **Cost target**: cost per unit of work (per booking, per meter reading, per appointment), not total spend.

Availability compounds across a synchronous chain: five dependencies at 99.9% each give at best about 99.5% end to end. Note this whenever a request path is long.

## From people to requests: the arithmetic
Show the sums; mark every assumed input with "(assumed)".
1. **Average rate** = active users × actions per user per period ÷ seconds in the period.
2. **Peak rate** = average × peak factor. Steady consumer traffic: 2–3×. Known flash events (sales openings, schedule releases, billing runs, morning opening hours): 10–100×, and the peak is front-loaded.
3. **Split reads from writes.** They are relieved by different tools: reads by caches and copies, writes by partitioning, batching or doing less.
4. **In-progress work** with Little's law, `L = λ × W` (Little, 1961): work in progress = arrivals per second × time in system. It sizes worker limits, connection limits and queue depths.
5. **Instances per tier** = peak rps ÷ (rps per instance × target utilisation), plus spare for one failure and one deploy (N+2). Use measured per-instance figures when they exist; otherwise state an assumption.
6. **Storage** = records per day × bytes × number of copies × retention, plus indexes (often 30–100% on top).
7. **Bandwidth** = peak rps × payload, both directions. Egress and cross-zone traffic are billed.

### Rough latency ladder
Use as ratios between tiers, not as specifications; measure on the real platform.

| Step | Order of magnitude |
|---|---|
| Memory reference | ~100 ns |
| NVMe random read | ~20–100 µs |
| Network round trip within a zone | ~0.2–0.5 ms |
| Round trip between zones of one region | ~1–2 ms |
| Managed in-memory cache GET, same zone | ~0.3–1 ms |
| Simple indexed database query, same zone | ~1–5 ms |
| Round trip across a continent | ~40–80 ms |
| Round trip between continents | ~100–250 ms |

Every network hop added by a design should earn its place against this ladder.

## Worked example — ferry season release (house example)
A regional ferry operator opens bookings for the summer schedule at 09:00. Last year 120,000 customers arrived in the first 15 minutes (assumed from the caller's figure).
- Each customer makes about 25 requests over 6 minutes (search, deck map, hold, pay) (assumed). Window average: 120,000 × 25 ÷ 900 s ≈ **3,300 rps**. Front-loading gives a peak factor of about 3 in the first two minutes → **~10,000 rps**.
- Writes: roughly 3 hold or booking attempts per customer → 360,000 ÷ 900 ≈ 400 writes/s average, **~1,200/s at peak**.
- API latency 120 ms → in flight ≈ 10,000 × 0.12 = **1,200 requests**.
- One instance handles 500 rps (assumed); at 60% target utilisation that is 300 rps → 34 instances, plus 2 spare.
- The deck inventory row for each sailing is locked for about 5 ms per hold (assumed), so one sailing can serialise at most ~200 holds/s. The Friday 17:30 car-deck sailing draws about 30% of attempts → ~360/s. **First bottleneck: a single hot inventory row, at about half of peak**, long before CPU or instance count matters. The fix belongs in the store layer (`04`, inventory split into deck blocks or pre-issued hold tokens) and at the edge (`08`, an admission queue), not in more API instances.

The lesson: the arithmetic is cheap, and it usually points at a shared, serialised resource rather than at the stateless tier.

## How does cost behave as load rises?
- Track **cost per unit of work** next to latency. Total spend rising with success is fine; unit cost rising with load is a finding.
- Grows faster than load: cross-zone and cross-region traffic, coordination overhead, per-request pricing at sustained high utilisation, log and metric volume, premium service tiers, over-replicated storage.
- Grows slower than load: committed capacity, caches serving a concentrating hot set, batching.
- Autoscaling maximums are a cost control and a downstream-protection control. Know what happens when one is hit.
- Over-provisioning for a short, predictable peak is legitimate when engineering time costs more than idle machines. Say so when it is the honest answer.

## Which other qualities pull against scale?
- **Latency**: copies and proxies add hops; async shortens the acknowledgement but lengthens completion.
- **Availability**: extra copies help only if they fail independently and failover is automatic and tested.
- **Security and privacy**: more copies of data, more secrets to distribute, more places personal data lives.
- **Operability**: every queue, cache and partition map needs dashboards, runbooks and someone who understands it. A design the team cannot run does not scale in practice.

## Intake checklist
- [ ] Growth axis named, with today → target figures
- [ ] Peak shape known (steady, daily curve, flash) and peak factor chosen
- [ ] Read/write split estimated
- [ ] Latency, availability, staleness and cost targets written down
- [ ] Where state lives and how it is copied
- [ ] Platform, autoscaling, team size and skills
- [ ] Every assumption carries a number and appears under ASSUMPTIONS
