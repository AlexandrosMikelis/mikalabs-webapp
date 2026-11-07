# Argus' review procedure and the exposure sheet

Argus reviews **data-first**. An API is worth attacking because of what it lets someone read, change or trigger, so the procedure starts by naming the data and actions at stake, then follows each call inward from the least-trusted caller, checking one question at a time. The same nine steps serve `threat-model` (a design) and `review` (a spec, config, code excerpt or auth setup); `review` spends less time drawing the system and more time reading concrete settings.

## The nine steps
| # | Step | Question it answers | Reference |
|---|---|---|---|
| 1 | Scope and data classes | What is at stake, for whom, and how sensitive is it? | this file, 02 |
| 2 | Trust boundaries | Where does trust change, and what crosses each line? | 03 |
| 3 | Authentication | How does each caller prove who it is, and who it acts for? | 04, 05 |
| 4 | Authorisation | Is every function, object and property checked on every call? | 06 |
| 5 | Token handling | Are tokens the right shape, validated fully, short-lived and hard to reuse? | 07 |
| 6 | Input and resource limits | Can input corrupt the service, or volume and cost exhaust it? | 08 |
| 7 | Transport and service identity | Are hops encrypted, and does each workload know who is calling it? | 09 |
| 8 | Secrets, logging, monitoring | Are credentials kept safe, and would abuse be noticed and attributable? | 10 |
| 9 | Score and verdict | How severe is each finding, and may this ship? | 11 |

In `ask` mode, jump to the step the question belongs to and answer from there.

## Step 1a: facts to collect (or assume and flag)
- What the API does and which actions have real-world effect (money, safety, access changes).
- Data handled, classified with the MIKA data classes in `02-data-classes-and-baselines.md`.
- Consumers: own web or mobile app, partner systems, third-party developers, devices, internal workloads, AI agents.
- Exposure: public internet, partner network, private network only.
- Identity provider, client types, flows in use, token format and lifetime.
- What sits in front (CDN, WAF, gateway) and between services (sidecar proxies, network rules, cloud IAM).
- Whether several customer organisations share the same deployment.
- Jurisdiction and sector, for compliance flags only (GDPR, PCI DSS, PSD2, HIPAA, NIS2). Flag; never conclude.

Agent callers cannot answer follow-up questions. Assume, label the assumption, continue, and list only those open questions whose answers would move a severity.

## Step 1b: fill in the exposure sheet
The exposure sheet is MIKA's intake artefact: one row per **kind of call**, not per endpoint. Every later step reads from it, and every finding points back to a row.

| Column | Values |
|---|---|
| Interface | route group, operation set, topic or webhook |
| Caller kind | **A** anonymous · **U** person via own app · **T** person via third-party app · **P** partner system acting for itself · **W** own workload · **G** AI agent or tool runner |
| Highest data class | D0–D4 (see 02) |
| Effect | read · write · trigger (side effect outside the system) |
| Boundary crossed | none · namespace · network · cloud account · organisation |
| Credential presented | none · API key · session cookie · bearer token · sender-constrained token · client certificate · signed payload |
| Where checked | client · gateway · service · identity provider · proxy layer · platform |

Worked row (veterinary clinic network):

| Interface | Caller | Class | Effect | Boundary | Credential | Checked at |
|---|---|---|---|---|---|---|
| `GET /pets/{id}/records` | U (owner app) | D3 | read | organisation | bearer JWT | gateway (scope) · service (owner check?) |

The question mark is the review: the gateway can confirm the scope, only the records service can confirm that this owner owns this pet.

## Step 1c: write the objectives
Two to five sentences in business terms, taken from the caller if given. Examples:
- No pet owner can read another owner's records, and no clinic can read another clinic's.
- A ferry booking can only be changed by the booker or an authorised agent, and every change is attributable.
- Payouts from the energy co-op can only be initiated by two distinct, strongly authenticated people.
- Timetable lookups stay available during a booking rush.
