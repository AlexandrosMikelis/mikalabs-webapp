# Step R6 — Can readers interpret every shape, line and name, and do they mean the same thing everywhere?

Notation is a contract between author and reader: this shape means a data store, this dashed line means asynchronous messaging, this name always refers to the same thing. A contract that is unstated, incomplete or broken half-way through produces confident misreadings, which are worse than visible confusion.

Grounding: OMG UML 2.5.1; The Open Group ArchiMate 3.2; OMG BPMN 2.0.2 (also ISO/IEC 19510); the C4 model notation guidance (title, key, element type, description and technology on every element and relationship); classic data-flow diagram conventions; and MIKA's encoding register and arrow rules below.

## Which notation can these readers interpret?
| Notation | Strengths | Fits | Risks |
|---|---|---|---|
| **Boxes and lines with a key** (C4 style) | Fast, readable by anyone, notation-independent | Most audiences; context and container views | Ambiguity if the key is weak |
| **UML 2.5.1** (component, deployment, sequence, state, activity) | Precise, widely taught, tool support | Builders; detailed behaviour (sequence, state) | Unreadable for Approve readers; partial UML that uses symbols loosely misleads those who know it |
| **ArchiMate 3.2** | Links business, application and technology layers; formal relationships | Enterprise architecture; Assure readers; portfolio views | Steep for non-specialists; large symbol set |
| **BPMN 2.0.2** | Process flow with events, gateways, lanes | Business processes, orchestration | Not for structure; over-detailed for executives |
| **Data-flow diagram** | Data movement, stores, trust boundaries | Privacy and threat modelling | Silent on control flow and deployment |
| **Sequence diagram** | Order of interactions in one scenario | Build, Assure | One scenario per diagram; unreadable past ~12 participants |

Rules of thumb:
- Use the least strict notation that answers the question for the primary reader.
- If a strict notation is used, use it correctly or not at all. A diagram that borrows UML shapes with private meanings misleads every reader who knows UML.
- If the house standard is formal and the readers are not fluent, keep the formal model and add a simplified view for them, generated from it where tools allow.

## What must the key contain?
A key is required whenever any shape, colour, line style, symbol or border carries meaning that is not obvious from a label. Check that it:
- Covers **every** encoding used, and nothing that is not used.
- Sits with the view (same slide, same page), not in a separate document.
- States the arrow rule (below).
- States what is out of scope or omitted, if anything.
- Uses words, not only swatches, so it survives grey-scale printing (`07`).

C4 suggests also stating the element type in each box ("[Container: PostgreSQL]"), which makes many key entries unnecessary.

## The MIKA arrow rules
Ambiguous arrows cause more misreading than any other single element.
1. **One direction rule per view, stated in the key.** Usually "arrow points from caller to called" (dependency) or "arrow follows the data". Never both in one view.
2. **Every relationship labelled with a verb phrase**: "reserves slot in", "publishes SailingCancelled to", "reads meter readings from". "Uses" and "calls" alone say almost nothing.
3. **Technology on relationships for Build and Run readers**: "[HTTPS/JSON]", "[AMQP]", "[SFTP, nightly]".
4. **One arrow per relationship.** Two-headed arrows hide which side initiates; draw two arrows with two labels if both directions matter.
5. **Line style means one thing**: e.g. solid = synchronous request, dashed = asynchronous message. Key it.
6. **Arrows at trust boundaries are checked twice**: direction and protocol must be unambiguous where data crosses into another organisation, network zone or data class. Ambiguity here can be Critical (`11`).

## Labels on elements
Each box has:
- **Name**: the term readers use, identical across all views and documents.
- **Type** (for mixed audiences): person, software system, container, data store, external system.
- **One-line responsibility**: what it does, not what it is built with ("Holds clinical records for all clinics").
- **Technology** where it helps the reader job ("PostgreSQL 16").
- **Status tag** when the view mixes states: (new), (changed), (retiring), in text, not colour alone (`07`).

## Do vendor symbols help or hide?
Cloud vendor symbols are recognisable but carry no meaning on their own and are opaque to readers outside that cloud.
- Every symbol has a text label naming the element and the service.
- The view must still make sense with the symbols removed.
- Do not mix symbol sets from several vendors without a reason; it reads as decoration.
- Do not use a symbol in place of a responsibility ("[Lambda]" says nothing about what the function does).

## Structure and behaviour
Static structure (what exists and connects) and behaviour (what happens in order) belong in different views. Signs of a blend: ordered steps on a container view for three different flows; decision diamonds inside a deployment view. Fix: keep the structural view clean; add one dynamic or sequence view per important flow, reusing the same element names.

## Respect reader expectations
Readers bring conventions; breaking them silently costs comprehension.
- Cylinders read as data stores; people shapes as people; dashed boundaries as groupings.
- Flow running rightward or downward, for readers of rightward scripts.
- Red reads as danger or failure, green as healthy or approved, in many readers' minds. Do not use red for "new" or green for "to be removed".
- Bigger and more central reads as more important (see honest emphasis in `08`).
- Where the house style overrides a common convention, the key says so.

## The encoding register
For a single view or a whole set, MIKA builds a register of every visual encoding found. It turns "inconsistent notation" into a precise finding.

| Encoding | Meaning in view A | Meaning in view B | Keyed? | Consistent? |
|---|---|---|---|---|
| Blue fill | Internal container | External system | A only | No |
| Dashed arrow | Queued message | Queued message | Both | Yes |
| Cylinder | Database | Queue | No | No |
| Name "Records" vs "Clinical Records Store" | Same element? | | | No |

Each "No" in the Consistent column is a candidate finding (lens: Consistency); one finding per systematic problem, with examples.

## Naming discipline across a set
- One name per thing, one thing per name. "Booking service", "Reservations API" and "BookingSvc" for the same container are three names for readers to reconcile.
- Keep a term register (`09`) and use the names readers already use in the domain (the domain expert's word, not the code's abbreviation, for Approve and Learn readers).
- Element ids in diagrams-as-code match the names, so search and generated views agree (`10`).

## House examples
- *VetFlow* container view: arrows from the booking service to the reminder service point toward the reminder service, but arrows to the lab gateway point back from the gateway for "data comes from the lab". Two rules in one view. Finding: Medium, Notation; High if Assure readers use it to reason about who initiates connections across the partner boundary. Fix: state "arrows point from initiator", redraw the lab arrows, label "fetches results from [HTTPS, every 5 min]".
- *GridShare* uses an enterprise modelling language for the member assembly. Members cannot read it. Finding: High, Audience fit. Fix: keep the formal model for the board's architects; add a boxes-and-lines context view with a key for the assembly.
- *HarbourLine* deployment view: AWS service symbols without labels on 11 nodes. Finding: Medium, Notation. Fix: label each "[Ticket API — AWS Lambda]".

## Review checks for this step
- Is the notation readable by the primary reader, and used correctly if formal?
- Is there a complete key on the view, with the arrow rule?
- Are relationships labelled with verbs (and technology for builders)?
- Are vendor symbols labelled and optional?
- Are structure and behaviour separated?
- Does the encoding register show any inconsistency within the view or across the set?

## In `draft` mode
Fill the conventions field with every encoding used, the arrow rule and status tags. Name elements once and reuse the names exactly in all views of the VIEW SET.
