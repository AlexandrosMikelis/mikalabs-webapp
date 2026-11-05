# Secrets, logging, audit and operations

## Secrets
- Secrets = client secrets, API keys, signing keys, certificates' private keys, DB passwords, webhook signing secrets, cloud credentials.
- Store in a secrets manager or KMS/HSM (general knowledge), not in code, images, CI variables visible to all, config repos, tickets or chat. Inject at runtime with least-privilege access per workload.
- Prefer credentials that don't need storing: workload identity federation, managed identities, short-lived certificates via a mesh, `private_key_jwt` with keys held in KMS.
- Rotation: scheduled and on demand; support overlapping validity (two active keys) so rotation needs no downtime; an emergency runbook for leaked keys (revoke, rotate, assess access logs).
- Detection: secret scanning in repos and CI (pre-commit and server-side), prefixed key formats to make leaks detectable, alerting on use of revoked credentials.
- If a reviewer sees a real secret in material it was given, that's a finding in itself: recommend immediate rotation; don't repeat the value.

## Logging and monitoring (Repudiation; formerly OWASP API10:2019)
- Purpose: prove who did what (non-repudiation), detect abuse, investigate incidents, meet regulatory audit duties.
- Per request: timestamp, request/trace ID, authenticated subject and client ID, tenant, operation (method + route template), object identifiers, outcome/status, source, latency. For sensitive actions (money movement, permission changes, data export, admin actions), a separate **audit log** with before/after where relevant.
- **Don't log**: tokens, passwords, API keys, full card numbers, secrets, unnecessary personal data. Log a token's `jti` or a hash, mask personal data, mind data-protection retention rules.
- Guard against **log injection**: structured logging (JSON), encode user-controlled values.
- Integrity: ship logs off the host quickly to append-only or tamper-evident storage with restricted access; synchronise clocks.
- The gateway is a natural central point for request logs, but services must log authorisation decisions and business actions the gateway can't see. Correlate with distributed tracing.
- Alert on: authn failure spikes, 401/403 patterns across many object IDs (BOLA probing), calls to unregistered or deprecated routes, rate-limit hits per identity, unusual data volumes per client, use of revoked credentials.
- Like backups, logging must be **tested**: periodically verify that the expected events are captured, searchable and retained for the required period.

## Error handling
- Generic error bodies to clients (consistent format, e.g., RFC 9457 problem details; general knowledge); details (stack traces, SQL errors, internal hostnames, library versions) only in internal logs.
- Don't distinguish "user exists" from "wrong password" on auth endpoints.

## Inventory and lifecycle (OWASP API9:2023)
- A catalogue (API management platform, developer portal or registry) of every API and version in every environment: owner, exposure (internal/partner/public), data classification, auth method, consumers, deprecation date.
- Old, beta, debug and test endpoints left in production are a classic leak — often with weaker controls or fuller data models than the current version. Retire them; block unregistered paths at the gateway.
- Non-production environments with production data need production-grade controls.
- Specs are part of the security boundary: keep OpenAPI documents accurate and use them for validation, testing and inventory.

## Supply chain and vulnerability management
- Track dependencies (SBOM), monitor CVEs, rate with CVSS plus your context, be able to rebuild and redeploy quickly.
- Hold vendor gateways, IdPs and SaaS integrations to the same standard as your own code: secure defaults, patch cadence, incident notification.

## Security testing (defensive)
- Contract tests from the spec; negative tests for every authz rule (multi-user, multi-tenant, every method); fuzzing of inputs in test environments; DAST/API scanners against non-production; periodic independent penetration tests under written authorisation.
- Automate security policy tests for gateway and mesh configuration in CI.

## Incident readiness
Know how to revoke all tokens for a client, rotate signing keys, block a client or key at the gateway, and notify affected parties and regulators within required deadlines (e.g., GDPR 72 hours — confirm with legal).
