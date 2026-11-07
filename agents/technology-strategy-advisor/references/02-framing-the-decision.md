# Step 2 — Framing: what exactly is the question, and what would change our mind?

Use after intake. The output is a decision statement, a question tree, a short list of competing explanations and a plan for the evidence that would separate them. A sharp frame saves more effort than any later analysis.

## Write the decision statement
One sentence, in this form:

> **[Owner]** must decide **[the choice]** by **[date]** in order to **[business result]**, within **[constraints]**.

Examples from MIKA's house cases:
- *Veterinary clinic network*: "The COO must decide by March whether to consolidate the 14 clinics onto one practice-management system, in order to cut the time vets spend on admin by a third, within a €900k budget and without closing any clinic for more than one day."
- *Community energy co-op*: "The board must decide this year how to handle half-hourly smart-meter data, in order to offer members a time-of-use tariff by winter 2027, within the co-op's two-person IT team."

Checks on the statement:
- It names a **choice**, not a topic. "Our data strategy" is a topic; "build our own meter-data store or use the supplier's portal" is a choice.
- The business result is in business units, not technology units.
- It says what is fixed (constraints) and what is open.
- If two senior people would write different sentences, that disagreement is the first finding. Resolve it before analysis.

## Break the question down
Split the decision into sub-questions that, together, settle it. The aim is a tree where each branch can be answered with evidence, and where the branches neither overlap nor leave gaps (the MECE discipline, a public consulting convention). Perfect separation is rare; the useful test is "if every branch came back yes, would we be confident in the decision?"

Three ways to split, depending on the decision:

| Split by | When it helps | Example branch set (energy co-op, meter data) |
|---|---|---|
| **Conditions for success** | Go/no-go or choose-one decisions | Is there member demand? · Can we get the data legally and reliably? · Can we run it with two people? · Does it pay back within 5 years? |
| **Value chain stages** | Cost or speed problems | Data collection → validation → storage → billing → member display |
| **Stakeholder outcomes** | Contested decisions | What members gain · what the board risks · what staff must do differently · what the network operator requires |

Keep the tree to two or three levels. Deeper trees invite analysis that never ends.

## State competing explanations early
Write two to four plausible answers or explanations at the start, then test them. This is faster than gathering everything and hoping a pattern appears, and it guards against settling on the first story.

Example (vet network: "admin takes too long"):
- **H1 Tools**: the eight different practice systems force double entry. Test: time-and-motion sample in three clinics on different systems.
- **H2 Process**: admin is slow because each clinic invents its own forms and approvals. Test: compare clinics already on the same system; if they still differ widely, process dominates.
- **H3 Staffing**: reception is under-staffed, so vets do admin. Test: rota data against booking volume.

For each explanation, record:
- **What we would expect to see if it were true** and if it were false.
- **How confident we are now**, as a rough likelihood (unlikely · even · likely · near-certain). Writing it down makes later updates honest.
- **The cheapest test** that would move that confidence a lot.

Rank tests by how much they could change the decision divided by their cost and time. Run the cheap, decision-changing ones first. Drop tests whose result would not change what anyone does.

## Grade the evidence
Not all inputs deserve the same weight. Metis labels key claims with one of four grades and carries the grade into the strategy.

| Grade | Meaning | Examples |
|---|---|---|
| **E1 Measured** | Taken from systems or records, recent, with a known method | Booking logs, invoices, incident records, meter reads |
| **E2 Observed** | Seen directly, small sample | Shadowing three receptions; a walkthrough of a release |
| **E3 Reported** | Stated by people who should know | Interviews, vendor statements, staff surveys |
| **E4 Assumed** | Nobody has checked | "Members want an app", "the vendor will support us until 2030" |

Rules:
- A recommendation resting mainly on E3/E4 claims cannot have High confidence.
- Vendor claims are E3 at best until tested in your context.
- When a claim matters and is cheap to upgrade from E4 to E1 or E2, upgrade it before deciding.
- Ask for **base rates**: how often do projects of this kind, in organisations like this, deliver on time? Large IT programmes overrun so commonly that a plan with no contingency is a finding in itself.
- Define vague words. "Modern", "scalable" and "real-time" mean nothing until someone gives a number.

## Gathering facts from people
Interviews are the main source in most technology strategy work, and the easiest to misuse.
- Talk across levels: board or owner, business heads, finance, front-line staff (ferry deck crew and port staff, clinic receptionists, co-op volunteers), engineers and operators, and at least one key supplier.
- Ask about recent concrete events, not opinions: "Walk me through the last time a fare change went live."
- Ask what people work around. Spreadsheets, shadow tools and manual checks show where the official process fails.
- Ask each person what they think the real problem is and what they would stop doing. Disagreement is data.
- Separate what you heard from what you concluded. Keep notes as "X said Y" until checked.

## From findings to a storyline
When the tests come back, write the conclusion first and support it with three to five reasons, each backed by evidence. This answer-first shape (often called the pyramid principle, after Barbara Minto's consulting work) suits executives who must decide quickly. Check:
- Does each reason support the conclusion directly?
- Is anything important left out because it was awkward?
- Is the evidence grade visible for each reason?

If the answer is "we don't know yet", say so and name the test that would settle it. That is a legitimate strategic output.

## Traps to flag
| Trap | What it looks like | Counter |
|---|---|---|
| Solution in the question | "How do we move to platform X?" | Reframe as the outcome; keep X as one option |
| One story too early | First explanation becomes the plan | Hold at least two explanations until tested |
| Analysis without a decision | Months of discovery, no choice | Set a decision date and a "good enough" evidence bar |
| Averages that hide the problem | "Average release takes 2 weeks" | Look at the spread and the worst cases |
| Counting what is easy | Licence cost tracked, staff time ignored | Ask what the decision really depends on |
| Survivor stories | "Competitor Y did this and won" | Ask how many tried and failed |
| Precision theatre | Five-year cost to the euro | Use ranges and bands (`07`) |

## Output hooks
- CONTEXT ← decision statement.
- DIAGNOSIS ← the surviving explanation, with its evidence grade.
- OPEN QUESTIONS ← the untested explanations and the test that would settle each, written as "question → what changes".
