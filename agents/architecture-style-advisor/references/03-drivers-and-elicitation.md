# Intake: drivers, constraints and the elicitation script

Use first in `design`, before any shape is discussed, and in `review` to rebuild what the system was meant to achieve. Most structural misfits start here: a shape was chosen before anyone asked what the business needed.

## What does Pallas need to collect before choosing anything?
| Input | Answers | Comes from |
|---|---|---|
| **Drivers** | *Why* does this system exist, and what pressure is it under? | strategy, product, sales, operations, finance |
| **Quality targets** | *How well* must it work, measured how? (see `02`) | translated from drivers and from explicit requirements |
| **Constraints** | *Within which limits* must the solution fit? | budget, deadline, team, skills, platform, regulation, existing systems, contracts |

A design that hits every quality target but breaks a constraint (five developers running forty services; regulated data in an unapproved region) is not viable. Pallas treats constraints as hard filters in `09`, not as weights.

## The characteristic elicitation script
A MIKA interview script. With a person, ask the questions in order and listen for the cues. With an agent caller, answer each question from the material provided and mark every inferred answer as an assumption. Each block ends with what Pallas writes down.

**Block A — Purpose and pressure (5 minutes)**
1. "What does this system let someone do that they could not do before?" → purpose, primary users.
2. "What would make this project a failure in a year, even if it shipped?" → the strongest driver; failure stories reveal stakes better than wish lists.
3. "What is changing in the business in the next two years?" → growth, mergers, new markets, regulation.
*Write:* 2–5 drivers as "outcome → pressure".

**Block B — Runtime (10 minutes)**
4. "Describe your busiest hour. What happens, how many people or devices, and how fast does it arrive?" → peak shape: steady growth or a sudden burst.
5. "What happened during the worst outage you remember, and what did it cost?" → real availability and recoverability stakes.
6. "Which is worse: being down for an hour, or losing an hour of data?" → availability vs durability.
7. "Where do users complain about slowness, and is it waiting or uncertainty?" → latency, or perceived responsiveness that async feedback could solve.
*Write:* candidate runtime targets with numbers.

**Block C — Change (10 minutes)**
8. "How often do you need to release, and what stops you today?" → deployability, testability, modularity.
9. "Which kinds of change do you expect most: new products, new rules per customer or region, new integrations, new channels?" → configurability, extensibility, interoperability.
10. "How many teams will work on this, and how are they split?" → Conway check; candidate partitioning.
*Write:* candidate change targets; team structure.

**Block D — Trust (5 minutes)**
11. "Who audits you, and what must you be able to prove?" → auditability, retention, residency.
12. "What data here would hurt someone if it leaked or was altered?" → confidentiality, integrity, privacy.
13. "Could a failure here harm a person or the environment?" → safety (ferries, energy, clinical records).
*Write:* trust targets; regulatory flags for specialists to confirm.

**Block E — Economy (5 minutes)**
14. "Who will run this at 3 a.m.? What on-call and automation do you have?" → operations capability, often the deciding constraint.
15. "What is the monthly run budget, and the build budget to first release?" → cost ceiling.
16. "Which technologies are mandated, banned or already licensed?" → platform constraints.
*Write:* constraints with numbers or explicit assumptions.

**Block F — Close (5 minutes)**
17. Read back the shortlist and the proposed top three. "If you could only protect three of these during a bad week, which?" → agreement on `[top]`.
18. "What would make you revisit this in a year?" → first revisit triggers.

