# Shared data products, governance and platform

Use for the DATA PRODUCTS and PLATFORM & GOVERNANCE fields in `design` and the data-product areas in `review`. A stream that other teams depend on is a product: someone owns it, it has a contract, and tooling makes it easy to publish and find.

Grounding: Zhamak Dehghani's two data-mesh articles on martinfowler.com (2019 on moving beyond the central data lake; 2020 on principles and logical architecture), the Open Data Contract Standard (ODCS, Bitol project under LF AI & Data), Bitol's Open Data Product Standard, OpenLineage, the documentation of open catalogues such as DataHub and OpenMetadata, Apache Iceberg docs, the public "Kappa architecture" discussion (2014), and MIKA's own rubrics below.

## When is a data-product approach worth it?
Look for these symptoms before proposing anything:
- Services read each other's databases or replicas, so internal schemas are de facto public.
- A central data team extracts raw tables and repairs them downstream; producers do not know who depends on which column.
- The same entity appears in a warehouse table and a service cache with different values.
- New consumers wait weeks for access or a bespoke extract.
Two or more symptoms across three or more bounded contexts → run shared streams as products. One producer and one consumer → a well-designed stream with a contract is enough; skip the extra machinery.

Common pushback is about duplicated copies and lag. Copies derived from an immutable, versioned stream are reproducible and traceable, unlike ad hoc extracts; and the lag already exists in every replica and nightly load, a stream just makes it measurable (`08`).

## What do the four data-mesh principles ask of a streaming design?
Dehghani's articles set out four principles. In stream terms:
| Principle (paraphrased) | What it means for streams | Review signal |
|---|---|---|
| Teams that create data answer for it | The owning team runs the publication pipeline, the schema, quality and support | A central team republishes others' data |
| Shared data is built and supported like a product | Contract, SLOs, docs, samples, deprecation policy | Streams with no owner or no consumers listed |
| A platform makes publishing self-service | Teams create shared streams without tickets | Every new stream needs the platform team by hand |
| Standards are agreed jointly and enforced by automation | Rules checked in CI and at the broker | Standards exist only in a wiki |
Domain boundaries themselves → Gaia.

## What makes a stream a product?
The 2019 article lists qualities a data product must have: discoverable, addressable, trustworthy, self-describing, interoperable and secure. MIKA's product card makes them checkable; field names map to ODCS where it has an equivalent.

| Card field | Content | ODCS area |
|---|---|---|
| Identity | name, domain, version, status (draft / active / deprecated / retired) | fundamentals |
| Owner | team, on-call contact, escalation | team, support |
| Schema | registry subject, format, compatibility mode (`03`) | schema |
| Semantics | key meaning, payload profile (`02`), field meanings, units, time fields | schema descriptions |
| Quality | checks, thresholds, what happens on failure | data quality |
| Service levels | freshness, availability, retention, latency to publish | SLA properties |
| Access | classification, approval rule, purposes allowed | roles, custom properties |
| Lineage | upstream products and sources | (OpenLineage) |
| Modes | stream topic, Iceberg table, API, files | servers |

On a log-based broker, two card answers come almost free: corrections are new events, so any past view can be rebuilt; and the platform can generate an Iceberg table from the topic, so the table and the topic cannot drift apart. Services materialise the same stream into their own stores to serve users, which is what warehouse-only setups cannot offer.

## How does MIKA tier products by how they are built?
| MIKA tier | Built from | Owner | Rule |
|---|---|---|---|
| **Origin product** | One domain's system of record (outbox or CDC + public projection, `07`) | The producing domain | Full-picture events (`02`), long retention, strict compatibility |
| **Composite product** | Several products joined or aggregated | The domain with the strongest stake in the result | Declares lineage to every input; inherits the strictest input classification |
| **Purpose-built product** | Shaped for one use case | The consuming team | Not a source for others. If a third team asks for it, promote it to composite with a named owner, or point them at the inputs |
Dehghani's 2019 article draws a similar line between source-oriented and consumer-oriented domain data; the tier rules above are MIKA's.

## Why streams as the backbone?
- Full-picture streams let consumers materialise entities without callbacks; compaction gives cheap bootstraps (`02`, `04`).
- One streaming path that can reprocess history (the "Kappa" architecture) avoids separate batch and speed layers whose results disagree. Needs: long or infinite retention (tiered storage in Kafka, Pulsar, Redpanda), processors that replay fast, and transitive schema compatibility across the whole history (`03`).
- Plain queues are not products: no history, no independent readers.
- Broker criteria: retention and tiering, partition scalability, compaction, transactions, connector and registry ecosystem, multi-region replication, managed offering, security model, cost.

