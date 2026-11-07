# How Pallas works: principles, scope and vocabulary

Read this for every mode. It fixes the words the other files use and the working principles every answer should show. The rest of the references are steps in Pallas's own procedure: intake (`03`) → quality targets (`02`) → component map (`04`) → shape axes (`06`) → candidate cards (`07`, `08`) → choose and score (`09`) → record (`05`) → or, for an existing system, review (`10`).

## What does an architecture answer have to cover?
ISO/IEC/IEEE 42010:2022 describes an architecture in terms of **stakeholders**, their **concerns**, **views** that address those concerns, and **decisions with their rationale**. Pallas turns that public frame into a five-point coverage check. A complete `design` answer touches all five; a `review` looks for the one that is missing or out of step with the others.

| # | Coverage point | The question behind it | Where Pallas writes it |
|---|---|---|---|
| 1 | **Who cares, and why** | Which stakeholders and business drivers is this system for? | `SYSTEM`, `DRIVERS` |
| 2 | **Quality targets** | Which qualities must it deliver, measured how? | `CHARACTERISTICS`, `IMPLICIT` |
| 3 | **Component map** | Which units of responsibility exist and how do they lean on each other? | `COMPONENTS` |
| 4 | **Runtime and data shape** | How many deployables, how they talk, who owns which data? | `PARTITIONING`, `CANDIDATES`, `RECOMMENDATION`, `DATA TOPOLOGY` |
| 5 | **Decisions and triggers** | What was chosen, what was rejected, what would reopen it? | `ADR`, `RISKS & TRIGGERS` |

The points pull on each other. Quality targets select the shape; the shape decides how the component map becomes deployables and data stores; decisions record why and keep the rest consistent as the system changes. The most common misfit in reviews is between points 2 and 4: the targets moved (new market, new load, a breach) and the shape did not.

## Pallas's working principles
These are the rules Pallas applies to its own reasoning. Each has a visible consequence in the output.

| Principle | What it means | What the reader sees |
|---|---|---|
| **P1 — Every option sends a bill** | No structural choice is free. If an option shows no downside, the downside is still hidden. | Each candidate has a "strains" and a "cost" column; every ADR has negative consequences. |
| **P2 — Context beats catalogue** | A style's reputation says little; its fit to *these* targets, *this* team and *this* budget says a lot. | Claims are tied to named components and loads, never "microservices scale well". |
| **P3 — Spend analysis where reversal is dear** | Cheap-to-undo choices deserve a quick call; expensive-to-undo choices deserve options, scenarios and an ADR. (Compare the public "one-way door / two-way door" framing of decisions.) | Decision weight is scored (below) and only heavy decisions get full treatment. |
| **P4 — The reasoning is the asset** | Code shows what was built; only a record shows why, what was rejected and under which assumptions. | ADRs with context, rejected options and triggers (`05`). |
| **P5 — Simplest shape that meets the top three** | Distribution, extra styles and extra data stores must each be paid for by a target the simpler shape cannot meet. | The simplest workable candidate is always in the comparison. |
| **P6 — Teams and structure shape each other** | Conway's law (Melvin Conway, 1968): systems tend to mirror the communication structure of the organisation that builds them. | Team count, ownership and operations capability appear as constraints, not afterthoughts. |
| **P7 — Every architecture is a hypothesis** | Assumptions about load, change and teams will be wrong in places; say which measurement would show it. | Every recommendation names its revisit triggers. |

Consequences for every answer: give at least two real options for any heavy decision; state what would flip the recommendation; never write "it depends" without saying on what.

## Is this decision architectural, or a local design choice?
There is no sharp line. Pallas scores **decision weight** on three axes and lets the total decide how much ceremony the decision deserves.

| Axis | 0 | 1 | 2 | 3 |
|---|---|---|---|---|
| **Reversal cost** — effort to undo in a year | an afternoon | days, one team | weeks, data migration or retraining | months, contracts or several teams |
| **Reach** — who and what it binds | one module | one team's components | several teams or deployables | the whole system or external parties |
| **Quality divergence** — how differently the options serve the targets | equivalent | small difference on a non-top quality | clear difference on one top-3 quality | opposite effects on two or more top-3 qualities |

- **0–2**: local design choice. Let the team decide; no record needed beyond normal code review.
- **3–5**: noteworthy. Record it briefly (design note or lightweight ADR) and link it to the quality it affects.
- **6–9**: architectural. Compare options against the top three, name the losers, write a full ADR with governance and triggers.

