# Readiness and adoption

You can't "implement flow" as a finished standard yet: cross-organisation interfaces, provenance and end-to-end security are still being settled. You can build so that you benefit as they arrive. Advice here favours flexibility over optimisation.

## Three moves to make now
1. **Identify the need** — find where near-real-time response to a change of state (inside or outside the organisation) creates value (`04`). No need, no project.
2. **Go event-first** — architect and operate the applications that serve those needs around events, including where they touch outside parties (`05`). Extend existing systems at their edges (outbox/CDC, event router, webhooks) instead of rewriting their core logic.
3. **Take part** — in standards, open source, trade groups or partner ecosystems that shape the flow of your industry.

## Maturity levels (MIKA Labs synthesis)
| Level | Description | Typical next step |
|---|---|---|
| 0 Batch & point-to-point | Files, nightly jobs, polling, bespoke APIs per partner | Pick one high-value state change; publish it as an event internally |
| 1 Internal events | A broker or log in use by some teams; envelopes and schemas vary | Standard envelope (CloudEvents), schema registry, naming and ownership rules |
| 2 Event platform | Self-service topics, contracts (AsyncAPI), outbox/CDC, observability, DLQ ownership | Expose one stream to a partner via webhooks or a gateway with entitlements |
| 3 Partner streams | Several external producers/consumers, signed deliveries, per-consumer access, documented retention | Catalogue/discovery, metering, provenance, joint governance with partners |
| 4 Ecosystem | Streams are products; others build on them; participates in industry standards | Monetisation, industry payload standards, multi-party trust |

## Readiness checklist
- **Ownership**: each event type has an owning team, a contract and a deprecation policy.
- **Envelope and contracts**: one envelope standard; schemas registered with compatibility rules; AsyncAPI documents for externally visible streams.
- **Reliable publication**: no dual writes; outbox or CDC; idempotent consumers; dead-letter handling with owners.
- **Security**: authentication of every party, per-stream authorisation, payload encryption where sensitive, signed webhooks, key rotation, revocation tested.
- **Observability**: lag, rate, error and silence alerts; trace context propagated through events; per-partner dashboards.
- **Retention and replay**: retention promises written down; replay procedure tested; personal-data retention aligned with privacy rules.
- **Practices**: continuous delivery so consumers can experiment cheaply; contract tests in CI; game days for broker and partner failure.
- **Edge and topology**: designs that allow local processing and regional streams if latency or volume grows.

## Adoption timing and inertia
- Expect a large organisation to need about three years for a major integration shift: a year of exploration and fit, a year of pilots and first production uses, a year to scale.
- The original 2021 analysis expected mainstream cross-organisation flow 5–10 years out. Since then CloudEvents and AsyncAPI have matured and cloud event routers accept SaaS events widely, but no universal subscription/discovery standard has won (general knowledge as of Nov 2026).
- Objections to plan for: security and privacy, performance at peak, cost compared with what works today. Answer them with a pilot that measures them.

## Taking part in shaping flow
- **Standards bodies**: IETF (HTTP, TLS, WebSocket, QUIC), OASIS (MQTT, AMQP), CNCF (CloudEvents, its subscription/discovery and registry work), AsyncAPI Initiative (Linux Foundation). Standards matter only if vendors and users adopt them — contribute use cases and running implementations.
- **Open source**: running code often defines what the market adopts (as browser projects did for HTTP). Relevant ecosystems: Apache (Kafka, Pulsar, Flink, Beam, NiFi, Druid…), CNCF (NATS, Knative, Argo, gRPC). Most new projects stall without users; join active ones before starting your own.
- **Trade groups and government**: industry bodies have defined cross-company formats before (EDI, payments messaging, health data). They are the likely source of payload standards. Public agencies can convene and mandate.
- **Ecosystem partnerships**: a dominant platform or valuable stream owner can set event formats for its ecosystem. Building value-add on someone else's stream works but risks the owner copying you.
- **Open source alliances**: infrastructure projects agreeing on operational events (e.g., in CloudEvents) would let any automation tool react to any platform.

## Opportunities still open (for product strategy questions)
Cross-party data provenance and payload security; tracking where event data travels and is used; coordination between core, edge and device processing; stream discovery and catalogues; monetisation and entitlement of streams; matching services (Facilitators) in specific industries.

## Pilot template (use as FIRST STEP in `assess`)
One state change, one producer team as owner, at least one real consumer (ideally one external), CloudEvents envelope, registered schema, outbox or CDC publication, documented delivery and retention promise, idempotent consumer, dashboards for lag/silence, success measure tied to the business case (LT removed, error rate, revenue). Time-box to weeks, not quarters.
