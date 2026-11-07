# Step R10 — Will this stay true after the next change, and does it render?

An artefact that was clear on the day it was written starts to tell a false story once the system moves on and nobody updates it. This step checks the source, ownership and freshness of diagrams and documents, and whether diagram code renders. Findings from this step use the lens "Maintainability".

Grounding: the docs-as-code practice (plain-text docs kept in version control, reviewed in pull requests and published by CI); the public documentation for Structurizr DSL, C4-PlantUML, PlantUML, Mermaid and D2; adr-tools and similar decision record tooling; and MIKA's upkeep check below. Tool features were checked on 1 November 2026; syntax moves, so tell callers to test generated specs in their renderer.

## Why source matters for communication
- **Copies drift.** The same context view pasted into five pages becomes five slightly different diagrams; readers cannot tell which is right.
- **Images cannot be searched or diffed.** A flat image export in a wiki hides names from search and changes from review.
- **Model-based views stay consistent.** One model, many views: names and relationships agree by construction (`05`).
- **Text sources enable accessibility.** A text model can produce relationship lists for text alternatives (`07`).

## Choosing a diagrams-as-code tool
| Tool | Model or drawing? | Strengths | Watch for |
|---|---|---|---|
| **Structurizr DSL** | Model with views | C4-native; one model, many views; tags and styles; renders via Structurizr tools and exports to PlantUML, Mermaid and others | Layout control is limited with auto-layout; learning curve for the workspace model |
| **C4-PlantUML** | Drawing per diagram, shared includes possible | C4 macros (`Person`, `Container`, `Rel`), `SHOW_LEGEND()`, mature PlantUML ecosystem | Each diagram is separate unless includes are disciplined; Graphviz layout quirks |
| **PlantUML** | Drawing | Wide UML coverage (sequence, component, deployment, state, activity) | Loose use of UML shapes; large diagrams lay out poorly |
| **Mermaid** | Drawing | Renders natively on GitHub, GitLab and several wiki platforms; flowchart, sequence, state, ER; `accTitle`/`accDescr` | Its C4 support was still marked experimental when checked; the `architecture` diagram type was in beta; limited layout control |
| **D2** | Drawing | Readable syntax; containers, layers and scenarios for multi-step views; several layout engines (dagre, ELK, and the commercial TALA) | Smaller ecosystem; rendering needs the D2 CLI or a plugin |
| **ArchiMate tools** (e.g. Archi, open source) | Model with views | Formal enterprise models; exchange format from The Open Group | Readers need ArchiMate fluency (`06`) |

Advice:
- Prefer a model-based tool when the set has more than three or four views of the same system.
- Prefer Mermaid when the docs live in a code platform that renders it natively and diagrams are small.
- Whatever the tool, keep the source next to what it describes (the repo of the system, or the architecture repo) and render in CI.

## Minimal patterns
Structurizr DSL (one model, two views):
```
workspace "HarbourLine booking" {
  model {
    passenger = person "Passenger" "Books and changes sailings"
    booking = softwareSystem "Booking platform" {
      api = container "Booking API" "Creates and changes reservations" "Java"
      db = container "Booking DB" "Stores reservations and sailings" "PostgreSQL" "Database"
    }
    sms = softwareSystem "SMS provider" "Sends text messages" "External"
    passenger -> api "Books sailings using" "HTTPS"
    api -> db "Reads and writes" "SQL"
    api -> sms "Sends cancellation notices via" "HTTPS"
  }
  views {
    systemContext booking "Context" {
      include *
      autoLayout lr
    }
    container booking "Containers" {
      include *
      autoLayout lr
    }
    styles {
      element "Database" {
        shape cylinder
      }
      element "External" {
        background #999999
      }
    }
  }
}
```

