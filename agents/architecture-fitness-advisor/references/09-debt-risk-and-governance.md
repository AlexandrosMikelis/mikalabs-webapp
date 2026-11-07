# Debt, risk, decisions and how much governance

Checks and metrics only matter if they feed decisions. This file covers how Chronos tracks system-level debt and risk, how decisions are recorded so they can be enforced, how to judge whether governance is right-sized, and the patterns that most often block change.

## What is technical debt, and which kind matters most?
Technical debt is Ward Cunningham's 1992 metaphor for the future cost of choosing an easier or faster solution now. It has **principal** (the work to fix it) and **interest** (the extra cost paid on every change until it is fixed). Debt taken deliberately, with a repayment plan, can buy speed; unrecorded debt is the problem. Fowler's bliki adds a useful two-by-two: deliberate or inadvertent, prudent or reckless. Deliberate-prudent debt ("ship with a shared table now, split it next quarter") gets recorded; deliberate-reckless debt ("no time for design") gets challenged.

Chronos separates two layers:
- **Code debt**: complexity, duplication, missing tests. Analysers see it; one team can usually fix it.
- **System-level debt**: wrong boundaries, shared databases, module tangles, inconsistent patterns, platforms past end of support, missing isolation. Expensive, cross-team, and largely invisible to code analysers. This is where architectural attention pays most.

Structure rarely collapses in one step. Each change adds a little disorder (a dependency in the wrong direction, a pattern applied differently, a module growing past its purpose), and without steady counter-effort the cost of change creeps up. Watch the trend, not just the level.

## How should debt be tracked?
Keep a **debt register** (a backlog label or a dedicated list). Per item:
- description and location (module, service, boundary);
- type: code · structural · data · infrastructure · dependency currency;
- principal (rough effort) and **interest** (what it costs now: slower change in which areas, incidents, onboarding friction, risk exposure);
- repayment trigger ("before the fifth clinic joins", "next time the area changes");
- owner and decision (repay · accept · monitor) with a date;
- the check that stops it growing.

Prioritise by interest, not principal. High-interest debt in frequently changed areas (hotspots, `06`) comes first; debt in code nobody touches can often wait.

Repayment modes:
- **Steady**: a fixed share of capacity every iteration.
- **Opportunistic**: leave each touched area slightly better, protected by ratchet checks.
- **Planned**: a bounded initiative for large system-level debt, with temporary checks to show progress and a clear end.
- **Refactor or replace?** When the structure health score (`06`) is low on every scale, step-by-step refactoring can cost more than a staged replacement. Decide on evidence (structure scores, change-history cost, business plans), not frustration.

## How is architectural risk kept visible?
- **Likelihood × impact grid**: rate each risk area (per autonomy unit or per quality) 1–3 on each axis; the product sets colour and priority.
- **Silent-then-compare session (MIKA format)**: each participant marks risks on the architecture diagram alone for ten minutes, then the group compares. Where ratings differ, someone usually knows something the others do not.
- **Usual suspects**: single points of failure, synchronous chains, shared data, unowned components, unsupported platforms, security boundaries, peak capacity, key-person dependencies.
- **Keep it live**: revisit after major changes and incidents; for each high risk name the mitigation and the check or metric that shows it is under control; show direction of travel (improving · stable · worsening).

## Decisions that can be enforced
An Architecture Decision Record (ADR) in Michael Nygard's 2011 format records title, status, context, decision and consequences. Chronos adds three fields:
- **Enforced by**: which checks enforce the decision, where they run, what happens on failure.
- **Revisit when**: the condition that should reopen the decision (scale, cost, new regulation, end-of-support date); a scheduled check can raise the reminder.
- **Superseded by**: the replacing ADR, plus retirement of the checks tied to the old decision.

A decision with no check behind it is a hope; a check with no recorded decision is a rule nobody remembers the reason for.

## Is the governance right-sized?
Governance fails in two directions:
- **Too tight**: one mandated stack for every team, approval boards for every change, dozens of blocking rules. Delivery slows, workarounds spread, technology freezes.
- **Too loose**: every team picks anything, no shared rules. Variety without benefit, duplicated effort, security gaps, costly integration.

