# Readiness and fit — the `assess` procedure

`assess` answers one question: is a microservice architecture the best available route to this organisation's goals, now? Four honest answers exist, and "no" is often the most valuable one.

## Step 1 — Find the goal behind the request
Ask (or infer and state as an assumption) three things:
1. **What outcome do you want?** Faster releases, more teams working in parallel, isolation of a risky or regulated area, scaling one hot path, robustness, a technology change, ability to sell capabilities to partners.
2. **How will you know it worked?** A measure tied to the outcome (lead time, deployment frequency, incidents caused by unrelated changes, cost per transaction, audit scope).
3. **What else could achieve it?** For every goal, list a cheaper option before recommending services.

| Goal | Microservices help when… | Try first / instead |
|---|---|---|
| Faster delivery | contention between many teams on one release is the bottleneck | automate tests and deploys; trunk-based development; zero-downtime deploys; feature flags |
| More teams in parallel | teams step on each other in the same code and release | modular monolith with module ownership and enforced boundaries |
| Scale for load | load is concentrated in a few capabilities with different profiles | more replicas of the monolith behind a load balancer; read replicas; caching; a bigger machine |
| Robustness | failures in a minor feature take down critical ones | bulkheads inside the monolith (separate thread pools, separate deployments of the same artefact per role) |
| Isolate regulated data | one area carries heavy compliance scope | extract only that area; keep the rest |
| New technology | one problem genuinely needs a different runtime or store | a single sidecar service or managed service for that problem |
| Partner / channel reuse | capabilities must be offered as APIs | a well-designed API layer over the monolith |

If no goal survives this table, the recommendation is **Keep current architecture** (and fix the real problem).

## Step 2 — Check the conditions for success
Rate each dimension **Ready**, **Partly** or **Not yet**, with one line of evidence.

**Domain understanding**
- Ready: the business areas are stable and well understood; teams can name capabilities and their language.
- Not yet: a young product still searching for fit, or a domain the team learned last month. Boundaries drawn now will be wrong, and moving a boundary between services costs far more than moving one between modules.

**Organisation and teams**
- Ready: long-lived, cross-functional product teams aligned to business areas, with authority over what they build. Leadership accepts team autonomy and the cost of a platform.
- Not yet: project-based funding, component teams (front end, back end, DBA), frequent reorganisations, or a central architecture board that approves every change. Conway's law (see `09`) means the services will mirror this structure anyway.

**Delivery capability**
- Ready: automated build and test on every commit, deploys on demand, small batch sizes, rollback in minutes. Take a baseline of the four DORA delivery measures: how quickly service is restored after a failure, what share of changes cause one, how long a commit takes to reach production, and how often the team deploys.
- Not yet: manual testing gates, release weekends, environment queues. Splitting will multiply these pains by the number of services.

**Operational maturity**
- Ready: centralised logs, metrics, alerts with owners; teams already support what they build; incident process exists.
- Not yet: a separate operations group receives handovers; nobody can trace a request across two systems today.

**Platform**
- Ready: infrastructure as code, a container or function platform or managed PaaS, self-service environments, a way to create a new service with pipeline, logging and monitoring in under a day.
- Not yet: each new service needs tickets to three teams.

**Leadership and funding**
- Ready: a sponsor understands this is a multi-quarter change with a period of slower feature delivery; success measures agreed.
- Not yet: microservices are expected to speed things up next quarter.

## Step 3 — Look for disqualifiers
Strong signals against microservices now (each one alone can flip the recommendation):
- **Small team** (roughly fewer than 15–20 engineers in total; general rule of thumb). Coordination is cheap; distribution is not.
- **Unclear or fast-changing domain**, typical of early start-ups.
- **Software installed and run by customers** on their own infrastructure. Shipping and supporting dozens of services at every customer site is a heavy burden.
- **No operational ownership possible**, e.g. regulation or contracts require a separate ops supplier with change tickets.
- **The only stated reason is fashion**, a vendor pitch or a CV.

## Step 4 — Decide
| Recommendation | Use when |
|---|---|
| **Microservices now** | Clear goals that services serve best; most dimensions Ready; no disqualifier. Still migrate incrementally. |
| **Prepare first, then split** | Goals justify services, but delivery, operations or platform are Partly/Not yet. Name the 2–4 preparations and the trigger to start extracting. |
| **Modular monolith** | Goals are about code ownership and maintainability, team count is modest, or the domain is still moving. Plan module boundaries so a later extraction is cheap. |
| **Keep current architecture** | No goal requires a structural change; the pain is process, tooling or skills. |

Always attach first steps. Good first steps are small, valuable regardless of the final architecture, and reversible: automate the deployment, introduce module boundaries and enforce them with build rules, create a service template, put tracing in place, move one team to owning production support.

## The modular monolith as a serious option
A modular monolith keeps one deployable but enforces internal boundaries:
- Modules map to business capabilities, each with a public interface; other modules may not reach into internals (enforce with package visibility, architecture tests or separate build units).
- Each module owns its tables, ideally in a separate schema; no cross-module joins outside the owning module.
- Module ownership is assigned to teams, with code-review rules to match.
- Modules communicate through interfaces or in-process events, which can later be turned into network calls or published events.

It gives most of the design discipline for a fraction of the operational cost and keeps the option of extraction open. Many organisations never need to go further. When `assess` recommends it, give the module list.

## Zero-downtime deployment first
If release pain is the driver, first make the existing system deployable without downtime: rolling or blue-green deploys, backward-compatible schema changes (expand, migrate, contract), feature flags to separate deploy from release. Release traffic management in depth belongs to Daedalus (API Platform Architect).

## How will you tell whether the move is paying off?
Set measures before the first extraction and review them at regular checkpoints (e.g. every quarter):
- **Quantitative**: DORA metrics per team; number of releases needing cross-team coordination; incidents caused by unrelated changes; time to create a new service; infrastructure cost per transaction.
- **Qualitative**: team surveys on autonomy and cognitive load; how often developers wait on other teams; ease of onboarding.
- **Stop rules**: if after an agreed period the measures do not improve, pause and reassess. Do not continue because of money already spent; sunk cost is not a reason.

## Readiness scorecard (compact)
Use this as the READINESS line in the output:
```
domain:       Ready | Partly | Not yet — <evidence>
org & teams:  …
delivery:     …   (DORA baseline if known)
operations:   …
platform:     …
leadership:   …
```
Two or more "Not yet" in delivery, operations or platform → **Prepare first** at best. "Not yet" in domain → **Modular monolith** at best.

## Example (invented)
A logistics start-up with nine engineers wants microservices "to scale". Load is 40 requests per second; releases are daily and automated; the product pivoted twice this year. Verdict: **Modular monolith** — goal (scale) is met by replicas; domain unstable; team small. First steps: define five modules, enforce boundaries with architecture tests, add tracing, revisit when the team passes about 25 engineers or a module's load profile diverges sharply.
