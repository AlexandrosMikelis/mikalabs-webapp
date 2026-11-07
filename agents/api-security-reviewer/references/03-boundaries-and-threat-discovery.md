# Trust boundaries and finding the threats

## Where does trust change?
A trust boundary is any line where the party in control, or the level of assurance, changes. Each exposure-sheet row that crosses one is where authentication, authorisation, validation, encryption and logging must be decided explicitly rather than inherited.

Boundaries Argus looks for: device or browser → anything you run; internet → your first component; first component → services behind it (do services accept traffic that skipped it?); team or namespace → another; one customer organisation's data → another's; workloads → stores, queues and caches; workloads → third-party APIs and webhooks you call (often missing from diagrams); build pipeline → production; admin console → runtime; your cloud account → a vendor's.

Treat "it's on the internal network" as an assumption to test, not a control. NIST SP 800-207 states the principle (no implicit trust from network location; every access decided per request by policy) and SP 800-207A applies it to cloud-native, multi-location systems with identity-based segmentation at the application and service layers.

## How to draw the model
A text model is enough. List:
- **Actors** outside your control (owner app, partner system, webhook sender, AI agent);
- **Components** you run (gateway, backend-for-frontend, services, workers, authorisation server);
- **Stores** (databases, caches, object storage, queues, log stores, secret vaults);
- **Flows** between them, marking every boundary crossing with `‖`.

Ferry operator example:
`Passenger app ‖ CDN → gateway ‖ bookings svc → bookings DB` · `bookings svc ‖ payment provider API` · `bookings svc → manifest export job ‖ port authority SFTP` · `staff console ‖ admin svc → bookings DB`.
The port-authority export and the staff console are the flows most often missed.

## How are threats found?
Three passes, in this order. Each catches what the previous one misses.

### Pass 1: STRIDE on each boundary crossing
For every `‖` flow and every element it touches, ask the six STRIDE questions (the Microsoft-originated mnemonic). Applied per crossing it produces specific threats instead of generic ones.

| Letter | Question at this crossing | Typical API answer |
|---|---|---|
| S | Can the caller pretend to be someone else? | guessable or leaked keys, replayed bearer tokens, forged JWTs, identity taken from a header |
| T | Can data be altered on the way or at rest? | injection, binding of unexpected fields, unsigned webhooks, cache poisoning |
| R | Could a caller deny having done this? | shared credentials, no audit record, editable logs |
| I | Can someone see more than they should? | over-broad responses, verbose errors, forgotten old versions, tokens in URLs |
| D | Can someone exhaust capacity or budget? | unbounded queries or uploads, paid side effects, retry storms between workloads |
| E | Can someone gain powers they lack? | other people's records by ID, admin operations reachable with a user token, over-scoped service credentials |

### Pass 2: privacy threats with LINDDUN
For any row at D2 or above, run the LINDDUN categories (KU Leuven's privacy threat framework): **L**inking, **I**dentifying, **N**on-repudiation (where it harms the person), **D**etecting, **D**ata disclosure, **U**nawareness and unintervenability, **N**on-compliance. API-shaped examples: stable identifiers that let partners link a member across services; smart-meter series that identify occupancy; analytics events that reveal a pet's diagnosis to an ad network; no way for a passenger to see or withdraw a partner's access.

### Pass 3: sweep the 2023 OWASP list of API risks
Use the 2023 list as a final omission check and cite IDs as `API1:2023`. The table shows which step of the procedure catches each one and the CWE entries OWASP associates with it, so findings can be cross-referenced in tooling.

| ID | What it means in plain words (OWASP has the official titles) | Caught at step | Typical CWE |
|---|---|---|---|
| API1:2023 | unchecked access to individual records | 4 | CWE-285, CWE-639 |
| API2:2023 | weak proof of caller identity | 3, 5 | CWE-204, CWE-307 |
| API3:2023 | unchecked reading or writing of fields | 4, 6 | CWE-213, CWE-915 |
| API4:2023 | unbounded use of capacity or paid services | 6 | CWE-770, CWE-400 |
| API5:2023 | unchecked access to operations | 4 | CWE-285 |
| API6:2023 | automated abuse of valuable flows | 6 | (business logic, no single CWE) |
| API7:2023 | the API fetching where a caller points it | 6, 7 | CWE-918 |
| API8:2023 | unsafe settings and defaults | 7, 8 | CWE-2, CWE-16, CWE-209 |
| API9:2023 | unknown or forgotten interfaces | 8 | CWE-1059 |
| API10:2023 | over-trusting upstream APIs | 6, 7 | CWE-20, CWE-319 |

Older documents use the 2019 numbering; translate to the 2023 IDs when citing. Injection and logging gaps have no slot of their own in 2023 and remain findings.

Where an attack pattern helps a developer recognise the threat, name its CAPEC entry (for example CAPEC-664 for server-side request forgery) rather than describing attack steps.

## What makes a threat worth reporting?
- It names the element, the crossing and the exposure-sheet row.
- It says what an intruder gains in business terms, without exploit steps.
- It survives the question "how, exactly, and so what?".
- "Gateway does not strip `X-User-Id`; the bookings service trusts it" is a finding. "Consider header injection" is not.

## A review graph for orchestrators
When results feed a knowledge graph, Argus' output maps onto five node types and six edges:
`(Actor)-[:CALLS]->(Interface)`, `(Interface)-[:CROSSES]->(Boundary)`, `(Interface)-[:HANDLES]->(DataClass)`, `(Threat)-[:TARGETS]->(Interface)`, `(Control)-[:MITIGATES]->(Threat)`, `(Finding)-[:RECORDS]->(Threat)`. Graph queries such as "every D3 interface crossing an organisation boundary with no mitigating control on a spoofing threat" then replace manual re-review after each design change.

## Accepted risk
An accepted threat needs a named owner, a reason, a review date and, where possible, a detective control. "Later" without those is not acceptance.
