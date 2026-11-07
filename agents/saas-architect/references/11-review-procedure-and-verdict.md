# Review procedure — from evidence to findings and a verdict

Use for every `review`: an existing or proposed multitenant architecture, a diagram, a design document, infrastructure code, a repository, or a convergence plan. The steps follow Hestia's own working order; each points to the reference that holds the detail.

## The procedure at a glance
| # | Step | Reference | Produces |
|---|---|---|---|
| 1 | Intake and single-service test | `01` | SYSTEM line, ASSUMPTIONS, score 0–6 |
| 2 | Sharing decision per segment and component | `02` | tenancy findings |
| 3 | Control plane and catalog | `03` | control-plane findings |
| 4 | Lifecycle workflows | `04` | onboarding findings |
| 5 | Identity, context propagation, routing | `05` | identity findings |
| 6 | Isolation rung required vs proven, per path | `06` | isolation findings |
| 7 | Data layout per store | `07` | data findings |
| 8 | Shared services, platform, fairness | `08` | noisy-neighbour findings |
| 9 | Plans, metering, cost to serve | `09` | tiering and metering findings |
| 10 | Operations, releases, convergence | `10` | operations and migration findings |
| 11 | Rate, recommend, decide | this file | FINDINGS, STRENGTHS, OPEN QUESTIONS, VERDICT |

Agent callers cannot answer follow-up questions: never block. Assume, flag the assumption, and continue.

## Trace one request end to end
Before running lenses, describe in words the path of one request for one customer: entry → identity → routing → service → store → asynchronous jobs → telemetry → billing. For each hop note the sharing option, where the customer reference comes from, and the isolation rung. Most findings show up as gaps on this trace.

When reading a repository, look specifically for: where the customer reference is obtained, raw queries outside the shared data layer, cache key construction, jobs that loop over all customers, credentials with access to every customer, and any place a client-supplied value names the customer. Report file and line in `Where:`. Do not echo secrets; flag them and recommend rotation.

## Lens questions (map to the `lens` field)
| Lens | Ask |
|---|---|
| tenancy | Is sharing explicit per segment and component, scored and gated? Blast radius acceptable? Limits vs three-year count? |
| control plane | One catalog? Off the request path? Operators separated and audited? Events for lifecycle? |
| onboarding | One automated workflow for every plan? Idempotent, reconciled? Suspend, plan change, relocation, retirement? |
| identity | Customer reference from a verified credential only? Federation matched by connection? Asynchronous context verified? |
| isolation | Required vs proven rung on every path, including caches, jobs, files, telemetry, AI? Cross-customer tests? |
| data | Layout per store? Keys and indexes led by the customer reference? Single-customer restore and erasure? Residency per copy? |
| noisy neighbour | Fairness rungs F1–F6 present where needed? Per-customer consumption measured? |
| tiering | Plans enforced, defined as data, premium promises backed by placement? |
| metering | Billable usage separate, deduplicated, reconciled? Cost to serve known? |
| operations | Per-customer view and alerts? One pipeline, rings, no drift? |
| migration | Convergence stage and exit test? Control plane before shared components? |

Report only what matters for this system.

## Rating a finding: the MIKA severity score
Score four factors from 1 to 3 and add them (4–12).

| Factor | 1 | 2 | 3 |
|---|---|---|---|
| **Impact** | inconvenience, cost or speed | one customer's data or service harmed, or a contract term missed | data of one customer exposed to another, or all customers down |
| **Likelihood** | needs several unlikely conditions | needs one ordinary bug or misconfiguration | happens now, or with normal use |
| **Reach** | one customer | one segment or stamp | every customer |
| **Reversibility** | undone in minutes | undone with effort | cannot be undone (disclosure, lost data) |

| Total | Severity |
|---|---|
| 11–12 | Critical |
| 8–10 | High |
| 6–7 | Medium |
| 4–5 | Low |

Overrides:
- A customer reference taken from a client-settable value is **Critical**.
- Never rate a cross-customer exposure below High because it "needs a bug": isolation exists to survive bugs (likelihood is at least 2).
- Sensitive or regulated data raises impact by one step (cap 3).
- Severity measures consequence, not how unusual the design looks.

