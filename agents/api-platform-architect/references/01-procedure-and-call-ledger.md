# Daedalus' working procedure and the call ledger

Daedalus works **change-first**. Most requests arrive because something is about to move: a service carved out, a platform replaced, a version going live, a data centre closing. So the procedure starts from the change and its destination, then asks how it reaches users safely and how anyone will know it worked, and only then which control points should carry it. Tools come last: they are the most tempting place to start and the most expensive place to be wrong.

## The eight steps
| # | Step | Question it answers | Reference |
|---|---|---|---|
| 1 | Intake and call ledger | What exists, who calls whom, who owns each hop? | this file |
| 2 | Destination and route | Where is the system heading, and by which reversible steps? | 02 |
| 3 | Release plan | How does each step reach users, and how is it undone? | 03 |
| 4 | Signals and gates | What evidence says a step worked, and who stops it if not? | 04 |
| 5 | Control points | Which component enforces routing and policy on each row of the ledger? | 05, 06 |
| 6 | Trust boundaries | Where is identity checked, and what goes to a security specialist? | 07 |
| 7 | Smell sweep | Which known platform smells are present? | 08 |
| 8 | Score and report | How severe is each finding; what is the verdict; which decisions need a record? | 09, 10 |

In `review` mode run all eight and report only what matters. In `plan` mode steps 2–4 are the body of the output and steps 5–7 supply each step's decision records. In `ask` mode jump to the step the question belongs to.

## Step 1a: facts to collect (or assume and flag)
- What the system does, for whom, and what an hour of downtime costs.
- Consumers: browsers, mobile apps, partners, devices, batch jobs, other internal teams.
- Volume: normal and peak requests per second; seasonal peaks (ferry timetables in summer, energy readings at month end, clinic bookings on Monday mornings).
- Runtime: Kubernetes, VMs, serverless, on-premises, one or several clouds.
- Protocols: HTTP/1.1, HTTP/2, gRPC, GraphQL, WebSockets, message brokers.
- Services and languages, and which team owns each.
- What sits in front of the services today, and what services use to reach each other.
- Deployment and release process; who can roll back and how fast.
- Telemetry in place; published SLOs; regulatory or data-residency constraints.
- The proposed change and the business reason behind it.

Agent callers cannot answer follow-up questions. Assume, label the assumption, keep going, and list only the questions whose answers would change a severity or a step.

## Step 1b: build the call ledger
The call ledger is MIKA's intake artefact. One row per distinct kind of call, not per endpoint. It replaces a single "traffic diagram" with something a reviewer can reason over line by line.

| Column | Values |
|---|---|
| Caller | named consumer or workload |
| Target | service, function, data store or third party |
| Caller trust | **A** anonymous · **C** authenticated consumer (person or app) · **P** partner organisation · **W** own workload |
| Contract kind | **Product** (published, versioned, documented for outsiders) · **Shared** (used by several internal teams) · **Private** (one caller, same team) |
| Boundary crossed | none · namespace/cluster · network or data centre · cloud provider · organisation |
| Current control point | none · platform service discovery · load balancer or reverse proxy · gateway · library · mesh sidecar or node agent |
| Hop owner | team on call for that hop |
| Redundant? | yes / no / unknown |

### Reading the ledger
- **Rows with caller trust A, C or P and contract kind Product** need a component that knows about consumers: keys or tokens per consumer, quotas, published versions. That points to a gateway (see 05).
- **Rows with caller trust W** need workload identity, consistent timeouts and service discovery. That points to platform DNS, libraries or a mesh, never to the public entry point.
- **Rows that cross a network, cloud or organisation boundary** carry latency, egress cost and a perimeter change. Price them (see 02) and flag them for security review (see 07).
- **Rows with no hop owner or no redundancy** are findings on their own, usually High if the hop is on the critical path.
- **A W row whose current control point is the public gateway** is the hairpin route smell (see 08).
- **Two rows that configure retries on the same path** are the retry echo smell (see 08).

Common shorthand sorts rows into two families, calls entering the system and calls between your own workloads. The split is a useful label, but trust, contract kind and boundary say more: a partner call over a private link and an internal call that crosses two clouds fit neither family cleanly.

## Worked mini-example: regional ferry operator
| Caller | Target | Trust | Contract | Boundary | Control point | Owner | Redundant |
|---|---|---|---|---|---|---|---|
| Booking app (mobile) | Bookings API | C | Product | network | NGINX reverse proxy | Web team | yes |
| Travel-agent partners | Fares API | P | Product | organisation | same NGINX, shared key | Web team | yes |
| Bookings service | Timetable service | W | Shared | none | public hostname via NGINX | nobody | n/a |
| Port check-in kiosks | Check-in service | C | Private | network | direct to VM IP | Port IT | no |
| Vessel telemetry | Telemetry ingest | W | Private | network (satellite) | MQTT broker | Fleet team | unknown |

Immediate observations: the Bookings → Timetable row is a hairpin route with no owner; partners share one key, so no per-partner quota or revocation exists (security hand-off); kiosks bypass every control point and have no redundancy. None of this needs a mesh yet.

## Knowledge-graph view (for orchestrators)
The ledger maps naturally onto a small graph that other MIKA agents can query:
- Nodes: `Consumer`, `Workload`, `Route`, `ControlPoint`, `Boundary`, `Team`, `Policy`, `Release`, `Signal`, `Decision`.
- Edges: `Consumer -CALLS-> Route`, `Route -ENFORCED_BY-> ControlPoint`, `Route -CROSSES-> Boundary`, `ControlPoint -OWNED_BY-> Team`, `Release -SHIFTS-> Route`, `Release -GATED_BY-> Signal`, `Decision -GOVERNS-> ControlPoint`.
- Useful queries: control points with no owner; routes that cross a boundary with no policy; releases with no gating signal; workloads reached only through a public route.

When the caller asks for structured output, the `traffic_map` field summarises the ledger, with one key for each of the two families above.
