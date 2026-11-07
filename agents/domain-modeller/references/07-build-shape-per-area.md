# Shaping: how should the logic in each area be built?

Behavioural modelling machinery pays off only where rules are dense and moving. Elsewhere it is cost without benefit. Gaia decides the **build shape** of each area with the MIKA Build Shape Scorecard: five scored characteristics of the area plus a team-capacity gate, feeding four separate decisions (logic shape, history, query side, inner structure). Testing emphasis then follows from where the decisions live.

Grounding: business-logic pattern names from Fowler's public enterprise-application pattern catalogue at martinfowler.com/eaaCatalog; Fowler's bliki entries on event sourcing, command–query separation and temporal patterns; Cockburn's public article on the hexagonal style; Evans' *DDD Reference* (CC-BY 4.0) for the building blocks of a behavioural model. The scorecard, its thresholds and the decision rules are MIKA's.

## Why is the investment profile not enough?
The profile (`04`) says how much an area matters to the business. Build shape depends on the *nature of its rules and data*, which correlates with the profile but is not the same thing. A generic capability you are forced to build (a regulated settlement report) can have intricate rules; a core area can, early on, be little more than a well-chosen formula. So Gaia scores shape directly and uses the profile only as a cross-check.

## The scorecard
Score each area 0–3 on five characteristics.

| Code | Characteristic | 0 | 1 | 2 | 3 |
|---|---|---|---|---|---|
| **R** | Rule volatility | Rules fixed for years | Yearly changes | Quarterly | Monthly or faster, often experimental |
| **I** | Invariant density: rules spanning several fields or things that must hold at once | None beyond field validation | One or two | Several, interacting | Many, with state machines and cross-checks |
| **H** | History need: explain or replay past decisions | Current state is enough | Who-changed-what log | Point-in-time queries ("as of last Tuesday") or regulatory audit | Decisions must be re-derivable; history feeds new views later |
| **S** | Data-shape complexity | Flat records | A few relations | Nested structures, many relations | Graph-like, many-to-many, versioned documents |
| **Q** | Query-side divergence | One screen shape | A few similar views | Several distinct shapes or a search index | Many consumers, different stores, very different load |

Gate:
| Code | Team capacity | 0 | 1 | 2 | 3 |
|---|---|---|---|---|---|
| **T** | Modelling skill and expert access | No experience, no expert access | Some experience or occasional expert | Experienced team, regular expert sessions | Strong modellers, embedded expert |

## Decision 1 — Logic shape
Compute **L = R + I** (0–6).

| L | Logic shape | Public pattern name | Notes |
|---|---|---|---|
| 0–2, S ≤ 1 | **Scripted**: one procedure per use case, run in one transaction | transaction script | Simplest; make each procedure idempotent |
| 0–2, S ≥ 2 | **Record-centred**: objects mirror stored records and carry validation and derived fields; use-case services orchestrate | active record (or table module for set-based logic) | Good fit for ORMs; rules can leak into services |
| 3–4 | **Hybrid: behavioural centre, simple edges**: a behavioural model only for the one or two units where rules collide; record-centred elsewhere | domain model, applied narrowly | The most common honest answer |
| 5–6 | **Behavioural model**: behaviour-rich objects in the experts' vocabulary, no infrastructure dependencies | domain model with Evans' building blocks (`08`) | Highest design cost, highest payoff under change |

Bought or adopted areas get a fifth shape, **Integrated**: no own logic beyond a translation layer (`06`).

None of these is an anti-pattern by itself. The anti-pattern is a mismatch: procedures holding dense, moving rules, or aggregates guarding a settings screen.

## Decision 2 — History
| Condition | History approach |
|---|---|
| H ≤ 1 | Store current state; add a simple change log if H = 1 |
| H = 2 | Current state plus append-only history tables, or bitemporal records for point-in-time questions |
| H = 3 and L ≥ 3 and T ≥ 2 | **Event sourcing**: store the sequence of business events as the source of truth and derive state from it (`09`) |
| H = 3 and (L ≤ 2 or T ≤ 1) | History tables now; flag event sourcing as a later option and say why |

Event sourcing is a persistence choice applied *under* a behavioural model, not a separate kind of model. It buys explanation and replay at the price of event-schema evolution, more infrastructure and eventually consistent queries.

