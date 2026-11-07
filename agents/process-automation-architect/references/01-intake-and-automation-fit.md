# Step 1 of Ergane's method: intake and automation fit

Use first in every mode. Before anything is modelled, Ergane pins down what the work looks like and scores whether a stateful coordination runtime is worth it at all. The scoring rubric below is MIKA's own; it combines the pattern research of van der Aalst, ter Hofstede and colleagues (workflowpatterns.com) with the operational questions that cloud durable-execution services force you to answer (for example AWS Step Functions and Temporal).

## What does Ergane need to know before judging anything?
Ask for, or assume and record, the following intake sheet. Agent callers cannot answer back, so every gap becomes a stated assumption plus an open question.

| Field | Question | Example (veterinary clinic network) |
|---|---|---|
| Trigger | What starts one case? | A GP clinic refers a dog to the orthopaedic centre |
| Outcomes | Which ways can a case end? | Appointment booked; referral declined; owner withdrew; expired |
| Horizon | How long does one case live, from trigger to outcome? | 2 to 30 days |
| Participants | Which roles, partners and systems take part, and through which interface (API, file, screen only, email, phone)? | Referring vet, triage nurse, specialist, pet insurer (portal only), practice management system (REST API) |
| Volume | Cases per day or month; peaks | ~400 referrals a month, Monday peak |
| Variability | Is the order fixed, fixed with known variants, or chosen case by case by an expert? | Mostly fixed; complex cases need a specialist call first |
| Rules | Which decisions follow written policy? | Urgency class from symptoms and age |
| Obligations | Legal deadlines, audit duties, data-protection limits | Clinical record retention; insurer pre-authorisation windows |
| Pain | Where do cases stall, get lost or get redone? | Insurer replies by email and nobody chases them |

Turn the walk-through into numbered clauses ("referral arrives as PDF → nurse re-keys it → nurse calls insurer → …"). Each clause is a candidate step for `02`.

## How is the shape of a case described?
Ergane characterises every request on three axes instead of putting it into a fixed category. The combination drives the rest of the method.

| Axis | Values | What it changes |
|---|---|---|
| **Horizon** | sub-second · minutes · hours to days · weeks or longer | Whether persisted state, timers and versioning of in-flight cases matter |
| **Participants** | systems only · people and systems · several organisations | Need for work items, matching replies to cases, contracts across boundaries |
| **Path predictability** | fixed · fixed with enumerable variants · expert-driven | Flow diagram (BPMN), flow plus decision tables (DMN), or case handling (CMMN, see `05`) |

Write it as one line, for example: *"days · people and systems · fixed with variants"*. In the `assess` output this line fills `PROCESS TYPE`.

## The Ergane fit score: is a coordination runtime worth it?
Score six factors from 0 to 5. The total (0–30) sets the recommendation. The factors are deliberately concrete so two reviewers reach similar numbers.

| Factor | 0 | 1–2 | 3 | 4–5 |
|---|---|---|---|---|
| **V Volume** (cases per month) | one-off | < 50 | 50–5,000 | > 5,000, or bursts the team cannot absorb by hand |
| **D Duration** (one case) | < 1 s, retry the whole thing | seconds to minutes | hours | days, weeks, months |
| **I Integration count** (distinct systems or partners touched) | 1 | 2 | 3–4 | 5 or more, some unreliable or slow |
| **W Waiting and deadlines** | none | one simple wait | several waits or reminders | deadlines, escalations, withdrawals drive behaviour |
| **C Compliance and evidence** | none | internal reporting only | auditors ask for per-case history | regulated decisions, four-eyes rules, legal deadlines |
| **H Human judgement share** (share of steps needing a person) | 0 % | < 10 % | 10–40 % | > 40 %, or approvals with separation of duties |

Then apply one **variability adjustment**: subtract 3 when the path is expert-driven and you would be forcing it into a fixed diagram (route to case handling instead); subtract 2 when the process itself is about to be redesigned.

| Total | Engine fit | Recommendation |
|---|---|---|
| 0–9 | **Weak** | No coordination runtime. A scheduled job, a single service with a status column, a visual integration tool, or nothing. Say so plainly |
| 10–17 | **Moderate** | Lightweight durable execution: a cloud state machine (Step Functions, Logic Apps), a durable-functions orchestrator, or an in-process library in the owning service |
| 18–30 | **Strong** | A process runtime with a shared model for business and IT (a BPMN engine), or a code-first durable runtime plus a business-readable view |

Worked example: the referral process above scores V3 · D4 · I3 · W4 · C3 · H3 = 20 → Strong. A nightly export of lab results to the clinic data warehouse scores V2 · D1 · I2 · W0 · C1 · H0 = 6 → Weak: a scheduled nightly job is the honest answer.

Report the score as `FIT SCORE: 20/30 (V3 D4 I3 W4 C3 H3)` so a reader can challenge any single factor.

## Which runtime family fits once the score says yes?
Two families solve the same core problem (persisted state, waiting, retries, history). Choose by audience and by who changes the flow.

| Question | Leans model-driven (BPMN/DMN engine) | Leans code-first durable execution |
|---|---|---|
| Who must read and discuss the flow? | Process owners, compliance, operations | Developers only |
| Who changes it, how often? | Business-led changes, rule changes monthly | Engineering-led, released with code |
| Where do rules live? | DMN tables owned by the business | Code, or a rules library |
| What people need to see | Live case position on a diagram | Event history and traces are enough |
| Examples | Open-source and commercial BPMN engines (Flowable, jBPM and others) | AWS Step Functions (Amazon States Language, visual editor), Temporal, Azure Durable Functions, Restate |

Code-first runtimes rebuild state by **replaying** an event history, so orchestration code must be deterministic (Temporal and Azure orchestrator documentation both state this constraint). Model-driven engines persist the position in the diagram instead. Mixing is common: a BPMN diagram for the business-visible flow, code-first workflows for internal technical sequences behind one step.

## What should be recommended instead when the score is low?
| Option | Good for | Breaks when |
|---|---|---|
| Status column plus scheduler in one service (cron, EventBridge Scheduler invoking a Lambda function) | Short, stable flows with one owning team | Schedules drift from logic; nobody can answer "where is case X?" |
| Nightly job | Periodic bulk work, reconciliation | Per-case waiting and per-case errors are needed |
| Queue plus worker (SQS and a Lambda consumer with a dead-letter queue) | Independent units of work with simple retry | Multi-step state, deadlines, undo steps |
| Stream processing | High-volume transformation, aggregation (hand to Nereus) | Human steps, undo steps, long per-case waits |
| Events between services, no coordinator | Broad notifications, side reactions | The core business path depends on them (see `06`) |
| Visual integration tool | Departmental glue | Core business flows needing tests, versioning, scale |

## How do the WCP pattern numbers help at intake?
The pattern catalogue numbers flow behaviours (WCP-1 Sequence, WCP-2 Parallel Split, WCP-3 Synchronization, WCP-4 Exclusive Choice, WCP-16 Deferred Choice, WCP-18 Milestone, WCP-19/20 Cancel Task/Case, WCP-12 to 15 Multiple Instances) plus data, resource and exception patterns. At intake, list the patterns the description implies. If a candidate runtime cannot express one directly (deferred choice and cancellation are the usual gaps in simple state machines), that is a selection criterion, not a footnote.

## Who handles what next door?
- Event streaming platforms, brokers, CDC pipelines → Nereus.
- Event flows that cross organisations → Okeanos.
- Where domain and service boundaries should sit → Gaia.

Ergane designs the flows that run inside and across those boundaries and the runtime that executes them.
