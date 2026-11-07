# If a mesh is justified, how should it carry traffic and what will it cost?

A mesh takes behaviour that every service otherwise re-implements (finding peers, deadlines, retry budgets, workload identity, encryption, per-hop metrics and traces, weighted routing) and moves it into shared infrastructure configured from one place. Daedalus only reaches this file after the readiness score in 05 says "pilot" or "adopt".

## Three words Daedalus uses
- **Control plane**: takes declared intent (routes, authorisation rules, identity settings), normally Kubernetes resources applied through a pipeline, and turns it into concrete settings for every forwarding component. Envoy-based products push those settings over Envoy's discovery APIs (xDS).
- **Forwarding components**: whatever actually moves the bytes and applies the settings: a proxy beside each instance, a shared agent on each node, kernel programs, or a client library.
- **Workload identity**: a short-lived certificate per workload that names it, usually in the SPIFFE format (for example `spiffe://ferry.example/ns/bookings/sa/api`), issued and rotated automatically. Details in 07.

## Four ways to carry the traffic
"Connection level" below means identity, encryption and allow/deny per workload pair (layer 4). "Request level" means decisions per HTTP or gRPC request: paths, headers, retries, weights (layer 7).
| Style | Who does the work | Public examples | Good fit | Costs and limits |
|---|---|---|---|---|
| **Proxy beside every instance (sidecar)** | A proxy container in each pod handles connection- and request-level work | Istio sidecar mode (Envoy); Linkerd (its own Rust proxy) | Long track record; every request-level feature for every workload; strong per-pod isolation | Memory and CPU multiplied by instance count; injection and start-order issues; joining or upgrading means restarting pods |
| **Per-node agent plus optional request-level proxies (ambient)** | A node agent (`ztunnel` in Istio) handles connection-level work; separate "waypoint" proxies add request-level features only for the namespaces or services that ask for them | Istio ambient mode, generally available since Istio 1.24 (November 2024) | Large estates that want encryption and identity everywhere but request-level policy on a few services; no pod restarts to join | Newer way of operating; request-level behaviour depends on where waypoints are placed; a node agent is shared fate for every pod on that node |
| **Kernel-assisted** | eBPF programs handle connection-level work and network policy; a shared per-node Envoy handles request-level features | Cilium | Clusters already using that project as the network plugin; high throughput; one tool for policy and routing | Feature coverage differs from the per-pod proxy products; check each feature's status for the release you run |
| **Inside the application** | A library, or a gRPC client that reads its settings straight from the control plane | gRPC's built-in xDS support; shared resilience libraries | Latency-critical gRPC paths; no extra hop | One implementation per language to keep in step; covers only what that library speaks |

Mixed set-ups are normal: sidecar and ambient pods in one Istio installation, library-configured gRPC clients next to proxied services. Decide on four things: which request-level features most services will really use, the compute budget, how much a restart on upgrade hurts, and what the team already knows how to run.

## One routing language at the edge and inside: GAMMA
GAMMA is the Gateway API sub-project for internal calls. An `HTTPRoute` or `GRPCRoute` whose parent is a Kubernetes `Service`, rather than a `Gateway`, configures calls to that service from inside the cluster. Mesh support reached the standard channel in Gateway API v1.1 (May 2024). Products implement it to different degrees, so read each project's conformance report. The payoff: release tooling (03) and teams write one kind of route for traffic coming in and for calls between workloads.

## Worked sizing: the clinic network
Veterinary clinic network: 35 services, 4 replicas on average, so 140 pods on 12 nodes.
- **Proxy per pod**: 140 extra containers. Assume about 50 MiB each at idle; untuned proxies that receive routing data for every service in the cluster can use several times that. Limit each workload's configuration to the services it actually calls (Istio's `Sidecar` resource, for instance) and memory stays roughly flat as the estate grows.
- **Ambient**: 12 node agents plus waypoints for the 6 services that need request-level routing or authorisation. Roughly ten times fewer components to run and upgrade.
- **People**: in every style someone owns control-plane upgrades (in the documented order and within the supported version skew), the certificate authority and root rotation, and the on-call rota. Cost that before compute or licences.
All figures are illustrative. Measure in your own pilot.

### Quick cost card (MIKA)
| Question | Answer that favours a proxy per pod | Answer that favours ambient or kernel-assisted |
|---|---|---|
| Share of services needing request-level rules | Most | A minority |
| Can pods be restarted freely during upgrades? | Yes | No, or only in maintenance windows |
| Node density (pods per node) | Low | High |
| Team already runs a kernel-assisted network plugin | — | Points to kernel-assisted |
| Need for per-pod isolation of the proxy | High | Moderate |
Three or more answers in one column is a reasonable default; write the rest down as accepted trade-offs in the decision record.

## Benefits worth writing into the decision record
Weighted and header-based routes and request mirroring for releases (03); the same deadline and retry settings in every language; per-request balancing for long-lived HTTP/2 and gRPC connections; fault injection in pre-production; a dependency map without redeploying anything. If none of these appears in the requirements with a named owner, the readiness score in 05 was probably inflated.

## More than one cluster
Multi-cluster set-ups give workloads in different clusters, data centres or clouds one identity and policy model. That helps during the hybrid period of a migration (02) and for regional resilience. They need a shared or federated trust root, control planes that can reach each other (or dedicated cross-network gateways), and a latency budget for every cross-site call. The mesh sits on top of platform networking; it does not replace Kubernetes `NetworkPolicy` or cloud security groups (07).

## How it fails, and what to check first
- It sits on the path of nearly every internal call, so what can break is everything it covers.
- If the control plane is down, running proxies and node agents usually keep their last settings and certificates until those expire; new pods may start with no identity or routes. Find out the certificate lifetime and what happens at expiry during an outage.
- Its configuration changes with every release. Validate it in CI (for example `istioctl analyze`), roll changes out gradually and keep a one-step revert.
- Run the control plane with replicas, monitoring and tightly restricted write access.

## Adoption path that keeps doors open
1. Install in one namespace or domain; turn on identity and metrics only.
2. Turn on encryption in permissive mode, confirm every caller has joined, then switch that scope to strict.
3. Add authorisation rules (default deny plus explicit allows), reviewed by security (07).
4. Add deadlines and retry budgets, and delete the duplicate settings from libraries in the same change.
5. Use it for releases only once steps 1–4 are stable.
Adopting a mesh, and picking which one, is a one-way-door decision: record it (10) with the exit cost written down.

### Ferry operator mini-case
The ferry operator runs 9 services in Go and Kotlin; only the booking and payment calls need header-based canary routes. Cost card: request-level rules for a minority, high node density, standard network plugin. Result: ambient with one waypoint for the bookings namespace; everything else gets identity and encryption only. Exit cost noted: remove the namespace label and the waypoint, then fall back to platform discovery plus library deadlines.
