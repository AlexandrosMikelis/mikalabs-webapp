# Profiling: where should modelling effort and money go?

Not every part of a business deserves the same care. Before drawing boundaries, Gaia splits the business into areas of activity (subdomains) and gives each an **investment profile**: how much it sets the business apart, how mature the market solution is, how intricate and how changeable its rules are. The profile decides the label (core when it sets the business apart; generic when it is a commodity; supporting in between), the sourcing advice and, together with `07`, how the area is built.

Grounding: the *core domain* idea and Evans' split between it, commodity areas and the areas in between, as set out in the *DDD Reference* (CC-BY 4.0); DDD-Crew *Core Domain Charts* (how far an area sets the business apart, plotted against model complexity; CC BY-SA 4.0); Wardley Mapping's evolution axis (genesis → custom-built → product → commodity, CC BY-SA). The four-score profile and its decision rules are MIKA's.

## How are business areas found?
A business area (Evans: subdomain) is a cluster of related activities that share actors, data and rules. Such areas exist in the business whether or not software reflects them; Gaia discovers them rather than designs them.

1. **First cut by capability.** List what the business does as verb–noun pairs ("allocate deck space", "file passenger manifest"). Org charts give a rough start, but one department usually holds several areas with different profiles.
2. **Split while profiles differ.** If one part of a capability scores very differently from the rest, split it. A clinic's "front desk" splits into appointment scheduling, reminders and payment taking.
3. **Stop at coherence.** Stop when the activities in an area change together and share actors, data and rules.
4. **Cut the differentiators finer.** Fine boundaries pay off where the business competes; coarse ones are fine elsewhere because they are cheap to change.
5. **Follow the words.** Where a term changes meaning, an edge is near (`03`).

## The MIKA investment profile
Score each business area on four axes, 0–3. Use evidence from the fact sheet (`01`), not opinion.

| Axis | 0 | 1 | 2 | 3 |
|---|---|---|---|---|
| **D — Differentiation**: would customers choose or leave us because of how well this works? | Invisible to customers | Hygiene: noticed only when broken | Noticeable advantage | A main reason customers choose us |
| **E — Market evolution** (Wardley stage of the capability) | Commodity / utility | Product you can buy | Custom-built, few products fit | Genesis: nobody does it this way yet |
| **C — Rule intricacy**: how many interacting rules and decisions? | Store and show | A few validations | Several rules interacting | Dense, judgement-heavy policy |
| **V — Volatility**: how often do the rules change? | Rarely (years) | Yearly | Quarterly | Monthly or faster |

### Decision rules
Apply in order; the first rule that matches wins.
1. **Generic** if D ≤ 1 **and** E ≤ 1. A product or commodity exists and customers do not care how it is done. High C does not change this: tax engines are intricate and still generic.
2. **Core** if D ≥ 2 **and** (E ≥ 2 **or** V ≥ 2). It sets the business apart and either the market has no good answer or the rules keep moving.
3. **Core by use, generic by build** if D ≥ 2 **and** E ≤ 1 **and** V ≤ 1. You compete on *how you use* a commodity (a ferry operator's weather-routing advantage built on a bought forecasting feed). Buy the engine; own the decision logic around it as a small core part.
4. In every remaining case the label is **supporting**: needed, specific to this business, not a reason to choose it, and no product fits well.

Sanity checks:
- **Too many cores.** If more than two or three areas per line of business come out core, re-score D with someone from sales or customer service. Few businesses truly compete on many fronts at once.
- **Complexity is not differentiation.** A high C with low D is a warning to buy or simplify, not a reason to build.
- **Software may not be the edge.** If the advantage is a relationship or craft, ask whether better software would widen it. If not, the software area is supporting.

### Worked example: community energy co-op
| Business area | D | E | C | V | Profile | Sourcing |
|---|---|---|---|---|---|---|
| Local surplus matching (who gets which neighbour's solar each half-hour) | 3 | 3 | 3 | 2 | Core | Build in house |
| Members' tariff setting | 2 | 2 | 2 | 2 | Core | Build |
| Share register and voting | 1 | 2 | 1 | 0 | Supporting | Build simply or low-code |
| Grid-operator settlement reports | 1 | 2 | 2 | 1 | Supporting | Build; formats are regulated |
| Smart-meter data collection | 0 | 1 | 1 | 0 | Generic | Buy the meter-data platform |
| Invoicing and VAT | 1 | 0 | 2 | 1 | Generic | Partner supplier or billing SaaS |
| Identity and sign-in | 0 | 0 | 1 | 0 | Generic | Adopt an identity provider |

Reading: matching is plainly core. Tariff setting scores just over the line; the open question "Is the tariff set by board vote or by formula?" could drop V and C to 1, making it supporting with board-entered parameters.

### Worked example: veterinary clinic network
- Triage and treatment planning with cost-estimate consent: D 3, E 2, C 3, V 2 → **core**.
- Appointment scheduling across clinics with vet skill matching: D 2, E 1, C 2, V 1 → rule 3, **core by use**: buy a scheduling product, own the skill-matching rules.
- Drug stock and controlled-substance register: D 1, E 2, C 2, V 1 → **supporting** (regulated, specific).
- Card payments, SMS reminders, accounting ledger: **generic**.

## What sourcing follows from the profile?
| Profile | Default | Watch for |
|---|---|---|
| Core | Build with the strongest people; keep the learning loop in house | Outsourcing the build severs the link between experts and code |
| Core by use | Buy the engine; own the decision layer around it | Vendor configuration quietly absorbing the decision logic |
| Supporting areas | Build simply, low-code, or outsource with portable data | It may become core later; keep data exportable |
| Generic | Buy SaaS or adopt open source | Protect your own vocabulary with a translation layer (`06`) |

When a generic product is "almost right" and the team wants to build its own, ask: is the gap something customers would pay for? If yes, re-score D; if no, change the process to fit the product.

## What makes a profile move?
A profile is a snapshot. Re-score when one of these happens:
| Event | Axis that moves | Typical consequence |
|---|---|---|
| A vendor launches a product that does it well | E drops | Likely relabel as generic; migrate to the product and move the team |
| Leadership decides to compete on a commodity (in-house payments for lower fees) | D rises | The area becomes a differentiator; expect a richer model |
| Customers start praising or complaining about a back-office feature | D rises | Re-score; it may now be core, so reshape the build (`07`) |
| Rules stop changing; nobody asks for features | V drops | Lower the label; simplify and stop investing |
| Heavy customisation of a bought product | E rises (for you) | Reduce customisation or own it consciously |

Early warning that a supporting area is turning core: experts start debating it, conditionals and duplicated rules pile up, change requests multiply.

## Charting it
For workshops, plot areas on a Core Domain Chart (x: model complexity ≈ C, y: differentiation ≈ D) and annotate E and V as labels. On a Wardley map, the same areas sit along the evolution axis; areas left of "product" with high visibility to the user are candidates for core.

## What goes into the model template
One line per business area:
`<name> — <profile label> — <why, citing the scores> — <sourcing> — <build shape from 07>`
Then name the area whose profile is least certain and the question that would settle it.
