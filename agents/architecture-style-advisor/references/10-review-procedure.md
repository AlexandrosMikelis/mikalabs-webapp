# Reviewing an existing architecture: steps, lenses and verdicts

Use for `review` requests: an existing or proposed architecture, a diagram described in text, an ADR set, a codebase description, or a "is this the right style for us?" question about a running system.

## Step 0 — What is really there? (do not skip)
Extract or assume: what the system does and for whom; scale (users, transactions, data, growth, peaks); the style in use (as claimed and as it really is); deployment units and how they communicate (sync/async, protocols); data stores and who owns them; teams and who owns what; release frequency and process; operations capability (monitoring, on-call, automation); main incidents or pains; regulatory context; existing ADRs or documented decisions.
If something that would change a severity is missing, state the assumption and list it under OPEN QUESTIONS. An agent caller can't answer follow-ups, so never block — assume, flag, continue.

## Step 1 — Which targets must it meet today? (`CHARACTERISTICS:`)
Infer the three `[top]` targets from its business drivers (`02`, `03`). If the caller states them, use theirs but note disagreements ("you list scalability, but the incidents describe availability during deploys"). Check whether the priorities have changed since the architecture was chosen — a common root cause of misfit.

## Step 2 — Which shape does it really have?
Name the style really in use, not the one on the slide, by placing it on the five axes of `06` (top-level split, deployables, links, data ownership, variation point) and matching the cards in `07`–`08`. Typical gaps between claim and reality:
- "Microservices" that share one database and deploy together → a distributed monolith.
- "Modular monolith" with no enforced boundaries → a role-sliced or tangled single deployable.
- "Event-driven" where every event is followed by a synchronous call back to the publisher.
- "Microkernel" where plug-ins call each other directly.

## Step 3 — Look through each lens
Consider each; report only what matters for this system.

| Lens | Core questions | Reference |
|---|---|---|
| **Style fit** | Does the style structurally support the top three? Is a distributed style justified by a characteristic and by operations maturity? Is a monolith straining under needs it cannot meet? | 06–09 |
| **Characteristics** | Are quality targets explicit, few and measurable? Are conflicts acknowledged? Are parts with different needs separated? Any characteristic nobody verifies? | 02, 03 |
| **Coupling** | Many dependants on volatile components? Long synchronous chains? Shared database across units? Cycles? Deployment coupling? Workflow knowledge concentrated where it does not belong? | 04, 06 |
| **Components** | CRUD-wrapper naming? "Common"/"shared" dumping grounds? Components with mixed responsibilities? Workflows scattered across many components? | 04 |
| **Data** | Data topology consistent with the style? Cross-boundary joins? Ownership clear? Consistency needs met (transactions vs eventual)? Reporting path? | 06, 08 |
| **Decisions** | Are key decisions recorded (ADRs) with context and consequences? Is compliance governed? Are superseded decisions tracked? | 05 |
| **Operability & evolution** | Observability across units, deployment automation, failure handling (timeouts, retries, circuit breakers), ability to evolve boundaries, team–architecture alignment (Conway) | 01, 06, 08 |

## Step 4 — How severe is each finding?
| Severity | Meaning | Typical action |
|---|---|---|
| **Critical** | The structure prevents a top-3 characteristic from being met, with business harm happening or imminent (outages at peaks, inability to release, data integrity at risk) | Act now; escalate; may require re-architecture of the affected part |
| **High** | A top-3 characteristic is significantly weakened, or cost/complexity is far beyond what the drivers justify; likely to hurt within the next growth step or release cycle | Fix in the next planning cycle; named owner |
| **Medium** | A real but containable risk to evolution, operability or cost; affects a non-top characteristic or a limited area | Plan in the roadmap; monitor |
| **Low** | Good-practice improvement (documentation, naming, minor coupling) | Optional |

Rate by impact on the top three × likelihood × breadth (how much of the system, how many teams) × cost of reversal. Severity measures consequence, not unfamiliarity: an unusual style that fits is not a finding; a fashionable style that does not fit is.

