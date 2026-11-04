# Fairness, justice and bias

## Theories of justice (choose explicitly — fairness metrics embed one)
- **Desert-based / libertarian** (Nozick): outcomes are fair if acquisitions and exchanges were legitimate; merit-based allocation.
- **Rawls, justice as fairness**: principles reasonable people would choose behind a **veil of ignorance** (not knowing their position). (1) Equal basic liberties; (2) inequalities must attach to positions open to all under fair equality of opportunity and benefit the least advantaged (**Difference Principle**).
- **Strict egalitarianism**: equal outcomes. **Prioritarianism**: gains for the worse off count more (weighting, not a constraint).
- **Relational justice**: power, status, history and participation; "Nothing about us, without us". Example: Havasupai DNA collected for diabetes research reused without consent — a wrong even if the research was useful.
- **Procedural** (fair process) vs **substantive** (fair outcomes/opportunities). A uniform procedure can perpetuate substantive inequality.
- **Opportunity-based vs outcome-based** fairness.
- **Non-arbitrariness**: like cases treated alike; differences in treatment need relevant reasons. Central in punitive and legal contexts ("justice is blind").

## Algorithmic fairness
- Definition: an algorithm is fair when, **within its social and technical embedding**, it embodies an appropriate value of fairness (cf. Mitchell et al. 2021). Accuracy alone never settles it.
- **Selection bias**: training data doesn't represent the population the model is applied to (inclusion, or annotation/labelling choices — Miceli et al. 2021).
- **Model bias**: modelling assumptions or learned relationships introduce systematic distortion.
- **Label bias**: the target encodes past biased decisions or a poor proxy (e.g., past healthcare spending used as a proxy for health need disadvantages groups with less access — Obermeyer et al. 2019).
- **Proxies**: removing protected attributes ("fairness through unawareness") fails when postcode, name, occupation or spending stand in for them.
- **Bias-preserving vs bias-transforming** metrics (Wachter, Mittelstadt & Russell 2021): matching historical patterns preserves existing inequality; transforming metrics deliberately correct it. EU non-discrimination law leans toward the latter.
- Fairness as **non-bias** vs as **positive distribution**: blind approaches leave background inequality in place; distributive approaches (e.g., MinMax/Rawlsian approaches that maximise outcomes for the worst-off group) need to represent need, predicted effect and group membership, which raises privacy questions.
- Statistical fairness criteria (demographic parity, equalized odds, calibration) generally cannot all hold at once when base rates differ; the choice is normative.
- Historical data isn't unethical in itself; the risks are reproducing discrimination, hiding it behind apparent objectivity, and embedding social bias in outputs.

## Contexts
- **Hiring/HR, credit, insurance, education, benefits**: high-risk under the AI Act; strong distributive and non-discrimination duties.
- **Punitive/legal** (risk scores for detention, fraud): non-arbitrariness and individualized evidence; avoid depriving people of liberty or benefits on statistical grounds alone.
- **Learning analytics**: don't differentiate quality of education by background.

## Review questions
1. What exactly is the label, and whose past decisions produced it?
2. Does the data represent the deployment population? Who is missing or mislabelled?
3. Which fairness conception applies here, and why (stakeholders, law, mid-level theory)?
4. What proxies could carry protected attributes?
5. Which error (false positive / false negative) harms whom more? Are error rates disaggregated by group?
6. Do affected groups have a voice in design and a route to contest decisions (relational and procedural fairness)?
