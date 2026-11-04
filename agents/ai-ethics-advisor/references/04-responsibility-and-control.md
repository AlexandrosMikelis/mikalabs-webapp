# Responsibility, human control and automation

## Four notions of responsibility (van de Poel & Royakkers)
1. **Passive / backward-looking moral responsibility (blameworthiness)** — four conditions:
   - **Causal contribution** to the outcome
   - **Freedom of action** (no compulsion)
   - **Foreseeability** (could reasonably have known)
   - **Wrongdoing** (bringing it about was wrong)
2. **Active / forward-looking (role) responsibility** — duties assigned before outcomes: who must test, monitor, maintain, audit, intervene.
3. **Collective responsibility** — multiple actors and automated decisions.
4. **Legal responsibility** — criminal liability; civil liability via **negligence** (duty of care, breach, damage, causation; reasonable-person foreseeability), **strict liability** (risky activity caused harm, no fault needed) or **product liability** (manufacturer liable for defects).
- Moral and legal responsibility **overlap but come apart in both directions**. Example: in the 2018 Uber test-vehicle death in Arizona, the company escaped criminal liability while the inattentive safety driver was charged; moral analysis can still find the company responsible (design, foreseeable inattention, safety culture).
- People are responsible for foreseeable effects of **omissions** as well as actions.

## Responsibility gaps
- **Many hands problem**: a collective can reasonably be held responsible, but no individual can.
- **Responsibility gap**: we ought to hold someone responsible but can't reasonably hold any particular agent responsible (Matthias 2004). Can be accidental or **intentional** (fragmented supply chains to avoid accountability).
- Distinguish **epistemic** gaps (we don't know who) from **genuine** gaps (no one is responsible). Autonomy of AI doesn't automatically create a genuine gap: developers, deployers and institutions keep duties.
- Machines can't bear responsibility: they don't meet the conditions, and there's a **retribution gap** — blaming or punishing a system is pointless since it can't feel guilt or reform (Danaher 2016).
- Fix: assign active responsibilities clearly through roles, contracts, procedures, law, and technology.

## Assigning active responsibility well
Values: **feasibility** (can the person actually do it?), **transparency** (can outsiders tell who is responsible?), **fairness** (burden matches control and reward).
The responsible party must have: ability to act, knowledge of applicable norms, ability to perceive violations, and consideration of consequences.
**Scripts** (Akrich 1992): design decisions allocate tasks between machine and human. Write scripts that cover failure conditions, insulate the system from conditions it can't handle, and enforce them (e.g., identity selfie before a driver can start a shift).

## Meaningful Human Control (Santoni de Sio & van den Hoven 2018)
Principle: humans, not algorithms, should ultimately remain in control of, and morally responsible for, relevant decisions. MHC is **not the same as human-in-the-loop**: a present human who presses a button by reflex, lacks information, or can't react in time has no meaningful control. MHC can coexist with high automation.
Based on **guidance control** (Fischer & Ravizza), not regulative control (the ability to have done otherwise). Two necessary conditions:

### Tracking
The system (including its human operators and interfaces) responds robustly to the **relevant moral reasons** of the relevant humans and to the **relevant facts** of its environment. Operationally, in its intended domain D under normal conditions:
- it represents the relevant propositions correctly;
- **safety**: it wouldn't represent them as true if they were false;
- **sensitivity**: it would represent them as true if they were true.
Failures: classifiers keyed to spurious features (snow for wolves; camera artefacts; cloudy skies for enemy tanks); a ship-defence system classifying an enemy missile as friendly because it matched an ally's model. A weak component can still be part of a tracking system if its output is checked by other evidence (e.g., ML toxicity predictions validated in the lab). Tracking can also be improved by **designing the environment** (separate lanes for automated vehicles).

### Tracing
Outcomes can be traced to at least one human in design, deployment or operation who (a) understands, or is in a position to understand, the system's capabilities and effects, and (b) understands that others may hold them accountable for their role. Outputs should be explicable as intended operation in D, or as malfunction attributable to someone: operation outside D or normal conditions, missing fail-safe, insufficient communication, misuse, negligence, or a designer failing to foresee predictable conditions.
Attribution rules for human-in-the-loop setups:
- operator **reasonably** expected to override and didn't → operator
- operator **not** expected to override → deployer
- operator **unreasonably** expected to override (no time, no information) → designer
Gap pattern: engineers know the limits but assume operators decide; operators feel responsible but overestimate the system → nobody satisfies tracing.

MHC is necessary but not sufficient for good behaviour: a system can track and trace the wrong intentions of its deployer.
Design for MHC at three levels: the system, its environment, and social/institutional practice (training, licensing, roles, liability).

## Automation risks
- **Automation bias**: operators accept system defaults despite contrary information (Cummings 2006, missile target selection).
- **Complacency and lost situational awareness**; unrealistic **handoffs** (takeover request seconds before a crash). Handoffs blur who exercised control at the critical moment.
- **Deskilling**: erosion of knowledge, judgment and know-how through overreliance, and prevention of learning; documented in clinical settings. **Enfeeblement** at societal scale (Russell 2019).
- Automating judgment-supporting tasks (choosing the scale, filtering evidence, second checks, writing the justification) leaves humans nominally in control but can erode freedom, trust and responsibility.
- Meaningful work: automation can relieve drudgery or erode mastery (Bankins & Formosa 2023).
- Paradigms that combine high automation with human contribution: MHC, **Human-Centred AI** (Shneiderman 2020: high automation and high human control), Hybrid Intelligence (Akata et al. 2020).

## Is human oversight real? Evidence and tests
- Empirical reviews find policies requiring human oversight often fail: people can't reliably judge algorithmic outputs, and oversight lends false legitimacy (Green 2022, "The flaws of policies requiring human oversight of government algorithms").
- **Moral crumple zone** (Elish 2019): the human nearest the system absorbs blame for failures of the larger system.
- **Red flags**: targets or KPIs on acceptance/low override rates; one-click accept; recommendation shown before evidence; no time budget per case; reviewer can't see source data; no authority to deviate without escalation; performance reviews that penalise overrides.
- **Design for real oversight**: show evidence before the recommendation (or a blind first look on a sample); require a rationale for adverse decisions; give confidence and out-of-domain signals; set realistic workloads; train on known failure modes; treat a very low override rate as a warning, not success.
- **Test it**: seed known-wrong cases and measure catch rate; compare decisions with and without the recommendation; audit overridden and non-overridden cases; track outcomes by group.

## Review questions
1. For each harmful outcome, who meets the four blame conditions? Any many-hands risk?
2. Are monitoring, audit, override, maintenance and incident duties assigned to named roles? Feasible, transparent, fair?
3. Tracking: what must the system get right in domain D? Is D defined? Is behaviour validated outside training conditions?
4. Tracing: who understands the limits and knows they're accountable? What happens outside D (fail-safe)?
5. Can the human overseer realistically intervene (time, information, authority, training)? Watch for automation bias.
6. Which skills could atrophy, and how are they kept?
