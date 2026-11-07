# Component map: discovering, naming and checking components

Use in `design` (the `COMPONENTS:` field) and in `review` (the components and coupling lenses). A component here is a named unit of responsibility — what part of the job it does — described before anyone decides how it will be deployed.

## What is a component, and what is it deployed as?
Pallas keeps two views apart, in line with the C4 model's split between components and containers:
- **Responsibility view**: named components, what each is responsible for, and what each depends on. No servers, databases or protocols. In code a component is usually a top-level module, package or namespace (`clinic.booking`, `ferry.manifest`).
- **Runtime view**: how those components are packaged into deployables, which data stores they use, how they talk and where they run. The chosen style mostly decides this view.

Teams that skip straight to services and databases get boundaries by accident. Drawing the responsibility view first lets Pallas map the *same* components onto several candidate styles in `09` and compare them fairly.

A class or a table is not a component. Nesting is fine (`clinic.booking.waitlist`), but the component is the module that holds the source files for one responsibility.

## How does Pallas find the first set of components?
Three MIKA discovery methods. Use at least two and reconcile; where they agree, the boundary is probably sound; where they disagree, look closer.

### Method 1 — Capability decomposition
List what the organisation must be *able to do*, as nouns of ability, independent of who does it or in which order. This follows public business-capability mapping practice (used in enterprise architecture frameworks such as TOGAF). Break each top-level capability down one level; each second-level capability is a candidate component.

Example, regional ferry operator:
| Capability | Second level → candidate components |
|---|---|
| Sell travel | Fare Pricing, Ticket Sales, Vehicle Deck Allocation |
| Run sailings | Timetable Planning, Boarding, Passenger Manifest |
| Look after customers | Disruption Notices, Refunds |
| Settle money | Payments, Port-Fee Settlement |

Good for: stable, business-facing boundaries. Weak at: spotting technical hot spots and timing.

### Method 2 — Change-axis analysis
Group code by **reason and rate of change**. Things that change together, for the same reason, at the same pace, belong together; things that change for different reasons should be apart. This is the public idea behind David Parnas's 1972 paper on decomposing systems into modules (hide each likely change behind one module) and behind the single-responsibility principle.

How to run it:
1. List the changes expected over the next 12–24 months (from block C of the elicitation script in `03`).
2. For each change, note which candidate components it would touch.
3. A change touching many components → a boundary is wrong. Two components always touched together → candidates to merge.
4. Mark each component's change rhythm: weekly, quarterly, yearly.

Example, community energy co-op: tariff rules change monthly per region; meter-reading intake changes yearly; member onboarding changes quarterly with regulation. Tariff rules therefore become their own component (and a plug-in candidate, `07`), rather than living inside Billing.

