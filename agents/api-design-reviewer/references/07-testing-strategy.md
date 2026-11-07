# API testing strategy

Purpose: confidence that the API returns what it documents, doesn't break consumers, rejects bad input usefully, is secure, and meets its agreed SLOs. Most accidental breaking changes and inconsistencies come from too little of the right testing. Time is limited: avoid redundant, low-value and flaky tests.

## Start from the risk, not the test type
MIKA's risk-to-test map: name the API's top three risks, then pick the cheapest test that would catch each.
| Risk | Cheapest test that catches it | Runs |
|---|---|---|
| A release silently breaks a caller | Spec diff gate (05) plus interaction tests (below) | Every pull request |
| Wrong behaviour for edge cases (empty, invalid, unauthorised, retried) | Tests of the running service with dependencies faked | Every pull request |
| Misuse of a database, broker or partner API | Integration test against a real container or a recorded stub | Every pull request or nightly |
| A core journey fails end to end | A handful of journey tests in a shared environment | Before release |
| Slow or falling over at expected volume | Load test against the stated objectives | Before major releases, after big changes |
| Security gaps | Hand-off to Argus; automated scanners in the pipeline | Continuous |
Proportions follow the familiar test pyramid (Cohn): many fast checks low down, few slow end-to-end ones. A suite that is mostly end-to-end tests is slow, flaky and still misses edge cases. The agile testing quadrants (Marick) are a useful prompt for the risks business people care about, such as exploratory and acceptance testing.

## How do provider and consumer prove they still agree?
- A schema says which messages are *valid*; an interaction test says which concrete request/response pairs a consumer *relies on*. Both matter, and they catch different bugs: schema checks catch shape drift, interaction tests catch a provider that returns valid but unexpected data (an empty list where one item was promised, a 404 where a 200 was expected).
- **Pact** (open source, many languages, HTTP and message interactions) is the common public tool: the consumer's unit tests record the interactions they need into a pact file; the provider's pipeline replays them against the real service; the **Pact Broker** (or PactFlow) stores pacts and verification results, and its `can-i-deploy` check blocks a release that would break a known consumer. Spring Cloud Contract covers the JVM with provider-written contracts. **Bi-directional** (schema-based) checking compares consumer pacts with the provider's OpenAPI document instead of replaying them.
- Keep interaction tests to single exchanges. Multi-step flows (create, then read) belong in tests of the service in isolation (next section).

### MIKA chooser: who should write the expectations?
| Situation | Who writes them | Why |
|---|---|---|
| Internal API, consumer teams reachable, fewer than ~15 consumers | Each consumer (consumer-driven, Pact) | The provider learns exactly what is used, so removing an unused field becomes safe; the review conversation itself catches design mistakes |
| Public or partner API, many unknown consumers | The provider, as examples in the OpenAPI document checked in CI, plus a diff gate (05) | Unknown consumers cannot contribute; the published spec is the promise |
| Partner API with a few strategic integrators | Provider spec plus selected partner pacts or bi-directional checks | Protects the integrations that matter most without waiting for all |
| Event streams | Consumers, using Pact message pacts or schema-registry compatibility rules | Producers rarely know all subscribers |
Clinic network example: the appointments API has three internal consumers (web portal, reminder service, billing) and two partner booking sites. Internal consumers publish pacts; partners get a versioned OpenAPI document with examples and a breaking-change gate.

## Does the running service behave as documented, on its own?
Start the service, call it through HTTP or gRPC as a client would, and replace its own dependencies with fakes. Check **behaviour**, not just shape. Cases worth covering for each operation with real logic:
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

## Which journeys deserve an end-to-end test?
- Only those whose failure would stop the business. For the ferry operator that is "search sailing → book → pay → receive boarding pass", not every filter combination. Edge cases belong lower down.
- Fake anything outside your organisation (payment provider sandbox, SMS gateway); start only the services the journey touches.
- Send payloads the size real callers send; toy payloads hide size limits and timeouts.
- Leave TLS and real authentication switched on, or the test measures a different system.
- **Performance tests** (Gatling, JMeter, Locust, k6) belong in a production-like environment and check SLOs and expected volume; driven by business requirements.
- If automated E2E isn't feasible, keep a manual run book against a test environment before release, knowing it slows delivery.

## What to recommend in a review (TESTING section)
1. Who writes the interaction expectations (MIKA chooser above) and where they are stored (broker, repository).
2. Spec validation of real responses in CI, plus the breaking-change diff gate (05).
3. Service-in-isolation tests for the operations with tricky behaviour (state transitions, idempotency, auth, empty and error cases).
4. Integration tests for each outbound dependency (contract stubs, recordings or containers).
5. A small set of E2E journeys and, for high-traffic APIs, a performance test against SLOs.
