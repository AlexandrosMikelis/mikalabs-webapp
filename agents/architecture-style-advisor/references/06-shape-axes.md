# Shape axes: how Pallas classifies any system

Use before comparing candidates (`design`) and when naming the shape a running system really has (`review` step 2). Pallas describes every shape on five axes, then compares candidates using the cards in `07` and `08`.

## Style, pattern or design pattern?
Three levels that people often mix up:

| Level | Scope | Examples |
|---|---|---|
| **Style** | the macro-structure of a whole system or autonomy unit | modular monolith, layered, pipeline, microkernel, service-based, microservices, event-driven, space-based |
| **Pattern** | a reusable structural element used inside many styles | CQRS, saga, outbox, API gateway, backend-for-frontend, sidecar, strangler fig, circuit breaker |
| **Design pattern** | a code-level solution | strategy, observer, adapter, builder |

They nest: a design pattern can implement a pattern, which sits inside a style. "Our architecture is CQRS" names a pattern; ask what the macro-structure is. Naming the style matters because it comes with known strengths and weaknesses that everyone can reason about.

## The five axes
| Axis | Options | Question |
|---|---|---|
| **A1 Top-level split** | by technical role · by business capability · mixed | When the business asks for a change, how many top-level parts move? |
| **A2 Deployables** | one · a few (≈4–12) · many | How many things are released and run separately? |
| **A3 Links** | in-process · synchronous network · asynchronous messages/events · mixed | How do parts talk, and who waits for whom? |
| **A4 Data ownership** | one shared store · store per business area · store per deployable | Who may write which data, and through what? |
| **A5 Variation point** | none · plug-ins · configuration · per-deployable | Where does customer-, region- or rule-specific behaviour live? |

Every card in `07`–`08` states its position on all five, so candidates can be compared on the same terms.

## A1 — Split by technical role, or by business capability?
**Split by technical role** — top-level parts are presentation, application logic, persistence, integration. Each holds a slice of every business capability.
- Helps: clear separation of technical concerns; specialist teams (front end, back end, database) stay in their area; familiar; cheap to start.
- Hurts: one business change ("add a loyalty discount to ferry fares") touches every part and often several teams; capabilities are invisible in the code; carving one out later is expensive.

**Split by business capability** — top-level parts are capabilities such as booking, clinical records, billing. Each holds its own entry points, logic and data access.
- Helps: business changes stay local; fits cross-functional teams; maps cleanly to later extraction; the code reads like the business.
- Hurts: some technical code is repeated; it needs a decent grasp of business boundaries (depth → **Gaia**); shared technical concerns need deliberate homes.

**Decision rule (MIKA):** count the expected changes from block C of the elicitation script (`03`). If more than about two-thirds are technical (swap a UI framework, change database engine) *and* teams are organised by skill, a technical-role split is defensible. Otherwise prefer a capability split. Then run the Conway check (P6 in `01`): the split should match how teams are, or are about to be, organised.

Where styles sit: layered splits by technical role; modular monolith, service-based and microservices split by capability; microkernel is mixed (core often technical, plug-ins often by capability); event-driven and space-based usually cluster around business reactions or hot paths.

## A2 — One deployable or several?
**One deployable** (possibly many identical instances behind a load balancer). Styles: modular monolith, layered, microkernel, pipeline.

| Buys | Costs |
|---|---|
| one build, one release, one runtime to watch | whole application scales together, even if one function is hot |
| fast in-process calls; local ACID transactions | one runaway process can stop everything; restarts take longer as it grows |
| simple debugging and end-to-end tests | release risk and test time grow with size |
| quickest route to a first version; suits small teams and tight budgets | without enforced boundaries it decays into a tangle |
| | one technology stack for all parts |

**Several deployables over a network.** Styles: service-based, event-driven, space-based, microservices; older bus-centred SOA.

