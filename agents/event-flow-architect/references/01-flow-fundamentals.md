# Flow fundamentals

## What "flow" means here
Flow is networked, event-driven integration between independently run systems — often across organisational boundaries — that is loosely coupled, easy to extend and built on shared interfaces and protocols, so connecting costs little effort and negotiation. Five properties distinguish it from other integration:
1. **Self-service subscription** — a consumer (or an agent acting for it) asks for a stream through an interface, without a bespoke project with the producer.
2. **Producer consent** — the producer (or its agent) decides which requests to accept.
3. **Push after connect** — once subscribed, the consumer receives data as it becomes available; it doesn't keep asking.
4. **Producer control** — the producer decides what is sent, when and to whom.
5. **Standard transport** — data moves over standard network protocols (including protocols still emerging for this purpose).

"Agents" are the intermediaries that may act for either side: event routers, brokers, managed serverless services, policy or telemetry services. In practice producers and consumers often never talk directly; the integration infrastructure makes the promises to both.

Flow is still an end state, not a product. Cross-organisation streaming today is mostly bespoke or vendor-specific. Design "flow-ready": event-first internally, standard envelopes and contracts at the edge, so the same streams can be opened to partners cheaply later.

## Vocabulary
- **Producer / consumer** — sender and receiver of information (also called source and receiver).
- **Event** — a record of a state change plus context (time, identifier of what changed, origin, type). The producer **publishes** it.
- **Event stream** — a sequence of events between parties. A **raw data stream** carries values without context; the consumer must infer source, time and meaning. Across organisations, prefer event streams: context travels with the data.
- **Flow integration** — the connection: interfaces and protocols that let streams move.
- **Flow interaction** — the processing on either side that prepares, consumes or transforms streams. Without interaction, flow is just moving data; value comes from what is done with it.
- **Signal** — the state change that matters to a consumer: fine-grained (a price tick, a temperature reading) or coarse (a truck now has spare capacity, a company intends to list).

## The two things every integration needs
- **Interface** — how a consumer finds a stream and sets up, manages and closes a connection (logical connection + discovery).
- **Protocol** — how data is packaged, described and carried: the **metadata format** (envelope: type, source, time, content type, encryption, schema) and the **payload format** (the domain data).
Standardising metadata gets you most of the connection economics; payload standards come later and per industry.

## Flow vs other integration styles
| Style | How it works | Weakness for real-time cross-org use |
|---|---|---|
| Shared database / file | Systems read and write the same store | Doesn't scale past one store; tight coupling; painful on mergers |
| Batch / file drop | Data packaged and processed later (nightly, hourly polling) | Built-in delay between signal and action |
| Request–response API (consumer pulls) | Consumer calls when it wants state | Must poll often or accept staleness; no signal that data changed |
| Producer calls consumer API | Producer pushes to a known endpoint on trigger | Every consumer known and negotiated in advance; expensive to add parties |
| Event-driven (EDA) / flow | Producer publishes; consumers subscribe; intermediaries route | Needs shared contracts, security, operations discipline |

EDA decouples parties: producers don't need to know consumers exist; consumers initiate subscriptions; if a producer disappears, consumers just stop receiving. Flow does not replace APIs or batch — it adds a way to connect activity in real time. Use APIs for synchronous questions to a known party; batch where delay costs nothing.

## Composable vs contextual
- **Contextual** platforms (plug-ins, connector catalogues, many iPaaS tools) let you extend only at points the vendor anticipated. Fast for the first 80%, then you hit walls.
- **Composable** systems are fine-grained parts joined through one consistent mechanism (the Unix pipe is the classic example). More assembly work, far more adaptable to unanticipated uses.
Flow aims for composability: any compliant consumer can read any compliant producer's metadata and decide whether it can handle the payload. Recommend composable seams (standard envelopes, topics, webhooks, functions) at boundaries likely to change; accept connectors where the integration is stable and low-value.

## Precedents to reason from
- **Market data feeds / high-frequency trading**: ultra-low latency, but connections are negotiated per customer, co-located and persistent — not self-service.
- **Social media firehose APIs with source-side filtering**: close to flow (subscribe by API, little producer effort per consumer) but proprietary.
- **Cloud serverless triggers**: managed event sources wired to functions show how cheap consumption becomes when events are consistent — within one vendor's ecosystem.
Lesson: latency need decides how much special engineering is justified; consistency of events decides how cheap new consumers are.
