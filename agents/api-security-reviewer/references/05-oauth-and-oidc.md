# OAuth 2.x and OpenID Connect

## What OAuth is (and isn't)
OAuth 2.0 (RFC 6749, 2012) is a **delegated authorisation framework**: a user (resource owner) lets an application (client) access their resources on an API (resource server) without giving the client their password, via tokens issued by an authorization server. It is the de facto standard for API access and covers both user-delegated and machine-to-machine cases. **OAuth does not tell the client who the user is** — that is OpenID Connect.

## Roles
- **Resource owner** — the entity that can grant access (an end user, when a person).
- **Client** — the application calling the API on the owner's behalf or its own. **Confidential** clients can keep a secret (server-side apps); **public** clients can't (SPAs, mobile and desktop apps, CLIs).
- **Authorization server (AS)** — authenticates the owner, obtains consent, issues tokens. Has an **authorization endpoint** (user-facing) and a **token endpoint** (client-facing). Most identity providers are ASs.
- **Resource server (RS)** — hosts the protected API and validates tokens. Can be a single service or a gateway fronting many services.

Grant independence: the RS doesn't care how a client obtained a token, only that it is valid for this RS and these permissions. That's why different grants exist for different client environments.

## Grants — what to use (OAuth 2.1 direction; general knowledge where beyond 2.0)
| Situation | Use | Notes |
|---|---|---|
| Any client with a user present (web, SPA, mobile, desktop) | **Authorization code + PKCE** | PKCE for **all** clients, including confidential ones (OAuth 2.1, RFC 9700 BCP). Exact redirect-URI matching. `state` or PKCE against CSRF; `nonce` with OIDC. |
| Machine-to-machine, no user | **Client credentials** | Access pre-arranged per client. No refresh tokens — request a new access token. Prefer `private_key_jwt` or mTLS client auth over shared secrets. |
| Input-constrained device (TV, CLI, IoT) | **Device authorization grant** (RFC 8628) | Rate-limit polling; short user-code lifetime. |
| Exchanging a token for a downstream call | **Token exchange** (RFC 8693) | For delegation/impersonation chains in microservices; narrow audience and scope at each hop. |
| SPAs (legacy) | ~~Implicit grant~~ | **Removed** in OAuth 2.1. Tokens in the URL fragment leak. Migrate to code + PKCE, ideally with a backend-for-frontend (BFF). |
| Apps collecting the user's password | ~~Resource owner password credentials (ROPC)~~ | **Removed** in OAuth 2.1. Teaches users to type passwords into clients; defeats MFA and federation. |

### Authorization code flow (shape)
Client redirects the browser to the AS with client ID, requested scopes, redirect URI and (with PKCE) a `code_challenge` → user authenticates and consents at the AS → AS redirects back with a short-lived, single-use **authorization code** → client exchanges the code at the token endpoint (confidential clients also authenticate; with PKCE the client sends the `code_verifier`) → AS returns access token (+ refresh token, + ID token with OIDC).

### PKCE
The client creates a random **code verifier**, sends its SHA-256 hash (**code challenge**, method `S256`; never `plain`) with the authorization request, and the verifier with the code exchange. The AS checks they match, so an intercepted authorization code is useless to anyone else.

## Refresh tokens
- Let clients get new short-lived access tokens without re-prompting the user. They are long-lived credentials: protect them like passwords.
- Public clients: **rotate** refresh tokens on each use and treat reuse of an old one as theft (revoke the whole token family), or sender-constrain them.
- Revoking a refresh token doesn't kill already-issued access tokens; the access-token lifetime is the exposure window — keep it short.
- Bound refresh-token lifetime (absolute and idle) and revoke on logout, password change and account disable.

## Sender-constrained tokens (general knowledge)
Bearer tokens work for whoever holds them. For high-value APIs, bind tokens to a key: **mTLS-bound tokens** (RFC 8705) or **DPoP** (RFC 9449, proof-of-possession at the application layer, suits public clients). Financial-grade profiles (FAPI 2.0) require this plus **PAR** (RFC 9126, pushed authorization requests).

## Scopes
- Scopes express what the **user consented to let the client do** (e.g., `invoices:read`, `invoices:write`). Coarse-grained; there's no standard naming. They must be understandable on a consent screen.
- Split read and write; separate unrelated APIs into separate scopes; keep admin functions out of user-grantable scopes.
- A scope is a ceiling, not an entitlement: effective permission = scopes granted to the client ∩ what the user is actually allowed to do ∩ object-level rules. Scopes never replace object-level checks (`07-authorization.md`).
- Gateways commonly reject requests lacking the scope for a route; services still enforce fine-grained rules.
- Use **audience** (`aud`) / resource indicators (RFC 8707) so a token minted for one API can't be replayed against another.

## OpenID Connect (OIDC)
- Identity layer on top of OAuth: the AS also acts as an **OpenID Provider**. Requesting the `openid` scope returns an **ID token** — a JWT about the authentication event and the user, for the **client** to consume.
- The stable user identifier is `sub` (unique per issuer, never reassigned). Don't key accounts on email or username; they change and can be recycled.
- Extra standard scopes (`profile`, `email`, `address`, `phone`) add claims. Request only what the client needs (data minimisation).
- OIDC flows: use the **authorization code flow** (with PKCE); avoid implicit and hybrid flows for new builds.
- **Never accept an ID token as an access token.** Its audience is the client, not your API; it's not meant to carry API permissions. APIs accept access tokens only.
- Use a mature identity provider; don't build your own identity layer or AS.

## SAML 2.0
Common in enterprise SSO; not designed for API calls. The SAML 2.0 bearer assertion profile for OAuth (RFC 7522) lets a client trade a SAML assertion for an access token — useful during migration.

## Choosing and migrating
- Support only the grants you need; add more when a real client type requires it. Client credentials is often the easiest first step into OAuth for an existing API.
- Existing non-standard schemes with many customers: plan a migration path (dual support, deadlines) rather than a hard cut-over; third parties generally prefer the standard.

## Review checklist
- Implicit or ROPC in use? Any public client without PKCE? `plain` PKCE method?
- Redirect URIs exact-match registered values (no wildcards, no open redirects)?
- Client authentication method for confidential clients; secrets rotated?
- Access token lifetime; refresh rotation and reuse detection; revocation on account events?
- `aud` set and checked; scopes least-privilege; admin not consentable by users?
- ID tokens used anywhere as API credentials?
- Tokens stored in browser `localStorage`? (Prefer a BFF with HttpOnly, Secure, SameSite cookies.)
