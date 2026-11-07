# Step R5 — Does each view answer one question at one level, and do the views fit together?

A view is a projection of the architecture chosen to answer a question for a reader. Most unreadable diagrams try to answer several questions at several depths at once. This step checks each view's question and level, then checks the set: does it cover the reader jobs, and can readers move between levels?

Grounding: ISO/IEC/IEEE 42010:2022 (concerns, viewpoints, views, model kinds); the C4 model (c4model.com, CC BY 4.0): system context, container, component and code levels, plus system landscape, dynamic and deployment diagrams; arc42's building block, runtime and deployment views; Kruchten's 4+1 view model (logical, process, development, physical, plus scenarios); Structurizr's model-and-views approach; and MIKA's view question card and set coverage table below.

## Start from a concern, not from a diagram type
42010 describes the chain: stakeholders have **concerns**; a **viewpoint** sets the conventions (model kinds, notation, rules) for addressing some concerns; a **view** applies a viewpoint to a specific system. The practical habit for communication:

1. Write the question the view answers, phrased the way the reader would ask it.
2. Pick the viewpoint that answers it (C4 level, deployment, data flow, sequence…).
3. Include only elements that help answer that question.

### MIKA view question card
Every view in a review gets one line:

| View | Question it answers | Reader job | Depth | Viewpoint / C4 level |
|---|---|---|---|---|
| HarbourLine context | What does the booking platform connect to, and who uses it? | Approve, Learn | D1 | System context |
| HarbourLine containers | What runs where, and how do the parts talk? | Build, Run | D2 | Container |
| Sailing-cancelled flow | What happens, in order, when a sailing is cancelled? | Build, Assure | D3 | Dynamic / sequence |
| Shore and ship deployment | Which parts run on board and which ashore, and what links them? | Run, Assure | D2 | Deployment |

If you cannot write the question, the view has no clear purpose (`03`). If one view needs two questions, it should usually be two views.

## The C4 levels in brief
| Level | Shows | Primary readers | Typical size |
|---|---|---|---|
| System context | One software system, its users (people) and the other systems it interacts with | Everyone, including non-technical | 5–15 elements |
| Container | The separately runnable or deployable units (applications, data stores, functions) inside the system and how they communicate | Builders, operators, architects | 5–20 |
| Component | The major structural parts inside one container and their responsibilities | Builders of that container | 5–20 |
| Code | Classes, tables, functions inside one component | Rarely drawn; generate from code when needed | — |

Supporting diagrams: **system landscape** (many systems across an organisation), **dynamic** (a sequence of interactions for one scenario, ordered), **deployment** (containers mapped to infrastructure in one environment).

Points that are often misread:
- In C4 terms, a "container" is a runtime unit, not a Docker container. Say so in the key if readers might confuse them.
- C4 is notation-independent. Boxes and lines are fine; the key is mandatory.
- Not every system needs every level. The top two levels serve most readers; component views only where a container is complex or contested.

## Other view sets readers may expect
- **arc42**: building block view (static decomposition, nested levels), runtime view (scenarios), deployment view (infrastructure), plus context and scope. Readers in organisations using arc42 will look for these names.
- **4+1**: logical, process, development and physical views tied together by scenarios. Common in older or formal documentation.
- **Data-flow views**: where data of each class travels and crosses trust boundaries. Essential for Assure readers (privacy, security); often missing.
- **Capability or value-stream maps**: business-facing; useful for Approve and Plan readers who think in capabilities, not systems.

Recommend whatever set the organisation already uses; mapping between them is easy (a C4-style runtime part ≈ arc42 building block level 1 ≈ 4+1 development/physical mix). The review question is coverage and consistency, not which brand.

## One level per view
Mixed levels are the most common structural problem. Symptoms:
- Elements of very different kinds as peers: an external organisation, a microservice, a database table and a team.
- Some boxes expanded to internals while their siblings stay as single boxes, with no reason given.
- Relationships between a box and a sub-part of another box.
- Infrastructure nodes (load balancer, VPC) mixed into a logical view.

Fix: keep one level per view; move the deeper detail into a zoomed view; link the two ("see container view: clinical records"). Partial expansion is acceptable when the view is explicitly about one area ("Lab results gateway in context"), and the title says so.

## Zoom paths
Readers need to move between levels without getting lost.
- Every element that has a deeper view links or refers to it.
- The deeper view repeats the parent element as a boundary and shows its external neighbours greyed, so the reader keeps orientation.
- Names and ids are identical across levels (`06`).
- In documents, sections follow the zoom order with breadcrumbs ("Overview → Containers → Clinical records").

## One model, many views
Drawing each diagram by hand produces copies that disagree. Model-based tools (Structurizr DSL, C4-PlantUML with shared includes, ArchiMate tools) keep one model of elements and relationships and generate views from it. Benefits for communication:
- Names, descriptions and relationships are consistent by construction.
- A change appears in every view at once.
- Views can be checked automatically (orphans, undefined elements, missing descriptions).
See `10` for tooling.

### Knowledge-graph view of the model
The architecture model is a graph: elements are nodes with a type and level; relationships are edges with a verb and technology; views are subgraphs. MIKA uses this to automate consistency checks:
- An element appearing in two views with different names or types.
- A relationship shown in a container view with no corresponding component-level relationship.
- Views whose elements span more than one level (mixed level, measured).
- Elements in no view (undocumented) or views referencing undefined elements.

## Set coverage
For the whole set (or the views an artefact implies), fill:

| Reader job present | View(s) serving it | Gap? |
|---|---|---|
| Approve | Context + one-page summary | |
| Build | Container, component where needed, key dynamic views | |
| Run | Deployment per environment, dependency map | |
| Assure | Data-flow with trust boundaries; decisions linked (`04`) | |
| Learn | Guided path from overview to runtime parts to decisions | |

A reader job present in the intake (`01`) with no view at its depth is a finding: High if that job is primary, Medium if secondary.

## Element counts and splitting
More than about 20 elements in one view usually means two questions or two levels (see also the medium limits in `02`). Split by:
- **Concern**: separate the booking path from the reporting path.
- **Area**: one view per subsystem, each with the others as greyed neighbours.
- **Time or state**: current, transition, target, each clearly titled.
Recommend splitting before recommending more detail.

## Scope drift inside a view
Watch for views that started with one question and accumulated extras: monitoring agents, every queue, team names, cost labels. Each addition may be true; together they hide the answer. Ask whether each element helps answer the view's question; move the rest.

## Levels in documents
The same discipline applies to prose:
- Summary paragraphs at D1, sections at D2, appendices at D3–D4.
- A paragraph should not jump from strategy to a configuration flag.
- Headings signal level ("Overview", "Containers", "Lab gateway internals"), so readers can stop at their depth.

## Review checks for this step
- Can you write the question for each view? Is it one question?
- Is each view at one level, with partial expansions declared?
- Is there a zoom path with consistent names between levels?
- Does the set cover each reader job at its depth?
- Are views generated from one model, or hand-drawn copies?
- Element count within reason for the medium?

## In `draft` mode
Fill VIEW SET from the view question card, widest first. Prefer the two top C4 levels unless the house set is arc42 or 4+1, in which case use those names. Add a dynamic view per critical scenario and a data-flow view when Assure readers are present.
