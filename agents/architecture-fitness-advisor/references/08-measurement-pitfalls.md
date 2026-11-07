# Choosing metrics, avoiding traps, acting on results

Metrics change behaviour. Chosen well they focus attention; chosen badly they produce handsome dashboards, perverse incentives and no improvement. This file gives Chronos a way to choose metrics (GQM), a health check for any metric set, and the practices that turn readings into action.

## Why do targets corrupt numbers?
- **Goodhart's law**, in its usual short form: once a number is made a target, people optimise the number rather than the outcome it stood for.
- **Campbell's law**: the more an indicator drives social or organisational decisions, the more pressure there is to distort both the indicator and the process it watches.

How this shows up in architecture work, and the counterweight Chronos recommends:
| Target | Typical distortion | Counterweight |
|---|---|---|
| Coverage percentage | tests without assertions | mutation score, or review of test quality |
| Deployment frequency | trivial deployments | change lead time and change fail rate alongside |
| Complexity limit | functions split for no reason | hotspot trend and code review |
| Incident count | under-reporting | recovery time and completed follow-up actions |
| Analyser "debt in days" | negotiation over the number | debt register with interest (`09`); score as relative trend only |
| Team league tables | gaming, hidden problems | per-team trends for the team's own use |

General defences:
- **Pair metrics that pull against each other** (speed with stability; size with quality).
- **People interpret, metrics prompt.** A reading starts a conversation; it does not end one.
- **Prefer outcomes over activity.**
- **Retire metrics** once they have done their job.
- **Never link pay or individual appraisal to delivery or code metrics.**

## How do you choose metrics for something that seems unmeasurable?
**Goal-Question-Metric (GQM)** comes from software-engineering research at the University of Maryland and NASA's Software Engineering Laboratory (Basili and colleagues, published in the 1980s–90s). It works top-down, so every metric traces to a goal.

1. **Goal**, stated with five parts: purpose, object, quality focus, viewpoint, context.
   *Ferry operator*: "Reduce (purpose) the risk of booking outages (quality focus) in the ticketing platform (object), as seen by the operations team (viewpoint), during summer timetable peaks (context)."
2. **Questions** whose answers would show progress: How close to capacity is ticketing at peak? Which callers generate most load? How long between saturation and an alert? What happens to dependent services when ticketing saturates?
3. **Metrics** that answer each question: utilisation per resource at peak percentile; requests per caller per minute; minutes from saturation to page; dependants' error ratio during a saturation test.

One metric can serve several questions and one question may need several metrics. A question nobody can answer with available data is itself a finding, and often points at the next incident before it happens.

### From tree to collection
- Score each metric for value to the goal and cost to collect; start with high value, low cost.
- Name the data source, owner, frequency and storage.
- Use data that already exists; instrument only the gaps that matter.
- Revisit the tree when the goal is met or changes.

### Running it with a group (MIKA format)
Five to eight people: someone who owns the goal, someone who operates the system, someone who will act on the answers. Bring the goal draft and a context diagram. Agree the goal wording first; write questions in plain language before anyone mentions a metric; end with an owner and a review date for each metric chosen. Ninety minutes is usually enough.

## Metric health check (MIKA)
Chronos runs this check over any existing metric set, stage by stage. Each "no" is a candidate finding.
| Stage | Check | Typical sign of failure | Remedy |
|---|---|---|---|
| **Choose** | Does each metric trace to a ranked quality or goal? | lines of code, ticket counts, host uptime | rebuild from the ranked qualities or a GQM tree |
| **Choose** | Is there at least one business-facing metric per critical journey? | business stakeholders ignore the page | add bookings completed, clinics onboarded, readings billed |
| **Choose** | Are leading signals present, not only lagging ones? | problems seen only after incidents | add hotspot growth, dependency age, pipeline time |
| **Collect** | Is the definition written and versioned? | trends jump when tooling changes | write definitions; annotate changes on charts |
| **Collect** | Was a baseline measured before a target was set? | targets copied from benchmarks | measure first, target relative to own history |
| **Collect** | Is the effort in proportion? | months building a metrics platform, few metrics used | start from pipeline, version control and incident tool data |
| **Collect** | Is precision proportionate to the decision? | debates about decimals | stop refining when more accuracy would not change the decision |
| **Show** | Are distributions shown, not just averages? | "average 120 ms" while 2% wait 10 s | percentiles; segment by journey, region, tenant |
| **Show** | Is each unit compared only with itself? | league tables of services or teams | trends per unit |
| **Show** | Are rates and ratios used instead of ever-growing totals? | "total deployments ever" | rates tied to a decision |
| **Show** | Is the set small enough to read? | dozens of panels, alert fatigue | cap at 8–12; switch off unused metrics quarterly |
| **Act** | Does every metric have an owner and a pre-agreed action? | the same red value for months | owner, action and reserved capacity |
| **Act** | Do people trust the purpose? | developers work around measurement | state the purpose, aggregate, let teams own their data |

Severity guide: one or two "no" answers in **Choose** or **Act** is usually Medium; metrics used to rank individuals or teams is High (see `10`).

## How do readings turn into action?
- **Discuss before judging.** Review metrics in the owning team's normal rhythm; ask what changed and why before deciding anything.
- **Make improvement experiments explicit**: hypothesis, change, expected movement, review date.
- **Name owners**: every metric has someone who reports on it and proposes actions; every action has an owner and a date.
- **Reserve capacity**: a fixed share of each iteration for acting on findings, or they lose to feature work every time.
- **Close the loop**: when an action is done, check whether the metric moved. If not, either the hypothesis or the metric was wrong; learn from both.
- **Promote to a check** when the threshold is clear and the measurement reliable (`06`, "How does a chart become a check?").

## Pages people actually open
- One front page per audience with a handful of metrics and direction of travel; detail on drill-down.
- Trends rather than snapshots, annotated with releases, incidents and definition changes.
- Colour used sparingly; red only for conditions that require action.
- Target and action shown beside each value.
- A one-line explanation of each metric on the page: what it is, why it matters, who owns it.
- Stale panels removed; an unopened dashboard is pure cost.

## Trust and fairness
- Metrics about work are metrics about people. Say why each is collected, who sees it and how it is used.
- Aggregate to team or system level; avoid individual productivity metrics.
- Invite teams to propose and challenge metrics; ownership reduces gaming.
- Use measurement to find system problems (slow pipelines, tangled modules, unclear ownership), not to assign blame.
