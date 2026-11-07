# Step 7 — Access, secrets and data protection

Use for the `SECURITY` field in `design` and the access-and-data lens in `review`. This is the view of security that is specific to functions, on-demand containers and managed building blocks; API threat modelling, OAuth flows and token validation in depth go to **Argus**.

Grounding: NIST SP 800-207 (zero trust architecture), the OWASP API risk list (2023 edition) and its serverless counterpart project, build-provenance levels, CycloneDX and SPDX for software bills of materials, each provider's published split of duties between provider and customer, and their identity and key-management documentation. MIKA's own permission ledger and leak-path table sit on top.

## What does the provider look after, and what is still ours?
With managed runtimes the provider patches hosts, operating systems, language runtimes and the internals of each managed service. Still ours: who may do what, the code and its dependencies, configuration, how data is classified and encrypted, which events we accept, what we expose to the internet, and the image when we bring our own container. A custom container image or custom runtime moves operating-system patching back to us.

## The MIKA permission ledger
Keep one row per compute node. It doubles as a review artefact and as edges in the system graph (`Compute -CAN-> Action on Resource`).

| Column | Rule |
|---|---|
| Identity | one runtime identity per function or container (an execution role on AWS, a managed identity on Azure, a service account on Google Cloud), never shared across services |
| Actions | only the operations the code calls; no wildcard actions |
| Resources | named resources, narrowed further by key prefix or tag conditions where the platform allows |
| Who may invoke it | an invoke policy naming the exact source (a specific rule, queue or API) |
| Secrets it reads | named secret, read at runtime, cached briefly |
| Data classes touched | from the workload card (`01`) |
| Last reviewed | date; unused grants removed using the provider's unused-access reports |

Ledger checks: no identity may write to a store its service does not own; no component may both read health or payment data and publish to a widely subscribed bus without a written reason; deployment identities are separate from runtime identities; production denies manual changes except a logged break-glass path.

## Where do secrets live?
- In a managed secrets service (AWS Secrets Manager, Azure Key Vault, Google Secret Manager), referenced by name; never in code, templates, or environment variables shown in plain text to anyone with read access to the configuration.
- Read on first use and kept in memory for a short time to live, so a busy function does not call the secrets service on every request.
- Rotated on a schedule; database and partner credentials use managed rotation where offered.
- Better still, no secret at all: database sign-in with the runtime identity (supported by the main managed relational services on all three clouds), and federated workload identity for pipelines instead of long-lived keys.

## Which incoming messages can be trusted?
- **Inside the account or project**: trust follows the publish policy. A bus, topic or queue that every identity can publish to is an open door; name the publishers.
- **From partners and webhooks**: check a signature (an HMAC over the body with a shared secret, or an asymmetric signature) plus a timestamp to stop replays, or use mutual TLS; then validate the body against its schema before any logic runs.
- **Between internal services**: consumers still validate what they act on. A message can pass its schema and still carry a value the consumer must refuse, such as a negative refund.
- **Uploaded files** are untrusted until scanned where the data class or contract demands it.

## Where can personal data leak?
Personal, health and payment data spread further in message-driven systems than in a single application, because every hop can keep a copy. Check each path:

| Leak path | Control |
|---|---|
| Messages on a shared bus | send references, not records; separate buses or routing rules for sensitive types; subscription rights per named consumer |
| Logs and traces | logging with a field allowlist; masking at write time (the main log services offer pattern-based masking policies); no request bodies at debug level in production |
| Dead-letter queues and event archives | same encryption and retention rules as the primary data; narrow read access |
| Scratch disk and caches | delete sensitive temporary files after use; expiry on cached items |
| Analytics exports | pseudonymise before export; record the purpose |

Encrypt at rest with keys whose policy names the identities allowed to decrypt; use customer-managed keys where the data class or a contract asks for them, provider-managed keys otherwise. TLS on every hop. Residency and lawful-basis questions are flags for the compliance team, never conclusions.

House example: the veterinary clinic network publishes `ImagingStudyStored.v1` carrying `studyUid`, `clinicId` and a storage key. The owner's name and phone number stay in the clinic's patient store; the reporting service fetches what it needs through an API that checks the clinic relationship first.

## How do we trust the code that reaches production?
- Dependencies pinned with a lock file and scanned in the pipeline; a bill of materials per build in CycloneDX or SPDX.
- Provenance recorded, with SLSA levels as the target; packages and images signed and the signature checked at deploy time (package signature checks for AWS functions, image signature policies on Azure, Binary Authorization on Google Cloud).
- Small packages: fewer dependencies mean fewer vulnerabilities and faster start-up.
- Runtime versions tracked against each provider's published end-of-support dates; upgrade before the date, not after.

## What guards the public edge?
- A web application firewall with managed rule sets and rate rules on the CDN or API; bot controls where scraping or credential stuffing is likely.
- Sign-in checked at the gateway; permission to touch a specific record checked in the service. OWASP ranks broken object-level authorisation as the leading API risk in its 2023 list.
- Per-client throttling; `429 Too Many Requests` with `Retry-After`.
- Private endpoints for internal-only paths. Attach functions to a private network only when they must reach private resources.

## Go-live checks
1. Permission ledger complete; no wildcard actions; invoke rights scoped to named sources.
2. Secrets in a secrets service and rotated; none in templates or plain configuration.
3. Every public entry has sign-in, throttling and a firewall; record-level checks in code.
4. Publishers to every bus and queue named; partner messages verified.
5. Logs masked and given a retention period; dead-letter queues encrypted with narrow access.
6. Key policies match data classes.
7. Dependency scan, bill of materials and signing in the pipeline.
8. Audit logging on, with alerts on permission changes and on logging being switched off.

## Worked mini-example: one ledger row
Regional ferry operator, `refund-worker`:

| Identity | Actions | Resources | Invoked by | Secrets | Data |
|---|---|---|---|---|---|
| `refund-worker-runtime` | read and conditional update on bookings; send to refunds-dlq; call the payment provider | `bookings` table rows with prefix `REFUND#`; `refunds-dlq` | the `refunds` queue only | payment provider API key (rotated every 90 days) | payment references, no card numbers |

Review note: the first draft granted write on the whole `bookings` table and read on every secret in the account. Narrowing both turned two High findings into none.

## Signals for the review
- One identity shared across services, or wildcard actions on data stores → High; Critical if health or payment data is reachable.
- Secret in code, a template or plain configuration → High. If a real secret appears in the input, do not repeat it; raise it and recommend rotation.
- Partner webhook handled without signature checking → High.
- Personal data in logs or in widely subscribed messages → High.
- Any identity may publish to a bus that triggers payments or clinical actions → High.