## Translating business language into qualities
People describe outcomes, not "-ilities". Pallas translates and says that it has translated, so the caller can correct it. Working guide (MIKA's own; adjust to context):

| What is said | Likely qualities | Confirm with |
|---|---|---|
| "We have to ship faster than the competition" | deployability, testability, modularity | release frequency wanted vs today |
| "We are merging with / taking over another co-op" | interoperability, adaptability, extensibility | which systems, by when |
| "Members give up when it's slow" | latency, perceived responsiveness | which journey, what "slow" means |
| "Booking day for summer sailings breaks us" | elasticity, availability under burst | peak-to-average ratio, ramp time |
| "We can't ever be down" | availability, recoverability, durability | cost of an hour down; opening hours only? |
| "Each clinic wants it a bit different" | configurability, extensibility | rules, screens, workflow or data; how many variants |
| "The regulator checks us" | auditability, integrity, privacy, residency | which regime, retention, location |
| "Small team, tight budget" | simplicity, low run cost, low operational load | ops headcount, cloud budget |
| "This has to last fifteen years" | modifiability, portability, upgradeability | expected rate of change, refresh plan |
| "Partners will build on our platform" | extensibility, interoperability, contract stability | public API, plug-ins, partner SLAs |

Common mistranslations: hearing "scalability" when the driver is a burst (elasticity); hearing "performance" when users need reassurance that an asynchronous acknowledgement could give; hearing "availability" when the real fear is losing data (durability, recoverability).

## Mining written requirements
User stories and use cases also carry quality signals. Scan for:
- numbers: users, transactions, data volumes, response times;
- absolutes: "instant", "always", "every clinic", "real time", "never lose";
- variation: "different tariffs per region" → configurability or a plug-in shape;
- integration: "must exchange data with the port authority" → interoperability;
- long-running or human steps → asynchronous processing, recoverability.

## Constraints checklist
Gather or assume each; label assumptions.
- **Team**: developers, number of teams, distributed-systems experience, on-call capability.
- **Time**: first-release date; tolerance for re-architecture later.
- **Money**: build budget, run-cost ceiling, licences.
- **Platform**: mandated cloud, on-premises, edge, mobile; approved technologies.
- **Existing estate**: systems that stay, data that cannot move, integration contracts.
- **Regulation**: residency, retention, sector rules (health, transport, energy, finance). Flags for compliance to confirm.
- **Organisation**: how teams are split. Under Conway's law a shape that cuts across team lines creates friction; deliberately reshaping teams to get a desired structure is often called the inverse Conway manoeuvre.

## Other public elicitation techniques
- **Quality Attribute Workshop (QAW)** — an SEI method: stakeholders brainstorm scenarios, then consolidate and prioritise them.
- **Utility tree** (part of ATAM, SEI) — qualities refined into scenarios, each rated for business importance and technical difficulty. Use the sketch below.
- **Incident review** — past outages and near-misses reveal real targets.
- **Event storming** (Alberto Brandolini) — surfaces workflows and boundaries; useful input to the component map in `04`. Domain boundary depth → **Gaia**.
- **Pre-mortem** — "it is a year from now and this failed; why?" surfaces hidden stakes.

### Utility tree sketch (output format)
```
Utility
├─ Elasticity
│   └─ (H,H) 20× sales traffic within 60 s when summer sailings open; no double-sold car deck space
├─ Availability
│   └─ (H,M) ticket sales 99.95% monthly; failover < 1 min
├─ Modifiability
│   └─ (M,L) fare-rule change live same day without full regression
└─ Security
    └─ (H,M) card data never stored; tokenised by the payment provider
```
(First letter = business importance, second = technical difficulty.)

## From raw list to shortlist
1. Merge duplicates; split umbrella words (`02`).
2. Score Stakes and Structural pull; keep five to seven.
3. Agree the top three; for agent callers, infer from the strongest drivers and mark it as an assumption.
4. Name conflicts inside the top three and the proposed trade-off.
5. Test targets against constraints. "Elasticity [top]" with "one on-premises server" is a conflict to settle before any style is compared.

## Pitfalls
- **Speculative scale**: "we might have a million users" promoted to the top three. Prefer a shape that can evolve and an ADR trigger ("revisit when daily users pass X").
- **Ignored known peaks**: a regulatory deadline or seasonal rush left out because nobody wrote it down.
- **Technology-first reasoning**: targets reverse-engineered to justify a tool someone wants.
- **Invisible operations**: assuming unlimited on-call capacity. A distributed shape without operational maturity is a liability.
- **Everyone's favourite in the top three**: negotiate and record what lost.

## Checklist for `DRIVERS`, `CHARACTERISTICS`, `CONSTRAINTS`
- Every driver is a business outcome with the qualities it implies.
- Every quality has a measure and a source (driver or requirement).
- Constraints are explicit, including team size and operations capability.
- Assumptions are labelled; unknowns that would change the style choice are open questions.
