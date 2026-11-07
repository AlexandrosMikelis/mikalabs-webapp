# Microservice fundamentals

Use this file to anchor vocabulary in every mode. When a caller says "microservices", check which of the properties below they actually have; many estates called microservices are distributed monoliths.

## Working definition
A microservice is a separately deployable unit of software that offers a business capability to the rest of the system over the network, hides how it does so, and keeps the data it needs behind its own interface. A microservice architecture is a system built from many such units, each owned by one team.

Five properties do most of the work. Test each one explicitly.

| Property | What it means in practice | Quick test |
|---|---|---|
| **Independent deployability** | A team can change, test and release one service to production without coordinating a release with any other team. | "When did you last ship service X without touching anything else?" If the answer is "never", it is not independent. |
| **Aligned to a business capability** | The service exists because the business does something (quote a premium, schedule a technician), not because there is a technical layer (a "database service", a "validation service"). | Can a product manager describe what it does in business words? |
| **Owns its state** | Other services reach its data only through its API or the events it publishes. No one else reads or writes its tables. | Is there any other code with credentials to its database? |
| **Hides implementation** | Internals (language, storage engine, schema, framework) can change without consumers noticing. | Did the last internal refactor force a consumer release? |
| **Owned by one team** | One team decides, builds, runs and supports it. | Who gets paged when it fails at 03:00? |

Size is a consequence, not a property. A service should be small enough for one team to understand and replace, and no smaller. Lines of code or "two-pizza" rules are poor proxies; cognitive load on the owning team is the better measure (see `09`).

## The kinds of monolith
A monolith is any system where everything must be deployed together. That is a deployment fact, not a judgment.

- **Single-process monolith**: one codebase, one deployable, usually one database. Often the right starting point. Problems appear when many teams contend for the same release train.
- **Modular monolith**: one deployable, but internally split into modules with explicit interfaces and, ideally, separate schemas per module. Captures much of the design benefit of services (clear ownership, information hiding) without the network. Underrated; frequently the correct recommendation from `assess`.
- **Distributed monolith**: several deployables that must be released together because of shared databases, shared libraries carrying domain models, chatty synchronous chains or tightly versioned contracts. It has the costs of distribution and the coupling of a monolith. The most common failure mode of a migration done in a hurry.
- **Third-party black box**: packaged software (ERP, CRM, billing) that you cannot change. You can still wrap it, intercept calls to it, or replace pieces of it from outside (see `04`).

**Delivery contention** is the main practical pain of a large single-process monolith: many people, one release, one pipeline, unclear ownership of shared code. Microservices address contention; they do not address poor engineering practice, and they amplify it.

## What microservices can buy
Each benefit comes with a condition. Name the condition when you cite the benefit.

- **Team autonomy and parallel delivery** — if boundaries match team responsibilities and contracts are stable.
- **Faster, smaller, safer releases** — if each service has its own automated pipeline and can be rolled back alone.
- **Targeted scaling** — if load is genuinely uneven across capabilities; otherwise more replicas of the monolith may be cheaper.
- **Fault isolation** — if calls between services are protected (timeouts, bulkheads, degraded modes); otherwise one slow service drags down all callers.
- **Technology choice per problem** — if the organisation can support the variety; usually limit it (see `09`).
- **Isolating regulated or sensitive data** — moving card data or health records into a narrow service can shrink audit scope.
- **Replaceability** — a service small enough to rewrite in weeks lowers the cost of being wrong.
- **Composability** — capabilities exposed as APIs can be reused by new channels (mobile, partners, internal tools).

## What microservices cost
Present these honestly in `assess`; they are why "keep the monolith" is often right.

- **Latency and failure**: an in-process call that took nanoseconds becomes a network call taking milliseconds that can time out, fail halfway or arrive twice.
- **Data consistency**: no cross-service ACID transactions; you need sagas, compensations and eventual consistency (see `05`).
- **Operational load**: many deployables, pipelines, dashboards, alerts and on-call rotas. Requires automation and observability from day one (see `07`, `08`).
- **Testing**: end-to-end tests across many services become slow and flaky; you need contract testing and production verification instead (see `07`).
- **Developer experience**: running the whole system on a laptop stops being possible; developers need stubs, remote environments or narrow local subsets.
- **Reporting**: data spread across many stores needs a reporting pipeline rather than one SQL join.
- **Security surface**: more network hops, credentials and attack surface (see `08`; depth → Argus).
- **Cost**: more infrastructure, more tooling, more platform engineering.
- **Organisational change**: teams need product ownership, operational responsibility and autonomy; leadership must accept that (see `09`).

## Coupling and cohesion
Two forces decide whether a boundary is good.

- **Cohesion**: things that change together live together. A boundary that splits a frequently changed rule across two services makes every change a two-team, two-release affair.
- **Coupling**: how much one part must know or change when another changes. Some coupling is unavoidable; aim for coupling to stable, explicit, narrow contracts.

A good architecture has high cohesion inside services and low coupling between them. `03` gives a typed vocabulary of coupling to use in reviews.

## Enabling practices
Microservices became practical because of practices and tools that matured around them: infrastructure as code, continuous delivery, containers and orchestration, public cloud and managed services, log aggregation and distributed tracing, streaming platforms. Without most of these, the operational cost of many services is usually prohibitive. In `assess`, treat their absence as a readiness gap, not a footnote.

## Vocabulary used across this agent
- **Service estate**: all services an organisation runs, with their owners and dependencies.
- **Upstream / downstream**: upstream services are called or consumed by downstream ones; changes flow downstream as risk.
- **Consumer**: any service or client that calls or listens to a service.
- **Contract**: the explicit API, events and their schemas plus behavioural promises (latency, ordering, idempotency).
- **Seam**: a place in code where behaviour can be swapped without editing the callers; seams are where extraction starts.
- **Paved road**: the supported, self-service default way to build, deploy and run a service (see `09`).

## Worked framing example (invented)
A regional veterinary chain runs one booking-and-billing application. Four teams of six engineers share one release every two weeks, and clinic opening hours make Saturday releases risky. The tempting conclusion is "move to microservices". Applying this file:
- The real pain is delivery contention plus a slow, manual release process.
- Load is flat; scaling is not a driver.
- Billing has PCI scope that touches the whole codebase; isolating card handling is a real benefit.
- Recommendation path: automate the pipeline and zero-downtime deploys first, restructure into a modular monolith with a billing module, then extract card handling as the first service. That is a `prepare first` result, not a refusal.
