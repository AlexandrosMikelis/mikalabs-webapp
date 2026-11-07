# Step 5a — Weighing options: which one holds up best when we cannot know the future?

Use after options are generated. The output is a scored comparison of the options, each with a reversibility class, a cost band and a note on which scenarios it fits. The aim is a choice that can be explained and challenged, not false precision.

## What kind of uncertainty is this?
The Cynefin framework (Dave Snowden) sorts situations by how cause and effect relate. It tells Metis how much to trust analysis and how much to rely on trying things.

| Situation | Cause and effect | How to decide | Technology examples |
|---|---|---|---|
| **Clear** | Obvious | Apply known practice | Licence renewal, routine patching |
| **Complicated** | Knowable with expertise | Analyse, ask experts, then commit | Database migration, capacity planning, supplier due diligence |
| **Complex** | Only clear in hindsight | Run small safe-to-fail probes, amplify what works | New digital service, AI adoption, changing team culture |
| **Chaotic** | No visible link; crisis | Act to stabilise first, then assess | Major breach, total outage |
| **Confusion** | Not yet known which applies | Split the problem and classify the parts | Most large programmes at the start |

Large decisions usually contain parts of several kinds. The ferry booking replacement is *complicated* for the data migration, *complex* for how passengers will respond to new channels. Analyse the first; probe the second.

For each load-bearing assumption, also mark what kind of unknown it is:
- **Checkable**: someone could find out with effort. If it matters, find out.
- **Bounded**: it can be given as a range or a few scenarios. Use ranges (`03` for scenarios).
- **Open**: only time or experiment will tell. Use probes and keep options open.

## Flexibility as an asset: real options
Real-options thinking (the term was coined by Stewart Myers at MIT in 1977) borrows from financial options: owning a choice you may exercise later, without being bound to, has value, and that value grows with uncertainty.

What it means in practice:
- **Flexibility is worth paying for only where the uncertainty is real.** An abstraction layer to allow switching cloud providers costs money every month; it is worth it only if a switch is plausible and would otherwise be very costly.
- **Waiting is an option too.** Deciding later, when more is known, has value, until the cost of waiting (lost revenue, rising risk, a contract deadline) overtakes it. Decide at the point where further delay costs more than the information it would bring.
- **Common technology options**: modular boundaries that allow a part to be replaced; open data formats and standard interfaces that cut exit cost; contract break points and portability clauses; pilots that buy information before a large commitment; elastic capacity in place of fixed forecasts.

Test for any proposed flexibility: what change does it protect against, how likely is that change, what would switching cost with and without it, and what does it cost to build and keep?

## How hard is it to undo? Reversibility classes
Amazon's 2015 letter to shareholders popularised the split between decisions that are easy to undo ("two-way doors") and those that are not. Metis uses three classes and puts one on every option:

| Class | Test | Examples | Process weight |
|---|---|---|---|
| **Easy** | Can be undone within about a quarter, at under ~10% of the original cost, with no lasting harm | Pilot, tool trial, feature behind a flag, monthly cloud service | Decide quickly, close to the work |
| **Costly** | Undoing takes months or a large share of the original cost | Multi-year SaaS contract, shared data model, platform choice | Checkpoints, exit criteria, senior review |
| **One-way** | Cannot be undone in practice, or only at a cost that threatens the business | Deleting historical data, exiting a market, losing the last people who know a system, exclusive long-term deals | Slow down; test assumptions hard; wide consultation |

The aim is to match process to class: heavy process on easy decisions slows everything; light process on one-way decisions invites disaster. Look for ways to turn a one-way decision into a series of costly or easy ones (incremental migration, staged contracts, phased rollout).

## Order-of-magnitude cost bands
Early in a strategy, precise costs are guesses. Metis uses cost bands with a stated confidence instead of point estimates:

