# API testing strategy

Purpose: confidence that the API returns what it documents, doesn't break consumers, rejects bad input usefully, is secure, and meets its agreed SLOs. Most accidental breaking changes and inconsistencies come from too little of the right testing. Time is limited: avoid redundant, low-value and flaky tests.

## Two lenses
- **Agile testing quadrants** (Marick; Crispin & Gregory): technology-facing vs business-facing, and supporting the team vs critiquing the product.
  - Q1 technology-facing, supporting: unit and component tests, automated.
  - Q2 business-facing, supporting: tests that confirm the right thing is built (examples, story tests, contract discussions).
  - Q3 business-facing, critiquing: functional acceptance, scenarios, exploratory testing (increasingly automatable).
  - Q4 technology-facing, critiquing: performance, security, resilience, scalability.
  The quadrants have no order; start where the risk is (e.g., a ticketing system facing traffic spikes starts with Q4 load testing).
- **Test pyramid** (Cohn): many fast unit tests at the base, fewer service tests in the middle (component, contract, integration), fewest end-to-end tests at the top. Higher levels give more confidence but are slower, broader and costlier to maintain. An inverted "ice-cream cone" of mostly end-to-end tests gives false confidence.
Recommendation: use the pyramid at minimum; add the quadrant when someone from the business can guide what matters.

## Contract testing
- A **contract** defines an interaction: if the consumer sends a request matching this, the producer returns a response matching that. From a contract you can generate **producer tests** (does the API honour it?) and a **stub server** for consumers (can they call it and parse the result?). Both run locally as service tests.
- Contracts are not the same as schema conformance: a schema says what is valid; a contract states concrete, agreed interactions with examples.
- Once agreed, contracts decouple delivery: consumers build against the stub while the producer implements.
- Don't use contracts for multi-step scenarios (create then read); that belongs in component tests.
- When running generated producer tests, stub the producer's own downstream dependencies.
- **Producer contracts**: the producer defines them. Suits public APIs with many external consumers, where no single consumer can change the API quickly. Easier starting point.
- **Consumer-driven contracts (CDC)**: consumers propose contracts (e.g., as a pull request) for what they need; producer and consumer discuss and agree (e.g., "should this be PATCH, not PUT?"). The conversation is much of the value. Suits internal APIs where both teams are reachable.
- Tooling: **Pact** (consumer-driven, language-agnostic, the de facto standard for HTTP and messages) with the **Pact Broker** for publishing, verification status, consumer maps and CI gates ("can I deploy?"); Spring Cloud Contract (JVM, either style). Schema-based/bi-directional contract testing compares consumer expectations against the provider's OpenAPI (general knowledge).
- Storage: alongside the producer (producer controls what's accepted, but hard to discover), a central repo (visible, but contracts can pile up that nobody intends to fulfil), or a broker (most complete).
- Recommendation: use contract tests. Public API → producer contracts. Internal API → work toward CDC, even if you start with producer contracts. Without contracts, component tests must carry the conformance burden, which is tedious and error-prone.

## Component tests (API in isolation)
Call the running API through its real interface with external dependencies replaced by test doubles; verify **behaviour**, not just shape. Typical cases:
- correct status code per outcome; correct data in the response;
- invalid, null or empty input rejected with a useful error;
- content negotiation (unsupported `Accept` → 406 or a documented fallback);
- missing or insufficient entitlements → 401/403;
- empty results → empty list, not 404 (or whatever is documented);
- create → `Location` header points at the new resource;
- idempotent retry returns the same result.

## Integration tests (across one boundary)
Verify that your code talks correctly to one external dependency: right URL, method and payload; handles the responses (including errors) it actually gets.
- Best: the **stub server generated from contracts**.
- Next best: **recorded** interactions (e.g., WireMock record/playback) — accurate at recording time, but must be refreshed and scrubbed of personal data if recorded against production.
- Hand-written stubs work but are error-prone (typos in field names, duplicate IDs); they are snapshots that go stale.
- **Real dependencies in containers** (Testcontainers) for databases, brokers, caches: the same version as production beats mocks or in-memory substitutes. Test only your side of the boundary (don't verify that Kafka delivers messages). Containers complement contracts; they don't replace them.
- **Test doubles**: stubs return canned answers; mocks also verify how they were called.

## End-to-end tests
- Run the real services together through the front door and check the consumer gets the right result. Keep them few: **core user journeys only** (scenario tests, optionally written BDD-style), not edge cases.
- Stub out third-party systems outside your domain; don't stand up components the journey doesn't touch. Don't try to replicate external consumers' UIs.
- Use **realistic payloads**, including large ones; tiny test payloads hide buffer and size limits.
- Keep security on (TLS, real authentication); turning it off misrepresents behaviour and metrics.
- **Performance tests** (Gatling, JMeter, Locust, k6) belong in a production-like environment and check SLOs and expected volume; driven by business requirements.
- If automated E2E isn't feasible, keep a manual run book against a test environment before release, knowing it slows delivery.

## What to recommend in a review (TESTING section)
1. Contract approach (producer vs CDC) and where contracts live.
2. Spec validation of real responses in CI, plus the breaking-change diff gate (05).
3. Component tests for the operations with tricky behaviour (state transitions, idempotency, auth, empty and error cases).
4. Integration tests for each outbound dependency (contract stubs, recordings or containers).
5. A small set of E2E journeys and, for high-traffic APIs, a performance test against SLOs.
