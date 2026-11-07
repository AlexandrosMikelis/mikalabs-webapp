# Graphing: turning the domain model into a knowledge graph agents can use

A domain model is already most of a knowledge graph. The vocabulary names the concepts and relations, contexts say where each meaning holds, the relationship map says how meanings connect, and events say what changes what. Publishing that as a graph lets AI agents look up what a word means *in which context*, which team is responsible for it, which events change it and how it maps across contexts, instead of guessing from code and documents. This is the centre of MIKA's work on agentic knowledge graphs.

Grounding: W3C RDF 1.1, RDFS, OWL 2, SKOS (2009), SHACL (2017) and PROV-O (2013) Recommendations; openCypher for labelled property graphs; JSON-LD 1.1; data-product thinking from Dehghani's public data-mesh articles on martinfowler.com. The MIKA domain-graph schema, its rules and the agent-readiness score are MIKA's.

## The MIKA domain-graph schema
| Model element | Node / class | Key relationships |
|---|---|---|
| Business area (subdomain) | `Area {name, profile, D, E, C, V}` — profile from `04` | `(Context)-[:REALISES]->(Area)` |
| Bounded context | `Context {name, purpose, buildShape}`; in RDF also a named graph and a `skos:ConceptScheme` | `(Team)-[:OWNS]->(Context)` |
| Team | `Team {name, topology}` | `OWNS` |
| Term | `Term {label, definition, status}` = `skos:Concept` | `(Term)-[:DEFINED_IN]->(Context)`; `altLabel` for retired synonyms |
| Homonym | Two `Term` nodes, same label, different contexts | Never merged |
| Cross-context correspondence | — | `(Term)-[:CORRESPONDS_TO {via, fidelity}]->(Term)`; in SKOS `closeMatch`, `relatedMatch`, `exactMatch` |
| Aggregate, entity, value type | `Aggregate`, `Entity`, `ValueType` | `(Aggregate)-[:HAS_PART]->(Entity)`, `(Entity)-[:HAS_VALUE]->(ValueType)`, `(Aggregate)-[:EXPRESSES]->(Term)` |
| Rule | `Rule {text, kind: invariant\|policy\|corrective}` | `(Rule)-[:CONSTRAINS]->(Aggregate)`; `(Rule)-[:OWNED_BY]->(Person/Role)` |
| Request (command) | `Command {name}` | `(Command)-[:HANDLED_BY]->(Aggregate)` |
| Domain event | `Event {name, scope: private\|public, version}` | `(Aggregate)-[:EMITS]->(Event)`; `(Context)-[:SUBSCRIBES_TO]->(Event)` |
| Policy / coordinator | `Policy`, `Coordinator` | `(Event)-[:TRIGGERS {via}]->(Command)` |
| Context relationship | — | `(Downstream)-[:DEPENDS_ON {pattern, terms, distance, style}]->(Upstream)` |
| Decision | `Decision {title, date, status}` | `(Decision)-[:AFFECTS]->(Context\|Aggregate)`; provenance with PROV-O |
| Data product | `DataProduct {name, schemaRef, slo}` | `(Context)-[:PUBLISHES]->(DataProduct)`; `(DataProduct)-[:DERIVED_FROM]->(Event)` |

`terms` and `distance` on `DEPENDS_ON` carry the answers from the selection guide in `06`, so an agent can explain *why* a pattern was chosen.

## Five rules for a domain graph
1. **Context first.** Never one global `Customer` or `Visit` node for several meanings. Scope every term to a context and link meanings with explicit correspondence edges. This is what a DDD-shaped graph adds over a flat enterprise glossary, and it stops agents from mixing meanings.
2. **The expert's word is the label.** Code identifiers are properties (`codeName`), not labels.
3. **Schema and instances apart.** The domain graph describes *types* (what a `TreatmentPlan` is). Instance graphs (actual plans) reference it.
4. **Generate, don't hand-edit.** Build nodes from the glossary file, the context-map file, the event catalogue and the decision records in the repository, in CI, so the graph moves with the model.
5. **Deprecate, don't delete.** When a term is retired, set `status: deprecated` and keep a `replacedBy` edge so old documents still resolve.

## Correspondence fidelity
When two contexts' terms relate, record how faithfully:
| Fidelity | SKOS property | Meaning | Ferry example |
|---|---|---|---|
| exact | `skos:exactMatch` | Interchangeable in all uses (rare) | Vessel IMO number in Operations and Finance |
| close | `skos:closeMatch` | Same real thing, different rules or attributes | Sales *Sailing* ↔ Operations *Sailing* |
| related | `skos:relatedMatch` | Linked, not the same thing | Operations *Manifest* ↔ Sales *Booking* |
| broader/narrower | `skos:broadMatch` / `narrowMatch` | One includes the other | Finance *Route revenue* ⊃ Sales *Fare* |

`via` names the mechanism (ACL, open contract, co-owned kernel) so agents know where the conversion code lives.

## Examples
Property graph (openCypher):
```cypher
MERGE (cc:Context {name:"Clinical Care", buildShape:"behavioural model"})
MERGE (bc:Context {name:"Billing & Claims", buildShape:"record-centred"})
MERGE (v1:Term {label:"Visit", definition:"Whole treatment episode from triage to discharge"})-[:DEFINED_IN]->(cc)
MERGE (v2:Term {label:"Visit", definition:"One billable appointment slot"})-[:DEFINED_IN]->(bc)
MERGE (v1)-[:CORRESPONDS_TO {via:"ACL", fidelity:"related"}]->(v2)
MERGE (tp:Aggregate {name:"TreatmentPlan"})-[:EMITS]->(:Event {name:"TreatmentPlanCompleted", scope:"public", version:1})
MERGE (bc)-[:DEPENDS_ON {pattern:"ACL", terms:"negotiable", distance:"far", style:"events"}]->(cc)
```

