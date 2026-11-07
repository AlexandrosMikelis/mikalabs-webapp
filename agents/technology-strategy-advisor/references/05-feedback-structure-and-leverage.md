# Step 3c — Diagnosis, structure: why does the problem keep coming back, and where would a push actually work?

Use when the problem has persisted despite earlier fixes, when several issues seem connected, or when a proposed action could cause side effects. The output is the SYSTEM VIEW field: the main feedback loops and delays, likely side effects, and where leverage sits.

The foundation is system dynamics, the public tradition started by Jay Forrester at MIT in the 1950s–60s, and Donella Meadows' widely circulated 1999 essay on leverage points, published by the Sustainability Institute. Metis arranges these ideas into a working method for technology decisions.

## Five building blocks
| Block | Meaning | Technology example |
|---|---|---|
| **Stock** | Something that accumulates and can be counted at a point in time | Technical debt, skilled staff, member trust, backlog size, data quality |
| **Flow** | The rate at which a stock fills or drains | Debt added per release vs debt repaid; hires vs leavers |
| **Reinforcing loop** | A change feeds on itself, up or down | More incidents → more firefighting → less maintenance → more incidents |
| **Balancing loop** | A change triggers a correction towards some target | Rising cloud bill → cost review → fewer idle resources → bill falls |
| **Delay** | Time between a cause and its visible effect | Hiring takes 6 months to add capacity; a training programme takes a year to change practice |

Two consequences matter most for strategy:
- **Stocks change slowly.** Skills, trust, data quality and architecture cannot be fixed in a quarter, however much is spent. A roadmap that expects them to is unrealistic.
- **Delays cause overshoot.** When the effect of an action shows up late, people push harder, then too hard. Hiring sprees followed by freezes, and repeated re-organisations, are typical.

## How deep does the explanation go?
Metis checks how deep a diagnosis reaches, using four levels. Strategy that only works at the first level treats symptoms.

| Level | Question | Ferry example |
|---|---|---|
| **1. Event** | What happened? | The booking site crashed on the first sunny Saturday in May |
| **2. Pattern** | Has it happened before? What trend? | Peak-day failures every spring for three years, each worse |
| **3. Structure** | What causes the pattern? | Capacity is sized by the vendor once a year; peak demand grows 15% a year; no load testing; the vendor is paid the same whether it fails or not |
| **4. Belief** | What assumption keeps the structure in place? | "The booking system is the vendor's problem, not ours" |

Rule: a diagnosis should reach at least level 3. Actions aimed at level 3 or 4 last longer than those aimed at level 1.

## Drawing the loops
A causal loop diagram (standard system dynamics notation) shows variables joined by arrows labelled **+** (they move in the same direction) or **−** (they move in opposite directions). A loop with an even number of − links reinforces; an odd number balances. Mark delays on the arrows where they are long.

How to build one in text, step by step:
1. Start from the problem variable ("peak-day failures").
2. Ask what increases or decreases it; add those variables and arrows.
3. Ask what those variables, in turn, affect. Keep going until a loop closes back on an earlier variable.
4. Label each loop R (reinforcing) or B (balancing) and give it a short name.
5. Stop at 5–10 variables. A diagram nobody can read changes nobody's mind.

Text form Metis uses in SYSTEM VIEW:
```
R1 "Firefighting trap": incidents → (+) firefighting time → (−) maintenance time → (+, delay months) incidents
B1 "Budget brake": cloud spend → (+) cost scrutiny → (−) new workloads → (+) cloud spend
```

## Recurring loop shapes to recognise
Some structures appear so often that recognising them speeds up diagnosis. System dynamics practitioners call them archetypes; Metis uses the subset that shows up most in technology organisations, with plain names:

