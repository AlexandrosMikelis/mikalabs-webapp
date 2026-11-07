# Checking: how Gaia reviews an existing model or set of boundaries

Use for `review` requests: a proposed or existing domain model, a service or module list, a relationship map, a filled-in context canvas, workshop output to be checked, a codebase layout, or a proposal to split or merge services. The review re-runs Gaia's own working order (frame → profile → bound → relate → shape → detail → connect) against what exists, and reports the gaps.

Grounding: the patterns cited in `03`–`10`; severity weighting in the spirit of ISO 31000 risk practice (consequence × likelihood); DDD-Crew review aids (Bounded Context Canvas, Context Mapping cheat sheet). The lens set, scoring formula, calibration examples and verdict rules are MIKA's.

## Step 0 — Facts (never skip)
Build the fact sheet from `01`, plus for each component: what it does, owning team, how it integrates (shared database, synchronous calls, events), how its logic is built (CRUD, behavioural model, event sourcing), the words used in code and by experts, the pains (incidents, slow change, cross-team coordination) and constraints (regulation, legacy, vendors). Missing a fact that would change a severity? Assume, record it, and list it under OPEN QUESTIONS. Agent callers cannot answer follow-ups.

When repository access is available, read package and module names, entity classes, schemas and integration code before judging boundaries. Never modify files.

## Step 1 — Rebuild the picture independently
1. Profile the business areas from the business description (`04`), *before* looking closely at the design.
2. Map each component onto those areas. Note components that cover areas with very different profiles, and areas smeared across many components.
3. Draw the *actual* relationship map (`06`), including implicit links: shared tables, shared libraries, shared batch jobs.
The gap between the business picture and the design is where the most important findings usually sit.

## Step 2 — Scope
If most of the concern is overall architecture style, a migration plan or streaming infrastructure, say so and name **Pallas**, **Theseus** or **Nereus**; then still review the domain aspects.

## Step 3 — Run the lenses
Use every lens; report only what matters for this system. Lens names are stable and go into the `lens` field.

| Lens | Questions | Reference |
|---|---|---|
| Strategic classification | Is the core identified and given the best people and the richest model? Generic work built in house without reason? Core handed to an outside firm or buried in vendor configuration? | 04 |
| Language | Do code, API and event names match experts' words? Overloaded classes (Account, Visit, Booking, Member)? Scoped glossary, current? | 03 |
| Boundary placement | Cut by capability and vocabulary, or by entity or technology? One owner each? Shared tables or entity libraries? Scorecard too wide / too narrow? | 05 |
| Integration & relationships | Pattern fits Terms & Distance? Core conforming to legacy or vendor? Translation where needed? Versioned exchange schema for many consumers? Long synchronous chains? | 06 |
| Implementation fit | Build shape matches the scorecard? Over-built simple areas, under-modelled core? Domain free of infrastructure types? Testing weight matches where rules live? | 07 |
| Aggregate rules & sizing | Rules inside one aggregate? One aggregate per transaction? References by ID? Contention and unbounded growth? Value types used? Anaemic core? | 08 |
| Events & consistency | Events are business facts? Internal vs published separated? Outbox? Coordinators for multi-step flows? Idempotent consumers? Event sourcing justified and evolvable? | 09 |
| Discovery & evolution | Experts involved? Model revisited after business change? Boundaries about to move? | 01, 02, 04 |
| Ownership & teams | Teams aligned with contexts? Several teams changing one context? One team drowning in too many? | 05 |
| Agent readiness (optional) | Agent-readiness score from `10`; is the model machine-readable? | 10 |

## Step 4 — Rate each finding
### Scoring formula
Score three factors 1–3 and multiply them (written Impact·Likelihood·Spread); then adjust for reversibility.
- **Impact** (1 minor inconvenience · 2 recurring defects or rework · 3 corrupted or lost business data, unenforceable core rule, legal breach)
- **Likelihood** in the next 12 months (1 unlikely · 2 plausible · 3 already happening)
- **Spread** (1 one team · 2 two teams · 3 three or more teams, or customers directly)
- **Reversibility** (subtract 1 from the band below if cheap to undo; add 1 if it locks in a vendor or data shape)

Product 1–4 → Low · 5–9 → Medium · 10–17 → High · 18–27 → Critical. Then apply: **one band higher in a core context** than the same flaw in a supporting one. Severity measures consequence, not distance from textbook DDD.

| Severity | Meaning | Action |
|---|---|---|
| **Critical** | Will corrupt or lose business-critical data or decisions, makes a core rule impossible to enforce, or locks the core into a model the business cannot change | Stop or contain before building further; escalate |
| **High** | Recurring defects, cross-team coordination for routine changes, or significant rework soon | Fix before the next major build step; named owner |
| **Medium** | Real but containable cost | Plan in roadmap; monitor |
| **Low** | Good-practice improvement | Optional |

