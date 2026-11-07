# Step 4 — Options: what could we do, including doing less?

Use after diagnosis. The output is a set of two to five real options, each described concretely enough to be costed and compared in `07`. A strategy that presents one option plus two straw men has skipped this step.

## What makes an option real?
An option is real when:
- **Someone sensible could choose it.** If no one in the room would pick it, it is a straw man.
- **It addresses the diagnosis**, not just the symptoms. Check it against the structure found in `05`.
- **It is different in kind**, not just in degree. "Spend €1m" and "spend €1.2m" on the same plan are one option.
- **It can be described in practice**: what changes, for whom, by when, roughly at what cost.
- **Its downside is stated.** Every real option gives something up.

Always include one of these as a baseline:
- **Carry on**: today's plan continues. It is rarely free: put the cost of standing still on it (incidents, risk, lost revenue, growing run cost).
- **Do less**: stop or shrink something to free money and people. Often the most valuable option nobody wrote down.

## Where do options come from? The MIKA option families
Run through the families below and ask "what would an option of this kind look like here?" Most good strategies combine moves from two or three families. The families are MIKA's own grouping, drawn from common technology strategy practice.

| Family | The move | Typical questions | Example (veterinary clinic network) |
|---|---|---|---|
| **Stop** | Retire, simplify, say no | What could we switch off? What do we do that nobody values? | Retire three clinic-specific booking tools |
| **Steady** | Stabilise before changing | What must be made safe before anything else? | Fix backups and support contracts on the lab-results bridge first |
| **Source** | Change who makes or runs it | Should we make, rent, buy, co-develop or share this? (below) | Rent a cloud practice-management product |
| **Renew** | Change the platform under a capability | Rehost, re-platform, rebuild, replace? (below) | Move the custom pharmacy module to the new product's configuration |
| **Reshape** | Change teams, funding, decision rights | Who owns this? How is it funded? Who decides? | Create one clinical-systems product team funded yearly |
| **Extend** | Use technology to reach new business | New services, markets or channels? (below) | Online triage and booking for new pet owners |
| **Probe** | Buy information before committing | What is the cheapest test of the riskiest assumption? | Two-clinic pilot of the rented product for one quarter |

## Make, rent, buy, co-develop or share?
Sourcing choices are among the most consequential in technology strategy. Metis considers five sourcing modes, not two:

| Mode | What it means | Suits components that are... | Main risk |
|---|---|---|---|
| **Make** | Your own people design and run it | Differentiating, still evolving, core to how you win | Cost of keeping skills; slower than expected |
| **Rent** | Use it as a service (SaaS, cloud utility) | Commodity or product-stage, standardised | Supplier power, data portability, price rises |
| **Buy** | License a product and run or customise it | Product-stage, needs some local control | Customisation that blocks upgrades |
| **Co-develop** | Build with a partner under shared control | Important but beyond your current skills | Unclear ownership of results and IP |
| **Share** | Pool with peers (consortium, open source, sector utility) | Needed by many similar organisations, not differentiating | Slow joint decisions, dependence on the group |

Decision rules Metis applies:
1. **Place the component on a Wardley Map** (`04`). Genesis and custom-built components that differentiate → lean to Make or Co-develop. Product and commodity components → lean to Rent or Buy.
2. **Test differentiation honestly.** Would customers or members notice, and choose you, because this is better than the market? If not, it is not differentiating, however proud the team is of it.
3. **Check supplier dependence** (`03`). Two or more High ratings → require an exit route: standard data export, contract break points, a tested migration path.
4. **Count the full cost**: licences or fees, integration, customisation, training, running and the eventual exit, over at least five years.
5. **Keep the know-how that lets you judge suppliers.** Even when renting everything, keep enough skill in-house to specify, test and switch.

Example (community energy co-op): meter-data storage and validation are commodity (Rent); the member-facing tariff display is where the co-op differs from large suppliers (Make, small and simple); settlement with the network operator is a sector-wide need (Share, through the national co-op federation if one offers it).

## What to do with an ageing system?
For renewal decisions, the public migration vocabulary popularised by Gartner and later extended by AWS (often called the "Rs") gives a useful option list. Metis uses six:

| Move | Meaning | When it fits |
|---|---|---|
| **Retire** | Switch it off | Low value, or its function exists elsewhere |
| **Retain** | Keep as is, for now, with a review date | Works, low risk, not on the critical path |
| **Rehost** | Move unchanged to new infrastructure | Infrastructure is the problem; the software is fine |
| **Re-platform** | Move with modest changes (managed database, new runtime) | Some gain is available cheaply |
| **Refactor or rebuild** | Restructure or rewrite | High value, differentiating, and the current design blocks change |
| **Replace** | Move to a product or service | The capability is now commodity |

Rebuild and replace options should almost always be **incremental**: move one capability at a time behind a stable interface while the old system keeps running (the public "strangler fig" approach described by Martin Fowler). A single cut-over at the end gives no value until the end and is hard to reverse. Detailed architecture choices for the target state go to Pallas.

## Where to grow? (direction options)
When the question is growth, Igor Ansoff's public product–market grid (1957) gives four directions: sell more of today's products in today's markets (penetration), take today's products to new markets, develop new products for today's customers, or diversify into both new products and new markets. Risk rises with distance from today.

The technology question for each: what must the estate do differently? New markets often need localisation, new payment and tax handling, and new regulatory compliance. New products often need new data and faster release cycles. Diversification usually needs a separate, lighter technology base.

## Probes: buying information
When a key assumption is graded E3 or E4 (`02`) and an option depends on it, add a probe:
- **Design it to answer one question**, with a pass/fail threshold set in advance ("at least 60% of pilot-clinic bookings move online within 8 weeks").
- **Cap its cost and time.** A probe that grows into a programme is no longer a probe.
- **Decide in advance what each result means** for the main options.
- **Make it safe to fail**: limited scope, easy to undo, no customer harm.

## Combining moves into options
Present options as coherent packages, not menus. Each package should answer "what is our main bet, and what makes it safe?"

Example (regional ferry operator):
1. **Rent and integrate**: rent a ferry-booking platform with strong channel interfaces; retire the old system by end 2028; small in-house team for integration and pricing rules.
2. **Extend and wait**: extend the current vendor contract two years, add a channel-integration layer, re-decide in 2028 when the market is clearer.
3. **Make the core**: build a booking engine in-house with a partner, own pricing and loyalty fully.
4. **Do less**: drop the off-season growth target's technology work; focus on fixing peak-day reliability only.

## Option checklist
- [ ] At least two real options, plus the carry-on or do-less baseline
- [ ] Each option addresses the diagnosis, not just symptoms
- [ ] Each option names what it gives up
- [ ] Sourcing modes considered for key components, with Wardley placement
- [ ] Renewals are incremental unless there is a stated reason
- [ ] Probes added where options depend on weakly evidenced assumptions

## Output hooks
- OPTIONS → name, what it means in practice ← packages above.
- OPTIONS → against ← what each gives up.
- ROADMAP → Now ← probes and stabilising moves.