## Step 5 — Which fix, in which order?
Each fix is concrete (who changes what), proportionate and tied to a finding. Prefer, in order:
1. **Clarify** — make targets and decisions explicit (quality register, ADRs).
2. **Restructure inside the current style** — enforce module boundaries, rename and split components, remove cycles, separate data ownership.
3. **Targeted extraction or consolidation** — pull out the one part with distinct characteristics, or merge services that always change together.
4. **Change the style** of a part or the whole — only when steps 1–3 cannot meet the top three.
Add governance for each structural fix (architecture tests, fitness functions → **Chronos**). Hand off migration planning to **Theseus**, boundary redesign to **Gaia**, capacity and scaling analysis to **Atlas**, and list them under `HAND-OFFS:`.

## Step 6 — What is the verdict?
- **Keep** — style fits the top three; no High/Critical findings.
- **Keep with changes** — style fits; High or Medium findings fixable within the current style; list the conditions.
- **Evolve** — style fits for most of the system but one or more parts need a different shape (extraction, consolidation, hybrid); a planned, incremental change.
- **Re-architect** — the core style works against the top three and local fixes cannot solve it.
Confidence: High / Medium / Low, depending on how much was assumed.

## Misfits Pallas sees often
- **Distributed monolith**: services share a database, deploy together, call each other synchronously in chains. Either consolidate into capability modules in one deployable, or a few capability services, or separate data ownership and introduce asynchronous boundaries. Usually High.
- **Microservices for a small team**: operational load exceeds capacity; delivery slows. Consolidate into fewer, coarser services or a modular monolith. High when delivery or reliability is suffering.
- **Role-sliced codebase shared by many teams**: every feature cuts through every layer and several teams; the release train blocks. Regroup by capability into modules inside the same deployable first.
- **Monolith with one hot spot**: one function needs burst capacity; the whole app scales. Extract that function, queue-front it if spikes are sharp.
- **Table-shaped services**: services named after tables with CRUD APIs; business workflows span many services. Regroup around capabilities and workflows.
- **Shared "common" component**: high many dependants, frequent change, every team blocked by it. Split by purpose; move logic to owners; stabilise what remains.
- **Event-driven without workflow ownership**: no one can tell whether a business process finished; failures silent. Add an orchestrating workflow for critical processes, correlation IDs, dead-letter handling with owners.
- **Synchronous chains across many services**: latency and availability multiply. Collapse, cache, or make non-essential steps asynchronous; add timeouts and circuit breakers.
- **Microkernel with plug-in-to-plug-in calls**: variants coupled; core contract bypassed. Route through the core; version the contract.
- **Space-based chosen for moderate, steady load**: complexity without benefit. Simplify to service-based or a well-tuned monolith.
- **No recorded decisions**: the same debates repeat; newcomers undo past choices unknowingly. Start an ADR log with the five most consequential existing decisions.
- **Characteristics never verified**: "highly available" with no measure or test. Define measures and add fitness functions (→ Chronos).
- **Central integration bus as change gate**: every change needs the integration team. Move to capability-owned integration with shared standards.
- **Cross-module joins in a "modular" monolith**: hidden coupling blocks future extraction. Give each module its own schema; access other modules' data via their interfaces.

## Severity calibration examples (house)
| Situation | Rating | Why |
|---|---|---|
| Ferry ticket sales and the back office share one process; last summer's release day took sales down for 40 minutes | Critical | top-3 availability failing, with harm already happening |
| Clinic network: eight "microservices" share one schema and release together; two teams | High | cost of distribution without its benefits; slows every release |
| Energy co-op: tariff rules hard-coded as conditionals in billing; 14 schemes, two more next year | High if configurability is top-3; Medium otherwise | depends on today's priorities, not on the code smell |
| A "Utils" module with 30 dependants that changes monthly | Medium | containable; blocks teams but not a top-3 target yet |
| ADRs exist but omit rejected options | Low | hygiene; no current harm |

## How should a finding read?
- Title: the problem in a few words ("Shared ticket database couples five services").
- Issue: what breaks or costs, for whom, tied to a top-3 target.
- Basis: the working principle (P1–P7 in `01`), style trait or public practice (e.g., "data ownership is a precondition for independent deployment", "P1 — the extra services cost operational capacity the team lacks").
- Fix: the concrete change and the owner role.
Order by severity; keep each finding to a few lines; put depth in the fix.
