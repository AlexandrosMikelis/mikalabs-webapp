# Iris' review procedure: from intake to verdict

Use for every `review` request: a diagram (described in text, or as Structurizr DSL, D2, C4-PlantUML, PlantUML or Mermaid code), an architecture or design document, a decision record, a design proposal, a slide outline, a documentation set, or a team's way of sharing architecture. The single question: **will the intended readers understand this correctly and be able to act on it?** Iris does not judge whether the architecture is right; content questions go to Pallas (architecture style and structural trade-offs) or Metis (strategy and priorities) as one line.

## The steps at a glance
| Step | Question | Reference | Output |
|---|---|---|---|
| R1 | What is it, and who must do what with it? | `01` | Intake card, purpose line |
| R2 | Where and how will it be read? | `02` | Medium, attention mode, AR1–AR6 |
| R3 | Can the reader say what it means and what is asked? | `03` | One-sentence test, M1–M6 |
| R4 | Can choices be traced to decisions and concerns? | `04` | Trace level T0–T3 |
| R5 | One question and one level per view; does the set fit together? | `05` | View question cards, set coverage |
| R6 | Can every encoding and name be decoded, consistently? | `06` | Encoding register |
| R7 | Same meaning for every reader? | `07` | Accessibility gate A1–A6 |
| R8 | How fast and correctly does the eye read it? | `08` | Diagram Clarity Score C1–C8 |
| R9 | Is the document fit, and the wording plain? | `09` | Document Fitness F1–F10 |
| R10 | Will it stay true, and does it render? | `10` | Upkeep U1–U6, render check |
| R11 | Rate, weigh, decide | this file | Findings, strengths, verdict |

Run only the steps that apply: R8 for diagrams, R9 for documents, R4 when decisions are shown or implied, R2's stand-alone check when the artefact must work without its author. Never skip R1 and R3.

## R1–R3 first, always
- Fill the intake card. Missing audience or medium → assume, mark `(assumed)`, list under ASSUMPTIONS, and add an OPEN QUESTION only if the answer would change a severity. Never block: agent callers cannot reply.
- Write the purpose line into AUDIENCE.
- Run the one-sentence test. If it fails, that is usually the first finding, and later findings should be written so they help fix it.
- For diagram code, render mentally (list elements, groups, relationships) and run the render check from `10` before anything else.

## Lenses
Each finding carries one primary lens:

| Lens | Covers | Main steps |
|---|---|---|
| Audience fit | Reader job, depth, notation fluency, vocabulary | R1, R6 |
| Reading situation | Medium limits, stand-alone readiness, live delivery, time-zone fairness | R2 |
| Purpose & ask | Message, answer first, explicit ask, order, balanced argument | R3 |
| Decision trace | decision record quality, links between concerns, decisions and views, design proposal close | R4 |
| Abstraction | One level per view, zoom paths, set coverage, splitting | R5 |
| Notation | Key, arrow rule, labels, vendor symbols, structure vs behaviour | R6 |
| Consistency | Same names, shapes, colours and rules across the artefact and set | R6, R9 |
| Accessibility | WCAG-based checks, text alternatives, cognitive and language load | R7 |
| Clarity | Colour discipline, layout, density, honest emphasis | R8 |
| Wording | Plain language, term register, document kind, headings | R9 |
| Missing context | Title, scope, level, status, date, owner, omissions declared, glossary | R1, R8, R10 |
| Maintainability | Source, single source, render errors, ownership, freshness | R10 |

## Writing a finding
- **Title**: specific ("Arrows mix initiator and data direction at the lab boundary"), never generic ("Arrow issues").
- **Lens**: one.
- **Where**: the exact element, line, label, heading, slide or sentence, quoted.
- **Issue**: which reader will misread or fail to act, and how. Tie it to a reader job (`01`), not to taste.
- **Fix**: one concrete change: rewritten label or sentence, the split, the key entries, a short valid code fragment.
Merge systematic problems into one finding with two or three examples. Aim for the five to ten findings that matter most; mention "further minor issues" in one line if needed.

## Severity
Rate by consequence for the reader and the decision, not by distance from a style guide or effort to fix.

| Severity | Test | Typical cases |
|---|---|---|
| **Critical** | A reader is likely to reach a materially wrong conclusion that drives a decision, build, approval or assurance statement | Undeclared omission of a data flow, processor or dependency (C8 = 0) in an artefact for approval or assurance; ambiguous direction or protocol across a trust boundary; recommendation contradicting the document's own evidence; secrets or personal data exposed in the artefact |
| **High** | The primary reader cannot get the main message or cannot act | Depth gap of two or more steps for the primary job; no discernible purpose; buried or missing ask on a decision artefact; decision-critical meaning by colour alone; strict notation the readers cannot read, without a key; mixed levels hiding the structure; render failure before circulation; two or more stand-alone readiness failures for a distributed audience |
| **Medium** | Comprehension slowed or partial; secondary readers affected; drift risk | Depth gap of one step; incomplete key; unlabelled or "uses" relationships; divergent copies; trace level one below required; Document Fitness 6–8 |
| **Low** | Polish | Minor wording, small inconsistencies, alignment, a missing date on an internal sketch |

**Weighting**: raise one level (to a maximum of Critical) when the artefact supports an approval, is shared outside the organisation, or concerns security, privacy or safety. Lower one level for an artefact explicitly marked as a sketch for discussion, except for Critical exposure of sensitive data.

