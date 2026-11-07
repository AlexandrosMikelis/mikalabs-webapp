# Atlas — Scalability Reviewer by MIKA Labs

A scalability and distributed-systems reviewer, for people and for other AI agents. Named after the Titan who holds up the sky: it checks whether your system can carry the load you are about to put on it. Works with any capable LLM: ChatGPT, Gemini, Copilot, Claude, Mistral, local models and any API or agent framework. Free to download and use.

**Tier: worker.** It does one specialist job and returns a structured result, so it can be called directly by people or by higher-level orchestrator agents.

## What it does
- **Reviews** an architecture against a load profile: back-of-envelope capacity estimates, then findings rated Critical/High/Medium/Low on bottlenecks, statelessness, load balancing, caching, replication and partitioning, consistency choices, asynchronous processing and back-pressure, failure modes and resilience, observability and the cost of scale — each with its basis and a concrete fix — plus a verdict (Scales as designed / Scales with conditions / Redesign / Will not scale).
- **Designs** a system for a target load: a capacity plan, a staleness budget per operation, then patterns chosen by the pressure they relieve (repeated work, bursts, oversized state, fan-out tails, single-owner roles, multi-stage work, blast radius), always at the simplest rung that gives headroom — with data partitioning, replication settings, resilience and operations.
- **Answers** questions: CAP vs PACELC, read/write copy counts, consistent hashing, reading from copies vs sharding, keeping caches fresh, draining backlogs, duplicate-free delivery claims, Little's law, why adding nodes stopped helping.

## How to use it
**As a person**: describe the system, its load and the target, or ask the question. Examples:
- "Review: ferry booking site, one Node API behind a load balancer, sessions in memory, one Postgres. The summer schedule release peaks at 10k requests/s for fifteen minutes."
- "Design: a meter-data backend for an energy co-op with 400,000 smart meters reporting every 30 seconds, dashboards within 2 minutes."
- "Our clinic-availability search fans out to 64 partitions and p99 got worse when we went from 32. Why?"
- "When is a lease-holding leader worth it over a single restarted instance?"

**From another agent**: send the request with optional headers:
```
MODE: review
FORMAT: structured
CONTEXT: veterinary clinic network, 3k rps today, 15k rps at the 08:00 rush, p99 < 300 ms, one cloud region
<architecture description>
```
With `FORMAT: structured`, review and design results come back as JSON. It never waits for answers: it states its assumptions and lists the open questions that would change a rating.

**What it hands off**: gateways and service mesh → Daedalus; microservice decomposition → Theseus; serverless-specific design → Aeolus; multi-tenant SaaS → Hestia; event streaming design → Nereus.

## What it's built on
Open standards and public engineering practice, arranged in MIKA's own eleven-step review walk: Little's law and the Universal Scalability Law, public consistency maps, CAP and PACELC, foundational papers on replication and agreement, consistent hashing, RFC 9111 and related HTTP standards, the Google SRE book, the AWS Builders' Library, the Azure Architecture Center pattern catalogue, Kubernetes probes and autoscaling. MIKA adds its own tools: staleness budgets, a bottleneck triage table, a partition-key scorecard, a pressure-to-pattern map and a blast-radius scorecard.

## Limits
- **Architecture advice, not vendor selection.** Products are named as examples; verify current versions, limits and pricing.
- Capacity numbers are estimates from what you describe. They point to the likely bottleneck; they don't replace a load test.
- It doesn't run, test or monitor your systems.
- Provided as is, without warranty. You are responsible for the decisions you make with it.

## Install
See **`INSTALL.md`** for step-by-step setup in ChatGPT, Gemini, Copilot, Claude, Mistral, local models and APIs. In short:
- **Instructions**: `system-prompt.md` (paste into any tool's instructions / system prompt field).
- **Knowledge**: the 11 files in `references/` (upload as knowledge files).
- **One file only?** Use `scalability-reviewer-all-in-one.md`.

## Maintenance
Re-check the product examples in `references/04`, `06` and `10` each year; the principles change slowly.

---
MIKA Labs · mikalaboratories.com · info@mikalaboratories.com

Independent work, written by MIKA Labs in its own words.
