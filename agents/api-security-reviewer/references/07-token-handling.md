# Are tokens the right shape, fully validated, short-lived and hard to reuse?

Argus checks tokens in the order an API meets them: what kind of token arrives, how it is validated, how long it lives, whether a copy is useful to a thief, how it is withdrawn, and where clients keep it. Ground truth: RFC 7519 (JWT), **RFC 8725** (JWT Best Current Practices), **RFC 9068** (JWT profile for OAuth access tokens), RFC 7662 (introspection), RFC 7009 (revocation), RFC 9449 (DPoP), RFC 8705 (certificate-bound tokens), and the self-contained-token and OAuth chapters of OWASP ASVS 5.0.

## Which token format suits this API?
| Format | Validated by | Strength | Cost | Good fit |
|---|---|---|---|---|
| Opaque reference | introspection call to the AS (RFC 7662), cached briefly | contents stay private; revocation is immediate | a network call and a dependency per request | third-party-facing APIs, D4 operations |
| Signed JWT, RFC 9068 profile | signature check in-process with the AS's published keys | no lookup; scales | anyone holding it can read the claims; revocation waits for expiry | internal APIs and high-volume reads |
| Split: opaque outside, JWT inside | gateway introspects and swaps for an internal JWT (token exchange, RFC 8693) | external leaks reveal nothing; services validate locally | gateway complexity | mixed estates |

Never put secrets or D3 data into a signed JWT: it is signed, not hidden (use an opaque reference or an encrypted JWT instead).

## What must an API check in every JWT?
Use a maintained library; never parse or verify by hand. The list follows RFC 8725 and RFC 9068.
1. **Algorithm** from a server-side allowlist (for example `RS256`, `PS256`, `ES256`, `EdDSA`). Reject `none`. Never let the token header pick the algorithm family (stops the confusion where a public key is used as an HMAC secret; CWE-347).
2. **Key** chosen by `kid` only from the trusted issuer's JWKS. Ignore `jku`, `x5u` and embedded `jwk` headers unless explicitly pinned. Refresh the cached key set on an unknown `kid`, with a rate limit.
3. **Signature** verified before any claim is trusted.
4. **Type**: `typ` is `at+jwt` for access tokens under RFC 9068, or the token is otherwise distinguishable from sign-in tokens and other JWTs from the same issuer.
5. **Issuer**: `iss` equals the expected issuer exactly, per customer organisation if each brings its own.
6. **Audience**: `aud` contains this API's identifier. Without this check, tokens minted for other APIs, or for the app's own sign-in, work here.
7. **Time**: `exp` in the future, `nbf` and `iat` not in the future, clock skew of a minute or two at most.
8. **Permissions**: the operation's scope is present; identity and authorisation claims come only from the verified token.
9. **Binding**: if `cnf` is present, the DPoP proof or client certificate matches it.
10. **Placement**: every service that relies on claims validates them, or accepts traffic only over an authenticated hop from a component that did, with no path around it.

HMAC-signed tokens (`HS256`) let every verifier also mint tokens. Across organisation or team boundaries this is a High finding.

## How long should tokens live?
No standard fixes a number. MIKA's starting points by data class are in `02-data-classes-and-baselines.md` (≤ 30 min at D2, ≤ 15 at D3, ≤ 5–10 at D4). Longer is acceptable only with sender constraint and fast revocation. Long-lived credentials (refresh tokens, keys, certificates) need rotation and a revocation path.

## Is a stolen token useful?
A bearer token works for whoever holds it. Sender-constraining binds it to a key the client holds:
- **DPoP** (RFC 9449): the client signs a short proof per request (method, URI, time, and a hash of the access token); the token's `cnf.jkt` names the key. Works for public clients and browsers.
- **Certificate-bound tokens** (RFC 8705): the token's `cnf` carries the thumbprint of the client's TLS certificate; the API checks it against the mutual TLS connection. Natural for partners and workloads.
Expected at D3 for third parties and at D4 for everyone (02).

## Refreshing and withdrawing access
- Refresh credentials last longer than access tokens and deserve password-grade care.
- Public clients: rotate the refresh credential on every use and treat reuse of an old one as theft (revoke the family), or sender-constrain it (RFC 9700).
- Set absolute and idle lifetimes; revoke on sign-out, password change, account disablement and consent withdrawal (RFC 7009 endpoint).
- Revoking a refresh credential does not recall access tokens already issued; their lifetime is the exposure window.
- Emergency options for JWTs: a short deny-list keyed on `jti`, introspection for D4 operations, or rotating the signing key. For routine rotation, publish the next key before signing with it and keep the old one until its tokens expire.

## Where do clients keep tokens?
- **Browser apps**: prefer a backend-for-frontend that holds tokens server-side and gives the browser an `HttpOnly`, `Secure`, `SameSite` session cookie, plus CSRF defence. The IETF guidance for browser-based apps is still an Internet-Draft; its direction is the same. If tokens must live in the browser, keep them in memory, short-lived and DPoP-bound, and treat any XSS as token theft.
- **Mobile**: platform secure storage (Keychain, Android Keystore) for refresh credentials; sign-in through the system browser.
- Anywhere: send in the `Authorization` header over TLS only, never in a URL; log the token ID or a hash, never the token (CWE-532).

## Typical findings
| Finding | Starting rating |
|---|---|
| Signature not verified, `none` accepted, or algorithm from the header | Critical |
| `aud` or `iss` not checked | High |
| Sign-in (ID) tokens accepted at the API | High |
| One HMAC secret shared by many services or partners | High |
| Bearer tokens valid for days at D2+ with no sender constraint | High; Medium if internal and D1 |
| D3 claims in a readable signed JWT | Medium; High for special-category data |
| Tokens in query strings or full tokens in logs | Medium–High |
| No signing-key rotation plan | Medium |
Confirm with the scoring rule in `11-severity-and-verdict.md`.