C4-PlantUML (one container view with a generated key):
```
@startuml
!include <C4/C4_Container>
title VetFlow — containers — lab results (2026-10)
Person(vet, "Veterinarian", "Reads lab results")
System_Ext(lab, "Lab partner", "Runs tests")
System_Boundary(vf, "VetFlow") {
  Container(gw, "Lab results gateway", "Kotlin", "Fetches and normalises lab results")
  ContainerDb(rec, "Clinical records store", "PostgreSQL", "Holds clinical records")
}
Rel(gw, lab, "Fetches results from", "HTTPS, every 5 min")
Rel(gw, rec, "Writes results to", "SQL")
Rel(vet, rec, "Reads results from", "via clinic app")
SHOW_LEGEND()
@enduml
```

D2:
```
direction: right
meters: Smart meters
ingest: Ingest service
tsdb: Readings store {shape: cylinder}
meters -> ingest: sends readings to (MQTT)
ingest -> tsdb: writes readings to
```

## Render check
For diagram code in a review, check before judging layout:
- Undefined aliases, unclosed braces or boundaries, misspelled keywords, missing `@startuml`/`@enduml`.
- Elements defined but not included in any view (orphans), or relationships to undefined elements.
- Features not supported by the caller's renderer version (Mermaid features vary by platform).
A render failure is a finding (lens: Maintainability): High if the artefact is about to be circulated, Medium otherwise. Give the corrected fragment.

## Layout hints for auto-layout tools
- Set the direction (`autoLayout lr`, `direction: right`, `LAYOUT_LEFT_RIGHT()` in C4-PlantUML, `flowchart LR`).
- Group with boundaries only where grouping has meaning.
- Order definitions to suggest rank; some tools offer hidden or layout-only relationships to nudge placement.
- If auto-layout cannot produce a readable result, that often signals too many elements: split (`05`).

## Ownership and freshness
- **Owner**: a named person or team per view and document, visible on it.
- **Status**: draft, proposed, accepted, replaced (`04`).
- **Last reviewed date**: separate from last edited; reviews confirm it still matches the system.
- **Review trigger**: on each change that touches the elements shown (a pull-request checklist item), and on a calendar cadence (for example every six months).
- **Retirement**: replaced artefacts are marked and linked to their replacement, not silently deleted, so old links still explain.

## Single source, many renderings
One source can produce:
- a sparse slide version and a dense reference version (`02`),
- diagrams embedded in several documents by reference (include or embed, not copy),
- text alternatives and relationship lists (`07`),
- an element inventory for the term register (`09`).

Check that embeds point to the source and that no hand-edited copies exist.

## MIKA upkeep check (U1–U6)
| # | Check | Met when |
|---|---|---|
| U1 | Source kept | Editable source (DSL, code, model file) exists and is linked |
| U2 | Single source | No divergent copies; embeds or includes only |
| U3 | Renders | Code renders without errors in the target renderer |
| U4 | Owner and status | Visible on the artefact |
| U5 | Fresh | Last reviewed within the agreed cadence, or since the last change to shown elements |
| U6 | Versioned and reviewed | In version control; changes reviewed like code |

Severity: U2 failing with visible differences between copies → Medium; High if a copy shown to Approve or Assure readers is wrong. U3 → see render check. U5 failing on a reference artefact used for operations or audit → High. Others → Medium or Low.

## Knowledge-graph mapping
Upkeep data fits naturally on the model graph: `(:View {source, renderer, lastReviewed, status})-[:OWNED_BY]->(:Team)`, `(:Document)-[:EMBEDS]->(:View)`, `(:View)-[:SHOWS]->(:Element)`, and `(:Change)-[:TOUCHES]->(:Element)`. A query for views showing an element touched by a change after the view's `lastReviewed` gives a precise stale-view list for an orchestrator.

## House examples
- *VetFlow* has the context view as a flat image export in four wiki pages; two still show a retired fax gateway. U1, U2 fail. Finding: Medium (High for the onboarding page). Fix: move to Structurizr DSL in the architecture repo; embed the rendered SVG from CI.
- *HarbourLine*'s Mermaid C4 code uses a keyword unsupported by the wiki's older Mermaid version and shows as an error block. U3 fail before a board pack goes out. Finding: High. Fix: rewrite as a flowchart with a key, or upgrade the renderer.

## Review checks for this step
Run U1–U6 where the input allows; run the render check on all diagram code; recommend the lightest tool change that fixes drift.
