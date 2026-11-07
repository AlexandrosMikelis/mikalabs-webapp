# Review — how does Metis judge an existing strategy, roadmap or business case?

Use for every `review` request: a technology, IT, digital or transformation strategy, a roadmap, a business case, an investment proposal, a sourcing decision, a set of principles or a board paper. The review reuses Metis' own six moves (`01`–`09`) as lenses, so a reviewed document is held to the same standard Metis applies to its own work.

## R0 — Fill the intake card and score readiness
Run `01` on the document: organisation, business outcome, decision asked, owner, horizon, money and people, estate, constraints, history. Score the strategy-readiness diagnostic from what the document shows. Missing facts that would change a severity become assumptions and OPEN QUESTIONS. Never stop to ask; agent callers cannot reply.

## R1 — What kind of document is it?
- **Type**: full strategy · roadmap · business case · sourcing decision · principles · board paper.
- **Scope**: whole organisation · business unit · capability · initiative.
- **Uncertainty character** (`07`): mainly clear, complicated, complex or chaotic?

Judge the document against what its type should contain. A business case does not need a market scan; a five-year direction does not need a sprint plan. Many findings come from a mismatch between method and uncertainty: a fixed multi-year plan for a complex problem, or endless pilots for a problem experts could settle.

## R2 — The three-part test
Before the lenses, ask (`01`):
1. **Diagnosis**: is one core challenge named, specific to this organisation, explaining why the problem persists?
2. **Guiding policy**: is there a direction that rules options in and out?
3. **Coherent actions**: are the actions funded, mutually reinforcing and traceable to the policy?

If the diagnosis is missing, the lead finding is usually High or Critical however polished the rest is, because everything downstream inherits the gap.

## R3 — Run the lenses
Consider each lens; report only what matters for this document.

| Lens | Questions | File |
|---|---|---|
| **Outcome link** | Does each major initiative trace to a named business result with a measure? Is the business intent stated, or has it been reconstructed? | 01, 09 |
| **Framing & evidence** | Is the decision clear? Were competing explanations considered? What evidence grade do the key claims have? Are vague words defined? Base rates used? | 02 |
| **Outside-in forces** | Are the external forces that bite identified, dated and sourced? Supplier dependence assessed? More than one future considered where uncertainty is high? | 03 |
| **Inside-out fit** | Sponsor and decision rights clear? Spend split consistent with ambition? Estate health and retirements known? Change capacity realistic? | 04 |
| **System effects** | Does the diagnosis reach structure, not just events? Loops, delays, side effects, gaming? Which rung of the leverage ladder do the actions use? | 05 |
| **Option quality** | Real alternatives, including carry-on or do-less? Sourcing modes considered? Renewals incremental? Probes for weak assumptions? | 06 |
| **Uncertainty & reversibility** | Reversibility stated? One-way bets on weak evidence? Cost bands with ranges and five-year cost? Scenario test? Kill criteria? | 07 |
| **Sequencing & capacity** | Guiding policy and stop list? Now/Next/Later with decision points? Transition states? Dependencies and capacity fit? Retirements dated? | 08 |
| **Steering & communication** | Owner, cadence, triggers, exception route? Outcome-based goals? Can the one-page brief be filled? Clear ask for each audience? | 09 |

Out of scope: detailed architecture style choice (**Pallas**), architecture diagrams and documentation quality (**Iris**), metric definitions and automated architecture checks (**Chronos**). Note the strategic implication and name the hand-off.

## R4 — Rate each finding

| Severity | Meaning | Typical action |
|---|---|---|
| **Critical** | Likely to cause serious harm or outright failure: no link to any business result; a one-way commitment on unverified assumptions; a regulatory or existential risk ignored; a plan the organisation cannot fund or staff | Stop or rework before approval; escalate |
| **High** | A major weakness likely to cause significant waste, delay or failure to reach the intended result | Fix before approval, or make it a condition; named owner |
| **Medium** | A real gap that lowers effectiveness or raises risk but can be fixed during delivery | Address in the next planning cycle |
| **Low** | An improvement in clarity, evidence or presentation | Optional |

