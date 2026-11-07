# Keeping an architecture changeable

Chronos starts every engagement from one question: **can this system keep absorbing change without losing the qualities its users depend on?** Architecture is not a drawing that is right or wrong once; it is a set of properties that hold today and may quietly stop holding after the next hundred commits. This file sets out why that happens, the principles Chronos applies, and a quick readiness check used before designing or reviewing anything.

## Why do healthy architectures drift?
- **The ground moves.** Runtimes reach end of support, a cloud service changes its pricing, a regulation arrives, the person who understood the message broker leaves. A sound choice three years ago can become today's liability without anyone touching it.
- **Small shortcuts add up.** No single pull request ruins a design. A query across a module boundary, a reporting job reading another team's tables, one import cycle "just for now": each is reasonable alone, and together they produce a structure nobody decided on.
- **Some qualities only show up later.** Peak load, real data volumes and real failure modes reveal needs nobody listed at the start.
- **Rules on a wiki do not hold under deadline.** A design principle that nobody checks mechanically is followed until the first urgent release.

The answer Chronos applies is a **feedback loop**: name the qualities that matter, express each as a check that gives an objective verdict (a *fitness function*, see `02`), run the checks where change happens (`04`), and revise the set as needs move. Everything else in these references serves that loop.

## What does "changeable" mean in practice?
Chronos looks at four things together, because a change in one usually forces change in the others:
| Facet | Question | Typical evidence |
|---|---|---|
| **Code and module structure** | Can one area change without editing many others? | dependency graph, cycles, hotspots (`06`) |
| **Data** | Can a schema change ship without coordinating every reader? | store ownership, migration practice (`04`) |
| **Runtime and delivery** | Can one part be released, rolled back and scaled alone? | pipeline per unit, deployment history (`04`, `07`) |
| **People and ownership** | Does each part have one team that can change it? | ownership map, team boundaries (`09`) |

A fix that only addresses the code facet, for example layer rules in CI while every service shares one schema, leaves the system just as hard to change.

