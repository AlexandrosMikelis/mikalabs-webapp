// Services shown on Home (cards), /services (overview) and /services/:slug (detail).
// Plain JS so scripts/postbuild.js can read the slugs too.

// Two tracks: 'advise' (consulting, no build commitment) and 'build' (design, build & run).
export const TRACKS = [
  { key: 'advise', label: 'Advise', title: 'Consulting', text: 'Independent advice on where AI pays off, what the rules require and which technology to choose. No build commitment needed.' },
  { key: 'build', label: 'Build & run', title: 'Implementation', text: 'When you are ready, the same team designs, builds and runs it, from the first integration to production.' },
]

// Set hidden: true to take a service off the site without deleting its content.
const ALL_SERVICES = [
  {
    slug: 'ai-strategy',
    track: 'advise',
    icon: 'compass',
    title: 'AI strategy',
    text: 'Find where AI and automation actually pay off in your business, and in what order to do them.',
    tags: 'Use-case discovery · Business case · Roadmap',
    intro: 'We look at how your business runs, find where AI and automation would save real time or money, and turn that into a prioritised roadmap with a business case for each step, whether or not we build it.',
    what: [
      'Problem first, AI second: we ask whether AI is the right tool at all before we recommend it',
      'Design for values: what matters to your customers, staff and regulators goes into the requirements, not an afterthought',
      'Human in the loop, society in the loop: we weigh who gains or loses from each use case, not just the savings',
      'Meaningful human control, not a rubber stamp: reviewers with the evidence, the time and the authority to say no',
      'Automation that relieves drudgery, not mastery, so your team grows with the AI instead of being deskilled by it',
    ],
    get: [
      'A prioritised list of use cases, scored on value, effort and risk',
      'A business case for the top opportunities',
      'Clear ownership: for every AI decision, a named person accountable for it',
      'A phased roadmap your team can execute with us or with anyone else',
    ],
    fit: 'You know AI could help, but not where to start or what is worth the investment.',
  },
  {
    slug: 'ai-governance',
    track: 'advise',
    icon: 'shield',
    title: 'EU AI Act',
    text: 'Classify your AI systems under the EU AI Act, close the gaps, and put responsible-AI practices in place.',
    tags: 'EU AI Act · Risk classification · AI ethics',
    intro: 'We help you understand what the EU AI Act means for the AI you use and build: which systems fall under which risk class, what obligations follow, and how to meet them with practical governance rather than paperwork.',
    what: [
      'Inventory of the AI systems and vendor AI tools you use or plan to use',
      'Risk classification under the EU AI Act and the obligations that follow',
      'Ethics and fairness reviews of specific systems, features or vendors',
      'Governance: roles, human oversight, documentation and logging',
    ],
    get: [
      'An AI inventory with a risk class for each system',
      'A gap analysis against the AI Act obligations that apply to you',
      'A practical remediation plan, prioritised by risk',
      'Policies and templates your team can reuse',
    ],
    fit: 'You use or plan to use AI and need to know where you stand with the EU AI Act.',
  },
  {
    slug: 'architecture-advice',
    track: 'advise',
    icon: 'layers',
    title: 'Architecture',
    text: 'Independent advice on platforms, vendors and architecture, before you commit budget.',
    tags: 'Architecture review · Vendor selection · Second opinion',
    intro: 'Independent advice before you commit: which AI platform, model or automation vendor fits your needs, whether a proposed architecture will hold up, and what it will really cost to run.',
    what: [
      'Comparison of AI platforms, models and automation vendors against your requirements',
      'Reviews of proposed or existing architectures for AI, integration and infrastructure',
      'Second opinions on vendor proposals, quotes and project plans',
      'Data, security and lock-in assessment',
    ],
    get: [
      'A written recommendation with the reasoning behind it',
      'A shortlist and comparison of vendors or options',
      'Architecture review findings with concrete fixes',
      'A cost and risk view of each option',
    ],
    fit: 'You are about to choose a platform or vendor, or sign off on an architecture, and want an independent view.',
  },
  {
    slug: 'ai-agents',
    track: 'build',
    icon: 'spark',
    title: 'AI agents & assistants',
    menuTitle: 'AI Agents', // shorter label for the Services dropdown
    text: "Agents that read documents, answer from your company's knowledge and take actions in your tools.",
    tags: 'RAG · Knowledge graphs · MCP · LLM agents',
    intro: "Agents that work inside your business: they read your documents, answer from your company's knowledge and take actions in the tools your team already uses, with a person approving where it matters.",
    what: [
      'Document agents that read, extract and classify invoices, contracts, forms and emails',
      'Knowledge assistants that answer from your own documents and systems, with sources',
      "Multi-agent workflows: agents that plan, act and check each other's work",
      'Access to your tools and systems through APIs and MCP, with permissions you control',
    ],
    get: [
      'A working agent connected to your data and tools',
      'Testing on real examples from your team before go-live',
      'Guardrails, logs and a human approval step where decisions matter',
      'Documentation and handover, so your team can run and change it',
    ],
    fit: 'Your team spends hours reading, searching for or re-typing information.',
  },
  {
    slug: 'process-automation',
    hidden: true,
    track: 'build',
    icon: 'flow',
    title: 'Process automation',
    text: 'We map how work flows today, then automate it end to end, keeping people in the loop where decisions matter.',
    tags: 'BPMN · Workflow orchestration · Human-in-the-loop',
    intro: 'We map how a process really runs today, agree with you what to automate first, and build it end to end, from the trigger to the last system update, with people in the loop for the decisions.',
    what: [
      'Process mapping (BPMN) of the current workflow and its bottlenecks',
      'Workflow orchestration across email, documents, ERP, CRM and team chat',
      'Human-in-the-loop steps for approvals, exceptions and escalations',
      'Monitoring of every run, so nothing fails silently',
    ],
    get: [
      'A process map and a prioritised automation plan',
      'The automated workflow, tested on real cases',
      'Alerts and reports for runs, failures and exceptions',
      'Runbooks for your team',
    ],
    fit: 'The same steps are repeated by hand every day, across several systems.',
  },
  {
    slug: 'integration',
    track: 'build',
    icon: 'code',
    title: 'Integrations',
    text: 'APIs and integration layers that connect your ERP, CRM, document systems and data, reliably.',
    tags: 'REST · SOAP · Event-driven · Java / Spring',
    intro: 'APIs and integration layers that connect your ERP, CRM, document systems and data, so your automation and AI have reliable, secure access to what they need.',
    what: [
      'REST and SOAP APIs and integration services',
      'Connectors to ERP, CRM, document management systems and databases',
      'Event-driven integration and message queues',
      'Data syncing, validation and transformation between systems',
    ],
    get: [
      'Documented, versioned APIs',
      'Automated tests, error handling and retries',
      'Secure access with authentication and audit logs',
      'Source code and documentation, handed over',
    ],
    fit: 'Your systems don’t talk to each other, so people copy data between them.',
  },
  {
    slug: 'infrastructure',
    track: 'build',
    icon: 'server',
    title: 'Infrastructure & Operations',
    text: 'MLOps and DevOps: containerised, monitored and documented deployments of your AI and systems, in the cloud or on your own servers.',
    tags: 'MLOps · Docker · CI/CD · AWS · Monitoring',
    intro: 'MLOps for your AI and DevOps for everything around it: containerised, monitored and documented deployments, in the cloud or on your own servers, so what we build keeps running, and keeps performing, after go-live.',
    what: [
      'MLOps: versioning, evaluation and deployment pipelines for models, prompts and agents',
      'Monitoring of AI quality in production: accuracy, drift, cost and latency',
      'Containerisation with Docker and CI/CD pipelines for testing and deployment',
      'Deployment to the cloud (AWS) or on your own servers',
      'Monitoring, logging and alerting',
    ],
    get: [
      'Repeatable deployments of models and services from a pipeline',
      'Dashboards and alerts for system health and AI quality',
      'Backup, rollback and recovery procedures',
      'Operations documentation and handover',
    ],
    fit: 'Deployments are manual, or nobody notices when something stops working.',
  },
]

export const STEPS = [
  ['01', 'Map', 'We study the process, its systems and its bottlenecks, and pick what to automate first.'],
  ['02', 'Build', 'We build the integrations and backend services the automation needs.'],
  ['03', 'Automate', 'We add the AI and the workflow, and test them on real cases with your team.'],
  ['04', 'Run', 'We deploy, monitor and improve it, and hand over everything your team needs.'],
]

export const SERVICES = ALL_SERVICES.filter((s) => !s.hidden)

export const findService = (slug) => SERVICES.find((s) => s.slug === slug)

export const servicesIn = (track) => SERVICES.filter((s) => s.track === track)
