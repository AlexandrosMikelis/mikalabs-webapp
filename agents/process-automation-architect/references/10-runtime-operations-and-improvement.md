# Step 8: running the runtime, changing flows safely, and improving from evidence

Use in `design` for the ENGINE and VISIBILITY blocks and in `review` for architecture, versioning and operations. Products are named only as examples of a category; verify current versions, licences and support. Sources blended here: public documentation of BPMN engines and of code-first runtimes such as Temporal and AWS Step Functions; OpenTelemetry and W3C Trace Context; the 2011 manifesto of the IEEE Task Force on event-log analysis (titled the Process Mining Manifesto); IEEE 1849 (XES). The topology chooser and the readiness checklist are MIKA's.

## Which deployment topology fits? The topology chooser
| Topology | How it runs | Pick it when | Costs to accept |
|---|---|---|---|
| **In-process library** | The engine runs inside the owning service and can share its database transaction | One team, one service, strong consistency with local data | Tied to the engine's language; upgrades per service |
| **Self-run engine cluster** | A separate service; applications talk over an API and run job workers | Several languages, independent scaling, central operations consoles | Network hop; app state and engine state only eventually consistent |
| **Managed service** | Provider runs it (Step Functions, Logic Apps, Temporal Cloud, hosted BPMN engines) | No platform team; spiky volume | Data residency, per-transition or per-action pricing, extension lock-in |
| **Code-first durable runtime** | Flow written in code; history replay rebuilds state | Developer-owned technical flows | Determinism rules for workflow code; business view must be added |

Choose by answering: How many teams and languages? Must flow state commit with local data? Who will run it at 3 a.m.? Where must data stay?

## How do job workers behave?
Remote engines publish jobs; workers in any language fetch (activate) a job, do the work and report completion or failure. Benefits: no inbound calls into services, independent scaling, natural back-pressure. Requirements: a job timeout longer than the work; heartbeats or timeout extension for long jobs; idempotent workers, because an expired job is handed out again; a retry count that drops to zero raises an incident in common BPMN job-worker engines.

## One runtime per team or one shared?
- **Per team or per service** (Ergane's default): autonomy, independent upgrades, small blast radius.
- **Shared**: fewer things to run, but coupled upgrades, noisy neighbours, blurred ownership and the temptation to reach into each other's cases. If shared: tenants or namespaces per team, deployment rights per team, and no cross-team back channels (see `06`).

## Should a team build its own engine?
Usually not. "A small state machine in a table" grows timers, retries, versioning, history, tooling, scaling and monitoring, each already available. If a team insists, list those capabilities with an estimate for each and let the value case (`02`) decide.

## Where is state persisted, and what does that mean for code?
- Model-driven engines persist at **wait states** (work items, message catches, timers, explicit async points). Between them, work may run in one transaction; a crash rolls back to the last wait state and repeats the work, so step code must tolerate re-execution.
- Place async points deliberately: before risky calls, after expensive ones.
- Code-first runtimes persist an event history and replay it; workflow code must not read clocks, random numbers or external state directly (use the runtime's APIs).
- Keep variables small; store documents elsewhere.
- Plan history retention against audit duties and storage growth; export history to an analytics store.
- Load test with realistic cases per second, steps per case, due timers and history writes; partition by business key where supported.

## How do flows change while cases are running?
- Deploying a changed definition creates a new version. New cases start on it; running cases keep theirs.
- For running cases choose per change: **let drain** (short cases), **migrate** with an explicit old-to-new activity mapping (long cases, urgent fixes), or **cancel and restart** (rare, with business consent).
- Code-first runtimes need explicit versioning of workflow code (for example Temporal patching or worker versioning, or side-by-side deployment); a non-deterministic change breaks replay of running cases.
- Services must accept calls from old and new versions until old cases drain.
- Call activities and decisions need a version binding (latest, same deployment, fixed).
- Record flow and decision versions per case.

## How are flows tested and delivered?
- Definitions are source: version control, pull-request review, CI/CD, deployed with the worker code that implements them.
- Path tests with the engine in-memory or a test runtime: drive the main path, every gateway branch, every boundary event and every compensation, with stubbed steps; assert reached steps and variables. Code-first runtimes such as Temporal offer replay tests against recorded histories.
- Decisions tested with their own case tables (`05`).
- Contract tests per integration; a few end-to-end scenarios in staging.

## What must operators and owners be able to see?
| Audience | Needs | How |
|---|---|---|
| Operators | Incidents, stuck cases, overdue timers, retry storms; inspect, retry, modify, cancel with an audit record | Engine operations console, alerts, runbooks |
| Process owners | Lead time per path, deadline hit rate, volumes, outcomes, bottlenecks | Milestone events modelled at business moments ("Deck space confirmed"), not technical ones |
| Service desk and customers | "Where is my case?" | Status API backed by case position and milestones |
| Engineers across systems | One request across many services | OpenTelemetry traces with W3C Trace Context propagation; span links connect asynchronous hops |

Propagate the business key as a span attribute and as a log field so traces, logs and run history can be joined.

On a serverless stack the same table becomes: Step Functions execution history and redrive of failed Standard executions from the point of failure for operators; CloudWatch metrics and alarms on failed, timed-out and throttled executions; X-Ray or OpenTelemetry (AWS Distro) traces across Lambda functions, SQS and EventBridge; structured JSON logs carrying the correlation ID and business key; milestone events published to EventBridge and landed in the analytics store. Alarm on dead-letter queue depth and on the age of the oldest message, not only on error counts.

## How does evidence feed improvement?
The 2011 manifesto describes three uses of event data, all useful here:
- **Discovery** before automation: reconstruct how cases really flow from system logs, including variants nobody mentioned at intake.
- **Conformance** after go-live: compare actual runs with the deployed model; deviations show workarounds and missing paths.
- **Enhancement**: overlay waiting times, rework loops and resource load on the model to choose the next change.

Practical notes: export history as XES (IEEE 1849) or, when several business objects interact, as OCEL 2.0; the manifesto's log maturity levels warn that hand-typed or incomplete logs give misleading maps; join mining results with the knowledge graph (`09`) so improvements can be traced to the model elements they touch.

## Which criteria compare engines?
Standards coverage (BPMN element support, DMN revision, CMMN), topology options, worker language support, scale and resilience, operations consoles, work-item features, versioning and migration, testing support, security (authentication, authorisation, tenancy), cloud and self-managed options, licence terms for your use (open source, source-available, commercial), vendor and community health, exit cost (share of standard versus proprietary extension).

## Go-live readiness checklist
- [ ] Every automated step has a complete call sheet (`07`).
- [ ] Every wait is bounded or justified (`04`).
- [ ] Incidents alert a named on-call with a runbook.
- [ ] Version migration rule written for long-running cases.
- [ ] Path tests cover every branch, boundary and compensation; run in CI.
- [ ] Milestones emit business events; lead-time dashboard exists with the baseline from `02`.
- [ ] AI steps have sheets, gates and audit records (`09`).
- [ ] History retention and personal-data deletion agreed.
