# Integrating existing systems

Use for the SOURCING field in `design` and for publication findings in `review`. Most organisations start with databases and monoliths, not streams. Getting their data into well-formed streams and getting stream data back into stores and APIs decides whether an event-driven architecture is trusted.

## 1. Principles
- The goal is a **public stream of domain facts**, not a copy of internal tables. Extraction pipelines are a means; the contract is what matters.
- The system of record stays authoritative for its writes. The stream must reflect its committed state faithfully: no lost changes, no phantom changes.
- Prefer the producing team to own the extraction pipeline and the resulting stream, even when the platform team provides the connector.
- Accept compromises consciously: early extraction may expose a rougher model; plan the clean-up.

## 2. The dual-write problem
A service writes to its database and then publishes an event in a separate step. If the process crashes between the two, or the publish fails, the database and stream diverge: lost events or events for changes that rolled back. Retries and try/catch reduce but never remove the gap. **Dual write is a review finding** (High, or Critical for money, stock or regulated data).
Two safe patterns: transactional outbox and change-data capture.

## 3. Extraction patterns
### Query-based (polling)
A connector periodically queries tables and publishes rows.
- Variants: **bulk load** (whole table each time; simple, heavy, only for small tables or initial snapshots); **incremental by timestamp** (rows with `updated_at` greater than the last seen; needs a reliable, indexed update timestamp); **incremental by increasing ID** (only for insert-only tables); **custom query** (joins/views to shape the output).
- Pros: works with any database you can query; easy to understand; can shape output with SQL; no special database permissions.
- Cons: misses hard deletes; misses intermediate changes between polls; load on the source; timestamp precision and clock issues can skip or repeat rows; latency equal to the poll interval; schema changes in the source break the query.
- Fit: legacy systems where CDC is impossible, low-change reference data, initial bootstraps.
Example tools: JDBC-style source connectors.

### Change-data capture (CDC) from the database log
A connector reads the database's replication or transaction log (Postgres WAL logical decoding, MySQL binlog, SQL Server CDC, Oracle redo via a supported tool, MongoDB change streams) and emits an event per committed row change, often with before and after images. Debezium is the best-known open-source example; many cloud services offer equivalents (check licences and supported versions).
- Pros: captures every committed change including deletes; low latency; low load on the source; no changes to application code; ordering per row preserved.
- Cons: output mirrors **internal table structure** (normalised rows, technical columns), so publishing it raw makes the producer's schema a published contract; needs database privileges and log retention settings; schema changes (DDL) in the source must be handled; transactions spanning several tables arrive as several events; initial snapshot plus streaming must be coordinated.
- Fit: databases you control, high change rates, and as the feed for an outbox or a public-projection step.

### Transactional outbox
The application writes the business change **and** an outbox row describing the public event in the **same database transaction**. A relay (CDC on the outbox table, or a poller) publishes outbox rows to the stream and marks or deletes them.
- Pros: the public event is designed deliberately by the domain team (clean contract, decoupled from tables); atomic with the business change; works with CDC for low latency.
- Cons: application code changes; extra writes and table growth (clean up published rows); the relay must preserve order per aggregate (partition outbox by aggregate ID); still at-least-once, so consumers deduplicate on event ID.
- Fit: the default for services you can change. The outbox can also enforce schema validation before commit.

### Triggers
Database triggers write change rows into an audit/changelog table that a poller or CDC reads.
- Pros: works where log access is unavailable; captures every change.
- Cons: overhead on every write; logic hidden in the database; fragile under DDL; vendor-specific. Use only when log-based CDC and outbox are not possible.

### Choosing
| Situation | Prefer |
|---|---|
| Service you own, can change code | Outbox (relayed by CDC) |
| Database you control, cannot change the app | CDC + public-projection step |
| Legacy database, no log access | Query-based (accept missed deletes) or triggers |
| One-off bootstrap of history | Bulk snapshot, then CDC/outbox for changes |
| Files in object storage | Connector or job that reads files and emits events, with idempotent keys |

