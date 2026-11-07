# Are credentials kept safe, and would abuse be noticed and attributable?

Step 8 asks what happens after the design goes live: where secrets live, what is recorded, who would notice abuse, and how fast the team can respond. Ground truth: the logging, error-handling and configuration chapters of OWASP ASVS 5.0, the OWASP Secrets Management and Logging cheat sheets, NIST SP 800-92 (log management), NIST SP 800-61 Rev. 3 (incident response, 2025), and CWE entries named below.

## Where do secrets live, and could any be avoided?
Secrets: client secrets, API keys, signing keys, private keys, database passwords, webhook secrets, cloud credentials.
- **Avoid first**: platform-issued workload identities, managed identities, cloud workload identity federation for CI, `private_key_jwt` with the key held in a KMS. A secret that does not exist cannot leak.
- **Otherwise store** in a secrets manager (AWS Secrets Manager, Azure Key Vault, Google Secret Manager, HashiCorp Vault) with keys in a KMS or HSM; never in code, container images, function environment variables in plain text, shared CI variables, configuration repositories, tickets or chat (CWE-798).
- **Inject at runtime** with per-workload access; log every read of a D4 secret.
- **Rotate** on a schedule and on demand, with overlapping validity so rotation needs no downtime.
- **Detect leaks**: secret scanning before commit and on the server side, prefixed key formats, alerts on any use of a revoked credential.
- If the material Argus is given contains a real secret, that is a finding in itself: recommend immediate rotation and do not repeat the value.

## What must be recorded, and what must not?
Two streams with different purposes:

| Stream | Purpose | Fields |
|---|---|---|
| Access log | operations, detection | time, correlation ID, client ID, subject, organisation, method + route template, object IDs, status, latency, source |
| Audit log | attribution, regulatory proof | who, acting for whom, what action, which object, before/after for changes, outcome, how the person signed in (`acr`/`amr`) |

- Audit records are expected for all writes at D3 and above and for all D4 actions; reads of D3 records are logged too (`02-data-classes-and-baselines.md`).
- **Never log**: tokens, passwords, API keys, full card numbers, secrets, or personal data beyond need (CWE-532). Log a token's `jti` or a hash, mask personal fields, and set retention to what the regulation and the purpose require.
- Structured logging (JSON) with encoded user values, against log injection (CWE-117).
- Ship logs off the host quickly to append-only or tamper-evident storage with restricted access; synchronise clocks.
- The gateway sees requests; only services see authorisation decisions and business actions. Both must log, joined by a trace ID (W3C Trace Context).
- Test logging like backups: periodically confirm the expected events are captured, searchable and retained.

## Would anyone notice abuse?
Alert rules Argus expects for D2+ APIs:
- many `403`/`404` responses for one subject across many object IDs (probing for unchecked objects);
- spikes in sign-in or token failures, per account and globally;
- calls to deprecated, unregistered or debug routes;
- one client's data volume far above its normal pattern (bulk extraction);
- any use of a revoked credential or a disabled account;
- spend caps approaching their limit (SMS, payments, AI calls);
- changes to roles, client registrations, signing keys or policy configuration.
Every alert needs an owner and a runbook entry.

## Is there an inventory of what is exposed?
API9:2023: unknown or forgotten interfaces are where old, weaker controls survive.
- A catalogue of every API and version in every environment: owner, exposure, data class, authentication method, consumers, deprecation date.
- Old, beta and debug versions retired, not just hidden; the gateway refuses unregistered paths.
- Non-production environments holding production data get production controls.
- Contracts kept accurate and used for validation, tests and inventory; a spec that drifts from reality is a finding.

## Are third-party components watched?
- Software bill of materials (SPDX or CycloneDX) per build; vulnerability monitoring against it.
- Rate component vulnerabilities with CVSS v4.0 base scores, then adjust for this API's exposure and data class using `11-severity-and-verdict.md`. Check the CISA Known Exploited Vulnerabilities catalogue for urgency.
- Vendor gateways, identity providers and SaaS integrations held to the same standard: secure defaults, patch cadence, breach notification terms.
- The pipeline that builds and deploys the API is part of the attack surface: signed artefacts, protected branches, least-privilege deploy credentials (SLSA levels are a useful yardstick).

## How is the design tested defensively?
Contract tests from the spec; negative authorisation tests (two subjects, two organisations, every route × method × role); input fuzzing and API scanners against non-production only; policy-as-code tests for gateway and network configuration in CI; periodic independent penetration tests under written authorisation.

## Can the team respond within hours?
Argus checks that the team can, without code changes: revoke every token for one client; disable one key or client at the gateway; rotate signing keys; block one organisation's access; export audit records for an incident; notify affected people and regulators within required deadlines (for example the GDPR 72-hour window; confirm with legal).

## Typical findings
| Finding | Starting rating |
|---|---|
| Live secret in a repository, image or pasted material | Critical until rotated |
| No audit trail for D4 actions | High |
| Tokens or passwords written to logs | High |
| Old API versions live with weaker controls | High at D3+, otherwise Medium |
| No way to revoke a client's tokens quickly | High at D3+ |
Confirm with the scoring rule in `11-severity-and-verdict.md`.
