# Intake: framing the business before any boxes are drawn

Every request starts here, whatever the mode. Gaia's working order is: **frame → discover → name → profile → bound → relate → shape → detail → connect → check**. This file covers the first step: turning whatever the caller sent into a short fact sheet that every later step can lean on.

Grounding: the strategic ideas behind this step come from Evans' *DDD Reference* (CC-BY 4.0), the DDD-Crew *Bounded Context Canvas* and *Core Domain Charts* (CC BY-SA 4.0), and Wardley Mapping (CC BY-SA). The fact-sheet format and the readiness test below are MIKA's own.

## What does the caller actually want?
| Signal in the request | Mode | First move |
|---|---|---|
| A description of a business, product or process | `model` | Build the fact sheet below |
| A list of services, modules, a diagram, a schema, a canvas or code structure | `review` | Fact sheet, then `11-review-lenses-and-verdicts.md` |
| A question ("should…", "what is…", "when does…") | `ask` | Answer first, then reasoning |
| Workshop output (sticky-note transcript, story diagram) | `model` | Read it with `02`, then continue |
| A request to plan a workshop | `ask` | Use the planning template in `02` |

If two signals compete, prefer the one that produces an artefact the caller can use. A pasted model plus "is this right?" is a review, not a question.

## The fact sheet
Write it before modelling. Keep each line short; mark every guess as an assumption.

| Line | What to capture | Example (regional ferry operator) |
|---|---|---|
| Offer | What customers pay for | Car and foot-passenger crossings between six islands; freight lane bookings for hauliers |
| Earning model | How money comes in | Per-crossing fares, season passes, freight contracts, onboard retail |
| Reason to choose | Why a customer picks this business over an alternative | Reliable sailings in rough weather; guaranteed vehicle space for islanders |
| Actors | People, roles, partners, devices, regulators | Islander passholders, tourists, hauliers, deck crew, port staff, maritime authority, ticket gates |
| Scope edge | What is explicitly outside the request | Vessel maintenance, crew payroll |
| Existing systems | Products and legacy already in place | Vendor ticketing kiosk, spreadsheet timetables, port gate system |
| Teams | Who builds and runs software | Two product teams, one shared platform engineer |
| Constraints | Regulation, contracts, deadlines | Passenger manifest must reach the authority before departure |
| Pains | Where it hurts today | Overbooked car decks on holiday weekends; refunds take weeks |

### The readiness test
A fact sheet is ready when it can answer three questions:
1. **Why would a customer choose us?** Without this, nothing can be ranked as a differentiator.
2. **Who decides the rules?** Each rule area needs a named person or role who can settle disputes about it.
3. **What must never go wrong?** Lost money, unsafe loading, broken legal duties. These become the first rules worth protecting in code.

If any answer is missing, write an assumption that fills it, carry on, and add the matching open question. Never stop to wait: agent callers cannot reply.

## Writing assumptions that help
A good assumption is falsifiable and tied to a decision.
- Weak: "Assume normal ticketing."
- Strong: "Assume vehicle space is allocated per sailing in lane-metres, not per ticket count. If space is per ticket, the capacity model in Sailing Allocation becomes a simple counter."

Format: `ASSUMPTION: <fact> — affects <decision or section>`.

## Questions that surface the real rules
Use these with people, or ask them of the text when the caller is an agent.
- "Tell me about the last time this went badly. What happened first?"
- "What has to be true before someone is allowed to do this?"
- "Who needs to hear about it when this happens, and how fast?"
- "Is that a fixed rule, or someone's judgement on the day?"
- "Does the finance team use that word the same way you do?"
- "What happens if the customer changes their mind halfway through?"
- "Which spreadsheet do you keep on the side, and why?"

The answers feed three later steps: rules go to the consistency units in `08`, words go to the glossary (`03`), and "who needs to hear" goes to events (`09`).

## Choosing a discovery method for the gap
The fact sheet usually shows where knowledge is thin. Pick the cheapest method that closes the gap.

| Gap | Cheapest method | Detail in |
|---|---|---|
| Nobody sees the whole flow end to end | Big-picture EventStorming | `02` |
| One scenario is unclear (who does what with which object) | Domain Storytelling session | `02` |
| One rule has many edge cases | Example Mapping | `02` |
| Strategic position is unclear (what is commodity?) | Wardley map or Core Domain Chart | `04` |
| Current vocabulary is unknown | Read code, screens and reports; then interview | `03` |
| Unwritten workarounds | Observe the work for half a day | here |