| Band | Range (caller's currency; scale to the organisation) | Typical content |
|---|---|---|
| **S** | under 100k | Probe, small integration, tool change |
| **M** | 100k–1m | Product rollout, team for a year, medium migration |
| **L** | 1m–10m | Core-system replacement in a mid-sized firm, platform build |
| **XL** | over 10m | Enterprise-wide transformation |

Rules:
- Give a band and a range for the total cost of ownership over five years (one-off + run + exit), not just the project cost.
- Always cost the carry-on option the same way.
- State confidence: *rough* (analogy only), *informed* (supplier quotes or comparable projects), *firm* (detailed estimate).
- Large IT programmes often overrun. Unless there is strong evidence otherwise, plan contingency, and use the high end of the range to test affordability.
- Detailed financial modelling belongs to finance; Metis gives strategic advice, not financial advice.

## The MIKA option-scoring matrix
Score each option from 1 (poor) to 5 (strong) on six criteria. The weight on reversibility rises with uncertainty, so that in volatile situations easy-to-undo options are favoured unless another option is clearly better.

| Criterion | 1 | 3 | 5 | Weight |
|---|---|---|---|---|
| **O Outcome contribution** | Barely moves the business result | Moves it partly or slowly | Moves it fully within the horizon | 3 |
| **D Diagnosis fit** | Treats symptoms only | Addresses structure partly | Addresses the structure behind the problem (rung 2–4 in `05`) | 2 |
| **C Cost band** (inverted) | XL or unaffordable at the high end | M–L, affordable with trade-offs | S, or fully funded | 2 |
| **K Delivery risk** (inverted) | Needs skills, suppliers or capacity we lack | Some gaps, manageable | Well within proven capability | 2 |
| **T Time to first value** | Over 18 months | 6–18 months | Under 6 months | 1 |
| **V Reversibility** | One-way | Costly | Easy | **1 / 2 / 3** (see below) |

**Reversibility weight** by the dominant uncertainty character of the decision:
- Clear or complicated → V weight 1
- Mixed, with important bounded unknowns → V weight 2
- Complex or chaotic, or important open unknowns → V weight 3

**Score** = Σ (criterion score × weight). Show the table, not just the total.

**Decision rules** that override the arithmetic:
1. **Unverified one-way bet**: an option that is One-way and rests on an assumption graded E3 or E4 cannot be recommended as-is. Recommend a probe or a staged version first.
2. **Affordability veto**: an option whose high-end cost exceeds the realistic funding is out, or must be re-shaped.
3. **Scenario floor**: if scenarios exist (`03`), an option that fails badly in a plausible scenario needs a stated hedge or signal-triggered exit.
4. **Close call**: if the top two options are within 10% of each other, prefer the more reversible one, and name the signal that would favour the other.
5. **Outcome floor**: an option scoring 1–2 on O is recommended only if the diagnosis concludes that the business result itself should be dropped or deferred. Say so openly.

Worked example (ferry booking decision; complex channel behaviour, so V weight 3):

| Option | O×3 | D×2 | C×2 | K×2 | T×1 | V×3 | Total |
|---|---|---|---|---|---|---|---|
| Rent and integrate | 4→12 | 4→8 | 3→6 | 4→8 | 3→3 | 3→9 | **46** |
| Extend and wait | 2→6 | 2→4 | 4→8 | 5→10 | 4→4 | 5→15 | **47** |
| Make the core | 5→15 | 4→8 | 1→2 | 2→4 | 1→1 | 1→3 | **33** |
| Do less | 1→3 | 2→4 | 5→10 | 5→10 | 5→5 | 5→15 | **47** |

Reading: the totals for three options are close, so rule 4 applies, but the scores alone are not the decision. "Do less" scores well on reversibility but hits the outcome floor (rule 5): leadership has not dropped the off-season target. "Extend and wait" barely moves the outcome either, and it hits a scenario floor: if the vendor fails before 2028, the operator has no exit. "Make the core" breaks rule 1 (one-way, with demand assumptions graded E4). Metis would recommend "Rent and integrate", staged: a short probe of two shortlisted platforms with real fare data first, a contract with break points, and the old system retired only after one full season. The matrix makes the trade-off visible; judgement makes the call, and the brief says why.

## Testing against scenarios and ranges
- **Scenario test**: score each option in each scenario (`03`). Prefer options that are acceptable everywhere unless a bet is deliberate and hedged.
- **Ranges, not points**: for the main uncertain numbers (demand, cost, adoption), use low, likely and high. If the choice flips within the range, that number is a key assumption: mark it in RISKS & ASSUMPTIONS.
- **Expected value with care**: likelihood × outcome summed across cases helps compare options, but it hides ruin. An option with a small chance of catastrophic loss may be unacceptable whatever its average.

## Biases to check before deciding
| Bias | How it shows in technology decisions | Counter |
|---|---|---|
| Sunk cost | "We've spent €3m, we must finish" | Judge only future costs and benefits |
| Optimism | Timelines and benefits that assume nothing goes wrong | Use base rates from similar projects |
| Anchoring | First estimate or vendor quote sets the range | Estimate independently before seeing quotes |
| Confirmation | Evidence sought only for the favoured option | Assign someone to argue for the strongest alternative |
| Status quo | Carry-on treated as free and safe | Cost it explicitly |
| Novelty | New technology favoured because it is new | Ask what business result it moves |
| Group agreement | Nobody challenges the sponsor | Collect views independently before discussion |

Two public techniques help:
- **Pre-mortem** (Gary Klein, Harvard Business Review, 2007): imagine the chosen option has failed a year from now and ask everyone to write why. Turn the strongest reasons into risks, signals or design changes.
- **Decision record**: write down the decision, the options, the reasoning and what was known at the time (architecture decision records, as described publicly by Michael Nygard, are a lightweight format). Later, judge the decision by the quality of reasoning given what was known, not only by the outcome.

## Output hooks
- OPTIONS → for, against, reversibility, fits when ← matrix scores, reversibility class, scenario test.
- RECOMMENDATION ← the matrix plus the decision rules, with the reason the winner beats the runner-up.
- RISKS & ASSUMPTIONS ← numbers that flip the choice within their range; pre-mortem results.
