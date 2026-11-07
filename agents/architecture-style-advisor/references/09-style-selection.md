# Choosing a style: the `design` procedure and the style-fit scoring sheet

Use for every `design` request. It turns requirements into a recommended shape, a trade-off table and an ADR. Each step fills a field of the SKILL.md template.

## Step 0 — What are the facts?
Extract or assume: purpose and users; scale (users, transactions, data volume, growth); peaks and their shape; geography; integrations; regulatory exposure; team size, number of teams and skills; operations capability; budget and deadline; systems that must stay. Record assumptions in `ASSUMPTIONS:`. Never block; list the unknowns that would change the choice under `OPEN QUESTIONS:`. The elicitation script in `03` is the checklist.

## Step 1 — Which drivers? (`DRIVERS:`)
Two to five business drivers, each written as outcome → implied qualities ("release fare changes weekly to match competitors → deployability, testability").

## Step 2 — Which quality targets? (`CHARACTERISTICS:`, `IMPLICIT:`)
Apply `02`: split umbrella words, score Stakes and Structural pull, give each a measure, keep five to seven, mark three `[top]`. List assumed qualities separately. Name conflicts inside the top three. Note any parts whose profile differs sharply — candidates for separate autonomy units.

## Step 3 — Which constraints? (`CONSTRAINTS:`)
Team, time, money, platform, regulation, existing estate (`03`). Team size and operations capability decide most distributed options; state them even when assumed.

## Step 4 — Which components? (`COMPONENTS:`)
Apply `04`: discover with at least two methods (capability decomposition, change-axis analysis, event-storming-derived grouping), reconcile, avoid CRUD-wrapper and dumping-ground components, give each a one-line responsibility and its key coupling, tag distinct quality needs.

## Step 5 — Split by role or by capability? (`PARTITIONING:`)
Apply the A1 decision rule in `06`. Most business systems with more than one team benefit from a capability split.

## Step 6 — One deployable or several?
Ask in order; the first strong "yes" usually points to several deployables for at least part of the system:
1. Does a top-3 target need **one part to scale or burst on its own**?
2. Does a top-3 target need **one part to keep running when another fails**?
3. Must **several teams release independently** at different rhythms?
4. Do parts need **different technology stacks or security zones**?
If all are "no", or constraints (small team, low operations maturity, tight budget) dominate, prefer a single deployable — built so it can evolve (capability modules, enforced boundaries, schema per module).

## Step 7 — Which 3–4 candidates?
Always include:
- the **simplest shape that could work** (often modular monolith, sometimes layered);
- the shape that best delivers the top-3 mechanisms (table below);
- a **combination** if parts have different profiles.
Leave out shapes that clearly break a hard constraint, except for one line saying why.

## Which mechanism does each top target need?
Pallas does not rate styles in the abstract. It asks what *mechanism* a target needs, then which candidate shapes provide that mechanism for this system.

| Top target | Mechanism it needs | Shapes that can provide it | Shapes that fight it |
|---|---|---|---|
| Low cost, simplicity | few deployables, little infrastructure, one runtime | modular monolith, layered | many fine-grained services; replicated in-memory grids |
| Speed to first release | minimal platform work before value | modular monolith or layered | anything needing CI/CD, mesh and tracing first |
| Change speed with several teams | business changes stay inside one owned part; independent releases as teams grow | modular monolith (few teams) → service-based → microservices (many teams) | layers that every change cuts through |
| Configurability per customer or region | variation isolated behind a stable contract | microkernel, plug-ins inside a module | conditionals scattered through core code |
| Burst elasticity | hot path scales alone; database out of the request path; queue in front | queue-fronted extracted service, event-driven intake, space-based hot path | one shared database in the request path; whole-app scaling |
| Steady horizontal growth | scale busy parts only; data split along load | service-based, microservices, event-driven | one database past its ceiling |
| Perceived responsiveness | acknowledge fast, finish later | event-driven or async processing | long synchronous chains |
| Fault isolation | bulkheads between parts; no shared failure point | any networked shape with timeouts, circuit breakers, owned data | single process; shared database |
| Strong consistency | local ACID transactions | single deployable; service-based with area-owned transactions | choreographed events; data spread across many services |
| End-to-end testability | few moving parts, deterministic flows | single deployable, service-based | event-driven, space-based |
| Extensibility (new consumers or features) | add subscribers or plug-ins without touching producers or core | event-driven, microkernel | point-to-point synchronous integration |
| Long-term evolvability | boundaries cheap to move | modular monolith, splitting later | early fine-grained services |
| Transformation throughput | ordered one-way steps | pipeline or stream processing | request/response shapes |

## Step 8 — The trade-off table (`CANDIDATES:`)
One row per candidate:
- **Supports** — which top-3 (and other listed) targets it serves *for this system*, and through which mechanism.
- **Strains** — which targets it works against or makes costly, and why.
- **Cost & complexity** — build, run, operational load, skills.
- **Fit** — Strong / Moderate / Weak, with a few words.
Write reasons tied to this system's components and loads; no generic claims.

## The style-fit scoring sheet (cross-check)
A MIKA cross-check, filled in for the system at hand — never a fixed rating of styles. Use it to test the table's verdict and to make close calls explicit. Show it when the caller asks, when two candidates are close, or in `FORMAT: structured` as `scoring`.

