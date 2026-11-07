# Step R9 — Is the document fit for its job, and is every sentence easy to read once?

Most architecture lives in prose: design documents, decision records, design proposals, READMEs, wiki pages, the words inside diagrams. This step checks the document as a whole (is it the right kind of document, organised for its reader?) and then the sentences (plain, precise, consistent). The MIKA Document Fitness Checklist gives a repeatable score.

Grounding: the Diátaxis documentation framework (tutorials, how-to guides, reference, explanation); arc42's section template for architecture documentation; the US Federal Plain Language Guidelines (plainlanguage.gov); the GOV.UK style guide and its guidance on writing for the web; WCAG 2.2 SC 2.4.6 Headings and Labels and SC 1.3.1 Info and Relationships; and MIKA's checklist and term register below.

## Is it the right kind of document?
Diátaxis separates four kinds of documentation by what the reader is doing. Mixing them in one page is a frequent cause of documents that serve nobody.

| Kind | Reader is… | Architecture examples | Fails when |
|---|---|---|---|
| **Tutorial** | Learning by doing, guided | "Run VetFlow locally and book a test appointment" | It stops to explain design rationale at length |
| **How-to guide** | Doing a task they already understand | "Add a new lab partner integration" | It teaches basics or lists every option |
| **Reference** | Looking something up | API contracts, event catalogue, container inventory, configuration | It argues or narrates |
| **Explanation** | Seeking understanding of why | Architecture overview, decision records, design rationale, trade-off discussion | It turns into step-by-step instructions |

Architecture descriptions are mostly explanation plus reference. Decision documents (proposals, RFC-style design proposals) are a special case of explanation aimed at an Approve reader (`03`). A finding is warranted when one page mixes kinds so that its primary reader has to skip large parts.

For whole architecture documents, arc42's twelve sections (introduction and goals, constraints, context and scope, solution strategy, building block view, runtime view, deployment view, cross-cutting concepts, architecture decisions, quality requirements, risks and technical debt, glossary) are a useful checklist of what readers may look for. Sections can be short or omitted with a note; what matters is that readers can find each concern.

## The MIKA Document Fitness Checklist (F1–F10)
Mark each item pass / partial / fail.

| # | Item | Pass when |
|---|---|---|
| F1 | **Purpose line** | The first lines say who it is for and what it helps them do (`01`) |
| F2 | **Answer first** | Summary, recommendation or key message before detail (`03`) |
| F3 | **One kind** | One Diátaxis kind per page, or clearly separated sections |
| F4 | **Scannable headings** | Headings describe content ("How lab results reach the record"), not labels ("Section 3"), and form a usable outline on their own |
| F5 | **Real structure** | Headings, lists and tables are real markup, not bold text or images (SC 1.3.1) |
| F6 | **Plain sentences** | Mostly short, active, concrete sentences; jargon only where readers share it |
| F7 | **Terms defined** | Abbreviations expanded on first use; domain terms in a register or glossary; one name per thing |
| F8 | **Status and ownership** | Status, last-updated date, owner, version visible at the top |
| F9 | **Links over copies** | Links to decisions, views and specs rather than pasted copies (`04`, `10`) |
| F10 | **Ask and next step** | When a response is needed, what, who, when and where are explicit (`03`) |

Scoring: 9–10 pass → fit; 6–8 → fit with fixes; 3–5 → rework; 0–2 → not fit for purpose. As with the clarity score, single failures can override the total: F2 or F10 failing on a decision document is at least High.

## Plain language
From plainlanguage.gov and the GOV.UK style guide, the habits that matter most for architecture prose:
- **Front-load**: put the key point at the start of the document, section, paragraph and sentence.
- **Brief sentences**: GOV.UK suggests keeping sentences to about 25 words. Split sentences that carry two ideas.
- **Active voice with a named actor**: "The booking service retries three times" rather than "Retries are performed".
- **Concrete over abstract**: numbers, names and examples ("within 5 minutes", "the lab results gateway") instead of "timely", "the relevant component".
- **Everyday words where they are precise**: "use" not "utilise", "start" not "initiate". Keep the technical term when it is the precise one ("idempotent", "eventual consistency") and define it for mixed readers.
- **Lists for parallel items**; tables for comparisons across the same attributes.
- **No figures of speech or cultural references** in material read across languages.