## 4. How do raw rows become a public event?
Raw CDC rows (an `appointment` row and five `appointment_item` rows) are not a good public event. A **public projection** (MIKA's name for this step) turns them into one denormalised full-picture event (`appointment` with its items, `02`).
Where to do it:
- **At the outbox**: the application writes the complete public event to the outbox. Simplest when you own the code.
- **In a dedicated service**: a stream processor consumes raw CDC streams (kept internal to the domain), joins and aggregates them by aggregate ID, and publishes the public stream. Use when the application cannot change. Watch out for transaction boundaries: a multi-table transaction arrives as separate events; join on transaction ID or wait briefly to avoid publishing half-updated aggregates (Debezium can emit transaction metadata, with per-transaction event counts, for this purpose).
In both cases, map internal codes to public enums, drop technical columns, and validate against the public schema.

## 5. Handling schema changes in sources
- Query-based and CDC pipelines break or silently change output when source tables change. Put a **schema check in the producing team's deployment pipeline**: a DDL change that alters a captured table must update the mapping and pass the public schema's compatibility check before release.
- Changes after the fact (someone altered a column in production) need detection: monitor the connector's emitted schemas and alert on unexpected versions.
- Keep the published contract stable while the internal schema evolves; that is the whole point of the public-projection layer.

## 6. Slowly changing data and history
Analytical consumers often need history of attributes over time (a customer's tier on each date). Full-picture events with event time give this naturally if retained; compacted streams alone do not. For data products feeding analytics, keep history (long retention or archive) and include effective timestamps, so consumers can build type-2 slowly changing dimensions (general data-warehousing term).

## 7. Sinking streams to stores
Consumers often write streams into databases, search indexes, caches, data lakes or warehouses using sink connectors (Kafka Connect sinks, Flink sinks, cloud-native pipes).
- Use idempotent upserts keyed by the event key; handle tombstones as deletes.
- Map schema evolution to table evolution deliberately; do not let a sink auto-alter production tables without review.
- A sink is owned by the **consuming** team; the resulting table is their private view, not a new source of truth for others.
- Watch out for "sink then source": a team sinks a stream to a database, another team reads that database. That reintroduces hidden coupling; point the second team at the stream.

## 8. Streams and data at rest (analytics)
- Lakehouse "medallion" layering (raw/bronze, cleaned/silver, curated/gold; general industry term) often re-derives in batch what streams already offer. Land data products from streams directly into the cleaned layer when their contract already guarantees quality.
- Balance file sizes, latency and cost: very frequent small files hurt query engines; very large intervals hurt freshness. Compaction jobs and table formats (Iceberg, Delta, Hudi) help.
- Make the stream the single source for both operational and analytical consumers of a data product, so the warehouse and the services agree. A separate batch extract of the same table creates two truths.
- Watch cloud costs: streaming everything into a warehouse with per-row ingestion pricing, or re-reading the full history daily, can be expensive. Budget per data product.

## 9. Integrating with request-response systems
- **Inbound requests that change state**: a service handles the API call, writes to its store with an outbox, and publishes the resulting fact. The API caller gets the immediate result; others learn through the stream.
- **Events created by external parties**: user actions and third-party webhooks become events at the edge. Separate **unsolicited** inputs (the party acts on its own: a click, a meter reading) from **replies** to something you sent (a payment provider callback); replies need correlation to your outgoing request and a timeout path. Validate, assign IDs, stamp event and ingestion time, and publish.
- **Calling third-party APIs from a stream processor**: rate limits, latency and non-determinism (`05`). Use a dedicated service with retries, idempotency keys and results published as events; do not call external APIs from inside a transactional processing loop.
- **Serving reads**: materialise streams into a store and expose an API (`06`). For user interfaces, push updates (WebSocket, server-sent events) from the materialised state.
- **Front ends**: composing UIs from several services (micro-frontends) can align UI ownership with domain ownership; trade-off is consistency of look and performance across fragments.

## Review checks
- Any dual writes? Which pattern publishes each stream?
- Is raw CDC exposed as a published contract? Is there a public-projection layer?
- Are deletes captured? Initial snapshot coordinated with streaming?
- Are source DDL changes gated in CI?
- Are sinks idempotent and owned by consumers? Any "sink then source" coupling?
- Do analytics and operations read the same data product?

## Worked example (house domain)
A veterinary clinic network's 15-year-old practice-management system stores appointments across eight tables and cannot be modified. Design: Debezium CDC captures the eight tables into internal `pms.raw.*` streams; a projection service (Flink-class) joins them by appointment number using Debezium's transaction metadata to avoid half-built appointments, maps legacy status codes to a public enum and publishes `clinics.appointment.v1` (Avro, FULL_TRANSITIVE). The newer Lab Results service, which the network owns, uses an outbox for `lab.result.v1`. Raw streams are readable only by the projection service.