**1. Hard-constraint gate.** For each candidate, does it break any hard constraint (team cannot operate it, run cost over the ceiling, mandated platform, regulation)? Any "yes" → **excluded**, with the reason. No score can buy it back.

**2. Target fit.** For each `[top]` target, score how well the candidate's mechanism delivers it *here*:
- +2 delivers it structurally, with little extra work
- +1 delivers it with known extra patterns (a cache, a queue, a bulkhead)
- 0 neutral
- −1 works against it; needs significant compensation
- −2 structurally blocks it
Weight by agreed priority: first-ranked ×3, second ×2, third ×1. If the caller agreed the three but not their order, weight all ×2.

**3. Load on the team.** Score the operational and cognitive load against the stated capacity: 0 (well within), −1 (stretching), −2 (beyond, but not a hard break).

**4. Reversibility.** +1 if the candidate keeps the main boundaries cheap to move later; 0 otherwise.

**Total** = weighted target fit + load + reversibility.

**Decision rules.**
- Highest total wins, unless the runner-up is within **2 points** and is simpler (fewer deployables, fewer styles); then choose the simpler and set a revisit trigger for the other.
- A candidate with any −2 on the first-ranked target cannot be recommended, whatever its total.
- If the scoring sheet and the reasoned table disagree, say so, find which assumption causes it, and list that assumption as an open question.

**Sheet format**
```
Candidate            | Gate | T1×3 | T2×2 | T3×1 | Load | Rev | Total
Modular monolith     | ok   | ...  | ...  | ...  | ...  | ... | ...
```

## Step 9 — Recommend (`RECOMMENDATION:`, `DATA TOPOLOGY:`)
State the shape (or combination), why it wins on the top three, and **what is given up**. Pick the data ownership option (A4 in `06`) that fits the shape and the consistency needs. When two candidates are close, choose the simpler and set a trigger.

## Step 10 — Record it (`ADR:`)
Use the template in `05`: title, status (Proposed), context including rejected candidates, decision with reasons, consequences (positive and negative), governance (how compliance is checked; triggers), notes.

## Step 11 — Risks and triggers (`RISKS & TRIGGERS:`)
For each main risk: what could go wrong, the early-warning signal, and the condition for revisiting. Hand off where depth lives elsewhere: fitness functions → **Chronos**; decomposition or migration → **Theseus**; capacity and scaling → **Atlas**; capability boundaries → **Gaia**.

## Step 12 — Confidence (`CONFIDENCE:`)
High: facts given and the top three point clearly to one shape. Medium: key facts assumed, or two candidates close. Low: scale, team or top targets are guesses.

## Heuristics
- **Simplest viable first** (P5). Distribution must be paid for by a top-3 target and by the organisation's ability to run it.
- **Mixed profiles → mixed shapes, minimally.** Extract only the part with the distinct profile.
- **Teams cap the topology.** Roughly one team per group of services; a small team running many services spends its time on plumbing.
- **Data decides more than code.** If the data cannot be split cleanly, services will not be independent.
- **Uncertain domain → cheap boundaries.** Modules before services.
- **Always name the trigger.** Load, team count, new market, or a failed measurement.

## Mistakes to avoid in `design`
- Defaulting to microservices.
- Ignoring operations capability and budget.
- Marking every quality as critical.
- Comparing styles in the abstract instead of for this system's components and loads.
- Forgetting data ownership and reporting.
- An ADR without negative consequences.

## Worked example (house, abbreviated)
System: regional ferry operator's booking platform. Top 3: Elasticity [top] (30× spike when summer sailings open), Availability [top] of ticket sales during the spike, Low run cost [top] (6 developers, no platform team). Order agreed: elasticity, availability, cost.

| Style | Supports | Strains | Cost & complexity | Fit |
|---|---|---|---|---|
| Modular monolith | cost, simplicity, consistent seat and car-deck holds | elasticity on release day: whole app scales; one fault stops sales | Low | Weak alone |
| Modular monolith + extracted queue-fronted ticket-sales service | elasticity and availability on the sales path; cost elsewhere | two deployables; async hold confirmation; eventual consistency with the back office | Moderate | Strong |
| Microservices | elasticity, fault isolation | cost and operations load for 6 people; many services to own | High | Weak |
| Space-based hold engine only | extreme elasticity, in-memory speed | complexity, collision handling, realistic spike testing | High | Moderate — revisit above 100× |

Scoring cross-check:
```
Candidate                         | Gate        | T1×3 | T2×2 | T3×1 | Load | Rev | Total
Modular monolith                  | ok          | −1×3 | −1×2 | +2×1 |  0   | +1  | −2
Monolith + queue-fronted sales    | ok          | +2×3 | +1×2 | +1×1 | −1   | +1  | +9
Microservices                     | excluded: 6 devs, no platform team cannot run it
Space-based hold engine           | ok          | +2×3 | +1×2 | −1×1 | −2   |  0  | +5
```
Recommendation shape: "Modular monolith with an extracted, queue-fronted ticket-sales service. It gives elasticity and availability on the sales path while keeping cost and operations low. We give up a single deployable and accept asynchronous confirmation of holds. Revisit a space-based hold engine if peak concurrency passes 100× baseline."
