# Metis — Technology Strategy Advisor by MIKA Labs

A technology strategy advisor for CTOs, architects and consultants, and for other AI agents. Named after the Titaness of wise counsel in Greek myth. Works with any capable LLM: ChatGPT, Gemini, Copilot, Claude, Mistral, local models and any API or agent framework. Free to download and use.

**Tier: worker.** It does one specialist job and returns a structured result, so it can be called directly by people or by higher-level orchestrator agents.

## What it does
- **Assesses** a company's technology situation and proposes a strategy, following its own six moves (intake → framing → diagnosis → options → weighing and sequencing → communicating and steering): context, a sharp diagnosis of the core challenge, the forces that matter (world, industry, company, estate, people), a system view of feedback loops and side effects, at least two real options scored with reversibility weighted by uncertainty, a recommendation with a stop list, a Now/Next/Later roadmap and the signals that would change the call.
- **Reviews** an existing technology strategy, roadmap or business case and returns findings rated Critical/High/Medium/Low, each with its basis and a concrete fix, plus a verdict (Adopt / Adopt with conditions / Rework / Do not adopt).
- **Answers** questions: how to use scenarios, five forces or Wardley Maps; whether to make, rent, buy, co-develop or share a capability; how to explain a technical constraint to a board; feedback loops and leverage points; real options and deciding under uncertainty.

## How to use it
**As a person**: describe the situation, paste the document or ask the question. Examples:
- "Assess: regional ferry operator, 9 vessels, 15-year-old booking system whose vendor is in decline, board wants off-season load factor from 38% to 50% in three years."
- "Review: attached is our 2027–2029 IT strategy and the business case for replacing the practice-management systems in our 14 veterinary clinics."
- "Our energy co-op needs half-hourly meter data for a new tariff. Should we run our own data store or rent one?"
- "How do I show the executive team that our release process is the real growth constraint?"

**From another agent**: send the request with optional headers:
```
MODE: review
FORMAT: structured
CONTEXT: community energy co-op, EU, 12 staff, 3-year horizon
<strategy or roadmap text>
```
With `FORMAT: structured`, assess and review results come back as JSON. It never waits for answers: it states its assumptions and lists the open questions that would change a rating or recommendation.

**Works alongside**: for detailed architecture style choice, ask **Pallas**; for architecture diagrams and communication, **Iris**; for architecture measures and automated checks, **Chronos**. Metis names the hand-off when a request crosses into those areas.

## What it's built on
Widely used public methods: Rumelt's diagnosis, guiding policy and coherent actions; question trees; PESTLE and scenarios; Porter's five forces; Wardley Maps (CC BY-SA 4.0); Gartner's TIME model; capability maps; system dynamics and Meadows' leverage points; Cynefin; real options; cost of delay; TOGAF transition architectures; OKRs. On top of these, MIKA's own tools: a strategy-readiness diagnostic, option families, an option-scoring matrix weighted for reversibility, a one-page decision brief and a knowledge-graph model of the strategy.

## Limits
- **Strategic advice, not investment, legal or financial advice.** Costs are order-of-magnitude bands with ranges; have finance build the detailed model and legal check regulatory points.
- Market, vendor and regulatory facts move; anything marked general knowledge should be verified before a decision depends on it.
- It works from what you describe. A vague description gets an answer full of assumptions; give it the business goals, the estate, the constraints, the budget and who decides.
- It doesn't choose detailed architecture styles, draw diagrams or design architecture measures; it hands those off by name.
- Provided as is, without warranty. You are responsible for the decisions you make with it.

## Install
See **`INSTALL.md`** for step-by-step setup in ChatGPT, Gemini, Copilot, Claude, Mistral, local models and APIs. In short:
- **Instructions**: `system-prompt.md` (paste into any tool's instructions / system prompt field).
- **Knowledge**: the 10 files in `references/` (upload as knowledge files).
- **One file only?** Use `technology-strategy-advisor-all-in-one.md`.

## Maintenance
Re-check the regulatory and market examples in `references/03-outside-in-scan.md` and `references/01-intake-and-readiness.md` each half-year.

---
MIKA Labs · mikalaboratories.com · info@mikalaboratories.com

Independent work by MIKA Labs, written in its own words.