## Principles Chronos applies
- **Defer expensive-to-reverse choices until the evidence arrives, but no longer.** Use the waiting time for spikes and measurements. Waiting past the point where the delay itself causes harm is also a decision.
- **Treat ease of change as a quality in its own right.** Give it checks and metrics like latency or availability, or it loses every trade-off.
- **Accept liberally, emit precisely.** The robustness principle (Postel, RFC 761 and RFC 1122): consumers that read only the fields they need survive provider changes; providers that emit exactly their contract cause fewer surprises.
- **Use testability as an early warning.** Code that is hard to test in isolation is usually coupled to too much (`04`).
- **Align teams with the boundaries you want.** Conway's 1968 observation still holds: systems mirror the communication paths of the organisations that build them. Shape ownership deliberately, or expect the structure to drift towards the org chart.
- **Prefer reversible steps.** Feature toggles, parallel change (Fowler's bliki: expand, migrate, contract), branch by abstraction, and rollback-capable migrations keep options open. Release mechanics themselves belong to Daedalus.
- **Standardise where variety buys nothing.** Every one-off framework, hand-built server or bespoke pipeline must be upgraded on its own. Infrastructure as code and a short list of supported stacks reduce that load.
- **Isolate what you do not control.** Put vendor products, external APIs and heavy frameworks behind an anticorruption layer (DDD term) or your own interface, so their changes stop at the edge.
- **Plan to replace some things.** A first version built to learn and then discard (Fowler's "sacrificial architecture") is legitimate if it is labelled as such and recorded as debt (`09`).
- **Keep dependencies current in small steps.** Mirror third-party artefacts, automate upgrade pull requests, and treat framework upgrades as routine work rather than a yearly project.

## Readiness check (MIKA)
Score each line 0–2 before designing governance. It tells Chronos where to start, not whether the team is "good".
| # | Criterion | 0 | 1 | 2 |
|---|---|---|---|---|
| R1 | Automated build and test on every change | none | partial, slow or flaky | reliable, under ~15 min |
| R2 | Independent release of the main parts | all-or-nothing release | some parts | each part alone |
| R3 | Data ownership | shared schema, no owner | owners named, sharing remains | each store has one owning unit |
| R4 | Recorded decisions | none | some ADRs, no checks attached | ADRs with an "Enforced by" section |
| R5 | Production signals | server uptime only | some journey metrics | SLOs on critical journeys |
| R6 | Ownership map | unclear | most parts owned | every unit and store owned |

Reading: **0–4** fix delivery basics first (R1, R2); fitness functions have nowhere to run yet. **5–8** start with baselining checks on the boundaries that hurt most and one SLO. **9–12** the team can sustain a full design (`03`) and a regular review cadence.

## Where is the system in its life?
### New build
The cheapest moment to bake in changeability: a pipeline per deployable unit from day one, the first checks written alongside the first features, boundaries drawn around business capabilities, and no irreversible commitments while knowledge is thin.

### Live system, no governance yet
- Map current coupling first (dependency analysis, change-history hotspots, `06`). Some systems are too entangled to govern cheaply; say so plainly.
- Begin with **baseline-and-ratchet** checks: record today's value, fail only on regression, tighten on a schedule.
- Packaged or vendor software can only be governed at its edges: integration points, data flows, operational behaviour.

### System in transition
- Every step must leave a working system. Guard the transition with temporary checks that carry an end date: "no new calls into the legacy billing module", "old and new paths return the same result" (a side-by-side comparison, see `02`).
- Split along business capabilities and data ownership rather than technical layers when the goal is independent deployment.
- For each piece being untangled, decide between duplicating, extracting a library or extracting a service; each trades reuse for coupling (`05`).
- Watch for the **distributed monolith**: many deployables that must still release together because they share a database or long synchronous call chains.

### Worked example: regional ferry operator
The booking platform is moving from one application to separately deployed booking, vessel-schedule and payments parts over 18 months. Readiness score 6 (R1 = 2, R2 = 0, R3 = 0, R4 = 1, R5 = 2, R6 = 1). Chronos starts with three things: a data-access check that fails when new code touches another part's tables, a temporary "no new calls into the legacy pricing module" rule, and side-by-side comparison of fares from old and new pricing until mismatches stay at zero for four weeks. Structure metrics come later.

## Designing from checks first
Some teams write the key fitness functions before or alongside the code that must meet them, the way test-first development works at unit level. This makes trade-offs explicit early ("we accept 30 ms extra latency for tenant isolation; p95 must stay under 250 ms") and turns intent into something the pipeline can enforce.

## When is this effort worth it?
Worth it when:
- the business or its environment shifts often, or the system must live for many years;
- several teams change the same system and need confidence they are not breaking each other's work;
- regulation or contracts require continuous proof that a property holds (audit trails, data residency);
- a large migration must proceed while the system stays live.

Weak case when:
- the system is small, short-lived or genuinely stable;
- build and deployment are still manual (fix that first, see readiness R1–R2);
- everything is so entangled that any check fails everywhere; create seams first, then govern them;
- the team knowingly accepts a rewrite later to hit a date. Record that as debt (`09`).

## Conditions in the organisation
- **Teams own their checks.** Architects state the intent and threshold; the team whose code is checked implements and maintains the check.
- **Experiments are normal.** State the expected effect of a change, measure it, keep or revert; fitness functions and production metrics are the measuring instrument.
- **Funding is continuous.** Keeping a system changeable is a steady share of capacity, not a one-off modernisation project.
- **Release cadence comes first.** If a release takes weeks, every other practice here is muted. Short cycle time is a precondition (see `07`).

Hand-off note: choosing *which* architecture style fits (layered, modular monolith, services, event-driven) is Pallas's job. Chronos governs whichever style is chosen.
