# Step 6 — Communicating and steering: how does the decision get made, and how do we know when to change it?

Use to package a recommendation so the right people can decide, and to set up the steering that keeps the strategy honest after approval. The outputs are the SIGNALS field, the governance part of the roadmap, and, when asked, a one-page decision brief.

## The MIKA one-page decision brief
Most technology decisions are made in short meetings by people with little time. Metis compresses any recommendation into one page, answer first. Use this template when the caller asks for a summary, a board paper or a "one-pager", and as a test of any strategy under review: if the brief cannot be filled, the strategy has a gap.

```
DECISION BRIEF — <subject>                      Owner: <name/role>   Decide by: <date>

1. THE ASK        <the decision requested, in one sentence>
2. RECOMMENDATION <the option, in one line> — Reversibility: easy | costly | one-way
3. WHY NOW        <the cost of waiting: deadline, risk, value lost per quarter>
4. THE PROBLEM    <diagnosis in 2–3 lines, with evidence grade>
5. OPTIONS        | Option | Outcome effect | Cost band (5-yr) | Reversibility | Main risk |
                  (carry-on or do-less always included)
6. WHAT WE GIVE UP <the stop list and the runner-up's advantages>
7. MONEY & PEOPLE <cost band and range, funding source, people needed, what is freed>
8. FIRST 90 DAYS  <3–5 committed actions with owners>
9. HOW WE'LL KNOW <2–4 leading signals; kill criteria; next decision point and date>
10. WHAT COULD FLIP IT <the 1–3 assumptions that would change the recommendation>
```

Rules for the brief:
- Line 1 must be a decision someone in the room can make. "Note the update" is not an ask.
- Line 3 is the line most often missing, and the reason decisions get deferred.
- Line 6 is the line most often avoided. Without it, approval means nothing.
- Use the audience's units (euros, weeks, members, patients), not technical units.
- Put detail in an appendix; the page must stand alone.

## Speaking to different audiences
| Audience | What they decide | What they need from Metis' output |
|---|---|---|
| Board or owners | Direction, risk appetite, large funding | The ask, the business result, the downside and the one-way commitments |
| Finance | Funding, phasing | Cost bands with ranges, the carry-on cost, what spend is freed, when benefits arrive |
| Business heads | Priorities, adoption | What changes for their people and customers, and when |
| Engineering and operations | How and when | The guiding policy, the transition states, the constraints and the reasons |
| Regulators or auditors (if relevant) | Compliance | Which obligations the strategy touches and how they are met |

The same strategy, retold for each audience, should still be recognisably the same choices. If the board version and the engineering version disagree, one of them is wrong. For diagrams and architecture communication, hand off to Iris.

## What a business case must contain
When the recommendation needs a business case, check it has:
- **The business result** and how it will be measured, with a baseline.
- **The carry-on baseline**, costed the same way as the options.
- **Total cost of ownership** over at least five years: one-off, running and exit costs, as bands with ranges.
- **Benefits with owners**: every claimed saving or gain has a named business owner who agrees to it.
- **Benefit timing**: when benefits start, not just their total. Late benefits and early costs are normal; hide neither.
- **Risks and their cost**: including delivery risk at realistic base rates.
- **Staged funding**: release money at decision points against evidence, not all at once.

Metis gives strategic advice, not financial advice. Have finance build the detailed model.

## Setting goals that steer: OKRs
Objectives and key results (developed at Intel by Andy Grove and spread widely since) pair a qualitative objective with two to four measurable results. They are useful for translating the strategy into quarterly direction.

Good practice for technology strategy:
- **Key results are outcomes, not tasks.** "Off-season direct bookings up from 22% to 30%" not "launch new booking site".
- **Link each objective to the guiding policy.** OKRs without a strategy above them become a to-do list.
- **Include a health result** where speed could damage safety or quality (for example, peak-day availability).
- **Do not tie OKRs to pay**, or people will set safe targets.

Detailed measure design and automated architecture checks are Chronos' work; Metis sets the strategic intent they serve.

## Steering after approval
A strategy is a hypothesis about what will work. Steering tests it.

| Cadence | Forum | What it looks at | Can decide |
|---|---|---|---|
| Monthly | Delivery owners | Roadmap progress, blockers, leading signals | Re-order within Now |
| Quarterly | Sponsor and leadership | Signals vs thresholds, decision points due, ring moves (`08`) | Continue, change or stop items; move items between Next and Now |
| Yearly, or on a trigger | Leadership and board | Diagnosis still valid? Scenarios shifting? Policy still right? | Revise the strategy |

**Triggers** for an unscheduled review: a scenario indicator crosses its threshold (`03`); a kill criterion fires (`08`); a major supplier, regulatory or market event; a sponsor change.

**Exceptions**: teams will hit cases the policy does not cover. Provide a fast route to ask for an exception, record each one, and review them quarterly. Many exceptions on the same point mean the policy needs to change. Workarounds are signals, not misconduct.

## The strategy as a knowledge graph
MIKA's practice is to hold a strategy as a small graph rather than only as a document. It keeps the reasoning traceable and lets agents check it automatically.

| Node type | Example (energy co-op) |
|---|---|
| Outcome | Time-of-use tariff offered by winter 2027 |
| Challenge | Two-person IT team cannot run a meter-data platform |
| Policy | Rent commodity data services; make only the member-facing display |
| Option | Rent meter-data service · build in-house · share via federation |
| Action | Sign 2-year contract with portability clause |
| Assumption | Members will shift usage for a price signal (E3) |
| Signal | Share of members on the new tariff after 3 months |
| System / Capability | Meter-data store · billing · member portal |
| Owner | Operations lead |

| Relationship | Meaning |
|---|---|
| Action **ADVANCES** Outcome | The action is expected to move the result |
| Policy **ADDRESSES** Challenge | The policy responds to the diagnosis |
| Policy **RULES_OUT** Option | Options the policy excludes |
| Action **DEPENDS_ON** Action / Assumption | Sequencing and load-bearing beliefs |
| Signal **TESTS** Assumption | How we learn whether the belief holds |
| Action **RETIRES** System | Decommissioning |
| Item **OWNED_BY** Owner | Accountability |

Checks the graph makes easy:
- **Orphan actions**: no path from an action to an outcome → candidate for the stop list.
- **Untested beliefs**: an assumption with no TESTS edge → add a signal or a probe.
- **Unowned items**: any action or system without OWNED_BY → finding.
- **Hidden one-way bets**: one-way actions whose DEPENDS_ON assumptions are graded E3/E4 → rule 1 in `07`.
- **Retirement gap**: systems in Eliminate (`04`) with no RETIRES edge.

The graph can be stored in any graph database or as plain tables; the discipline matters more than the tool.

## Output hooks
- SIGNALS ← leading signals, thresholds and owners from the brief and the steering table.
- ROADMAP ← decision points and the review cadence.
- RISKS & ASSUMPTIONS ← line 10 of the brief.
- Extra outputs on request ← the one-page brief; the strategy graph as node and edge lists.
