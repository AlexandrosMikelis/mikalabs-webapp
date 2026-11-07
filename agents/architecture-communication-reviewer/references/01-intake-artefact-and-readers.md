# Step R1 — What is this artefact, and who has to do something with it?

Use at the start of every `review` and `draft`. Everything later (severity, notation advice, the verdict) depends on the answers here, so fill the intake card before judging a single box or sentence.

Grounding: ISO/IEC/IEEE 42010:2022 (stakeholders and their concerns as the starting point of any architecture description), the C4 model guidance that each diagram has an intended audience, arc42 section 1 ("stakeholders" table), and MIKA's reader-job grid and depth ladder below.

## The intake card
Extract each field from the request or the artefact. If a field is missing, write the most likely value, mark it `(assumed)`, and carry it to ASSUMPTIONS. An agent caller cannot answer follow-up questions, so never stop here.

| Field | What to record | Typical evidence |
|---|---|---|
| Artefact type | Context view, container view, sequence or dynamic view, deployment view, data-flow view, design document, decision record, design proposal, slide outline, wiki space, README section | Title, diagram keyword (`C4Context`, `sequenceDiagram`), headings |
| Format | Structurizr DSL, D2, C4-PlantUML, PlantUML, Mermaid, prose description, text outline, slide notes | Syntax of what was pasted |
| Reading situation | Where and how it will be met: printed, laptop, phone, shared screen on a call, wall screen, pull request, search result | Request wording; see `02` |
| Readers | Primary and secondary reader groups and their reader job (below) | "for the board", "for new joiners" |
| Purpose | The decision, action or understanding it must produce | "approve", "approve", "onboard" |
| Ask and date | What the author needs back, from whom, by when | "comments by 12 March" |
| Status | Sketch for discussion, proposal for decision, accepted reference, replaced | Status field, DRAFT watermark |
| Place in a set | Stand-alone, or one page of a doc set, review pack or onboarding path | Links, numbering |
| House rules | Mandated template, notation or style guide | "we use arc42", "house ArchiMate colours" |

## Reader jobs: group readers by what they will do
Titles predict little; a programme manager may be a former database engineer. Group readers by the job the artefact must help them do. Each job implies a default depth and notation.

| Reader job | Who often holds it | What they must get out of it | Default depth (ladder below) |
|---|---|---|---|
| **Approve** | Sponsor, steering group, budget holder, change board | Options, recommendation, cost, risk, what happens if they say no | D1 |
| **Plan** | Product owner, delivery lead, programme manager | Scope, dependencies, sequence, who owns what | D1–D2 |
| **Build** | Developers, testers, data engineers | Responsibilities, interfaces, data contracts, constraints | D3, D4 for owned parts |
| **Run** | SRE, operations, on-call, support | Where it runs, what it depends on, how it fails, who to call | D2–D3 deployment |
| **Assure** | Security, privacy, compliance, audit, regulator | Their concern in depth: trust boundaries, data classes, controls, evidence | D2–D3 for that concern |
| **Integrate** | Partner teams, vendors, external customers | Contracts, integration points, obligations, change notice | D2 plus the interface at D3 |
| **Learn** | New joiners, future maintainers, rotating reviewers | A guided path from the big picture to detail, and why things are as they are | D1 then D2, with links deeper |

Mark each present group **primary** (the artefact exists for them) or **secondary** (they may skim). Optimise for primary readers; give secondary readers an entry point (summary, glossary, link to their view).

## The depth ladder
A MIKA scale for "how much inside detail does this reader need?" Use it to name a depth mismatch precisely.

| Depth | Shows | Typical C4 level | Example (VetFlow clinic network) |
|---|---|---|---|
| **D1 Outcome** | The system as one thing, who uses it, what it connects to, what changes for the business | System context, landscape | "VetFlow links 40 clinics, the pet-owner app and two lab partners" |
| **D2 Shape** | The deployable or runnable parts and how they talk | Container, deployment | Booking service, clinical records store, lab results gateway |
| **D3 Interfaces** | Contracts, events, data structures, failure behaviour at one boundary | Component, dynamic, API spec | `LabResultReceived` event schema and retry policy |
| **D4 Internals** | Code structure, classes, tables, configuration | Code (usually generated, rarely drawn) | Lab gateway module dependency graph |

A depth gap of one step costs attention; two or more steps usually means the primary reader cannot act. That rule feeds the severity table in `11`.

## Reader-fit questions
Answer for each primary group. Every audience finding should trace back to one of these.
1. **Job**: which reader job, and what output (approval, plan, code, runbook, assurance statement)?
2. **Return path**: what must the reader send back, to whom, by when? If the artefact needs a response and does not say so, it will be read and filed.
3. **Starting knowledge**: which terms, previous decisions and existing views can be assumed? Name them; reuse the reader's existing words.
4. **Notation fluency**: can they read UML, ArchiMate or BPMN, or do they need plain boxes with a key? (`06`)
5. **Time budget**: two minutes in a steering meeting, or an hour of review? Put the message inside the budget (`03`).
6. **Language**: assume some readers work in a second language. Plain wording, no figures of speech, terms defined (`09`).
7. **Constraints**: house template or regulator format. Follow it unless it defeats the purpose; raise a harmful rule with its owner rather than breaking it silently.

## The purpose line
Compress the intake into one statement and put it in the AUDIENCE field of the review (inferred values marked as assumptions):

> **For** <primary readers, reader job> **this** <artefact> **shows** <scope at depth Dn> **so that** <outcome>. **Needed back:** <response> **by** <date>.

House examples:
- *HarbourLine (regional ferry operator)*: "For the operations board (Approve) this context view shows the new booking platform and its four external systems at D1 so that the board can fund phase 2. Needed back: go / no-go by 14 March."
- *GridShare (community energy co-op)*: "For the volunteer developers (Build) this container view shows the metering pipeline at D2 so that they can pick up tickets without a walkthrough. Needed back: nothing; questions in the project channel."

If no honest purpose line can be written, that is the first finding (lens: Audience fit or Purpose & ask; usually High).

## Signals to look for in the artefact
Evidence the author considered readers:
- A "who this is for" or purpose line; a summary before detail.
- Vocabulary matched to readers: business terms for Approve and Plan, precise technical terms for Build and Run.
- Links out to deeper or neighbouring material instead of everything inline.
- An explicit ask with a date when a response is needed.

Warning signs:
- **Order of authoring**: sections follow the order the author worked in, not the order the reader needs.
- **One picture for every job**: a single dense view aimed at sponsors and builders together.
- **Unexplained shorthand**: "the legacy hub", "Project Kestrel", "the March decision" with no gloss.
- **Depth jump**: D4 detail for an Approve reader, or D1 boxes for a Build team.
- **Notation above fluency**: full UML or ArchiMate for readers who cannot read it; or loose boxes where an assurance reader expects a formal model.

## Knowledge-graph view of the intake
MIKA models each review as a small graph so results compose across artefacts:
`(Artefact)-[:INTENDED_FOR]->(ReaderGroup {job, depth})`, `(Artefact)-[:SUPPORTS]->(Decision|Task)`, `(Artefact)-[:PART_OF]->(DocSet)`. When an orchestrator sends several artefacts, gaps show up as reader groups with no artefact at their depth, or decisions with no supporting artefact.

## In `draft` mode
Open with AUDIENCE & PURPOSE (the purpose line) and KEY MESSAGE. With no stated audience, choose the most likely primary reader job from the request, mark it assumed, and list what the other jobs would need under NEXT.
