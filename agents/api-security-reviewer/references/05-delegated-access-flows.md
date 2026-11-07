# Delegated access: checking an OAuth and OpenID Connect deployment

Argus reviews delegated access by asking six fixed questions about the deployment in front of it. Ground truth: RFC 6749 (the OAuth 2.0 framework), **RFC 9700** (OAuth 2.0 Security Best Current Practice, January 2025), RFC 7636 (proof key for code exchange, "PKCE"), OpenID Connect Core 1.0, and the OpenID Foundation's **FAPI 2.0 Security Profile** for high-value APIs. OAuth 2.1 folds much of RFC 9700 into one document but is **still an IETF Internet-Draft**; cite RFC 9700 for requirements and mention 2.1 only as direction.

Words used below: the **issuer** hands out tokens (the OAuth "authorisation server", usually the identity provider), the **API** accepts them, the **app** is the client software, and the **person** is whoever grants access.

## 1. Does each app use a flow that fits it?
Every row where a person is present uses the redirect-based code flow with an `S256` proof key; the table lists what else each app needs.

| App | Person present? | Flow | Must also have |
|---|---|---|---|
| Server-rendered web app | yes | code flow | the app authenticates itself when redeeming the code |
| Browser app | yes | code flow, ideally through a backend-for-frontend that holds the tokens | exact redirect URIs; storage rules in 07 |
| Native mobile or desktop app | yes | code flow through the system browser (RFC 8252) | no embedded secret; claimed HTTPS redirect |
| CLI, TV, kiosk, meter display | yes, on a second device | device grant (RFC 8628) | short user-code lifetime, polling limits |
| Partner or internal workload | no | machine grant ("client credentials") | key-based app authentication (see 04, rung 4) |
| Workload calling onward for a person | yes, upstream | token exchange (RFC 8693) | narrower audience and permissions per hop |
| AI agent acting for a person | yes, at approval time | code flow, under the agent's own registration | narrow permissions, short tokens, revocation the person can see, human approval for destructive actions; never a shared super-token |

Flows that are findings on sight:
- Tokens returned straight in the redirect (the old "implicit" flow). RFC 9700 says it should not be used: tokens leak through browser history, logs and referrers and cannot be bound to a key.
- The app collecting the person's password and trading it for tokens (the "password" grant). RFC 9700 says it must not be used: it trains people to type passwords into apps and bypasses MFA and federation.
- A missing proof key where the app cannot keep a secret, or the `plain` method.

## 2. Does the deployment meet the RFC 9700 baseline?
Every "no" is a finding.
- Proof key on every app. RFC 9700 makes it mandatory where the app cannot keep a secret and recommends it everywhere.
- Redirect URIs compared by exact string match against registered values: no wildcards, no prefix matching, no open redirectors on the app or the issuer (CWE-601).
- Cross-site request forgery on the redirect stopped by PKCE, or by a one-time `state` value bound to the browser session; `nonce` checked when sign-in data is returned.
- Apps that talk to more than one issuer check the `iss` value returned with the code (RFC 9207), so a malicious issuer cannot stand in for the real one.
- Every token restricted to one audience and the minimum permissions; resource indicators (RFC 8707) where several APIs share an issuer.
- Long-lived renewal credentials held by browser or mobile apps are either bound to a key or replaced on every use, with reuse of an old one cancelling the whole chain.
- Nothing secret travels in a URL except the single-use code itself.
- The issuer's sign-in and approval pages refuse to be framed.

## 3. Does the value at stake call for a stronger profile?
For D4 rows, open-banking style access, or any third party touching D3 data at scale, compare with FAPI 2.0 Security Profile:
- **Pushed requests** (PAR, RFC 9126): the app posts its request parameters to the issuer over a back channel and sends only a reference through the browser, so nobody on the way can read or change them.
- **Key-bound access tokens**: DPoP (RFC 9449) or certificate binding (RFC 8705).
- Only apps that can keep a secret, authenticated with keys rather than shared passwords.
- Code flow only, with the protections listed in section 2.
- **Transaction-shaped approval** (rich authorisation requests, RAR, RFC 9396) when the person approves one specific action ("pay €84.20 into the co-op's grid fund") rather than a broad permission. FAPI 2.0 does not demand RAR, but it suits per-transaction approval.

## 4. Do permissions and the approval screen mean something?
- An OAuth scope records what the person let the app do. It is a ceiling, not an entitlement (the intersection rule in `06-authorisation-checks.md`).
- Split read from change and unrelated APIs from each other: `bookings:read`, `bookings:change`, never a catch-all `ferry`.
- Ordinary people can never grant admin powers on an approval screen.
- If a permission cannot be explained in one plain sentence on that screen, it is too broad.
- People can list and withdraw the apps they have approved.

## 5. Is OpenID Connect used only for sign-in?
OpenID Connect adds sign-in on top of OAuth: asking for the `openid` scope returns an ID token that describes the sign-in and is addressed to the **app**.
- Key accounts on issuer plus subject identifier, never on email or username, which change and get recycled.
- Ask for the fewest profile claims the app needs.
- **An API must never accept that sign-in token in place of an access token.** It is addressed to the app and carries no API permissions; finding one in an `Authorization` header is a High finding.
- `acr` and `amr` say how the person signed in and drive step-up decisions (RFC 9470).

## 6. How do company sign-in and migrations fit?
- Company federation usually arrives through a corporate identity provider; brokering it into OpenID Connect at your own identity provider is simpler and safer than teaching every API a second assertion format.
- An existing API with a home-grown scheme and many integrators needs dual running and a dated cut-over; the machine grant is usually the cheapest first step.
- Use a maintained issuer. A self-built one is a High finding unless the team can show conformance results (the OpenID Foundation publishes test suites).
- Open app registration (RFC 7591) needs an approval step or signed software statements; issuer metadata (RFC 8414) is served over TLS from the expected host.

## Typical findings
| Finding | Starting rating |
|---|---|
| Implicit or password flow in use | High |
| Proof key missing where the app cannot keep a secret, or `plain` method | High |
| ID token accepted by an API | High |
| Browser or mobile renewal credentials neither replaced per use nor key-bound | Medium; High at D3+ |
| D4 third-party access without key binding or pushed requests | High |
Confirm with the scoring rule in `11-severity-and-verdict.md`.
