# Coupling and autonomy units

Whether a system stays changeable comes down mostly to one question: **when this part changes, what else has to change with it?** This file gives Chronos a precise vocabulary for that question, a scoring method, and the unit it uses to decide what can really change and ship alone: the **autonomy unit**.

## How tightly are two parts tied?
"Tight" and "loose" are too vague to act on. Chronos asks instead: *what must the two parts agree on for the system to stay correct?* The object-oriented design term for this is **connascence**: two elements are connascent when a change to one forces a change to the other. The kinds below are standard; the ladder order and scoring are MIKA's.

### Agreement ladder (MIKA)
From cheapest to most expensive to live with. Rungs 1–5 can be found by reading the code; rungs 6–9 only show up when the system runs.
| Rung | The parts must agree on… | Example | Usual way down the ladder |
|---|---|---|---|
| 1 | a **name** | calling `bookSailing()` by name | rename refactoring is mechanical |
| 2 | a **type** | both treat `vesselId` as a UUID | shared type definitions, generated clients |
| 3 | the **meaning** of a value | `status = 4` means "sailing cancelled" in two places | named constants or enums |
| 4 | an **order** of values | positional arguments; CSV column order | named fields, keyword arguments |
| 5 | an **algorithm** | client and server compute the same fare-rounding rule | one implementation behind one interface |
| 6 | an **order of execution** | `reserve()` must happen before `confirm()` | make the order explicit in one place (state machine) |
| 7 | **timing** | two timeouts tuned to each other; races | remove the timing dependency, add idempotency |
| 8 | **values that change together** | replicated capacity figures must stay consistent | one owner of the value, others subscribe |
| 9 | the **same identity** | two services must hold the same live object or record | one system of record, references by ID only |

### Scoring a coupling
Chronos multiplies three factors to rank which couplings to fix first:
- **Rung** (1–9, above).
- **Distance**: ×1 inside one module; ×2 across modules owned by the same team; ×4 across teams or deployable units; ×8 across organisations.
- **Spread**: ×1 for two elements; ×2 for up to ten; ×4 beyond ten.

A rung-3 coupling spread across twelve services owned by four teams (3 × 4 × 4 = 48) is a bigger problem than a rung-7 timing coupling inside one module (7 × 1 × 1 = 7). Fix the highest scores first; anything above ~30 that crosses a team boundary is normally at least a Medium finding.

### Decision rule
1. Keep the number of agreements low overall by splitting the system into well-encapsulated parts.
2. The agreements that remain should sit **inside** a part, not between parts; strong agreement inside a module is simply cohesion.
3. When an agreement must cross a boundary, push it down the ladder (meaning → named type; position → named field; duplicated algorithm → one shared implementation behind an interface).
4. Never let rungs 6–9 cross a team boundary without a check that detects when they break.

### Boundaries in domain terms
In Domain-Driven Design (Evans), a bounded context is the natural place for strong agreements to stop. Schemas, internal classes and internal events stay inside the context. Sharing them across contexts, through a common database schema or a shared domain library, spreads high-rung coupling across teams. That is the most common root cause behind "we cannot change this without a coordination meeting".

## What is an autonomy unit?
An **autonomy unit** is the smallest part of a system that can be built, released and run on its own and still do a useful job. Chronos measures and governs qualities per autonomy unit, because each one can have different needs: the ferry operator's ticket sales may need 99.95% availability while its crew-rostering unit is fine at 99.5%.

### The autonomy-unit test (MIKA)
Answer five questions for each candidate. All five must be "yes" for it to count as a separate unit.
| # | Question | A "no" usually means… |
|---|---|---|
| A1 | Can it be released without releasing anything else at the same time? | shared database, shared domain library, or a lockstep contract |
| A2 | Does it own every store it writes to? | several deployables share one schema, so they are **one** unit |
| A3 | Does it do one coherent job in business terms? | it is a technical layer, not a capability |
| A4 | Can it be built and started with only its own declared dependencies (libraries, broker, store, contracts)? | hidden build-time or start-up coupling |
| A5 | If a synchronously called neighbour is down, does it still do something useful? | runtime binding to that neighbour: they behave as one unit while the call lasts |

