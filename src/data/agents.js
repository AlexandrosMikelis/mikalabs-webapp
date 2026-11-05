// Agent catalogue. Add an entry here (and its folder in agents/) to list a new agent in the store.
// Plain JS (no JSX) so scripts/postbuild.js can read the slugs too.
// In text fields, `backticks` render as inline code.

export const AGENTS = [
  {
    slug: 'ai-ethics-advisor',
    tier: 'worker',
    name: 'Themis',
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
  {
    slug: 'api-design-reviewer',
    name: 'Hermes',
    tier: 'worker',
    tagline: 'Reviews API designs and specs for consistency, breaking changes and testability.',
    category: 'API design',
    tags: ['OpenAPI', 'Versioning', 'Contract testing', 'JSON output'],
    icon: 'api',
    cover: 'linear-gradient(135deg,#FFB86B 0%,#FF7A6B 55%,#E5487F 100%)',
    price: 'Free',
    version: '1.0',
    updated: 'Nov 2026',
    size: '65 KB',
    license: 'Free · as is',
    worksWith: ['ChatGPT', 'Gemini', 'Copilot', 'Claude', 'Mistral', 'Local models', 'Any LLM API'],
    description:
      'A specialist worker agent for API design, for people and for orchestrator agents. Give it an OpenAPI, AsyncAPI, protobuf or GraphQL spec, a design doc or a spec diff and it returns a structured review: findings rated Critical to Low, each with its location, basis and a concrete fix, the breaking changes, the tests the API needs and a clear verdict. Or give it requirements and get a proposed API with an ADR, or ask a question on REST vs gRPC, versioning, pagination, errors or contract testing.',
    features: [
      'Severity-rated findings with location and a concrete fix',
      'Breaking-change check between spec versions (REST, protobuf, GraphQL, events)',
      'Clear verdict: Approve, With changes, Rework or Reject',
      'Design mode: style choice, spec sketch and an ADR',
      'Structured JSON mode for agent pipelines; never blocks on missing info',
    ],
    builtOn: [
      'Ideas from Mastering API Architecture (Gough, Bryant, Auburn)',
      'REST constraints & Richardson Maturity Model',
      'HTTP Semantics (RFC 9110) & Problem Details (RFC 9457)',
      'Microsoft REST Guidelines & Google AIP',
      'OpenAPI, AsyncAPI, Protocol Buffers, GraphQL',
      'Semantic Versioning & Postel’s law',
      'OWASP API Security Top 10',
      'Test pyramid, agile testing quadrants & consumer-driven contracts',
      'Architecture Decision Records & C4 model',
    ],
    install: [
      ['ChatGPT (Custom GPT)', 'Paste `system-prompt.md` into Instructions and upload the `references/` files as Knowledge.'],
      ['Google Gemini (Gem)', 'Paste `system-prompt.md` into Instructions and add the `references/` files as knowledge.'],
      ['Microsoft Copilot (Copilot Studio)', 'Create an agent, paste `system-prompt.md` into Instructions, upload `references/` as knowledge.'],
      ['Claude', 'Upload the folder as a skill, or use `system-prompt.md` and `references/` in a Project. Claude Code: see `INSTALL.md`.'],
      ['Mistral, local models (Ollama, LM Studio) & other assistants', 'Use `system-prompt.md` as the system prompt and attach `references/`, or use the single `api-design-reviewer-all-in-one.md`.'],
      ['APIs & agent frameworks', 'Send `api-design-reviewer-all-in-one.md` as the system message (≈15k tokens), or `system-prompt.md` plus RAG over `references/`.'],
    ],
    sample: {
      request: 'Review our new Bookings API before the partner launch: POST /createBooking, GET /bookings returns an array, GET /bookings/{email}, errors return 200 with {"success": false}.',
      system: 'Public partner REST API for conference bookings; OpenAPI 3.1; no previous version live.',
      flags: ['No house standard given: judged against Microsoft REST Guidelines and RFC 9457', 'Personal data (email) used as an identifier', 'No idempotency on booking creation'],
      findings: [
        { sev: 'High', lens: 'Errors', issue: 'Errors return 200 with {"success": false}; partner clients will treat failures as successful bookings.', mitigation: 'Use 4xx/5xx status codes with an application/problem+json body and stable error codes.' },
        { sev: 'High', lens: 'Resource model & security', issue: 'GET /bookings/{email} puts personal data in URLs, where it gets logged and cached, and is not a stable ID.', mitigation: 'Address bookings by an opaque bookingId; filter by attendee in the query or body, with authorisation checks.' },
        { sev: 'Medium', lens: 'Collections', issue: 'GET /bookings returns a bare array, so adding pagination later is a breaking change.', mitigation: 'Return {"value": [...], "nextLink": "..."} with a maximum page size before partners integrate.' },
      ],
      verdict: 'Approve with changes',
      confidence: 'Medium',
    },
    agentCall: `MODE: review
FORMAT: structured
CONTEXT: public partner API, Microsoft REST guidelines
PREVIOUS: specs/bookings-v1.yaml
<paste openapi.yaml for v1.1>`,
    files: [
      ['system-prompt.md', 'The instructions, for any LLM tool (under 8,000 characters)'],
      ['references/ (10 files)', 'The knowledge base: API styles, resources & HTTP, collections, errors & reliability, versioning, specifications, testing, ADRs, security & performance, review procedure'],
      ['api-design-reviewer-all-in-one.md', 'Instructions + all references in one file'],
      ['INSTALL.md', 'Step-by-step setup for ChatGPT, Gemini, Copilot, Claude, Mistral, local models and APIs'],
      ['SKILL.md · agent/', 'Claude skill and Claude Code agent (worker tier) formats'],
      ['README.md', 'What it does and how to use it'],
    ],
    limits: 'Not a security audit or load test: security and performance points are design-level flags. Standards versions checked on 1 Nov 2026. Independent work by MIKA Labs, not affiliated with or endorsed by the authors or publishers of the books it draws on.',
  },
  {
    slug: 'api-security-reviewer',
    name: 'Argus',
    tier: 'worker',
    tagline: 'Threat-models and reviews APIs against OWASP, OAuth 2.x and JWT best practice.',
    category: 'Security',
    tags: ['OWASP API Top 10', 'OAuth 2.1 / OIDC', 'Threat modelling', 'JSON output'],
    icon: 'shield',
    cover: 'linear-gradient(135deg,#1F2A5C 0%,#3B5BDB 55%,#4FC3F7 100%)',
    price: 'Free',
    version: '1.0',
    updated: 'Nov 2026',
    size: '67 KB',
    license: 'Free · as is',
    worksWith: ['ChatGPT', 'Gemini', 'Copilot', 'Claude', 'Mistral', 'Local models', 'Any LLM API'],
    description:
      'A worker agent that reviews the security of APIs, for people and for orchestrator agents. Describe a design and it builds a threat model: data flows, trust boundaries and STRIDE threats mapped to the OWASP API Security Top 10 (2023). Paste a spec, auth setup or gateway config and it checks OAuth grants, PKCE, JWT validation, scopes, mTLS, rate limits and audit logging. Every finding is rated Critical to Low with a concrete fix and where it belongs, and the review ends with a clear verdict. Defensive only: it reviews designs, it never attacks systems.',
    features: [
      'STRIDE threat models with data flows and trust boundaries',
      'Findings mapped to the OWASP API Security Top 10 (2023)',
      'OAuth 2.1, OIDC and JWT (RFC 8725) checks with concrete fixes',
      'Clear verdict: Approve, With conditions, Rework or Block',
      'Structured JSON mode for agent pipelines; never blocks on missing info',
    ],
    builtOn: [
      'Ideas from Mastering API Architecture (Gough, Bryant, Auburn)',
      'OWASP API Security Top 10 (2023)',
      'STRIDE & DREAD threat modelling',
      'OAuth 2.0, Security BCP (RFC 9700) & OAuth 2.1',
      'PKCE, DPoP & mTLS-bound tokens',
      'OpenID Connect & FAPI 2.0',
      'JWT best practice (RFC 8725)',
      'NIST Zero Trust Architecture (SP 800-207)',
      'Service mesh & SPIFFE workload identity',
    ],
    install: [
      ['ChatGPT (Custom GPT)', 'Paste `system-prompt.md` into Instructions and upload the `references/` files as Knowledge.'],
      ['Google Gemini (Gem)', 'Paste `system-prompt.md` into Instructions and add the `references/` files as knowledge.'],
      ['Microsoft Copilot (Copilot Studio)', 'Create an agent, paste `system-prompt.md` into Instructions, upload `references/` as knowledge.'],
      ['Claude', 'Upload the folder as a skill, or use `system-prompt.md` and `references/` in a Project. Claude Code: see `INSTALL.md`.'],
      ['Mistral, local models (Ollama, LM Studio) & other assistants', 'Use `system-prompt.md` as the system prompt and attach `references/`, or use the single `api-security-reviewer-all-in-one.md`.'],
      ['APIs & agent frameworks', 'Send `api-security-reviewer-all-in-one.md` as the system message (≈15k tokens), or `system-prompt.md` plus RAG over `references/`.'],
    ],
    sample: {
      request: 'Review: partners call our public orders API with a static API key and send an X-User-Id header to say which customer they act for. Our SPA uses the implicit grant. The gateway validates JWTs but services trust the user header.',
      system: 'Public orders API behind a gateway; SPA on the implicit grant; partners use API key + X-User-Id; services trust gateway-forwarded headers.',
      flags: ['API1:2023 BOLA', 'API2:2023 Broken Authentication', 'API5:2023 BFLA', 'GDPR applies to customer order data (confirm with compliance)'],
      findings: [
        { sev: 'Critical', lens: 'Spoofing · API2:2023', issue: 'Partners assert any customer identity with an API key plus a client-supplied X-User-Id header, so one partner can act as every customer.', mitigation: 'Replace with OAuth authorization code + PKCE and user consent; scoped per-partner access. Owner: identity/platform team.' },
        { sev: 'High', lens: 'Elevation of privilege · API1:2023', issue: 'Services trust identity headers that the gateway does not strip from inbound requests.', mitigation: 'Strip identity headers at the edge; services take the subject from a verified token and check object ownership. Owner: API team.' },
        { sev: 'High', lens: 'Spoofing · OAuth 2.1', issue: 'The SPA uses the implicit grant, so tokens are exposed in the URL fragment and browser history.', mitigation: 'Migrate to authorization code + PKCE, ideally via a backend-for-frontend with HttpOnly cookies. Owner: frontend team.' },
      ],
      verdict: 'Rework',
      confidence: 'Medium',
    },
    agentCall: `MODE: review
FORMAT: structured
CONTEXT: e-commerce, EU, public API, partners
Partners call /orders with an API key and an
X-User-Id header; SPA uses the implicit grant.`,
    files: [
      ['system-prompt.md', 'The instructions, for any LLM tool (under 8,000 characters)'],
      ['references/ (10 files)', 'The knowledge base: threat modelling, risk rating, OWASP API Top 10 2023, authentication & identity, OAuth & OIDC, tokens & JWT, authorisation, gateway/mesh/edge controls, secrets & logging, review procedure'],
      ['api-security-reviewer-all-in-one.md', 'Instructions + all references in one file'],
      ['INSTALL.md', 'Step-by-step setup for ChatGPT, Gemini, Copilot, Claude, Mistral, local models and APIs'],
      ['SKILL.md · agent/', 'Claude skill and Claude Code agent (worker tier) formats'],
      ['README.md', 'What it does and how to use it'],
    ],
    limits: 'Not a penetration test: it reviews what you describe or paste and does not probe running systems. Defensive only. Compliance points are flags to confirm with your compliance team. Standards checked on 1 Nov 2026. Independent work by MIKA Labs, not affiliated with or endorsed by the authors or publishers of the books it draws on.',
  },
  {
    slug: 'api-platform-architect',
    name: 'Daedalus',
    tier: 'worker',
    tagline: 'Designs API gateways, service mesh, safe releases and step-by-step migrations.',
    category: 'Platforms',
    tags: ['API gateway', 'Service mesh', 'Canary releases', 'Strangler fig', 'JSON output'],
    icon: 'gateway',
    cover: 'linear-gradient(135deg,#FCD34D 0%,#F59E0B 50%,#C2602B 100%)',
    price: 'Free',
    version: '1.0',
    updated: 'Nov 2026',
    size: '70 KB',
    license: 'Free · as is',
    worksWith: ['ChatGPT', 'Gemini', 'Copilot', 'Claude', 'Mistral', 'Local models', 'Any LLM API'],
    description:
      'A worker agent for API traffic management, for people and for orchestrator agents. Describe an architecture and it maps your north–south and east–west traffic, then returns findings rated Critical to Low on gateways, service mesh, release safety, observability and evolution, each with a concrete recommendation and a clear verdict. Or ask it to plan a canary release, a strangler-fig extraction or a move to the cloud, with a decision record, success signals and a rollback trigger for every step.',
    features: [
      'Gateway, mesh or both: decisions grounded in your traffic, not trends',
      'Severity-rated findings incl. anti-patterns like gateway loopback and gateway-as-ESB',
      'Release plans: canary, blue-green, mirroring, flags, with gates and rollback',
      'Migration plans with an ADR for every step',
      'Structured JSON mode for agent pipelines',
    ],
    builtOn: [
      'Ideas from Mastering API Architecture (Gough, Bryant, Auburn)',
      'Strangler fig pattern',
      'Monolith to Microservices',
      'Working Effectively with Legacy Code',
      'Fitness functions & evolutionary architecture',
      'Architecture decision records',
      'SRE golden signals, RED & USE',
      'Six Rs of cloud migration',
      'NIST SP 800-207 Zero Trust',
      'OpenTelemetry',
      'Kubernetes Gateway API',
    ],
    install: [
      ['ChatGPT (Custom GPT)', 'Paste `system-prompt.md` into Instructions and upload the `references/` files as Knowledge.'],
      ['Google Gemini (Gem)', 'Paste `system-prompt.md` into Instructions and add the `references/` files as knowledge.'],
      ['Microsoft Copilot (Copilot Studio)', 'Create an agent, paste `system-prompt.md` into Instructions, upload `references/` as knowledge.'],
      ['Claude', 'Upload the folder as a skill, or use `system-prompt.md` and `references/` in a Project. Claude Code: see `INSTALL.md`.'],
      ['Mistral, local models (Ollama, LM Studio) & other assistants', 'Use `system-prompt.md` as the system prompt and attach `references/`, or use the single `api-platform-architect-all-in-one.md`.'],
      ['APIs & agent frameworks', 'Send `api-platform-architect-all-in-one.md` as the system message (≈16k tokens), or `system-prompt.md` plus RAG over `references/`.'],
    ],
    sample: {
      request: 'Review: our mobile app reaches a Java monolith through NGINX. We are extracting a Sessions service in Go; the monolith and the new Attendee service will call it through the public gateway URL.',
      system: 'Monolith plus two extracted services behind one NGINX edge proxy; internal calls routed back out through the public gateway.',
      flags: ['Security review needed: service-to-service authentication and mTLS', 'Assumed Kubernetes on-prem, no service discovery beyond DNS'],
      findings: [
        { sev: 'High', lens: 'Gateway', issue: 'Gateway loopback: internal calls leave and re-enter via the edge, making it a bottleneck and single point of failure.', mitigation: 'Use internal discovery for east–west calls (platform DNS now, mesh when services multiply). Owner: platform team.' },
        { sev: 'High', lens: 'Release', issue: 'No separation of deploy and release; Sessions goes live to all traffic at once.', mitigation: 'Weighted canary at the gateway with error-rate and latency gates and automatic rollback. Owner: Sessions team.' },
        { sev: 'Medium', lens: 'Observability', issue: 'No trace IDs across monolith and services; failures can’t be located.', mitigation: 'Inject trace context at the edge, propagate with OpenTelemetry in all three apps.' },
      ],
      verdict: 'Sound with changes',
      confidence: 'Medium',
    },
    agentCall: `MODE: review
FORMAT: structured
CONTEXT: Kubernetes on-prem, Java + Go, 99.9% SLA
Mobile app → NGINX → Java monolith. Extracting a
Sessions service; internal calls via the public gateway.`,
    files: [
      ['system-prompt.md', 'The instructions, for any LLM tool (under 8,000 characters)'],
      ['references/ (10 files)', 'The knowledge base: traffic choices, API gateways, service mesh, anti-patterns, selection, deploy & release, release observability, evolving architectures, cloud migration, review procedure'],
      ['api-platform-architect-all-in-one.md', 'Instructions + all references in one file'],
      ['INSTALL.md', 'Step-by-step setup for ChatGPT, Gemini, Copilot, Claude, Mistral, local models and APIs'],
      ['SKILL.md · agent/', 'Claude skill and Claude Code agent (worker tier) formats'],
      ['README.md', 'What it does and how to use it'],
    ],
    limits: 'Not a security review: authentication, authorization and zero-trust design are flagged for a security specialist. Product and version facts about the 2025–26 landscape are marked as general knowledge; verify them before you decide. Independent work by MIKA Labs, not affiliated with or endorsed by the authors or publishers of the books it draws on.',
  },
  {
    slug: 'event-flow-architect',
    name: 'Okeanos',
    tier: 'worker',
    tagline: 'Designs and reviews event-driven, real-time integration between systems and organisations.',
    category: 'Integration',
    tags: ['Event-driven', 'Streaming', 'CloudEvents', 'AsyncAPI', 'JSON output'],
    icon: 'flow',
    cover: 'linear-gradient(135deg,#5EEAD4 0%,#0FA294 50%,#0E6E8C 100%)',
    price: 'Free',
    version: '1.0',
    updated: 'Nov 2026',
    size: '74 KB',
    license: 'Free · as is',
    worksWith: ['ChatGPT', 'Gemini', 'Copilot', 'Claude', 'Mistral', 'Local models', 'Any LLM API'],
    description:
      'An event flow architect for people and for other agents. Describe a business or process and it finds where real-time, event-driven integration pays off and what should stay as API or batch. Describe an integration and it designs the events, contracts, delivery guarantees and technology class. Give it an existing event or streaming architecture and it returns a review: findings rated Critical to Low, each with its basis and a concrete fix, and a clear verdict.',
    features: [
      'Finds flow opportunities and says plainly what should stay API or batch',
      'Event-first designs: messaging vs eventing, discrete vs series, single action vs workflow',
      'Severity-rated reviews with concrete fixes and a clear verdict',
      'CloudEvents envelopes, AsyncAPI contracts, outbox and idempotency built in',
      'Structured JSON mode for orchestrator agents; never blocks on missing facts',
    ],
    builtOn: [
      'Ideas from Flow Architectures (Urquhart)',
      'Wardley Mapping',
      'Promise Theory',
      'Collector / Distributor / Signal / Facilitator patterns',
      'Event decision tree (messaging vs eventing)',
      'EventStorming',
      'Log & queue semantics, outbox, idempotent consumers',
      'Schema registries & evolution',
      'CloudEvents 1.0',
      'AsyncAPI 3.0',
      'MQTT & AMQP',
    ],
    install: [
      ['ChatGPT (Custom GPT)', 'Paste `system-prompt.md` into Instructions and upload the `references/` files as Knowledge.'],
      ['Google Gemini (Gem)', 'Paste `system-prompt.md` into Instructions and add the `references/` files as knowledge.'],
      ['Microsoft Copilot (Copilot Studio)', 'Create an agent, paste `system-prompt.md` into Instructions, upload `references/` as knowledge.'],
      ['Claude', 'Upload the folder as a skill, or use `system-prompt.md` and `references/` in a Project. Claude Code: see `INSTALL.md`.'],
      ['Mistral, local models (Ollama, LM Studio) & other assistants', 'Use `system-prompt.md` as the system prompt and attach `references/`, or use the single `event-flow-architect-all-in-one.md`.'],
      ['APIs & agent frameworks', 'Send `event-flow-architect-all-in-one.md` as the system message (≈18k tokens), or `system-prompt.md` plus RAG over `references/`.'],
    ],
    sample: {
      request: 'Review: our order service writes to Postgres, then publishes OrderPlaced to Kafka. Three logistics partners read the same topic over the internet.',
      system: 'Order service dual-writes to Postgres and Kafka; three external partners consume the internal OrderPlaced topic directly.',
      flags: ['Cross-organisation flow: partners see the internal schema', 'Order data may contain personal data (GDPR)', 'Delivery assumed at-least-once'],
      findings: [
        { sev: 'High', lens: 'Reliability & delivery', issue: 'Saving to the database and then publishing is a dual write. A crash between the two loses or invents orders for partners.', mitigation: 'Transactional outbox or CDC from Postgres; partners dedupe on event id. Owner: order service team.' },
        { sev: 'High', lens: 'Security', issue: 'Partners share one internal topic, with no per-partner access, revocation or payload encryption.', mitigation: 'Curated external stream per partner via gateway or signed webhooks, per-partner credentials, minimal payload. Owner: platform team.' },
        { sev: 'Medium', lens: 'Contracts & agility', issue: 'No standard envelope or schema rule, so any internal change breaks partners.', mitigation: 'CloudEvents envelope, registered schema with backward compatibility, AsyncAPI doc for partners.' },
      ],
      verdict: 'Proceed with conditions',
      confidence: 'Medium',
    },
    agentCall: `MODE: review
FORMAT: structured
CONTEXT: logistics, EU, three external partners
Order service writes to Postgres, then publishes
OrderPlaced to Kafka; partners read the same topic.`,
    files: [
      ['system-prompt.md', 'The instructions, for any LLM tool (under 8,000 characters)'],
      ['references/ (10 files)', 'The knowledge base: flow fundamentals, business case, value chain & mapping, finding opportunities, event-first architecture, flow patterns, flow requirements, standards & technology, readiness, review procedure'],
      ['event-flow-architect-all-in-one.md', 'Instructions + all references in one file'],
      ['INSTALL.md', 'Step-by-step setup for ChatGPT, Gemini, Copilot, Claude, Mistral, local models and APIs'],
      ['SKILL.md · agent/', 'Claude skill and Claude Code agent (worker tier) formats'],
      ['README.md', 'What it does and how to use it'],
    ],
    limits: 'Architecture advice, not vendor selection: products are examples, so verify versions and support. Standards checked on 1 Nov 2026. Does not replace security or legal review of cross-organisation data sharing. Independent work by MIKA Labs, not affiliated with or endorsed by the authors or publishers of the books it draws on.',
  },
]

// Agent hierarchy level. Only workers exist for now; add higher levels here when they are defined.
export const TIER_LABEL = { worker: 'Worker' }

export const findAgent = (slug) => AGENTS.find((a) => a.slug === slug)
export const zipUrl = (a) => `/downloads/${a.slug}.zip`
export const zipName = (a) => `${a.slug}.zip`
