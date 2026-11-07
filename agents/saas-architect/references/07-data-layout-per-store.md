# Step 7 — Where does each customer's data sit, store by store?

Use for the DATA PARTITIONING field in `design` and the data lens in `review`. Layout decides where rows and objects live; the isolation ladder (`06`) decides how access is enforced. Decide both together.

Grounding: PostgreSQL documentation (row security, schemas, logical replication), Amazon DynamoDB and Azure Cosmos DB partitioning guidance (including Cosmos DB hierarchical partition keys), the Azure Architecture Center pages on multitenant storage and data approaches, the AWS whitepaper on SaaS storage strategies, Elasticsearch/OpenSearch documentation on document-level security, and MIKA's store-by-store tables below.

## Questions to ask for every store
| Question | Why it matters |
|---|---|
| How uneven is load across customers? | heavy customers create hot partitions and skewed statistics |
| How many customers break if this store fails or is corrupted? | blast radius |
| Does a contract or regulation name a dedicated store, key or region? | gate 1 in `02` |
| How many databases can the team patch, migrate, back up and watch? | operational ceiling |
| Does the data shape suit this store? | multitenancy is no reason to force one database for everything |
| Can one customer be restored, exported and erased alone? | lifecycle duties (`04`) |
| Is the store priced per instance or per request and gigabyte? | per-instance pricing makes dedicated copies costly |

Default: shared storage with a customer key, protected at the rung the data needs. Dedicate a store only when an answer above demands it, and write down which.

## Relational databases
| Layout | How | Fits | Watch |
|---|---|---|---|
| Shared tables | `tenant_ref` column on every table; leads every composite key and index | many customers; option A | row security (L2); planner statistics skewed by giant customers; vacuum and bloat on hot tables |
| Schema per customer | one database, one schema each | hundreds of customers needing logical separation and schema-level restore | migrations run N times; catalog bloat at thousands of schemas; connection routing by `search_path` is easy to get wrong |
| Database per customer | separate database, possibly separate instance | regulated or enterprise segments; per-customer keys and restore | cost per instance; migrations across a fleet; connection explosion; fleet monitoring |

