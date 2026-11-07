# Step 2: choosing a treatment for each step, and making the value case

Use in `assess`. Input: the numbered clauses from `01`. Output: three to seven candidates, each with a treatment, a today → proposed line, value, effort and risk, plus a value case and a rollout plan. The treatment ladder, the scoring sheet and the rollout slices are MIKA's own method.

## Which treatment does each step get?
Walk each clause down the **treatment ladder** and stop at the first rung that fits. The order matters: cheaper, more deterministic treatments come first.

| Rung | Treatment (value for `automation_type`) | Take it when | Main risk to flag |
|---|---|---|---|
| 1 | **integrate** — call a system through its API, queue or file interface | A system already offers an interface and the step is deterministic | Treating remote calls as reliable (see `07`) |
| 2 | **decide** — a DMN decision table or decision graph | The step applies written policy to known inputs | Hidden exceptions nobody wrote down; discretion disguised as a rule |
| 3 | **ai_step** — an LLM or ML model under a quality gate | Input is unstructured (PDFs, emails, voice notes) or the work is extraction, classification, summarising, drafting | Wrong output treated as fact; personal data; no audit (see `09`) |
| 4 | **ui_automation** — UI automation (RPA) as an interim bridge | The only interface is a screen and an API is not coming soon | Breaks on UI change; becomes permanent (see `08`) |
| 5 | **device** — command and confirmation through a device gateway | A machine, vehicle or sensor performs the work | Telemetry floods; unsafe retries of physical actions |
| 6 | **people** — a routed work item with full context | Judgement, empathy, negotiation or legal accountability must stay with a person | Pushing work into a queue without fixing the data people need |
| 7 | **keep_manual** — leave alone for now | Rare, highly variable, politically sensitive, or about to change | Automating a broken process makes it fail faster |

Steps often combine rungs. In the regional ferry operator's refund flow: an AI step reads the passenger's free-text complaint, a decision table maps reason and ticket class to the refund rule, a person approves anything above €300, and an API call issues the refund to the payment provider.

Where terms overlap, use the vocabulary of IEEE 2755-2017 (Guide for Terms and Concepts in Intelligent Process Automation) so clients can map the ladder to their own automation inventory.

## How is each candidate scored?
Use the **candidate sheet**. Value and effort are rated 1–5; risk is named, not scored, because a single number hides what kind of risk it is.

| Column | How to fill it |
|---|---|
| Value (1–5) | Sum of points: +1 per 20 % cycle-time cut on the critical path; +1 if touch time saved × monthly volume > 40 hours; +1 if it removes a known error or rework loop; +1 if it closes an audit or deadline gap; +1 if customers or members see the difference. Cap at 5 |
| Effort (1–5) | 1 = configuration or one table; 2 = one API integration; 3 = several integrations or a new work-item screen; 4 = legacy interface work, data clean-up or an evaluated AI step; 5 = organisational change across teams |
| Unblocks | Which later candidates depend on this one (a structured intake usually unblocks everything downstream) |
| Risk | The one risk most likely to sink it |

Rank by value ÷ effort, then pull forward anything in the "unblocks" column. Write each candidate as `Today: … → Proposed: …`.

Over-automation is a real cost: the `NOT NOW` list (steps deliberately left alone, with reasons) is part of the deliverable, not an afterthought.

## What does the value case contain?
Keep it a page. Decision makers want the baseline, the target, the cost and the assumptions they can challenge.

**Metrics to baseline before any build** (measure from logs or a two-week sample if no system records them):

| Metric | Definition | Why it matters |
|---|---|---|
| Lead time | Trigger to outcome, as median and 90th percentile | Averages hide the long tail customers complain about |
| Hands-on time | Minutes people actually work per case | Basis for capacity and cost |
| Waiting share | Lead time minus hands-on time, as a share | Usually 80–95 % in manual processes; the main target |
| Touchless rate | Share of cases finishing with no person involved | Tracks how far automation reaches |
| Rework rate | Share of cases sent back or corrected | Quality signal |
| Deadline hit rate | Share closed within the promised or legal time | Customer and compliance signal |
| Ageing backlog | Open cases by age bucket | Early warning |
| Operator interventions | Cases needing manual repair per 1,000 | Running cost and reliability |

**Arithmetic** (show every input):
```
annual benefit = volume/yr × minutes saved/case × loaded rate/min
               + avoided penalties, refunds or churn
               + value of faster lead time (only if someone can name it)
annual cost    = licences or managed-service fees (per instance, per state transition, per seat)
               + infrastructure + run and support effort
one-off cost   = modelling, integration, work-item UI, AI evaluation, training, migration
payback months = one-off cost ÷ (annual benefit − annual cost) × 12
```
Give a low/expected/high range. Managed workflow services price per state transition or per action (Step Functions Standard workflows, Logic Apps consumption plans), so estimate steps per case × volume before comparing with a self-run engine.

Benefits that resist pricing (audit readiness, faster launch of a new tariff, fewer weekend escalations) still go in the case, labelled as unpriced.

## How should rollout be sequenced?
MIKA's **three-slice rollout** limits the blast radius and makes every slice measurable.

| Slice | Scope | Exit criterion |
|---|---|---|
| **Slice 0 — walking skeleton** | One thin path end to end (trigger → one integration → one work item → outcome) on the target runtime, deployed through the real pipeline | Deploy, version, observe and recover one case without heroics |
| **Slice 1 — one live process** | A contained process in production with its baseline measured | Metrics move against baseline for four weeks; operators can resolve incidents from a runbook |
| **Slice 2 — second owner** | A different team adopts the conventions for its own process | They ship without the first team doing the work |
| **Enable** | Templates, a small enablement group, shared observability; each team still owns its models | New processes start from templates; no central queue for model changes |

Warnings to include when they apply:
- a large up-front modelling programme that produces diagrams nobody deploys;
- writing an in-house engine when off-the-shelf runtimes exist (list what would have to be built: timers, retries, versioning, history, tooling);
- one central team owning every model and becoming the bottleneck;
- a shared "master process" every team depends on;
- a tool chosen only for business modellers or only for developers;
- automating before the parties agree what the process should be.

## Worked mini-example (community energy co-op, member onboarding)
- Intake: 120 new members a month; lead time median 19 days, p90 41 days; five steps; meter operator has a portal only; grid operator has an API.
- Fit score: V3 D4 I3 W3 C3 H2 = 18 → Strong (borderline; a code-first runtime would also do).
- Candidates: (1) **ai_step** extract ID and address from uploaded documents → **decide** eligibility tier, value 4, effort 3; (2) **integrate** grid-connection check, value 3, effort 2; (3) **ui_automation** meter registration on the operator portal, interim, value 3, effort 3, exit when the operator's API ships; (4) **people** board approval for members above 50 kWp, value 2, effort 2.
- NOT NOW: share-certificate printing (40 a month, about to move to a digital register).
- Rollout: Slice 0 on candidate 2; Slice 1 adds 1 and 4; the UI job in 3 comes last because it has the shortest life.
