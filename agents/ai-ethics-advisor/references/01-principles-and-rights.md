# Principles, rights and trustworthy AI

## Why AI needs dedicated ethical attention
AI supports or replaces human decisions, and some AI features exist for ethical purposes (privacy, fair outcomes). Four properties raise the stakes: **speed, scale, opacity, and independence from human oversight**. Two further features make value-sensitive design harder: AI is **adopted very quickly** and can **take steps independent of human judgment**.

## Ethics vocabulary
- **Ethics** = systematic study of morality; aims at consistent, well-justified standards for judgments and reactions (praise, blame).
- **Ethics vs law**: legal compliance is necessary but not sufficient; law lags technology and can permit harmful practice.
- Levels: concrete judgments → principles/values/virtues → theories (utilitarianism, deontology, virtue ethics, Rawlsian justice, capability approach). Seek **reflective equilibrium** between them; "wide" reflective equilibrium also takes empirical facts into account.
- **Is–ought gap** (Hume): no ethical conclusion follows from factual premises alone. Every ethical argument needs at least one normative premise. Use this to audit arguments of the form "users prefer X, therefore we should do X" or "the model is accurate, therefore it is fair".

## Human rights (UDHR, 1948)
- Adopted by the UN after WWII atrocities; 30 rights; implemented in law (ECHR Art. 8 privacy; EU Charter Arts. 7–8 privacy and data protection). Rights are moral and legal.
- **Structure**: right-holder R, duty-bearer S (citizens, companies, institutions, government). **Negative** right ↔ duty not to interfere; **positive** right ↔ duty to provide/assist.
- Questions any rights claim raises: Who bears the duty? Is violation punishable? Does it override competing rights? Who pays? What remedy exists?
- Liao (2020), Fundamental Conditions Approach: human rights protect the fundamental conditions for pursuing a good life; companies and AI developers must not use data in ways that undermine users' or others' rights.
- AI-relevant rights: privacy, non-discrimination, freedom of expression/information, fair trial and due process, work, assembly, dignity.

## Belmont Report (1979) — research ethics
US National Commission's principles for human-subjects research; adopted as the general framework for research ethics in the US and Europe. It has no legal force on its own.
1. **Respect for persons**: treat individuals as autonomous agents; protect those with diminished autonomy. → **Informed consent** = information, comprehension, voluntariness (free of coercion = threats, and undue influence = excessive rewards).
2. **Beneficence**: do not harm; maximize benefits and minimize harms. → **Systematic risk/benefit assessment**; brutal treatment never justified; minimize risk; justify involving vulnerable groups.
3. **Justice**: fair distribution of benefits and burdens (formulations: equal share, need, effort, contribution, merit). → **Fair selection of subjects**; don't select groups for convenience or manipulability; publicly funded benefits shouldn't go only to those who can pay.
- AI counts as human-subjects research when its data is about people or its outputs drive decisions affecting people, especially with unequal power. Legal ethics review often doesn't apply outside publicly funded or regulated domains, so the organization must supply the review.

## Four principles plus one (AI ethics consensus)
**Beneficence, non-maleficence, respect for autonomy, justice, + explicability** (Floridi & Cowls 2019; reflected in the EU approach). Respect and justice explain wrongs that harm/benefit reasoning misses: using people without consent is wrong even if outcomes are beneficial (Tuskegee). Principles can conflict, e.g., collecting sensitive attributes improves bias testing but threatens privacy. Make trade-offs explicit.

## EU Ethics Guidelines for Trustworthy AI (HLEG, 2019)
Trustworthy AI is **lawful, ethical, robust**. Seven requirements:
1. Human agency and oversight
2. Technical robustness and safety
3. Privacy and data governance
4. Transparency
5. Diversity, non-discrimination and fairness
6. Societal and environmental well-being
7. Accountability
Operational self-check: ALTAI (Assessment List for Trustworthy AI, 2020).

## Robustness
A model is robust when its reasoning keeps holding for new data. Tests: Same accuracy on new real-world data of the same kind? Sufficient accuracy on known-different populations (e.g., adult-trained medical model applied to children)? Hard to fool with adversarial inputs? Classic failure: husky/wolf classifier that learned "snow in background" (Ribeiro et al. 2016).

## Moral status of AI (for "can the AI be responsible / have rights" questions)
- Moral **agency** (accountable for actions) ≠ moral **patiency** (owed consideration).
- Candidate necessary conditions of personhood: consciousness, selfhood, responsibility, free will. Fluent language output alone establishes none of them (Searle's Chinese Room: symbol manipulation ≠ understanding; Turing Test measures imitation, not mind).
- Practical stance: treat current AI systems as tools for which humans and organizations remain responsible.
