# Errors and reliability semantics

## Error format
- Goal: a consumer can write **one piece of error-handling code** that works for every operation. That requires one error shape across the API, agreed up front and shared with every producer team.
- Standard options:
  - **RFC 9457 Problem Details** (`application/problem+json`; supersedes RFC 7807) — general knowledge. Members: `type` (URI identifying the problem type, documented), `title` (short, stable summary), `status`, `detail` (occurrence-specific, human-readable), `instance`; extension members allowed (e.g., `errors` array with field pointers, `traceId`).
  - Microsoft guidelines error object: `error` with `code`, `message`, optional `target`, `details[]` and nested `innererror` for increasingly specific codes.
  - Google AIP-193: `code`, `message`, `details` (typed error info such as `ErrorInfo` with `reason` and `domain`).
- Whatever is chosen: a **machine-readable code** consumers can branch on (stable, documented, never just free text), a human-readable message, the field(s) at fault for validation errors, and a correlation/trace ID.
- Validation errors should report **all** invalid fields at once, with a pointer to each (JSON Pointer or field path).
- The status code must match the error (see 02). An error body under a 2xx status is a **High** finding: consumers' success paths will process it as data.

## Don't leak internals
- No stack traces, SQL, internal hostnames, framework names or exception class names in external responses; they help attackers and lock you into implementation details. Detailed diagnostics (an inner error) may be useful internally but must be stripped at the edge.
- Avoid revealing whether a resource exists to a caller who may not see it (return 404 rather than 403 where existence itself is sensitive).

## Ambiguous failures and retries
- Clients and libraries retry on 5xx and timeouts. Document, per operation, **what a failure means for state**: after a 500 or timeout on "create payment", did the payment happen? If the producer can't say, the consumer can't recover safely.
- **Idempotency**:
  - GET, PUT, DELETE are idempotent by definition; keep them that way in implementation.
  - For POST (and PATCH) that create or move value (payments, orders, bookings, messages), accept an **`Idempotency-Key`** header (general knowledge; IETF draft `httpbis-idempotency-key-header`, widely used by Stripe and others): the server stores the key with the result for a retention window and returns the same result on replay; a replay with a different payload is rejected (e.g., 422 or 409).
  - Alternatively, let the client supply the resource ID (PUT to a client-chosen URI, or `requestId` field as in Google AIP-155).
  - Missing idempotency on a money-moving or externally visible create operation: **High** (Critical if retries are automatic and duplicates cause financial loss).
- Document which errors are **retryable** (429, 503, some 409s) and which are not (400, 401, 403, 404, 422). Recommend exponential backoff with jitter; honour `Retry-After`.

## Timeouts and partial failure
- Each east–west hop adds latency and a failure mode; one external call may fan out to many internal ones. Set and document timeouts; budgets should shrink down the call chain.
- Prefer graceful degradation (partial responses clearly marked) over all-or-nothing when some data is optional. Make partial results explicit; never silently drop items.

## Concurrency control (general knowledge)
- Lost updates happen when two clients read, modify and write the same resource. Use **ETags** with `If-Match` on PUT/PATCH/DELETE; respond **412 Precondition Failed** on mismatch. Optionally require preconditions (428).
- For collections of state transitions (e.g., order status), validate transitions and return 409 for invalid ones.

## Rate limits and quotas (general knowledge)
- Return **429** with `Retry-After`; publish limits and expose remaining quota (e.g., `RateLimit-*` headers per the IETF draft).
- Limits per consumer identity, not per IP only, for authenticated APIs.

## Review questions
1. Is there one error format, with stable machine-readable codes?
2. Do status codes match outcomes everywhere?
3. Could any response leak internals?
4. For each state-changing operation: what happens on retry, and what does a 5xx mean for state?
5. Are concurrent updates protected?
6. Are rate limits and retryable errors documented?
