# Quality targets: shortlisting, measuring and ranking

Use in `design` (step 2 of `09`), in `review` (step 1 of `10`) and for any question about quality attributes, non-functional requirements or "-ilities". Input comes from the intake in `03`; output fills `CHARACTERISTICS` and `IMPLICIT`.

## What counts as a quality target here?
A quality attribute describes *how well* the system does its job, not *what* job it does. "Book a ferry crossing" is a function; "confirm a booking in under two seconds while holiday sailings are released" is a quality target. The SEI's public work on quality attributes and ISO/IEC 25010 both use this distinction.

Not every quality belongs on the shortlist. Pallas scores each candidate quality on two axes:

| Axis | 0 | 1 | 2 | 3 |
|---|---|---|---|---|
| **Stakes** — what missing it costs the business | nobody would notice | annoyance, workarounds | lost revenue, churn or missed deadlines | legal, safety, or existential harm |
| **Structural pull** — how much meeting it shapes the structure | met by careful code in one place | needs a library or a local pattern | needs a structural choice in one area (cache, replica, isolation) | needs a system-wide choice (deployment model, data ownership, style) |

- **Shortlist** a quality when Stakes ≥ 2 **and** Structural pull ≥ 2.
- Stakes ≥ 2 but pull ≤ 1 → a design or coding concern; mention it, do not let it choose the style.
- Pull ≥ 2 but Stakes ≤ 1 → probably gold-plating; record as "considered, not prioritised".

## Four lenses so nothing is forgotten
Stakeholders tend to think about one area and forget the others. Pallas walks four lenses during elicitation. They are a MIKA grouping for conversation, not a formal taxonomy.

| Lens | The question | Typical qualities |
|---|---|---|
| **Runtime** | How must it behave while people and machines are using it? | latency, throughput, elasticity, horizontal scalability, availability, fault tolerance, recoverability, durability |
| **Change** | How must it behave while the team is changing it? | modifiability, modularity, testability, deployability, extensibility, configurability, upgradeability, portability |
| **Trust** | What must it never do, and what must it prove? | security (integrity, confidentiality, authenticity), privacy, auditability, safety, data residency, regulatory compliance, accessibility |
| **Economy** | What can the organisation afford to build, run and staff? | run cost, build cost, operational load, simplicity for the team, skills available, vendor independence |

The Economy lens is not in most quality models, yet it decides more style choices than any other: a structure the team cannot operate fails regardless of its runtime merits.

For a second checklist, the arc42 quality model (quality.arc42.org) tags qualities by broad properties such as reliable, efficient, secure, usable, flexible, operable, safe and suitable, with many example requirements. Use it to jog memory, not as a list to copy.

