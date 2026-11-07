# Step 1 — Intake: what is being decided, and is the situation ready for a strategy?

Use at the start of every `assess` and `review`. The output of this step is a filled intake card, a readiness score and a first classification of the problem. Everything later in Metis' procedure leans on it.

Metis' procedure has six moves. Each has its own reference file:

| Move | Question it answers | File |
|---|---|---|
| 1. Intake | What is being decided, by whom, by when, and how much do we know? | `01` (this file) |
| 2. Frame | What exactly is the question, and what would change our mind? | `02` |
| 3. Diagnose | What is really going on, outside the organisation and inside it, and what structure keeps producing it? | `03`, `04`, `05` |
| 4. Generate options | What could we do, including doing less? | `06` |
| 5. Weigh and choose | Which option holds up best across the ways things could turn out, and in what order do we act? | `07`, `08` |
| 6. Communicate and steer | How does the decision get made, and how do we know when to change it? | `09` |

Reviews follow `10`, which reuses the same moves as lenses.

## What counts as a technology strategy here?
A technology strategy is a set of choices about how technology will help the organisation reach specific business results, given a clear reading of its situation. It includes what the organisation will **not** do.

Metis uses the three-part test popularised by Richard Rumelt (McKinsey Quarterly, 2011, "The perils of bad strategy"): a **diagnosis** that names the critical challenge, a **guiding policy** that sets the overall approach to it, and **coherent actions** that carry the policy out and reinforce each other. A document with goals and a project list but no diagnosis fails the test, however polished it looks.

Three things are often mistaken for strategy:
- **Ambitions and slogans** ("cloud-first", "become data-driven"). They say where someone wants to be, not why the organisation is stuck or what it will trade off.
- **Budgets and project lists.** They show where money goes, not why that allocation beats the alternatives.
- **Target architectures.** A picture of the end state without the route, the sequence or the business reason is a design, not a strategy. Detailed style choice is Pallas' job.

## The intake card
Extract these from the request. Where a field is missing, write an assumption and mark it `(assumed)`. Never stop to ask: callers, especially agents, cannot always reply.

| Field | What to capture | Example (regional ferry operator) |
|---|---|---|
| Organisation | Sector, size, regions, ownership | 9 vessels, 4 ports, 600 staff, family-owned, two countries |
| Business outcome at stake | The result leadership wants to move, in its own units | Raise off-season load factor from 38% to 50% within 3 years |
| Decision asked | The choice someone must make, as a sentence | Replace the booking and ticketing system, extend it, or rent a platform? |
| Decision owner | Who signs, and who can veto | CEO signs; finance director and union rep can block |
| Horizon | When results are needed; when the decision is needed | Results by 2029 season; decision before Q1 2027 budget lock |
| Money and people | Budget envelope, current spend split, team capacity | €2–3m over 3 years; 80% of IT spend is keeping systems running; 7 IT staff |
| Technology estate | Main systems, age, health, known constraints | 15-year-old booking system, vendor in decline; port gates on a separate system |
| Constraints | Regulation, contracts, timing, politics | EU passenger-rights rules for sea travel (Regulation (EU) No 1177/2010); vendor contract ends 2028 |
| History | What has been tried, and why it stalled | 2022 replacement project stopped after the vendor selection |

## How ready is the situation? The MIKA strategy-readiness diagnostic
Score six dimensions from 0 to 2. The total sets how hard Metis can lean on its own conclusions and feeds the `Confidence` line.

| Dimension | 0 | 1 | 2 |
|---|---|---|---|
| **R1 Outcome clarity** | No business result named, or only technology goals | A direction ("grow", "cut cost") without a measure | A named result with a unit, a baseline and a date |
| **R2 Decision clarity** | No decision identified; "we need a strategy" | A topic, but options or deadline unclear | A specific choice, an owner and a decision date |
| **R3 Evidence** | Opinions only | Some figures, partial or old | Current figures on cost, demand, estate health and capacity |
| **R4 Estate visibility** | Nobody can list the main systems and their owners | A list exists, health and cost unknown | Systems, owners, cost, health and dependencies known |
| **R5 Capacity and funding** | No budget or staff identified | A budget, but most of it is committed to running today's estate | Funding and people set aside for change, with a realistic split |
| **R6 Sponsorship** | Only the IT team wants this | One business sponsor, others neutral | A business sponsor and the main veto holders support the process |

