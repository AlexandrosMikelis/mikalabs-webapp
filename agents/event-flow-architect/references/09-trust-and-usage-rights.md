# 09 · Trust across the boundary

Producers publish only if they trust who receives their events and what is done with them; consumers act only if they trust where an event came from. At boundary grade B2 and above (`01`), trust usually decides whether an integration happens at all. MIKA checks five trust properties, in this order.

## T1 · Who is on each end? (identity)
- Every producer, consumer and intermediary has its **own credential** — never a shared account across parties.
- Options: mutual TLS with X.509 certificates; OAuth 2.0 client credentials (RFC 6749), ideally with certificate-bound tokens (RFC 8705); signed JWTs for brokers that support them; per-device credentials for MQTT fleets.
- Protect **subscription set-up** as carefully as delivery: registering a webhook URL or a subscription is an action an attacker would love to perform. Verify callback ownership (a challenge request) before sending real events.
- For deep security review of the authentication and token design, hand over to `api-security-reviewer`.

## T2 · Who may receive what, and can it be withdrawn? (authorisation)
- Authorise **per channel and per event type**, not per broker.
- Partners get **partner-scoped channels or filtered deliveries**, not read access to internal topics.
- Withdrawing access must take effect promptly and be tested: deleting a credential, removing a subscription, rotating a signing key. Write the expected time-to-effect into the contract.
- Fan-out to many consumers (`1→N`) multiplies entitlements; signal events with authorised fetch keep sensitive detail behind a per-request check.

## T3 · Can the receiver verify origin and integrity? (signing and lineage)
- **Sign deliveries**. For webhooks, follow the Standard Webhooks conventions (`webhook-id`, `webhook-timestamp`, `webhook-signature` over id + timestamp + body) or RFC 9421 HTTP Message Signatures. Receivers reject stale timestamps to block replays and compare signatures in constant time.
- For events that pass through several intermediaries, sign the **content** at the source (JWS, RFC 7515, or COSE, RFC 9052) so integrity survives re-routing. Transport security alone protects one hop.
- **Lineage**: keep `source` and `id` unchanged end to end; when a processing stage derives a new event, record the input event IDs it used (an attribute or a lineage store). No widely adopted cross-organisation standard for multi-hop lineage exists yet; tamper-evident append-only logs are the stronger option when disputes are likely (regulated reporting, energy settlement).

## T4 · Who can read the content on the way? (confidentiality)
- TLS on every hop is the baseline, but brokers, routers and partner infrastructure see plaintext unless the content itself is encrypted.
- For sensitive data crossing intermediaries, **encrypt `data`** (JWE, RFC 7516, or COSE encryption) and leave envelope attributes readable for routing. Binary content mode carries encrypted bodies untouched, and Kafka record values, MQTT payloads and the AMQP bare message are all opaque bytes to the broker.
- There is no common standard for announcing the encryption method or exchanging keys between parties: agree it in the contract (algorithm, key IDs, rotation, a KMS per party or per-consumer keys).
- Keep secrets (signing keys, client secrets) in a secrets manager, rotate them, and never place them in events.

## T5 · What may the receiver do with it? (usage rights and privacy)
**Usage rights**
- Owners keep offering valuable streams only if they stay in control after delivery. Technical enforcement on someone else's machine is weak, so combine levers: subscription access rather than bulk copies, time-limited credentials tied to the licence term, per-consumer encryption keys, watermarking or canary records, written usage terms, and metered or tiered access with entitlements.
- Record the terms per consumer in the catalogue (`07`) so reviews can check them.

**Privacy (⚑ Personal)**
- **Minimise**: send identifiers and changed fields, not whole profiles. A vet lab result event carries the patient (animal) ID and result code; the owner's contact details stay in the clinic system.
- **Lawful basis and purpose** per stream and per consumer (GDPR Art. 6; special-category data needs Art. 9 conditions).
- **Retention**: logs and replays re-expose personal data. Set short retention for personal data, use compaction for latest-state topics, archive only what has a purpose.
- **Erasure**: plan for it before launch — crypto-shredding (encrypt per data subject and delete the key), tombstones on compacted topics, consumer obligations in the contract.
- **Cross-border**: note where brokers, replicas and partners sit; transfers may need safeguards.
- Energy co-op meter readings are personal data (they reveal household behaviour); the grid-stress alert broadcast is not.

## Trust checklist by boundary grade
| Check | B1 | B2 | B3 |
|---|---|---|---|
| Per-party credentials | Required | Required | Required, self-service issuance |
| Per-channel authorisation | Required | Required | Required |
| Tested access withdrawal | Recommended | Required | Required, automated |
| Signed delivery | Recommended | Required | Required |
| Content encryption | Where sensitive | Where sensitive or via third-party intermediaries | Default for anything not public |
| Lineage of derived events | Recommended | Required for regulated data | Required |
| Written usage terms | — | Required | Required, published |
| Privacy assessment | If ⚑ Personal | If ⚑ Personal | If ⚑ Personal, plus abuse handling |

## Severity hints for reviews
- Unsigned partner webhooks carrying instructions (commands) → **Critical**: anyone who learns the URL can trigger actions.
- Partners reading an internal topic with shared credentials → **High**: no withdrawal, internal schema exposed.
- Personal data retained indefinitely in a replayable log → **High** at B2+, **Medium** inside one team.
- Missing lineage on an internal derived event with no regulatory use → **Low**.

## Design output
The `REQUIREMENTS` line in `design` lists, one phrase each: **identity · authorisation · integrity & lineage · confidentiality · usage rights & privacy · operability** (the last from `10`).
