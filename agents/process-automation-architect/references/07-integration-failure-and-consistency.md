# Step 6: integrating systems, surviving failure, keeping data consistent

Use in `design` for the INTEGRATION and CONSISTENCY blocks and in `review` for reliability. Sources blended here: the Saga paper (Garcia-Molina and Salem, SIGMOD 1987), the retry and timeout models of AWS Step Functions, Temporal and BPMN job-worker engines, the IETF HTTPAPI Idempotency-Key header draft, and MIKA's call-sheet and pivot checklist.

## The one assumption Ergane always makes
**Every remote step can run twice, run halfway, or succeed while the caller sees a failure.** Retries after timeouts, expired worker locks, broker redelivery and operators re-running incidents all cause repeats. BPMN engines that hand jobs to external workers document at-least-once activation; Step Functions Express workflows run at-least-once when started asynchronously. Design accordingly, everywhere.

## What does every integration call need? The call sheet
Fill one sheet per automated step. Missing lines are review findings.

| Line | Content | Example (vet clinic: send lab order) |
|---|---|---|
| Style | sync request/response · async request + reply message · fire-and-forget | async: order to lab API, result arrives as webhook |
| Timeout | Per attempt, and overall | 10 s per call; result expected within P2D |
| Retry | Attempts, initial interval, back-off factor, cap, jitter | 5 attempts, 2 s, ×2, max 2 min, full jitter |
| Idempotency key | Business key + step | `referral-8812/lab-order` |
| Business deviations | Codes mapped to BPMN errors / `Catch` / non-retryable types | `SAMPLE_TYPE_NOT_OFFERED` → error path |
| Exhaustion | What happens after the last retry | Incident to integration on-call |
| Correlation | Key for the reply | `labOrderId` |
| Undo | Compensating action, if the step changes outside state | `CancelLabOrder` |

Reference points when filling the retry line: Step Functions `Retry` defaults to 3 attempts, 1 s interval, back-off rate 2.0, with optional `MaxDelaySeconds` and `JitterStrategy`; Temporal's default activity retry policy starts at 1 s, doubles, caps at 100 × the initial interval and retries without limit unless you set maximum attempts, and every activity needs a Start-To-Close or Schedule-To-Close timeout. Set limits deliberately; unlimited retries hide outages.

## Which call style fits?
| Style | Use when | Watch |
|---|---|---|
| Synchronous (HTTP, gRPC) | Quick reads and validations under a few seconds | A timeout does not mean failure; the call may have succeeded |
| Async request + reply | Slow work, partners, humans on the other side | Bound the wait with a timer; correlate the reply |
| Callback token | Cloud state machines waiting for an external party | Step Functions `.waitForTaskToken` with a heartbeat; external-event APIs in other code-first runtimes |
| Fire-and-forget | No answer needed (notifications) | Make sure it truly does not matter if lost; otherwise use the outbox below |
| Synchronous façade over async work | A front end wants a quick answer | Wait briefly, then return "accepted, status at …" |

## What about a reply that arrives too early?
The partner may answer before the instance reaches its wait. Either enter the wait state before the request leaves (send and await in one transactional step, or create the subscription first), or have the runtime buffer unmatched messages with a time to live. Test the race explicitly.

## How are many replies collected?
Waiting for N answers (quotes from three hauliers for a vehicle-deck charter): use a parallel multi-instance receive or a counter in variables, with a deadline and a rule for partial results ("proceed with 2 of 3 after P1D").

## Where do poison and orphan messages go?
- Messages that keep failing go to a dead-letter destination with an owner, an alert and a replay procedure.
- Messages that match no instance are logged and shown on a dashboard, not dropped.

## How is idempotency achieved?
- Send an idempotency key with every state-changing command; receivers store processed keys and return the original result on repeat. For HTTP APIs, the IETF Idempotency-Key header draft describes the convention.
- Write as "set status to X", not "add X".
- Make compensating actions idempotent too.
- For receivers you do not control, check before acting: query whether the booking or meter registration already exists.
- Keep irreversible side effects (payments, letters, physical commands) in their own steps, never mixed with retry-prone work.

## Retries, incidents and deadlines
- Technical faults: exponential back-off with jitter and a cap; longer windows for partners with maintenance windows.
- After exhaustion: an **incident**. The case stops at that step, operators see it, fix the cause and resume. Never loop forever, never swallow the error.
- Business deviations: mapped to BPMN errors or `Catch` paths (see `04`).
- Every remote wait has a named deadline owner.
- A partner that fails repeatedly gets a circuit breaker in front of it, so thousands of cases do not hammer it in lock-step; open-circuit time counts against the case deadline, not against the retry budget.

