# Designing fitness functions (`design`)

How Chronos goes from "what must this system do well?" to a short, owned set of checks and a scorecard. Use with `02` (design card), `06` (code-level rules) and `07` (metrics).

## Step 0 — What do we know, and what must we assume?
Extract or assume: business purpose and the outcomes that matter (revenue, compliance, customer experience, speed of change); system stage (new, live, in transition, being retired); number and shape of teams and who owns what; deployment model and pipeline (tools, stages, frequency); runtime platform; current metrics and dashboards; known pain (incidents, slow releases, merge conflicts, the module everyone avoids); regulation; planned change over the next 12–24 months. Run the readiness check in `01` if the delivery basics are unclear.
Never block on a missing fact: assume it, record it under ASSUMPTIONS, and list only the questions that would change a check or threshold.

## Step 1 — Which qualities matter most?
1. Write the business goals in plain words ("open a new clinic on the platform in one week"; "no lost prescription records"; "keep selling tickets if one region's cloud zone fails").
2. Translate each into the architectural characteristics it depends on (ease of change and independent deployment; data integrity; availability and recoverability).
3. **Rank** and keep the top 3–7. Qualities trade against each other (security against latency, consistency against availability, reuse against independence); trying to maximise all of them maximises none.
4. Add implicit qualities the context makes important even if nobody said them: security for anything internet-facing, auditability in regulated domains, cost in high-volume systems.
Use ISO/IEC 25010:2023 names for traceability (`07`) but keep the business wording beside them.

## Step 2 — How will we know the quality holds?
Write a **quality scenario** for each characteristic, in the six-part form used in attribute-driven design (Software Engineering Institute): source → stimulus → environment → artefact → response → response measure.
Example (veterinary clinic network): "When the lab-results provider stops responding (stimulus) during Monday-morning peak (environment), the appointments service (artefact) keeps booking and shows results as 'pending' (response) for 99% of requests within 1.5 s, with no booking lost (measure)."
If a quality resists direct measurement, use **GQM** (`08`): goal → questions that would show progress → metrics that answer them. Proxies are acceptable if labelled as proxies.

## Step 3 — What shape should each check take?
Fill the design card from `02` for each scenario: scope (single or composite), trigger (on-change, always-on, scheduled), threshold kind (fixed or contextual), execution (automated or manual), lifetime, where it runs, and the action on failure: block the build, block the release, alert the owner, open a ticket, or flag for review. Blocking is reserved for violations that are costly **and** checks that are reliable; a flaky check never blocks.

### Placement balance (MIKA)
Spread checks across three tiers by cost and reach:
| Tier | Typical card | Examples | Volume |
|---|---|---|---|
| **Fast tier** | single · on-change | import and layer rules, cycle detection, complexity limits, changed-line coverage, licence and vulnerability scans, contract tests | many, but each one maintained |
| **Stage tier** | composite · on-change, or single · always-on | integration and load tests in a pipeline stage, a test that simulates a failing dependency, one live metric such as job duration or page load | fewer |
| **Live tier** | composite · always-on | SLO burn rates, business signals inside an expected band (bookings per minute, meter readings ingested per minute), scheduled fault-injection | a handful |

Most systems want the most checks in the fast tier. Turn the balance upside down only when the system has little code of its own (integration-heavy, packaged software) and the risk lives in runtime behaviour.

## Step 4 — Write the card
```
Name:            <short noun phrase>
Quality:         <characteristic it protects, linked to a driver>
Scenario:        <one line>
Measures:        <metric, how computed, data source>
Threshold:       <fixed target or contextual band; baseline if ratcheting>
Card:            single|composite · on-change|always-on|scheduled · fixed|contextual · automated|manual · permanent|temporary
Runs:            <stage / schedule / monitor>
Tool class:      <see table below>
On failure:      <block | alert | ticket | review>
Owner:           <team or role>
Retire when:     <temporary checks only>
Gaming risk:     <how it could pass without the outcome; the counter-metric>
```

## Step 5 — Where do thresholds come from?
- From a **measured baseline**, not an industry number. With no baseline, measure for two to four weeks before enforcing.
- On legacy code, **ratchet**: forbid regression first, then tighten in planned steps.
- Use **bands** (upper and lower bounds) for business signals and resource use; a sudden drop can be as alarming as a spike.
- Express runtime thresholds as **percentiles and budgets** (p95, p99, error budget), never averages.
- The team agrees, writes down and revisits its own thresholds.

