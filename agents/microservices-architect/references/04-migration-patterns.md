# Incremental migration patterns

The rule: move one slice at a time, keep the system working and shippable after every step, and keep a way back. A migration only counts once the new service handles real production traffic; code that sits unreleased in a new repository has delivered nothing and carries all the risk.

Traffic routing mechanics (reverse-proxy and gateway configuration, mesh routing, canary percentages, mirroring infrastructure) belong to Daedalus (API Platform Architect). This file decides **which** pattern, **what** moves and **in what order**; name Daedalus as the handoff when the plan depends on routing detail.

## Before you move anything
### Decide what to split first
Score each candidate service (from `03`) on two axes:
- **Value of extraction**: does it unlock a goal from `02` (contention removed, compliance scope shrunk, hot path isolated)?
- **Ease of extraction**: how cleanly can its code and data be separated? Few inbound calls into it, little shared data, a natural seam, little cross-cutting transaction logic.

Start with something **valuable enough to matter and easy enough to succeed** — ideally one that is fairly peripheral, has a clear owner, and lets the team build the platform muscles (pipeline, monitoring, on-call) without risking the core. Leave the most tangled, central capability until the organisation has done a few extractions.

### Decide how to treat the existing code
- **Copy then trim**: copy the module's code into the new service and delete what isn't needed. Fast, preserves behaviour, but carries legacy design along.
- **Reimplement**: write afresh. Only when the old logic is understood and small, or truly unfit. Risk: forgotten behaviour; mitigate with a parallel run.
- **Cut**: move code out and delete it from the monolith once the service is live. Delete promptly; dead duplicate code confuses the next person.
Refactor inside the monolith first where you can: create a seam (an interface around the capability), so extraction becomes a substitution rather than surgery.

### Decide the order of code and data
Options (detail in `05`):
- **Code first, data later**: extract behaviour; the new service temporarily reads and writes the monolith's tables through a narrow access layer. Fast early value; the data split is still pending and is the risky part. Make sure it actually happens.
- **Data first**: separate the schema inside the monolith (or move tables to a new store accessed by the monolith) before moving code. Surfaces integrity and performance problems early, without the service yet delivering value.
- **Both together**: a bigger step; avoid unless the slice is small.
Most teams choose code first. Whatever the choice, the step is not finished until the service owns its data.

## The patterns
### Strangler fig
Grow a new system around the old one and route functionality to it piece by piece until the old part can be removed. Steps:
1. Put an interception point in front of the monolith (a reverse proxy, gateway route, message router, or client-side switch).
2. Build the new capability in a service; deploy it while traffic still goes to the monolith.
3. Redirect requests for that capability to the service. Keep the monolith's version intact for rollback.
4. Once stable, delete the old code path.
Fits when the capability is reached through an inbound boundary you can intercept: HTTP calls, queued messages, file drops, a batch trigger. Works even for black-box third-party systems. Weak when the capability is deep inside the monolith and called in-process from many places — use branch by abstraction there.
Watch for: the proxy becoming a place for business logic; long-lived double running without a deadline; data the extracted capability still writes in the monolith.

### Branch by abstraction
Replace an internal component without a long-lived source branch:
1. Introduce an abstraction (interface) around the component inside the monolith, and route all callers through it.
2. Keep the existing implementation behind it.
3. Build a new implementation behind the same abstraction that calls the new service.
4. Switch between implementations with a toggle; ship continuously while doing so.
5. Remove the old implementation, and finally the abstraction if it adds no value.
Fits when the capability is called from inside the monolith. Bonus: keeping the old implementation lets the toggle act as an instant fallback if the service misbehaves.

### Parallel run
Run old and new implementations side by side on the same input, use one result (usually the old), and compare. Useful when correctness matters most and the logic is intricate: pricing, tax, eligibility, scoring.
- Compare outputs offline or asynchronously so the comparison never slows the user.
- Define what "equal" means up front (tolerances, ordering, timestamps).
- Ensure only one side causes side effects: the other must write to a sandbox or use spies/stubs for email, payments and outbound calls.
- Set an exit rule (e.g. 0 mismatches above tolerance for two weeks of production traffic).
Related techniques: dark launching (new path runs but output is hidden) and canary release (a small share of real users get the new path). Their routing mechanics → Daedalus.