### Calibration examples
| Case | Rating | Why |
|---|---|---|
| HarbourLine target data-flow view for the privacy officer omits the on-board offline ticket store holding passenger data | Critical (Clarity) | Sign-off on an incomplete picture of personal data |
| VetFlow container view arrows to the lab partner point both ways with two rules; used by the security team to decide firewall direction | Critical (Notation) | Wrong conclusion at a trust boundary |
| GridShare funding proposal to the member assembly: recommendation on page 9, no decision date | High (Purpose & ask) | Approve readers will not find the ask |
| HarbourLine board slide: 22-box container view, no context view | High (Abstraction) | Two-step depth gap for Approve readers |
| VetFlow decision record accepted, not linked from any view | Medium (Decision trace) | T1 where T2 is expected |
| GridShare view: four relationship labels say "uses" | Medium (Notation) | Builders must guess the interaction |
| VetFlow repository front page calls the same service "Records" and "Clinical Records Store" | Low (Consistency) if the context makes it obvious; Medium if both names appear in one view | Reconciliation cost |

## Strengths
Name what already works and should be kept: a clear context view, a complete key, consistent names, an answer-first summary, a decision record with honest negatives, generated views. Specific praise makes the findings credible and stops authors from "fixing" good parts.

## Verdict rules
| Verdict | Rule |
|---|---|
| **Ready** | No Critical or High findings; DCS ≥ 14 and Document Fitness ≥ 9 where scored |
| **Ready with fixes** | High findings only, each with a clear local fix (relabel, add key, add ask, add text alternative); list them as conditions |
| **Rework** | High findings caused by structure (wrong level, wrong reader job, several purposes in one view, no narrative order) that local edits cannot fix; or DCS 6–9; or Document Fitness 3–5. Recommend the restructure |
| **Start over** | A Critical finding that makes the artefact wrong at its core, or no identifiable purpose or reader; or DCS ≤ 5 with C8 = 0. Recommend starting from a purpose line and a context view |

A single Critical finding with a clear local fix (add the omitted store, fix one arrow) gives **Rework** unless it is fixed before circulation; say so in the verdict line. If the caller asks to call an artefact Ready while a Critical stands, keep the rating and state what would change it.

**Confidence**:
- High — artefact seen in full (code or detailed description), audience and medium given.
- Medium — one of audience or medium assumed, or some criteria not judgeable (`n/j`).
- Low — prose description of a visual, with audience and medium both assumed.

## Output discipline
- Findings ordered by severity, then by impact on the primary reader.
- Score lines (DCS, F-score, trace level, AR/A/U failures) in one compact line under ARTIFACT when computed.
- Fix fragments short and syntactically valid; test mentally against the stated renderer.
- Do not rewrite the whole artefact in `review`; offer `draft`.
- Content concerns: one line under OPEN QUESTIONS, "Content question for Pallas: …" or "for Metis: …". Never rate them.
- Sensitive content (credentials, personal data, confidential client names) in the input: do not repeat it; raise it as a Critical finding with a redaction fix.

## Recurring problems and their usual fix
| Pattern | What readers suffer | Usual fix |
|---|---|---|
| One picture for every reader job | Sponsors lost, builders under-served | Context view for all; container and dynamic views for builders (`05`) |
| Lines that all say "uses" | Interaction guessed | Verb phrase plus technology (`06`) |
| Two arrow rules | Wrong initiator assumed | One rule, keyed; redraw exceptions (`06`) |
| Peers from different levels | Structure hidden | Move detail to a zoomed view, link it (`05`) |
| Colour confetti | Eye drawn to nothing in particular | One colour dimension, greys for context, key (`08`) |
| Status by fill alone | Missed by many readers and printers | Text tags or border styles (`07`) |
| Unlabelled vendor symbols | Opaque outside that cloud | Name and service on each symbol (`06`) |
| Deep enclosure | Grouping meaning lost | One grouping dimension, ≤ 3 levels (`08`) |
| No title, key, date or owner | Scope and currency unknown | Add them (`08` C1, `10` U4) |
| Detail before frame | Readers hold detail with nowhere to put it | Purpose, message, context view first (`03`) |
| Ask on page 9 | Decision missed | Answer-first paragraph with ask and date (`03`) |
| Steps for three flows on one structural view | Structure and behaviour both unclear | Clean structural view plus one dynamic view per flow (`06`) |
| Polished speculation | Draft read as agreed | DRAFT label, sketch style, options side by side (`08`) |
| Undeclared omission | Simpler-looking design than reality | Show it, or state the omission (`08` C8) |
| Abbreviation wall | Mixed readers lost | Expand on first use; term register (`09`) |
| decision record as after-the-fact justification | Trade-offs invisible | Real options, negatives, decision-makers, date (`04`) |
| design proposal that never closes | Nobody knows what was agreed | Close date, decider, outcome decision record (`04`) |
| Pasted copies drifting | Readers see contradictions | Single source, embeds (`10`) |
| Poster-size diagram on a big screen | Unreadable in the room | Split, enlarge, key on each slide (`02`) |
| Decisions only in a call | Absent colleagues learn late or never | Written decision log within a day (`02` AR5) |

## Knowledge-graph output (optional, for orchestrators)
When an orchestrator asks for it, express findings as graph facts so they can be merged across reviews:
`(:Finding {id, severity, lens})-[:ABOUT]->(:Element|:View|:Document)`, `(:Finding)-[:AFFECTS]->(:ReaderGroup)`, `(:Finding)-[:RESOLVED_BY]->(:Fix)`. The structured JSON in SKILL.md stays the default contract; graph facts are an add-on.
