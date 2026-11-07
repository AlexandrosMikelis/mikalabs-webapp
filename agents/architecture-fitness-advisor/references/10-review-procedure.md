# Architecture fitness review procedure

Use for `review` requests: an existing or proposed architecture, a set of fitness functions, an architecture-metrics dashboard, a governance setup (rules, ADRs, review boards) or a migration plan, assessed for its ability to stay healthy as it changes.

## Step 0 — Establish the facts (don't skip)
Extract or assume:
- Business purpose, the outcomes that matter, and the change expected over the next 12–24 months.
- System stage: new, live, in transition, being retired.
- Structure: deployable units, data stores and who touches them, synchronous and asynchronous links, shared libraries.
- Teams: number, shape (by capability or by layer), owner of each unit and store.
- Pipeline: stages, duration, deployment frequency, whether units release independently.
- Existing checks: tests, static analysis, rule libraries, scans, monitors, SLOs, manual reviews.
- Metrics and dashboards: what is measured, targets, audiences, what is done with results.
- Decisions: ADRs or equivalent; debt and risk registers.
If something that would change a severity is missing, state the assumption and list it under OPEN QUESTIONS. An agent caller can't answer follow-ups, so never block: assume, flag, continue. Score the readiness check (`01`) and the governance maturity ladder (`09`) when the facts allow; both shape what to recommend first.

## Step 1 — Drivers and qualities
Derive the 3–7 qualities that matter most from the business context (`03` Step 1). Compare them with what the current checks and metrics actually protect. A mismatch, such as heavy governance of code style and nothing on data integrity in a payments system, is often the first finding.

## Step 2 — Map structure and coupling
- Run the autonomy-unit test (`05`): which units can truly release alone? Shared databases and synchronous chains merge units.
- Score the couplings that cross boundaries on the agreement ladder: shared schemas, shared domain libraries, shared conventions, timing dependencies.
- Record the interaction profile of each key workflow and whether it was chosen deliberately.
- Read code-structure signals if given (`06`): tangles, propagation cost, rule violations, hotspots, structure health score.

## Step 3 — Work through the areas
Consider each; report only what matters for this system.
| Area | Core questions | Reference |
|---|---|---|
| Quality coverage | Does each top quality have at least one check or metric with a threshold? Is anything protected that nobody needs? | 02, 03 |
| Check quality | Passes the six tests in `02`? Result rather than method? Flaky? Manual ones scheduled and recorded? Temporary ones with an end condition? | 02, 03 |
| Pipeline placement | Earliest reliable stage? A pipeline per unit? Minutes to verdict? Calendar stage for scheduled checks? Production monitors for always-on ones? | 04 |
| Structural health | Rules on key boundaries? Tangles? Concrete, heavily depended-on modules? Trend of structure measures? Baseline and ratchet on legacy? | 06 |
| Coupling & autonomy units | Units as intended? Shared data? Synchronous chains? Contract tests at boundaries? Breaking-change detection? Reuse of fast-moving domain code? | 05 |
| Data change | Automated, reversible migrations? Parallel change? Shared databases governed? Moved database guarantees replaced by explicit checks? | 04 |
| Delivery metrics | DORA set measured with written definitions? Read as a set? Used for improvement, not ranking? Trends discussed and acted on? | 07, 08 |
| Runtime objectives | SLOs per critical journey? Error-budget policy? Burn-rate alerts? Measured as users see it? | 07 |
| Measurement hygiene | Metric health check (`08`): Goodhart exposure, too many metrics, averages hiding tails, baselines, owners and actions, vanity metrics | 08 |
| Debt & risk | Debt register with interest? Risk grid current? Repayment capacity? Priorities driven by hotspots? | 09 |
| Decisions & governance | ADRs with an "Enforced by" section? Right-sized, and which maturity rung? Estate-wide checks for vulnerabilities and licences? | 09 |
| Changeability practices | Reversible decisions? Anticorruption layers around vendors? Dependencies current? One-off technology without benefit? Long-lived branches or toggles? | 01, 04 |
| Organisation | Team boundaries aligned with the intended structure? Every unit and store owned? Cognitive load? | 01, 09 |

