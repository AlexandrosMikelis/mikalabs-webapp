# Candidate cards: styles that ship as one deployable

Use when a candidate, or the system under review, runs as a single deployable. Each card gives its position on the five axes from `06`, how it is built, when to choose and avoid it, what to check in a review, and a house example. The judgements are Pallas's own qualitative guidance; always reason from the system's top-3 targets, not from a style's reputation.

---

## Modular monolith — capability modules inside one deployable
**Axes:** A1 capability · A2 one · A3 in-process (calls or in-process events) · A4 schema per module, ideally · A5 any.

**How it is built.** One deployable, divided into modules that follow business capabilities (booking, clinical records, billing). Each module owns its logic and, ideally, its own schema or tables, and exposes a narrow public interface. Layering inside a module is fine.

**Rules that make it work.**
- Modules talk only through published interfaces (facades, in-process events), never through each other's internals.
- Boundaries are enforced by machinery, not goodwill: language visibility, separate build modules, dependency rules or architecture tests in CI.
- Another module's data is reached through its interface; no joins across module schemas. This keeps extraction possible.

**Choose it when**
- business change mostly stays inside one capability;
- teams want clear ownership without paying for distribution;
- the organisation is small to medium, or unsure whether services will ever be needed;
- you want a deliberate stepping stone: modules can later become services where targets demand it.

**Avoid it, or extend it, when**
- parts need very different runtime profiles (a burst-heavy intake beside a heavy monthly batch);
- many teams need different release rhythms and one release train blocks them;
- fault isolation is a top-3 target (one module can still bring down the process).

**Review checks**
- imports of another module's internal classes; cyclic module dependencies;
- shared tables or cross-module joins;
- a "common" module that everything depends on;
- modules drawn by technical role rather than capability (a layered system in disguise);
- weak capability boundaries → **Gaia**.

**House example.** The veterinary clinic network: Appointment Booking, Reception, Clinical Records, Billing & Claims and Reminders as modules in one application, each with its own schema, deployed twice a week by two teams.

---

## Layered — one deployable sliced by technical role
**Axes:** A1 technical role · A2 one (may be split into physical tiers) · A3 in-process · A4 one shared store · A5 usually none.

**How it is built.** Horizontal layers by technical job — typically presentation, application/business logic, persistence, then the database; sometimes an integration layer. A request travels down and back up. Physically it can still be split into tiers (front end, back end, database server) without changing the logical style.

**Rules that make it work.**
- Dependencies point downwards only.
- Decide per layer whether callers may skip it. Strict pass-through keeps a change inside one layer (a new persistence technology stays hidden behind its interface); allowing skips saves forwarding code but lets changes leak upwards. Write down which layers may be skipped and why.
- It is the default shape of many web frameworks (MVC and similar), which is why so many systems start here.

**Choose it when**
- the application is small or simple: internal tools, early versions, tight budget and time;
- teams are organised by technical skill;
- most expected change is technical (new UI, new database) rather than business-wide;
- business boundaries are still unclear and you want to start cheaply — with a revisit trigger.

**Avoid it when**
- business changes cut through every layer and every team;
- the codebase grows large: release risk, test time and start-up time grow with it;
- elasticity, fault isolation or independent scaling are top-3 targets;
- several teams must work in parallel on different capabilities.

**Review checks**
- **Forwarding-only layers**: most requests pass through layers that add nothing. Some is normal; if the large majority of requests are pure pass-through, consider opening a layer or changing shape (a heuristic, not a law);
- business rules leaking into presentation or persistence;
- layers bypassed informally (UI querying the database) with no recorded decision;
- capabilities invisible in the code, making later extraction expensive.

**House example.** The ferry operator's internal crew-rostering tool: one small team, few users, changes mostly to screens and reports. Layered is enough; revisit trigger "a second team starts working on it".

---

## Microkernel — a stable core with plug-ins
**Axes:** A1 mixed · A2 usually one (plug-ins may be remote) · A3 in-process or remote · A4 core owns main data · A5 plug-ins.

**How it is built.** A small, stable host application runs the main workflow and exposes **extension points**. Extensions (plug-ins) are discovered from a catalogue or configuration and hook into those points through a versioned **plug-in interface** stating what each extension receives and returns. The arrangement is familiar from extensible IDEs, browsers, OSGi-based platforms and Java's `ServiceLoader`.

**Rules that make it work.**
- Variation lives in plug-ins; the core stays stable.
- Plug-ins do not call each other; the core mediates. Plug-in-to-plug-in calls bring back the coupling the style exists to remove.
- One standard plug-in interface, with adapters for third-party extensions that have their own shapes.
- Per plug-in, choose in-process (fast, simple) or remote (isolated, separately deployable, but paying distribution costs).
- Plug-ins may keep small stores of their own but never reach into the core's database.

**Choose it when**
- products where customers, regions or schemes need custom behaviour: tariff schemes per region, clinic-specific consent rules, port-specific fee rules;
- the core workflow is stable and the variants are many and change often;
- configurability, extensibility and testability of variants are top-3 targets.

**Avoid it when**
- there is no stable core — everything varies;
- elasticity or fault isolation is needed across the board (still one deployable unless plug-ins are remote);
- plug-ins need to share lots of state or call each other;
- the plug-in interface changes constantly, forcing extension rework.

**Review checks**
- a bloated core holding variant logic;
- plug-ins coupled to each other or to the core's internals;
- an unversioned plug-in interface; no compatibility tests between host and extensions;
- hard-coded plug-in lists where runtime discovery was needed, or the reverse.

**House example.** The energy co-op's billing core with one plug-in per regional tariff scheme (the trade-off sheet in `05`).

---

## Pipeline — ordered processing steps
**Axes:** A1 by processing step · A2 one (distributed variants exist as stream processing) · A3 one-way data flow · A4 usually per step or none · A5 by swapping steps.

**How it is built.** Work is broken into independent processing steps joined by one-way channels, the long-established pipes-and-filters arrangement familiar from Unix shell pipelines. Each step reads input, does one job (read, validate, enrich, convert, route, write) and hands its output to the next; steps share nothing but the data that flows between them.

**Choose it when**
- data flows through ordered, mostly stateless transformations: ETL, media processing, document conversion, compilers, log processing, simple integration flows;
- steps should be reusable and recombinable;
- simplicity and low cost matter more than elasticity.

**Avoid it when**
- interactions need request/response or rich branching;
- steps need shared state or transactions spanning several steps;
- steps scale very differently (consider a stream-processing variant).

**Review checks**
- one step doing far too much (a hidden monolith);
- no policy for an item that fails mid-pipeline (retry, park, discard?);
- ordering and back-pressure assumptions unstated.

**House example.** The energy co-op's nightly settlement: import meter files → validate → apply tariffs → produce statements → send to the payment provider.

---

## Picking among single-deployable styles
| If the system … | Start from | Revisit when |
|---|---|---|
| has reasonably clear capabilities and mostly business change | modular monolith | a module needs its own runtime profile or release rhythm |
| is small, mostly technical change, cheapest start wanted | layered | a second team joins, or business change starts cutting through layers |
| is defined by many variants around a stable workflow | microkernel (or plug-ins inside one module) | variants need separate runtime profiles |
| is a one-way series of transformations | pipeline | steps need very different scale |

Combine as needed: a modular monolith whose billing module uses tariff plug-ins; technical layers inside each module. If a top-3 target is elasticity, fault isolation or independent releases for many teams, a single deployable will strain: look at `08`, or extract only the part that needs it.
