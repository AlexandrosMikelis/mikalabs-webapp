# LLMs, third-party models and AI agents

Specific risks when the system uses a large language model, a vendor/general-purpose model, or an agent that takes actions.

## LLM behaviour
- **Hallucination and misreading**: fluent, plausible errors (wrong figures, invented facts, confused categories). Errors look credible, which amplifies automation bias. → Ground outputs in sources (link each extracted value or claim to its passage), validate against rules/totals, constrain output formats.
- **Unfaithful explanations**: an LLM's stated reasons may not reflect what produced the output. Not an audit trail (see 05).
- **Learned social associations**: names, dialects, nationality, occupation, gender and age cues can shape judgments even when protected fields are removed. Test outputs by group; screen generated text for protected-attribute cues.
- **Non-determinism and drift**: same input, different output; vendor model updates change behaviour silently. → Pin model versions, re-validate on change, regression test sets.
- **Out-of-domain inputs**: unusual documents, languages, formats. → Detect and route to manual handling (fail-safe).
- **Scope creep from summariser to decision-maker**: "summary with recommended decision" turns an assistive tool into decision support for a possibly high-risk decision. Separate extraction/summarisation from judgment; put judgment in a validated, interpretable model or explicit policy rules where stakes are high.

## Security and misuse
- **Prompt injection**: instructions hidden in user-submitted content (documents, emails, web pages) steer the model. → Treat all supplied content as untrusted data; separate instructions from data; validate outputs; limit tool permissions.
- **Data leakage**: personal or confidential data in prompts, logs, or vendor training. → Minimise and redact; contractually ban vendor training and set retention limits; access controls; check international transfers.
- **Forgery and adversarial inputs** where outputs gate money or rights.

## Vendor and general-purpose models
- Due diligence: intended and prohibited uses in vendor terms (many exclude high-risk decisions), GPAI documentation (AI Act Arts. 53–55), evaluation results, data handling, sub-processors, incident notification, change notice, audit access.
- Role check: own branding, substantial modification or a new high-risk purpose can make you the provider (AI Act Art. 25).
- Contract should allocate responsibilities between provider and deployer explicitly.

## Agents that act
- **Tracing for actions**: every automated action attributable to a named owner; full action logs.
- **Least privilege**: narrow tool and data permissions; spending/volume limits.
- **Reversibility**: prefer reversible actions; require human confirmation for irreversible or external-facing ones (payments, deletions, sending messages, contractual commitments).
- **Kill switch and rollback**; monitoring for anomalous behaviour.
- **Agent-to-agent pipelines**: errors and injected instructions propagate; validate at each hand-off; an upstream agent's output is data, not authority.
- Workforce effects: deskilling, monitoring of workers via agent logs, changes to meaningful work.