| Shape | Structure | In technology | Way out |
|---|---|---|---|
| **Quick fix that bites back** | A fix relieves the symptom; its side effect worsens the problem later | Hot-patching production instead of fixing the cause | Fund the root fix; measure the side effect |
| **Leaning on a crutch** | A symptomatic fix weakens the ability to do the real fix | Contractors always fill gaps, so internal skills never grow | Use the crutch while deliberately building the capability |
| **Growth hits a ceiling** | A reinforcing growth loop meets a balancing limit | Members join fast until support capacity or a manual billing step saturates | Find and raise the limit before pushing growth harder |
| **Lowering the bar** | Under pressure, the target drops instead of performance rising | "99.9% availability" becomes "best effort" after each bad quarter | Hold the standard; make the gap visible |
| **Shared resource drained** | Each team uses a shared resource rationally until it is exhausted | Shared database, shared platform team, shared test environment | Give the resource an owner, a budget and a usage rule |
| **Escalation** | Two parties each respond to the other's move | Security tightens controls → teams build workarounds → security tightens further | Talk; move to shared goals and paved roads |
| **Success to the successful** | Winners get more resources and win more | The flagship product gets all engineers; new bets starve | Ring-fence resources for options (`04`, three horizons) |

## Where would a push work? The MIKA leverage ladder
Meadows' essay lists twelve kinds of intervention point, from weakest to strongest: numbers and parameters; buffer sizes; the structure of stocks and flows; delays; balancing loops; reinforcing loops; information flows; rules; the power to self-organise; goals; paradigms; and the ability to step outside paradigms. Metis groups them into four rungs that map onto technology strategy work:

| Rung | Meadows points included | Technology strategy levers | Typical effect |
|---|---|---|---|
| **1. Adjust the numbers** | Parameters, buffers | Budget lines, headcount, server size, SLA targets, more licences | Fast, easy, usually weak; the system absorbs it |
| **2. Change the plumbing** | Stock-and-flow structure, delays, loops | Remove a manual handover, add automation, shorten a release cycle, add a feedback channel from users | Stronger; changes how quickly the system responds |
| **3. Change who knows and who decides** | Information flows, rules, self-organisation | Make run cost visible to product owners, change funding rules, give teams decision rights with guardrails | Often the best value; changes behaviour without forcing it |
| **4. Change what the system is for** | Goals, paradigms, transcending | Measure IT on business results instead of uptime; treat data as a member asset instead of a by-product | Strongest and slowest; needs leadership commitment |

How to use it:
1. For each proposed action, place it on a rung.
2. If all actions sit on rung 1, the strategy is probably treating symptoms. Look for a rung 2 or 3 action that addresses the same structure.
3. Higher rungs meet more resistance. Pair them with sponsorship and a clear narrative (`09`).
4. Information flows (rung 3) are often the cheapest strong lever: much bad behaviour comes from people not seeing the consequence of their choices.

Example (vet network): adding reception staff is rung 1. Standardising forms across clinics is rung 2. Showing each clinic its admin minutes per consultation every week, next to its peers, is rung 3. Changing the network's goal from "consultations per vet" to "animals treated well per vet hour" is rung 4.

## Side effects and second-order consequences
Before recommending an action, run these checks:
- **Displacement**: does the problem move elsewhere rather than disappear? (Strict change control moves risk into unofficial tools.)
- **Gaming**: if a measure becomes a target, how could people hit the number without improving the result? (Velocity targets inflate estimates.)
- **Delayed cost**: what does this cost in a year, not just now? (A quick integration becomes a maintenance burden.)
- **Who loses**: whose work becomes harder, and how will they respond?
- **Feedback on the strategy itself**: what will tell us early that the action is not working?

Detailed design of measures, and guarding them against gaming, belongs to Chronos.

## Turning the system view into a proposition
End this step with a short, testable statement:

> Because **[structure]**, the organisation keeps getting **[pattern]**. Acting on **[lever, rung]** should change **[stock or loop]**, which we expect to show in **[leading signal]** within **[time]**. Risk: **[side effect]**, watched by **[signal]**.

Example: "Because vendor capacity is set once a year while peak demand grows 15% a year, the operator keeps having spring outages. Moving to a platform that scales with demand and adding a monthly load test (rung 2), with the vendor contract tied to peak-day availability (rung 3), should break the firefighting loop, visible in zero peak-day failures in the first season. Risk: higher variable cost, watched by cost per booking."

## Output hooks
- SYSTEM VIEW ← loops in text form, main delay, leverage rung of the recommended actions, side effects.
- DIAGNOSIS ← the structure (level 3) and belief (level 4) behind the pattern.
- SIGNALS ← the leading signal in the proposition.
