# 02 · Event integration readiness

A MIKA scoring instrument for one question: *can this organisation publish and consume events reliably, at the boundary grade the opportunity needs?* Use it in `assess` to choose the first step, in `design` to flag prerequisites, and in `review` to explain why sound designs fail in practice.

## The seven readiness dimensions
Score each 0–3 using the anchors. Score what exists and is used, not what is planned.

| Dim | Question | 0 | 1 | 2 | 3 |
|---|---|---|---|---|---|
| **R1 Need** | Is there a named state change with a measurable cost of delay? | "We should be real-time" | A change named, cost guessed | Change named, delay cost estimated | Delay cost measured; a business owner signs it off |
| **R2 Ownership** | Does every event type have an owning team and a retirement rule? | Nobody owns events | Owners by habit | Owners recorded for most types | Owner, contract and deprecation policy for every type |
| **R3 Publication** | Do events leave the system of record without loss or invention? | Save-then-send in application code | Retries but no atomicity | Outbox or change data capture on main services | Outbox/CDC everywhere events matter; consumers deduplicate |
| **R4 Contract** | Are envelope, schema and change rules written down and checked? | Ad hoc JSON | Shared conventions, unchecked | One envelope standard; schemas registered | CloudEvents (or equivalent) + compatibility checks in CI + AsyncAPI for exposed channels |
| **R5 Trust** | Can each party be identified, authorised and cut off? | Shared credentials | Per-system credentials, coarse access | Per-party credentials and per-channel authorisation | Plus signed delivery, payload encryption where needed, tested access withdrawal |
| **R6 Operability** | Can each side see lag, stopped producers, duplicates and failures? | Only broker defaults | Some dashboards | Lag and error alerts, dead-letter owners | Plus trace context across hops, quiet-producer alerts, rehearsed replay |
| **R7 Reach** | Can a new consumer be connected without a project? | Each consumer is a project | Templates exist | Documented onboarding, test environment | Self-service onboarding, catalogue entry, usage terms |

## Turning scores into a band
Add the seven scores (0–21), then apply the gates.

| Total | Band | Meaning |
|---|---|---|
| 0–7 | **Foundations** | Build one reliable internal event first; no partner exposure |
| 8–13 | **Internal-ready** | Events work between teams (B1); partner exposure needs targeted fixes |
| 14–18 | **Partner-ready** | Contracted partners (B2) can be served with normal care |
| 19–21 | **Open-ready** | Can offer self-service streams (B3) |

**Gates** (override the total):
- R3 = 0 or R5 = 0 → band cannot exceed *Internal-ready*, whatever the total.
- R1 ≤ 1 → mark the result "unproven need"; recommend measuring delay cost before building.
- Target boundary grade above the band → list each dimension below 2 as a prerequisite in the output.

## Worked mini-example — veterinary clinic network
Thirty clinics share a central lab service. The proposal: push lab results to clinics and to pet owners' app the moment they are validated.

| Dim | Score | Evidence |
|---|---|---|
| R1 | 2 | Vets re-check the lab portal 6–10 times a day; owners phone for results |
| R2 | 1 | Lab team informally owns "results" messages |
| R3 | 0 | Lab system saves the result, then a script posts JSON |
| R4 | 1 | Shared field names, no schema checks |
| R5 | 2 | Per-clinic OAuth clients exist for the portal |
| R6 | 1 | Broker dashboard only |
| R7 | 1 | Each new clinic gets a set-up ticket |
| **Total** | **8** | Internal-ready by total, but **R3 = 0 gate** applies |

Reading: clinics are B1 (same organisation), owners' app is B1 too, so the target is reachable — after R3 is fixed. First step: outbox on the lab system plus deduplicating consumers, then the pilot below.

## What makes a good first step?
A pilot should prove business value and build platform habits at the same time. MIKA pilot checklist:
1. **One state change** with an R1 score of 2 or more.
2. **One owning team** that will keep the event after the pilot.
3. **At least one real consumer**, ideally the one with the biggest delay cost; an external one only if the band allows it.
4. **Standard envelope** (CloudEvents attributes) and a registered schema with a compatibility rule.
5. **Reliable publication** (outbox or CDC) and a consumer that deduplicates on `source` + `id`.
6. **Written promises**: delivery guarantee, ordering scope, retention.
7. **Visibility**: consumer lag, stopped-producer alert, dead-letter owner.
8. **A success measure** tied to the value case (`03`): wait time removed, calls avoided, errors avoided.
Time-box it in weeks. If the measure does not move, stop and record why.

## How readiness grows (typical path)
| From | To | Usual moves |
|---|---|---|
| Foundations | Internal-ready | Outbox/CDC on one service; envelope convention; owner register |
| Internal-ready | Partner-ready | Per-partner credentials and channels; signed delivery; AsyncAPI documents; partner-facing runbooks |
| Partner-ready | Open-ready | Catalogue and self-service onboarding; usage terms and metering; lineage evidence; abuse and rate controls |

## Output use
- `assess`: put the band and any gate in the `FIRST STEP` reasoning; R-scores below 2 that block the opportunity go in `Fit`.
- `design`: dimensions below 2 at the target grade become `RISKS & TRADE-OFFS` items.
- `review`: a design that assumes a higher band than the organisation has is a finding (area *Readiness*), usually Medium, High if partners are exposed.
