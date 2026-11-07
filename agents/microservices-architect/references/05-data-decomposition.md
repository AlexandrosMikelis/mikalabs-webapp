# Data decomposition

Code is the easy half of a migration. Data is where integrity, performance and rollback live. A service that shares its database with others is not independently deployable: any schema change becomes a cross-team negotiation.

## The shared database
Many services reading and writing the same tables is the most common form of coupling (common and content coupling, see `03`). Problems: nobody knows who may change what; the schema is a public contract no one can evolve; business rules for the same data spread over many services; one slow query hurts everyone.

Acceptable cases (keep them narrow and explicit):
- **Read-only reference data** with one owner who publishes changes (country codes, product categories), where staleness is fine.
- **A database used as the published interface** on purpose: a dedicated reporting or integration schema, owned and versioned like an API.

## Coping patterns while the split is pending
Use these to reduce harm when tables cannot move yet.

- **Database view**: expose a view instead of the raw tables, so the owner can change the underlying schema while the view's shape stays stable. Only for reads; most engines limit updatable views. It narrows coupling but doesn't remove it. Make one team own the view.
- **Database wrapping service**: put a thin service in front of tables that can't be split yet, and make all callers go through it. Even if the service starts as plain data access, it becomes a place to collect rules and later to move the data behind. Good for tables that are tangled but whose writers can be redirected.
- **Dedicated read schema for outsiders**: the owning service publishes a read-optimised copy (a separate schema or database) that consumers query, refreshed from the internal store by the owner, often via change data capture. The internal schema stays private; the external one is a contract with its own versioning.
- **Monolith-owned data API**: when a new service needs data the monolith still owns, have the monolith expose a proper API for that aggregate (e.g. "get membership status") rather than letting the service query its tables. This also surfaces the concept for later extraction.

## Moving ownership
Eventually the service must become the single writer and source of truth.

1. Identify every reader and writer of the tables (code search, database audit logs, query statistics). Expect surprises: batch jobs, reports, spreadsheets with live connections.
2. Redirect writers to the service API (or a wrapping service) one by one.
3. Move the tables to the service's own store, or give the service a separate schema in the same database server as an intermediate step (logical separation before physical).
4. Redirect readers: to the service API, to events it publishes, or to a published read model.
5. Remove the old tables only when no one reads them and rollback is no longer needed.

**Logical vs physical separation**: separate schemas on one server give ownership clarity and allow later movement, with low cost; separate servers give isolation of load and failure. Logical first is a reasonable step; don't confuse it with done.

## Keeping two stores in sync during migration
While old and new stores both exist, rollback depends on synchronisation. Options:

- **Synchronise in the application** (one writer keeps both stores current):
  1. Bulk-copy existing data to the new store; then catch up changes made during the copy (via CDC or a change log).
  2. Write to both, read from the old: verify the new store matches.
  3. Write to both, read from the new: the new store becomes the source of truth; the old remains for rollback.
  4. Stop writing to the old store.
  Keep a single code path doing the dual writes to avoid divergence, and reconcile periodically.
- **Gradual ownership transfer**: move the source of truth for a subset of data at a time (one field, one entity type, one customer segment), synchronising the rest, so each move is small and reversible. The old system may keep a copy for consumers not yet migrated.
- **Change data capture**: the new service subscribes to the old store's change log (or the reverse during rollback periods). Fewer code changes, more infrastructure; beware of schema changes breaking the stream.

Rules for any sync: one source of truth at each moment, an explicit order of the switch-over, reconciliation reports, and monitoring of lag and mismatches.

## Splitting the schema
Common refactorings when tables belong to more than one future service:

- **Split a table**: a wide table holds columns that belong to different capabilities (e.g. a `bookings` table with both clinical notes and invoicing columns). Separate them into two tables with a shared key, then give each to its owner. Decide which side owns the shared key.
- **Move foreign-key relationships into code**: a join across future service boundaries becomes an API call or a local copy. Consequences: no database-enforced referential integrity; the referencing service must handle deleted or missing records (soft deletes, tombstones, or "unknown item" handling). Avoid hard deletes of referenced data; prefer marking as inactive.
- **Shared static data** (status codes, country lists): options are duplicate the table per service (fine for slowly changing data with low stakes), turn it into code or configuration in a shared library (only if it truly never varies and changes are rare), or give it to a dedicated owner service. Pick the cheapest that keeps one owner.
- **Joins for reporting** move out of the operational databases to a reporting store (below).

Performance: replacing joins with calls can multiply latency. Mitigate with coarser APIs (batch lookups), local read copies kept up to date by events, or caching.

## Transactions across services
Inside one service, keep using local ACID transactions. Across services, you lose atomicity.

- **Two-phase commit / distributed transactions**: technically possible across some stores, but they lock resources across the network, scale poorly, and leave hard-to-resolve states when the coordinator fails. Avoid for business workflows between services.
- **First question**: does this really need to be atomic? Often the boundary is wrong; if two pieces of state must always change together, they may belong in one service.

### Sagas
The saga pattern coordinates a multi-step change across services as a sequence of local transactions; each step that can fail later steps has a compensating action that semantically undoes it.
- **Backward recovery**: on failure, run compensating actions in reverse order (refund the payment, release the reservation). A compensation is a new business action, not a rollback: emails already sent can't be unsent, so send a correction.
- **Forward recovery**: retry or continue from the failure point, when the step will eventually succeed.
- **Order steps** so the ones most likely to fail come first, and irreversible or customer-visible steps come last.
- **Semantic lock**: mark records as pending while a saga is in flight so others don't act on a half-finished state.

Two coordination styles:
| Style | How | Good for | Watch for |
|---|---|---|---|
| **Orchestration** | A coordinator (one service or a workflow engine) tells each participant what to do and tracks progress | Clear visibility of the process; simpler error handling; one place to read the flow | The coordinator absorbing business logic from participants; central bottleneck |
| **Choreography** | Each service reacts to events and emits its own; no central coordinator | Loose coupling, independent teams | Hard to see the overall process; needs correlation IDs and tracing to know a saga's state |

Practical guidance: orchestration within one team's area; choreography across team boundaries, with an explicit view of saga state (e.g. a projection built from events). Make every step idempotent; messages will be retried. Workflow engine selection and event platform detail → Nereus (Event Streaming Architect) where streaming is central.

## Reporting
Reports that used to join many tables need a new home:
- A **reporting database or data platform** fed by services (published events, CDC, or scheduled exports). Treat each feed as a contract owned by the producing service.
- Avoid letting analysts query service databases directly; that recreates the shared database.
- Accept latency: most reports tolerate minutes or hours.

## Checklist for a data step in a `plan`
- Who owns the data after this step? Who writes, who reads?
- Which coping pattern is used in the meantime?
- How are old and new kept in sync, and for how long?
- What breaks referential integrity, and how is it handled?
- Which transactions span services now, and which saga replaces them?
- How do reports get their data?
- What is the rollback, and when does it stop being possible?

## Example (invented)
A furniture retailer splits Inventory out of its order monolith. Step A: wrap the `stock` table with an Inventory service; all monolith code goes through it. Step B: move `stock` to the service's store, monolith still reading a view populated by the service. Step C: order placement becomes a saga — reserve stock (Inventory), take payment (Payments), confirm order (Orders); payment failure triggers stock release. Step D: retire the view once the order code reads only the API.
