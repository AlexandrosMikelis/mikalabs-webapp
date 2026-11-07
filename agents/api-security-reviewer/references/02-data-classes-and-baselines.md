# Data classes and the controls each one needs

Argus asks "how sensitive is this?" before "is this control present?". A missing control on a timetable endpoint and the same gap on a payout endpoint are different findings. The MIKA data classes below give every exposure-sheet row a class, and each class carries a **baseline**: the controls a reviewer should expect without being told. A row that falls short of its baseline is a finding even when no specific attack is described.

## Which class is this data?
Classify by the most sensitive thing an operation can **read, change or trigger**. Rate the row by its highest class.

| Class | Name | Meaning | House examples |
|---|---|---|---|
| **D0** | Public | Meant for anyone; harm only if altered | ferry timetables, clinic opening hours, co-op tariff sheet |
| **D1** | Internal | Not public, low harm if seen | staff rota, vessel maintenance schedule |
| **D2** | Personal | Identifies a person; ordinary harm if exposed | pet owner name and phone, passenger booking reference, member address |
| **D3** | Sensitive | Serious harm if exposed: special-category or financial data, precise location or behaviour, identity documents, data about many people at once | passenger passport numbers, half-hourly smart-meter readings (they reveal when a home is empty), payment card or bank details, prescription history |
| **D4** | Control | Operations that move money, change who can do what, issue credentials, or act on the physical world | co-op payouts, admin role grants, signing-key management, remote commands to a battery or a vessel system |

Notes:
- Bulk access raises the class by one: a list endpoint returning thousands of D2 records behaves like D3.
- Credentials and keys for other systems are always D4, wherever they are stored.
- A D0 read that can be **written** by the wrong caller (a defaced timetable) is rated on integrity impact, not confidentiality.

## Per-class control baselines
Read across a row. "Expected" means its absence is a finding; the severity rule for missing baseline controls is in `11-severity-and-verdict.md`.

| Control area | D0 | D1 | D2 | D3 | D4 |
|---|---|---|---|---|---|
| Caller authentication | optional; key for metering | workload or staff identity | person or client identity via OAuth/OIDC | as D2, plus MFA for people | phishing-resistant MFA or step-up for people; strong client auth (`private_key_jwt`, mutual TLS) for machines |
| Access token lifetime | n/a | ≤ 60 min | ≤ 30 min | ≤ 15 min | ≤ 5–10 min, or per-transaction authorisation |
| Sender-constrained tokens (DPoP, mutual TLS) | no | no | recommended for third parties | expected for third parties and partners | expected |
| Function-level checks | write paths only | deny by default | deny by default | deny by default, tested per method | deny by default, separate admin surface |
| Object and property checks | write paths only | expected | expected, with automated two-user tests | expected, with tests in CI per operation | expected, plus dual control or approval for high-value actions |
| Rate and cost limits | per IP and per client | per client | per identity | per identity and per flow | per identity, per flow, and value limits |
| Transport | TLS | TLS | TLS 1.2+ (1.3 preferred) | TLS on every hop including internal | TLS on every hop, mutual TLS between workloads |
| Logging | access log | access log | access log with subject and object | audit log for reads of records and all writes | tamper-evident audit log, alerting, before/after values |
| Encryption at rest | n/a | platform default | platform default | field-level or envelope encryption for the most sensitive fields | keys in KMS or HSM, access logged |
| Fail mode of security components | open acceptable | either | closed | closed | closed |
| OWASP ASVS 5.0 level to aim for | L1 | L1 | L2 | L2 | L3 |

Lifetimes are MIKA starting points, not standard values; no RFC fixes them. Tighten them when tokens cannot be sender-constrained; relax them only with sender constraint and fast revocation in place.

## How the baseline is used in a review
1. Give each exposure-sheet row a class.
2. Compare what is described with the row's baseline column.
3. Each shortfall becomes a finding: name the control, the class and the row.
4. Do not ask for controls above the baseline unless a specific threat justifies them; over-engineering is not a finding.

## Which compliance regimes might apply?
Flag, never conclude; the caller's compliance or legal team confirms.

| Signal in the design | Possible regime |
|---|---|
| Personal data of people in the EU or UK | GDPR / UK GDPR (breach notification within 72 hours of awareness for notifiable breaches) |
| Card numbers stored, processed or transmitted | PCI DSS v4.0.1 |
| Payment initiation or account access for EU customers | PSD2 and its strong-customer-authentication rules; open-banking profiles such as FAPI 2.0 |
| US health information handled for a covered entity | HIPAA |
| Operator of essential or important services in the EU (energy, transport, health) | NIS2 national implementations |

The ferry operator and the energy co-op in the house examples would both draw a NIS2 flag; the clinic network would draw a GDPR flag for owner data.

In a review graph (see 03) the data class is a node with `REQUIRES` edges to its baseline controls, so a shortfall is any required control with no enforcing component.
