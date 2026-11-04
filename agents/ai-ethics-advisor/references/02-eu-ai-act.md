# EU AI Act — orientation for ethics reviews

**Not legal advice.** Use this to flag likely regulatory exposure and route to legal/compliance. Status as checked 1 Nov 2026; dates change — re-verify before relying on them.

## Structure
- **Risk-based**: obligations scale with risk category. **Rights-based**: prohibitions and high-risk duties are justified by fundamental rights.
- Roles: **provider** (develops/places on market), **deployer** (uses under its authority), importer, distributor. A company that substantially modifies or rebrands a system can become its provider.

## Risk tiers
1. **Prohibited (Art. 5)** — in force since 2 Feb 2025:
   - Subliminal, manipulative or deceptive techniques causing significant harm
   - Exploiting vulnerabilities (age, disability, social/economic situation)
   - Social scoring leading to detrimental or disproportionate treatment
   - Predicting criminal offences based solely on profiling or personality traits
   - Untargeted scraping of facial images (internet/CCTV) to build facial recognition databases
   - Emotion recognition in the workplace and education (except medical/safety)
   - Biometric categorisation inferring sensitive attributes (race, political opinions, religion, sexual orientation…)
   - Real-time remote biometric identification in public spaces for law enforcement (narrow exceptions)
   - **Added by the Digital Omnibus (Reg. (EU) 2026/1744)**: systems generating non-consensual intimate imagery or CSAM — applies from **2 Dec 2026**
2. **High-risk**:
   - **Annex III (stand-alone)** areas: biometrics; critical infrastructure; education and vocational training; employment and worker management (recruitment, promotion, termination, monitoring); access to essential private and public services (creditworthiness, life/health insurance pricing, public benefits, emergency dispatch); law enforcement; migration/asylum/border; administration of justice and democratic processes. Obligations now apply from **2 Dec 2027** (deferred from 2 Aug 2026 by the Omnibus).
   - **Annex I (safety components of regulated products**: medical devices, machinery, toys, vehicles…): from **2 Aug 2028**.
   - Provider obligations: risk management system, data governance (representative, error-checked data; bias examination), technical documentation, logging, transparency/instructions for use, **human oversight** design, accuracy/robustness/cybersecurity, quality management, conformity assessment, CE marking, EU database registration, post-market monitoring, serious-incident reporting.
   - Deployer obligations: use per instructions, assign competent human oversight, monitor and keep logs, ensure input data relevance, inform affected workers/persons; public bodies and some private deployers (credit, insurance) need a **fundamental rights impact assessment (FRIA)**.
3. **Transparency risk (Art. 50)** — from **2 Aug 2026**: tell people they're interacting with an AI; label deepfakes and certain AI-generated text published to inform the public; machine-readable marking of synthetic content (grace period to 2 Dec 2026 for generative systems already on the market); notify people subject to emotion recognition or biometric categorisation.
4. **Minimal risk**: no specific obligations; voluntary codes.
- **General-purpose AI models**: obligations since **2 Aug 2025** (documentation, copyright policy, training-data summary; extra duties for systemic-risk models). Not delayed.
- **AI literacy** (Art. 4): providers and deployers take measures so staff have sufficient AI literacy (applies since 2 Feb 2025).
- Penalties: up to €35M or 7% of global turnover for prohibited practices; lower tiers for other breaches.

## Article map (confirm current text with legal)
| Topic | Article |
|---|---|
| AI literacy | Art. 4 |
| Prohibited practices | Art. 5 |
| High-risk classification; Annex III list | Art. 6 + Annex III |
| Derogation for Annex III systems that only do narrow procedural/preparatory tasks or don't materially influence the decision | Art. 6(3) — **never applies if the system profiles natural persons**; a human approval step alone does not take a system out of high-risk |
| Provider requirements: risk management, data governance, documentation, logging, transparency, human oversight, accuracy/robustness/cybersecurity | Arts. 9–15 (human oversight = Art. 14: overseers must understand capacities and limits, stay aware of automation bias, be able to interpret, override and stop) |
| When a deployer/distributor becomes a provider (own name, substantial modification, changed purpose) | Art. 25 |
| Deployer obligations | Art. 26 |
| Fundamental rights impact assessment (public bodies; private deployers for creditworthiness and life/health insurance) | Art. 27 |
| Transparency for certain AI systems | Art. 50 |
| GPAI model obligations | Arts. 53–55 |
| Right to explanation of individual decisions by high-risk Annex III systems | Art. 86 |

## Adjacent law to flag (not covered in depth here)
- **GDPR**: lawful basis and purpose limitation; DPIA (Art. 35) for high-risk processing; **Art. 22** solely automated decisions with legal or similarly significant effects (a nominal human step may not count as meaningful involvement); information on the logic involved (Arts. 13–15); processor terms and international transfers for third-party models.
- **Credit**: Consumer Credit Directive (EU) 2023/2225 (creditworthiness assessment; right to human intervention and explanation for automated assessments) and Mortgage Credit Directive 2014/17/EU; EBA Guidelines on loan origination and monitoring; supervisory model-risk and outsourcing expectations.
- **Medical**: MDR/IVDR for software as a medical device.
- **Employment**: national labour law, works-council consultation on monitoring tools.
- **Product liability**: revised Product Liability Directive (EU) 2024/2853 treats software, including AI, as a product.

## Classifying compound systems
Classify by the decision the output ends up informing, not by the component. Document extraction that feeds a credit, hiring or benefits decision belongs to that decision's risk class. Assess the chain as one system.

## Ethics ≠ compliance
Classification decides legal duties, not ethical acceptability. A minimal-risk system can still be unfair, manipulative or unsustainable; a compliant high-risk system can still lack meaningful human control. The deferral of high-risk duties doesn't change the ethical case for meeting them now.

## Quick triage questions
- Does it fall under any Art. 5 practice? → stop, escalate to legal.
- Is it used for any Annex III purpose, or as a safety component of a regulated product? → high-risk track.
- Does it interact with people, generate synthetic content, or recognise emotions/biometric categories? → Art. 50 transparency.
- Are we provider, deployer, or both? Did we modify a third-party model or put our name on it?
- Is it built on a general-purpose model? Get the provider's documentation.
