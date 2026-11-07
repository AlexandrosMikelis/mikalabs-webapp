# Step 7b: LLM agents inside governed flows, and process knowledge graphs

Use whenever AI or agent steps appear in `assess`, `design` or `review`, and when a caller asks how flow models and run history can feed a knowledge graph. This is MIKA's core territory: agentic knowledge graphs. Public anchors: the EU AI Act (Regulation (EU) 2024/1689, Article 14 on human oversight), NIST AI RMF 1.0, ISO/IEC 42001:2023, the OWASP Top 10 for LLM Applications (2025 edition), the Model Context Protocol for tool access, W3C PROV-O for provenance and OCEL 2.0 for object-centric event data. AI practice moves fast; re-check anything time-sensitive (last checked 1 Nov 2026).

## Why put agents inside a flow at all?
LLM agents handle unstructured input, open-ended reasoning and tool choice well. They handle durability, deadlines, guaranteed ordering, permissions and evidence badly. Coordination runtimes are the mirror image. Combined:
- the flow decides **when** an agent runs, with which inputs, tools, budget and deadline, and what happens next;
- the agent decides **how** to do one bounded piece of cognitive work;
- the runtime records **what** happened, for audit, evaluation and the knowledge graph.

## How much autonomy does an agent get? The Ergane autonomy scale
Pick the lowest level that delivers the value; state it per AI step in the design.

| Level | Name | What the agent may do | Typical control |
|---|---|---|---|
| A0 | Assist | Summarise or draft for a person, who acts | Person edits and sends |
| A1 | Propose | Produce a structured output (extraction, class, recommendation) the flow validates | Schema + rule checks; low confidence → person |
| A2 | Act, reversible | Call read tools and reversible write tools inside one step | Tool allow-list, budget, sample review after the fact |
| A3 | Coordinate within a scope | Choose among a fixed set of activities in an ad-hoc sub-process or case stage until a goal or limit | Scope timer, step and cost caps, exit conditions, gate before leaving the scope |
| A4 | Act, irreversible | Payments, letters to customers, contract or clinical changes | Not inside the agent: a separate automated step after a human or DMN gate |

A4 is deliberately empty: irreversible effects always sit in their own step after a gate. An agent that "runs the process" with no model at all is not recommended for core business flows: no guaranteed path, weak evidence, unsafe change.

## What goes on an AI step sheet?
| Line | Content |
|---|---|
| Purpose and output contract | e.g. "From the referral PDF extract species, breed, age, presenting signs, referring vet → JSON schema `referral_intake_v3`". Validate; on failure retry once with the validation error, then route to a person |
| Inputs | Only what the task needs; document references rather than whole case files |
| Model and prompt version | Pinned and recorded per case, like a decision version |
| Tools | Explicit allow-list with scopes (read vs write), exposed for example as MCP servers; credentials issued to the agent's own identity with least privilege; no direct database writes |
| Limits | Max tool calls or reasoning steps, token or cost budget, wall-clock timeout as a timer boundary |
| Quality signal | Confidence, self-check, rule validation, or a second-model check; the flow branches on it |
| Failure mapping | Rate limit or model outage → runtime retry; unreadable document → business deviation path; unsafe or out-of-policy output → escalation to a person |
| Idempotency | The step may re-run; any write it triggers carries an idempotency key |
| Autonomy level | A0–A3 from the scale above |

## Where must a human gate sit?
Place a work item after the AI step when:
- the effect is irreversible or visible outside (refunds, member letters, clinical instructions, account closures);
- the decision is regulated or affects people's rights (credit, insurance, employment, benefits, essential services). Article 14 of the EU AI Act requires effective human oversight for high-risk systems; the application dates for high-risk obligations have been subject to amendment proposals, so confirm the current dates and your system's classification with legal counsel. GDPR Article 22 applies to solely automated decisions with significant effects;
- confidence is below threshold or validation failed;
- the case lies outside what the step was evaluated on.

Make the gate a real review: show the output, its evidence, its confidence and what approval will trigger; offer approve / edit / reject / return with reason; record the reviewer and the edits. Edits are the best evaluation data available. Track the unchanged-approval rate: very high may justify straight-through handling with sampling; very low means the step is not ready.

Gate patterns: **draft-then-approve**; **exceptions-only review** with random sampling of automated cases; **AI as first checker** in a four-eyes rule, never counted as one of the two required people.

## Which guardrails, in which layer?
No single layer suffices. Map them to the OWASP LLM Top 10 risks they address.

| Layer | Controls | Main risks addressed |
|---|---|---|
| Input | Mask personal data not needed; treat retrieved documents and emails as data, never as instructions | Prompt injection (LLM01), sensitive information disclosure |
| Scope | Tool allow-list, read-only by default, per-case credentials, egress limits | Excessive agency |
| Output | Schema validation, business checks (refund within policy, dose plausible for species and weight), leakage filters | Improper output handling, misinformation |
| Flow | Timer boundaries, budget caps, human gates, DMN for final decisions | Unbounded consumption, unsafe autonomy |
| Organisation | Named owner per AI step, evaluation before any model or prompt change, incident process | Governance (NIST AI RMF "Govern"; ISO/IEC 42001 management system) |