## Step 6 — What goes on the scorecard?
The scorecard tracks trends that inform decisions; it is separate from pass/fail checks. Keep it to 8–12 metrics. Typical mix:
- **Delivery**: the DORA set (`07`): how long a commit takes to reach production, how often deployments happen, what share of them fail, how fast the team recovers.
- **Structure**: module tangles, propagation cost or average dependency count, rule violations.
- **Debt and risk**: open system-level-debt items with an interest estimate, hotspot count, outdated-dependency age, age of open critical vulnerabilities.
- **Runtime**: SLO attainment and error-budget burn per critical journey; cost per transaction where cost matters.
- **Team** (optional, with care): perceived ease of change, build wait time, on-call load. Survey or tool data, never for individual appraisal.
For each: current value if known, target, cadence, audience, and **the action a bad reading triggers**.

## Step 7 — In what order do we roll out?
- Build the 2–3 checks with the best value-to-cost ratio first; often an existing tool only needs a threshold and an owner.
- Add the pipeline stage or monitor they need and make results visible.
- Run every new check in warn-only mode before it blocks.
- Hold a review (quarterly is common) to add checks for new risks and retire ones that no longer inform decisions.

## Which tool class fits which quality?
| Quality | Typical checks | Tool classes (examples, verify versions) |
|---|---|---|
| Modularity / layering | allowed-dependency rules, no cycles, public-API-only access | ArchUnit (JVM), ArchUnitNET or NetArchTest (.NET), dependency-cruiser (JS/TS), import-linter (Python), jQAssistant (graph queries over code) |
| Maintainability | complexity and size limits, duplication, hotspot trend | static-analysis platforms, code-health tools, version-history miners |
| Testability | changed-line coverage, test duration, flaky-test rate | coverage tools, CI analytics |
| Deployability | release without coordination, pipeline duration, rollback time | CI/CD analytics, deployment logs |
| Performance | latency budgets in a stage, production percentiles | load-test tools (design → Atlas), APM, synthetic probes |
| Scalability / elasticity | throughput against resources at stepped load | load generators, autoscaler metrics (design → Atlas) |
| Availability / resilience | SLO attainment, failover time, behaviour under injected faults | SLO tooling, fault-injection tools, health checks |
| Security | vulnerability age, secrets in code, exposed ports, configuration baselines | dependency and container scanners, secret scanners, policy-as-code for IaC |
| Data integrity | migration tests, cross-store reference checks, reconciliation | migration tools, data-quality checkers, reconciliation jobs |
| Contract stability | consumer-driven contract tests, breaking-change detection | contract-testing tools, API and schema diff tools, schema registries |
| Compliance / licences | approved-licence list, data residency, audit-log presence | licence scanners, policy engines |
| Accessibility | automated rules plus scheduled manual audit | accessibility linters, audit checklists |
| Cost | cost per request or per tenant inside a band | cloud cost tooling, tagged billing exports |
| Observability | required telemetry present, trace coverage of critical journeys | telemetry linters, tracing back ends |

## Chronos's own rules of design
- One good composite check on a critical journey can be worth ten single code rules.
- Guard the boundaries that decide independence (module and service edges, shared data) before internal style.
- Every migration step gets an explicit temporary check with an end condition.
- If a check can pass without the outcome, add a counter-metric: coverage with mutation score; deployment frequency with change failure rate.
- Hand-offs: release and canary mechanics → Daedalus; load-test design → Atlas; style selection → Pallas.

## Worked mini-example (community energy co-op)
Drivers: members see their own generation data within minutes; billing is never wrong; two small teams. Top qualities: data integrity, performance efficiency, ease of change. First three checks: (1) nightly reconciliation of meter readings against billed kWh, fixed threshold 0 unexplained differences, blocks invoice run; (2) ingest latency, composite, always-on, contextual band as in the `02` register line; (3) import rule that only the billing module touches tariff tables, single, on-change, ratcheted from 7 existing violations. Scorecard adds the DORA set, one tangle count and SLO attainment for the member portal.
