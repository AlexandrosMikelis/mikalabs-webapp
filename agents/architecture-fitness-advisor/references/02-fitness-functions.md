# What a fitness function is, and how Chronos describes one

A **fitness function** is any mechanism that returns an objective verdict on whether the system still has a quality it is meant to have. The name comes from evolutionary computing (genetic algorithms), where a fitness function scores how close a candidate solution is to a goal. In architecture it is a quality requirement in executable or at least checkable form.

Most teams already run several without calling them that: a test that enforces layering, a bundle-size budget in the build, a licence scan, a monitor that pages on error rate, a fault-injection experiment, a yearly penetration test. What makes something a fitness function is **intent**: it guards a named quality and has a clear pass/fail rule.

## What separates a useful check from noise?
Chronos applies six tests. A check that fails two or more is a candidate for rework or removal.
1. **Traceable.** It protects a quality the business needs (availability, ease of change, data integrity, cost), not a technique someone prefers.
2. **Objective.** Two people reading the result agree whether it passed. "The code is tidy" fails this test; "no module receives calls into its internal package from outside" passes.
3. **Bounded.** It has a threshold or acceptable band, and a defined action when it is breached.
4. **Owned.** A named team understands why it exists and can fix the cause of a failure.
5. **Affordable.** It is cheap enough to run as often as the risk requires.
6. **Revisited.** Someone decides, on a schedule, to keep, change or retire it.

## The fitness-function design card (MIKA)
Chronos describes every check on one card. The first block is always filled; the second when the estate is large or the check is unusual. The bracketed names are the field names used in structured output.

### Always filled
| Field | Values | How to choose |
|---|---|---|
| **Scope** [`scope`] | `single` · `composite` | *Single*: one concern checked in isolation (an import rule, function complexity). *Composite*: several qualities checked together because they interact (encryption overhead against latency; cache lifetime against data freshness). Composite checks cost more and usually run less often. |
| **Trigger** [`cadence`] | `on-change` · `always-on` · `scheduled` | *On-change*: runs on an event such as a commit, pull request, nightly build or release candidate. *Always-on*: watches a live signal in production. *Scheduled*: runs by calendar or elapsed time ("re-check the TLS library's support status every six months"; "warn when a framework falls two minor releases behind"). |
| **Threshold kind** [`result`] | `fixed` · `contextual` | *Fixed*: one target (zero import cycles; changed-line coverage ≥ 80%). *Contextual*: the acceptable value depends on conditions (p95 under 200 ms up to 5,000 concurrent users and under 400 ms above; an error budget expressed as a share of traffic). |
| **Execution** [`invocation`] | `automated` · `manual` | Automate where practical. Some checks stay human (legal review, accessibility testing with real users, design review); give them a schedule, an owner and a recorded outcome. |
| **Signal shape** | yes/no · number · trend | A pass/fail rule, a value compared with a threshold, or a series where the slope matters more than any reading. Decide whether results are stored and charted. |
| **Runs at** [`runs`] | laptop · pull request · pipeline stage · test environment · production · calendar job | Sets cost, feedback speed and whether a failure can reach users. |
| **Quality protected** [`characteristic`] | a named characteristic | Use a shared vocabulary such as ISO/IEC 25010:2023 (see `07`) so the check traces to a requirement. |

### Filled when useful
| Field | Values | Notes |
|---|---|---|
| **Origin** | planned · added after an incident or near miss | Expect both. Add a check readily when the same problem appears twice. |
| **Lifetime** [`lifetime`] | `permanent` · `temporary` | Temporary checks guard a migration or refactoring. Give each an end condition. |
| **Audience** | developers · operations · product · leadership | Decides where and how the result is shown. |
| **Reach** | whole estate · one system · one service · one stack | A rule may apply only to one language or one service. |

**Architecture or feature test?** If the check can be described without domain words ("no service reads another service's tables"), it is architectural and belongs on a card. If it needs domain words ("a changed pet-owner address is saved"), it is an ordinary functional test.

## Should a check govern the result or the method?
Govern the **result** you care about, not the mechanism you assume produces it:
- Instead of "every service must use retry library X", check "with the downstream service failing, the error rate callers see stays under 0.5%".
- Instead of "every endpoint sits behind the gateway", check "no service port answers from outside the cluster except through ingress" (a network probe in the pipeline).
- Instead of "functions under 30 lines", track a change-cost signal the team actually feels (hotspot effort, lead time per module).

A method rule is justified when the method itself protects a named result: a forbidden import that would bypass the authorisation layer, for example. Otherwise it freezes today's technique and blocks better ones.

## Who builds and maintains the checks?
- Architects usually state intent and threshold; developers implement; both maintain. Keep checks in version control, reviewed and refactored like any code.
- A failing check is information, not blame. Developers need to know *why* a rule exists so they fix the cause instead of silencing the check.
- Make results visible in the build summary or a shared page, so rules stay part of everyday decisions.
- No single framework covers every kind. Expect to combine rule libraries, analysers, scanners and monitors with a little glue code.

## How do you keep checks from becoming a weapon?
The aim resembles a pre-flight checklist: stop important things being forgotten under pressure. Warning signs that governance has turned into policing:
- many interlocking rules nobody can explain;
- failures that trace to no quality anyone cares about;
- teams routinely skipping or suppressing checks;
- a list that only grows.
Each check must earn its upkeep. If it protects nothing the business values, remove it.

## How should checks be recorded?
- The check itself is honest documentation because it executes, but non-technical readers cannot read it.
- Pair each significant decision with an Architecture Decision Record (Nygard's format) that adds an **Enforced by** section: which checks enforce the decision, where they run, what happens on failure (see `09`).
- Given/When/Then wording makes rules legible to product and compliance readers.
- Keep a **check register**: card fields, link to the ADR, created date and retire-by date.

Example register line (community energy co-op):
`meter-ingest-latency · characteristic: performance efficiency · composite · always-on · contextual (p95 < 5 s below 20k readings/min, < 12 s above) · automated · production · owner: metering team · ADR-014 · permanent`

## Special kinds worth knowing
- **Side-by-side comparison.** During a replacement, run old and new paths together (through a proxy or an experiment library in the style of GitHub's Scientist) and compare outputs. The mismatch rate is the metric; cut over when it stays at zero long enough.
- **Baseline-and-ratchet.** For legacy code, record today's value and fail only on regression; tighten on a schedule.
- **Estate-wide checks.** A short list applied to every system (approved licences, no known-critical vulnerabilities, logging standard), run centrally so a newly disclosed vulnerability can be checked everywhere in one run.
- **Fault-injection experiments.** Inject failure deliberately and confirm graceful degradation (principles published at principlesofchaos.org). Usually composite, always-on or scheduled.
- **Property-based checks.** Generate many inputs to probe contracts and data invariants.

## Which checks does a team probably have already?
Static-analysis gates, coverage gates, dependency vulnerability scans, licence scans, contract tests, build-time performance budgets, synthetic probes, SLO alerts, accessibility linters. Inventory these first. Often the work is to label, threshold and assign an owner to what already runs.