| Buys | Costs |
|---|---|
| scale and size each part to its own load | network latency, partial failure, serialisation |
| one part failing need not stop the rest (if designed for it) | transactions across parts need sagas, compensation, or acceptance of eventual consistency |
| smaller release and test scope per change; many teams in parallel | many deployables, discovery, cross-service observability, versioned contracts, service-to-service security |
| technology choice per part (use sparingly) | higher infrastructure and staff cost; heavy automation needed before it pays off |
| | end-to-end testing and debugging get much harder |

### The network is not your friend
The **fallacies of distributed computing**, attributed to L. Peter Deutsch and colleagues at Sun Microsystems in the 1990s, list assumptions that fail in practice. Pallas's working summary, with the defect each produces:

| False assumption | Defect it causes |
|---|---|
| the network is reliable | no timeouts, retries or idempotency |
| latency is zero | chatty interfaces; long synchronous chains |
| bandwidth is infinite | oversized payloads |
| the network is secure | unauthenticated internal traffic |
| topology does not change | hard-coded addresses |
| there is one administrator | nobody owns shared infrastructure |
| transport cost is zero | ignored egress and serialisation cost |
| the network is homogeneous | protocol and version mismatches |

Also check: request tracing across parts (correlation IDs, central collection); contract versioning and backward compatibility; and a named owner for every piece of data.

## A3 — Who waits for whom?
- **Synchronous** request/response: easy to reason about and gives an immediate answer, but ties the caller's latency and availability to the callee's.
- **Asynchronous** messages or events: decouples timing, absorbs bursts, lets users get a fast acknowledgement; costs are harder error handling, eventual consistency, ordering, idempotency and tracing.
- **Fire-and-forget** suits notifications and work that may finish later; **request/reply over messaging** suits work that needs an answer but can tolerate delay.

Rule: go async where the caller does not need the answer to continue; stay sync where the user or the next step needs it now. Most healthy systems mix both.

## A4 — Who owns which data?
| Option | Description | Suits | Watch for |
|---|---|---|---|
| **One shared store** | all parts read and write one database | single deployables; service-based at modest scale; reporting-heavy systems | schema changes ripple everywhere; one store limits scale and availability; hidden data coupling |
| **Store per business area** | one database or schema per capability, shared only by the parts inside that area | service-based; event-driven; modular monolith with a schema per module | cross-area joins disappear; cross-area data goes through interfaces or events |
| **Store per deployable** | each service owns its data exclusively; others use its interface | microservices; strong autonomy and independent scaling | duplication, eventual consistency, a separate reporting path (CQRS read model, analytics store), more operations |

Notes:
- Separate schemas with enforced ownership inside one physical database is a valid intermediate step.
- SQL joins across ownership lines are coupling in disguise; forbid them across module schemas if modules might become services.
- Once data is spread out, reporting and analytics need their own path.

## A5 — Where does variation live?
- **None**: one behaviour for everyone; simplest.
- **Plug-ins**: variation isolated behind a contract on a stable core (microkernel, `07`).
- **Configuration / rules as data**: analysts change behaviour without releases; behaviour becomes harder to test and reason about.
- **Per deployable**: each variant is its own service; maximum independence, maximum duplication.
Choose by who must own the change (developers or analysts), how many variants exist and how often they change.

## Combining styles
Real systems often mix. Legitimate combinations:
- microservices that talk mainly through events;
- a space-based hot path inside an otherwise service-based system;
- a microkernel whose plug-ins run remotely and talk by events or calls;
- a modular monolith with one or two extracted services for parts with a distinct quality profile (an elastic meter-reading intake);
- technical layering *inside* each capability module or service, which is normal.

Rules: understand each style's weak spots before mixing; justify each extra style by a target the base style cannot meet; keep the number of styles small; record the combination in an ADR with the reason for each part.

## Moving between shapes
Common, incremental paths: role-sliced single deployable → capability modules inside one deployable (enforce boundaries, split schemas) → a few capability services (keep shared data where it is still needed) → finer services or event-driven parts where targets demand it. Each move should be triggered by a measured need, not fashion. Migration techniques (strangler fig, branch by abstraction, data migration) → **Theseus**.