RDF (Turtle), one namespace and concept scheme per context:
```turtle
@prefix skos: <http://www.w3.org/2004/02/skos/core#> .
@prefix care: <https://example.org/vet/clinical-care#> .
@prefix bill: <https://example.org/vet/billing#> .

care:scheme a skos:ConceptScheme ; skos:prefLabel "Clinical Care"@en .
bill:scheme a skos:ConceptScheme ; skos:prefLabel "Billing & Claims"@en .

care:Visit a skos:Concept ; skos:inScheme care:scheme ;
  skos:prefLabel "Visit"@en ;
  skos:definition "Whole treatment episode from triage to discharge."@en ;
  skos:relatedMatch bill:Visit .

bill:Visit a skos:Concept ; skos:inScheme bill:scheme ;
  skos:prefLabel "Visit"@en ;
  skos:definition "One billable appointment slot."@en .
```
OWL is optional; add it only when reasoning (class hierarchies, disjointness) earns its keep.

### Validating the graph with SHACL
Shapes turn modelling rules into checks that run in CI:
```turtle
@prefix sh:   <http://www.w3.org/ns/shacl#> .
@prefix skos: <http://www.w3.org/2004/02/skos/core#> .
@prefix mika: <https://example.org/mika/shapes#> .

mika:TermShape a sh:NodeShape ;
  sh:targetClass skos:Concept ;
  sh:property [ sh:path skos:inScheme ; sh:minCount 1 ; sh:maxCount 1 ] ;
  sh:property [ sh:path skos:definition ; sh:minCount 1 ] .
```
Typical shapes: every term in exactly one scheme; every published event has a version and an owning context; every context has exactly one owning team; every aggregate in a core area constrained by at least one rule.

## What agents gain
| Agent question | Graph lookup |
|---|---|
| "What does *hold* mean here, and who decides?" | `Term` by label + context → definition, rules, owner |
| "Which team should get this ticket?" | Terms in the ticket → contexts → owning team |
| "Is this generated code using the right word?" | Identifiers vs `codeName` of terms in the target context |
| "What breaks if the consent rule changes?" | `Rule` → aggregate → emitted events → subscribers → their published datasets |
| "Why is this integration an ACL?" | `DEPENDS_ON {terms, distance}` + linked `Decision` |
| Grounded retrieval (graph RAG) | Fetch context-scoped definitions, rules and events alongside text chunks |

## Exposing the graph to agents
Agents should not write free-form graph queries against the domain graph; give them a few narrow tools. With the Model Context Protocol (MCP), or any function-calling interface, MIKA's default tool set is:
| Tool | Input | Returns |
|---|---|---|
| `define_term` | label, optional context | Definition, rules, owner, status; all contexts if the label is a homonym |
| `route_request` | free text | Ranked contexts and owning teams, with the matched terms as evidence |
| `trace_impact` | rule, aggregate or event | Downstream events, subscribers, published datasets, linked decisions |
| `check_vocabulary` | code or document text, target context | Terms used outside their context, deprecated terms, unknown terms |
| `explain_relationship` | two context names | Pattern, Terms & Distance answers, contract location, decision record |

Design notes:
- Read-only by default. Changes to the graph come from the repository pipeline, not from agents.
- Every answer carries its source node IDs, so a human can check the claim.
- When `define_term` finds a homonym and no context was given, return all meanings and ask the calling agent to choose; never pick silently.

### Retrieval recipe for graph-grounded answers
1. Extract candidate terms from the question (string match on `prefLabel` and `altLabel`, then embeddings as a fallback).
2. Resolve each term to its context; if ambiguous, keep all candidates.
3. Expand one or two hops: rules, events, owning team, correspondences.
4. Retrieve text chunks (decision records, docs) linked to those nodes.
5. Answer with graph facts first and text second, citing node IDs.
This keeps agents from blending meanings across contexts, the most common failure of plain vector retrieval over company documents.

## Agent-readiness score (0–10)
Used in the optional review lens in `11`. One point each:
1. Glossary exists in the repository.
2. Each term scoped to one context.
3. Relationship map stored as a file (not only a picture).
4. Event catalogue with owners and versions.
5. Published contracts as OpenAPI or AsyncAPI.
6. Decision records linked to contexts.
7. Graph generated in CI from the above.
8. SHACL (or equivalent) checks run in CI.
9. Deprecated terms kept with `replacedBy`.
10. At least one agent or tool actually queries the graph.
0–3: agents will guess. 4–6: agents can look up words but not consequences. 7–10: agents can trace impact and explain decisions.

## Reporting data published as products
Reporting and analytics data follow the same boundaries. The team responsible for a context is also responsible for the reporting data it emits; that data is published deliberately, with schema, documentation, quality targets and versions (essentially a published contract for analytics). Domain events are a natural source, and contexts that use event sourcing can project history directly. Never expose operational tables as published datasets; name columns and metrics in the context's vocabulary and link each product to its terms in the graph so agents can interpret it.

## What goes into the model template
The KNOWLEDGE GRAPH VIEW line gives, in 3–8 lines: node types used, relationship types, how context scoping is done (namespaces, schemes or a `context` property), and any homonyms with their correspondence fidelity. Provide a full schema in Turtle, Cypher or JSON-LD only when asked.
