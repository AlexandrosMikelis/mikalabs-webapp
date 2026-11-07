# Bounding: where does one model stop and the next begin?

A bounded context is the space inside which one model and one vocabulary apply without contradiction. Outside it, the same word may mean something else. It is the main structural choice Gaia makes: it decides which team owns which model and, usually, which code and data travel together.

Grounding: the bounded-context idea from Evans' *DDD Reference* (CC-BY 4.0); DDD-Crew *Bounded Context Canvas* (CC BY-SA 4.0); Conway's 1968 paper "How Do Committees Invent?"; Team Topologies vocabulary (stream-aligned, platform, enabling, complicated-subsystem teams); Fowler's public bliki on the *strangler fig* approach. The boundary scorecard and split/merge rules are MIKA's.

## Why not one model for everything?
Different groups see the same thing through different lenses. In a regional ferry operator:
- To **sales**, a *sailing* is a product with fares, availability and a marketing description.
- To **operations**, a *sailing* is a vessel movement with crew, deck plan, weather limits and a manifest.
- To **finance**, a *sailing* is a cost centre with fuel, port fees and revenue.

One company-wide `Sailing` class serving all three bloats, couples every team to every change and fills with flags. The alternative: several models, each consistent inside its own boundary, translated explicitly where they meet (`06`).

## What does a well-formed context have?
- **A single model with a single vocabulary.** Every term has one meaning inside it (`03`).
- **One owning team.** A team may own several contexts; a context never has two owners.
- **Its own code and data where possible.** A module or service with a private schema.
- **An explicit contract** to the outside: API, published events, files in an agreed format.
- **Internal freedom.** It changes its insides without asking anyone, as long as the contract holds.

## Business area or context: what is the difference?
A business area (subdomain) is discovered in the organisation (problem space); a context is chosen in the solution (solution space). Evans' *DDD Reference* treats them as separate ideas for this reason.

| Question | Business area | Bounded context |
|---|---|---|
| Discovered or designed? | Discovered | Designed |
| Who decides its edge? | Business strategy | Architects and teams |
| Driven by | Activities and their profile (`04`) | Model consistency and ownership |

Shapes you will meet:
- **1 : 1** — one context per business area. Clean; common for the core.
- **1 context : n areas** — several small supporting areas in one admin context owned by one team. Keep core areas out of such bundles.
- **n contexts : 1 area** — one area needs different models for different jobs (real-time deck allocation versus seasonal timetable planning).

Rule: do not let one model serve areas with very different profiles. The simpler area drags the core model towards shortcuts, or the core over-engineers the simple area.

## How big should a context be?
Size follows from consistency and ownership, not from lines of code or a target number of services.

### MIKA boundary scorecard
Score a proposed context on six signals. Each "yes" scores 1.

**Too wide** (consider splitting) — 2 or more means split:
- W1. A word has two meanings inside it.
- W2. Two or more teams change it and coordinate releases.
- W3. Parts of it change for unrelated business reasons.
- W4. Its model carries optional fields or status flags that apply only to some users.

**Too narrow** (consider merging) — 2 or more means merge:
- N1. It always changes together with a neighbour.
- N2. Most of its interactions are chatty synchronous calls to one neighbour.
- N3. It shares tables or an entity library with a neighbour.
- N4. It cannot answer any business question without that neighbour.

Tie-breakers:
1. New or poorly understood area → start wider. Splitting a well-understood model is cheaper than merging two wrong ones. This matters most for the core, whose edges move as insight grows.
2. Split where a part needs a different build shape (`07`), for example event sourcing for one area only.
3. Prefer an edge where the contract is small and stable.
4. Keep activities that change together on the same side.

### Worked example: veterinary clinic network
Proposed context *Clinic Operations* covers booking, triage, treatment, stock and invoicing.
W1 yes (*visit* = appointment vs episode). W2 yes (front-desk team and clinical team). W3 yes (stock rules change with regulation; booking with marketing). W4 yes (`surgeryNotes` empty for most bookings). Score 4 → split into Scheduling, Clinical Care, Pharmacy Stock and Billing & Claims. Re-check N-signals for Clinical Care vs Pharmacy Stock: N1 no, N2 no (one dispensing event), N3 currently yes (shared drug table). Score 1 → keep separate, remove the shared table.