### Wrapping proxy
Add new behaviour triggered by the monolith without changing the monolith. A proxy passes the request to the monolith, inspects the response, and calls a new service with what it learned. Example (invented): after the monolith confirms a gym membership renewal, the proxy notices the success response and calls a new Rewards service to award points.
Fits when you need new features next to a monolith you can't or won't modify. Weak when the information needed isn't in the request or response; then the proxy starts calling back into the monolith, which is a smell.

### Change data capture (CDC)
React to changes in the monolith's database rather than its code. Options: database triggers (avoid; hidden logic), polling a timestamp or version column, or reading the transaction log with a CDC tool (log-based CDC is the usual choice). The new service consumes the changes, typically as events.
Fits when you cannot change the monolith's code and need to start a downstream process. Risks: the database schema becomes an implicit contract; events are low-level row changes rather than business facts; an upgrade of the monolith can break consumers silently. Translate row changes into business events at one place. Event streaming platform detail → Nereus (Event Streaming Architect).

### UI composition
Migrate the user interface in slices alongside the services:
- **Page-based**: route whole pages or URL paths to a new front end owned by the service team.
- **Widget-based**: embed a new component in an existing page.
- **Micro frontends**: independently deployable front-end pieces composed in the browser or at the edge.
See `09` for ownership models and trade-offs.

### Feature toggles
Toggles underpin most of the above: they let unfinished work ship dark and allow fast switch-back. Treat each migration toggle as temporary with an owner and a removal date; old toggles become hidden complexity.

## Choosing a pattern
| Situation | First choice |
|---|---|
| Capability reached through an inbound HTTP or message boundary | Strangler fig |
| Capability called in-process from many places | Branch by abstraction |
| Logic must be proven identical before switching | Parallel run (with either of the above) |
| Need new behaviour, can't touch monolith code | Wrapping proxy or CDC |
| Need to react to data changes in an unchangeable system | CDC |
| Front-end slice must move with the service | UI composition |

## Sequencing and rollback
A good plan step lists: pattern, what code moves, how data ownership changes, how traffic is switched, the rollback trigger and mechanism, and a measurable exit criterion.

- **Rollback while data is still in the monolith** is cheap: flip the route or toggle back.
- **Rollback after data ownership moves** is expensive: the old code no longer sees new writes. Before moving data, keep both stores synchronised for a period (see `05`), so you can switch back. Only stop synchronising when the exit criterion is met.
- **Irreversible steps** (deleting old tables, turning off the old path, breaking a contract) come last in each slice and need explicit sign-off.
- Every step needs a **rollback trigger** defined in advance: error-rate, latency or mismatch thresholds, or a business signal.

## Exit criteria (examples)
- 100% of requests for the capability served by the new service for 30 days.
- Mismatch rate in parallel run below the agreed tolerance for two weeks.
- Old code path and its tables removed from the monolith.
- The owning team supports the service on call without help.

## Anti-patterns
- **Big-bang rewrite**: a new system built in parallel for a year before any user sees it. Costly, late, and usually missing behaviours.
- **Extract everything at once**: many services cut in one programme without platform or ownership in place.
- **Lift the layers**: putting the UI, logic and data into separate services.
- **Shared database forever**: code moves, data never does — a distributed monolith.
- **No deletion**: old paths left alive "just in case", doubling maintenance.
- **Migration as a side project**: work squeezed between features with no funding, owner or measures.

## Example plan step (invented, a ticketing platform)
```
2. Extract Seat Map — pattern: strangler fig on /venues/*/seatmap routes + parallel run
   Code: copy seat-map rendering and hold logic to a new service; trim unused parts
   Data: service reads monolith venue tables through a read-only view; hold records move to the service's own store, synced back to the monolith by the service until step 4
   Risks: double-holding seats during switch-over; latency on large venues
   Rollback: route back to monolith if hold errors > 0.1% or p95 > 400 ms; sync keeps monolith data current
   Done when: all seat-map traffic on the service for 30 days; parallel-run mismatches < 0.01%
```