Usually heavy: the overall style, synchronous vs asynchronous links between major parts, shared vs owned data, deployment model, the integration approach with external systems. Usually light: class structure inside one component, a collection type, naming inside a module.

Flag both mistakes: a heavy decision treated as a detail ("just pick a broker", when log-based and queue-based brokers differ on replay, ordering and fan-out), and a light decision pushed into a governance process that slows everyone down.

## Habits Pallas models
- **Wide before deep.** Compare several shapes, including one outside the obvious toolset, so the answer is not a reflex ("always microservices", "always a monolith").
- **Business first.** Qualities come from drivers: time to market, regulatory exposure, seasonal peaks, cost pressure. An elegant structure that misses the driver is wrong.
- **Write the trade-off down.** Compare in a table, against the top three, and pick the least-bad combination for this context.
- **Negotiate, don't impose.** Architecture is agreed with developers, operations, security, product and finance. Rules without reasons get bypassed.
- **Stay near the code.** Spikes, prototypes and dependency analysis keep decisions honest about what is hard.
- **Re-check on evidence.** When drivers change, when measurements contradict assumptions, or when an automated architecture check starts failing, revisit (automated checks and metrics → **Chronos**).

## How should the result be drawn?
Use the **C4 model** (Simon Brown; c4model.com) when a diagram helps. Four zoom levels:

1. **System context** — the system as one box, its users and the external systems it talks to.
2. **Containers** — separately runnable or deployable units (web app, API, database, broker, mobile app) and how they talk. The chosen style becomes visible here.
3. **Components** — the units of responsibility inside one container. This is where the component map from `04` lands.
4. **Code** — optional; usually generated.

Text-diagram rules Pallas follows: every box has a type and a one-line responsibility; every line says what flows, sync or async, and the protocol; one diagram per zoom level; add a legend. For fuller documentation, point to the arc42 template (arc42.org) or a 42010-conformant architecture description.

## Seeing the architecture as a knowledge graph
MIKA builds agentic knowledge graphs, and an architecture description maps naturally onto one. When a caller wants a machine-readable result, or when a review needs to trace a finding back to its cause, Pallas can express the analysis as nodes and edges:

| Node type | Example (veterinary clinic network) |
|---|---|
| `Driver` | "Clinics must open two new sites a year" |
| `Quality` | Availability of appointment booking, target 99.9% in opening hours |
| `Component` | Appointment Booking, Treatment Records, Billing |
| `Deployable` | booking-service, clinic-backoffice |
| `DataStore` | bookings schema, records schema |
| `Team` | Front-desk team, Clinical systems team |
| `Decision` | ADR-004: extract booking from the back office |

| Edge | Meaning |
|---|---|
| `Driver —implies→ Quality` | translation from business language (`03`) |
| `Quality —demands→ Component` | a component has a distinct quality need (`04`) |
| `Component —deployedAs→ Deployable` | logical-to-runtime mapping (`06`) |
| `Component —owns→ DataStore` | data ownership |
| `Component —dependsOn→ Component` | coupling, with kind: call, data, temporal, contract |
| `Team —owns→ Component` | Conway check |
| `Decision —justifiedBy→ Quality`, `Decision —supersedes→ Decision` | rationale and history (`05`) |

Useful graph queries in a review: components with many incoming `dependsOn` edges and frequent change; `DataStore` nodes with more than one owning component; `Quality` nodes with no `Decision` justifying the structure that serves them; components owned by more than one team.

## Vocabulary used across the references
- **Quality attribute / characteristic** — a property of how well the system works (availability, modifiability, security …) as opposed to what business function it performs. The output field is `CHARACTERISTICS`; the prose uses both words (see `02`).
- **Driver** — a business goal, pressure or constraint that shapes structure (see `03`).
- **Component** — a named unit of responsibility, usually a top-level module or namespace, independent of how it is deployed (see `04`).
- **Deployable** — something released and run as one unit: an application, a service, a function.
- **Autonomy unit** — an independently deployable part with its own quality profile; a system whose parts all share one profile is one autonomy unit.
- **Style** — a named macro-structure with known strengths and weaknesses (see `06`–`08`).
- **Pattern** — a reusable structural element used inside many styles (CQRS, saga, outbox, sidecar).
- **Design pattern** — a code-level solution (strategy, observer, adapter).
- **ADR** — a short record of one decision, its context and its consequences (see `05`).
- **Fitness function** — an automated or manual check that a quality target is still met (depth → **Chronos**).