Rate by: effect on the business result × likelihood × reversibility × breadth (how much of the organisation or estate is touched). Weigh one-way commitments, regulated settings and large spend more heavily. Severity measures consequence, not how unusual the approach is.

### Calibration examples
| Finding | Severity | Why |
|---|---|---|
| Ferry operator signs a 10-year exclusive booking-platform deal with no data-export clause, based on a vendor demo only | Critical | One-way, E3 evidence, touches all revenue |
| Vet network plans to migrate all 14 clinics in one weekend | High | Costly to reverse, clinical risk, no transition state |
| Energy co-op strategy has no stop list, but the scope is small and the team agrees priorities monthly | Medium | Dilution risk, but caught by a short steering loop |
| Roadmap items are described as work ("Phase 2") rather than outcomes | Low–Medium | Medium if it hides that items do not trace to any result |
| A scenario set has three variants that are just "good, middle, bad" | Low | Weak method, but the decision does not hinge on it |

## R5 — Recommend fixes
Each fix is concrete (who changes what), proportionate and tied to a finding. Fix in this order, because later fixes depend on earlier ones:
1. **The diagnosis**: name the real challenge.
2. **The policy**: choose, and say what will not be done.
3. **The options and reversibility**: add real alternatives; stage one-way bets.
4. **The sequence**: transition states, decision points, retirements, capacity fit.
5. **The structure**: decision rights, funding model, incentives, information flows.
6. **The economics and steering**: cost bands, benefit owners, signals, cadence.
7. **The communication**: the one-page brief.

Say "do less" or "not now" when that is the honest answer.

## R6 — Verdict
- **Adopt**: no High or Critical findings.
- **Adopt with conditions**: High findings with clear, local fixes; list the conditions.
- **Rework**: the three-part test fails (diagnosis, policy or coherence), or several High findings share a root cause local fixes cannot reach.
- **Do not adopt**: Critical findings make it harmful, unaffordable or unlawful as written, or there is no business need.

Confidence: High / Medium / Low, depending on readiness score and how much was assumed.

## Recurring weaknesses (quick reference)
| Weakness | What it looks like | Usual fix |
|---|---|---|
| **Technology as the goal** | "Become cloud-native", "AI everywhere" | Restate as 2–3 business results; keep only initiatives that move them |
| **Wish list** | Aspirations, no diagnosis, no trade-offs | Ask for the core challenge and the stop list |
| **Everything first** | Fifteen top priorities | Order by cost of delay; publish what is not being done; fit to capacity |
| **Funding contradicts ambition** | Transformation claimed, almost all spend on Run | Show the split; fund change by retiring named systems |
| **False precision** | Detailed five-year plan in a complex area | Direction, near-term commitments, probes, decision points |
| **Single cut-over** | One switch at the end, no value before | Transition states; incremental migration |
| **Ever-growing estate** | Nothing ever retired | Retirements with dates and owners |
| **Making commodities** | In-house identity, logging, scheduling, billing engines | Rent or buy; put engineers on what differentiates |
| **Renting the differentiator** | The capability that wins customers handed to a supplier | Make or co-develop with strong control |
| **No way out** | Critical supplier, no exit route | Exit cost estimate; portability terms; proportionate options |
| **Tool as transformation** | New platform expected to change ways of working | Change funding, team shape, decision rights and skills alongside |
| **Targets that invite gaming** | Utilisation or velocity targets | Outcome measures, balanced; hand measure design to Chronos |
| **Gatekeeping for safety** | Central approvals for every change | Guardrails built into platforms; automated checks |
| **Unowned benefits** | Savings claimed, no business owner | Named owners; staged funding against realised benefits |
| **No baseline** | Options compared only with each other | Cost the carry-on option |
| **Impatience with slow stocks** | Skills, trust or data quality expected to improve in a quarter | Realistic horizons; leading signals |
| **Strategy by IT, for IT** | No sponsor outside technology | Re-anchor on business sponsors; co-create |
| **Hype bet** | Large commitment to an immature technology | Small staged probes with kill criteria; Assess or Trial ring |

## Output hooks
- SUBJECT, ASSUMPTIONS ← R0–R1.
- FINDINGS ← R3–R5, ordered by severity, each with lens, issue, basis, fix and owner.
- VERDICT and Confidence ← R6.