## What does a call sheet look like on a serverless stack?
For the code-first family the call sheet maps directly onto AWS primitives. Example: the ferry operator issues refunds from a Step Functions Standard workflow (up to one year per execution, exactly-once state transitions, priced per transition).

```json
"IssueRefund": {
  "Type": "Task",
  "Resource": "arn:aws:states:::lambda:invoke",
  "Parameters": { "FunctionName": "issue-refund", "Payload": { "bookingRef.$": "$.bookingRef", "idempotencyKey.$": "States.Format('{}/refund', $.bookingRef)" } },
  "TimeoutSeconds": 30,
  "Retry": [
    { "ErrorEquals": ["Lambda.TooManyRequestsException", "Lambda.ServiceException", "States.Timeout"],
      "IntervalSeconds": 2, "MaxAttempts": 5, "BackoffRate": 2.0, "MaxDelaySeconds": 120, "JitterStrategy": "FULL" }
  ],
  "Catch": [
    { "ErrorEquals": ["RefundRejected"], "Next": "NotifyFaresDesk" },
    { "ErrorEquals": ["States.ALL"], "Next": "RaiseIncident" }
  ],
  "Next": "RefundIssued"
}
```

Around it:
- **Idempotent receiver**: the Lambda function stores processed keys, for example with the Powertools for AWS Lambda idempotency utility backed by a DynamoDB table, so a retried invocation returns the first result.
- **Waiting for a partner**: `.waitForTaskToken` with `HeartbeatSeconds`; the partner adapter calls `SendTaskSuccess` or `SendTaskFailure`.
- **Queues**: SQS with a redrive policy (`maxReceiveCount`) to a dead-letter queue that has an owner and an alarm; DLQ redrive once the cause is fixed.
- **Events out**: milestone events to EventBridge (`RefundIssued`, `PassengerRebooked`) for analytics and the passenger app; EventBridge archive and replay helps rebuild downstream read models.
- **Asynchronous Lambda invocations** retry twice by default; set on-failure destinations so nothing disappears silently.
- **Fan-out**: the Distributed Map state processes every booking on a cancelled sailing as its own child execution, with a tolerated failure threshold.
- **Express workflows** (up to five minutes, at-least-once when started asynchronously) suit high-volume, short validations, never multi-day cases.

## Why is there no distributed transaction, and what replaces it?
Independent services do not share an ACID transaction, and two-phase commit across them is rarely available or wise. Accept eventual consistency and design intermediate states the business can live with: "booking received, confirmation follows"; reserve before committing; reconcile on a schedule.

### Sagas
A saga, as defined by Garcia-Molina and Salem, is a sequence of local transactions where each has a compensating transaction that semantically undoes it if a later step fails.

```
Hold deck space          ↔ Release deck space
Take deposit             ↔ Refund deposit
Book cabin               ↔ Cancel cabin
Send e-ticket            ↔ (cannot unsend: send cancellation notice)
```

MIKA's **pivot checklist**:
1. Place the hardest-to-undo step as late as possible; this is the pivot, the point of no return.
2. Before the pivot, every step has a compensation that is idempotent and copes with a half-finished original.
3. After the pivot, every step is retryable until it succeeds (no compensation needed, only persistence).
4. Compensation is a business action with its own records (a refund is a new transaction, not a rollback).
5. The saga's state is durable and visible, so operators can see where a failed saga stopped.

Orchestrated sagas (a flow drives steps and calls compensation; in BPMN via compensation events, in code-first runtimes via a compensation stack) are easier to read and change than sagas spread over services that react to each other's events. On AWS, a Step Functions workflow with a `Catch` per step that routes into a chain of undo states is the usual orchestrated form.

### Transactional outbox
When a service must change its database **and** publish a message, a crash between the two loses or invents messages (the dual-write problem). Write the message into an outbox table in the same local transaction and publish from there by polling or change data capture. An engine embedded in the service and sharing its database gives a similar guarantee for state the flow changes. CDC tooling and brokers are Nereus's area.

## Integration review questions
- Does every call sheet have a timeout, a capped retry, an idempotency key and an exhaustion rule?
- Is any business deviation being retried as if it were technical, or any technical fault drawn in the diagram?
- Is the early-reply race handled?
- Does every state-changing step before the pivot have a tested compensation?
- Is there any service that writes to its database and then publishes, without an outbox?
