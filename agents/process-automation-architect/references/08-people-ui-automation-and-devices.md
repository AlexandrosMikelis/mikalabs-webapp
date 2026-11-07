# Step 7a: steps done by people, UI automation and devices

Use in `assess` when the treatment ladder (`02`) lands on **people**, **ui_automation** or **device**, and in `design` for the HUMAN TASKS block. AI steps have their own file (`09`). Public grounding: the OASIS WS-HumanTask 1.1 specification (work-item life cycle and roles), the workflow resource patterns at workflowpatterns.com (Role-Based Distribution, Separation of Duties, Retain Familiar, Escalation, Delegation), and IEEE 2755-2017 for automation terminology.

## What must be specified for every work item?
Ergane's **work-item sheet**:

| Line | Content | Example (energy co-op: approve large installation) |
|---|---|---|
| Who | Candidate group or role; a named person only for continuity | `board-technical` |
| Distribution | Pull from a shared queue, push by rule (round robin, skill, load, region, language), or a DMN decision returning the group | Pull, sorted by due date |
| Separation of duties | Who must not do it | Not the member's own sponsor |
| Retain familiar | Should the same person keep the case? | Yes, for follow-up questions |
| Due / follow-up | When it must be done; when to look again | Due P5D; follow-up P3D |
| Escalation | Non-interrupting reminder; interrupting reassignment or default outcome | Reminder P3D; reassign to chair P5D |
| Context on one screen | Data, documents, history, recommendations | Single-line diagram, roof survey, grid response |
| Outcomes | A small closed set mapped to variables | approve / reject / request_info |

Enforce separation of duties in the runtime or work-item service, never by convention. Record who completed each item and when.

## What life cycle does a work item go through?
WS-HumanTask 1.1 gives a vendor-neutral model worth borrowing even if the engine uses other names: *Created → Ready* (offered to candidates) *→ Reserved* (claimed) *→ In Progress → Completed*, with side states *Suspended, Failed, Error, Exited, Obsolete*. Ask of any design: can an item be released back to the queue, delegated, forwarded, suspended while waiting for the customer, and what happens to an item whose case was cancelled (it must become obsolete, not linger)?

## Where should people see their work?
| Option | Fits | Cost |
|---|---|---|
| Generic task list with generated forms | Internal back office, few users | Lowest; usability limited |
| Task list with custom embedded forms | Moderate volume, richer context | Moderate |
| Work surfaced in tools people already use (practice management system, CRM, chat, ticketing) via the engine's task API | Many occasional users | Integration effort, least change for users |
| Custom application on the task API | High volume, complex context | Highest build cost, best experience |

Choose by number of users, frequency and how much context a decision needs. Count the screens a person opens to finish one item; more than two is a design problem.

## Which work-item designs fail in practice?
- Assigned to named individuals, so leave or illness stops cases.
- No priority or ageing shown, so easy cases get picked first.
- An item that says only "Check case" while the facts sit in three other systems.
- Approvals that are never rejected: candidates for a decision table, sampling, or removal.
- Individual performance tracked from timestamps without agreement: a trust and, in many countries, a works-council issue. Report by team.

## When is a UI automation job acceptable?
UI automation (often called RPA) drives an application through its screens: reads fields, types, clicks. Ergane accepts it only as an **interim bridge** when a system has no API and none is coming soon.

MIKA's **bridge contract** for every UI job:
1. **Coordinated from the flow.** The flow hands the UI job one work item and awaits its result; the flow owns timers, retries and escalation.
2. **One transaction per job.** "Register meter on the operator portal", never a whole process inside the UI automation tool.
3. **Failure mapping.** UI glitches and slow screens → retries; business answers ("meter already registered") → business deviation path.
4. **Identity.** A dedicated service account, vaulted secrets, least privilege, every action logged.
5. **Exit ticket.** Each UI job is recorded as debt with the API that would replace it and a review date. When the API arrives, only the step's implementation changes; the diagram stays.
6. **No papering over.** Never use UI automation between two systems that both have APIs, or to avoid fixing a broken process.

Bridge health metrics: UI job failure rate per 1,000 jobs, mean time to repair after a UI change, and age of the exit ticket.

## How do machines and vehicles take part?
A flow can command devices: an automated step sends a command to a device gateway (for example over MQTT or OPC UA), a message catch awaits confirmation, a timer bounds the wait. Rules:
- keep high-frequency telemetry out of the flow; stream processing derives the meaningful business events ("vehicle deck loaded", "battery storage reached 95 %") and those enter the flow (streaming design → Nereus);
- never auto-retry a physical command without checking device state first (a repeated "open ramp" is not harmless);
- give every command a confirmation timeout and a safe fallback.

## How do the step types combine in one case?
Example (veterinary clinic network, prescription refill):
1. **ai_step** reads the owner's request from the app and extracts pet, medicine and dose.
2. **decide** checks refill eligibility (last examination within 12 months, controlled-drug rules).
3. **people**: a vet approves when the table says `vet_review`; due PT8H; reminder at PT4H.
4. **integrate**: the pharmacy system receives the order with key `refill-3301/order`.
5. **ui_automation** (interim): a UI job enters the dispatch in a courier portal that has no API; exit ticket opened.

Each step has its own sheet; the flow ties them together and holds the deadlines.