Reading the total:

| Total | Reading | What Metis does |
|---|---|---|
| 0–4 | **Not ready** | The most useful output is a framing. Lead the diagnosis with the readiness gaps; offer options for closing them (a discovery sprint, an estate inventory, a sponsor conversation) before any large commitment. Confidence Low. |
| 5–8 | **Ready with caveats** | Produce the full strategy, but every load-bearing assumption is listed and the roadmap begins with steps that close the weakest dimensions. Confidence Medium at best. |
| 9–12 | **Ready** | Full strategy; confidence depends on the evidence quality in each part. |

Any dimension scored 0 is named in RISKS & ASSUMPTIONS. R1 = 0 or R2 = 0 caps confidence at Low, because a strategy without a result or a decision cannot be tested.

Example: the ferry operator above scores R1 = 2, R2 = 2, R3 = 1, R4 = 1, R5 = 1, R6 = 1 → 8, *ready with caveats*. The roadmap therefore starts with an estate inventory of the port-gate integrations and a sponsor agreement with finance.

## What kind of problem is it?
Classify before analysing, because the type sets the method.

**Scope**: whole organisation · one business unit · one capability or domain · one initiative.

**Decision type**:
- *Direction*: where should technology take the business over several years?
- *Allocation*: how should a fixed budget or team be spread?
- *Sourcing*: make it ourselves, rent it, buy it, or co-develop it? (see `06`)
- *Renewal*: what to do with an ageing system or estate?
- *Response*: how to react to an external shock (a new rule, a competitor, a breach)?

**Uncertainty character**: the Cynefin framework (Dave Snowden, public and widely published) separates *clear*, *complicated*, *complex* and *chaotic* situations, plus *confusion* when it is not yet known which one applies. A rough first call here is enough; `07` uses it in depth. The common mismatch to watch: a detailed multi-year plan for a complex problem, which can only be understood by trying things.

## Turning a business result into technology questions
Leaders and engineers describe the same problem in different units. Metis translates both ways before diagnosing.

| What leadership says | What to look for in the estate | How to state it back |
|---|---|---|
| "We need to grow in a new market" | Hard-coded currency, language or region; integration effort per partner | "Opening the second country takes 9 months because pricing rules are compiled into the booking engine" |
| "Costs keep rising" | Run cost per unit of business (per booking, per member, per consultation) and its trend | "IT cost per crossing rose 30% in three years while volume was flat" |
| "We are too slow" | Lead time from idea to customer, approval steps, release frequency, manual testing | "A fare change needs 6 weeks and two vendor tickets" |
| "We worry about risk" | Unsupported software, single points of failure, untested recovery, compliance gaps | "If the booking server fails in July we lose about €40k of sales per day, and recovery has never been tested" |

Rules: lead with the consequence in the listener's units (euros, weeks, members, patients), then give the cause. Keep one level of detail below the decision being made, not three. Diagrams for these conversations are Iris' job.

## Intake checklist
- [ ] Business outcome named with a unit, a baseline and a date (or assumed and flagged)
- [ ] Decision written as one sentence, with owner and decision date
- [ ] Readiness scored; any 0 named
- [ ] Scope, decision type and a first uncertainty call recorded
- [ ] Constraints and history captured
- [ ] Hand-offs spotted early: architecture style → Pallas; diagrams → Iris; measures and automated architecture checks → Chronos

## Output hooks
- CONTEXT ← intake card (organisation, outcome, decision, horizon).
- Confidence ← readiness total, capped by R1/R2.
- RISKS & ASSUMPTIONS ← every `(assumed)` field and every readiness 0.