Static coupling (what a part needs to be built and started) decides A1, A2 and A4. Dynamic coupling (what it calls while running) decides A5. Elements that cannot be released without each other belong to the same unit, however many containers they run in.

### Interaction profile (MIKA)
For each important interaction between units, Chronos scores five axes, 0 (loose) to 2 (tight):
| Axis | 0 | 1 | 2 |
|---|---|---|---|
| **Waiting** | fire-and-forget event | request with async reply | synchronous call in the user's path |
| **Consistency** | eventual, tolerated by the business | eventual with a short bound | atomic across units |
| **Control** | each side reacts on its own | light coordinator | central orchestrator owning every step |
| **Failure handling** | fallback or queue | timeout and retry only | none |
| **Data reach** | only what it needs, via contract | wide payloads | reads the other's store |

Total 0–3: loose, harder to trace end to end, so invest in tracing. 4–6: deliberate middle ground. 7–10: the two units behave as one at run time; either accept that and treat them as one unit, or redesign. No profile is free: loose interactions move the cost into observability and reasoning about eventual states. Record the chosen profile per key workflow so it is a decision, not an accident.

### Governing with autonomy units
- **Count units and compare with the intended design.** Thirty services that share one schema are one unit; the independence everyone expects does not exist.
- **Set targets per unit.** Availability, latency and scale goals may differ.
- **Example checks**: "the ticketing unit makes no synchronous call to rostering"; "only the vessel-schedule unit connects to the `schedule` schema"; "a release of payments needed no same-day release of booking" (computed from deployment history).

## What does each boundary promise?
Every boundary has a contract, written (an API spec, a schema) or unwritten (a shared table, a file layout).
- **Strict contracts** (fixed schemas, exact versions) validate well but break consumers on any change; pair them with versioning and deprecation windows.
- **Tolerant contracts** (readers that ignore unknown fields, consumer-selected fields as in GraphQL) let both sides move more freely but shift validation to the consumer.
- **Consumer-driven contract tests** (Pact and similar): each consumer publishes the parts of the contract it relies on as tests; the provider runs them in its pipeline, and a breaking change fails the provider build. A contract check that keeps teams independent.
- **Detect breaking changes automatically**: OpenAPI and AsyncAPI diff tools, schema-registry compatibility modes (backward, forward, full).
- **Expose less.** Give consumers only what they need; prefer purpose-built views over sharing internal models.

## When does reuse cost more than it saves?
- Every shared component ties its consumers to its release cycle: they take each change or pin an old version.
- Reuse pays for things that change rarely and carry no business rules: logging, telemetry, authentication plumbing, platform utilities.
- Sharing fast-moving domain code between teams spreads every change; for domain code, a little duplication across bounded contexts is usually cheaper.
- Cross-cutting runtime concerns (telemetry, mTLS, retries, service discovery) can move into platform components such as sidecars or a service mesh, so domain code is not tied to a platform library's upgrade cycle. Govern with a check such as "every workload emits the required telemetry". Analytical data is better published by each domain through its own contract than read straight from operational stores.

## Reading coupling in a review
| Symptom | Likely cause | Check to add |
|---|---|---|
| Teams must release together | shared database, shared domain library, or synchronous chains | release-independence check from deployment history; data-access rules |
| A small change touches many services | rung 3–5 agreements across boundaries | contract tests; shared-type rules; change-coupling analysis (`06`) |
| Outages cascade | synchronous calls without timeouts, bulkheads or fallbacks | resilience tests in a stage; limit on synchronous call depth |
| End-to-end test suite is huge and slow | units cannot be tested alone | contract tests replacing end-to-end tests where possible |
| One schema change breaks reports | analytics reads the operational store | separate analytical store; register of schema consumers |
| "Services" that form one autonomy unit | entanglement hidden behind many deployables | unit count; owner of each store |

Hand-off note: whether a system *should* be split into more autonomy units, and which style follows, is an architecture-style decision (→ Pallas). Chronos measures and governs the coupling that exists or is intended.