Notes:
- Schema changes must be backward compatible (expand, migrate, contract) and rolled across every customer database by the same pipeline, with status per database. A fleet where 3% of databases failed migration silently is a common outage source.
- Many databases behind shared services need a connection pooler or proxy (PgBouncer, RDS Proxy, Azure's built-in PgBouncer); count connections against the database limit at the three-year customer count.
- Distributed SQL engines (Citus, CockroachDB, YugabyteDB, Spanner) can co-locate a customer's rows by a leading `tenant_ref` key and move heavy customers to their own nodes.

## Key-value and document stores
| Layout | How | Watch |
|---|---|---|
| Shared table, customer in the partition key | partition key `tenant_ref` or `tenant_ref#entity` | a busy customer makes a hot partition: write-shard with suffixes (`tenant_ref#n`) for heavy customers; L2 via conditions on the leading key |
| Hierarchical keys | Cosmos DB hierarchical partition keys (customer, then sub-key) let one large customer span many physical partitions | check the feature's query and limit rules |
| Table or container per customer | one table each | per-account table limits; index changes rolled across N tables |
| Account or database per customer | separate account | strongest; heaviest to run |

Secondary indexes in shared tables must also lead with the customer reference, or they become a cross-customer query path.

## Object storage
| Layout | How | Watch |
|---|---|---|
| Shared bucket, prefix per customer | `t/{tenant_ref}/...` | prefix-conditioned policies (L2–L3); request-rate limits per prefix; listing must never be unscoped |
| Bucket or container per customer | one each | bucket count limits; per-bucket keys, lifecycle rules and cost tags; deletion is trivial |

Pre-signed URLs only for the requesting customer's objects, short expiry, never cached across customers. Tag objects with the customer reference for cost allocation (`09`).

## Search, analytics and vector stores
| Layout | How | Watch |
|---|---|---|
| Shared index with customer field | every document carries `tenant_ref`; filter enforced server-side or by document-level security | relevance statistics leak across customers (term frequencies); a client-side filter is L0 |
| Index or alias per customer | filtered aliases or one index each | shard count explosion; good for per-customer erasure and tuning |
| Cluster per customer | separate cluster | premium or regulated only |
| Vector store | namespace or collection per customer, or one index with a mandatory metadata filter applied by the server | approximate-nearest-neighbour filters can return fewer results when filtering after the search; test recall per customer |
| Warehouse / lakehouse | `tenant_ref` column plus row access policies; or a schema per large customer | analysts' tools often bypass the application's controls: same rung rules apply |

## Different layouts in one product
Components and segments can differ: HarbourLine bookings in shared PostgreSQL, manifests in a key-value store keyed by `tenant_ref#sailing`, crew documents in a bucket per operator, analytics in a shared warehouse with row access policies, and one large operator on a dedicated database. Record each customer's placement per store in the catalog; the shared data library resolves it at runtime.

## When one shared store is not enough
Shard by customer through a **directory** (customer → shard, kept in the catalog), not by hash alone. A directory lets you place a heavy customer on its own shard and move customers later. Stamps (`02`) are the same idea at the scale of a whole deployment.

## Lifecycle of the data
- **Restore one customer**: shared stores need tooling: point-in-time restore to a side copy, extract that customer's rows, merge back with conflict rules. Rehearse it; promise nothing you have not run.
- **Export**: self-service, machine-readable; also supports GDPR data portability (flag for compliance).
- **Erasure**: every store, index, vector entry, cache, log and backup within policy (`04`). Per-customer keys make backup erasure feasible through key destruction.
- **Retention by plan**: e.g. GridShare keeps 13 months of half-hourly readings on Community, 7 years on Co-op Plus; implement with TTLs, partitions by month and tiered storage classes.
- **Custom fields**: one schema for everyone; customer-defined fields as JSONB or extension tables governed by configuration, never a forked schema.

## Keys, encryption and residency
- Encryption at rest and in transit everywhere.
- Customer-managed keys as a paid option: envelope encryption with a key per customer in a KMS; for shared tables, encrypt sensitive columns with per-customer data keys. Revoking one customer's key must not affect others; document what stops working when they revoke.
- Residency: data, replicas, backups, logs, search indexes, analytics copies and support access all stay in the promised region. Regional stamps are the usual answer. **Flag GDPR transfer rules and sector residency duties for compliance confirmation.**
- Audit provider staff access to customer data (evidence for SOC 2 and ISO/IEC 27001 controls; flag).

## Output of this step
```
DATA PARTITIONING
  <store> — <shared | schema | database | table | bucket | index> — key or prefix — rung (06) — why
  Sharding: <directory, heavy-customer placement, moves>
  Lifecycle: <single-customer restore, export, erasure, retention by plan>
  Keys and residency: <encryption, per-customer keys, region per copy>
```

## Review checks
- Is the layout explicit per store and per segment?
- Does every shared store lead every key and index with the customer reference, with the required rung proven?
- Are heavy customers handled (write sharding, own shard, dedicated store)?
- Can one customer be restored, exported and erased?
- Do schema migrations run and report across every customer database?
- Do residency and key promises hold for every copy, including backups and analytics?

## Worked mini-example — GridShare
Half-hourly readings (about 17,500 per meter per year) in a shared time-series table partitioned by month with `tenant_ref` leading the primary key and row security forced (L2). Members' bank details in a separate table encrypted with per-co-op data keys, accessed with scoped credentials (L3). Settlement statements in a bucket per co-op. A shared search index for member lookup filtered server-side. The two grid-contract co-ops have dedicated databases in their own region with customer-managed keys (L4). Customer → shard directory in the catalog; the largest co-op was moved to its own shard after its meter count passed 50,000.
