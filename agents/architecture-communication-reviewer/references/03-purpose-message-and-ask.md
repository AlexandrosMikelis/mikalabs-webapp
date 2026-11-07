# Step R3 — Can the reader say what it means and what is wanted from them?

Before looking at boxes or sentences in detail, reconstruct the message. If you cannot state what the artefact says in one sentence, its readers cannot either, and every later fix is polish on an unclear core.

Grounding: the pyramid principle (answer first, grouped supporting points, each level summarising the one below) and its SCQA opening (situation, complication, question, answer); the GOV.UK and plainlanguage.gov advice to front-load the main point; the C4 model guidance that every diagram has a title and a stated scope; and MIKA's message tests below.

## The one-sentence test
Write the artefact's message as one sentence of at most 30 words, using only what the artefact shows. Then compare it with what the author intended (from the request or the title).

| Result | Meaning | Usual severity |
|---|---|---|
| Sentence comes easily and matches the intent | Purpose clear | none |
| Sentence comes, but differs from the intent | The artefact says something other than the author thinks | High; Critical if it drives a decision the wrong way |
| Several competing sentences | Several purposes in one artefact | Medium–High; usually "split" |
| No sentence possible | No discernible purpose | High; may lead to "Start over" |

For diagram code (DSL or diagram code), render it mentally first: list elements, groups and relationships, then apply the test. Syntax errors that would stop rendering are findings too (lens: Maintainability).

## Answer first
Readers with an Approve or Plan job (`01`) read the top and stop. Put what they need there.

**For decision documents and ADR-style proposals**, the first paragraph contains:
1. The recommendation, in one sentence.
2. The decision needed, from whom, by when.
3. The two or three reasons that carry the recommendation.
4. The main cost or risk of accepting it.

Then the supporting material, grouped so each group backs one reason. Then the options weighed, then detail and appendices.

**For explanatory documents** (how the system works), the first paragraph says what the system does, for whom and at what scope, then points to the views in order of depth (`05`).

**SCQA as an opening**: Situation (what is true and agreed), Complication (what changed or what is wrong), Question (what we must decide), Answer (the recommendation). Use it when readers need a little context before the answer makes sense. Keep each part to one or two sentences.

Example, HarbourLine:
> *Situation*: Ticket sales run on a 2012 on-premises system. *Complication*: Its vendor ends support in June, and peak-season timetable changes need two weeks of manual work. *Question*: Replace it before the peak season, or extend support for a year? *Answer*: Replace it with the hosted booking platform now; the extension costs 60% of the replacement and fixes neither problem. Decision needed from the operations board by 14 March.

## The ask
An artefact that needs a response but does not ask for one tends to be read and filed. Check:
- **What** response: approve, choose an option, comment, approve, confirm a fact.
- **Who**: named group or role, not "stakeholders".
- **By when**: date, time and UTC offset (`02`).
- **How**: where to respond (comment thread, decision log, form), and what happens if nobody responds.
- **Scope of feedback**: what is open for discussion and what is already settled, so reviewers spend effort in the right place.

Missing or buried ask on an artefact whose purpose is a decision → High (lens: Purpose & ask).

## Order: big picture before detail
- Lead with the widest useful view (context, landscape, summary), then narrow. A reader who has the frame can place each detail; one who meets the detail first has to hold it until the frame arrives.
- In a document set, the reading order should follow increasing depth (D1 → D2 → D3) with links to skip ahead (`05`).
- In a deck, one message per slide, stated in the slide title as a sentence ("Moving tickets to the hosted platform removes two weeks of manual work per timetable change"), not a topic label ("Ticketing").

## Does the argument stay honest?
Architecture proposals compete for money and attention. Making a case is fine; distortion is a finding.
- **Show real alternatives**, including "do nothing", each with honest pros and cons. A proposal with one option is a justification, not a choice.
- **State costs and negative consequences** of the recommended option. Readers trust a proposal more when its downsides are named by the author rather than found by them.
- **Separate evidence from opinion**: measurements, incidents and quotes labelled as such; estimates shown with their basis and range.
- **Match the concern of each reader job**: risk and cost for Approve, sequencing for Plan, contracts for Build. One proposal can carry short sections for each.
- **Do not overclaim**: "removes all downtime" is rarely true; "removes the planned outage during timetable loads" may be.
- **Keep emphasis proportional**: a minor component drawn large and central, or a risky dependency drawn tiny at the edge, steers the reader. That is checked again in `08` (honest emphasis).

A recommendation that contradicts the evidence presented in the same document → Critical, because approvers will act on the summary.

## Scenarios that make structure concrete
A worked case helps readers hold an abstract structure in mind.
- Walk one realistic case through the views: "A pet owner books a vaccination; the booking service checks the clinic calendar, reserves the slot, and the reminder service sends an SMS two days before."
- Use a scenario per quality concern: "A lab partner is offline for six hours: results queue in the gateway and appear in the record when it returns."
- Keep the scenario consistent across the artefact; switching examples mid-way costs re-orientation.

## Labels that carry the message
In diagrams the message lives on the relationships more than on the boxes.
- Label relationships with a verb phrase and, for builders, the technology: "sends booking confirmations to [SMTP]", not "uses".
- Arrows follow one stated rule (`06`).
- The diagram title states scope and level: "VetFlow — containers — clinical records (as of 2026-10)".

## Spoken delivery of architecture
When an artefact will be presented:
- Say the message first, then show the picture that supports it.
- Build complex views in steps (the overview first, then one group of parts at a time) rather than revealing everything at once.
- Pause after the ask; repeat it at the end.
- Leave time for questions inside the slot, not after it.
- Watch for confusion on faces or in chat and go back to the frame rather than forward into detail.

## MIKA message checklist (M1–M6)
| # | Check |
|---|---|
| M1 | One-sentence test passes and matches the stated intent |
| M2 | The main point or recommendation is in the first screen or first slide |
| M3 | The ask (what, who, when, where) is explicit when a response is needed |
| M4 | Order runs from big picture to detail, with links to skip |
| M5 | Alternatives, costs and negatives are stated for any recommendation |
| M6 | Emphasis, examples and labels support the message rather than distract from it |

Two or more failures on a decision artefact → at least one High finding; map each failure to its own finding only if the fixes differ.

## In `draft` mode
Write KEY MESSAGE as the one-sentence test answer. For decision documents, outline the answer-first structure; for views, give the title sentence for each view in VIEW SET.