## What do the shared standards cover?
A small group, one person per owning team plus the platform engineers, agrees the rules; teams apply them; tooling checks them.
- Product modes supported and how each is generated.
- Schema formats and default compatibility mode (`03`).
- Supported client languages and libraries.
- Required card fields (above) and catalogue entry.
- Lifecycle: versioning, deprecation notice period, retirement.
- **Overloaded terms**: words that mean different things in different domains ("member" in the co-op's billing vs governance domain; "active" contract). Agree shared identifiers; either one canonical definition or distinct field names.
- Key formats for shared entities, so streams co-partition (`04`).
- Time conventions: UTC, precision, which timestamp means what.
- Security, privacy and retention policy.
Decision cycle: raise a cross-domain problem → written proposal → review by affected domains → automate or change → record the decision as an ADR where people will find it.

## How are access and personal data handled?
- **Deny by default**: a new topic is unreadable until access is granted per consumer identity and purpose (Kafka ACLs, Pulsar authorization policies, or the managed service's RBAC).
- **Encryption**: TLS in transit everywhere; at rest by the platform; end-to-end payload encryption where intermediaries must not read data.
- **Field-level encryption** for sensitive fields, so most consumers read the stream without them; keys granted separately (Confluent's client-side field-level encryption and similar tools; check licence tier).
- **Erasure**: personal data in immutable logs is hard to delete. Options, best first: keep personal data out of events (references to a governed store); **crypto-shredding** (per-person key in a key service; deleting the key makes every copy unreadable); short retention for personal-data streams; compaction with tombstones (does not reach copies already sunk to tables, so Iceberg row deletes or rewrites are needed too). Legal interpretation is out of scope; flag for the privacy officer.
- **Lineage**: *topology lineage* (which services read and write which streams, from ACLs, consumer groups and deployment metadata) for impact analysis; *record lineage* (headers naming upstream event IDs) for audit, at a cost per event. OpenLineage is the common open format; DataHub and OpenMetadata ingest it.

## How mature does the platform need to be?
MIKA scores six capabilities 0–3. 0 = absent, 1 = manual / per-request, 2 = self-service for the common path, 3 = declared as code and checked automatically.
| Capability | What a 2 looks like |
|---|---|
| **Publish** | A domain creates topic, schema subject, ACLs and card in one workflow |
| **Discover** | Searchable catalogue with owner, schema, samples, SLO status, lineage |
| **Access** | Request-and-approve flow bound to workload and human identities; audit log |
| **Build** | Managed stream processing (Flink SQL, Kafka Streams templates) for composite products |
| **Observe** | Per-product freshness, volume, schema-drift and quality alerts |
| **Retire** | Deprecation flags in the catalogue, consumer notification, usage tracking |
Target by size: up to 5 products / 2 domains → 1 everywhere is fine. Up to 30 products / 6 domains → 2 in Publish, Discover, Access. Beyond that → 2 everywhere and 3 in Publish and Access (products declared in the service repo and provisioned by CI/CD). A score two levels below target in Access or Discover is a High finding; elsewhere Medium. Also budget compute, storage quotas and cost attribution per domain, and register non-stream products (tables, files) in the same catalogue. Buy commodity pieces (managed broker, registry, catalogue) rather than build them.

## How severe is a product-level finding? (calibration)
| Situation (house domains) | Severity | Why |
|---|---|---|
| Ferry operator: passenger names and passport numbers on a keep-all topic, no erasure path, read by 9 teams | Critical | Legal obligation cannot be met; history already wrong to fix by replay |
| Clinic network: Billing and Analytics read the practice-management replica directly; no public stream | High | Every schema change breaks two teams; no owner for the contract |
| Energy co-op: purpose-built `flex.offer-features` read by a third team for invoicing | High | Hidden source with no SLO feeding money flows |
| Catalogue entries lack sample data and freshness SLO | Medium | Slows onboarding; no direct data risk |
| Card uses free-text classification instead of the agreed enum | Low | Hygiene; automate the check |

## How does this map to a knowledge graph?
Model the card as nodes and edges so impact questions become traversals: `(Product)-[:OWNED_BY]->(Team)`, `(Product)-[:TIER]->(Tier)`, `(Product)-[:DERIVED_FROM]->(Product)`, `(Product)-[:EXPOSED_AS]->(Topic|Table)`, `(Service)-[:READS]->(Topic)`, `(Field)-[:CLASSIFIED_AS]->(Classification)`. "Which consumers see personal data from support cases?" is then a three-hop query, and OpenLineage run events keep the `DERIVED_FROM` and `READS` edges current.

## How does a first product get started?
1. Pick one team whose records many others need, and who want to go first.
2. Publish one origin product properly: outbox or CDC with public projection (`07`), registered schema, card, catalogue entry.
3. Move two or three existing consumers (one operational service, one analytics job) onto it; retire their direct database reads.
4. Build only the tooling that first stream needs; form the standards group with the first teams.
5. Repeat team by team; raise capability scores when manual steps start to hurt.
Measure: products live, consumers per product, direct database integrations retired, incidents caused by schema changes, days from access request to first data.

## Review checks
- Is every product owned by a named domain team? Any central team republishing others' data?
- Full-picture events with history? Is a single streaming path feasible (retention, replay speed, transitive compatibility)?
- Tiers clear? Purpose-built products quietly used as sources?
- Standards for schemas, keys, time, card fields, lifecycle, overloaded terms?
- Access deny-by-default? Personal data handled (field encryption, crypto-shredding, retention, sunk copies)?
- Lineage and catalogue complete?
- Capability scores at or near target for the number of products and domains?

## Worked example (house domain)
A community energy co-op wants member billing insights and real-time demand-response offers. Origin products: `membership.member.v1` (outbox), `metering.meter-reading.v1` (readings from smart meters via MQTT bridge), `support.case.v1` (CDC + public projection). Composite: `grid.feeder-load-15m.v1`, built by the grid domain with Flink SQL. Purpose-built: `flex.offer-features.v1`, owned by the demand-response team, sunk to an Iceberg table for model training while the offer service materialises it for live decisions. Standards fix `member_id` as a string UUID everywhere and split the overloaded "active member" into `has_supply_contract` and `voted_last_agm`. Personal fields in `support.case.v1` are field-encrypted with per-member keys. Capability scores: Publish 2, Discover 1, Access 1 for 14 products across 5 domains, so Discover and Access are the next investments.
