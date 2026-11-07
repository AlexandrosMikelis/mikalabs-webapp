# Architecture decisions: ADRs, diagrams, decision types

## Why record decisions
Later readers otherwise guess why something was built a certain way, and guesses become folklore and criticism. Constraints that shaped a design (a legacy system, a regulation, a performance limit) are invisible in the result. An Architecture Decision Record (Nygard) makes the reasoning durable and reviewable.

## ADR structure
- **Title** with a number (ADR-007 …).
- **Status**: Proposed → Accepted or Rejected; later possibly Superseded by ADR-NNN (or Deprecated).
- **Context**: the problem, forces and constraints, briefly. Link to longer material rather than writing an essay.
- **Decision**: what we will do and how, stated plainly ("We will …").
- **Consequences**: trade-offs and follow-up work, positive and negative. Be honest; some are expensive.
- Often added (e.g., MADR): options considered with pros and cons, decision drivers, date, deciders.

## How records stay useful
- Draft as "Proposed" in a pull request so the people affected can comment; accept only after that discussion.
- Once accepted, a record is not edited. A later decision gets its own record that marks the old one "Superseded". Keep rejected records: they stop the same debate restarting.
- Keep them next to the code (`docs/adr/`, as adr-tools and Log4brains expect) or in one agreed shared place, and link them from the API's catalogue entry.
- Ferry operator example: "ADR-012: Use cursor pagination for the sailings API" lists offset paging and page tokens as options, chooses opaque cursors because timetables change during the day, and accepts that callers cannot jump to page N.

## When an API decision deserves an ADR
- Choosing an API style for a service or exchange (REST, gRPC, GraphQL, events).
- Choosing or extending the organisation's API standard.
- Versioning scheme and deprecation policy.
- Error format, pagination model, idempotency approach (organisation-wide choices).
- Extracting a component into a separately deployed service (moving an in-process call out of process).
- Offering several specifications for one service, or deliberately not doing so.
- Testing strategy: who writes interaction tests, and whether a broker gates releases.
- Gateway, service mesh or other API infrastructure choices.

## Answering "which should we choose?"
When an `ask` question is really a choice, Hermes answers in MIKA's three-part shape: **Default** (what to pick if nothing unusual applies), **Switch if** (the conditions that change the answer, each concrete and checkable), and **Cost of being wrong** (how hard it is to reverse). The same three parts seed the options and consequences of a decision record.

## Reviewing an ADR
- Is the context specific (consumers, traffic, scale, constraints), not generic?
- Were real alternatives considered, with reasons?
- Are consequences concrete: latency added by a network hop, a new single point of failure, multiple consumers increasing the cost of breaking changes, versioning and testing obligations?
- Does each negative consequence have a mitigation or an owner, or is it consciously accepted?
- Is it reversible? If not, is the scrutiny proportionate?

## How much scrutiny does a decision need?
Rate reversal cost: **cheap** (internal only, one team, no stored data shaped by it), **moderate** (several internal callers, a migration needed), **expensive** (outside callers, published names and IDs, data at rest). Decide cheap ones quickly in the team; record moderate ones; review expensive ones with the affected callers before release. In API work the expensive set is larger than people expect: public resource names and identifiers, the version scheme, the error format and the pagination model all harden the moment an outside caller depends on them.

## C4 diagrams for context
Use the C4 model (Brown) to communicate API architecture at the right level: **Context** (the system, its users and neighbouring systems; aligns technical and non-technical people), **Container** (separately running parts such as apps, services and databases, and how they talk), **Component** (major parts inside a container; a map to the code). Easier to read than full UML. Ask for at least a context diagram when a review lacks it; label each arrow with protocol, direction and whether the caller is external or internal.

## Socio-technical side
Conway's law: system structure mirrors the communication structure of the organisation that builds it; with APIs this shows up as layers and boundaries that copy team boundaries. When an API's shape looks odd, check whether it follows the org chart rather than the consumer's domain. Architecture is evolutionary: design APIs so they can change safely, rather than for a fixed end state.
