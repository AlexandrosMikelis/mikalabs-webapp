# Where is identity checked, and what goes to a security specialist?

Daedalus is not a security designer. It places trust checks in the architecture, makes sure each one has an owner and a failure mode, and hands the design of policies, threat models and identity flows to a security specialist under SECURITY REVIEW NEEDED. This file is the architecture view only.

## Public models Daedalus uses
- **NIST SP 800-207 (2020), zero trust**: no implicit trust from network location; every access to a resource is authenticated and authorised per session by policy; all communication is secured wherever it runs; asset and workload state feed the decision; everything is monitored. Its logical components are a policy decision point (policy engine plus policy administrator) and policy enforcement points in front of resources.
- **NIST SP 800-207A (2023)**: applies those ideas to cloud-native applications across multiple locations. It describes policies at two tiers: an **identity tier** (which workload, acting for which user, may call which service, enforced by gateways and service proxies) and a **network tier** (which network segments may talk, enforced by firewalls, security groups and network policy). It treats the service mesh as one way to implement identity-tier enforcement.
- **SPIFFE and SPIRE** (CNCF graduated projects): SPIFFE standardises workload identity (a SPIFFE ID URI, carried in an X.509 or JWT "SVID") and a Workload API for obtaining it; SPIRE is the reference implementation that attests workloads (by node and process properties) before issuing identities. Several meshes issue SPIFFE-formatted identities; SPIRE can also serve workloads outside any mesh (VMs, batch jobs).

## Mapping the models onto control points
| Zero-trust role | Typical component in this architecture |
|---|---|
| Policy enforcement point for outside callers | Entry gateway (token validation, consumer quotas, request limits) |
| Policy enforcement point for workload calls | Per-pod proxy, node agent or service library (mutual TLS, authorisation policy) |
| Network-tier enforcement underneath | Kubernetes NetworkPolicy via the CNI, cloud security groups, firewalls |
| Policy decision point | Identity provider for users and consumers; the mesh control plane or a policy engine (e.g., OPA) for workloads |
| Identity issuance | Identity provider (users, partners); SPIRE or the mesh CA (workloads) |
| Monitoring | Access logs and traces from every enforcement point into one place |

## MIKA's trust placement check
For each row of the call ledger (01), answer five questions. A "no" or "unknown" is a finding, and the design of the fix is a security hand-off.
1. **Who is the caller, cryptographically?** End user or consumer token at the entry point; workload identity (certificate) for internal calls. A shared API key across partners or an IP allow-list as the only identity is a gap.
2. **Where is the decision made, and is it made on every call?** Not only at the perimeter.
3. **Is there a second, independent layer?** Identity-tier policy over a network-tier default deny. A per-pod proxy cannot vouch for the node it runs on; network policy cannot tell two workloads on the same allowed port apart. Use both.
4. **What happens when the checker fails?** Fail open or fail closed, chosen deliberately per path (a public timetable page and a prescription refill differ) and documented.
5. **What identity travels downstream?** Forwarding the end user's token lets every downstream service act as that user. Exchanging it for a narrower token, or passing verified claims, are alternatives; which one is a security decision.

## Keeping the two tiers in step
Default deny at both tiers, explicit allows at both, generated from one source of truth (the service catalogue or the knowledge graph in 01) so a new route can never be half-open: allowed by identity policy but blocked by the network, or the reverse. Outbound calls to third parties deserve the same treatment as inbound ones. Certificates come from a managed authority with short lifetimes and automatic rotation; hand-managed certificates are the certificate cliff smell (08).

## Hybrid and migration periods
A move between data centre and cloud changes the perimeter: segments that trusted everything inside them meet an estate where location means little. Extend workload identity across both environments (shared or federated trust domain) before internal calls cross; treat private connectivity as a network-tier control, not as proof of identity; list every new path in SECURITY REVIEW NEEDED with its caller, target and data classification.

## Worked mini-example: veterinary clinic network
Lab-results service receives results from three external laboratories and serves them to clinic staff.
- Laboratories call through the entry gateway, each with its own credential (not one shared key); the gateway enforces per-lab quotas and payload size.
- The results service calls the patient-records service; both carry short-lived workload certificates from the mesh CA; an authorisation policy allows only `lab-results` and `clinic-portal` to call `patient-records` on the read paths.
- Namespace network policy denies all by default; allows mirror the authorisation policy.
- Failure mode: if token validation at the gateway errors, calls are refused (fail closed); the clinic portal shows a "results delayed" banner rather than stale data.
- Security hand-off list: laboratory credential lifecycle; claims passed from portal to records; retention of results in logs; threat model for the partner connection.

## Always hand off, never design
Authentication protocols and token formats, authorisation models and policy content, key and certificate authority design, threat modelling, WAF rules, data classification and privacy, credential forwarding and token exchange. Daedalus names where these sit and why they matter, then lists them under SECURITY REVIEW NEEDED.