Chronos aims for **just enough**: a short list of estate-wide non-negotiables (security, compliance, interoperability, observability) enforced automatically; a curated set of recommended options for common needs; freedom within those limits for everything else. Govern results through checks rather than prescribing methods.

### Governance maturity ladder (MIKA)
Chronos places an organisation on this ladder in reviews and recommends the next rung, not the top one.
| Rung | Name | What it looks like | Next move |
|---|---|---|---|
| 0 | **Unwritten** | rules live in people's heads | write the five rules that matter most as ADRs |
| 1 | **Documented** | principles on a wiki, followed when convenient | turn the two most-violated rules into automated checks, warn-only |
| 2 | **Checked** | a few checks in CI, some blocking, owners unclear | give every check an owner, a threshold and a design card (`02`) |
| 3 | **Owned** | checks owned by teams, linked to ADRs, results visible | add always-on and scheduled checks; SLOs on critical journeys |
| 4 | **Measured** | scorecard reviewed quarterly, checks added and retired on evidence | estate-wide checks run centrally; check register traced to drivers |
| 5 | **Self-correcting** | teams propose, retire and calibrate checks themselves; governance cost is measured too | keep it there; audit for creep yearly |

A manual review board as the only control usually sits at rung 1, however many meetings it holds.

### Lightweight decision practices
- **Advice process**: anyone may take an architectural decision after seeking advice from those affected and those with expertise; the decision and the advice are recorded, usually as ADRs.
- **Open architecture forum**: a regular session where proposals get advice, not approval.
- **Technology radar**: published adopt · trial · assess · hold guidance on technologies.

### Estate-wide checks
- Run a short list centrally: licence compliance, critical vulnerabilities, logging and tracing standard, data-classification tags.
- Build them so a newly disclosed vulnerability can be checked in every pipeline at once, giving a fast, factual answer to "are we affected?"
- In legacy integration estates, use them to protect agreed boundaries: rules that reject new point-to-point links across them.

## Patterns that block change
Chronos's names for recurring situations, with the counter it recommends:
| Pattern | What happens | Counter |
|---|---|---|
| **The hard last mile** | a low-code or packaged tool covers most needs fast; the rest are very hard or impossible | test the hardest requirements first; keep an exit path |
| **Vendor at the centre** | a large product's roadmap dictates the architecture | put it behind an anticorruption layer; govern the integration points |
| **Borrowed internals** | code relies on undocumented behaviour of a library or platform | checks for the behaviour you rely on; wrap it in your own interface |
| **Novelty choices** | technology picked because it is new or interesting, not needed | tie choices to ranked qualities; ADRs with rationale |
| **Mis-sized governance** | too tight or too loose, as above | the maturity ladder; just-enough checks |
| **Slow release cycle** | weeks between releases mute every other practice | invest in pipeline, test automation and independent release first |
| **One fork per customer** | per-customer branches multiply maintenance | configuration and toggles instead of forks; count variants |
| **Analytics on the live store** | reporting queries dictate operational schema and load | separate analytical store or projections |
| **Plans fixed years ahead** | up-front multi-year design breeds sunk-cost attachment | short re-planning cycles, reversible decisions |
| **Single cut-over** | all-or-nothing switch, late feedback, high risk | step-by-step migration with temporary checks and side-by-side comparison |
| **Distributed monolith** | many services that must release together | autonomy-unit test (`05`), store ownership, contract tests |

## Does the organisation fit the intended structure?
- **Conway's law**: systems mirror communication paths. Teams split by technical layer produce layered coupling across every feature; organise around business capabilities when independent change is the goal.
- **Team cognitive load** (Team Topologies practice): a team owning more than it can understand lets parts decay; size ownership to what a team can sustain.
- **Intent over accident**: as organisations grow, unplanned architecture produces accidental structure. Make intent explicit (principles, ADRs, checks), use metrics to show whether intent is realised, and report progress in terms stakeholders value.

## Where should governance start?
- **What already runs**: thresholds and owners for existing coverage gates, vulnerability scans and linters.
- **What would hurt most**: the quality whose failure costs most (data loss, outage, regulatory breach).
- **Test automation**: if it is weak, checks have nowhere to run; fix that first.
- **Infrastructure as code**: hand-built environments block almost everything else.
