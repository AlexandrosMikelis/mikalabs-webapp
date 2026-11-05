# Architecture decisions: ADRs, diagrams, decision types

## Why record decisions
Later readers otherwise guess why something was built a certain way, and guesses become folklore and criticism. Constraints that shaped a design (a legacy system, a regulation, a performance limit) are invisible in the result. An Architecture Decision Record (Nygard) makes the reasoning durable and reviewable.

## ADR structure
- **Title** with a number (ADR-007 …).
- **Status**: Proposed → Accepted or Rejected; later possibly Superseded by ADR-NNN (or Deprecated).
- **Context**: the problem, forces and constraints, briefly. Link to longer material rather than writing an essay.
- **Decision**: what we will do and how, stated plainly ("We will …").
- **Consequences**: trade-offs and follow-up work, positive and negative. Be honest; some are expensive.
- Often added (general knowledge, e.g., MADR): options considered with pros and cons, decision drivers, date, deciders.

## Practice
- Write the ADR after real discussion, so it records collective thinking, not one person's preference. Share it widely where people can comment before it is accepted.
- Reviewers ask: do I agree? Is there an alternative that wasn't considered? A missing alternative is a good reason to reject.
- Keep ADRs **immutable**: don't edit an accepted decision; supersede it with a new one. Rejected ADRs are kept too; they show why a path was not taken.
- Store them with the code (e.g., `docs/adr/`) or in an agreed shared location.

## When an API decision deserves an ADR
- Choosing an API style for a service or exchange (REST, gRPC, GraphQL, events).
- Choosing or extending the organisation's API standard.
- Versioning scheme and deprecation policy.
- Error format, pagination model, idempotency approach (organisation-wide choices).
- Extracting a component into a separately deployed service (moving an in-process call out of process).
- Offering several specifications for one service, or deliberately not doing so.
- Testing strategy and contract-testing methodology (producer vs CDC, broker).
- Gateway, service mesh or other API infrastructure choices.

## Decision guidelines ("it depends" made explicit)
A useful companion to ADRs is a decision guideline: **Decision** (the question), **Discussion points** (what it depends on), **Recommendations** (default answers and why). Use this shape when an `ask` question is really "which should we choose?", and when drafting the context and options of an ADR.

## Reviewing an ADR
- Is the context specific (consumers, traffic, scale, constraints), not generic?
- Were real alternatives considered, with reasons?
- Are consequences concrete: latency added by a network hop, a new single point of failure, multiple consumers increasing the cost of breaking changes, versioning and testing obligations?
- Does each negative consequence have a mitigation or an owner, or is it consciously accepted?
- Is it reversible? If not, is the scrutiny proportionate?

## Reversible vs irreversible decisions
Type 2 decisions are easy to reverse and should be made quickly; Type 1 decisions are hard to undo and deserve care (Bezos). Treating every decision as Type 1 slows teams down. But in API work, many decisions are effectively Type 1 once consumers depend on them: public resource names and IDs, the versioning scheme, the error format, the choice of gateway or mesh. Spend review effort there.

## C4 diagrams for context
Use the C4 model (Brown) to communicate API architecture at the right level: **Context** (the system, its users and neighbouring systems; aligns technical and non-technical people), **Container** (separately running parts such as apps, services and databases, and how they talk), **Component** (major parts inside a container; a map to the code). Easier to read than full UML. Ask for at least a context diagram when a review lacks it; label each arrow with protocol and direction (north–south vs east–west).

## Socio-technical side
Conway's law: system structure mirrors the communication structure of the organisation that builds it; with APIs this shows up as layers and boundaries that copy team boundaries. When an API's shape looks odd, check whether it follows the org chart rather than the consumer's domain (see also Team Topologies). Architecture is evolutionary: design APIs so they can change safely, rather than for a fixed end state.