### Method 3 — Event-storming-derived grouping
Run or simulate an event storm (Alberto Brandolini's public workshop format): list domain events in time order ("Appointment booked", "Patient checked in", "Treatment recorded", "Invoice issued", "Reminder sent"), add the commands and actors that cause them, then draw boundaries around clusters of events that share data and language. Each cluster is a candidate component.

Example, veterinary clinic network:
| Event cluster | Candidate component |
|---|---|
| Slot released, Appointment booked, Appointment moved, No-show recorded | Appointment Booking |
| Patient checked in, Walk-in added | Reception |
| Treatment recorded, Prescription issued | Clinical Records |
| Invoice issued, Payment taken, Insurance claim sent | Billing & Claims |
| Reminder due, Reminder sent | Reminders |

Good for: workflow-shaped systems and finding async boundaries. Domain-model depth (aggregates, bounded contexts) → **Gaia**.

### Reconcile
Lay the three results side by side. Keep boundaries that at least two methods support. For each disagreement, ask which method's evidence is stronger for this system (capability stability, change data, or workflow clarity) and decide; note the reason.

## How does Pallas test and refine the set?
Run these checks in a loop; expect two or three passes.

| Check | How | Signal |
|---|---|---|
| **Requirement fit** | Map each requirement or story to one component | Orphan requirement → missing component; grab-bag → split; no requirements → maybe remove |
| **Responsibility sentence** | Write one sentence per component | Needs "and also" → split; two components share a sentence → merge |
| **Quality profile** | Mark each component against the top three (`02`) | A component with a sharply different need (elasticity, isolation, security zone) → keep it separate; maybe a separate deployable later |
| **Change rhythm** | From method 2 | Mixed rhythms inside one component → split |
| **Ownership** | Which team would own it? | Two teams → boundary likely wrong (Conway) |

Quality-profile example: ferry Ticket Sales must survive the summer-release spike; Port-Fee Settlement runs monthly and can wait. Keeping them separate lets a style scale one without the other.

## Which component shapes cause trouble?
### CRUD-wrapper components
One component per table — `CustomerManager`, `VesselManager`, `TicketManager` — each doing create/read/update/delete plus whatever logic lands nearby. Symptoms: names ending in *Manager*, *Handler* or matching tables; business workflows smeared across several of them; every change touching many; the "architecture" is a schema with code around it.
Fix: name components after the activity or capability (*Ticket Sales*, *Boarding*, *Refunds*). Table-shaped components are acceptable only for genuinely simple lookup data (a *Species & Breeds* list for the clinics), and then a simple style is probably enough.

### Dumping-ground components
"Common", "Shared", "Utils", "Core". They attract everything, gain many dependants, change often, and block every team. Fix: split by purpose, move logic to its owner, keep only a small stable kernel.

### Confetti components
Many tiny components that always change together and chat constantly. Fix: merge until each has a responsibility worth a sentence.

## Naming rules
- A newcomer should be able to guess what code lives inside.
- Prefer activity or capability nouns (*Appointment Booking*, *Disruption Notices*) over technical role words (*Processor*, *Helper*).
- Use the language the business uses; a name only developers understand is a smell.

## How tightly are components tied together?
Coupling exists when one component needs another to do its job. Some is unavoidable; the aim is to make it deliberate and visible.

### Counting it
Robert C. Martin's public package metrics are a good start:
- **Incoming dependencies (Ca, afferent)** — how many components rely on this one. Many → changes ripple; it must be stable and well tested.
- **Outgoing dependencies (Ce, efferent)** — how many this one relies on. Many → it breaks when any of them changes.
- **Instability I = Ce / (Ca + Ce)** — 0 is maximally stable, 1 maximally unstable. Volatile business rules should not sit in components with many dependants; highly depended-upon components should change rarely and be abstract.

Measure with dependency-graph tools for the language in use; enforce rules with architecture tests (depth → **Chronos**). In distributed systems also count runtime calls and shared data stores: two services sharing tables are coupled even if no code imports the other.

### Kinds of coupling to name in findings
| Kind | What ties them | Typical symptom |
|---|---|---|
| Call | synchronous request chains | latency adds up and availability multiplies down the chain |
| Data | shared tables or schemas | one schema change breaks several components |
| Temporal | one must be running for the other to work | outages cascade |
| Semantic | shared assumptions about meaning (status codes, step order) | silent misbehaviour after a "local" change |
| Deployment | must be released together | release trains and blocked teams |
| Contract | shared library or model upgraded in lockstep | upgrade weeks across all teams |

### Keeping knowledge where it belongs
The least-knowledge principle, long established in object-oriented design, says a unit should know as little as possible about the internals of others. At component scale: a component that drives a workflow by calling five others in a fixed order, knowing each one's rules, holds knowledge that belongs elsewhere. Options: let it announce a fact ("Appointment booked") and let interested components react; or delegate a sub-workflow to the component that owns it.

It is a **trade, not a free win** (P1 in `01`): one component's outgoing coupling drops, another's rises, or complexity moves into the communication (events are harder to trace than calls). Say in the output which coupling goes down, which goes up, and what becomes harder to observe or test.

## How does the map land in each style?
| Style | Where components end up |
|---|---|
| Layered | each component is sliced across presentation, logic and persistence layers; a business change touches every layer |
| Modular monolith | each component (or a cluster) becomes a module with enforced boundaries in one deployable |
| Microkernel | a few components form the core; variable behaviour (tariffs, clinic-specific rules) becomes plug-ins |
| Pipeline | components become ordered processing steps |
| Service-based / microservices | components group into services; how many per service is the key choice (depth → **Theseus**) |
| Event-driven | components become event handlers reacting to facts |
| Space-based | components live in replicated in-memory compute nodes on the hot path |

If the map lands awkwardly on a candidate (most workflows cut across many services), that is evidence against the style, or against the boundaries.

## Writing the `COMPONENTS:` field
Give 5–12 items: name — responsibility (one line) — key coupling (main dependency or event). Tag components with a distinct quality need, e.g. `[elastic]`, `[isolated]`, `[restricted data]`. In reviews, report CRUD-wrapper naming, dumping grounds, many dependants on volatile components, and dependency cycles.
