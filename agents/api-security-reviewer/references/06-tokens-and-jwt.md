# Tokens and JWT validation

## JWT basics
- A **JSON Web Token** (RFC 7519) is a compact set of **claims** (name/value pairs), the de facto access-token format for OAuth and the required ID-token format for OIDC.
- Registered claims: `iss` (issuer), `sub` (subject — the user, or the client itself in client-credentials tokens), `aud` (intended recipient), `exp` (expiry), `nbf` (not before), `iat` (issued at), `jti` (unique token ID). Common extras: `scope`, `client_id`, `azp`, `amr`/`acr` (how the user authenticated), tenant or role claims.
- **JWS** (signed) gives integrity: anyone holding the token can **read** it, but changes break the signature. **JWE** (encrypted) also hides the contents. "JWT" usually means JWS.
- Signing: issuer signs with a private key (RS256, PS256, ES256, EdDSA); receivers verify with the public key, usually fetched from the issuer's **JWKS** endpoint. HMAC (HS256) uses a shared secret — every verifier can also mint tokens, so avoid it across trust boundaries.
- **Don't put secrets or sensitive personal data in a JWS.** Use opaque tokens or JWE if contents must stay private.

## Validation checklist for a resource server (RFC 8725 best practice; general knowledge)
1. **Algorithm allowlist**: accept only the algorithms you expect, configured server-side. Reject `alg: none`. Never let the token's header choose the algorithm family (prevents RS/HS confusion, where a public key is misused as an HMAC secret).
2. **Key selection**: resolve `kid` only against keys from the trusted issuer's JWKS; ignore embedded `jwk`/`jku`/`x5u` header URLs unless explicitly pinned. Cache JWKS with refresh on unknown `kid`, with rate limits.
3. **Signature**: verify before trusting any claim.
4. **Issuer**: `iss` exactly equals the expected issuer (per tenant if multi-tenant; don't accept "any issuer from this IdP").
5. **Audience**: `aud` contains this API's identifier. Missing `aud` check = tokens for other APIs (or ID tokens) work here.
6. **Time**: `exp` in the future, `nbf`/`iat` not in the future, small clock-skew allowance (≤ a few minutes).
7. **Token type**: distinguish access tokens from ID tokens and other JWTs (`typ: at+jwt` per RFC 9068, or distinct audiences/claims). Never accept ID tokens at an API.
8. **Scope/claims**: required scope for the operation present; authorisation claims come only from the verified token, never from separate client-supplied headers.
9. **Sender constraint** (if used): `cnf` claim matches the mTLS certificate or DPoP proof.
10. **Libraries**: use a maintained library; don't parse or verify by hand. Validate **in every service that relies on claims**, or ensure services only accept traffic from a gateway that validated (and strips/re-signs) — and that the bypass path doesn't exist.

## Lifetimes and revocation
- Short-lived access tokens limit damage from theft. No official standard; common practice is 5–60 minutes for access tokens. Long-lived credentials (refresh tokens, API keys, certificates) need rotation and revocation.
- Self-contained JWTs can't be revoked individually without extra machinery. Options: short lifetime + refresh revocation; a deny-list keyed by `jti` for emergencies; introspection for high-risk operations.
- Signing-key rotation: publish new keys in JWKS before use, keep old keys until all tokens signed with them expire, have an emergency rotation runbook.

## Token handling
- Send as `Authorization: Bearer …` over TLS only. Never in URLs, never logged in full (log `jti` or a hash).
- Browser apps: prefer a **backend-for-frontend** that keeps tokens server-side and gives the browser an HttpOnly, Secure, SameSite cookie; if tokens must live in the browser, keep them in memory, short-lived, and treat XSS as token theft.
- Mobile: system browser for login (not embedded web views), platform secure storage for refresh tokens.
- Gateways that translate external tokens into internal ones (token exchange, "phantom token" pattern) reduce what internal services trust and what leaks if a token is stolen externally.

## Common token findings
| Finding | Typical rating |
|---|---|
| Signature not verified, `alg: none` accepted, or algorithm taken from header | Critical |
| `aud` or `iss` not checked | High |
| ID tokens accepted as API credentials | High |
| HS256 shared secret used by many services or third parties | High |
| Access tokens valid for days or longer, no sender constraint | High (Medium if internal-only and low impact) |
| Sensitive personal data in JWS claims | Medium (High for special-category data) |
| Tokens logged in full / passed in query strings | Medium–High |
| No key-rotation plan | Medium |
