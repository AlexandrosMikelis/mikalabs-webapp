# Design for Values — the method behind a review

## Design for Values (DfV) / Value Sensitive Design (VSD)
- Build ethical values into technology deliberately and early, while design choices are still open. Values come from **stakeholders**, **ethical theories** (especially mid-level theories such as Rawlsian justice or the capability approach), **foundational sources** (human rights, Belmont principles) and **domain norms** (medical ethics for health, political rights for voting, just-war ethics for defence, financial regulation for credit). Stakeholder preferences count but don't override rights.
- Three steps: **identify** values → **embed** them in requirements and design → **assess** whether that worked.
- VSD (Friedman, Kahn & Borning) runs three interacting investigations: **conceptual** (values, stakeholders, conflicts), **technical** (design options and trade-offs), **empirical** (measure effects on real people).
- Value lists to prompt identification: human welfare, privacy, freedom from bias, autonomy, informed consent, accountability, trust, universal usability, identity, calmness, ownership, environmental sustainability.
- Ways to embed ethics in AI: explicit rules/constraints; training on data where norms are followed; filters/guardrails on outputs; and the sociotechnical system (users, reviewers, escalation).
- Trade-offs are normal (classic example: refrigerants trading flammability, toxicity, ozone and climate impact). Make them explicit and justify the choice.
- Limits: some issues surface late; actual use differs from intended use; high moral uncertainty; resource-intensive. Hence assessment after deployment matters.

## Technology is not neutral (Winner 1980)
- Some artefacts are built for political purposes that precede their function (Moses' low bridges, per Winner's contested account).
- Some are inherently political: their function requires or strongly favours particular power arrangements (mechanised tomato harvesting favoured large agribusiness).
- So judging a system by its primary function ("does it classify accurately?") misses who gains or loses power.

## Avoid techno-solutionism
Don't twist the problem definition to fit the AI solution (Siffels & Sharon 2024). Always ask whether AI is the right tool at all.

## Empirical lesson
Cummings (2006): designers of a missile-targeting decision aid wanted operators to remain autonomous, but testing showed **automation bias** — operators accepted highlighted targets despite contrary evidence. A human approval step isn't proof of human judgment; test it.
