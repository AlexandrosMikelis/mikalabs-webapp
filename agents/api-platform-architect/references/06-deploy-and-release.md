# Deploying vs releasing APIs

## The distinction
- **Deploy**: put a new version into production as a running process. It receives no (or no user-impacting) traffic yet.
- **Release**: expose that version to users in a controlled way, with business impact.
- Separating them lets teams deploy often and in small batches while the business controls when features go live, and lets you limit and measure the risk of each change. API-based architectures make this possible; without the separation, teams end up choreographing releases across services, which brings downtime and pressure.

## Two mechanisms
1. **Feature flags (code-level)**: new and old paths both deployed; a flag service decides per user, cohort or globally which runs. Best for in-process seams and for routing a few users to a new backend (e.g., legacy store vs new service). Rules:
   - The flag service is a cross-cutting dependency and potential single point of failure: cache last-known values, define safe defaults, degrade gracefully.
   - Unique flag names, owner and expiry for every flag; delete flag and dead code once rollout is complete. Never reuse a flag name.
   - Not practical when many external consumers would each need to adopt the flag; use traffic routing instead.
2. **Traffic management (infrastructure-level)**: gateway at ingress, or mesh between services, decides how much traffic each version receives. Deployment pipeline: merge → build image → push to registry → deploy (no traffic) → release config moves traffic in stages.

## Choose the strategy by type of change and coupling
Use semantic versioning together with an API lifecycle (planned → beta → live → deprecated → retired):
- **Planned**: announce, gather consumer feedback on the design.
- **Beta**: consumers integrate for feedback; breaking changes still allowed; not yet versioned.
- **Live**: versioned; only one live major/minor at a time; every change from here is versioned.
- **Deprecated**: still available, no significant new work. After a minor release, short deprecation until the new version is validated; after a major release, weeks or months with migration guide, communication and usage tracking.
- **Retired**: removed.
Mapping:
- **Major (breaking)**: run old and new side by side for the deprecation window; consumers opt in by version (URI segment like `/v2/…`, or a version header routed at ingress). Track usage of the old version before retiring; contracts/SLAs may set notice periods.
- **Minor / patch (compatible)**: deploy without traffic, then use a progressive strategy; consumers don't change anything. Guard compatibility in the build: diff the API specification (e.g., OpenAPI) against the previous version and fail on breaking changes unless consciously overridden.
- **Tightly coupled producer and consumer** owned by one team and always moving together: versioning matters less; release both together and switch at ingress (blue-green).

## Release strategies
| Strategy | How | Use when | Costs and cautions |
|---|---|---|---|
| Canary | Small share of traffic (e.g., 1% → 5% → 25% → 100%) to the new version, watched, then increased | Most compatible changes; need real-traffic validation with limited exposure | Needs good monitoring and fast (ideally automated) rollback. Pod-ratio splitting is coarse (1% needs 100 pods); use gateway/mesh weighted routing for fine-grained shares |
| Traffic mirroring / dark launch | Copy requests to the new version; responses discarded or compared out of band | Refactors and rewrites; checking correctness or performance with no user impact | Validates technical behaviour, not business impact. Mirrored writes and side effects (payments, emails, duplicate records) must be prevented or sandboxed |
| Blue-green | Two complete environments; switch the router from blue to green; switch back to roll back | Coupled components released together; simple, fast cut-over and rollback | Double resources; all-at-once exposure; shared databases and schema changes complicate rollback |
| A/B / multivariate | Split traffic between variants to compare business outcomes | Product experiments | Needs statistical design and enough traffic; sticky assignment per user |
| Rolling update (platform default) | Instances replaced gradually | Low-risk changes | Deploy and release are not separated; no traffic control |

## Automating the rollout
- Progressive-delivery controllers (e.g., Argo Rollouts, Flagger) define the steps (weights, pauses, manual gates) declaratively and integrate with gateways and meshes for weighted routing.
- **Analysis-driven promotion**: each step checks metric queries (success rate, latency percentiles, saturation, key business events) against thresholds; pass → next step, fail → automatic rollback.
- Define per release: success signals and thresholds; minimum observation time and traffic volume per step; who can pause or abort; rollback trigger.
- Success rate alone is crude: separate client errors from server errors (see 07).

## Rollback and state
- Traffic rollback is fast; data rollback isn't. Use expand–contract (parallel change) for schemas: add new structures, write to both or migrate, switch reads, remove the old only after the release is final. (General practice beyond the source.)
- Keep the previous version deployed until the new one is fully released and stable.
- Caches can hide a broken version during a canary and then fail at full rollout (see 07).
- Make rollback a rehearsed, one-command or automatic action.

## Decision questions for a release ADR
- Can deployment and release be separated for the systems live today? If not, start there.
- How coupled are producer and consumer?
- Does the pipeline enforce compatibility checks for traffic-managed APIs?
- Which strategy fits each change type, and what infrastructure does it need?
- If flags are new to the organisation, which practices and safeguards will you adopt first?
