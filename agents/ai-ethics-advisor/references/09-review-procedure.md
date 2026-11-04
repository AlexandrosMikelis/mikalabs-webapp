# Ethics review procedure

Use for `review` requests: an AI system, feature, use case, design document, prompt/agent design or procurement decision.

## Step 0 — Establish the facts (don't skip)
Extract or ask for: purpose and decision supported; who is affected (users, decision subjects, non-users, workers); data (sources, personal/sensitive data, labels, consent); model type (in-house, fine-tuned, third-party/general-purpose); level of automation (advisory, human-approved, fully automated); deployment context and scale; our role (provider/deployer); reversibility of decisions.
If information that would change a finding's severity is missing, state the assumption you made and list it under OPEN QUESTIONS. An agent caller can't answer follow-ups, so never block on questions — assume, flag, continue.

## Step 1 — Regulatory triage (02-eu-ai-act.md)
Prohibited? High-risk (Annex III / Annex I)? Transparency duties? GPAI? Also flag GDPR (lawful basis, DPIA, automated decision-making under Art. 22) and sector rules (banking, medical devices, employment law) where relevant. Mark everything as "flag for legal", never as a legal conclusion.

## Step 2 — Run the lenses
Apply only the lenses that matter for this system, but always consider each:
| Lens | Core question | Reference |
|---|---|---|
| Respect & autonomy | Consent, manipulation, ability to choose and contest? | 01 |
| Beneficence / non-maleficence | Real benefit? Foreseeable harms, incl. to non-users? | 01, 07 |
| Fairness & justice | Representative data, label/proxy bias, disaggregated errors, distribution of benefits/burdens, voice of affected groups? | 03 |
| Privacy & data governance | Minimisation, purpose limitation, secondary use, sensitive data? | 01 |
| Robustness & safety | Works outside training conditions? Adversarial misuse? Defined operating domain? | 01, 04 |
| Transparency & explainability | Can each stakeholder get the understanding they need? Faithful explanations? Disclosure that AI is used? | 05 |
| Responsibility & accountability | Named owners for monitoring, override, incidents? Many-hands risk? | 04 |
| Meaningful human control | Tracking and tracing satisfied? Can overseers really intervene? Automation bias? | 04 |
| Work & skills | Deskilling, meaningful work, worker monitoring? | 04 |
| Sustainability | Footprint vs benefit, labour in the supply chain, externalities? | 06 |
| Risk acceptability | Benefits > risks, fair distribution, consent, no better alternative? | 07 |
| Politics of the artefact | Who gains or loses power? Is AI the right tool? | 08 |

If the system uses an LLM, a vendor/general-purpose model or an agent that takes actions, also run `10-llm-and-agents.md`.

## Step 3 — Rate each finding
| Severity | Meaning | Typical action |
|---|---|---|
| **Critical** | Likely prohibited practice, serious irreversible harm, or fundamental-rights violation | Stop; escalate to legal/leadership before proceeding |
| **High** | Significant harm to individuals or groups is likely without mitigation; high-risk legal exposure | Mitigate before launch; named owner |
| **Medium** | Real but containable harm, or important gap in oversight/transparency | Mitigate in roadmap; monitor |
| **Low** | Good-practice improvement | Optional |
Rate by severity × likelihood × reversibility × number of people affected; weigh vulnerable groups more heavily.
Severity measures harm, not legal category. High-risk status under the AI Act is a regulatory flag; it becomes a finding only where a duty is unmet or unplanned, and is rated by the harm that gap allows.

## Step 4 — Recommend
Each mitigation must be concrete (who does what), proportionate, and tied to a finding. Prefer, in order: change the design or scope → add safeguards (human review with real authority, thresholds, fail-safes, logging, contest channel) → add process (monitoring, audits, training) → disclose. Include "don't use AI for this" when that's the honest answer.

## Step 5 — Verdict
- **Proceed** — no High/Critical findings.
- **Proceed with conditions** — High findings with clear mitigations; list the conditions.
- **Redesign** — core design creates High/Critical issues that safeguards can't fix; includes cases where the fix is a reduction of scope (e.g., remove the recommendation, keep extraction).
- **Do not proceed / escalate** — Critical findings, or likely prohibited.
Confidence: High / Medium / Low, depending on how much was assumed.

## Common patterns (quick reference)
- **LLM extraction/summary feeding a regulated decision** (credit, hiring, claims, benefits): classify by the decision; recommendation labels (approve/decline) make it decision support → likely high-risk; separate verified extraction from judgment; no acceptance-rate KPIs; applicant explanation and contest route.
- **Hiring/CV screening**: Annex III high-risk; historical-label bias; proxies (gaps, names, postcode); candidate notice; human review with authority; disaggregated testing.
- **Credit/insurance scoring**: Annex III high-risk; FRIA for deployers; adverse-action explanations (counterfactuals); proxy discrimination; non-arbitrariness.
- **Document classification / intelligent document processing**: usually minimal risk, but check if outputs gate rights or services (e.g., claims, onboarding, KYC); error routing to humans; sensitive data in documents; retention.
- **Customer-service chatbot / LLM assistant**: Art. 50 disclosure; hallucination (tracking); escalation to humans; don't present self-explanations as audits; manipulation and vulnerable users; logging of personal data.
- **IT ticket triage / internal automation agents**: low regulatory risk; responsibility for automated actions (tracing), permission scopes, override and rollback, worker deskilling and monitoring.
- **Employee monitoring / productivity analytics**: emotion recognition at work is prohibited; Annex III worker management; proportionality, works-council consultation, chilling effects.
- **Medical / pharma decision support**: Annex I (medical device) or high-risk; robustness across populations; clinician automation bias and deskilling; informed consent for data use; research-ethics review.
- **Facial recognition / biometrics**: untargeted scraping prohibited; biometric categorisation of sensitive traits prohibited; consent; unequal error rates; surveillance harms.
- **Generative content for marketing**: deepfake/synthetic content labelling; copyright and consent of depicted people; disinformation risk.
