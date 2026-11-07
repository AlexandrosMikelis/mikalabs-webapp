# Step 3b: model quality, and where each kind of deviation is handled

Use in `design` to keep diagrams readable and in `review` to judge them. A diagram that runs but that its owners cannot follow loses most of its value: it no longer serves as the shared contract between business, developers and operators.

## How should elements be named?
| Element | Convention | Good | Poor |
|---|---|---|---|
| Activity | Verb + business object | "Check vaccination status", "Hold vehicle deck space" | "callPMSv2", "Process data" |
| Event | Object + state or past participle | "Lab result received", "Payment overdue" | "Event 3" |
| End | The business outcome | "Member admitted", "Application withdrawn" | "End" |
| Gateway | A question with "?" | "Deposit paid?" | "Check" |
| Process | Business object + result | "Admit co-op member" | "Workflow A" |

Use the vocabulary of the team that owns the process (domain language and boundaries → Gaia).

## What makes a diagram readable at a glance?
MIKA's **two-minute rule**: the business owners should be able to explain the top level in two minutes. Practical layout rules that get there:
- the main path runs straight, left to right; deviations branch above or below;
- one start per trigger and one named end per outcome;
- explicit gateways instead of conditions on flows leaving a task;
- matching split and merge gateways, aligned;
- backward flows only for deliberate, labelled loops;
- about 7–20 flow elements per level; beyond that, a sub-process or a call activity is missing.

The rule applies equally to code-first flows. In AWS Step Functions, state names should read as business steps ("Hold deck space", not "Lambda3"), Lambda functions stay single-purpose, and a nested state machine plays the role of a sub-process; the console graph then doubles as the picture owners review. In Temporal, the workflow function should read top to bottom like the main path, with activities named in business language and failure handling kept in retry options rather than in loops.

## The response-owner test: where does each deviation belong?
When something does not go as planned, ask one question: **who decides what happens next?** The answer places the handling. This test combines BPMN 2.0.2 error and escalation semantics with the retry-versus-catch split used by durable-execution runtimes (Step Functions `Retry` and `Catch` fields, Temporal retry policies with non-retryable error types).

| Who decides the response? | Class | Example | Where it lives |
|---|---|---|---|
| Business owners, routinely, as one of the normal outcomes | **Expected outcome** | Lab sample adequate / haemolysed; deck space available / full | Output variable, then a branch on its value (a Choice state in Step Functions) |
| Business owners, but it stops the step reaching its goal | **Business deviation** | Microchip number belongs to another owner; member is already registered at another co-op | BPMN error thrown by the step, caught by a boundary error event with its own path; escalation if the step may continue |
| Nobody in the business; operators and the runtime | **Technical fault** | Timeout, HTTP 503, lock conflict, rate limit | Not drawn. Retry with back-off in configuration; when exhausted, raise an incident for operators |

Map it in the runtime: in Step Functions, list the error names that signal technical faults under `Retry` and those that signal business deviations under `Catch`; in Temporal, mark business deviations as non-retryable so they surface immediately to workflow code; in a BPMN engine, map specific worker error codes to BPMN errors and let all others consume retries.

**The time escalation clause.** A technical fault that lasts long enough becomes a business matter. "Payment provider down for ten minutes" is a retry; "down for a day" means passengers need to be told. Handle the second with a timer boundary on the waiting step, not with ever longer retries.

## How does every wait get an exit?
Ask "what if it never comes?" for every work item and every external wait:
- non-interrupting deadline (timer boundary) → reminder or notice to a lead;
- interrupting deadline → reassign, give up, or take a default outcome;
- event-based gateway for races (reply, timeout, withdrawal);
- event sub-process for things that may arrive at any moment (address change, withdrawal).

An unbounded wait is allowed only with a written reason, for example a lifetime membership case that legitimately waits years for the next event.

## How many levels of model are needed?
Ergane uses **three linked layers** and never keeps two copies of the same flow:

| Layer | Contents | Owner | Link |
|---|---|---|---|
| Map | Value streams, value-stream map, capability map | Enterprise or process office | Each map node references the deployed process key |
| Flow | The deployed diagram, readable by the business at top level | The owning domain team | Calls decisions and services by stable ID |
| Implementation | Service code, worker code, DMN tables, connectors | Developers and rule owners | Versioned with the flow that calls them |

Separate "business" and "technical" copies of one diagram drift apart within weeks. One flow model with detail pushed down into sub-processes, call activities, decisions and code avoids the drift.

## Where do technical integration details go?
When one business step needs several technical moves (call system A, await a callback, transform, call system B, refresh credentials, page through results):
- collapse them into one automated step backed by code, or a call activity owned by the same team;
- show the business step at the top ("Register pet with the national microchip database");
- keep polling, pagination, credential refresh and mapping out of the business view.

## Who works on the model, and how?
- Process owners and analysts shape the "what" and the outcomes; developers add execution properties; operations checks supportability.
- One file in version control, reviewed through pull requests like code.
- Workshop order that works: main path → "what if" per step → waits and deadlines → who does what → decisions to extract.

## Review checklist for model quality
- Can the owner explain the top level in two minutes?
- Does every end carry a distinct business outcome?
- Is every wait bounded, or explicitly unbounded with a reason?
- Have expected outcomes, business deviations and technical faults each been placed by the response-owner test?
- Does every work item state who does it?
- Is any cluster of gateways really a decision table? Move it to DMN (see `05`).

## Which model smells does Ergane flag?
| Smell | Why it hurts | Repair |
|---|---|---|
| Gateway staircase encoding policy | Rules invisible to owners, every change a release | Business Rule Task + DMN |
| Hand-drawn retry loops | Clutter, inconsistent back-off | Runtime retry configuration |
| Technical steps at top level | Owners cannot read it | Push into code or a sub-process |
| One diagram spanning several departments' internals | Every internal change needs a joint release | Split by owner, connect by messages (see `06`) |
| Implicit merge | Duplicate execution | Explicit gateway |
| XOR without default | Silent stalls | Default to a person or safe end |
| Lane says one team, assignment another | Wrong people get work | Trust and fix the assignment |
| Unnamed or duplicate ends | Reporting cannot separate outcomes | Name each outcome |
| Signal used for a one-to-one message | Wakes unrelated instances | Message with correlation |
| Inline script holding business logic | Untested hidden code | Automated step backed by tested code |

## Reading an exported XML model
List starts and triggers; trace tokens through each split/merge pair; list catches and their correlation; list work items with assignment and deadlines; list automated steps with retry and error mapping; list ends; then run the checklist above. The exported XML uses the OMG namespace `http://www.omg.org/spec/BPMN/20100524/MODEL`; vendor extensions sit in their own namespaces, which is where portability problems hide.
