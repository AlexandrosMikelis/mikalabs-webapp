# Naming: building the shared vocabulary

Software reflects the business only as well as its builders understand the words the business uses. This file covers how Gaia captures those words, makes them precise, scopes each one to the place where it holds, and keeps them alive.

Grounding: the *ubiquitous language* pattern in Evans' *DDD Reference* (CC-BY 4.0); W3C SKOS (2009 Recommendation) for concept labels and mappings; the open given–when–then scenario format used by BDD tools such as Cucumber. The glossary fields, the drift signals and the term-quality score are MIKA's.

## Why do words matter so much?
Each hand-over of knowledge (expert → analyst → ticket → engineer → code) paraphrases. After a few hops the code speaks of `Record`, `Item` and `Processor`, words nobody in the business uses, and every conversation needs silent translation that drops nuance. The cure is to remove hops: experts and engineers use one vocabulary, and that vocabulary appears unchanged in conversation, tickets, tests, APIs, events and class names.

## What makes a term good?
MIKA scores each candidate term on five checks (1 point each). Terms below 4 need work before they go into code.

| Check | Pass when… | Ferry-operator example |
|---|---|---|
| Business-born | An expert would use it unprompted | "Lane-metre", not "capacityUnit" |
| Single meaning here | Within its area it never means two things | "Sailing" = one departure at one time, never the route |
| Precise | It carries its rules ("a hold lapses after 20 minutes") | "Space hold" vs vague "pending" |
| No rival word | No second word for the same thing in the same area | Pick "passholder"; retire "season customer" |
| Lives in code | Class, event or API name matches (case aside) | `SpaceHold`, `SpaceHoldLapsed` |

Verbs and rules count as vocabulary too. "A vehicle may board only if its hold is confirmed and its height class fits the deck" is part of the language, not merely a requirement.

## Same word, different meaning; different word, same meaning
- **Homonym** (one word, several meanings). In a veterinary clinic network, *patient* means the animal to clinicians, while the billing team treats the *owner* as the account holder and calls the invoice line a "patient charge". *Visit* means one appointment to reception but a whole treatment episode to the surgical team. Fix: qualify the word, or, more often, recognise two areas with separate models (`05`).
- **Synonym** (several words, one meaning). "Member", "shareholder" and "household" used for the same party in an energy co-op. Fix: pick one per area; keep the retired words in the glossary so newcomers can translate.

Hidden homonyms are the costliest naming error: one class tries to serve two meanings, grows flags and conditionals, and a change for one group breaks the other.

## What goes in a glossary entry?
Keep the glossary in the repository next to the code (Markdown or YAML), short enough that people read it.

| Field | Content |
|---|---|
| Term | The word exactly as experts say it |
| Area | The bounded context where this meaning holds |
| Meaning | One or two sentences in business words |
| Rules | Lifecycle or consistency rules tied to the term |
| Not to be confused with | Same word elsewhere; retired synonyms |
| Code name | Identifier in code if it differs only by casing or spacing |
| Owner | Person or role who settles disputes about it |
| Status | proposed · agreed · deprecated |

Sample rows (community energy co-op):
- **Surplus** — Local Matching — half-hourly energy a member's array exports beyond the host's own use. Rule: only metered surplus can be matched; estimates are never matched. Not to be confused with *financial surplus* (Board Reporting).
- **Match** — Local Matching — an allocation of surplus from one array to a neighbour's demand for one half-hour. Rule: total matched ≤ metered surplus for that interval.
- **Member account** — Membership — the household's share and voting record. Not the *billing account* held by the partner supplier.

A glossary records nouns well and behaviour badly. Pair it with scenarios and with the model itself.

## Scenarios: language in motion
Write short, concrete stories with experts: who acts, what the system does, what changes. They expose missing words and contradictory rules faster than definitions. Executable form (given–when–then):
```
Given a sailing with 12 free lane-metres
And a space hold of 5 lane-metres for vehicle "AB12 CDE"
When the hold is not confirmed within 20 minutes
Then the hold lapses
And 12 lane-metres are free again
```
Every capitalised idea in a scenario should exist in the glossary.

## Who keeps the language honest?
- **Experts** own meaning.
- **Engineers** own faithful use. A pull request that introduces a new term should add it to the glossary after checking with an expert, or rename.
- **Product people** facilitate conversations rather than translate between camps.

### Signs of drift
- Stand-ups use one word, code another.
- Tickets carry a "translation" paragraph.
- Newcomers keep a private dictionary.
- Events and API fields use technical words (`status`, `flag`, `type`) where experts would name a state.
- Experts argue about a word in every meeting: often two areas hiding in one.

## A model is a purposeful simplification
A model keeps only the concepts, relationships and rules needed for one problem and drops everything else. A ferry's stability plan and its passenger-deck seating chart describe the same vessel, yet each leaves out almost everything the other shows, and each is right for its job. Consequences:
- There is no complete model. Ask what decision it must support, then stop.
- Different problems justify different models of the same thing (`05`).
- The vocabulary *is* the model's interface; diagrams and code express it.

## Handling naming trouble
| Trouble | Response |
|---|---|
| Experts are hard to reach | Short regular slots; a proxy only temporarily, verified later |
| Experts disagree | Often two areas or an undecided business rule; surface it as an open question |
| Legacy names are entrenched | Use the right term in new code; map legacy names at the boundary (`06`) |
| Several natural languages | One working language per area; translations recorded as alternative labels |
| Engineering jargon creeps in ("handler", "manager") | Ask "would an expert say this?"; rename if not |

## From glossary to graph
A glossary maps directly onto SKOS: each entry becomes a `skos:Concept` with `skos:prefLabel` (term), `skos:altLabel` (retired synonyms), `skos:definition` (meaning) and `skos:inScheme` pointing at the area's concept scheme. Homonyms become two concepts in two schemes, never one. Details in `10`.

## What goes into the model template
List 10–25 terms: term — one-line meaning — area. Flag homonyms explicitly ("*Visit*: Reception = one appointment; Surgery = treatment episode → two areas"). Note retired synonyms.