### Calibration examples (house domains)
| Finding | Context | Score | Severity |
|---|---|---|---|
| Ferry deck capacity checked in two services with a dual write; overbooking already seen on holiday weekends | Core | 3·3·3 = 27 | Critical |
| Clinic `TreatmentPlan` consent rule enforced only in the web form; API bypasses it | Core | 3·2·2 = 12, core +1 | Critical |
| Energy co-op matching logic held in the meter-data vendor's rule engine, no export | Core | 3·2·2 = 12, lock-in +1 | Critical |
| One `Member` class shared by Membership, Matching and Billing; releases coordinated monthly | Supporting class used by the core | 2·3·3 = 18, reversible −1 | High |
| Crew Certificates built as a behavioural model with repositories and events | Back-office | 1·3·1 = 3 | Low, a cost rather than a risk |
| Manifest Filing conforms to the authority schema with no translation | Supporting, Fixed upstream | Expected pattern | Not a finding |
| Glossary missing for Pharmacy Stock; terms consistent in code | Back-office | 1·2·1 = 2 | Low (documentation) |
| Published `SailingUpdated` event carries the full record; four consumers derive "is delayed" separately | Core | 2·3·2 = 12, reversible −1, core +1 | High |

## Step 5 — Recommend
Each fix is concrete (who changes what), proportionate, and tied to one finding. Order of preference:
1. Fix the strategic picture: profile, move effort, buy what is generic.
2. Fix boundaries: split overloaded models, merge always-together contexts, one owner each, remove shared tables.
3. Fix relationships: add translation or a consumer-facing contract, shrink shared kernels, replace synchronous chains with events or a coordinator.
4. Fix the core model: draw aggregates around rules, value types, events, outbox.
5. Fix language and documentation: glossary, renames, relationship map and graph in the repository.
Say plainly when the right answer is *simpler* than what exists ("this area needs a scripted shape, not aggregates").

### Modernising an existing system
- Prioritise by value: change the core areas whose present structure blocks the business first; leave stable supporting code that works.
- Draw module edges inside the monolith before extracting anything.
- Fence new contexts from legacy models with a translation layer; offer a consumer-facing contract on the legacy side if many new consumers need its data.
- Change build shapes only where the scorecard demands it, not across the board.
- Introduce correct terms in new code and keep a translation table for legacy names.
- Measure outcomes: fewer cross-team release dependencies, shorter lead time for core changes, fewer defects in the core.
- A full migration plan is **Theseus**'s job.

## Step 6 — Verdict
- **Sound** — no High or Critical findings.
- **Sound with changes** — High findings with clear, local fixes; list them as conditions.
- **Remodel** — boundaries, profiling or the core model cause High or Critical issues that local fixes cannot solve.
- **Do not build as designed** — Critical findings that make core rules unenforceable or data integrity unachievable, or the design solves the wrong business problem.
Confidence: High / Medium / Low, depending on how much was assumed.

## Smell catalogue (quick reference)
| Smell | What it usually means | First fix |
|---|---|---|
| Entity-named services (Member, Booking, Vessel, Notification, Utils) over one database | Distributed monolith with an anaemic model | Re-cut by capability and vocabulary; one store per context; events or consumer-facing contracts |
| One `Visit`/`Member`/`Sailing` class for every department | Hidden homonyms, bloated class, coordinated releases | Context-specific models linked by ID; translate at edges |
| "Common" library imported everywhere | Unowned co-owned kernel | Shrink to value types and contracts; move behaviour to owners |
| Core rules inside vendor configuration | Core given away | Pull decision logic into an owned context; vendor behind translation |
| Home-grown sign-in, billing or notifications | Generic built as core | Purchase or adopt open source; move the team to the core |
| Several aggregates updated in one cross-context transaction | Hidden distributed transaction | Single-aggregate transactions; events plus saga or coordinator; compensations |
| Aggregate with an unbounded collection (a patient holding every visit ever) | Contention, slow loads | Split by rule; reference by ID; bucket by period |
| `XUpdated` event with the full record consumed by everyone | Structural and rule coupling | Named business facts; internal vs published; versioned contracts |
| Event sourcing everywhere | Cost without benefit | Keep where H = 3; simpler shapes elsewhere |
| Behavioural model for a settings screen | Over-building | Scripted or record-centred shape |
| Core conforming to a legacy model | Legacy words spreading | Translation layer; renamed terms; mapping table |
| Partnership between teams that rarely talk | Breakages and blame | Move to CS (`06`) with a written contract and versions |
| One service per aggregate with chatty calls | Complexity pushed onto the network | Merge into context-sized services with narrow contracts |
| No experts in the loop | Model encodes engineers' guesses | Regular expert slots; an EventStorming on the core |
| Model untouched since a pivot | Profiles and boundaries out of date | Re-profile (`04`); update the map |
