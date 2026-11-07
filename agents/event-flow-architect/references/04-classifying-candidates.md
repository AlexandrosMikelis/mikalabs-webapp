# 04 · Finding and classifying candidates (`assess`)

First find the state changes worth sharing, then describe each one precisely enough that the design follows. MIKA describes every candidate with a four-part **shape code** plus any **concern flags**. The code replaces vague labels ("real-time integration") with decisions that drive technology and contract choices.

## Where do candidates come from?
Use whichever discovery technique suits the client; combine them for larger estates.
- **Touchpoint scan** — list every place one system or organisation learns something from another (exports, polls, emails, portals, phone calls). Each is a candidate.
- **Event-storming workshop** — EventStorming (Alberto Brandolini) lays a business activity out as a timeline of past-tense domain events with the commands, policies, people and external systems around them. Every external system on the board is a candidate; every "hotspot" sticky note is a possible pain point.
- **System-of-record inventory** — read audit tables, change logs or CDC output to see which records change and how often.
- **Complaint and rework log** — call-centre reasons, reconciliation reports and manual workarounds point at stale information.

**Touchpoint test** at each candidate:
- You need to *know when something changed* elsewhere → candidate event.
- You need an *immediate answer* to a question → API.
- You send something and an answer may come *later* → event or message, not a blocking call.

## The shape code
Four axes, each with a short value. Written as `Direction · Intent · Payload · Latency`, e.g. `1→N · Fact · Delta · Operational`.

### Axis 1 — Direction: how many sides?
| Value | Meaning | Design pressure |
|---|---|---|
| **1→1** | One producer, one consumer | Often an API or file is enough; justify events by latency or decoupling |
| **1→N** | One producer, many consumers (fan-out) | Output scale, per-consumer access, geography, fairness of timing |
| **N→1** | Many producers, one consumer (fan-in) | Producer onboarding, mixed quality, per-source health, input bursts |
| **N↔N** | Many producers and consumers via routing or processing | Routing rules, ownership of derived events, feedback loops |

Qualifying questions: *Who else will want this within a year? Will producers join and leave on their own schedule? Does anyone derive new events from these?*

### Axis 2 — Intent: what does the producer expect?
| Value | Meaning | Design pressure |
|---|---|---|
| **Fact** | "This happened." The producer needs nothing back | Loosest coupling; consumers can come and go |
| **Command** | "Please do this." One intended handler, an outcome expected | Queue with competing consumers, reply or status event, timeouts |
| **Exchange** | A multi-step conversation with state on both sides | Correlation IDs, conversation timeouts, a workflow engine or saga |

Qualifying questions: *If no one reacts, is anything broken? Does the producer wait for, or track, an outcome? How many back-and-forth steps are there?*
Prefer **Fact** whenever the business allows it. Each move towards Exchange adds state that must be stored, recovered and kept consistent.

### Axis 3 — Payload: how much state travels?
| Value | Meaning | Use when |
|---|---|---|
| **Signal** | Type, subject and a reference only; consumer fetches details | Many consumers act on few events; details need per-consumer authorisation; payload is large |
| **Delta** | The fields that changed | Consumers keep their own copy and apply changes in order |
| **Snapshot** | The full current state of the subject | Consumers must act without calling back; late joiners need full state; compacted topics |
| **Sequence** | Meaning lives in the order or window, not one event | Telemetry, meter readings, monitoring, pattern detection |

Qualifying questions: *Can the consumer act without calling the producer? What if it reads details that are newer than the event? Is any personal data in the payload necessary?*

### Axis 4 — Latency: how soon must the consumer know?
| Value | Usefulness window | Typical handling |
|---|---|---|
| **Interactive** | Under ~1 second | Direct push, few hops, regional processing |
| **Operational** | Seconds to a few minutes | Routers, queues, logs; the common case |
| **Tactical** | Minutes to hours | Micro-batches, scheduled consumers, logs read on demand |
| **Batch-tolerant** | Hours or more | Probably not an event candidate — revisit `01` |

Qualifying questions: *What happens if it arrives 5 minutes late? An hour late? Who notices?*

## Concern flags
Add any that apply; each pulls in specific design and review checks.

| Flag | Raised when | Pulls in |
|---|---|---|
| **⚑ Exclusive** | Something can be allocated only once (a ferry car-deck slot, an EV charger booking, an appointment) | Single allocation authority, compare-and-set, reservation expiry (`06`) |
| **⚑ Churn** | Participants join and leave constantly (devices, meters, vehicles) | Stable identities, duplicate registration handling, onboarding automation |
| **⚑ Boundary** | Boundary grade B2 or B3 (`01`) | Contracts, signing, per-party access, usage terms (`07`, `09`) |
| **⚑ Personal** | Payload contains personal or special-category data | Minimisation, retention, erasure, lawful basis (`09`) |
| **⚑ Automated reaction** | Consumers trigger actions automatically, possibly feeding other producers | Loop protection, rate limits, human override (`10`) |

## Worked classification — community energy co-op
| Candidate | Shape code | Flags | Notes |
|---|---|---|---|
| Smart-meter half-hourly readings → co-op billing | `N→1 · Fact · Sequence · Tactical` | Churn, Personal | Thousands of meters; readings arrive late and duplicated |
| Grid-stress alert → members' home batteries | `1→N · Command · Signal · Operational` | Automated reaction, Boundary | Batteries must not all react at the same second |
| Shared EV charger booked → members' app | `1→N · Fact · Snapshot · Interactive` | Exclusive | Booking itself is an API call with one authority; the event only announces it |
| Annual tariff change → members | `1→N · Fact · Snapshot · Batch-tolerant` | Personal | Letter or email, not an event stream |

## Quick signals
- **For**: work waits on a schedule, a poll or retyping; several units or partners need the same change; many sources feed one decision; the information loses value within minutes.
- **Against**: one consumer and hours of delay are fine; the consumer needs an immediate answer; nobody acts faster (V3 = 0); the producer cannot keep minimal promises (identity, schema, owner); trust conditions cannot be met for the boundary grade.

## Running `assess`
1. **Scope** with `01`: parties, boundary grades, usefulness windows.
2. **Discover** candidates with one or more techniques above.
3. **Classify** each: shape code + flags. The direction value is the `pattern` (fan-out, fan-in, point-to-point, routed); the full shape code is the `category`.
4. **Score** each with the ledger (`03`) → Strong / Moderate / Weak.
5. **Check readiness** (`02`) for the boundary grade the best candidates need.
6. **Not events**: name what stays as API, file or batch, with the reason.
7. **First step**: the pilot checklist in `02`, applied to the strongest candidate the readiness band allows.
8. **Open questions**: only those that would move a Fit label. Assume, flag, continue.
