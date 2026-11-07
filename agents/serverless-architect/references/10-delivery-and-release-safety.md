# Step 10 — Infrastructure code, verification and safe releases

Use for the `IAC & DELIVERY` field in `design` and the delivery lens in `review`.

Grounding: the documentation of the common infrastructure-code tools (Terraform and OpenTofu, Pulumi, AWS CDK and SAM, Azure Bicep), the traffic-shifting features of each platform (function aliases and weighted routing, container revisions), the multi-account landing-zone guidance from AWS, Azure and Google Cloud, OpenFeature for feature flags, consumer-driven contract testing as publicly practised, and MIKA's verification matrix below.

## Why must every setting live in code?
In these systems most behaviour sits in configuration: triggers, filters, retry rules, timeouts, permissions, dead-letter targets, alerts. Settings clicked together in a console cannot be reviewed, reproduced in another account or rolled back. Everything the system depends on is declared in code and applied by a pipeline.

| Tool | Fits when | Watch |
|---|---|---|
| Terraform / OpenTofu | several clouds, or estate-wide modules already exist | state storage, locking and access; pinned provider versions |
| Pulumi | a general-purpose language across clouds | where state is kept |
| AWS CDK | AWS only, and the team prefers a general-purpose language with reusable constructs | read the generated template diff, not only the source |
| AWS SAM | function-centred apps; local runs and quick sync while developing | less suited to large mixed estates |
| Bicep | Azure-first teams | Azure only |
| Serverless Framework | existing projects already on it | licence terms changed with v4 for larger organisations; check before adopting |

One stack per service, owned by that service's team; shared foundations (networks, central logging, buses that span domains) in separate stacks owned by a platform team. Stacks refer to each other through published outputs or parameters, never copied identifiers.

## How are environments kept apart?
- At least one account (AWS), subscription (Azure) or project (Google Cloud) per environment, and one per workload for anything sensitive. Limits, blast radius and permissions then separate naturally.
- Short-lived environments per branch or pull request for services that deploy in minutes, removed automatically.
- Production changes only through the pipeline; human write access in production is break-glass and logged.
- Values that differ per environment come from parameters, not from code branches.

## The MIKA verification matrix
For each risk, choose the cheapest place to catch it. Function code is usually small; most defects hide in configuration, permissions and wiring, so the matrix leans on checks against real managed building blocks.

| Risk | Fast local check | In a deployed test account | In production |
|---|---|---|---|
| Business logic in a handler | unit tests on plain functions; handler with stubbed clients | — | — |
| Message shape and contract | validation against the registered schema; consumer contract checks in the producer's pipeline | publish a sample message and assert each subscriber's outcome | alerts on schema violations |
| Permissions | policy linting and static analysis | exercise each operation with the deployed identity | unused-access reports |
| Trigger, filter and retry settings | assertions on the synthesised template or plan | send good, malformed and failing messages; assert dead-letter arrival and alerts | dead-letter and age alerts |
| Wiring to a managed service | emulators, for speed only | the real service, always, before production | synthetic probes |
| Workflow branches | single-step test tools or local runners | run every branch, including timeouts and compensations | failed-run alerts |
| Performance and limits | — | load test at expected peak with production-like limits | concurrency and limit-usage alerts |
| Resilience | — | scheduled fault injection (the providers' fault-injection and chaos services) | game days |

Rules: every key journey has at least one end-to-end test in a deployed account; an emulator pass is never the only gate; tests that create cloud resources remove them afterwards.

## How does a change reach users safely?
- **Functions**: publish an immutable version and move an alias with weighted traffic (for example 10% for 5 minutes, then everything), with automatic rollback when an alert fires and optional pre- and post-traffic checks. AWS automates this through its deployment service; Azure offers deployment slots on plans that support them.
- **Containers on Cloud Run or Container Apps**: deploy a new revision with no traffic, test it on its tagged address, then shift a percentage; roll back by moving traffic to the previous revision.
- **Workflows**: version and alias the definition; new runs use the new version while running ones finish on the old.
- **Message contracts**: additive changes ship any time; a breaking change is a new message type published alongside the old until every consumer has moved (`04`).
- **Feature flags** (OpenFeature-compatible providers or the platforms' configuration services) separate deployment from release for risky behaviour.
- **Store changes**: expand, migrate, then contract; never remove a field a running consumer still reads.

## Pipeline shape
1. Build once: package or image, bill of materials and signature (`07`).
2. Static checks: lint, unit tests, template and policy checks, dependency scan.
3. Deploy to a test account; run wiring, contract and workflow tests.
4. Deploy to staging with production-like limits; run load and resilience tests on their own schedule, not on every commit.
5. Production with gradual traffic shifting and alert-based rollback.
6. Publish a "deployed" record (version, commit, approver) so the telemetry views (`08`) show changes beside incidents.

## Worked mini-example
Community energy co-op, a new tariff calculation in the settlement service: the pipeline publishes a new function version; a contract check confirms `SettlementCalculated.v2` still carries every field the billing consumer declared; the alias sends 10% of traffic for 10 minutes while totals are compared with the old version on a shadow queue; the error-rate alert stays quiet and traffic moves to 100%. Renaming `kWh` to `energyKwh` would break billing, so it ships as a new message type and both run side by side for one billing cycle.

## Signals for the review
- Resources made by hand, or infrastructure code covering only functions while triggers, alerts and permissions live in the console → High.
- Every environment in one account → Medium; High with personal or payment data.
- Key journeys tested only against emulators → Medium; High for payment or clinical paths.
- Production changes applied all at once with no rollback path → Medium; High on key journeys.
- Breaking message changes shipped in place → High when other teams or partners consume them.
