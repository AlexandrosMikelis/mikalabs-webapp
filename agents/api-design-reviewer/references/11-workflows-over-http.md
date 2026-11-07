# Multi-step workflows over HTTP

Use when an operation spans several calls or services (onboarding, checkout, provisioning, approvals), runs longer than a request, or must survive retries, partial failure and rollback. Pairs with 04 (idempotency, retries) and 02 (long-running operations).

## Make each step safe to repeat
- A workflow is only as reliable as its least repeatable step. Every state-changing step needs a defined **retry outcome**: same request, same effect.
- Prefer methods that are idempotent on the wire (PUT, DELETE). For creates, let the client mint the ID and `PUT /orders/{clientId}`; add `If-None-Match: *` so a second create of the same ID is refused with **412** rather than overwriting (04). Where POST stays, require an `Idempotency-Key`.
- Make the **operation itself** idempotent: send absolute values ("set quantity to 3", "price is 21.00") rather than relative ones ("add one", "raise by 5%"), which double-apply on retry.
- Carry two identifiers on every call: a **correlation ID** for the whole job and a **request ID** per step, so duplicates can be detected and traces stitched together (`traceparent` works for the latter role).

## Give every step the same control surface
For each task in a workflow, a service should be able to:
- **run** it;
- **re-run** it safely (idempotent repeat);
- **undo** it, or state that it can't;
- **cancel** it while still in progress.
Describe each action completely (target, method, media type, inputs), in the spec or as forms in the response (10), so an orchestrator doesn't need hidden knowledge.

## Who drives the flow
- **Orchestrated**: one coordinator calls each service in turn and holds the plan. Easier to see and change; the coordinator is a dependency to secure and scale.
- **Choreographed** (events): services react to each other's events. Looser coupling; harder to see the whole flow and to compensate.
- **Client-driven**: the client works from links and the current state toward a goal; services expose state and valid next actions. Most flexible, needs hypermedia (10).
- The flow itself can live as code, as a declarative description (e.g., a state-machine definition, BPMN, or an Arazzo document that sequences OpenAPI operations), or as a shared document passed between steps. Whatever the form, version it like an API.
- Shared state between steps should be explicit: either a job resource every step reads and updates, or a state document passed along. Don't depend on sticky sessions.

## Show progress
- Starting a long workflow returns **202 Accepted** with a `Location` (and `Retry-After`) pointing at a **job or progress resource** (02).
- The progress resource holds job-level fields (ID, status, start/finish times, links to results) and per-task entries (name, status, attempts, last error, timestamps). Use a small, documented status set, e.g., `pending`, `running`, `succeeded`, `failed`, `cancelled`, `compensated`.
- Offer polling with sensible intervals, plus a callback/webhook or event for completion; let clients cancel via the job resource (e.g., `POST /jobs/{id}/cancellation` or a state change).
- Intermediate work can be saved as a draft resource and submitted in parts, so a long form or multi-page input isn't lost on a dropped connection.

## Retries, timeouts and fallbacks
- Retry only what can succeed: network errors and most 5xx, plus 429 and 503 after `Retry-After`. Don't retry 4xx unchanged.
- Bound retries (count and total time), back off exponentially with jitter, and set a deadline per step that fits inside the overall job budget.
- For a dependency that stays down, define the fallback: a cached or degraded answer, a queued request, or a clear failure with the job left resumable.
- Hand work to a queue when steps are slow or bursty; the job resource stays the client's single view of progress.

## Undo and compensation
- **Local undo**: for a simple record change, keep the prior state with a context ID and expose an undo action, valid for a stated time window. Document what can't be undone.
- **Reversing request**: issue the opposite change (re-PUT the earlier value with `If-Match`; restore a soft-deleted record) when nothing else depended on the original.
- **Compensation** (saga): when other services already acted, run a defined compensating step for each completed task, in reverse order. Compensations must themselves be idempotent and logged on the job.
- **Escalation**: when automatic recovery fails, the job moves to a state that needs a person (`needs-attention`), with the context needed to act, rather than failing silently or retrying forever.

## Bringing in services that don't follow the rules
Wrap a legacy or third-party service behind a **proxy or adapter** that adds what the workflow needs (idempotency keys, IDs, retry handling, undo records, a progress resource) without changing the service itself. Treat the adapter as part of the contract and test it.

## Review questions
1. For each step: what happens if the request is sent twice, or the response is lost?
2. Are correlation and request IDs required and propagated?
3. Is there one place a client can see job status, cancel, and fetch results?
4. Which steps can be undone or compensated, within what window? Is the irreversible step last?
5. Are retry rules (what, how often, how long) and fallbacks stated?
6. Who owns the flow definition, and how is it versioned?
Severity: a multi-step money- or inventory-moving flow with non-repeatable steps or no compensation plan is **High** (Critical with automatic retries and real financial effect); no progress resource for work longer than a request timeout is **Medium**.
