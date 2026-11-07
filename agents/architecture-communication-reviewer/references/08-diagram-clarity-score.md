# Step R8 — How quickly and correctly does the eye read the diagram?

Once a view has the right purpose, level and notation, visual execution decides whether readers get the message in seconds or give up. This step scores each diagram with the MIKA Diagram Clarity Score (DCS), then turns low criteria into findings. The score makes reviews comparable across artefacts and gives authors a clear target.

Grounding: Gestalt principles of perception (proximity, similarity, enclosure, connection, continuity), the C4 model's diagram review checklist (title, key, element types, descriptions, labelled relationships), WCAG 2.2 colour and contrast rules (`07`), common graph-layout practice (layered layouts, minimising crossings, as implemented in open layout engines such as ELK), and MIKA's rubric below.

## The MIKA Diagram Clarity Score
Score each criterion 0, 1 or 2. Total out of 16.

| # | Criterion | 2 — clear | 1 — partial | 0 — absent or harmful |
|---|---|---|---|---|
| **C1** | **Title and scope** | Title states system, view type, scope and date or version | Title present, missing level, scope or currency | No title, or a title that misstates scope |
| **C2** | **Single level** | All elements at one depth, or partial expansion declared in the title | One or two out-of-level elements | Several levels mixed as peers (`05`) |
| **C3** | **Key and notation** | Complete key on the view including arrow rule; strict notation applied correctly | Key incomplete or arrow rule missing | Meaningful encodings with no key, or two arrow rules (`06`) |
| **C4** | **Labelled relationships** | Every line has a verb phrase; technology where builders need it | Most labelled; some "uses" | Unlabelled lines or "uses" everywhere |
| **C5** | **Colour discipline** | Few colours, each with one keyed meaning, each backed by a second cue | Some decorative colour, or one meaning by colour alone | Colour confetti or decision-critical meaning by colour alone (`07`) |
| **C6** | **Layout and flow** | Clear reading direction; few crossings; at most two or three levels of enclosure; related elements grouped | Some crossings or tangles; one confusing nest | Line tangle, deep enclosure, no discernible flow |
| **C7** | **Density for the medium** | Element count and text size within the medium limits (`02`) | Slightly over; text small but readable | Unreadable in the intended medium |
| **C8** | **Honest emphasis** | Size, position and omission match importance; omissions declared | Minor emphasis skew or an undeclared omission of low impact | Emphasis or omission that would change a reader's conclusion |

### Bands
| DCS | Band | Usual verdict contribution |
|---|---|---|
| 14–16 | Clear | Ready, minor polish |
| 10–13 | Usable with fixes | Ready with fixes |
| 6–9 | Hard to read | Rework |
| 0–5 | Unreadable or misleading | Rework or Start over |

**Overrides**: a 0 on C8 is at least a High finding regardless of total, and Critical when it affects a decision, a trust boundary or an approval. A 0 on C2 or C3 is at least High for the primary reader. The total never softens a severe single criterion.

Report the score in the review as one line under ARTIFACT or STRENGTHS ("DCS 9/16: C2 0, C4 1, C6 1…"), then write findings for criteria scored 0 or 1 that matter for the reader.

## Applying the criteria

### C5 Colour discipline
- Use colour to encode one dimension per view: element type, or status, or ownership. Not all three.
- Keep context elements (external systems, neighbours) in greys so the subject stands out.
- Limit to roughly four meaningful colours plus greys.
- Same colour, same meaning across the set (`06` encoding register).
- Saturated colour draws the eye: reserve it for what the reader should look at first.

### C6 Layout and flow
- **Reading direction**: put the starting point (users, triggering event) top-left or left; let flow run right or down.
- **Proximity and enclosure**: place related elements together and enclose groups only when the grouping carries meaning (a trust zone, a deployable unit, an owning team), and only one grouping dimension per view.
- **Enclosure depth**: two levels is comfortable; three is the limit; beyond that, split views.
- **Crossings**: re-order elements in layers; route lines orthogonally; merge parallel lines into one labelled relationship where the detail is not needed; split by concern if crossings remain.
- **Alignment and spacing**: a grid and consistent spacing let readers see structure; ragged placement suggests relationships that do not exist.
- **Empty space**: blank space separates groups more cleanly than extra boxes or lines.

