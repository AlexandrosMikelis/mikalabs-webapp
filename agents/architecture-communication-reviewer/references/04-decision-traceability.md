# Step R4 — Can a reader trace each structural choice back to a recorded decision and the concern behind it?

Diagrams show what was chosen; they rarely show why. Readers who must approve, assure or later change the system need the why. This step checks that decisions are recorded, findable and connected to the views and concerns they affect. It judges the record, not whether the decision is right (that goes to Pallas or Metis).

Grounding: Michael Nygard's architecture decision record format (title, status, context, decision, consequences); MADR 4.0 (Markdown Architectural Decision Records: context and problem statement, decision drivers, considered options, decision outcome, consequences, confirmation, pros and cons of options); the Y-statement form; arc42 sections 9 (architecture decisions) and 10 (quality requirements, with quality scenarios); ISO/IEC 25010:2023 product quality characteristics; ISO/IEC/IEEE 42010:2022 (concerns, and correspondences between views); and MIKA's trace chain and trace levels below.

## The MIKA trace chain
A fully traceable architecture lets a reader walk this chain in both directions:

```
Concern ──> Quality scenario or requirement ──> Recorded choice ──> Elements in views ──> Owner
```

- **Concern**: something a reader group cares about ("Can clinics keep booking when the network is down?").
- **Quality scenario**: a testable statement of it (source, stimulus, environment, response, measure), as arc42 section 10 recommends: "When a clinic loses its internet link for up to 4 hours, staff can still create and change reservations, and changes synchronise within 5 minutes of reconnection."
- **Recorded choice**: the decision record that addresses it ("ADR-014: Local booking cache in each clinic").
- **Elements**: the boxes and lines in the views that realise it, tagged with the decision record id.
- **Owner**: the person or team accountable for the decision and its upkeep.

### Trace levels (T0–T3)
| Level | What a reader finds | Typical verdict impact |
|---|---|---|
| **T0 None** | Structure shown, no decisions recorded anywhere | High for Assure and Learn readers; Medium otherwise |
| **T1 Recorded** | Decisions exist (decision records, decision log) but are not linked from views or to concerns | Medium |
| **T2 Linked** | Views and documents link to the relevant decision records; decision records name the drivers | Low gaps only |
| **T3 Closed loop** | Concerns → scenarios → decision records → tagged elements → owners, plus a confirmation (fitness test, review, metric) that the decision still holds | Strength to note |

Required level by situation: an externally shared or audited artefact needs T2; a regulated system or safety concern needs T3 for those concerns; a sketch for discussion can be T0 if it says so.

## What a good decision record contains
Formats vary; these properties matter more than the template.

| Property | Check | Common failure |
|---|---|---|
| Decision-shaped title | Short imperative or noun phrase naming the choice ("Use a local booking cache in each clinic") | Topic title ("Caching") |
| Status | Proposed / accepted / rejected / deprecated / replaced by ADR-n | Missing; or "accepted" on something still debated |
| Context | Facts and forces at the time: constraints, drivers, quality scenarios, deadlines | Context written to justify a choice already made |
| Options | At least two real options, plus "do nothing" where plausible | One option only |
| Balanced evaluation | Pros and cons for each option against the drivers | Pros for the winner, cons for the rest |
| Decision | Which option, stated plainly | Hedged ("we will probably…") |
| Consequences | Positive and negative, including new work, risks and what becomes harder | Positives only |
| Confirmation | How we will know it holds (test, metric, review date) | Absent |
| People | Decision-makers, consulted, informed (the MADR 4.0 metadata fields) | No one named |
| Date and links | Date, links to replaced or related decision records and to affected views | Orphaned record |

**Y-statement** for a one-paragraph summary: "In the context of <use case>, facing <concern>, we decided for <option> and against <other options>, to achieve <quality>, accepting <downside>." Useful as the first paragraph of a longer decision record or as a decision-log entry.

## Keeping a set of decision records healthy
- **Immutable once accepted**: change by superseding with a new decision record, linking both ways; do not edit history.
- **Numbered and in one place**: in the repository next to the code (docs-as-code, `10`) or in one decision log. Not spread across chat and slides.
- **Small**: one decision per record. A record that decides five things cannot be replaced cleanly.
- **Written near the decision**: records written months later drift into justification. If retrospective, say so.
- **Reviewable**: proposed decision records go through the same pull-request or comment process as code, with a close date.

## When does a discussion document count as closed?
A design proposal (often called an RFC, request for comments) or design document is the discussion; the decision record is the outcome. Check:
- Problem statement and goals, plus explicit non-goals.
- Options with trade-offs, not only the preferred design.
- Open questions listed, each with an owner.
- Comment window with an end date, and the name of whoever decides (`03` on the ask).
- **A close**: the outcome is recorded (accepted, changed, rejected) and links to the resulting decision records. A proposal with no close leaves readers unsure what was agreed.

## Quality requirements as the bridge
Decisions only make sense against the qualities they serve. ISO/IEC 25010:2023 lists nine product quality characteristics: functional suitability, performance efficiency, compatibility, interaction capability, reliability, security, maintainability, flexibility and safety. Check that:
- The qualities that drove the architecture are named and prioritised, not left as "scalable, secure, fast".
- Each top quality has at least one measurable scenario.
- Trade-offs between qualities are visible ("we accept slower lab result display (performance) to keep clinical data in-region (security, compliance)").

## Trace inside diagrams
- Tag elements realised by a decision with its id: `[ADR-014]` in the description, or a Structurizr/C4 tag, or a note.
- When a view shows a deliberate departure from the norm (a direct database link across services, an on-premises island in a cloud landscape), link the decision; otherwise readers assume it is an error.
- 42010 calls the links between views "correspondences". At minimum, the same element must carry the same name and id in every view (`06`), so a reader can follow a decision across views.

## Knowledge-graph mapping
The trace chain is naturally a graph, and MIKA recommends storing it that way when an orchestrator manages many artefacts:

```
(:Concern)-[:REFINED_BY]->(:QualityScenario)
(:QualityScenario)-[:ADDRESSED_BY]->(:Decision {id, status, date})
(:Decision)-[:REALISED_BY]->(:Element {id, name, type})
(:Decision)-[:SUPERSEDES]->(:Decision)
(:Element)-[:SHOWN_IN]->(:View)
(:Decision)-[:OWNED_BY]->(:Person|Team)
```
Useful queries for a review: accepted decisions with no realising element (stale or unimplemented); elements in a view tagged with a superseded decision; concerns with no scenario; scenarios with no decision.

## House examples
- *VetFlow*: ADR-014 (local booking cache) is accepted and well written, but the container view shows no cache and the decision record does not link the view. Trace T1. Finding: Medium, Decision trace. Fix: add the cache container tagged `[ADR-014]`; link the view from the decision record.
- *GridShare*: the design document chooses a time-series database with pros listed only for that option and no negatives. Finding: High for the member assembly that must approve the spend (one-sided evaluation for an Approve reader). Fix: add the two alternatives evaluated, their costs, and the negative consequences (vendor-specific query language, operational skills).
- *HarbourLine*: a design proposal on ticket archiving has 40 comments, no end date and no recorded outcome. Finding: Medium. Fix: add a close date and decider; record the outcome as a decision record and link it.

## Review checks for this step
- Which trace level is present, and which is required here?
- Do decision records show real options, balanced evaluation and negative consequences?
- Are status, date, deciders and supersession links present?
- Does each design proposal have a close that links to its decisions?
- Are top quality requirements named, prioritised and measurable?
- Can the reader get from a surprising element in a view to the decision behind it?
