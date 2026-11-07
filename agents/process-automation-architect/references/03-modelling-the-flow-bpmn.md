# Step 3: modelling the flow in BPMN 2.0.2, and Ergane's text notation

Use in `design` to write the diagram and in `review` to check that a diagram means what its modellers believe. Normative reference: OMG BPMN 2.0.2 (2014), published as ISO/IEC 19510:2013. Element names below are the spec's; explanations, the pattern mapping and the text notation are MIKA's.

## How does a BPMN diagram actually run?
The spec defines execution through **tokens**. A start event creates one; an activity holds it while working; a sequence flow carries it on; a gateway copies, routes or merges tokens; an end event consumes it. An instance is finished when no tokens remain, or immediately when a terminate end event fires. Almost every runtime bug in a diagram is a token bug:

| Symptom at run time | Token cause | Repair |
|---|---|---|
| A step downstream runs twice | Parallel split later merged by an exclusive gateway | Merge with a parallel gateway |
| Instance hangs forever at a join | Exclusive split later joined by a parallel gateway | Join with an exclusive gateway, or restructure |
| Instance stuck "active" with no work | A branch without an end, or a wait with no exit | Add an end or a bounding timer |
| Unexpected data stalls a case | Exclusive gateway with no default flow | Add a default flow to a person or a safe outcome |
| Duplicate work after two flows enter one task | Implicit merge without a gateway | Make the merge explicit |

## Which events matter for executable models?
Position decides behaviour; trigger decides what is awaited or emitted.

- **Start** creates an instance; a process may have several, one per trigger (web form, partner message, schedule).
- **Intermediate catch** parks the token until the trigger arrives; **intermediate throw** emits and continues.
- **Boundary** sits on an activity and listens while that activity is active. Interrupting (solid ring) cancels the activity and leaves on the boundary path; non-interrupting (dashed ring) starts an extra token and the activity carries on.
- **End** finishes a path and may emit a result to the parent scope.

| Trigger | Ergane uses it for | Pattern (workflowpatterns.com) |
|---|---|---|
| Message | One known party sends something to one instance; needs a correlation key | WCP-23 Transient / WCP-24 Persistent Trigger |
| Timer | Deadlines, reminders, cool-off periods, scheduled starts (ISO 8601: `PT4H`, `P3D`, `R/P1D`) | — |
| Error | A business deviation thrown by an activity or sub-process and caught on its boundary | Exception patterns |
| Escalation | A notice upward to the enclosing scope, usually non-interrupting | — |
| Signal | A broadcast to every waiting instance, no correlation (e.g. "sailing cancelled for weather") | — |
| Conditional | A data condition becomes true | — |
| Compensation | Runs the undo handlers of completed activities | Saga undo (see `07`) |
| Terminate (end only) | Ends all tokens in the scope at once | WCP-43 Explicit Termination |

The **event-based gateway** waits for whichever following catch event happens first: payment, a 48-hour timer, or a cancellation message. That is WCP-16 Deferred Choice, and simple state-machine services often lack a direct equivalent.

## What do the activity types mean at run time?
| BPMN 2.0.2 element | Run-time meaning | Keep in mind |
|---|---|---|
| Service Task | The runtime invokes software, or publishes a job an external worker fetches | Needs timeout, retry, idempotency key, error mapping (see `07`) |
| User Task | Creates a work item for a person or group; completes on submit | Needs candidate group, due date, escalation (see `08`) |
| Business Rule Task | Evaluates a decision, normally DMN, writes outputs to variables | Branch on the outputs right after (see `05`) |
| Send / Receive Task | Sends or awaits one message | Equivalent to message throw/catch events |
| Script Task | Inline script run by the engine | Keep trivial; business logic belongs in tested code |
| Manual Task | Work outside any system, for documentation | Most engines pass straight through |

Markers: **loop** (WCP-21 Structured Loop); **multi-instance**, parallel or sequential, one inner instance per item with an optional completion condition such as "2 of 3 vets agree" (WCP-12 to 15, WCP-34 Static Partial Join).

Four sub-process forms:
- **Embedded sub-process**: a scope for shared boundary events (one timeout for a whole block) and for legibility.
- **Event sub-process**: starts inside a scope whenever its trigger fires, interrupting or not; use for things that can happen at any time, such as the owner cancelling a referral.
- **Call activity**: invokes a separately deployed workflow definition; fine for reuse inside one team's boundary (see `06`).
- **Transaction sub-process**: a scope with cancel and compensation semantics for a business transaction over several remote steps.

