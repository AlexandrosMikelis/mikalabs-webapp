# Review procedure: how Ergane checks a model, a workflow in code, or an automation design

Use for every `review`: a deployed or proposed BPMN diagram (XML or text), a workflow in code or a visual tool, an automation architecture (runtime, services, UI automation, AI steps) or a technology choice. The procedure follows the same order as Ergane's design method, so a finding always points to the step that would have prevented it.

## R0: What are the facts, and what must be assumed?
Fill the intake sheet from `01`: purpose and outcomes, owner, trigger, volume, case duration, participants and interfaces. Add: runtime and topology; call styles and workers; work-item handling; where rules live; UI automation; AI steps; versioning; tests; monitoring and incidents; regulation.
Where a missing fact would change a severity, write the assumption, continue, and list it under OPEN QUESTIONS. Agent callers cannot answer, so never stop to ask.

## R1: Is this the right kind of automation at all?
Score the fit (`01`). Flag mismatches early: an expert-driven investigation forced into a rigid sequence; a sub-second request chain drawn as a diagram; a multi-week process held together by cron jobs and status columns; a code-first runtime where compliance needs a business-readable model, or the reverse.

## R2: Does the diagram mean what its modellers intended?
Walk the tokens (`03`):
- each start has a trigger; each path reaches a named end;
- split and merge kinds match;
- each XOR split has a default;
- each message catch has a name and a correlation key; early replies are handled;
- each wait is bounded or justified;
- interrupting versus non-interrupting matches the business intent;
- each state-changing step before the pivot has compensation;
- anytime events (withdrawal, change of details) are covered by event sub-processes.

## R3: Which areas need findings?
Run every area; report only what matters for this case.

| Area | Questions | File |
|---|---|---|
| Fit | Right treatment and runtime? Diagram used as graphical code? Case work forced into a sequence? | 01, 02 |
| Semantics | Token correctness, defaults, correlation, bounded waits | 03 |
| Legibility | Two-minute rule, naming, technical detail at top level, gateway staircases | 04 |
| Deviation handling | Outcomes, business deviations and technical faults placed by the response-owner test? | 04 |
| Decisions | Rules extracted, hit policy, catch-all row, tests, versions | 05 |
| Boundaries | One owner per model? Reaching into other teams' internals? Call activities across teams? Shared engine as back channel? | 06 |
| Coordination | Each interaction decided with the coordination table? Core path relayed through events? Coordinator absorbing domain logic? | 06 |
| Integration | Call sheets complete: timeout, capped retry, idempotency key, exhaustion, early-reply race, dead-letter queues | 07 |
| Consistency | Dual writes, saga order and pivot, idempotent compensation, outbox | 07 |
| People | Work-item sheets: groups, separation of duties, due dates, escalation, context | 08 |
| UI automation | Bridge contract: coordinated from the flow, one transaction, identity, exit ticket | 08 |
| AI steps | Step sheet, autonomy level, gates, guardrail layers, audit record, evaluation | 09 |
| Runtime and change | Topology fits teams; versioning and migration; tests in CI | 10 |
| Visibility and improvement | Incidents seen, milestones at business moments, status inquiry, cross-system traces, conformance checking | 10 |
| Value | Baseline measured? Slice 1 live? Central bottleneck team? | 02 |

## R4: How severe is each finding?
| Severity | Meaning | Action |
|---|---|---|
| **Critical** | Cases lost, duplicated with financial, clinical or legal effect, or stuck silently; irreversible actions without control; a compliance breach | Contain before go-live or now; escalate |
| **High** | Significant failure or inconsistency likely under normal faults or growth; customers or partners affected; changes need joint releases across teams | Fix before launch or next release; named owner |
| **Medium** | Real but containable risk to operations, legibility, evolution or cost | Plan in roadmap; monitor |
| **Low** | Good-practice improvement | Optional |

Rate by impact × likelihood × number of cases or parties × reversibility. Weigh regulated and customer-facing processes more heavily. Severity measures consequence, not how unusual the design looks.

### Calibration examples
| Finding | Severity | Why |
|---|---|---|
| Refund step retried on timeout with no idempotency key; ferry payment provider sometimes times out after charging | Critical | Duplicate refunds with money leaving the business, recurring under normal faults |
| AI step sends dosage instructions to pet owners with no vet gate | Critical | Irreversible, clinical harm possible, no control |
| Lab-result wait has no timer; about 2 % of results never arrive | High | Cases stall silently, patients affected, will grow with volume |
| Co-op payout rules spread over nine gateways; finance changes them quarterly | Medium | Real change risk and opacity, but no direct loss if tested |
| Activity names are technical ("callPMS") at the top level | Low | Legibility only |
| Meter registration UI job runs a whole onboarding process inside the UI automation tool | High | No case visibility, one UI change stops all onboarding |
| Disruption handling relayed through four services reacting to each other's events, no owner of the deadline | High | Invisible core path; any reorder needs a joint release; missed events go unnoticed |

## R5: What should the fixes look like?
Each fix is concrete (who changes what), proportionate and tied to one finding. Prefer this order:
1. **Shape**: right treatment and runtime; split models by owner; orchestrate the core path.
2. **Safe execution**: defaults, bounded waits, idempotency, compensation, incidents.
3. **Control of rules and AI**: DMN, gates, guardrails, audit.
4. **Legibility**: naming, levels, pushing technical detail down.
5. **Operations and evidence**: monitoring, milestones, tests, versioning plan, conformance checks.

Say "a scheduled job / one service / no runtime is enough" when that is the honest answer.

## R6: Which verdict?
- **Proceed**: no High or Critical findings.
- **Proceed with conditions**: High findings with clear fixes; list the conditions.
- **Redesign**: the core shape causes High or Critical issues local fixes cannot solve (one model driving several teams' internals, the core path relayed through events with no owner, the wrong kind of automation).
- **Do not proceed**: Critical findings that make it unsafe or unlawful as designed, or no business need.

Confidence: High, Medium or Low, by how much had to be assumed.

## Quick catalogue: symptom → repair
| Symptom | Repair |
|---|---|
| XOR without default | Default flow to a person or a safe end |
| Parallel split merged by XOR | Parallel merge |
| External wait with no timer | Timer boundary: reminder, then final outcome |
| Retry loops drawn by hand | Runtime retries plus incidents |
| Gateway staircase of policy | Business Rule Task + DMN table, hit policy U, catch-all row, tests |
| One model driving several teams' internals | One coarse capability per team; end-to-end flow commands outcomes |
| Core path as a relay of events | Orchestrate the core in the owning context; keep events for side reactions |
| Call activity into another team's process | Command message or API with its own contract |
| Write to database, then publish | Transactional outbox, or runtime state committed in the same local transaction |
| Bookings or charges with no undo | Saga with compensation; hardest-to-undo step last |
| Workers without idempotency | Key per step; receivers deduplicate |
| Work items for named people, no due dates | Groups, due dates, escalation timers |
| UI job running a whole process | Coordinate from the flow; one transaction per UI job; exit ticket |
| Agent sends customer or clinical messages directly | Agent drafts (A0/A1); gate or DMN decides; audit record |
| No migration rule for multi-month cases | Backward-compatible services until drain, or mapped migration |
| Home-grown state machine growing timers | Evaluate an existing runtime |
| Failures logged, cases stuck | Incidents after retries; console and runbook |
| KPIs from technical timestamps | Milestone events at business moments |
