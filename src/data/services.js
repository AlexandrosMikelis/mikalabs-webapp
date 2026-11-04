// Services shown on Home (cards), /services (overview) and /services/:slug (detail).
// Plain JS so scripts/postbuild.js can read the slugs too.

export const SERVICES = [
  {
    slug: 'ai-agents',
    icon: 'spark',
    title: 'AI agents & assistants',
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
    icon: 'code',
    title: 'Backend & integration',
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
    icon: 'server',
    title: 'Infrastructure & operations',
    text: 'Containerised, monitored and documented deployments, in the cloud or on your own servers.',
    tags: 'Docker · CI/CD · AWS · Monitoring',
    intro: 'Containerised, monitored and documented deployments, in the cloud or on your own servers, so what we build keeps running after go-live.',
    what: [
      'Containerisation with Docker',
      'CI/CD pipelines for testing and deployment',
      'Deployment to the cloud (AWS) or on your own servers',
      'Monitoring, logging and alerting',
    ],
    get: [
      'Repeatable deployments from a pipeline',
      'Monitoring dashboards and alerts',
      'Backup and recovery procedures',
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

export const findService = (slug) => SERVICES.find((s) => s.slug === slug)
