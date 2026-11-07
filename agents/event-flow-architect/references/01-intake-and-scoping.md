# 01 · Intake and scoping

Every mode starts here. Before recommending anything, Okeanos pins down who exchanges what, across which line of responsibility, and how quickly the receiver must know. Most poor event designs trace back to an intake that skipped one of these.

## What must be known before any advice?
Collect these facts from the request, or assume them and say so:

| # | Fact | Why it matters | Typical assumption if missing |
|---|---|---|---|
| 1 | The **state changes** involved, named as past-tense facts | Events are facts; vague "data sync" hides several different needs | One state change per noun in the request |
| 2 | **Producer** of each change and the system of record it lives in | Decides who owns the event and how it is published reliably | The system that writes the record first |
| 3 | **Receivers** today and plausibly within 12 months | Reach drives the value case (`03`) | Only the receivers named |
| 4 | **Boundary grade** crossed (below) | Trust, contract and operating effort rise steeply with each grade | The highest grade the description implies |
| 5 | **Usefulness window**: how long the information stays worth acting on | Sets latency class (`04`) and retention | Minutes for operations, hours for reporting |
| 6 | **Volume and peaks** (events per second, burst pattern) | Sizing, partitioning, technology class | Low volume unless devices or meters are involved |
| 7 | **How it happens today** (file, poll, email, re-keying, point API) | Baseline for the value case | Scheduled batch |
| 8 | **Constraints**: regulation, data residency, cloud, skills, budget | Can rule options out early | None stated → flag as open question |

## How far does the integration reach? (boundary grade)
A MIKA grading used throughout the references. Higher grades multiply the work in `07`, `09` and `10`.

| Grade | Line crossed | Example (house domains) | What it adds |
|---|---|---|---|
| **B0** | Inside one team's service | Ferry booking service reacting to its own seat-hold expiry | Little beyond good code |
| **B1** | Between teams of one organisation | Veterinary clinic network: lab system → appointment system | Contracts, ownership, shared platform rules |
| **B2** | Between organisations under contract | Ferry operator → port authority and bus company | Partner identity, signed delivery, usage terms, separate operations |
| **B3** | Between organisations with no prior relationship, or into a public or regulated space | Energy co-op publishing grid-balancing signals to any registered aggregator | Self-service onboarding, published contracts, legal basis, abuse handling |

Rule: rate the design at the **highest** grade any consumer sits at. A topic read by one internal team and one partner is a B2 topic.

## Is an event the right tool at all?
Events are one integration style among several. Check the alternatives honestly before going further.

| Style | Strength | Choose it when |
|---|---|---|
| Scheduled file or batch export | Simple, cheap, easy to audit | The usefulness window is hours or days and nobody acts faster on fresher data |
| Request–response API (receiver asks) | Immediate answer, clear errors | The receiver needs a current answer at a moment it chooses, from a known party |
| Producer calls a known receiver API | Direct, easy to trace | One or two stable receivers, both sides change rarely |
| Shared database | Fast to build | Almost never across teams; never across organisations |
| Published events (producer states facts, receivers subscribe) | Adding receivers costs the producer little; receivers learn of change when it happens | Several receivers, a short usefulness window, or receivers that come and go |

Events add contracts, delivery semantics, security and operating discipline. If none of the conditions in the last row hold, recommend the simpler style and stop.

## Words used in these references
- **Producer / consumer** — the party that states a fact, and a party that receives it (CloudEvents calls the producing context the *source*).
- **Event** — an immutable record that something happened, with context: type, origin, time, subject (`07`).
- **Channel** — the addressable place events go to or come from (AsyncAPI 3 term): topic, queue, subject or webhook URL.
- **Envelope** and **data** — the context attributes, and the domain content they describe.
- **Usefulness window** — the time after which acting on the information gives little or no benefit.

## Recording the intake as a small graph
MIKA works with knowledge graphs, and intake results map naturally onto one. Capturing them this way lets later steps (and other agents) query the integration rather than re-read prose.

```
(:Party {name, boundaryGrade})-[:OPERATES]->(:System)
(:System)-[:RECORDS]->(:StateChange {name, usefulnessWindow})
(:StateChange)-[:PUBLISHED_AS]->(:EventType {type, version})
(:EventType)-[:ON]->(:Channel {address, protocol})
(:Party)-[:CONSUMES {purpose, since}]->(:EventType)
(:EventType)-[:GOVERNED_BY]->(:Contract {asyncapiRef, schemaRef, compatibility})
```
Useful queries: event types with consumers at B2 or above but no contract; channels with more than one producer; state changes with no named owner.

Never block on a gap. State the assumption in `ASSUMPTIONS` (or `CONTEXT`), carry on, and list the gap in `OPEN QUESTIONS` only if its answer would change a rating or a decision.
