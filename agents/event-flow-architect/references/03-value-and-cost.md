# 03 · Value and cost: is publishing this event worth it?

Introducing events costs money, skills and attention. Okeanos recommends them only where the numbers, even rough ones, point that way. This file gives MIKA's ledger for scoring a candidate, a break-even rule for platform effort, and a short list of optional lenses for harder strategic questions.

## The MIKA event case ledger
Score each line 0–3. Use evidence from the intake (`01`); where you must guess, say so.

**Value lines**
| Line | Question | 0 | 3 |
|---|---|---|---|
| **V1 Cost of staleness** | What does an hour (or minute) of out-of-date information cost — money, risk, customer trust, safety? | Nothing measurable | Clear, recurring loss or risk |
| **V2 Reach** | How many distinct consumers would use the same event now or within a year? | One | Five or more, or an open audience |
| **V3 Faster action** | Will a person or system actually act sooner if it knows sooner? | No one acts faster | Action is blocked today waiting for the information |
| **V4 Rework removed** | Does it remove re-keying, reconciliation, polling or chasing? | None | Daily manual work or reconciliation runs |

**Cost lines**
| Line | Question | 0 | 3 |
|---|---|---|---|
| **C1 Producer change** | Effort to emit the event reliably from the system of record | Already emits it | Legacy core needs changes or CDC from scratch |
| **C2 Per-consumer onboarding** | Effort to connect each consumer with the intended design | Self-service | A bespoke project each time |
| **C3 Trust work** | Security, privacy and legal effort for the boundary grade | B0/B1, no personal data | B2/B3 with personal or regulated data |
| **C4 Running cost** | Platform, operations, on-call, storage | Existing platform absorbs it | New platform or 24×7 obligation |

## Decision rule
- **Value** = V1 + V2 + V3 + V4 (0–12). **Cost** = C1 + C2 + C3 + C4 (0–12).
- **Strong**: Value ≥ 7 and Value − Cost ≥ 3.
- **Moderate**: Value ≥ 5 and Value − Cost ≥ 0 — worth it once named prerequisites are met.
- **Weak**: anything else.
- **Override**: V3 = 0 makes the candidate Weak regardless of the total. Faster data that nobody acts on is cost without value.
- **Override**: C3 = 3 with readiness R5 ≤ 1 (`02`) makes the candidate at most Moderate until trust controls exist.

The `Fit` field in `assess` uses exactly these labels.

## When does a shared event platform pay for itself?
Each extra consumer of a bespoke integration costs roughly the same as the first. With a standard envelope, a published contract and self-service onboarding, extra consumers get cheap — but only after a one-off investment.

Break-even consumer count:

```
N* = P / (b − s)
P = one-off effort to standardise (envelope, contract, channel, onboarding path)
b = effort per consumer, bespoke
s = effort per consumer, standardised
```
If the expected consumer count (V2 evidence) is well above N*, invest in the standard path; if it is below, a direct integration may be the honest answer for now — designed so it can be standardised later (CloudEvents attributes from day one cost almost nothing).

Cheaper integration also tends to *increase* the number of integrations people ask for. Budget for growth in consumers, not a fixed set.

## Worked example — regional ferry operator
Today, the control room emails and texts sailing delays and cancellations to the port authority, the bus operator, the booking app team, two travel agencies and the regional tourism board. Staff retype the same notice six times; bus connections are missed when the email is read late.

| Line | Score | Evidence |
|---|---|---|
| V1 | 3 | Missed bus connections, call-centre peaks on bad-weather days |
| V2 | 3 | Six consumers today; more agencies likely |
| V3 | 3 | Bus operator can hold a departure if told 10 minutes ahead |
| V4 | 2 | Manual retyping on every disruption |
| **Value** | **11** | |
| C1 | 2 | Control-room tool stores changes but emits nothing |
| C2 | 1 | Signed webhooks with a published contract |
| C3 | 1 | Timetable data, no personal data, contracted partners (B2) |
| C4 | 1 | Small managed router; business-hours support extended to sailing hours |
| **Cost** | **5** | |

Value 11, Value − Cost = 6 → **Strong**. Break-even: bespoke 15 days per consumer, standard 2 days, standardisation 40 days → N* ≈ 3.1. Six consumers clears it comfortably.

What is *not* an event here: the annual timetable itself. It changes twice a year and is best published as a file (for example GTFS for the bus operator's journey planner).

## Optional lenses for strategic questions
The ledger answers "is this event worth publishing?" Some requests go further — what to build versus buy, where the market is heading, how parties depend on each other. Okeanos can use any of these lenses; none is required, and none replaces the ledger.

| Lens | Public origin | Use it to ask |
|---|---|---|
| **Wardley Map** | Simon Wardley, published under CC BY-SA | Which components of the integration are novel, bespoke, productised or commodity? Are we hand-building something we could rent, or renting something that differentiates us? |
| **Promise check** | Promise Theory, Mark Burgess (public papers) | What does each autonomous party promise the others, and what does each promise to accept? Is any dependency drawn without a promise behind it? |
| **Context map** | Domain-Driven Design, Eric Evans | Where do meanings change between parties, and who translates (anti-corruption layer, published language)? |
| **Wait-time trace** | Lean value-stream practice | Where does a unit of work sit waiting for information, compared with time actually spent on it? |
| **Build / buy / join** | General technology strategy | Is there an industry format, consortium or platform worth joining instead of inventing our own? |

For deep technology strategy (portfolio-level build/buy, market evolution) hand over to `technology-strategy-advisor`.

### Using a lens briefly
- *Promise check, vet network*: the lab promises "a validated result event within 2 minutes of sign-off, kept 14 days"; each clinic promises "to deduplicate and acknowledge within the day". Nothing promises the owners' app ordering across pets — so the design must not rely on it.
- *Wardley view, energy co-op*: brokers, functions and storage are commodity; the co-op's grid-balancing logic is its differentiator. Build only the logic; rent the plumbing.