Auto-layout in diagrams-as-code tools (ELK, dagre and others) gives consistent results but sometimes poor flow. Hints such as rank direction, grouping and hidden ordering edges usually fix it (`10`).

### C7 Density
- Count elements against the medium limits in `02`.
- Keep labels lean: a name and a one-line responsibility per box; long descriptions belong in notes or the text alternative.
- Avoid abbreviations to save space; split instead.
- Make the important element the largest readable thing, not the most detailed.

### C8 Honest emphasis
Visual weight implies importance and certainty. Check that it is earned.
- **Size and centrality**: is the largest, most central element the most important for this question, or just the author's own system?
- **Omission**: is anything left out that would change the reader's view: a shared database, a third-party processor of personal data, a manual step, a single point of failure? If omitted for focus, does the view say so ("Monitoring and logging omitted")?
- **Certainty**: does a speculative design look final? Mark DRAFT, use a sketch style, or show options side by side.
- **Comparison**: when current and target states are compared, are they drawn at the same scale, level and style, so differences are real rather than artefacts of drawing?
- **Simplification**: a clean diagram of a messy system is fine if it says what was simplified.

Calibration:
- HarbourLine target-state view omits the on-board offline ticket store that still holds a copy of passenger data. The privacy officer will approve a data-flow they cannot see. C8 = 0. Critical.
- VetFlow context view draws VetFlow large and the two lab partners as small symbols at the edge, though the main risk in the proposal is lab integration. C8 = 1. Medium.
- GridShare draft target view is rendered in the polished house style and is read as agreed. C8 = 1. Medium; fix with DRAFT watermark and sketch style.

## Style should match status
- **Sketch**: hand-drawn or sketch theme, DRAFT label, questions on the canvas. Invites challenge.
- **Proposal**: clean, keyed, with options and a date.
- **Reference**: house style, generated from the model, versioned, owned.
Recommend a style change when it would correct what readers assume about certainty.

## Fix order
When many visual problems exist, fix in this order, because each step removes the cause of later ones:
1. Split by question and level (`05`).
2. Fix notation and the arrow rule (`06`).
3. Re-lay out for flow and fewer crossings.
4. Reduce and key colour; add second cues (`07`).
5. Trim text and adjust size for the medium.
6. Final pass for honest emphasis and declared omissions.

## Worked mini-example
*Input*: GridShare metering container view for volunteer developers on laptops. 26 boxes, five fill colours (two of them decorative), arrows unlabelled except three, nested boxes for region → cluster → namespace → service, the billing export to the bank omitted "for simplicity" without saying so.

| Criterion | Score | Reason |
|---|---|---|
| C1 | 1 | Title "Metering" without level or date |
| C2 | 1 | Two Kubernetes namespaces shown as peers of containers |
| C3 | 1 | Key exists; no arrow rule |
| C4 | 0 | 23 of 26 lines unlabelled |
| C5 | 1 | Two decorative colours |
| C6 | 0 | Four levels of enclosure; dense crossings around the broker |
| C7 | 1 | 26 elements, over the 25 laptop limit; text fine |
| C8 | 1 | Bank export omitted without a note (low impact for builders, higher for auditors) |
| **DCS** | **6/16** | Hard to read → Rework |

Findings follow from the zeros first: C4 (High for builders), C6 (High: split by namespace or drop infrastructure enclosure to a deployment view), then the ones.

## Review checks for this step
Score C1–C8 for each diagram, apply the overrides, report the score line, and write findings for the criteria that hurt the primary reader. If the diagram was described in prose rather than given as code or an image, mark criteria you could not judge (often C5–C7) as "n/j" and lower confidence.