## Stated and assumed qualities
- **Stated** qualities appear in requirements or in what stakeholders say ("must handle 40,000 members", "must meet the grid operator's data rules").
- **Assumed** qualities are expected though nobody mentions them: basic security, sensible maintainability, data integrity, availability during working hours. They need support but rarely choose the style, unless the context makes them exceptional (security in a payments product, safety in a ferry's passenger-manifest system).

Pallas lists assumed qualities under `IMPLICIT:` so they are neither forgotten nor allowed to crowd the shortlist.

## Unpacking umbrella words
Some words stakeholders use are bundles. Split them before scoring, or the shortlist will hide its real trade-offs.

| Umbrella word | Usually means | Ask |
|---|---|---|
| "Agility" | deployability + testability + modularity | Is the pain releasing, testing or finding where to change? |
| "Reliability" | availability + recoverability + durability + integrity | Is the fear downtime, or losing data? |
| "Performance" | latency + throughput, sometimes burst capacity | Slow for one user, or slow for everyone at once? |
| "Scalability" | steady growth (horizontal scale) **or** sudden bursts (elasticity) | Gradual over months, or 20× in a minute? These favour different designs (depth → **Atlas**). |
| "Evolvability" | modularity + extensibility + low coupling + deployability | What kind of change do you expect most? |
| "Secure" | integrity, confidentiality, authenticity, accountability | Against whom? What data? Which regime? |

Rule: if a quality cannot be measured or tested, it is still an umbrella. Keep splitting.

## Giving each target a measure
A target without a measure cannot be traded off or verified. Pallas writes each one as a short scenario, following the public six-part quality-attribute scenario form from SEI work (source, stimulus, environment, artefact, response, response measure). Example, community energy co-op:

| Part | Example |
|---|---|
| Source | smart meters of 12,000 member households |
| Stimulus | send half-hourly readings |
| Environment | at the top of every half-hour, including after a network outage when meters resend backlog |
| Artefact | the readings intake |
| Response | readings stored and acknowledged |
| Measure | 99.99% of readings stored within 5 minutes; none lost; backlog of 48 h cleared within 2 h |

Short form for the `CHARACTERISTICS:` field: "Burst intake — absorb 48 h meter backlog within 2 h, zero loss". Other usable measures: availability as a percentage or minutes down per month; recovery time and recovery point objectives (RTO/RPO); deployment frequency and lead time for change; time to add a new tariff or plug-in; p95/p99 latency on a named journey; monthly run-cost ceiling.

## How many targets, and which are the top three?
More targets mean more mechanism, more cost and more conflicts. Pallas's discipline:

1. **Collect widely** using the four lenses and the elicitation script in `03`.
2. **Shortlist** with the Stakes × Structural-pull rule above. Aim for five to seven.
3. **Rank** the shortlist with a utility-tree view (public ATAM practice): rate each scenario for business importance and for technical difficulty (High/Medium/Low). High-importance, high-difficulty scenarios are the hardest and most valuable; they become the **top three** and are marked `[top]`.
4. **Agree, don't sort.** Agreeing *which* three matter is worth more than ordering all seven; full rankings cause long debates with little effect on the structure.
5. **Record the rest** as "considered, not prioritised", so the trade-off is visible later.

Warning signs: fifteen qualities all called critical; a top three with a strong internal conflict nobody has acknowledged; targets copied from a template instead of this business.

## Do the priorities stay put?
No. The same product ranks differently over its life. A young product looking for its market prizes change speed and low cost; at scale, availability and elasticity take over; after an incident or audit, trust qualities jump to the top. When the business context shifts, re-rank and record the change in an ADR. In `review`, compare the structure with **today's** top three, not the ones from the original design.

## Different parts, different profiles
Targets rarely apply evenly. A ferry operator's sales path needs extreme elasticity when summer sailings open; its monthly port-fee report needs almost none. When parts of a system differ sharply in their top qualities, that is a strong signal for separate autonomy units, possibly with different styles. If every part shares one profile, a single deployable is usually simpler and enough.

## Speaking ISO/IEC 25010
ISO/IEC 25010:2023 is the current product quality model and a shared vocabulary with quality, procurement and compliance teams. It has nine top-level characteristics. Pallas's lenses map onto them as follows (sub-characteristics shown in no particular order):

| Pallas lens | ISO/IEC 25010:2023 characteristics it draws on |
|---|---|
| Runtime | Performance efficiency (capacity, time behaviour, resource utilisation); Reliability (recoverability, availability, faultlessness, fault tolerance) |
| Change | Maintainability (testability, modularity, modifiability, analysability, reusability); Flexibility (scalability, adaptability, replaceability, installability); Compatibility (interoperability, co-existence) |
| Trust | Security (integrity, authenticity, confidentiality, accountability, non-repudiation, resistance); Safety (fail safe, hazard warning, risk identification, operational constraint, safe integration); Interaction capability, where accessibility and user-error protection matter |
| Function | Functional suitability (correctness, completeness, appropriateness) — usually a requirements matter rather than a style driver |

Notes: the 2023 edition renamed usability to *interaction capability* and portability to *flexibility*, moved scalability under flexibility and added *safety*. Check the current edition when formal conformance matters. The standard does not prioritise anything, and it has no home for deployability, run cost or team load, so keep those from the Change and Economy lenses.

## Conflicts to name in every trade-off
| Pair | Why they pull apart |
|---|---|
| Latency vs security checks | token validation, encryption and inspection add time to every call |
| Elasticity vs strong consistency | spreading writes across nodes pushes towards eventual consistency |
| Low cost vs fault tolerance | redundancy and failover cost money and add moving parts |
| Configurability vs testability | each option multiplies the cases to test |
| Change speed vs auditability | fast independent releases still need a compliance trail |
| Reuse vs team independence | shared code saves duplication but ties release cycles |

## Checklist before leaving this step
- Each shortlisted quality scores Stakes ≥ 2 and Structural pull ≥ 2.
- Umbrella words are split; each target has a measure.
- Five to seven targets; three marked `[top]`.
- Assumed qualities listed separately under `IMPLICIT`.
- Conflicts inside the top three named, with the proposed trade-off.
- Parts with different profiles identified as possible separate autonomy units.
