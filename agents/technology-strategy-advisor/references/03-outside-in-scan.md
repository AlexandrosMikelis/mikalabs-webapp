# Step 3a — Diagnosis, outside in: which external forces actually bite?

Use when the decision depends on things the organisation does not control: regulation, markets, suppliers, competitors, technology shifts. The output is a short **forces register** of the few external forces that change the decision, and, where uncertainty is high, a small set of scenarios to test options against (`07`).

The goal is not a complete survey of the world. A long list of trends that change nothing is noise. Every force that survives this step must answer "so what for this decision?"

## Scan wide, keep few
Use a prompt list to avoid blind spots, then cut hard. The common public prompt lists (PESTLE and its variants) cover politics, economy, society, technology, law and environment. Metis folds them into four questions that suit technology decisions:

| Question | Prompts | Example (community energy co-op) |
|---|---|---|
| **What will the rules require or allow?** | New laws, standards, licensing, data rules, procurement rules, tax | EU rules on renewable and citizen energy communities (Directive (EU) 2018/2001 and Directive (EU) 2019/944) shape what the co-op may sell; NIS2 (Directive (EU) 2022/2555) cyber duties may reach energy operators depending on size and national transposition |
| **What will money and demand do?** | Interest rates, customer income, pricing pressure, demand shifts, labour market | Members want time-of-use tariffs as smart meters spread; scarce data engineers locally |
| **What will technology make cheap or possible?** | Commoditising services, new platforms, AI capability, open standards | Meter-data platforms offered as a service; open data formats for half-hourly reads |
| **What will society and the environment expect?** | Trust, accessibility, sustainability reporting, climate risk, workforce expectations | Members expect transparency on where their energy comes from; volunteers expect simple tools |

For each item, ask three things: **Does it affect this decision?** **When?** (inside or outside the horizon) **How sure are we?** Keep it only if the first answer is yes.

Regulatory and market facts change. Date every such claim, and tell the reader to verify it before relying on it.

## Who can squeeze our margin, and can technology change that?
Michael Porter's industry-structure model (Harvard Business Review, 1979) is the standard public checklist for pressure on profit: competitors, newcomers, customers, suppliers and alternative ways to meet the same need. Metis reads it through one question per party: **is its hold on us growing or shrinking, and can a technology choice change that?**

In technology decisions two parties usually decide the matter:
- **Technology suppliers.** One vendor holding the core system, the data format and the only people who understand it has a strong hold. Signs: price rises above inflation, slow responses, a roadmap set by the vendor, a high exit cost. Open data formats and a credible second supplier weaken that hold.
- **Intermediaries that technology makes possible.** Platforms and aggregators can step between an organisation and its customers: online travel sites for ferries, pet-health apps that triage before a clinic visit. Good direct digital channels reduce dependence on them; good interfaces make working with them cheaper.

The model assumes a clear industry boundary, which platforms blur, and it ignores cooperation (co-ops, consortia, shared utilities). Use it as prompts, not as a score.

## Tracking supplier dependence
Because supplier power so often drives technology decisions, Metis records a dependence profile for each critical supplier:

| Item | Rating guide |
|---|---|
| **Share of a critical capability** | Low: one of several ways to do it · High: the only way |
| **Exit cost** | Low: weeks, standard data export · High: years, proprietary data, custom code inside the product |
| **Supplier health** | Growing and investing · stable · shrinking, acquired or end-of-life announced |
| **Alternatives** | Several credible ones · one · none known |
| **Contract position** | Break clauses, portability terms, price caps · none |

Two or more High ratings on a capability the business depends on is a strategic risk to name in FORCES and RISKS. It does not automatically mean "replace": it may mean "negotiate portability" or "build the exit route before you need it".

## What if two big unknowns could each go either way? The MIKA two-axis stress test
Only build alternative worlds when they would change the choice. Story-based planning of this kind became widely known through Royal Dutch Shell's planning work in the 1970s; Metis uses a compact, decision-first version:

1. **Start from the options**, not the world. Write down the two to four options from `06` first, so the exercise stays tied to a choice.
2. **Ask which external unknowns would make an option win or lose.** Keep only those with a large effect. Anything large but fairly certain is simply part of every world.
3. **Choose two unknowns that move independently** (if one mostly causes the other, they are one axis). Give each two clearly different end points within the horizon.
4. **Cross the axes** into four worlds and give each a memorable name and three lines of description.
5. **Score every option in every world** (`07`). An option acceptable in all four is *robust*; one that shines in one world and fails in another is a *bet* and needs a hedge or a planned exit.
6. **Pick two or three early indicators per axis**: observable events that show which way it is moving. These feed SIGNALS.

Example (regional ferry operator, 2027–2032):
- Axis A: **fuel and emissions cost**: moderate rise ↔ steep rise from carbon pricing for shipping (the EU Emissions Trading System began phasing in maritime emissions from 2024).
- Axis B: **how passengers book**: mostly direct ↔ mostly through travel platforms.

| | Direct booking stays dominant | Platforms take most bookings |
|---|---|---|
| **Moderate fuel cost** | "Steady harbour": invest in own booking and loyalty | "Shelf space": integrate well with platforms, compete on price and timetable |
| **Steep fuel cost** | "Lean crossing": dynamic pricing and load optimisation pay off strongly | "Squeezed margin": cost and integration efficiency dominate everything |

An option to rent a booking platform with good distribution interfaces and a strong pricing engine is acceptable in all four. A custom-built direct channel is a bet on the left column.

Quality checks: each world hangs together; the four are not just "good", "bad" and "middle"; they stretch thinking without being absurd; each one changes at least one option's score. If no world changes any score, drop the exercise and say so.

## Signals to watch
Between strategy reviews, external change shows up first as weak signals: a supplier's key staff leaving, a draft regulation, a competitor's pilot, a sudden change in search or booking patterns. For each axis and each critical supplier, list two or three signals, where they would be seen, and who watches. Name a threshold that would trigger a review of the strategy. These go into SIGNALS and into the steering cadence in `09`.

## Summing up the external picture
The forces register ends this step. Keep it to five lines at most:

| Force | Direction | Effect on the decision | Confidence | Signal to watch |
|---|---|---|---|---|
| Booking-system vendor in decline | Rising risk | Exit needed before 2028; favours options with standard data export | E2 (vendor announcement observed) | Vendor support-staff changes; patch frequency |
| Platform share of bookings | Uncertain | Distribution interfaces become a must-have | E3 | Monthly share of bookings by channel |
| Carbon cost for shipping | Rising | Load optimisation worth more | E1 for current rules, E4 for future price | ETS allowance price |

Some audiences expect a four-box summary of internal strengths and weaknesses against external openings and dangers. It can be built from this register and from `04`, but it is a display format, not an analysis method: every item in it must point to evidence and to a decision.

## Output hooks
- FORCES → world and industry lines ← the register.
- SIGNALS ← scenario indicators and supplier-health signals.
- OPTIONS → fits when ← the scenario in which each option works best.