## Step 4 — Rate each finding
| Severity | Meaning | Typical action |
|---|---|---|
| **Critical** | A top quality (data integrity, security, availability of a critical journey, a regulatory obligation) is unprotected and already degrading, or a change is likely to cause serious harm undetected; or governance actively blocks remediation | Fix now or before the next major change; escalate |
| **High** | Drift that will soon stop independent change or cause incidents (units silently merging, tangles growing, no contract checks at external boundaries); metrics actively misleading decisions or used to rank people | Fix within the next planning cycle; named owner |
| **Medium** | Real but containable gaps: checks in the wrong stage, missing thresholds or owners, untracked debt, too many metrics | Plan in the roadmap; monitor |
| **Low** | Good-practice improvement: documentation, naming, dashboard design | Optional |
Rate by impact on the ranked qualities × likelihood × how many teams or users are affected × how hard it becomes to reverse if left. Severity measures consequence, not how unconventional the setup is.

### Calibration examples
- Clinic network: prescriptions written by two services into one table, no reconciliation, one double-dispensing incident last quarter → **Critical** (data integrity of a critical journey, already degrading).
- Ferry operator: ticketing calls pricing, seat map and payments synchronously in sequence, no timeouts, no incident yet → **High** (availability arithmetic, likely cascade).
- Energy co-op: ArchUnit rules run only nightly instead of on pull requests → **Medium**.
- Any system: dashboard metrics lack one-line explanations → **Low**.

## Step 5 — Recommend
Each fix is concrete (who changes what), proportionate and tied to a finding. Prefer, in order:
1. **Protect what matters most**: add or repair the check for the top unprotected quality.
2. **Restore independence**: untangle shared data, cut synchronous chains, add contract tests (`05`).
3. **Stop further decay**: baseline and ratchet structural measures; forbid new tangles and boundary violations (`06`).
4. **Fix the measurement**: pair metrics, write definitions, add owners and actions, remove vanity and surplus metrics (`08`).
5. **Move checks to the right stage** and shorten feedback (`04`).
6. **Record decisions and debt** with governance and interest (`09`).
Where helpful, write the recommended check on the `03` card.
Hand off by name when the fix lies outside scope: architecture-style change → Pallas; release, canary or rollout mechanics → Daedalus; load-test design → Atlas.

## Step 6 — Verdict
- **Healthy**: no High or Critical findings; governance protects the top qualities and drives action.
- **Healthy with conditions**: High findings with clear, local fixes; list them as conditions.
- **Needs rework**: the governance or metrics approach itself is unsound (wrong qualities, measurement driving bad behaviour, no automation), or structural drift needs a planned programme rather than local fixes.
- **At risk**: Critical findings; a top quality is unprotected and degrading, or the architecture can no longer change safely without major intervention.
Confidence: High / Medium / Low, depending on how much was assumed.

## Common patterns (quick reference)
- **Coverage gate as the only check**: protects one proxy and none of the top qualities. Add checks per ranked quality; pair coverage with mutation score or review.
- **Services sharing one database**: one autonomy unit disguised as many; releases and schema changes need coordination. Assign store owners, add data-access checks, split along ownership.
- **Layer rules in CI but nothing between modules**: layers hold, modules tangle. Add public-API and no-cycle rules with a baseline.
- **DORA metrics on a team leaderboard**: gaming and mistrust. Per-team trends for self-improvement; remove the ranking.
- **Forty dashboard panels, no owners**: nobody acts. Cut to 8–12 metrics, each with owner, target and action.
- **SLO without an error-budget policy**: alerts without consequences. Agree what happens when the budget is spent.
- **Analyser "debt in days" as the only debt measure**: misses system-level debt. Keep a register with interest; use the score as a relative trend.
- **Migration without temporary checks**: no evidence of progress; regressions creep back. Add "no new calls into legacy" and side-by-side comparison with an end condition.
- **Every check blocking from day one on legacy code**: teams bypass the pipeline. Warn first, baseline existing violations, block only on regressions.
- **Manual review board as the only governance**: slow, inconsistent, skipped under pressure (maturity rung 1). Automate the objective rules; keep review for judgement calls; adopt an advice process.
- **Long-lived feature branches**: integration and structural drift found late. Trunk-based development; toggles with expiry.
- **Five services called in sequence for one request**: availability multiplies down, latency adds up. Check synchronous depth or fan-out; move to asynchronous where consistency allows.
- **Vendor product at the centre**: its upgrades drive yours. Anticorruption layer and checks on the integration points.
- **No scheduled checks**: certificates expire, dependencies age, licences change unnoticed. Add a calendar stage.
- **Only technical metrics**: business stakeholders disengage. Add a business signal inside a band per critical journey.
