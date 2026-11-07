# Code-level governance and structural metrics

The cheapest and fastest checks read the code and its dependency graph. This file covers the rules worth encoding, the structural measures worth knowing, and how Chronos keeps them from turning into noise.

## Which dependency rules are worth encoding?
Most structural decay is a dependency that should not exist. Write the intended structure down as rules and check it on every change.
- **Layers**: presentation → application → domain; the domain depends on nothing outward. Infrastructure implements domain interfaces, never the reverse (ports and adapters, Cockburn).
- **Module edges**: module A uses only module B's published API package, never its internals.
- **Direction**: imports between named areas flow one way (feature modules → shared kernel, never back).
- **No cycles** between packages, namespaces, modules or services.
- **Forbidden dependencies**: no vendor SDK outside its adapter; no test helpers in production code; no deprecated libraries.
- **Placement conventions** where they carry architectural meaning (every persistence adapter under `adapters.persistence`).

Tool classes (examples; verify versions and language support): ArchUnit for JVM languages, ArchUnitNET and NetArchTest for .NET, dependency-cruiser and ESLint import rules for JavaScript/TypeScript, import-linter for Python, `depguard`-style linters for Go, jQAssistant for storing code structure as a graph and querying rules in Cypher. All of them express rules as tests or configuration that run in CI.

How Chronos introduces rules:
- Start with the few rules that protect the boundaries that matter most. Five rules everybody understands beat a hundred nobody reads.
- On legacy code, freeze today's violations in a baseline file (ArchUnit's "freezing rules" and dependency-cruiser's known-violations file both do this) and fail only on new ones; burn the baseline down on purpose.
- Keep rule definitions beside the code they govern, reviewed like code.
- Name each rule after the decision it enforces and link the ADR.

### Code structure as a knowledge graph
Modules, classes, imports, owners and ADRs fit naturally into a graph: `(:Module)-[:DEPENDS_ON]->(:Module)`, `(:Team)-[:OWNS]->(:Module)`, `(:Rule)-[:ENFORCES]->(:ADR)`. Questions like "which cross-team dependencies have no contract test?" or "which rules trace to no decision?" then become one query. This is how MIKA usually models an estate before proposing checks.

## Package-level coupling measures
These are the widely used package metrics from object-oriented design practice (Robert C. Martin):
| Measure | What it counts | How to read it |
|---|---|---|
| **Ca (incoming)** | outside elements that depend on this one | many dependants: risky to change, should be stable |
| **Ce (outgoing)** | outside elements this one depends on | many dependencies: fragile, hit by others' changes |
| **Instability I** | Ce ÷ (Ca + Ce), 0 to 1 | 0 = everyone depends on it and it depends on nothing; 1 = the opposite |
| **Abstractness A** | abstract types ÷ all types, 0 to 1 | share of interfaces and abstract classes |
| **Balance D** | how far the module sits from the line where A and I add up to one; computed as the absolute value of 1 − A − I | close to 0 is balanced. Concrete and heavily depended on (A and I both near 0) is painful to change; abstract with no dependants (both near 1) is unused abstraction |

Uses: list concrete, heavily depended-on modules as refactoring candidates; fail the build if D for a core module rises past an agreed bound. Depend in the direction of stability: a stable module should not depend on an unstable one.

## Complexity and size
- **Cyclomatic complexity** (McCabe, 1976) counts independent paths through a function. Use it as a guard rail, not a target: a per-function warning level (teams often pick 10–15) and a look at the distribution, never the average.
- **Size**: share of code in very large files, classes or functions. Size predicts change cost and defect density.
- Global limits invite meaningless function splitting. Pair them with review and hotspot data, show trends, highlight new outliers, and agree limits with the team instead of imposing them.

## Whole-graph measures
Single-module numbers can all look fine while the system is one big knot. Chronos also looks at the graph as a whole:
- **Average dependency count**: for each component, count what it depends on directly or transitively (including itself), then average. It shows how far a change can ripple. Compare a system with itself over time.
- **Propagation cost** (MacCormack, Rusnak and Baldwin, 2006): that average divided by the number of components, as a percentage: roughly the share of the system a typical change could affect. Large systems should keep it low.
- **Tangles**: strongly connected groups of components where everything reaches everything. Track the number of tangles and the size of the largest at namespace and module level; one big tangle is worse than several small ones.
- **Cost to untangle**: two systems with similar tangles can differ greatly in how many dependencies must be cut. Tools that suggest the smallest set of edges to remove help prioritise.
- **Layerability**: once tangles are collapsed, can components be arranged so all dependencies point one way? A cleanly layered graph keeps change local.

Example checks: "no new tangle at namespace level"; "propagation cost stays at or below baseline"; "the largest tangle shrinks every quarter".

## Structure health score (MIKA)
Chronos summarises structure on four 0–3 scales, scored partly from tools and partly from review:
| Scale | 0 | 3 |
|---|---|---|
| **Boundaries** | no recognisable modules | each module has a clear job and a published API |
| **Direction** | tangles everywhere | no cycles; dependencies follow the intended layers |
| **Consistency** | every area solves the same problem differently | the chosen patterns are applied the same way throughout |
| **Locality** | a typical change touches many modules | a typical change stays inside one module (from change history) |

Boundaries count double, because the other three depend on it. Maximum 15. Use the score to compare a system with its own past and to inform refactor-or-replace decisions (`09`); never to rank unrelated systems.

## What does version history reveal?
Version control shows where structure actually hurts:
- **Hotspots**: files that change often *and* are complex. A small share of files usually carries most of the change effort; start there.
- **Change coupling**: files that change together without a static dependency explaining it, often a hidden rung-3 to rung-5 agreement (`05`) across modules or services.
- **Knowledge spread**: areas only one person has touched (key-person risk), and areas untouched for years that are about to change.
- **Interface churn**: frequent changes to published APIs signal an unstable contract.
Example checks: alert when a new hotspot appears; flag change coupling across service boundaries above an agreed level.

## Ready-made checks worth having
- **Licence compliance**: fail on licences outside an approved list; re-scan on a schedule.
- **Known vulnerabilities**: fail on critical findings in dependencies and containers; track the age of open findings.
- **Dependency freshness**: a scheduled check that warns when key frameworks fall behind supported versions.
- **Accessibility linters** for user interfaces.
- **Convention linters** where the convention protects a quality (no blocking I/O on request threads).
- **Secret detection** in code and configuration.

## How does a chart become a check?
1. Measure and chart, to learn the baseline and normal variation.
2. Agree a threshold or ratchet with the team.
3. Warn in the pipeline.
4. Block on regression once the signal has proved reliable.
5. Review periodically; retire the check if it no longer informs decisions.

## Mistakes to avoid
- Computing measures at a level nobody acts on (method averages over a million lines).
- Copying thresholds from blog posts instead of baselining.
- Rules that forbid reasonable designs because they encode a method preference (see "result or method" in `02`).
- Treating tool scores such as "debt in days" as precise; they are relative indicators.
- Looking only at modules and never at the whole graph.