## How do gateways split and merge?
| Gateway | Split | Merge | Pattern |
|---|---|---|---|
| Exclusive (XOR) | One path whose condition holds; define a default | Passes each token on | WCP-4 / WCP-5 |
| Parallel (AND) | Every path | Waits for all incoming | WCP-2 / WCP-3 |
| Inclusive (OR) | Every path whose condition holds | Waits for the paths actually started | WCP-6 / WCP-7 |
| Event-based | First event wins | — | WCP-16 |
| Complex | Custom rule | Custom rule | Avoid unless unavoidable |

Pair splits and merges of the same kind. Label a gateway with a question, its outgoing flows with answers.

## Pools, lanes and data
- A **pool** is a participant. Message flows connect pools; sequence flows never cross a pool border. Draw partners as collapsed pools when only the exchanged messages matter.
- **Lanes** document responsibility. In executable diagrams, assignment comes from task properties; when lane and assignment disagree, the assignment wins at run time, so flag the mismatch.
- **Variables** hold case context. Keep identifiers and routing data in them; keep documents and large payloads in a store and pass references. Data objects on the canvas are documentation.

## How is a message matched to the right case?
Every message catch (start, intermediate, receive, boundary) needs a **message name** and a **correlation key**, normally a business key such as a booking reference. Decide what happens to a message that arrives before the instance is waiting for it: buffer it with a time to live, or make the sender retry. A message that matches no instance must land somewhere visible, never vanish.

## Ergane's structured-text notation
Used in `design` output so humans and agents can read, diff and convert the model. One element per line, stable IDs.

```
PROCESS sailing_disruption v1 — owner: Customer Operations — key: bookingRef
START  S0  message "BookingDisrupted" (corr: bookingRef) → T1   (a fan-out job sends one per booking on a cancelled sailing)
TASK   T1  rule     "Determine rebooking option" (DMN rebook_option) → G1
GW     G1  xor "Option?"  auto_rebook → T2 | offer_choice → T3 | refund → T5 (default)
TASK   T2  service  "Hold seat on next sailing"  → T4    [retry 3, backoff PT30S; idem: bookingRef/hold; comp: T2c "Release seat"]
TASK   T3  send     "Send choice to passenger"   → GE1
GW     GE1 event    msg "PassengerChoice" (corr: bookingRef) → G2 | timer PT12H → T2
GW     G2  xor "Choice?" rebook → T2 | refund → T5 (default)
TASK   T4  service  "Confirm new ticket"         → E_RB   [error SEAT_GONE → THROW_COMP → T3]
TASK   T5  user     "Approve refund" (group: fares-desk; due PT4H) → T6
       B1  boundary timer PT2H non-interrupting on T5 → T_ESC "Notify duty manager"
TASK   T6  service  "Issue refund"               → E_RF   [idem: bookingRef/refund]
END    E_RB  "Passenger rebooked"
END    E_RF  "Fare refunded"
EVSUB  ES1  message "BookingWithdrawn" (corr: bookingRef) interrupting → THROW_COMP → E_WD
END    E_WD  "Booking withdrawn"
```

Rules of the notation:
- Kinds: `START`, `TASK service|user|rule|send|receive|script|manual`, `SUB embedded|call|transaction`, `GW xor|and|or|event`, `CATCH` / `THROW`, boundary lines indented under their activity, `EVSUB`, `END`.
- Durations and cycles in ISO 8601.
- Square brackets for execution properties: retries, idempotency key, compensation handler, error codes, timeout.
- Every XOR has a default; every message has a correlation key; every end has a business name.
- With `FORMAT: structured`, emit the same content as JSON (`steps` with `id`, `type`, `name`, `performer`, `next`).

## Which execution properties must be written down per element?
- Automated step: implementation (endpoint, job type, topic), input/output mapping, timeout, retry and back-off, idempotency key, error codes mapped to BPMN errors.
- Work item: candidate groups, assignment rule, form reference, due and follow-up dates, escalation.
- Timer: business calendar or not (working days, public holidays, ferry season timetable).
- Message: name, correlation key, buffering and TTL.
- Call activity: called definition, version binding (latest, deployment, fixed version), variable passing.
