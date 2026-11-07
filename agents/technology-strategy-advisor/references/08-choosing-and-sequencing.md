# Step 5b — Choosing and sequencing: what is the call, what stops, and in what order do we act?

Use once options are weighed. The output is the RECOMMENDATION (guiding policy, why it wins, what stops) and the ROADMAP (Now · Next · Later with owners and decision points).

## Turning the winning option into a guiding policy
A guiding policy is the rule that tells people what to do when the roadmap does not cover their situation. It should rule some things in and some things out.

Good: "We rent commodity capabilities and put our own engineering only into pricing and the passenger experience. Any new system must export its data in an open format." Weak: "We will leverage modern technology to drive growth."

Test the policy:
- Would it help a team lead make a choice next Tuesday?
- Does it rule out at least one thing someone currently wants?
- Does it follow from the diagnosis?
- Could a competitor or peer sensibly choose the opposite? If not, it is a platitude.

## The stop list
Every recommendation says what stops. Money and people come from somewhere; a strategy that only adds work will be diluted until nothing changes. List:
- systems to retire, with dates and owners;
- projects to stop or pause;
- practices to drop (a manual approval, a weekly report nobody reads);
- requests the organisation will now decline.

If leadership cannot agree a stop list, the strategy is not yet agreed, whatever the signatures say.

## Do the actions fit together?
Before sequencing, check coherence:
- **Traceability**: every action traces to the guiding policy, and through it to the business result. Orphans are candidates for the stop list.
- **Reinforcement**: actions support each other (retiring a system frees run cost that funds the new team).
- **No contradictions**: one action does not undo another (a cost freeze alongside a hiring plan for the new platform).
- **Capacity**: the total fits the people and attention available (`04`). If not, cut, do not stretch.

## Which work first? Cost of delay
When many actions compete, order them by how much value is lost by waiting. The public cost-of-delay approach (developed in product-development economics by Don Reinertsen, and packaged as Weighted Shortest Job First in the Scaled Agile Framework) divides the cost of delay by the duration or size of the work:

> priority ≈ cost of delay ÷ duration

Cost of delay combines:
- **Value lost per period** (revenue, savings, avoided risk).
- **Time criticality**: deadlines, contract end dates, seasons (a ferry operator's booking change must be live before the season opens, or it waits a year).
- **Risk reduction or information value**: work that removes a major uncertainty or enables other work.

Score each on a relative scale (for example 1, 2, 3, 5, 8, 13), add them, divide by relative size, and sort. Use it to order, not to decide whether to do something at all; that was settled in `07`.

## The roadmap: Now, Next, Later
Metis structures roadmaps by commitment level, not by calendar precision.

| Horizon | Commitment | What it contains | Detail |
|---|---|---|---|
| **Now** (0–6 months) | Committed and funded | Probes, stabilising moves, first retirements, decisions due | Named owners, dates, cost band |
| **Next** (6–18 months) | Planned, subject to the decision points | Main migration steps, new capabilities, team changes | Owners, rough timing, dependencies |
| **Later** (18 months+) | Direction, not commitment | Target capabilities, later retirements | Intent and the conditions to start |

Each roadmap item states the **outcome it moves**, not just the work. "Online booking for all island routes, raising off-season direct bookings by 10 points" beats "Phase 2 booking go-live".

Each horizon boundary has **decision points**: dated moments when someone reviews evidence and decides to continue, change or stop. A roadmap without decision points is a plan that can only overrun.

## Transition states
Large changes should pass through stable intermediate states, each of which delivers some value and could be lived with for a while if funding stopped. TOGAF's public Architecture Development Method calls this planning work "opportunities and solutions" and "migration planning", with *transition architectures* between the baseline and the target.

For each transition state, describe:
- what runs where (which capabilities have moved, which remain on the old system);
- what value it delivers;
- what temporary integration or duplicated cost it carries;
- what would have to be true to move to the next state.

Example (vet clinic network):
1. **State 1** (Q2): four pilot clinics on the rented practice-management product; lab results still through the old bridge; dual-entry for referrals.
2. **State 2** (Q4): all clinics migrated; the old bridge replaced by the product's lab integration; three clinic-specific booking tools retired.
3. **State 3** (next year): online booking and triage on the new base; old pharmacy module retired.

## Kill criteria and triggers
For every major bet, write the conditions under which it stops or changes, before starting. Example: "If after two clinics and 12 weeks admin time per consultation has not fallen by at least 15%, pause rollout and review." Pre-agreed criteria make stopping a planned decision rather than a failure.

## Placing technology choices in rings
When the strategy includes a list of technologies, a ring-based classification is easier to govern than a long list of approvals. The public method behind the Thoughtworks Technology Radar uses four rings: **Adopt**, **Trial**, **Assess**, **Hold**. Organisations can run the same method on their own estate:
- **Adopt**: the default choice; use without special approval.
- **Trial**: use in a bounded project with a named owner and a review date.
- **Assess**: explore and learn; no production use yet.
- **Hold**: do not start new work with it; existing use is planned for exit.

Tie each ring move to evidence (a trial result, a supplier change), and review the rings on a fixed cadence (`09`). Moving something to Hold without a retirement plan only creates a list of things everyone still uses.

## Dependencies and capacity
- **Draw the dependency chain** for Now and Next: which items need others first? Long chains are risk; shorten them where possible.
- **Check people, not just money**: the same few experts often appear on every critical item. Name them and plan around them.
- **Leave slack**: plan to about 70–80% of capacity. Running organisations at full load makes everything slower, because queues grow quickly as utilisation approaches 100% (a basic result of queueing theory).
- **Put retirements on the roadmap with dates.** Without them, the estate only grows and run cost rises every year.

## Output hooks
- RECOMMENDATION ← guiding policy, why it beats the runner-up (`07`), the stop list.
- ROADMAP ← Now · Next · Later with owners, decision points, transition states and kill criteria.
- SIGNALS ← kill criteria and decision-point measures.
