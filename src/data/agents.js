// Agent catalogue. Add an entry here (and its folder in agents/) to list a new agent in the store.
// Plain JS (no JSX) so scripts/postbuild.js can read the slugs too.
// In text fields, `backticks` render as inline code.

export const AGENTS = [
  {
    slug: 'ai-ethics-advisor',
    name: 'AI Ethics Advisor',
    tagline: 'Reviews AI systems for ethical risk and EU AI Act exposure.',
    category: 'Ethics & compliance',
    tags: ['EU AI Act', 'Fairness', 'Human oversight', 'JSON output'],
    icon: 'scale',
    cover: 'linear-gradient(135deg,#A960EE 0%,#635BFF 55%,#00D4FF 100%)',
    price: 'Free',
    version: '1.0',
    updated: 'Nov 2026',
    size: '57 KB',
    license: 'Free · as is',
    worksWith: ['ChatGPT', 'Gemini', 'Copilot', 'Claude', 'Mistral', 'Local models', 'Any LLM API'],
    description:
      'An advisor on the ethical side of AI, for people and for other agents. Describe a system, feature, use case or vendor tool and it returns a structured review: findings rated Critical to Low, each with its basis and a concrete mitigation, EU AI Act flags and a clear verdict. Or ask it a question about AI ethics and get a direct answer with the frameworks named.',
    features: [
      'Severity-rated findings with concrete mitigations',
      'EU AI Act tier and article flags, incl. the 2026 Digital Omnibus',
      'Clear verdict: Proceed, With conditions, Redesign or Stop',
      'Structured JSON mode for agent pipelines',
      'Never blocks: states assumptions, lists open questions',
    ],
    builtOn: [
      'UN Declaration of Human Rights',
      'Belmont Report',
      'EU Trustworthy AI guidelines & ALTAI',
      'EU AI Act',
      'Design for Values / VSD',
      'Rawls & algorithmic fairness',
      'Responsibility theory',
      'Meaningful Human Control',
      'Explainable AI',
      'Sustainable AI',
      'Ethics of risk',
    ],
    install: [
      ['ChatGPT (Custom GPT)', 'Paste `system-prompt.md` into Instructions and upload the `references/` files as Knowledge.'],
      ['Google Gemini (Gem)', 'Paste `system-prompt.md` into Instructions and add the `references/` files as knowledge.'],
      ['Microsoft Copilot (Copilot Studio)', 'Create an agent, paste `system-prompt.md` into Instructions, upload `references/` as knowledge.'],
      ['Claude', 'Upload the folder as a skill, or use `system-prompt.md` and `references/` in a Project. Claude Code: see `INSTALL.md`.'],
      ['Mistral, local models (Ollama, LM Studio) & other assistants', 'Use `system-prompt.md` as the system prompt and attach `references/`, or use the single `ai-ethics-advisor-all-in-one.md`.'],
      ['APIs & agent frameworks', 'Send `ai-ethics-advisor-all-in-one.md` as the system message (≈13k tokens), or `system-prompt.md` plus RAG over `references/`.'],
    ],
    sample: {
      request: 'Review: we want an LLM to pre-screen supplier invoices and auto-approve those under €5k.',
      system: 'LLM pre-screens supplier invoices and auto-approves those under €5k, with no human step.',
      flags: ['Likely minimal risk under the EU AI Act (not an Annex III use)', 'GDPR applies if invoices contain personal data', 'Confirm both with legal'],
      findings: [
        { sev: 'High', lens: 'Robustness & safety', issue: 'Forged or manipulated invoices could be paid automatically.', mitigation: 'Duplicate and vendor-master checks; payment hold for new vendors. Owner: finance operations.' },
        { sev: 'Medium', lens: 'Responsibility', issue: 'No named owner for auto-approved payments.', mitigation: 'Assign an owner, log every decision, audit a monthly sample.' },
        { sev: 'Low', lens: 'Transparency', issue: 'Suppliers are not told that AI screens their invoices.', mitigation: 'Add one line to supplier terms.' },
      ],
      verdict: 'Proceed with conditions',
      confidence: 'Medium',
    },
    agentCall: `MODE: review
FORMAT: structured
CONTEXT: financial services, EU, deployer role
We want an LLM to pre-screen supplier invoices
and auto-approve those under €5k.`,
    files: [
      ['system-prompt.md', 'The instructions, for any LLM tool (under 8,000 characters)'],
      ['references/ (10 files)', 'The knowledge base: principles, EU AI Act, fairness, responsibility, explainability, sustainability, risk, design for values, review procedure, LLMs & agents'],
      ['ai-ethics-advisor-all-in-one.md', 'Instructions + all references in one file'],
      ['INSTALL.md', 'Step-by-step setup for ChatGPT, Gemini, Copilot, Claude, Mistral, local models and APIs'],
      ['SKILL.md · agent/', 'Claude skill and Claude Code agent formats'],
      ['README.md', 'What it does and how to use it'],
    ],
    limits: 'Not legal advice: regulatory points are flags to confirm with your legal or compliance team. AI Act dates checked on 1 Nov 2026.',
  },
]

export const findAgent = (slug) => AGENTS.find((a) => a.slug === slug)
export const zipUrl = (a) => `/downloads/${a.slug}.zip`
export const zipName = (a) => `${a.slug}.zip`
