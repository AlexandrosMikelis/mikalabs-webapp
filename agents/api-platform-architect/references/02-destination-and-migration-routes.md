# Where is the system going, and by which reversible steps?

A modernisation without a written destination drifts. Before any routing or release detail, Daedalus asks for a destination statement and then plans a route of small steps, each of which leaves the system working and could be undone.

## The destination statement
Ask the caller to fill (or Daedalus fills by assumption and flags):
```
In <time frame>, <system> will be <shape> running on <platform>,
so that <business outcome> while keeping <non-negotiable qualities>.
We will know we have arrived when <measurable exit criteria>.
```
Example, community energy co-op: "In 18 months, member billing and meter ingestion will be two independently deployable services plus the existing billing core as a modular monolith, running on a managed Kubernetes service, so that new tariffs ship weekly instead of quarterly, while keeping billing accuracy at 100% and meter-reading latency under 15 minutes. Arrival: the old reading importer receives zero traffic for 30 days and is switched off."

## Choosing a shape: MIKA's team-and-cadence rule
Shape follows how many teams need to change the system independently and how often, not fashion.

| Situation | Sensible shape |
|---|---|
| One or two teams, one release rhythm | Modular monolith with enforced internal module boundaries |
| Three to six teams, a few areas that change much faster or scale very differently | Monolith core plus a handful of coarse services carved where pressure is highest |
| Many teams, each owning a business capability end to end | Many independently deployable services with clear API contracts |
| Spiky, event-triggered work with little shared state | Managed functions or jobs for those parts only |

Rules: carve a service only where a team boundary, a scaling difference or a release-cadence difference already exists. If none exists, improve modularity inside the deployable first. Business boundaries come from domain analysis (bounded contexts, EventStorming); routing infrastructure cannot repair a bad boundary.

## Which slice first? The slice score
Score each candidate capability 0–2 on five criteria; start with the highest total and break ties by lower data coupling.
| Criterion | 0 | 1 | 2 |
|---|---|---|---|
| Change pressure (commits, tickets, requested features) | rarely touched | moderate | constant |
| Data coupling to the rest | writes shared tables | reads shared tables | owns its data |
| Call coupling (synchronous calls in and out) | many | some | few |
| Business value of moving it | low | some | high |
| Rollback ease | hard | possible with effort | route switch only |
A read-heavy, well-bounded capability (clinic opening hours and vet availability, ferry timetables, tariff lookup) often scores highest and teaches the team the mechanics before anything risky moves.

## Techniques for moving behaviour (public practice)
- **Strangler fig** (martinfowler.com bliki): put a routing layer in front of the old system, build the new capability beside it, and move traffic route by route until the old part can be removed. The routing layer can be a gateway, a reverse proxy or a Kubernetes Gateway API `HTTPRoute`; the legacy backend keeps the catch-all rule until nothing is left behind it.
- **Branch by abstraction** (same bliki): introduce an abstraction inside the codebase, implement the new path behind it, switch callers over, delete the old implementation. Suits changes whose seam is inside the code, not at the network edge.
- **Parallel change, also called expand–migrate–contract** (same bliki): add the new form beside the old, migrate callers, then remove the old form. Applies to API fields, endpoints and database schemas alike.
- **Change data capture**: stream changes from the legacy database (e.g., with Debezium) so the new service builds its own store without dual writes from application code.
- **Feature flags at the seam**: the legacy code calls either the old path or the new API per user or cohort (see 03).
Pick the routing technique by where the callers are: many consumers running as separate processes → route at the network layer; one caller, seam inside the code → branch by abstraction or a flag.

### Coexistence rules while old and new both run
- Exactly one system is authoritative for each record at any time; write down which, and when that changes.
- Prefer one-way replication (legacy → new via CDC, or new → legacy via events) over dual writes. If dual writes are unavoidable, add reconciliation jobs and alert on drift.
- The routing layer only routes. Any conversion it does is a debt with an owner and a removal date (see the immortal strangler router smell in 08).
- Every step has an exit test: "route X now sends 100% to the new service; legacy handler for X deleted".

## Moving to a cloud platform: one decision per workload
Daedalus assembles the per-workload choice from three public frameworks:
- **AWS "7 Rs"** (AWS Prescriptive Guidance): seven per-workload options, used as the outcomes of the table below. Relocate was added to an earlier list of six for moving virtualised estates (e.g., VMware-based) without changes.
- **Microsoft Cloud Adoption Framework**: from it, the rule that a landing zone (network, identity, policy) is ready *before* workloads move, with governance and management running alongside adoption.
- **Google Cloud migration guidance** (assess → plan → deploy → optimise): from it, a discovery inventory up front and an explicit optimise phase after the move.

### MIKA's per-workload decision table
| Question | If yes |
|---|---|
| Does anyone still use it? (zero traffic over a full business cycle) | Retire |
| Would moving break a latency, licence or regulatory constraint, or does the return not justify the effort this year? | Retain; publish known end-of-life dates to its consumers |
| Is a commodity product (email delivery, identity, payments) good enough? | Repurchase |
| Is the deadline the driver and the workload stable? | Rehost or relocate; change later |
| Can a managed equivalent replace a self-run component with small changes (database, cache, runtime)? | Replatform, often the best first move |
| Is the platform the blocker for growth, scale or release speed, and is the product proven? | Refactor, usually as a strangler sequence after a replatform |
Record each choice and the options rejected in a decision record (see 10).

## The hybrid period: crossing boundaries on purpose
- **Price every boundary**. Example: a clinic appointments page makes 14 sequential calls to a records service. On-premises each call costs ~1 ms; across a VPN to the cloud ~12 ms. Moving only one side adds ~150 ms to every page view and egress charges on every response. Move tightly interacting services together, batch the calls, or keep them co-located until both can move.
- **Connectivity options**, simplest first: temporary routing rules from the new entry point back to the old environment → private connectivity (site-to-site VPN, dedicated interconnect, private endpoints) → a multi-cluster mesh spanning both environments when many internal routes cross and need uniform identity (see 06).
- **Cut over by route, not by big bang**: put both environments behind one routing layer (a gateway, or weighted DNS where clients respect TTLs), move one route at a time with the release techniques in 03, keep the route back open until the exit criteria hold.
- **Changed perimeters** (new networks, new identity providers, partner links) go under SECURITY REVIEW NEEDED (see 07).

## Questions every migration step must answer
1. Which workload, which R, and why not the others?
2. What latency and cost does each new boundary add, and is that inside the SLO?
3. Which routing layer serves which routes during the transition?
4. Which system is authoritative for each record, and how is drift detected?
5. How is traffic moved and moved back (see 03)? What signals gate each move (see 04)?
6. What is the exit criterion for the old component, and who switches it off?