### Evidence from code, pipelines and incidents
Workshops show where meaning shifts; delivery data shows where coupling actually hurts. When the caller has repository or pipeline access, look for:
| Evidence | How to get it | What it suggests |
|---|---|---|
| Files in two modules that change in the same commits again and again | Co-change analysis over version-control history (e.g. the last 6–12 months) | The two belong together, or a hidden contract between them needs to be made explicit |
| Releases that must go out together | Release notes, deployment calendars, "release train" coordination | Boundary or contract too weak (W2 or N1) |
| Cyclic dependencies between modules | Dependency-analysis tools, architecture tests (ArchUnit, dependency-cruiser) | Two models leaking into each other |
| Incidents that cross teams | Post-incident reviews | A rule enforced in two places, or nowhere |
| Lead time for changes far higher in one area | DORA delivery metrics per service or module | That area is entangled; candidate for the first boundary fix |
| Database tables written by more than one module | Schema ownership audit, query logs | Accidental co-ownership; assign one owner |
Treat this as evidence for or against a boundary, never as the boundary itself: two modules can change together because one feature touched both.

## How is a context deployed?
From least to most isolated:
1. A module in a modular monolith with enforced dependency rules and its own schema.
2. A separately deployed service on shared infrastructure.
3. A fully independent service with its own store and pipeline.

One context may run as several deployables (a write side and a query side), but one deployable should not straddle two contexts. Never share tables across contexts; integrate through contracts.

### Contexts and microservices
- A context is the **widest safe** service boundary: consistent and single-owned.
- A single aggregate (`08`) is the **narrowest plausible** one. Cutting by aggregate usually creates chatty services and distributed transactions; do it only when one unit has its own scaling, change or ownership need and a small contract.
- Aim for services that hide much behaviour behind a narrow contract. Many tiny services with wide contracts move complexity onto the network.
- Entity-named services ("Customer", "Booking", "Vessel") that every use case calls in sequence are a fragmented model with the coupling still in place.
- A full monolith-to-services plan belongs to **Theseus**; Gaia supplies the target boundaries.

## Who owns a context?
Exactly one team, always. Shared ownership produces coordination cost and a drift towards the lowest common denominator. Conway's observation applies in both directions: if boundaries and team structure disagree, one of them will bend. Team Topologies language helps here: core contexts usually belong to stream-aligned teams; a dense calculation engine may justify a complicated-subsystem team; generic capabilities often sit with a platform team.

## How are boundaries carved in an existing system?
1. Profile the business first (`04`), without looking at the code.
2. List current deployables, modules and databases; map each to the areas it serves. Draw implicit relationships (shared tables count).
3. Mark where core logic is tangled with generic code and where pain concentrates.
4. Draw **module-level** edges inside the monolith first: modules, namespaces, separate schemas.
5. Extract only the contexts that need independent change or scaling, routing traffic gradually behind a facade (strangler fig).
6. Put a translation layer between new contexts and the legacy model so old terms do not leak in.

## Describing a context on one page
The DDD-Crew Bounded Context Canvas is the usual template. Its sections: name; purpose; strategic classification (domain importance, business-model role such as revenue or compliance, evolution); domain roles (e.g. execution, analysis, gateway, specification); inbound communication (who sends which commands, queries, events); outbound communication; ubiquitous language; business decisions; assumptions; verification metrics; open questions. Fill one per context only when the caller asks; otherwise keep the BOUNDED CONTEXTS line compact.

## How should contexts be named?
After the capability or model they hold ("Sailing Allocation", "Treatment Planning", "Local Matching"). Avoid technology names ("Backend API"), single-entity names ("Customer"), and catch-alls ("Common", "Shared", "Utils", and "Core", which collides with the profile label).

## What goes into the model template
One line per context:
`<name> — <purpose> — <subdomains covered> — <owning team or role> — <key terms>`
Then flag any context whose scorecard is close to a threshold and the signal that would tip it.
