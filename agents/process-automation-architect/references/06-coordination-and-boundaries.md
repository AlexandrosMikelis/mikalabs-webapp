# Step 5: who coordinates each interaction, and where a model stops

Use in `design` for the BOUNDARIES block and in `review` to find coupling problems. Drawing domain boundaries themselves is Gaia's job; broker and streaming design is Nereus's; flows between organisations are Okeanos's. The decision table and the change-scenario count are MIKA's; the vocabulary of commands, events and sagas is common practice documented in public pattern catalogues (Azure Architecture Center: Choreography, Saga, Asynchronous Request-Reply; AWS Prescriptive Guidance: saga orchestration and choreography).

## Which model belongs to which team?
Apply three rules from domain-driven design (Evans):
- every workflow definition belongs to exactly one bounded context and one owning team;
- it uses that context's language ("sailing", "deck slot", "manifest" for the ferry operations team; "fare", "voucher", "refund" for the fares team);
- it reaches other contexts only through their published interfaces (API, command message, event), never through their tables, internal tasks or diagrams.

## What is the difference between a command and an event?
| Kind | Meaning | Who depends on whom | Naming |
|---|---|---|---|
| Message | The envelope; says nothing about intent | — | — |
| Command | "Please do X"; the sender expects it done and wants the outcome | Sender depends on receiver's capability | Imperative, in the receiver's language: `IssueRefund` |
| Event | "X happened"; the sender does not care who reacts | Receivers depend on sender's fact | Past tense, in the sender's language: `SailingCancelled` |

Either can be synchronous or asynchronous. A command can be a queued message answered later by an outcome event. Use CloudEvents 1.0 (CNCF) for a portable envelope and AsyncAPI 3.0 to document channels and payloads.

## Ergane's coordination decision table
Decide **per interaction**, never once for the whole system. Answer the seven questions for each arrow between two participants.

| # | Question | Answer pointing to orchestration (command + awaited outcome) | Answer pointing to choreography (event, no coordinator) |
|---|---|---|---|
| Q1 | Must the sender know the outcome to continue? | Yes | No |
| Q2 | If a later step fails, must this step be undone? | Yes (it is a saga step) | No |
| Q3 | Is there a deadline someone must own? | Yes, and the sender owns it | No deadline, or receiver owns it |
| Q4 | Does the business need to see this hop in the end-to-end case view? | Yes | Only in aggregate reports |
| Q5 | How many parties react? | One specific capability | Several, possibly unknown in future |
| Q6 | In the likely change scenarios, where should the change land? | In the sender's flow | In each reactor independently |
| Q7 | Do sender and receiver release on different cadences, owned by different teams? | Either; use a versioned command contract | Yes, and the reaction is optional to the sender |

**Decision rule**
1. Any "orchestration" answer to Q1, Q2 or Q3 → **command, orchestrated** by the owner of the outcome. These three are about responsibility for the result, so they override the rest.
2. Otherwise, Q5 "several" and Q1 "no" → **event, choreographed**.
3. Otherwise, tally Q4, Q6 and Q7; the majority wins, ties go to orchestration for the core path.

Record each interaction in BOUNDARIES as:
`<from> → <to>: command|event "<name>" — sync|async — outcome/timeout owner — rule Qn`

## How is the change-scenario count run?
Q6 deserves a small exercise. List three to five plausible changes and count how many teams must release together under each design.

Example (ferry operator, disruption handling):

| Change scenario | Teams releasing together: choreographed core | Teams releasing together: orchestrated core |
|---|---|---|
| Skip the refund approval for fares under €150 | Fares, Payments, Notifications | Disruption flow only |
| Add a hotel-voucher step for overnight cancellations | Fares, Hotels, Notifications | Disruption flow + new Hotels capability |
| Swap payment provider | Payments | Payments |
| Add an analytics feed of disruptions | Analytics only | Analytics only |

The design with fewer joint releases for the likely scenarios wins. Here the core disruption path is orchestrated; analytics and the passenger app subscribe to events.

## What goes wrong when the core path is choreographed?
- **Invisible flow**: the end-to-end path exists only as the sum of subscriptions. Nobody can answer "where is booking F-2291?"
- **Relay coupling**: service B reacts to A's event only to emit the event C waits for. Inserting or reordering a step means changing several subscribers in one coordinated release, which is a distributed monolith in practice.
- **Commands in disguise**: an event whose only purpose is to make one specific service act.
- **Orphaned deadlines**: no participant notices that an expected event never arrived.

## What goes wrong when orchestration is overdone?
- **Absorbing domain logic**: the coordinator knows another team's retries, data formats and internal steps. Every internal change elsewhere becomes the coordinator team's release.
- **Fine-grained remote steps**: calling pick, pack and label separately instead of one coarse capability.
- **One company-wide coordinator**: orchestration does not need a central server. Each domain can run its own runtime.

Repair for both: give each domain one coarse capability per business intent (`ReserveDeckSpace`, `IssueRefund`, `RegisterMeter`); the end-to-end flow commands those and reacts to their outcome events; side reactions stay as events.

## How should a slow capability present itself?
Expose an asynchronous contract: accept the request (HTTP 202 Accepted per RFC 9110, or a queued command), return a status reference, and later emit `…Completed` or `…Failed` with a reason. The provider handles its own waiting and retries internally, often with its own durable runtime. Callers then get one simple contract instead of polling and partner-specific error handling. This is the Asynchronous Request-Reply pattern.

## Calling another process: call activity or API?
| Situation | Use |
|---|---|
| Same team, same runtime, same release train | Call activity (shared engine and deployment are acceptable) |
| Different team or different runtime | A command message or API call with its own contract and versioning; the other side may not use a process runtime at all |
| Discussion only | A collaboration diagram with one pool per context; each pool is executed by its owner |

## How is end-to-end visibility kept with many owners?
Propagate one correlation identifier (business key) and a W3C Trace Context `traceparent` header across every hop; emit business milestone events from each owner; assemble the cross-team view in observability or process-mining tooling (see `10`), not in one central diagram.

## Shared platform, separate models
A platform team may offer engine guidance, templates, observability and work-item integration. It does not own other teams' models. Never let teams use a shared engine as a back channel (completing another team's work items or correlating into its instances); expose proper interfaces instead.
