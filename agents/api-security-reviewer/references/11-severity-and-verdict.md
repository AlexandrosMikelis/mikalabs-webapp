# How severe is each finding, and may this ship?

Argus scores every finding with one transparent rule so that two reviews of the same design land on the same severity, and so that a sceptical engineer can see exactly why. The rule is MIKA's own; it borrows the idea of separating "how reachable" from "how bad" from public scoring methods (FIRST's vulnerability scoring system and the OWASP Risk Rating Methodology) but is tuned to API design reviews, where business context matters more than exploit mechanics.

## The Argus severity score
Rate three factors, then compute **Score = Consequence × (Reach + Ease)**. Range 0–24.

**Reach** — who can attempt it?
| R | Meaning |
|---|---|
| 3 | anyone on the internet, no account |
| 2 | anyone who can obtain an ordinary account or client (self-registration, any partner, any app user) |
| 1 | a specific credential holder: one partner, staff with MFA, a particular workload |
| 0 | only someone who already controls infrastructure or key material |

**Ease** — what does it take?
| E | Meaning |
|---|---|
| 3 | change a value, replay a request, or use a stock tool |
| 2 | a short script plus public knowledge of the API |
| 1 | chaining two weaknesses, or stealing a short-lived credential first |
| 0 | needs insider access plus cryptographic keys |

**Consequence** — what is lost, by data class (see 02)?
| C | Meaning |
|---|---|
| 4 | D4 effect (money moved, privileges changed, physical action, keys exposed) or D3 data for many people at once |
| 3 | D3 data for one person, account takeover of one person, D2 data in bulk |
| 2 | D2 data for one person, integrity loss on D0/D1 data others rely on, partial outage |
| 1 | hygiene: information that helps an intruder, but no direct loss |

**Bands**
| Score | Severity | Expected action |
|---|---|---|
| 16–24 | **Critical** | Block; fix now; if live, check for past exploitation and consider incident response |
| 10–15 | **High** | Fix before launch or before exposure to new consumers; named owner |
| 5–9 | **Medium** | Scheduled fix with a date; monitor meanwhile |
| 0–4 | **Low** | Hardening backlog |

**Adjustments** (at most one band each way):
- **Up one band** when there is no detection on the path, or when abuse would hit many organisations at once.
- **Down one band** only for a compensating control that is in place and tested (not planned, not assumed).
- **Never** lower a score because a weakness is hard to find. Obscurity is not a factor.

**Missing baseline controls** (a shortfall against `02-data-classes-and-baselines.md` with no specific attack path): High at D3/D4, Medium at D2, Low at D0/D1. If a concrete attack path exists, score it normally instead.

## Calibration examples
Use these to anchor judgement. Scores are shown as C × (R + E).

| # | House scenario | C | R | E | Score | Severity |
|---|---|---|---|---|---|---|
| 1 | Clinic app: `GET /pets/{id}/records` loads by ID with no owner check; owners self-register | 3 | 2 | 3 | 15 | High → **Critical** (no alerting on ID probing, +1 band) |
| 2 | Ferry API: JWT library accepts `alg: none` | 4 | 3 | 3 | 24 | **Critical** |
| 3 | Energy co-op: treasurers' payout endpoint lacks an organisation check; treasurer accounts need MFA | 4 | 1 | 3 | 16 | **Critical** |
| 4 | Ferry partner portal accepts ID tokens from the shared IdP as API credentials | 3 | 2 | 2 | 12 | **High** |
| 5 | Clinic booking API returns stack traces with library versions | 1 | 3 | 3 | 6 | **Medium** |
| 6 | Co-op meter-data API (half-hourly readings, D3) keeps no audit record of who read which member's series; no attack path on its own | — | — | — | — | **High** by the missing-baseline rule (D3 expects audit of record reads) |
| 7 | Timetable API missing `X-Content-Type-Options` | 1 | 3 | 1 | 4 | **Low** |
| 8 | Partner booking agency can set `X-Customer-Id` next to its API key | 4 | 1 | 3 | 16 | **Critical** (bulk passenger D3 data and booking changes) |

Example 6 shows the baseline rule at work: a gap with no exploit path can still be High when the data class demands the control. Example 3 shows that a narrow reach does not save a D4 flaw that is trivial to use.

For a known vulnerability in a third-party component, start from its CVSS v4.0 base score, then place it on this scale by asking the same three questions about your deployment.

## Writing a finding
Each finding carries: severity, a title, STRIDE letter(s), OWASP 2023 ID where one fits, the exposure-sheet row (`Where`), the issue in business terms without exploit steps, and the fix: what to change, where it sits (client, gateway, service, IdP, mesh, platform, process), the owner role, and the standard to follow.

Prefer fixes in this order:
1. remove the exposure (do not expose it, do not store it, narrow the scope);
2. use a standard protocol or platform control;
3. add a check in the service;
4. add detection (logging and alerting);
5. process or documentation.

Point out what is already done well; "nothing to report on token validation" is useful information.

## The verdict
| Verdict | When |
|---|---|
| **Approve** | no Critical or High findings |
| **Approve with conditions** | High findings with clear, bounded fixes; list each as a condition with an owner |
| **Rework** | the design itself creates High or Critical risk that point fixes cannot remove (a partner asserting user identity with an API key; object decisions made only at the gateway; one shared super-token for an AI agent) |
| **Block** | an unresolved Critical, or a Critical already exposed in production (recommend incident response) |

**Confidence**: High when Argus saw the actual spec, configuration or code; Medium when working from a detailed description; Low when many facts were assumed. State what would raise it.

If a caller asks Argus to approve something it rated Critical, the rating stands; explain what evidence or change would move it.

## Structured output: scoring fields
In `FORMAT: structured`, findings may add `data_class` and a `score` object (`consequence`, `reach`, `ease`, `adjustment`, `total`); see SKILL.md.
