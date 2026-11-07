# Step 5 — How does every request know whose it is?

Use for the IDENTITY & ROUTING field in `design` and the identity lens in `review`. OAuth flow detail, token validation rules and API security depth → **Argus**.

Grounding: OpenID Connect Core 1.0, RFC 9068 (JWT profile for OAuth 2.0 access tokens), RFC 9700 (OAuth 2.0 Security Best Current Practice), RFC 8693 (token exchange), SAML 2.0, SCIM 2.0 (RFC 7643 and RFC 7644), W3C Trace Context and Baggage, Azure Architecture Center "Map requests to tenants", Google Cloud Identity Platform multitenancy docs, and MIKA's rules below.

## The rule
The customer a request acts for is **established once, from a verified credential**, and then carried as trusted context to every hop. It is never read from something the caller can set: a body field, a query parameter, a path segment or a custom header from the client.

AWS's SaaS Lens calls this carried value tenant context. Whatever the name, it is used for routing, data access, isolation policies, logs, metrics and metering.

## Where the customer reference lives in the token
- The identity provider issues an access token (usually a JWT per RFC 9068) with a claim such as `tenant_ref`, plus, where useful, the plan and a role scoped to that customer.
- Claims are set from the catalog: at user creation, or at issuance by a token hook (Amazon Cognito pre-token-generation trigger, Auth0 Actions, Microsoft Entra custom claims providers, Keycloak protocol mappers). Features vary by product and version; check current docs.
- Services take the reference from the **validated** token: signature, issuer, audience, expiry. Detail → **Argus**.
- If a gateway validates and forwards claims as headers, services accept those headers only from the gateway: strip inbound copies at the edge and use mTLS or a private network between gateway and services.

### What to put in claims
| Put in | Keep out |
|---|---|
| customer reference, role in that customer, plan (if used for routing or throttling), stamp hint | feature lists, quotas, preferences (go stale, bloat every call) |
| | personal or sensitive data (JWT payloads are readable by the holder) |

Plan or stamp in a claim goes stale after a plan change or relocation. Keep access tokens short-lived (minutes) and force refresh on `tenant.plan_changed` and `tenant.relocated`.

### Avoid a lookup on every call
A design where the identity provider knows nothing about customers, and each service calls a "which customer is this user in?" service, adds latency and a shared point of failure to every request and spreads resolution logic across teams. Prefer the claim. If a lookup cannot be avoided, do it once at the edge and pass a signed context downstream (for example a short-lived internal token minted by RFC 8693 token exchange).

### Propagating context between services
- Synchronous calls: forward the original access token, or exchange it for a narrower internal token (RFC 8693) with the customer reference and a reduced audience.
- Asynchronous messages: put the customer reference in the message envelope (a CloudEvents extension attribute) **and** make the consumer verify it against the resource it touches. For high-risk flows, sign the envelope.
- W3C Baggage is useful to carry the reference for telemetry, but it is not authenticated. Never authorise from baggage.

## Organising customers in the identity provider
| Structure | Fits | Watch |
|---|---|---|
| One shared directory, customer as attribute or group | many small customers, one sign-in page | per-customer password, MFA and branding rules are harder |
| Organisations feature (Auth0 Organizations, Keycloak Organizations, Google Cloud Identity Platform tenants) | B2B products; per-customer members, roles, federation | feature limits and pricing differ by vendor |
| Directory or user pool per customer | strict separation, per-customer policies | provider limits on count; more provisioning; sign-in must pick the right one |

Many products use a shared directory for small plans and organisations or dedicated directories for enterprise plans. Keep the issued token's shape identical across all three, so services never care.

### Enterprise single sign-on
Large customers want their staff to sign in with their own identity provider (OIDC or SAML 2.0). Your identity layer brokers: their provider authenticates; yours issues the product token with your customer reference.
- Match a federated user to a customer by the connection they arrived through, never by a customer identifier asserted by the external provider.
- Just-in-time user creation for first sign-in; SCIM 2.0 provisioning and, above all, **deprovisioning** so leavers lose access the same day.
- Verify domain ownership before allowing domain-based routing to a connection (DNS TXT record).

### People in several customers
A locum vet working for three clinic groups, a GridShare auditor serving five co-ops. Use one identity with several memberships and a customer switcher that issues a token for **one** customer at a time. A token valid across customers at once is a high-risk design: accept it only for a real cross-customer feature, with its own review.

## Before sign-in: how does the app know which customer?
| Entry | How | Trade-offs |
|---|---|---|
| Subdomain or custom domain per customer | `northvale.vetflow.example` | customer known from the host; easy routing to the right identity connection or stamp; certificate automation (ACME) and domain verification needed |
| Single domain with discovery | `app.vetflow.example`, user enters email, app finds the connection | simple DNS; extra step; must not reveal which customers or emails exist |
| Customer in the path | `vetflow.example/northvale/...` | simple; only ever a hint |

Whatever the entry, the host or path is a **hint** for picking the identity connection and stamp. After sign-in the token claim is the authority, and a mismatch between hint and claim is rejected. Keep the discovery step thin and then hand over to a standard authorisation-code flow with PKCE; never proxy credentials through your own code.

## Sending each request to the right place
Once the customer is known, route to the shared deployment, the right stamp, or a dedicated stack.
- **Where**: DNS (customer hostname resolves to its stamp), a global gateway or load balancer reading a stamp claim, or a small routing service backed by a cached copy of the catalog.
- **Placement source**: a claim (fast, stale after a move) or a cached catalog lookup (current, adds a dependency). A common blend: claim for region and stamp, lookup for per-component placement inside the stamp.
- **Moves**: routing must follow relocations (`04`) with no new identifiers and no broken links.
- **Platform examples**: API gateway authorisers that return the customer context and a scoped policy; Kubernetes Gateway API routes by hostname or by a header the gateway itself injects after authentication; a DNS-based or anycast router in front of stamps. Keep the stamp router boring: it is shared by every customer.

## Output of this step
```
IDENTITY & ROUTING
  IdP: <product>; structure: <shared directory | organisations | directory per customer>
  Claims: tenant_ref, <role>, <plan>, <stamp hint>; set at <creation | issuance hook>
  Federation: <OIDC/SAML per enterprise customer; matching by connection; SCIM deprovisioning>
  Operators: <workforce identity, MFA, just-in-time elevation, audit>
  Entry: <host per customer | discovery>; hint checked against claim
  Propagation: <token forwarding / exchange; message envelopes; no auth from baggage>
  Routing: <DNS | gateway | router>; placement from <claim | cached catalog>; follows relocations
```

## Review checks
- Does every service take the customer reference from a validated token or a gateway-only header?
- Is any client-settable value treated as the authority?
- Are claims small and stable, with forced refresh on plan change and relocation?
- Is there a per-request lookup service on the hot path?
- Are federated users matched by connection, with SCIM deprovisioning?
- Do asynchronous consumers verify the customer reference against the resource?

## Worked mini-example — HarbourLine
Shared directory for small operators; an organisation per large operator with OIDC federation to its corporate identity provider. Access tokens (10 minutes) carry `tenant_ref`, `role` and `stamp`. Crew and booking staff arrive at `{operator}.harbourline.example`; the edge picks the identity connection and stamp from the host. After sign-in the gateway rejects tokens whose `tenant_ref` does not match the host, strips any client-sent identity headers, and forwards verified context over mTLS. Manifest events carry the operator reference in a CloudEvents extension; the manifest consumer checks it against the sailing record before writing.