## Decision 3 — Query side
- Q ≥ 2, or event sourcing chosen → **separate query views** (CQRS): the write model guards rules, purpose-built views serve reads, possibly in other stores (search index, reporting database, cache).
- Q ≤ 1 → read from the write model; keep it simple.
- Query views can be updated in the same transaction (simple, couples stores) or asynchronously from events or change data capture (scales, but users see slightly stale data; design for it, see `09`).
- Separation does not forbid a command from returning an identifier or validation errors; it forbids using the write model as the display model.

## Decision 4 — Inner structure
- Behavioural model or hybrid → **dependencies point inward** (the hexagonal style, also called ports and adapters): the domain defines ports for persistence, messaging and outside services; adapters supply them. The domain is testable without a database. Clean and onion architectures are close relatives.
- Scripted or record-centred → **plain layering** is enough: presentation, an application layer that defines use cases and transactions, data access.
- Shapes may differ inside one context: inward dependencies for the core part, plain layering for its admin screens. Company-wide architecture style is **Pallas**'s remit.

## Team gate and cross-checks
- **T ≤ 1 while L ≥ 5** → risk. Start with *hybrid: behavioural centre, simple edges*, pair the team with an experienced modeller, and record the gap under RISKS.
- **Profile says core but L ≤ 2** → re-check the profile (`04`) or expect L to rise; keep the code easy to enrich.
- **Profile label is supporting while L ≥ 5** → it may really be a differentiator; raise it as an open question.
- **Generic but built in house with L ≥ 3** → ask again whether a product exists.

## Testing follows the decisions
Test at the level where each decision is made.
- Rules inside objects (behavioural model) → many fast unit tests on aggregate behaviour and on each value type; few end-to-end tests.
- Rules spread between records and services → integration tests that hit the service with a real or in-memory store carry most of the weight.
- Rules inside procedures that read and write storage → use-case tests through the procedure with a real database, plus a thin layer of end-to-end tests.
- Event sourcing → given–when–then tests: given earlier events and an incoming command, expect specific resulting events or a rejection.

## Worked example: regional ferry operator
| Area | R | I | H | S | Q | T | Logic | History | Query side | Structure |
|---|---|---|---|---|---|---|---|---|---|---|
| Sailing Allocation (deck lane-metres, height classes, hazardous-cargo separation) | 2 | 3 | 2 | 2 | 2 | 2 | Behavioural model (L 5) | History tables, bitemporal holds | Separate views | Inward |
| Fares & Refunds ledger | 2 | 2 | 3 | 1 | 2 | 2 | Hybrid (L 4) | Event sourcing | Separate views | Inward |
| Crew Certificates | 0 | 1 | 1 | 1 | 0 | 1 | Scripted (L 1) | Change log | From write model | Layered |
| Timetable Publishing | 1 | 1 | 1 | 2 | 1 | 1 | Record-centred (L 2) | Change log | From write model | Layered |
| Onboard Retail | — | — | — | — | — | — | Integrated (SaaS) | Vendor's | Vendor's | ACL only |

Why Fares & Refunds uses event sourcing while Sailing Allocation is not: refunds must be re-derivable for disputes and auditors (H 3); allocation needs point-in-time answers ("what space was free when the hold was placed?"), which bitemporal tables answer at lower cost.

## Moving between shapes
- **Scripted → record-centred**: procedures start duplicating data handling; introduce record classes.
- **Record-centred → behavioural model**: list the consistency rules; make state private; move behaviour from services into objects; draw aggregate edges around the rules (`08`).
- **Behavioural model → event sourcing**: define events from the state transitions; seed each stream with one clearly labelled *imported state* event built from the current record (never invent fake past events); then record real events from the switch date.
Re-score shape whenever the profile (`04`) moves.

## Recording the decision
Write each non-obvious shape choice as a short architecture decision record (Nygard's format: context, decision, status, consequences) and store it beside the code. Include the scores, the rule that fired and the condition that would reopen the decision, e.g. "Revisit if refunds stop needing re-derivation (H < 3)". The knowledge graph in `10` links each record to its context so agents can explain the shape later.

## What goes into the model template
On each SUBDOMAINS line give the shape (scripted, record-centred, hybrid, behavioural model, integrated, plus "+ event sourcing" or "+ query views" where chosen). For each core area add the scores in brackets and a one-clause reason, e.g. "behavioural model + event sourcing [R=2 I=2 H=3 S=1 Q=2 T=2]: every refund must be re-derivable for auditors".