Keep regulated decisions deterministic where possible: the agent extracts and recommends; a business-owned DMN table decides; both are recorded (see `05`).

## What must the audit record hold?
Per AI step run: case and step IDs; model, version and parameters; prompt template version; input references; tool calls with arguments and results; output; quality signal; guardrail outcomes; reviewer and decision; timestamps; cost. Store it with the run history or in a linked store under the same retention policy. Express it in W3C PROV-O terms so it joins the graph cleanly: the output is a `prov:Entity` that `prov:wasGeneratedBy` the step run (a `prov:Activity`), which `prov:used` the inputs and `prov:wasAssociatedWith` the agent and the reviewer (`prov:Agent`s).

## How is an AI step evaluated before and after release?
- A test set from real, anonymised cases with expected outputs, including hard and adversarial ones (injected instructions inside a referral letter, for instance).
- Accuracy per field or class, confidence calibration, cost and latency.
- Re-run on every model or prompt change before release; ship with flow versioning so running cases keep their configuration.
- In production: edit rate at gates, escalation rate, drift in input types, cost per case.

## How do flow models become a knowledge graph?
BPMN and DMN models are graphs already. Making them an explicit knowledge graph joins "how we work" with "what we run" and "what happened", and gives agents something solid to reason over.

### Core schema (labelled property graph; an RDF/OWL version maps one to one)
Design-time nodes: `Process`, `ProcessVersion`, `Step` (kind: automated, people, rule, ai, ui, device), `Event`, `Gateway`, `Decision`, `Rule`, `Role`, `Team`, `System`, `Interface`, `BusinessObject`, `Policy`, `KPI`, `Risk`, `Control`, `AgentProfile`, `Model`.
Run-time nodes: `Case`, `StepRun`, `AiStepRun`, `Review`.

Relationships: `(Process)-[:HAS_VERSION]->(ProcessVersion)`, `(ProcessVersion)-[:CONTAINS]->(Step)`, `(Step)-[:FLOWS_TO {condition}]->(Step)`, `(Step)-[:PERFORMED_BY]->(Role|System|AgentProfile)`, `(Step)-[:READS|WRITES]->(BusinessObject)`, `(Step)-[:CALLS]->(Interface)-[:EXPOSED_BY]->(System)`, `(Step)-[:USES]->(Decision)-[:HAS_RULE]->(Rule)-[:JUSTIFIED_BY]->(Policy)`, `(Control)-[:MITIGATES]->(Risk)`, `(Step)-[:IMPLEMENTS]->(Control)`, `(Process)-[:MEASURED_BY]->(KPI)`, `(Case)-[:RUNS]->(ProcessVersion)`, `(StepRun)-[:OF]->(Step)`, `(StepRun)-[:PART_OF]->(Case)`, `(AiStepRun)-[:REVIEWED_IN]->(Review)`.

### Where does the data come from?
- BPMN and DMN XML from version control or the runtime; element IDs become stable keys.
- Process landscapes from the enterprise modelling repository, linked to deployed versions.
- Run history and AI audit records; for cross-system history, OCEL 2.0 event logs keep the link between one event and several business objects (a booking, a vehicle, a refund) that flat case logs lose.
- System and interface catalogues, org and role models, risk and control registers, policy documents.

### Questions the graph answers
- **Impact**: "Which flows, decisions and agents depend on the microchip registry interface?" "What changes if the co-op's export tariff policy is amended?"
- **Traceability**: policy → rule → decision → step → case evidence.
- **Agent grounding**: an assistant asked "why is my refund delayed?" retrieves the model path and the case history from the graph (graph-based retrieval) instead of guessing.
- **Improvement**: model structure joined with run data shows bottlenecks, rework loops and variants.
- **Design reuse**: existing steps, decisions and interfaces suggested when a new flow is drafted.

### Worked query (Cypher)
```
MATCH (pol:Policy {name:'Export tariff 2027'})<-[:JUSTIFIED_BY]-(:Rule)<-[:HAS_RULE]-(d:Decision)
      <-[:USES]-(s:Step)<-[:CONTAINS]-(v:ProcessVersion)<-[:RUNS]-(c:Case {status:'open'})
RETURN v.key, s.name, d.key, count(c) AS openCases
```
"Which open cases would a tariff change touch, and at which step?"

### Practical rules
- The deployed models stay the system of record; the graph is derived and refreshed on every deployment.
- Always version: mixing step IDs from different versions without `ProcessVersion` nodes gives wrong answers.
- Apply access control and privacy to run data; aggregate where individuals could be identified.
- Start with one process family, its models, its history and its systems, and three questions the business actually asks; extend from there.
