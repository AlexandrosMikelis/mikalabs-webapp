# How does a change reach users, and how is it undone?

## Ship and expose are two separate acts
- **Ship (deploy)**: the new build is running in production but receives no user-facing traffic, or only synthetic checks and staff testers.
- **Expose (release)**: a controlled share of real users or calls reaches it.
Keeping the two apart lets teams ship small changes often while the business decides when behaviour goes live, and turns each exposure into a measured experiment. A platform whose only mechanism is a rolling update has merged the two: every deploy is a release to everyone. That is the first thing Daedalus checks.

## Two levers for exposure
| Lever | Where the decision is made | Best for | Watch out for |
|---|---|---|---|
| **Feature flag** | inside the application, per request, using an evaluation context (user, clinic, region, member tier) | changes behind an in-code seam; cohort releases; kill switches; trying a new backend for a few accounts | the flag service becomes a dependency on every request; stale flags; untested flag combinations |
| **Weighted routing** | at a gateway, mesh or Gateway API route (`backendRefs` with `weight`) | whole new versions of a service; changes where callers cannot or should not change anything | coarse if done by replica count; caches and sticky sessions skew the split |

**Flags, done safely.** Use a vendor-neutral flag API such as OpenFeature (a CNCF project) so code does not bind to one flag vendor. Every flag has an owner, a type (release, experiment, operational, permission), a creation date and a removal date. Evaluate with a local cache and a coded default so the application keeps working when the flag service is down. Never recycle a flag name; a reused name can wake dead code paths. Remove the flag and the dead branch within one release cycle of reaching 100%.

## MIKA's release route chooser
Pick the technique from two questions: **who controls the callers**, and **how reversible are the change's effects**.

| | Effects fully reversible (stateless, compatible) | Effects need a data plan (schema change, new write path) | Effects irreversible (payments, messages to people, physical actions) |
|---|---|---|---|
| **We control every caller** (one team, internal only) | Switch at the router after smoke tests; blue-green is enough | Parallel change on the data first, then blue-green or canary | Shadow first with side effects stubbed, then a tiny canary with a manual gate |
| **Many internal teams call it** | Weighted canary with automated analysis | Parallel change + canary; old version kept running until contract phase ends | Shadow → canary at 1% with manual gate at each step |
| **External consumers call it** | Canary for compatible changes; breaking changes go to the next major, run side by side | Next major run side by side, deprecation window, usage tracking | Next major, opt-in pilot consumers, contractual notice |

### What each technique is
- **Canary**: route a small share (e.g., 1% → 5% → 20% → 50% → 100%) to the new version, hold each step long enough to collect a meaningful sample (see 04), promote or roll back.
- **Shadow (mirroring)**: copy live requests to the new version and discard its responses, optionally comparing them offline. Proves technical behaviour under real load; says nothing about user impact. Writes and side effects must be suppressed or pointed at a sandbox: a mirrored "send reminder" call texts a pet owner twice.
- **Blue-green**: two complete environments; flip the router; flip back to undo. Fast and simple; doubles capacity for a while; everyone moves at once; a shared database makes "flip back" harder than it looks.
- **A/B experiment**: a product decision tool (sticky assignment, pre-registered metric, enough traffic), not a safety tool. **Rolling update**: no traffic control, so not a canary; fine for low-risk changes.

## Versions and deprecation for published APIs
- Follow semantic versioning for the contract: compatible additions are minor; anything that can break a correct client is major.
- Check compatibility in the build: diff the OpenAPI, AsyncAPI or protobuf definition against the last released one and fail the pipeline on breaking changes unless someone approves an exception (tools such as oasdiff or buf breaking do this).
- Where the consumers are internal teams, add consumer-driven contract tests (for example with Pact): each consumer publishes the interactions it relies on, and the provider's pipeline verifies them before any deployment.
- Retries during a rollout must be safe: operations that create or charge something accept an idempotency key so a repeated request does not book the same sailing twice.
- Run old and new majors side by side; route by path segment (`/v2/...`) or a version header at the entry point.
- Announce deprecation in band: the `Deprecation` response header (RFC 9745, 2025) and the `Sunset` header (RFC 8594) with a link to the migration guide.
- Track calls to the old version per consumer; retire only when usage is zero or the contractual notice period has passed.

## Automating progressive exposure
Open-source tools such as **Argo Rollouts** (canary and blue-green strategies with `AnalysisTemplate` checks) and **Flagger** (part of the Flux project; canary, A/B, blue-green and, on supporting meshes, mirroring) drive the steps declaratively. Both can shift weights through Kubernetes Gateway API routes and through several meshes and proxies; check the current list of supported traffic providers before choosing.
Each automated rollout declares:
1. the steps (weights, pauses, manual approvals);
2. the analysis at each step: queries, thresholds, minimum sample, failure limit;
3. what happens on failure: abort, shift all traffic back, alert the owner;
4. who may pause, promote or abort by hand.

## Undoing: traffic is fast, data is slow
- Keep the previous version running and warm until the new one has been at 100% through at least one full business cycle (ferry operator: a weekend sailing peak; energy co-op: a month-end billing run).
- Schema changes follow parallel change: expand (add columns or tables, keep old ones), migrate (backfill, write both, switch reads), contract (drop old structures only after rollback is no longer needed).
- Message formats follow the same rule: consumers accept both old and new before producers send the new one.
- Rollback is one command or automatic, and it is rehearsed. A rollback path that has never run is a hypothesis.

## Worked mini-example: veterinary clinic network
Change: v2.4 of the Appointments API adds a `species` filter (compatible) and moves reminder sending to a new Notifications service (irreversible side effect: SMS to pet owners).
- Filter: weighted canary 5% → 25% → 100%, automated gates on 5xx rate and p95 latency; called by the clinic web app and two partner booking sites, so no version bump.
- Reminders: shadow the Notifications service for three days with the SMS provider stubbed, compare intended messages with the legacy job's output, then enable for one clinic by flag, then by region. Kill switch flag returns sending to the legacy job.
- Decision record: "Release reminders by flag per clinic, not by weighted routing", because the risk is per clinic (local opening hours, phone formats), not per request.