## Domain experts: who counts?
A domain expert is someone who can settle a disagreement about a rule, not someone who passes requirements along. Identify one per rule area. In a **veterinary clinic network**, the head of clinical operations may own appointment and triage rules, while the finance controller owns insurance claims; neither is the expert on the other's area. If no expert is reachable, record it as a risk: the model will encode the modeller's guesses.

## Worked mini-example: intake for a community energy co-op
Request (from an orchestrator agent): "Model the software for a co-op that sells members' rooftop solar surplus to neighbours."

Fact sheet (abridged):
- Offer: local electricity at a members' tariff; share ownership in community solar arrays.
- Reason to choose: cheaper, locally generated power and a say in how surplus is shared.
- Actors: member households, array hosts, the co-op board, the grid operator, the energy supplier of last resort, smart meters.
- Must never go wrong: members billed for energy they did not receive; settlement data sent late to the grid operator.
- Assumptions: "Matching runs on half-hourly meter readings — affects the matching model and event volume." "The co-op is not itself a licensed supplier and works through a partner — affects which contexts are generic."
- Open question: "Is the members' tariff set by board vote or by formula?" → changes whether tariff rules sit in a behavioural model or in configuration.

From here Gaia moves to discovery (`02`) or straight to vocabulary (`03`) if the description is rich enough.

## What a finished model looks like (abridged)
So the end point is clear from the start, here is the co-op example carried through the template. Each line points to the file that produced it.
```
DOMAIN: Community energy co-op; members buy neighbours' rooftop solar surplus at a members' tariff through a licensed partner supplier. Actors: member households, array hosts, board, grid operator, partner supplier, smart meters.
ASSUMPTIONS: Half-hourly meter readings (affects matching granularity). Co-op is not a licensed supplier (affects sourcing of billing).
SUBDOMAINS (04, 07):
  Local surplus matching — core — D3 E3 C3 V2 — build — behavioural model + event sourcing [R=2 I=3 H=3 S=2 Q=2 T=2]
  Members' tariff setting — core (marginal) — D2 E2 C2 V2 — build — hybrid
  Share register & voting — supporting — D1 E2 — build simply — record-centred
  Settlement reporting — supporting — D1 E2 C2 — build — scripted
  Meter data, invoicing, sign-in — generic — purchase — integrated
UBIQUITOUS LANGUAGE (03): Surplus — metered half-hourly export beyond host use — Local Matching; Match — allocation of surplus to a neighbour's demand for one interval — Local Matching; Member account — share and voting record — Membership; ...
BOUNDED CONTEXTS (05): Local Matching — allocate surplus fairly each interval — matching — Matching team — surplus, match, interval, array ...
CONTEXT MAP (06): Meter Data Platform → Local Matching — ACL — events — vendor reading model is far from ours ...
CORE MODEL (08): MatchingInterval (root) — value types KilowattHours, HalfHourInterval — rule: matched ≤ metered surplus — commands allocate, reverse — events SurplusMatched, MatchReversed
DOMAIN EVENTS (09): SurplusMatched — MatchingInterval — Billing, Member App — private; IntervalSettled — MatchingInterval — Settlement Reporting, Partner Supplier — public
KNOWLEDGE GRAPH VIEW (10): Area, Context, Term, Aggregate, Event, Rule nodes; one SKOS scheme per context; "Surplus" homonym (Matching vs Board Reporting) linked by relatedMatch.
RISKS: Matching fairness rules not yet agreed by the board; meter corrections arrive days late.
OPEN QUESTIONS: Tariff by vote or formula? → changes tariff shape from hybrid to record-centred.
```

## Handing off early
Check scope before investing effort.
- Mostly about choosing an overall architecture style → **Pallas**.
- Mostly a plan to move from a monolith to services → **Theseus**.
- Mostly brokers, topics, partitions and retention → **Nereus**.
Name the agent, then still give the domain part of the answer.

## Checklist before leaving intake
- [ ] Mode decided and stated (or inferred silently for agent callers).
- [ ] Fact sheet has all nine lines, guesses marked.
- [ ] Readiness test answered or covered by assumptions.
- [ ] At least one "must never go wrong" item named.
- [ ] Open questions linked to the decisions they would change.
