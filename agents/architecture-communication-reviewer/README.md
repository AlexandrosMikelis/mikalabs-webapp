# Iris — Architecture Communication Reviewer by MIKA Labs

A reviewer for how architecture is communicated, for people and for other AI agents. Named after the messenger of the Greek gods, whose sign is the rainbow. Works with any capable LLM: ChatGPT, Gemini, Copilot, Claude, Mistral, local models and any API or agent framework. Free to download and use.

**Tier: worker.** Iris does one specialist job — judging and improving how clearly an architecture is communicated — and returns results that people can act on and orchestrator agents can parse. It does not decide strategy or architecture style; it makes sure whatever was decided is understood.

## What it does
- **Reviews** a diagram (described in text, or as Structurizr, C4, PlantUML or Mermaid code), an architecture or design document, an architecture decision record (ADR), a design proposal (RFC), a slide outline or a documentation set. It follows its own eleven-step procedure (artefact and readers → reading situation → purpose and ask → decision traceability → views and levels → notation → accessibility → visual clarity → wording → upkeep → verdict). Findings are rated Critical/High/Medium/Low, each with the exact place and a concrete fix (often a rewritten label, sentence or diagram fragment), with MIKA scores where they apply: the Diagram Clarity Score (out of 16), the Document Fitness Checklist (out of 10) and a decision trace level. Ends with a verdict: Ready / Ready with fixes / Rework / Start over.
- **Drafts** a well-structured diagram spec (Mermaid, C4-PlantUML, Structurizr DSL, D2) or a document outline from your notes or a system description, for a stated audience: key message, ordered view set, legend, accessibility notes and what to produce next.
- **Answers** questions on architecture diagrams, C4 and arc42, decision records and design proposals, clear prose, documentation structure (Diátaxis, docs-as-code), accessible diagrams (colour and contrast), decision documents that get decided, and sharing architecture with colleagues who read it without the author present.

## How to use it
**As a person**: paste the artifact, describe the diagram, or ask the question. Examples:
- "Review this Mermaid diagram for our steering committee: [paste]"
- "Review this decision record before I circulate it: [paste]"
- "Draft: overview and runtime-parts views of our ferry booking platform, for new developers. Notes: [paste]"
- "How do I make a status-coloured roadmap diagram accessible?"
- "Our architecture review is a weekly call across three continents. How should we run it?"

**From another agent**: send the request with optional headers:
```
MODE: review
FORMAT: structured
CONTEXT: audience = executive steering group; medium = projected slide; decision needed on platform funding
<artifact or description>
```
With `FORMAT: structured`, reviews and drafts come back as JSON. It never waits for answers: it states its assumptions and lists the open questions that would change a rating.

**Works alongside**: Metis (strategy: what to do and why) and Pallas (architecture style and structural trade-offs). Iris flags content questions for them and stays on communication.

## What it's built on
Open frameworks, standards and widely used practice: the C4 model, arc42, ISO/IEC/IEEE 42010:2022, the 4+1 view model, UML 2.5.1, ArchiMate 3.2, architecture decision records (Nygard, MADR 4.0, Y-statements), ISO/IEC 25010:2023, Diátaxis, docs-as-code and diagrams-as-code (Structurizr DSL, C4-PlantUML, PlantUML, Mermaid, D2), WCAG 2.2, plainlanguage.gov and the GOV.UK style guide, the pyramid principle and SCQA, and GitLab's public handbook on asynchronous work. MIKA adds its own rubrics: reader jobs and the depth ladder, the Diagram Clarity Score, the Document Fitness Checklist, the accessibility gate, the decision trace levels, and the stand-alone readiness and upkeep checks.

## Limits
- **Communication review, not design review.** It judges whether an artifact will be understood correctly; it does not rate whether the architecture or strategy is right.
- **Not an accessibility audit or legal advice.** Accessibility points are checks on what you describe or paste; confirm conformance with proper testing and your accessibility lead.
- It sees what you give it. A prose description of a diagram loses layout, colour and size; paste the diagram code or describe these explicitly for a fuller review.
- Diagram tool syntax was checked on 1 Nov 2026; features change, so test generated specs in your renderer.
- Provided as is, without warranty. You are responsible for the decisions you make with it.

## Install
See **`INSTALL.md`** for step-by-step setup in ChatGPT, Gemini, Copilot, Claude, Mistral, local models and APIs. In short:
- **Instructions**: `system-prompt.md` (paste into any tool's instructions / system prompt field).
- **Knowledge**: the 11 files in `references/` (upload as knowledge files).
- **One file only?** Use `architecture-communication-reviewer-all-in-one.md`.

## Maintenance
Re-check `references/05-views-levels-and-the-model.md`, `references/07-accessibility-checks.md` and `references/10-diagrams-as-code-and-upkeep.md` each half-year and when a diagram tool changes its C4 support or a new accessibility guideline version is published.

---
MIKA Labs · mikalaboratories.com · info@mikalaboratories.com

Independent work by MIKA Labs, written in its own words.
