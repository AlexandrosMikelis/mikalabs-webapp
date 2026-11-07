# Step 3b — Diagnosis, inside out: what can this organisation actually do, and what holds it back?

Use alongside `03`. The output is a picture of the organisation's capacity to act: who decides, where the money goes, what the technology estate costs and enables, which components differentiate the business, and how much change people can absorb. Most strategies fail here, not in the market analysis.

## Who decides, who can block, who has to live with it?
Map the people before the systems.

1. **List the parties**: owner or board, business heads, finance, risk and compliance, operations, IT and engineering, key suppliers, and the people whose daily work changes (ferry booking agents, clinic receptionists, co-op volunteers).
2. **Place them on a power–interest grid** (a public stakeholder tool usually credited to Aubrey Mendelow). High power and high interest: shape the strategy with them. High power, low interest: keep them briefed and avoid surprising them. Low power, high interest: involve them; they often know where the real problems are. Low on both: inform.
3. **Write each party's measure of success and main fear.** In the vet network, the finance director measures cost per consultation and fears a failed migration; senior vets measure time with animals and fear losing clinical notes.
4. **Find the real veto holders.** Formal authority and practical influence often differ (a union, a lead vet, a single engineer who knows the old system).
5. **Make decision rights explicit** for cross-cutting choices: platform standards, supplier selection, data ownership, exceptions, and retiring shared systems. A simple table with exactly one accountable person per decision is enough (RACI and RAPID are common public formats). Two accountable people, or none, is a frequent High finding.

Warning signs: no business sponsor; funding assumed from a budget nobody has agreed; the strategy written only by IT.

## Where is the business in its life, and does the technology posture match?

| Business situation | What the business needs | Technology posture that fits |
|---|---|---|
| **Finding its feet** (new venture, new market) | Learn fast, survive | Rent or use utilities for everything non-core; accept known debt; keep options cheap |
| **Scaling** | Grow volume without growing cost at the same rate | Automate, standardise, invest in shared foundations; pay down debt that blocks growth |
| **Defending** (mature market) | Protect share and margin | Simplify and consolidate; selective new bets to avoid slow decline |
| **Renewing or winding down** | Reinvent or harvest | Minimise run cost; protect new bets from old constraints; plan retirements with dates |

Units of one organisation can sit in different rows: the ferry operator's freight business may be defending while its new island-tourism packages are finding their feet. One uniform technology policy across both is a common error.

## Where does the money go?
Group technology spending by intent:
- **Run**: keeping today's systems working (licences, hosting, support, patching).
- **Improve**: making existing business better (enhancements, automation).
- **Change**: new capabilities, products or business models.
- **Protect**: security, compliance, resilience.

Compare the current split with what the stated strategy implies. A strategy that claims to transform while 85–90% goes to Run has a funding problem, not a project problem. Show it as a simple table; detailed cost models belong to finance. The usual way to fund change in a fixed budget is to **retire** systems, which frees Run spend, so retirements belong on the roadmap with dates.

Also look at **cost per unit of business** (per crossing, per consultation, per member) and its trend. A rising unit cost with flat volume points to estate sprawl or supplier pricing power.

## What does the estate cost, and what is it worth? (TIME)
For each significant application or platform, score two things on a simple 1–5 scale:
- **Business value**: how much the business depends on it and how well it supports the processes that matter.
- **Technical health**: supportability, security, cost to change, reliability, skills available.

Place each system in one of four actions. This is Gartner's public TIME model:

| | Low technical health | High technical health |
|---|---|---|
| **High business value** | **Migrate**: move the value to a healthier platform, step by step | **Invest**: extend and improve |
| **Low business value** | **Eliminate**: retire, with a date and an owner | **Tolerate**: keep running cheaply, no new investment |

MIKA additions to make TIME useful in a strategy:
- **Add the dependency count.** A low-value system that ten others call is not cheap to eliminate; note it as "eliminate after X and Y move".
- **Add the cost of standing still.** For each Migrate candidate, estimate what a year of doing nothing costs in incidents, workarounds and risk.
- **Name the owner.** A system with no business owner is effectively already in Tolerate, whatever the chart says.

Example (vet clinic network): the legacy lab-results bridge scores value 4, health 1 → Migrate; three clinic-specific booking tools score value 2, health 2 → Eliminate after consolidation; the accounting package scores 3/4 → Tolerate.

## Which parts differentiate, and which are commodity? (Wardley mapping)
Wardley Maps (Simon Wardley; published under Creative Commons CC BY-SA 4.0) place the components needed to meet a user need on two axes: how visible each component is to the user (vertical), and how evolved it is (horizontal, from *genesis* through *custom-built* and *product/rental* to *commodity/utility*).

How Metis uses a map in a strategy:
1. Anchor on a user and need ("member sees what they will pay this week").
2. List the components, from visible (tariff display) to invisible (meter-data storage, hosting).
3. Place each by market evidence: how widely available, how standardised, how well understood.
4. Mark where the organisation's treatment does not match the component's evolution: building a commodity in-house, or buying a product for something that is still novel and differentiating.
5. Note movement: components tend to move right as markets mature, and the map shows where today's custom work will become tomorrow's utility.

Main uses: sourcing choices (`06`), spotting duplicated effort, and explaining to non-technical leaders why "build everything" or "buy everything" are both wrong.

Limits: placement is judgement. Two people can disagree; the discussion is the value. Do not present a map as measurement.

## Which capabilities matter most? (capability map)
A business capability map lists what the organisation does (book a crossing, schedule a vessel, maintain a vessel, handle a complaint), independent of org chart and systems. It is a public enterprise-architecture practice (described in TOGAF and in the Business Architecture Guild's public materials).

Overlay three colours: strategic importance, current performance, and technology health. Capabilities that are important, performing badly and on poor technology are where investment should go first. Capabilities that are unimportant but expensive are where money can be freed.

## Is the portfolio balanced?
Two public portfolio views help when the question is allocation:
- **The BCG matrix** (market growth × relative share) classifies products or business lines. Technology implication: stable, cheap platforms for mature high-share lines; scalable ones for growing lines; cheap experiments for uncertain ones; retirement paths for the rest. It is crude, and market share is a poor proxy in many digital markets.
- **McKinsey's three horizons**: defend the core (H1), build emerging businesses (H2), create options for the future (H3). Judge each with measures that suit it; holding H3 bets to H1 efficiency targets kills them.

Use whichever matches how the leadership already thinks. Neither replaces the diagnosis.

## How much change can the organisation absorb?
- **Team shape**: Conway's observation (Melvin Conway, 1968) that systems tend to mirror the communication structure of the organisations that build them. A strategy that needs new system boundaries usually needs new team boundaries too.
- **Skills**: which capabilities exist in-house, which must be hired or rented, and how long that takes.
- **Concurrent change**: how many other programmes are competing for the same people and attention.
- **Track record**: how did the last two large changes go, and why?
- **Incentives and funding model**: annual project funding favours big-bang programmes; stable funding of product teams favours incremental change.

A realistic change budget, in people and attention, is often the binding constraint. Name it.

## Output hooks
- FORCES → company, technology and people lines ← spend split, TIME results, capacity limits.
- DIAGNOSIS ← mismatches found here (funding vs ambition, commodity built in-house, no owner).
- OPTIONS ← retirements and sourcing moves suggested by TIME and the map.
- RISKS ← veto holders, missing decision rights, change capacity.
