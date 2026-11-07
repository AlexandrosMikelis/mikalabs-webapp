# Recording and testing decisions: trade-off sheets, ADRs and scenario reviews

Use in `design` (the `ADR:` field and the `CANDIDATES` table), in `review` (the decisions lens) and for questions about decision-making, ADRs, ATAM or architecture documentation.

## Which decisions deserve a record?
Use the decision-weight score in `01` (reversal cost + reach + quality divergence). A total of 6 or more means a full ADR; 3–5 means a short note. Extra signals that push a decision up:
- it changes how a top-3 quality is delivered;
- it changes how parts depend on or talk to each other;
- it adds or removes a dependency on a technology, vendor or external party;
- it sets a rule others must follow ("modules never read each other's tables", "cross-team calls go through published contracts");
- left alone, several teams would decide differently and the inconsistency would hurt.

A technology choice is heavy when it changes qualities (a log-based broker versus a work queue changes replay, ordering and fan-out) and light when it does not (two equivalent JSON libraries).

## How does Pallas compare options for one decision?
The MIKA trade-off sheet. Run it for every heavy decision Pallas recommends.

1. **Frame it.** One sentence: what must be decided, by when, and why now.
2. **List real options.** At least two, usually three. Include "keep what we have" or "the simplest thing" where it is plausible.
3. **Choose the criteria.** The top-3 quality targets plus the binding constraints (cost, skills, time). Long criteria lists bury the decisive ones.
4. **Assess each cell in words.** For each option × criterion write *helps / neutral / hurts* and one reason. Words with reasons are more honest than invented numbers. (The style-fit scoring sheet in `09` adds numbers only as a cross-check.)
5. **Hunt the bill** (P1 in `01`). For each option: what becomes harder to change, test, run, secure or explain? Which new failure modes appear? Who must learn something new?
6. **Decide and name the losers.** State what is given up and why that is acceptable here.
7. **Set revisit triggers.** Measurable conditions that would reopen the decision.

### Worked sheet (house example)
Decision: a community energy co-op bills members under 14 regional tariff schemes, each with its own rules for feed-in credits and peak charges. Where should scheme-specific rules live?

| Criterion | Conditionals in billing code | Rules held as data in a rules engine | Tariff plug-ins on a stable billing core |
|---|---|---|---|
| Configurability [top] | hurts — each scheme change needs a developer and a release | helps — analysts edit rules without a release | helps — new scheme is a new plug-in; core untouched |
| Testability [top] | hurts — branches multiply with each scheme | neutral — rules testable as data, engine behaviour opaque | helps — each plug-in tested alone against the core contract |
| Simplicity | helps at 2 schemes, hurts at 14 | hurts — new tool and skills | neutral — needs a contract and a registry |
| Billing run time | helps — fastest | hurts slightly — engine overhead per bill | neutral — near-native if in-process |
| Governance | neutral — code review only | hurts — rule edits need their own approval trail | neutral — contract versioning needed |

Conclusion shape: "Tariff plug-ins on a stable billing core (a microkernel shape), because configurability and testability are top-3 and schemes keep being added; we accept the cost of designing and versioning the plug-in contract. Revisit if the co-op wants analysts rather than developers to own rule changes — then a rules engine wins."

## What goes into an ADR?
An architecture decision record captures one decision in a short document kept with the code or the architecture docs. Michael Nygard's 2011 post introduced the lightweight form (title, status, context, decision, consequences); the MADR template (adr.github.io/madr) adds explicit options and decision drivers. Pallas uses a seven-part form that adds governance and revisit triggers:

