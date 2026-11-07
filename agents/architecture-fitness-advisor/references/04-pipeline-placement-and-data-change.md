# Pipeline placement and changing data safely

A check only governs if it runs where change happens. For most teams that is the **deployment pipeline**: the automated path every change follows from commit to production (continuous-delivery practice). This file covers where each kind of check belongs, how to tell whether the feedback loop is healthy, and how to change schemas and shared data without a big-bang cut-over.

## Where in the pipeline does each check belong?
Each stage buys more confidence for more time and money:
| Stage | Typical content | Checks placed here |
|---|---|---|
| **Before push** | build, fast unit tests, linters | fast single checks developers can run locally: import rules, formatting, secret scan |
| **Pull request / commit** | full unit tests, static analysis, packaging | single on-change checks: architecture rules, cycle detection, complexity limits, changed-line coverage, licence and vulnerability scans, API breaking-change detection |
| **Integration** | deploy to a test environment; service and contract tests | contract tests, migration tests, resilience tests at integration level |
| **Pre-release** | production-like environment | latency and throughput budgets, composite security tests, failover tests |
| **Release** | progressive rollout | gate on the new version's health signals (mechanics → Daedalus) |
| **Production** | live monitoring | always-on checks: SLOs, business signals inside a band, cost bands, drift detection, fault-injection |
| **Calendar** | nightly, weekly, quarterly jobs | scheduled checks: dependency age, certificate expiry, manual reviews with a recorded outcome |

Placement rules Chronos applies:
- **Earliest reliable stage.** Put each check at the first stage that can evaluate it without false alarms.
- **Run independent stages in parallel** to keep total time short.
- **One pipeline per independently deployable unit.** If several units share a pipeline and ship together, independent deployment is already lost.
- **Everything in version control.** Pipeline definitions, infrastructure and checks are reviewed like application code.
- **A flaky check is a defect.** A check that fails at random teaches people to ignore every check.

## Is the feedback loop healthy?
Small, frequent change only works when feedback is fast and trustworthy. Chronos reads four signals together:
| Signal | Healthy | Warning |
|---|---|---|
| **Minutes from push to verdict** | under ~15 minutes for the pull-request stage | hours, so people batch changes |
| **Defects found after merge that an earlier stage could have caught** | rare | frequent: local or pull-request checks are missing coverage |
| **Team time spent fixing a red mainline** | small, owner obvious | large: merges too big, checks too late, or nobody owns the trunk |
| **Flaky-test rate and share of red builds** | low and falling | rising |

How to read the combination: fast feedback with many escaped defects means checks are missing; slow feedback with few escapes means checks sit in the wrong stage; long red-mainline time points at batch size or ownership. When a shared environment has become the only place problems appear, give developers a way to run the relevant checks on their own branch before merge; the cost is keeping that setup close enough to the real one.

## Why are testability and deployability early warnings?
- **Testability.** A part that is easy to test alone has explicit dependencies and a clear job. When fast, isolated tests are hard to write, coupling or mixed concerns are usually the cause. Track test duration, the share of tests that need a full environment, and how often tests break for unrelated changes.
- **Deployability.** Releasing one part without coordinating others is the practical proof of decoupling. Track how many deployments need another unit to ship at the same time, how often release trains are used, and how long a rollback takes.
- Both feed the DORA metrics in `07`: frequent deployment and short lead time are only reachable with testable, independently deployable units.

## Batch size, trunk and toggles
- **Small changes** are easier to review, test, release and roll back; each one is less likely to cause an incident and quicker to diagnose.
- **Trunk-based development** with short-lived branches (see trunkbaseddevelopment.com) keeps integration continuous. Long-lived branches hide structural drift until merge day.
- **Feature toggles** separate deploying from releasing (Fowler's bliki has the standard taxonomy). Treat each toggle as debt with an expiry; a scheduled check can fail the build when a toggle outlives it.
- **State the expected effect** of a significant change before shipping, measure it, then keep or revert. Production metrics and checks are the instrument.

## How do schemas and shared data change safely?
Data usually outlives the code around it and is often shared, so it is the hardest facet to change.

### Schema changes
- Every schema change is a **versioned, scripted migration** stored with the code and applied by the pipeline, never by hand (Flyway, Liquibase, Alembic and similar tools follow this model).
- Use **parallel change** (expand, migrate, contract): add the new structure, write to both or backfill, move readers, then remove the old structure. Each step ships and rolls back on its own.
- Run migrations against production-sized data in the pipeline and time them.
- Ship schema changes separately from application changes so either can roll back.

### Shared databases
- A database read and written by several applications is an unwritten integration contract: any schema change may break someone, and it binds otherwise separate services into one release unit (`05`).
- Govern with a data-access check: list which units may touch which schemas or tables, and fail when a new connection appears.
- Way out: give each schema an owner, put access behind an API or published views, then split stores along ownership lines.

### Data couplings to watch
- **Two-phase commit across services** ties them into one availability and release unit. Prefer compensating workflows (sagas) or move the boundary. Messaging mechanics belong to an event-architecture specialist; Chronos checks the coupling effect.
- **Analytics on the operational store.** Heavy reporting against the transactional database couples reporting needs to its schema and load. Replicate to a separate analytical store or projection.
- **Old data, new shape.** Long-lived data hides nulls, encoding problems and orphan rows. Profile before migrating.

### When a database guarantee moves into the application
Moving away from triggers, stored procedures or foreign keys across what become separate stores does not make the guarantee disappear by itself. Replace each one explicitly and give it a check: a reconciliation job for cross-store references, a monitor for intentionally duplicated data, validation tested in the pipeline.

### Changing storage technology
A move between storage engines suits side-by-side comparison (`02`): run both, compare reads, cut over one entity type at a time once mismatches stay at zero long enough.

### Worked example: veterinary clinic network
Splitting the shared `patients` schema between appointments and medical records: (1) data-access check in the pull-request stage, ratcheted from today's 11 cross-module queries; (2) parallel change on the `owner_contact` columns over three releases; (3) nightly reconciliation of patient IDs across both stores, threshold 0 orphans, alerting the records team; (4) temporary check retired when the last cross-module query is gone.

## Pipeline review questions
- Does every deployable unit have its own pipeline and release on its own?
- Which checks run at which stage? Are important ones only manual, or only in production?
- How long does a typical change wait for a verdict? How often is the mainline red, and for how long?
- Are migrations automated, reversible and tested at realistic volume?
- Is there a calendar stage for scheduled checks?
- Can a newly disclosed vulnerability be checked across every system in one run?
