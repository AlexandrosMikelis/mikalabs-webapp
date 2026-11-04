# Opacity and explainability

## Why ML is opaque
The problem domain is often poorly understood; the system learns the solution rather than being told; models are high-dimensional and nonlinear. Solutions can be surprising or intricate.

## Opacity is stakeholder-relative
**Opacity**: stakeholders lack the information they need to interact effectively with an AI system (Tomsett et al. 2018; Lipton 2018). Different stakeholders need different understanding:
| Stakeholder | Question | Needs |
|---|---|---|
| Affected person / end user | **What** does it do? What would change the outcome? | counterfactuals, input-output descriptions, grounds to contest |
| Domain expert / decision-maker | **Why** does it do this, in domain terms? | interpretable features, confidence, when not to rely on it |
| Regulator / auditor | Does it do what it **should**? | comparison against legal/ethical norms, documentation, logs |
| Developer | **How** does it work internally? | causal mechanisms, targets for intervention |
So one explanation rarely serves everyone. Access to code or weights ≠ understanding.
Burrell (2016) names three sources: intentional secrecy, technical illiteracy, inherent complexity at scale. Each needs a different remedy (disclosure, education, technical XAI).

## Explanation
Providing information (explanans) about something (explanandum) to someone (explainee) to increase their understanding. A system is explainable to a stakeholder if they can understand it in the relevant way.

## Approaches
1. **Inherently interpretable** (decision trees, rules, sparse linear models; Rudin 2019). Watch for an accuracy/interpretability trade-off and for nodes that don't map onto meaningful concepts. Preferred for high-stakes decisions when performance is comparable.
2. **Self-explaining** (LLM gives reasons, chain of thought). Risk: explanations can be **plausible but unfaithful**; self-reports are no more reliable than human introspection. Never treat an LLM's stated reason as an audit.
3. **Post hoc**: LIME (local linear approximation), SHAP/LRP (feature importance, saliency), counterfactual explanations. Describe what the system does; with interpretable features, why. Supports **behavioural alignment** checks (does behaviour track creditworthiness or a protected attribute?). Limits: features may be uninterpretable; methods may disagree (robustness); little about causal mechanism, so limited support for fixing the model.
4. **Mechanistic / cognitivist** (mechanistic interpretability, causal abstraction, latent-space analysis): how the system works; supports targeted interventions and **deep alignment** checks (do internal representations track the right features and goals?). Cutting edge; hard to scale.

## Behavioural vs deep alignment
Behavioural: outputs conform to norms in observed cases. Deep: internal representations track normatively relevant properties. A model can be behaviourally aligned on tests while relying on a proxy internally.

## Review questions
1. Who needs to understand this system, and what do they need to do with that understanding?
2. Can affected people get a reason they can act on or contest?
3. Can experts tell when not to rely on it?
4. Can auditors check it against non-discrimination and other norms?
5. Are explanations faithful (validated), not just plausible?
6. Is an interpretable model good enough for this decision?