### Calibration examples
| Finding | I/L/R/Rv | Total | Severity |
|---|---|---|---|
| Services read `X-Tenant` header from the client | override | — | Critical |
| VetFlow clinical notes protected only by a repository filter (L1, required L3) | 3/2/3/3 | 11 | Critical |
| Shared cache keyed by entity ID only; HarbourLine passenger bookings cached | 3/2/3/3 | 11 | Critical |
| Same cache flaw, only non-personal timetable data cached | 2/2/3/2 | 9 | High |
| Nightly settlement job over all co-ops under one admin role | 3/2/3/2 | 10 | High |
| No per-customer rate limits on a shared API | 2/3/3/1 | 9 | High |
| Group Enterprise promised dedicated database, served from shared stamp | 2/3/2/2 | 9 | High |
| No single-customer restore for shared PostgreSQL | 2/2/1/3 | 8 | High |
| Plan changes need manual steps by operations | 1/3/2/1 | 7 | Medium |
| Telemetry not tagged with customer reference | 1/2/3/1 | 7 | Medium |
| No in-product usage view | 1/2/1/1 | 5 | Low |

Where judgement moves a factor away from the obvious value, say why in the finding.

## Recommending fixes
Each fix names who changes what, where, and is proportionate to the finding. Prefer, in order:
1. Close isolation gaps: trusted customer context, required rung reached and proven, caches and jobs scoped.
2. Fix the operating model: one release, automated lifecycle, one pipeline, one catalog.
3. Adjust sharing: dedicate what the matrix and gates demand, share the rest, stamps for blast radius and limits.
4. Protect customers from each other: fairness rungs by plan, a move path for heavy customers.
5. Make customers visible: telemetry, operator view, metering, cost to serve.
6. Record decisions: sharing choice and rung per component, with reasons.

Hand off depth: token and OAuth detail → **Argus**; serverless specifics → **Aeolus**; capacity and load testing → **Atlas**; service decomposition → **Theseus**.

## Verdict rules
| Verdict | When |
|---|---|
| **Proceed** | no Critical or High findings |
| **Proceed with conditions** | High findings with clear, local fixes; list each condition |
| **Redesign** | the sharing or operating model itself creates High or Critical findings that local fixes cannot solve (no viable rung for regulated data in the chosen layout; per-customer forks as the core model; single-service score 0–1 with growth plans) |
| **Do not proceed** | Critical findings that make go-live unsafe or unlawful as designed (cross-customer exposure, spoofable customer identity, data in a forbidden jurisdiction) |

**Confidence**: High when the evidence came from code, configuration or detailed documents; Medium when from a diagram and description; Low when most facts are assumed.

## Recurring problems and their usual fixes
| Problem | Usual fix |
|---|---|
| Customer identifier from a header, path or body set by the client | take it from the validated token; strip inbound identity headers at the edge |
| "Every query filters by customer" as the only control | reach L2 or L3 (`06`); fail closed without context; cross-customer CI suite |
| Cache keys without the customer reference | prefix keys; separate namespace for sensitive data |
| One job over all customers with an all-powerful role | per-customer execution with scoped credentials, checkpoints and per-customer failure handling |
| Per-customer branches or pinned versions | convergence stage C2 (`10`) |
| Manual setup for enterprise customers | same workflow for all plans; resource inventory (`04`) |
| Customer lookup service on every request | claim in the token; cached placement (`05`) |
| Premium promise served from the shared pool | dedicated pool or database, or change the promise |
| No per-customer limits | fairness rungs F1–F2 (`08`) |
| Database per customer with hand-run migrations | fleet migration tooling with per-database status (`07`) |
| No way to restore or erase one customer | single-customer restore tooling; erasure workflow including backups (`04`, `07`) |
| Shared vector index without a server-side filter | namespace per customer or mandatory filter; recall tests |
| One huge shared deployment for every customer in one region | regional stamps with a thin router (`02`) |
| Namespace per customer without network policy or scoped service accounts | deny-by-default policies, quotas, restricted pod security, workload identity (`08`) |
| Serverless pool without concurrency controls | reserved concurrency, event-source maximum concurrency, usage plans per customer (`08`) |
| Cost per customer unknown | tags for dedicated parts, drivers for shared services (`09`) |

## Open questions
List only questions whose answer would change a rating or a placement, each with the finding it affects and how. Do not repeat an assumption as a question.
