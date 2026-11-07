# Architecture metrics and the scorecard

Without numbers, "the architecture is getting better" is an opinion. Measurement turns vague quality goals into specific ones, shows where architectural attention is best spent, and gives stakeholders evidence. This file lists the metric families Chronos uses and how it assembles a scorecard. Traps and the choice of metrics are in `08`.

## Where can evidence about an architecture come from?
Chronos picks evidence sources by the question being asked and by the system's stage:
| Question | Best evidence | Examples |
|---|---|---|
| Will the design hold before it is built? | models and estimates | capacity models, queueing estimates, availability arithmetic across dependencies, cost models, scenario walk-throughs (ATAM, SEI) |
| Is the built structure sound? | code and graph analysis | dependencies, tangles, complexity, change history (`06`); threat models |
| Does it behave as intended for users? | production telemetry | latency percentiles, error ratios, throughput, resource use, cost, business events per minute |
| Is it still holding after each change? | fitness functions | everything in `02`–`06` |
Typical order over a system's life: models first, analysis during the build, telemetry once live, fitness functions throughout.

## Delivery performance: the DORA metrics
The DORA research programme (dora.dev, with public reports published most years) tracks delivery performance with a small set of outcome metrics. Chronos groups them as the research does:
| Group | Metric | Definition |
|---|---|---|
| Throughput | **Change lead time** | time from commit to running in production |
| Throughput | **Deployment frequency** | how often changes reach production |
| Throughput | **Failed deployment recovery time** (earlier reports: time to restore service) | time to recover when a deployment causes a failure |
| Instability | **Change fail rate** | share of deployments that need remediation (rollback, hotfix, incident) |
| Instability | **Rework rate** (added in the 2024 report) | share of deployments that are unplanned fixes for user-facing problems |

Notes:
- **Read them as a set.** In the research, speed and stability tend to rise together; pushing one alone invites gaming (shipping trivial changes to raise frequency).
- **Bands change.** Performance groupings and thresholds differ between reports. Compare a team with its own history, not with a published cluster, and check the current definitions at dora.dev.
- **Architecture drives them.** Independently deployable, testable units are a precondition for frequent deployment and short lead time.

### Instrumenting delivery metrics
- **Start in the pipeline.** Commit, build, deploy and rollback events already exist in CI/CD and version control; capture timestamps there before building anything new.
- **Write down what counts as a deployment and a failure.** Is a config change a deployment? Is degraded latency a failure? Unwritten definitions make trends meaningless.
- **Link incidents to the deployment that caused them**; recovery time and failure attribution usually live in the incident tool.
- **Compute per deployable unit**, then aggregate. Team-level views are for the team's own improvement, never for ranking.
- **Show trends** over weeks and months, annotated with freezes and migrations.
- **Discuss them in the owning team**: what moved, why, what to try next, who owns the experiment.

## Developer experience: SPACE
The SPACE framework (ACM Queue, 2021) holds that productivity has several dimensions and no single number captures it: satisfaction and well-being, performance (outcomes), activity, communication and collaboration, efficiency and flow.
- Combine at least three dimensions, mixing system data with surveys.
- Activity counts (commits, pull requests, lines) are easy to collect and misleading on their own.
- Architecture-relevant signals: perceived ease of making a change, time waiting on builds and reviews, how often work is blocked by another team, cognitive load of the codebase.

