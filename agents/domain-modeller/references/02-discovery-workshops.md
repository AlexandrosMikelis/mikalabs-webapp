# Discovery workshops: getting knowledge out of people's heads

Use when the fact sheet (`01`) shows thin knowledge, when the caller pastes workshop output, or when someone asks Gaia to plan a session. Three techniques cover most needs; each answers a different question.

Grounding: EventStorming as described publicly by Brandolini (eventstorming.com and his open talks); Domain Storytelling as documented at domainstorytelling.org and its open-source modeler; Example Mapping as published by Cucumber's open documentation; DDD-Crew's *EventStorming glossary & cheat sheet* (CC BY-SA 4.0). The selection matrix, agendas and the "reading the wall" procedure are MIKA's.

## Which technique answers which question?
| Question you need answered | Technique | Group | Time |
|---|---|---|---|
| What happens across the whole business, and where does it hurt? | EventStorming, big-picture | 8–25 people | Half day to a day |
| How exactly does one process run, including rules and reactions? | EventStorming, process level | 5–10 | 2–4 hours |
| Which consistency units handle which requests inside one area? | EventStorming, design level | Team + 1–2 experts | 2–3 hours |
| Who does what with which object in one concrete case? | Domain Storytelling | 1 storyteller + moderator + 3–6 listeners | 60–90 min per story |
| What are the edge cases of one rule? | Example Mapping | 3–4 people | 25 min per story |

Rule of thumb: start wide (big-picture) only if nobody can draw the end-to-end flow. Otherwise go straight to the narrow technique for the gap.

Skip workshops for simple form-over-table areas, purely technical problems, or areas with one expert and one obvious flow. An interview is cheaper.

## How does an EventStorming session run?
The core material is a long wall (paper or online board) and sticky notes in agreed colours. The unit of conversation is the **domain event**: a business fact in the past tense that an expert cares about ("Vehicle space reserved", "Sailing cancelled for weather").

### Notation (adapt colours freely, keep the legend visible)
| Note | Usual colour | Meaning |
|---|---|---|
| Domain event | Orange | Something that happened, past tense |
| Command | Blue | An intention that may cause an event |
| Actor | Small yellow | Person or role issuing a command |
| Policy | Lilac | "Whenever X, then Y" reaction |
| Read model (information shown) | Green | What someone looks at before deciding |
| External system | Pink | Something outside the scope |
| Aggregate / consistency unit | Large pale yellow | The thing that accepts a command and checks rules |
| Hot spot | Red, tilted | Problem, question, disagreement |

### Sequence MIKA uses
1. **Chaotic exploration.** Everyone writes events they know, no order, no debate.
2. **Enforce the timeline.** Order events left to right; build the happy path, then the failure paths. Merge duplicates; settle words.
3. **Mark hot spots.** Bottlenecks, manual re-keying, errors, unknowns. Do not resolve them yet.
4. **Find the turning points.** A few events change the phase of the story ("Booking confirmed", "Vessel departed", "Manifest filed"). They often sit on future context edges.
5. **Add triggers.** For each event: which command or which policy caused it, and who acted.
6. **Add information needs.** What did the actor look at before deciding?
7. **Add outside systems.** Payment provider, port gate, maritime authority portal.
8. **Group into consistency units.** Cluster commands and events around the thing that must check rules. Name it in business words.
9. **Draw candidate boundaries.** Where words, actors, turning points or pace of change shift.

Steps 1–4 are the big-picture level; 5–9 are process and design level. Stop as soon as the goal is met.

### What keeps a session productive?
- One-sentence scope on the wall before the first note.
- Ask "what happened?", never "what does the system do?".
- Demand specific past-tense names: "Animal triaged", not "Triage" or "Update status".
- Park arguments on hot spots; revisit with the right people.
- Watch the room: invite quiet people, take the marker from whoever holds it too long, break every 60–90 minutes.
- Let early notes be messy; precision rises during the session.
- Photograph everything; transcribe within a day.
- After the session, turn every hot spot into a question with an owner.

### Remote variant
Prepared board with legend, scope and a parking lot; 5–8 people; sessions of 2–3 hours over several days; a co-facilitator who watches chat; a two-minute warm-up where everyone places a test note; breakout rooms for parallel timelines.

## How does a Domain Storytelling session run?
A domain expert tells one concrete, recent case ("Last Thursday a dog came in after a road accident…"). A moderator draws it live with three symbols: **actors** (people, systems), **work objects** (documents, animals, vehicles, money) and **activities** (arrows). Arrows are numbered so the picture reads as sentences: "1. Receptionist registers dog in clinic system. 2. Vet triages dog using triage card…".

Strengths: very concrete, quick to learn, shows hand-offs and the objects passed. Use it to check words, explore one scenario deeply, or scope a supporting area. Reach for the sticky-note timeline when you need the whole flow or consistency units.

Tip: tell the same story twice, *as-is* and *to-be*. The differences are the requirements.

## How does Example Mapping work?
For one user story: a yellow card for the story, blue cards for rules, green cards for concrete examples under each rule, red cards for open questions. Stop after 25 minutes. Many red cards mean the story is not ready; many blue cards mean it should be split. Good input for the rules in `08`.

## Reading the wall: turning workshop output into a model
When a caller pastes EventStorming or storytelling output, apply these steps in order.
1. **Normalise events.** Past tense, business words. Record synonyms ("booking"/"reservation") as glossary issues for `03`.
2. **Mark turning points** and the actors on either side of them.
3. **Propose consistency units.** For each cluster, write the rule it protects. No rule → merge it or drop it.
4. **Classify each policy.** Inside one area → a local reaction. Across areas → an integration; multi-step with timeouts → a coordinator (`09`).
5. **Draw boundaries** where language, actors or pace change; score each area with `04`.
6. **Convert hot spots** into OPEN QUESTIONS or RISKS.
7. **Produce the full model template** from SKILL.md.

### Mini-example (veterinary clinic network)
Wall extract: `Appointment requested → Appointment booked → Animal checked in → Animal triaged → Treatment plan agreed → Treatment given → Invoice raised → Insurance claim submitted → Claim paid`. Hot spot on "Treatment plan agreed": owners often refuse cost estimates.

Reading: turning points are *Animal checked in* (front desk → clinical) and *Invoice raised* (clinical → finance). Candidate areas: Scheduling, Clinical Care, Billing & Claims. Consistency unit in Clinical Care: *Treatment Plan* (rule: no procedure above the agreed estimate without renewed owner consent). Hot spot becomes the open question "Is consent re-captured per procedure or per plan revision?" which changes the Treatment Plan rules.

## Workshop planning template (for `ask` requests)
Return these sections:
- Goal (one sentence) and technique chosen, with the reason.
- Participants by role, and who must not be missing.
- Agenda with timings per step.
- Board or room setup, legend.
- Risks for this group (dominant voices, remote fatigue, missing expert) and mitigations.
- Expected outputs and follow-ups (glossary updates, open-question owners, next session).

## Checklist after any discovery session
- [ ] Glossary updated with agreed words and retired synonyms.
- [ ] Every hot spot has an owner and a due date.
- [ ] Turning points recorded; candidate boundaries sketched.
- [ ] At least one rule per consistency unit written down.
- [ ] Photos or board export stored next to the model.
