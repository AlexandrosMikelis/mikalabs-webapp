# Using API infrastructure to move toward cloud platforms

## Choose a strategy per workload (the "six Rs")
Based on the widely used Gartner (2010) and AWS (2016) framings. Decide per application or service, not for the whole estate, and record each choice in an ADR.
- **Retain / revisit**: do nothing for now. Legitimate when the return doesn't justify the effort, or when moving would break a latency SLA (each new network boundary adds latency to every call). Still communicate known deadlines (end of life, licence expiry, business unit closure) to consumers as deprecation notices and honour contractual notice periods.
- **Rehost (lift and shift)**: move as is. Good for consolidation or forced exits from a data centre. Check assumptions: cloud networking and storage behave differently from on-premises; specialist systems that assume a local bus, dedicated links or specific disk guarantees can break.
- **Replatform (lift, tinker, shift)**: move with small changes that use managed services, e.g., self-run database → protocol-compatible managed database; new runtime or container base. A frequent sweet spot.
- **Repurchase**: replace with a SaaS product (e.g., email delivery, identity, payments).
- **Refactor / re-architect**: rebuild around cloud-native features, often together with decomposition into services. Most expensive; most beneficial when product–market fit is proven and the current platform limits growth, scale or performance. If re-architecture is already done, replatform first, then change further.
- **Retire**: switch off what nobody uses; large estates almost always have something.

## Start at the edge, then work inward
1. Stand up a new cloud environment and a **duplicate gateway** there; the existing gateway keeps serving production.
2. Prove a small isolated proof of concept entirely in the cloud.
3. Move one service (often a well-bounded, high-value one) and start routing a share of its traffic through the cloud gateway; shift gradually with the release strategies in 06; keep a fast route back.
4. Expand route by route; the gateway gives location transparency, so consumers don't see where a service runs.
Budget time for learning the new platform; cloud design is often a paradigm shift.

## Crossing network boundaries during the hybrid period
- Few routes and one monolith: temporary routing from the new gateway back to the old environment (even simple redirects) can be enough.
- Many cross-network routes, or traffic that must not leave private networks: private connectivity (VPN, peering, private endpoints) or a **multicluster service mesh** spanning on-premises and cloud.
- Measure the added latency and egress cost of each cross-boundary call; chatty interactions split across environments are a common cause of failed migrations. Move tightly interacting services together.
- Cross-network traffic changes the perimeter model → involve InfoSec; security review needed.

## From zonal networks to zero trust (architecture view; security design belongs to a security specialist)
- **Zonal architecture**: segments of decreasing exposure (public zone → public access zone/DMZ → operations zone → restricted zone) with controlled interface points between them. It limits blast radius, but trusts whatever is inside a zone ("castle and moat"). Cloud platforms abstract physical location, and supply-chain or provider-side threats challenge that inner trust.
- **Zero trust**: never trust by network location; verify identity and health of users, services and devices on every request; authorise by policy everywhere; monitor all access. Reference: NIST SP 800-207 (2020).
- **How the platform helps**: the gateway applies a strong challenge to all ingress; the mesh gives workload identity, certificate management and mTLS for internal calls plus uniform telemetry, and models services and flows homogeneously across environments.
- **Mesh is not enough on its own**: a sidecar can't vouch for the platform under it. Add platform network policy (e.g., Kubernetes NetworkPolicy via the CNI) with default-deny ingress and egress, then explicit allows (DNS, each permitted caller → callee, gateway → services). Each mesh route needs a matching network allow; keep them in sync through the paved-path platform.
- Result: micro-segmentation with consistent policy across cloud and former zonal environments; mesh peering across clusters can make on-premises behave like the cloud and ease the remaining moves.
- Exact policies, identity design and threat model → security review.

## API management during migration
- An API manager is a gateway with extra product features: policies (token challenges, validation, rate limiting, throttling), developer portal and catalogue, monetisation and internal chargeback. It sits in the enterprise-gateway category (see 02).
- Its biggest migration value: one stable place to discover and consume APIs while implementations move behind it. You can front a legacy system with an API and publish new extracted APIs alongside, provided contracts stay stable.
- API-first design (model every interaction as a designed API) is what lets you evolve behind this layer and open new uses (partners, internal reuse, "X as a service").
- As the estate becomes hybrid, revisit traffic patterns: the north–south / east–west boundary blurs when internal calls cross clouds and partner networks.

## Migration ADR prompts
- Which R for this workload, and why not the others?
- What latency and cost does each new boundary add, and is it within SLA?
- Which gateway serves which routes during transition; how is traffic shifted and rolled back?
- How do old and new environments reach each other (redirect, private link, multicluster mesh)?
- What is the data migration and consistency plan?
- What security review is needed for the changed perimeter?
- What is the exit criterion for the old environment?