## Runtime reliability: SLIs, SLOs and error budgets
From site reliability engineering practice (Google's public SRE book and workbook, sre.google):
- **SLI**: a measured ratio of good events to valid events for a user journey (share of ferry-booking requests completed under 1 s without error).
- **SLO**: the target for that ratio over a window (99.9% over 28 days).
- **Error budget**: 1 − SLO, the unreliability you may spend. Budget left: ship and take risks. Budget gone: reliability work comes first, as agreed in a written error-budget policy.
- **Burn-rate alerts**: alert when the budget is being spent fast enough to run out within the window (the workbook recommends multi-window, multi-burn-rate alerts), instead of on raw thresholds. Fewer false pages.
- Set SLOs per critical journey and per autonomy unit where needs differ; one SLO for everything hides the journeys that matter.
- An SLO with burn-rate alerting is a composite, always-on fitness function.
- **Availability arithmetic**: a request that synchronously needs several services can be no more available than the product of their availabilities. Three services at 99.9% in series give at most about 99.7% (`05`).

## Naming qualities: ISO/IEC 25010
For a shared vocabulary Chronos uses the product quality model in **ISO/IEC 25010:2023**, part of the SQuaRE series. The 2023 edition has nine characteristics. Grouped the way Chronos uses them:
- **What it does and how well it runs**: functional suitability; performance efficiency; reliability.
- **Who can use it, and safely**: interaction capability (formerly usability); security; safety (new in 2023).
- **How easily it changes and fits in**: maintainability; flexibility (formerly portability, now including scalability); compatibility.
Several sub-characteristics also changed between the 2011 and 2023 editions (for example, new inclusivity and self-descriptiveness under interaction capability, and resistance under security). Check which edition an organisation's requirements cite before mapping to it.

### Measuring each quality
| Quality | In production | Analysis or design | Typical fitness function |
|---|---|---|---|
| Performance efficiency | p95/p99 latency, throughput, CPU and memory per request | capacity model | latency budget in pre-release; production percentile SLO |
| Flexibility: scalability | throughput and latency against load and resources | load model | stepped load test (design → Atlas); autoscaling reaction time |
| Flexibility: adaptability | time to stand up a new environment or region | infrastructure-as-code coverage | environment-from-scratch pipeline test |
| Reliability | SLO attainment, recovery time, failover time | dependency availability arithmetic | burn-rate alert; failover test |
| Security | time to patch critical vulnerabilities, exposed surface | threat model, dependency scan | vulnerability gate; configuration policy |
| Maintainability | lead time per module, hotspot effort | tangles, propagation cost, structure health score | dependency rules; tangle ratchet |
| Compatibility | contract-test pass rate | API diff | consumer-driven contracts |
| Interaction capability | task success, accessibility audit results | — | accessibility linter + scheduled audit |
| Safety | hazard-related incidents, fail-safe activations | hazard analysis | fail-safe tests in a stage |
| Cost (outside ISO, often vital) | cost per transaction or per tenant | cost model | cost band alert |

### Measuring the awkward ones
- **Performance**: measure end to end as users experience it as well as per service; use percentiles and record the load at the time.
- **Scalability**: the capacity gained per unit of resource added; look for the knee where latency climbs sharply.
- **Availability**: measure as users see it (synthetic probes and real-user monitoring), not only host uptime.
- **Security**: hard to measure directly. Combine leading signals (patch latency, share of services on supported dependencies, failed policy checks) with lagging ones (incidents, findings from external tests).

## Architecture-specific measures
- **Autonomy units**: number of independently releasable units; share of releases that needed another unit to ship the same day (`05`).
- **Structure**: tangles, propagation cost, rule violations, structure health score (`06`).
- **System-level debt**: count and estimated interest of recorded items, age of the oldest, trend (`09`).
- **Decision coverage**: share of significant decisions with an ADR; ADRs whose "Enforced by" section names a live check.
- **Feedback loop**: minutes to verdict, red-mainline time, pipeline duration (`04`).
- **Platform currency**: age of frameworks and runtimes against supported versions.

## How Chronos builds a scorecard
1. Start from the ranked qualities (`03` Step 1); each top quality gets one or two metrics.
2. Add the DORA set as a baseline view of change capability.
3. Add one structural metric and one debt metric.
4. Add SLOs for the two or three most critical journeys.
5. For each metric record: definition, data source, current value, target or band, cadence, audience, owner, **action when it goes bad**.
6. Stop at roughly 8–12 metrics.
7. Design for the audience: teams need per-unit detail and trends; leadership needs a few lines with direction of travel and the decisions required. One front page with drill-down beats many dashboards.
8. Review the scorecard itself every quarter: drop metrics nobody acted on, add ones for new risks.

## Scorecard rows (format example, veterinary clinic network)
| Metric | Current | Target | Cadence | Audience | Action if bad |
|---|---|---|---|---|---|
| Change lead time (median, per service) | 3 days | < 1 day | weekly | service teams | find the slowest pipeline stage or review queue and fix it first |
| Namespace tangles | 4 | 0, none new | per commit; monthly trend | architects, teams | block new tangles; plan one untangling per quarter |
| Appointment-booking SLO (good requests, 28 days) | 99.7% | 99.9% | continuous | product, SRE | at 50% budget spent, freeze risky changes to booking |