| Part | Content | Tip |
|---|---|---|
| **Title** | Number + short phrase naming the choice | "ADR-007: Run ticket sales as a separate queue-fronted service" |
| **Status** | Proposed · Accepted · Superseded by ADR-n · Rejected · Deprecated | Never delete; link superseded and superseding both ways |
| **Context** | Drivers, top-3 targets, constraints, options considered | Neutral and factual; show what was rejected and why |
| **Decision** | "We will …", then the reasons | Lead with the choice; reasons tie back to quality targets |
| **Consequences** | What gets easier, what gets harder, follow-up work | Negative consequences are mandatory |
| **Governance** | How compliance is checked; revisit triggers | Review, architecture tests, fitness functions (depth → **Chronos**) |
| **Notes** | Owner role, date, approvers, related ADRs | Light; helps audits |

### Status life cycle
*Proposed* (open for comment, ideally with a closing date) → *Accepted* (in force) → *Superseded* (replaced; both records link). *Rejected* keeps a debate from restarting; *Deprecated* marks a decision no longer relevant.

Approval depends on reach: one team's lead for team-local decisions; wider sign-off for cross-cutting, costly or security-relevant ones. Write the approval rules down once, as an ADR of their own.

### Writing guidance
- One decision per ADR; split compound decisions.
- One or two pages; link deeper analysis.
- Write the context for someone joining in two years who wonders why the obvious alternative lost.
- Keep ADRs in version control, searchable, next to the code or in a shared architecture repository.
- Never rewrite an accepted decision; supersede it.

### What ADRs give an organisation
A shared memory of decisions; faster onboarding; fewer repeated debates; an audit trail for regulators; a basis for governance; clarity about what is settled and what is open (P4 in `01`).

### ADR template Pallas outputs
```
ADR-<n>: <decision phrase>
Status: Proposed
Context: <drivers, top-3 targets, constraints; options considered: A, B, C>
Decision: We will <choice>, because <reasons tied to targets>.
Consequences: + <easier> · − <harder / given up> · follow-up: <work>
Governance: <checks, who runs them; revisit triggers>
Notes: <owner role, date, related ADRs>
```

## How can a design be tested against scenarios before it is built?
The **Architecture Tradeoff Analysis Method (ATAM)** is public SEI work (Kazman, Klein and Clements; SEI technical reports from 2000 onward). In outline:
1. Present the business drivers and the architecture.
2. Identify the architectural approaches used.
3. Build a utility tree of prioritised quality scenarios (`03`).
4. Analyse the approaches against the high-priority scenarios, finding **sensitivity points** (a quality depends strongly on one decision), **trade-off points** (one decision moves several qualities in opposite directions), **risks** and **non-risks**.
5. Brainstorm and prioritise more scenarios with a wider group.
6. Re-analyse and present risk themes linked to drivers.

A full ATAM takes days and many people. Lighter versions are common: a half-day session on the top five scenarios, risk storming on a diagram, or a pre-mortem. Pallas's `review` (`10`) borrows the core move: run the top-3 targets as concrete scenarios against the structure, and report sensitivity and trade-off points as findings.

## What should the architecture documentation contain?
- **Diagrams**: C4 context and container views at minimum (`01`); every arrow labelled with what flows and whether it is synchronous.
- **Decision log**: the ADRs.
- **Quality register**: the shortlist with measures, owners and how each is verified.
- **Component catalogue**: components with responsibilities and owning teams.
- For a fuller structure, the arc42 template or an ISO/IEC/IEEE 42010-style description.
Keep it light and near the code; stale documents mislead.

## Decision-hygiene problems to report in reviews
| Problem | What it looks like | Typical severity |
|---|---|---|
| **Unrecorded decisions** | choices live in chat or meetings only; nobody can say why | Medium; High if the decision is being undone by accident |
| **Revolving debates** | the same choice is reopened every few months because the reasons were never written | Medium |
| **Stalled decisions** | nobody decides for fear of being wrong; teams diverge | High when teams are already building incompatible things |
| **Choice without context** | ADRs state the outcome but not the forces, so nobody can tell when it stops being valid | Low–Medium |
| **Unwatched decisions** | rules recorded but never checked; drift follows | Medium; add governance (→ **Chronos**) |
| **Decisions that never lose** | records with no negative consequences, so trade-offs are invisible | Low |
