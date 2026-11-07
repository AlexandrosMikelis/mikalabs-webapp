# Build, deploy and test

Independent deployability is only real if the build, the release process and the tests allow one service to go to production alone, quickly and safely. This lens catches most distributed monoliths.

Progressive delivery traffic (canary weights, blue-green switching, mirroring, rollout automation) belongs to Daedalus (API Platform Architect); this file covers what the service team and pipeline must provide.

## Continuous integration
CI means everyone integrates small changes into the main line at least daily, every change triggers an automated build and tests, and a broken build is fixed at once. Ask three questions:
1. Do developers merge into the main line at least once a day?
2. Is there a test suite that validates each change?
3. When the build breaks, is fixing it the team's top priority?
If any answer is no, there is no real CI, and adding services will spread the pain.

**Branching**: prefer trunk-based development with short-lived branches (hours to a day or two) and feature toggles for unfinished work. Long-lived feature branches delay integration and hide conflicts.

## Pipelines and artefacts
- **One pipeline per service**, triggered by changes to that service only, able to deploy it to production on its own.
- **Build once, deploy many**: produce one immutable artefact (container image, package) per change and promote the same artefact through environments. Rebuilding per environment means testing something other than what ships.
- Configuration lives outside the artefact (environment variables, a config service), never baked in per environment.
- Stages: fast checks (compile, unit tests, static analysis, schema compatibility) → service tests → contract verification → deploy to a pre-production environment if needed → production deploy → post-deploy checks.
- Keep the path to production short. Each extra environment adds cost and delay; ask what each one catches that production verification wouldn't.

## Mapping code to builds
| Layout | Strengths | Risks |
|---|---|---|
| **One repository, one build for everything** | Simple at small scale | Every change builds and deploys everything; lockstep releases — avoid for microservices |
| **One repository per service** | Clear ownership; independent pipelines; access control per repo | Cross-service changes need several PRs; shared code requires published libraries; drift in tooling |
| **Monorepo with per-service builds** | Atomic cross-cutting refactors; shared tooling; visibility | Needs build tooling that builds only what changed; ownership must be defined per directory (code-owner rules); temptation to couple services because it's easy |
Either repo-per-service or a monorepo with proper per-service builds works. Pick by team size, tooling skill and how often changes span services (if often, check the boundaries first).

## Deployment principles
- **Isolated execution**: each service instance runs in its own process/container with its own resource limits, so one noisy service can't starve another.
- **Automate everything**: provisioning, deployment, rollback. Manual steps don't scale to dozens of services.
- **Infrastructure as code**: environments described in version-controlled definitions, reviewed like code.
- **Zero-downtime deployment**: rolling updates, health checks, graceful shutdown, backward-compatible database changes (expand, migrate, contract).
- **Desired-state management**: declare how many instances of which version should run; let the platform converge and self-heal.
- **Multiple instances** of each service across failure zones for anything that matters.
- **Database per service**, but not necessarily a database server per service; share infrastructure, not schemas.

## Deployment options
| Option | Fit |
|---|---|
| Physical machines / VMs, one service per VM | Legacy or special hardware needs; heavy and slow to scale |
| Containers on an orchestrator (e.g. Kubernetes) | The common default for many services; powerful but complex — prefer a managed offering and a platform team |
| Platform as a service | Simple developer experience for standard web services; less control |
| Functions as a service | Event-driven, spiky or low-volume workloads; watch cold starts, limits, and fine-grained sprawl |
Guidance: use the most managed option that meets your needs. Running your own orchestrator is a product in itself; a small organisation with five services rarely needs it. If teams already have a PaaS or managed container platform that works, keep it.

## Separate deployment from release
Deploying puts new code in production; releasing exposes it to users. Feature toggles, dark launches, canaries and parallel runs let teams deploy often with low risk and switch features on gradually. The service team supplies health signals and toggles; the traffic mechanics are Daedalus's area.

## Testing strategy
### The shape
Many fast, narrow tests; fewer broad ones (the testing pyramid):
- **Unit tests**: a function or class; milliseconds; most of the suite.
- **Service (component) tests**: one service, run as a whole, with its collaborators replaced by stubs or mocks. The workhorse of microservice testing.
- **End-to-end tests**: many services deployed together, driving a user journey. Slow, flaky, expensive to maintain.

### Why end-to-end suites fail at scale
- **Flakiness** from timing, environment and data; teams learn to rerun and ignore failures.
- **Unclear ownership**: everyone's tests, nobody's responsibility. Give each journey test an owning team.
- **Pile-up**: slow suites batch many changes into one test run; when it fails, nobody knows which change did it; releases slow down and get bigger.
- **The shared version set**: testing "all services at these versions together" quietly turns the estate into one release unit. Avoid any process that certifies a combined version.
Keep end-to-end tests few — a small number of critical journeys — and fast. Replace the rest with contract tests and production verification.

### Contract tests and consumer-driven contracts
- A **contract test** checks that a service honours what its consumers expect, without deploying them together.
- **Consumer-driven contracts** (Pact is the common tool): each consumer writes down the requests it makes and the responses it relies on; the provider's pipeline verifies it still satisfies all registered contracts before deploying. A failing contract shows exactly which consumer would break.
- Contracts also catch semantic breaks that schema checks miss (see `06`).
- Teams must talk: a contract is a conversation starter, not a substitute for agreeing change.
- For events, verify producers against the schemas consumers rely on, and consumers against example messages.

### How do you verify behaviour safely once it is live?
Pre-production can't reproduce real data, real load or real user behaviour. Safe production verification includes:
- Synthetic transactions (fake users exercising key journeys continuously).
- Canary releases and feature-toggled exposure to a small group.
- Parallel runs comparing outputs (see `04`).
- Monitoring as testing: alerts on business outcomes (orders per minute) as well as technical signals.
Make it safe: synthetic data must be identifiable and excluded from business reports and billing; side effects isolated.

**Mean time to repair vs mean time between failures**: with many services, aiming to never fail is unrealistic. Invest in fast detection and rollback as much as in prevention.

### Cross-functional tests
- **Performance and load**: especially for long synchronous chains; test the whole path, not one service.
- **Resilience**: kill instances, add latency, break dependencies (chaos experiments, see `08`).
- **Backup and restore, failover**: test regularly; an untested backup is a hope.
- **Security scanning**: dependencies, images, static analysis in every pipeline.

## Can a developer work on one service without the whole estate?
- Developers shouldn't need the whole estate locally. Run the service under work plus stubs; use shared remote environments or on-demand ephemeral environments for broader checks.
- A service template ("golden path") with pipeline, logging, tracing and health checks prebuilt cuts new-service time from weeks to hours (see `09`).

## Review prompts for this lens
- Can each service deploy alone, today, without a release calendar?
- How long from merge to production? (Lead time is a DORA measure.)
- Is the same artefact promoted through environments?
- Is there a combined "release" of several services? Why?
- How many end-to-end tests exist, who owns them, how often do they fail spuriously?
- Are consumer contracts verified in provider pipelines?
- Can a bad deploy be rolled back in minutes, by the owning team?

## Example (invented)
An online learning platform has 22 services but a single nightly integration environment where all latest versions run a 3-hour end-to-end suite; releases go out weekly as one bundle. Findings: lockstep release (High), pile-up suite (High). Fix: per-service pipelines to production; consumer-driven contracts for the 12 busiest interfaces; cut end-to-end to five critical journeys run post-deploy; synthetic enrolment transactions in production.
