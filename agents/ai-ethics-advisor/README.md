# Themis — AI Ethics Advisor by MIKA Labs

An advisor on the ethical side of AI, for people and for other AI agents. Works with any capable LLM: ChatGPT, Gemini, Copilot, Claude, Mistral, local models and any API or agent framework. Free to download and use.

## What it does
- **Reviews** an AI system, feature, agent design, use case or vendor tool and returns findings rated Critical/High/Medium/Low, each with its basis and a concrete mitigation, plus EU AI Act flags and a verdict (Proceed / Proceed with conditions / Redesign / Do not proceed).
- **Answers** questions on AI ethics: concepts (e.g., "what is meaningful human control?"), dilemmas ("is it fair to use postcode in a credit model?"), and positions in the debate.

## How to use it
**As a person**: describe the system or ask the question. Examples:
- "Review: we want an LLM to pre-screen supplier invoices and auto-approve those under €5k."
- "Review this design doc: [paste]"
- "Is a human approval step enough to call our system human-controlled?"
- "Which parts of the AI Act apply to a CV-screening tool we resell?"

**From another agent**: send the request to the advisor with optional headers:
```
MODE: review
FORMAT: structured
CONTEXT: financial services, EU, deployer role
<system description>
```
With `FORMAT: structured`, reviews come back as JSON. It never waits for answers: it states its assumptions and lists the open questions that would change a rating.

## What it's built on
Published, widely used frameworks: Universal Declaration of Human Rights; Belmont Report; four principles + explicability (Floridi & Cowls); EU HLEG Ethics Guidelines for Trustworthy AI (2019) and ALTAI; EU AI Act incl. Digital Omnibus Reg. (EU) 2026/1744; Design for Values / Value Sensitive Design (van den Hoven; Friedman); Winner on political artefacts; Rawls and the algorithmic-fairness literature (Mitchell et al.; Wachter et al.); responsibility theory (van de Poel & Royakkers; Matthias; Danaher); Meaningful Human Control (Santoni de Sio & van den Hoven 2018); explainable AI (Burrell; Rudin; Lipton); sustainable AI (van Wynsberghe; Crawford); ethics of risk and AI risk (Hansson; Bostrom; Chalmers).

## Limits
- **Not legal advice.** Regulatory points are flags for Legal/Compliance to confirm.
- AI Act dates were checked on 1 Nov 2026; regulation moves, so re-verify for decisions that depend on dates.
- It reviews what you describe. A vague description gets a review full of assumptions; give it the purpose, data, affected people and level of automation.
- Provided as is, without warranty. You are responsible for the decisions you make with it.

## Install
See **`INSTALL.md`** for step-by-step setup in ChatGPT, Gemini, Copilot, Claude, Mistral, local models and APIs. In short:
- **Instructions**: `system-prompt.md` (paste into any tool's instructions / system prompt field).
- **Knowledge**: the 10 files in `references/` (upload as knowledge files).
- **One file only?** Use `ai-ethics-advisor-all-in-one.md`.

## Maintenance
Re-check `references/02-eu-ai-act.md` each quarter and after major regulatory news.

---
MIKA Labs · mikalaboratories.com · info@mikalaboratories.com
