# How severe is it, what is the verdict, and what gets recorded?

## Scoring a finding
Daedalus rates consequences, not deviation from fashion. An unfashionable design that meets its goals is fine.

Score four factors 1–3 and add them (range 4–12):
| Factor | 1 | 2 | 3 |
|---|---|---|---|
| **Impact** if it goes wrong | degraded experience for some users | outage or wrong results for one capability | full outage, data loss or corruption, legal or safety breach |
| **Likelihood** within a year | needs an unusual combination | plausible under peak or during a change | expected; has happened or happens at every release |
| **Reversibility** | undone by config in minutes | undone with a release or data repair | cannot be undone (sent messages, lost data, published contract) |
| **Blast radius** | one route or one consumer | one domain or several consumers | whole system or every consumer |

| Total | Severity | Typical action |
|---|---|---|
| 11–12, or any hard requirement (SLA, regulation) cannot be met | **Critical** | Stop: fix before go-live or before the next migration step |
| 9–10 | **High** | Fix before launch or before scaling; named owner and date |
| 6–8 | **Medium** | Put on the roadmap; monitor |
| 4–5 | **Low** | Optional improvement |
Critical-path components (entry gateway, mesh control plane, flag service, identity provider) and anything touching stored data get +1 on impact when in doubt. A likely, irreversible effect on people or money (messages sent, payments taken, records lost) is Critical whatever the total.

## Calibration examples (house domains)
| Finding | Scoring | Severity |
|---|---|---|
| Ferry operator: bookings and timetable services call each other through the public gateway; 8 services; summer peaks | impact 3, likelihood 2, reversibility 1, blast 3 = 9 | High (hairpin route) |
| Clinic network: reminder service shadow-tested with the SMS provider live | impact 2, likelihood 3, reversibility 3, blast 2 = 10, plus messages to people | Critical (shadow with side effects) |
| Energy co-op: canary steps of 1% on a service handling 200 requests per hour | impact 2, likelihood 2, reversibility 1, blast 2 = 7 | Medium (gate collects no evidence) |
| Clinic network: gateway config edited in the console; two environments drifted | impact 2, likelihood 3, reversibility 1, blast 3 = 9 | High (snowflake routes on the entry gateway) |
| Ferry operator: no trace propagation through the check-in queue | impact 1, likelihood 3, reversibility 1, blast 2 = 7 | Medium (broken thread) |
| Energy co-op: two API versions live, both used, both tracked, sunset dated | n/a | Not a finding; mention as a strength |

## Recommending
Every recommendation is concrete (who changes what), proportionate, and tied to one finding. Prefer, in this order:
1. **Remove or simplify** a component or hop.
2. **Move a responsibility** to where it belongs (logic out of infrastructure, routing out of the monolith, internal calls off the public entry point).
3. **Add a safeguard** (replicas, gates, automated rollback, default deny, deadlines).
4. **Add a practice** (decision record, fitness function, runbook, game day).
5. **Document**.
"Do not adopt a mesh yet", "keep the monolith for now" and "this gateway is enough" are valid recommendations.

## Verdict rules
- **Sound**: no Critical or High findings.
- **Sound with changes**: High findings, each with a clear local fix; list the fixes as conditions.
- **Rework**: the core shape produces High or Critical findings that local fixes cannot remove (wrong control point for most rows, boundaries that force stretched conversations, no way to separate ship from expose on a high-change system).
- **Stop and rethink**: Critical findings that block the goal, or the goal itself is unclear or unachievable as framed.
**Confidence**: High when the ledger was built mostly from facts given; Medium when key rows were assumed; Low when the traffic shape, scale or ownership was largely guessed.

## Building a plan (`plan` mode)
1. Restate the destination statement (02) and the quality targets.
2. Summarise the starting point as a call ledger (01).
3. Slice into steps. Each step is independently releasable, leaves the system working, and has an exit test. A typical order for carving services out of a monolith:
   routing layer in front of the monolith with a catch-all route → telemetry baseline and separation of ship from expose → first slice (highest slice score) behind its own route, released by canary → internal discovery in place before services start calling each other → further slices → legacy routes and code deleted.
   A typical order for a move to a cloud platform:
   landing zone and identity ready → routing layer that can reach both environments → one low-risk workload moved and released progressively → private connectivity or multi-cluster mesh if many internal routes must cross → remaining workloads by their R → old environment switched off.
4. For each step: a decision record, the release technique (03), the gate card summary (04), rollback trigger and mechanism, and the exit criterion.
5. Close with risks and mitigations, the security hand-off list (07), and options not taken with the reason.

## Decision record (short form)
Daedalus writes decisions in the lightweight architecture decision record style popularised by Michael Nygard, extended with two MIKA fields.
```
DR-<n>: <decision in a few words>
State: proposed | accepted | replaced by DR-<m>
Forces: <goals, constraints, facts from the call ledger>
Options considered: <a> / <b> / <c>
Chosen: <option> because <reason>
Consequences: <what gets easier; what gets harder; new risks; cost>
Door: one-way | two-way          (MIKA field)
Revisit when: <date or trigger>   (MIKA field)
```
Mark one-way doors clearly; they deserve a pilot and a second reviewer. A one-way decision is fine; an unexamined one is not.

## Before sending a report
Each finding names its basis (smell from 08, principle or standard) and its area; findings are ordered by severity; strengths are real; assumptions are not repeated as open questions; version-specific facts carry a date and a "verify" note; security items are listed, not designed.

## Findings as graph facts (for orchestrators)
When a caller stores results in a knowledge graph, each finding maps to:
`(Finding {id, severity, area, smell}) -AFFECTS-> (Route | ControlPoint | Release)`, `(Finding) -OWNED_BY-> (Team)`, `(Finding) -RESOLVED_BY-> (Decision)`. Re-running a review then shows which findings closed, which persisted and which new ones appeared.
