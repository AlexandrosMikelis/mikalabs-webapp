# The business case for flow

Change is expensive. Flow is worth it only where a real pain or opportunity exists; otherwise it is a solution looking for a problem. Build the case from the need.

## Three drivers
1. **Customer experience** — customers (consumers and business buyers) expect to be treated consistently across channels and units. A change in one place (a purchase, a payment, a cancellation) should be reflected everywhere relevant within seconds. Inconsistent or stale experiences lose trust and revenue. The same holds for public services and non-profits (enrolment, relief supplies, eligibility).
2. **Operational efficiency** — remove waiting and rework from processes (see lead time below). Automation needs the signal and the data at the moment they occur, often from another team or company.
3. **Innovation** — new products and services built by combining streams (e.g., weather + traffic + demand for routing; many suppliers' inventory into one virtual catalogue). Distinguish innovation from adaptation: catching up with competitors is the cost of survival, not advantage. Flow moves the needle when it enables something new.

## Lead time and process time (value stream view)
Value stream mapping follows one unit of work end to end and measures, per step, **lead time (LT)** — time waiting in a queue — and **process time (PT)** — time being worked on. The largest constraint hides every other improvement (theory of constraints), so fix the biggest bottleneck first.
- **Eliminating LT** needs software that knows work exists the moment it exists and routes it at once (rules engines, increasingly ML). It depends on receiving signals — which depends on interoperable interfaces and protocols. Pre-agreed (open) interfaces remove the negotiation cost per connection.
- **Eliminating PT** needs all required data available to the step when it runs, and connections that can be changed cheaply as sources change. With standard connection and envelope mechanics, the cost of change shrinks to the code that interprets the payload.
In `assess`, ask: where does work wait for a file, a poll, an email or a person re-keying data from another system?

## Three enablers (why flow changes the economics)
- **Lower cost** — integration dominates IT spend, and many integrations never happen because cost exceeds value, especially with outside parties (development, testing, network, intermediaries, negotiation). Standard tools, a larger skilled labour pool and economies of scale lower the cost. Expect total integration spending to rise, not fall: cheaper integration unlocks more use cases (the **Jevons effect**).
- **Flexibility** — composable, interoperable streams can be recombined in unanticipated ways. Interoperability also brings systemic risk (cascades, privacy loss) that must be managed, not ignored.
- **Choice / ecosystems** — a core platform or stream that others can build on grows in value with every complement (cf. electronic equities markets: streams spawned trading, media, fund and research businesses). Every organisation should ask which of its state changes others could build on.

## What businesses require from flow
Security (trust in access and provenance), agility (connect and disconnect freely), timeliness (fit for the use), manageability (observe and operate from your side), memory (replay and audit) and, across organisations, control of intellectual property. Detail in `07-flow-requirements.md`.

## Effects to anticipate
- **Timely data** replaces overnight batch: campaign results in minutes, reconciliations in seconds. Processing becomes demand-driven (consumers choose streams) rather than supply-driven.
- **Core vs context** (Moore): composable integration lets an organisation outsource undifferentiated steps at fine grain — even single steps inside a workflow — and keep differentiating ones. Expect new forms of outsourcing and new intermediaries.
- **Work and skills**: roles that take items from a queue, apply a fixed procedure and pass them on ("clerk" roles) are most exposed; flow plus ML extends this to some expert judgement roles. New roles appear; reskilling is the hard part. Flag this in `assess` when an opportunity removes human queues.
- **Entity-centric aggregation**: many sources updating one live representation of a person, asset or shipment (skills records, patient records, vehicle and load matching). Strong flow candidate; also strong privacy and consent questions.
- **Scale shapes the network**: like biological and urban networks, flow networks will favour local processing feeding into larger aggregated flows, and a few dominant high-value streams with ecosystems around them.

## Building the case (checklist)
1. Name the state change and who needs it, how fast, and what they do with it.
2. Quantify the delay cost today (LT, lost sales, errors, manual effort, risk).
3. Estimate integration cost now vs with standard eventing (per new consumer).
4. Identify who else could consume the stream (internal units, partners, customers) — the option value.
5. List the trust conditions (security, provenance, IP, regulation) that must hold.
6. State what you would *not* move to events, and why.
Cost-justification heuristic: a new integration approach typically needs a clear step-change advantage (often cited as around twice as good on cost) or a new revenue stream to overcome enterprise inertia.