Rewrite example (VetFlow decision record context):
- Before: "Due to the fact that connectivity issues have been experienced at a number of clinic sites, it has been deemed necessary to facilitate the utilisation of an offline-capable approach."
- After: "Eight of 40 clinics lost their internet link for more than an hour last year. Staff could not book appointments during those outages. We need booking to work offline."

## Abbreviations and insider terms
- Expand on first use in each document: "Request for Comments (RFC)".
- Prefer the full term if it is used only once or twice.
- Do not coin abbreviations to save space in diagrams; split the diagram instead.
- Domain jargon is fine for domain readers; translate it for others ("berth allocation (assigning a ship to a quay slot)").
- Watch for team-internal names ("Hermes", "the blue cluster") that mean nothing outside the team.

## The term register
A small table kept with the document set (and linked from each document) that fixes names:

| Term | Meaning | Not to be confused with | Used in |
|---|---|---|---|
| Sailing | One scheduled departure of a vessel on a route | Route, voyage | All HarbourLine docs and views |
| Booking | A customer's reservation on one or more sailings | Ticket (the boarding document) | Booking API, ADR-007 |
| Member | A GridShare co-op shareholder with a meter | Customer (non-member buyer) | Billing, assembly papers |

Checks:
- One name per concept and one concept per name, across prose and diagrams (`06`).
- Names match what domain experts say, for Approve and Learn readers.
- The register is the place to resolve disagreements; reviews flag drift from it.

In knowledge-graph terms, the register is the controlled vocabulary for node names: each element in the architecture model (`05`) points to one register term, and any label that does not resolve to a term is flagged.

## Sentence-level checks that catch real misreadings
- **Ambiguous pronouns**: "The gateway sends the result to the record service and then it is archived" — which is archived?
- **Unbounded words**: "fast", "secure", "scalable", "real-time" without a number or scenario.
- **Modal confusion**: "should", "may", "must" used loosely in a document that sets requirements. Define them (RFC 2119 / RFC 8174 conventions) or avoid them.
- **Negation stacks**: "It is not uncommon that requests are not retried" → "Requests are often not retried".
- **Hidden actors**: passive voice hiding who is responsible for a step that matters operationally.
- **Time words**: "currently", "soon", "new" age badly; use dates.

## Words inside diagrams
- Titles, labels and descriptions follow the same rules: plain, specific, consistent with the register.
- Verb phrases on relationships (`06`).
- No paragraphs inside boxes; one line of responsibility, details in the text alternative or notes.

## Templates readers will meet
| Document | Must contain | Common failure |
|---|---|---|
| Architecture overview | Purpose line, context view, main containers, key decisions linked, glossary link | A tour of every component in equal depth |
| Design document / design proposal | Problem, goals and non-goals, options and trade-offs, open questions, decider and close date | Only the preferred design |
| decision record | See `04` | Justification after the fact |
| Repository front-page architecture section | What it is, how it fits (one small view), where deeper docs live | Duplicated, outdated overview |
| Runbook | Purpose, triggers, steps, verification, escalation | Explanation mixed into steps |

## House examples
- *HarbourLine* "Ticketing Architecture v3" opens with three pages of history; the recommendation is on page 9; "sailing", "departure" and "trip" are used interchangeably. F2 fail, F7 fail on a decision document. Findings: High (Purpose & ask), Medium (Wording). Fixes: one-paragraph answer-first summary; adopt "sailing" from the register throughout.
- *GridShare* contributor wiki page mixes a setup tutorial, a reference list of services and a long rationale. F3 fail. Finding: Medium. Fix: split into three pages by kind and link them.

## Review checks for this step
Run F1–F10 on each document; quote the sentence or heading for each wording finding and give the rewrite. Do not rewrite the whole document in `review`; offer `draft` if the caller wants a rewrite.

## In `draft` mode
For a document outline, choose the Diátaxis kind first; then give headed sections that pass F1–F10, with one line under each heading saying what goes there.
