# Step 5 — Coordinating multi-step and long-running work

Use for the `ORCHESTRATION` field in `design` and the workflow lens in `review`. Covers when a coordinator earns its place, which engine and mode to choose, how to wait for people and partners, and how to undo partly finished work.

Grounding: the workflow-engine documentation of AWS (Step Functions), Azure (Durable Functions, Logic Apps) and Google Cloud (Workflows, Cloud Tasks), the saga pattern (Garcia-Molina and Salem, 1987) as described in public pattern catalogues, and MIKA's coordinator test below.

## Does this process need a coordinator?
**MIKA coordinator test.** Use a workflow engine when **two or more** of these are true; otherwise let services react to events (`04`).
1. The business needs one place that answers "where is case X and what failed?"
2. Steps must run in a defined order, with branches that depend on earlier results.
3. A step waits for a person, a partner or a timer for longer than a function should run.
4. A failure part-way through requires undoing earlier steps.
5. A step must be retried on a different schedule from the others, or a different error path applies per step.
6. An auditor or regulator will ask for the history of each case.

Inside one service, a workflow replaces hand-written state machines in code. Across services, a workflow owned by the team that owns the business outcome calls other services through their public APIs or events, never their stores.

**Why not just chain functions?** Function A invoking function B and waiting doubles the bill, stacks timeouts, hides state in logs, and makes retries ambiguous. Function A writing "next step" flags into a table is a workflow engine built by hand, without the history.

## Which engine and which mode?
| Need | AWS | Azure | Google Cloud |
|---|---|---|---|
| Long-running, auditable, waits for hours or days | **Standard**: up to 1 year per execution, exactly-once step execution, full history, billed per state transition | Durable Functions (orchestrator functions with replay), Logic Apps Standard | Workflows (executions up to 1 year), Cloud Tasks for delayed calls |
| Short, high-volume, under 5 minutes | **Express**: at-least-once (asynchronous) or at-most-once (synchronous), billed per request and duration, history in logs only | Durable Functions or plain functions | Workflows (short executions) |
| Large fan-out over items or files | **Distributed Map**: child executions (up to 10,000 in parallel), reads items from S3 | Durable Functions fan-out/fan-in | Workflows parallel steps, Cloud Run jobs for heavy items |
| Code-first, long-lived logic | Lambda durable functions (late 2025; verify availability) | Durable Functions | Google Workflows (YAML/JSON), or code on Cloud Run with Cloud Tasks |

Nest them where both shapes appear: a Standard parent for the long business process, Express children for bursts of short steps. Standard billing per state transition makes chatty item-by-item loops expensive (see the worked cost in `09`).

## How does a workflow wait for people and partners?
- **Callback with a token**: the workflow sends a token with the task (to a queue, an email approval link, a partner API) and pauses until someone returns the token with success or failure (`.waitForTaskToken` in Step Functions; external events in Durable Functions; callbacks in Google Workflows).
- **Always set a timeout and, for long tasks, a heartbeat.** A token nobody returns otherwise keeps an execution open until the engine's maximum.
- **Run a job and wait** (`.sync` pattern) for batch jobs, container tasks and child workflows.
- **Polling loops** only when the partner offers nothing else; space them with wait states and cap the attempts.

House example: veterinary clinic network, referral to a specialist hospital. The workflow books a slot, sends the referral pack, then waits up to 72 hours for the specialist's acceptance callback, with a heartbeat every 12 hours from the integration and a reminder branch at 48 hours. On timeout it offers the owner another hospital.

## How is partly finished work undone?
A saga breaks one business transaction into local steps, each with a compensating step that semantically undoes it.

| Step | Action | Compensation |
|---|---|---|
| 1 | Hold vehicle-deck space on sailing | Release the hold |
| 2 | Take payment authorisation | Void the authorisation |
| 3 | Reserve cabin | Cancel the cabin reservation |
| 4 | Issue tickets | (pivot: after this, move forward only; failures become manual cases) |

Rules:
- Compensations are idempotent and retried until they succeed or reach a human queue.
- Order compensations in reverse; record each one in the workflow history.
- Mark the **pivot step** after which the process only moves forward, and design that step to be the most reliable.
- Prefer holds and reservations with expiry over immediate final changes, so an abandoned saga cleans itself up.

## Workflow design checklist
1. Each task has an explicit timeout; long tasks have heartbeats.
2. Retries are declared per error type with backoff and jitter, capped; non-retryable business errors go straight to the failure path.
3. A catch on every task routes to a named failure state that emits an event and alerts the owner.
4. Payloads stay under the state payload limit (256 KB on AWS; verify for each engine); large data goes by reference.
5. Executions are named with a business key so duplicates fail fast (AWS, for example, rejects a second long-running execution with the same name for 90 days).
6. In-flight executions survive deployments: version or alias the state machine and let old executions finish on the old version.
7. Failed executions can be restarted from the failed step (both AWS and Durable Functions offer this) after the fix.
8. Business status events (`ReferralAccepted`, `BookingConfirmed`) leave the workflow so other services do not query its history.
9. Logic lives in tasks; the definition stays readable by the business owner. JSONata expressions are for shaping data, not for hiding business rules.

## Signals for the review
- Multi-step business process coded as functions calling functions, or a status column polled by functions → High where money, care or bookings are involved.
- Workflow waiting on a callback with no timeout → High (stuck cases, open costs).
- No compensation for a process that takes payment or holds capacity → High.
- Standard workflow running tens of transitions per item at high volume → Medium (cost); consider Express children or batching.
- Business status read by other services straight from execution history → Medium (coupling).
