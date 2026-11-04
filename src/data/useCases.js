// Use cases: example agent workflows, by business process. These are illustrations of what we build,
// not client case studies. Plain JS so scripts/postbuild.js can read the slugs too.
import { ICONS } from './icons.js'

export const USE_CASES = [
  {
    slug: 'invoice-processing',
    title: 'Invoice processing',
    tagline: 'From the supplier email to the posted invoice, with a person approving exceptions.',
    problem: 'Invoices arrive by email and portal in every format. Someone opens each one, types the fields into the ERP, looks up the purchase order and chases approvals. It is slow, repetitive and error-prone.',
    inputs: [['Email', ICONS.mail], ['PDF invoice', ICONS.doc], ['Portal', ICONS.globe]],
    outputs: [['ERP', ICONS.db], ['Payments', ICONS.card], ['Team chat', ICONS.chat]],
    nodes: { router: ['Intake', ICONS.inbox], research: ['Extract', ICONS.doc], memory: ['PO match', ICONS.db], executor: ['Post', ICONS.bolt], reviewer: ['Approve', ICONS.shield], tools: ['ERP API', ICONS.tool] },
    steps: [
      ['Intake', 'Collects invoices from the mailbox and the supplier portal and removes duplicates.'],
      ['Extract', 'Reads supplier, amounts, VAT and line items from any layout.'],
      ['PO match', 'Matches the invoice to the purchase order and goods receipt, and flags differences.'],
      ['Approve', 'Checks the result against your rules; anything unusual goes to a person.'],
      ['Post', 'Posts the approved invoice to the ERP and tells the team in chat.'],
    ],
    human: 'Exceptions, mismatches and invoices above your threshold go to a named approver before anything is posted.',
    services: ['ai-agents', 'process-automation', 'integration'],
  },
  {
    slug: 'document-intake',
    title: 'Document intake',
    tagline: 'Every incoming document classified, read and filed in the right system.',
    problem: 'Contracts, applications, IDs and forms arrive by email, scan and web upload. Staff sort them by hand, re-type key data and file them in several systems, so requests wait in a queue.',
    inputs: [['Email', ICONS.mail], ['Scan', ICONS.scan], ['Web form', ICONS.form]],
    outputs: [['DMS', ICONS.db], ['CRM', ICONS.users], ['Case queue', ICONS.ticket]],
    nodes: { router: ['Classify', ICONS.tag], research: ['Extract', ICONS.doc], memory: ['Records', ICONS.db], executor: ['File', ICONS.bolt], reviewer: ['Validate', ICONS.shield], tools: ['OCR', ICONS.scan] },
    steps: [
      ['Classify', 'Recognises the document type and who it belongs to.'],
      ['Extract', 'Reads the key fields, using OCR for scans and photos.'],
      ['Records', 'Looks up the customer or case it belongs to.'],
      ['Validate', 'Checks completeness and consistency; missing items trigger a request back.'],
      ['File', 'Files the document and data in the right systems and opens or updates the case.'],
    ],
    human: 'Low-confidence readings and incomplete files go to a person, who sees the document and the extracted data side by side.',
    services: ['ai-agents', 'process-automation', 'integration'],
  },
  {
    slug: 'compliance-review',
    title: 'AI compliance review',
    tagline: 'A first review of AI systems and vendor tools against ethics and the EU AI Act.',
    problem: 'Teams want to launch AI features and buy AI tools faster than legal and compliance can review them. Reviews are inconsistent, and the same questions are asked every time.',
    inputs: [['Design doc', ICONS.doc], ['Vendor tool', ICONS.globe], ['Request', ICONS.ticket]],
    outputs: [['Report', ICONS.doc], ['Risk log', ICONS.db], ['Team chat', ICONS.chat]],
    nodes: { router: ['Scope', ICONS.route], research: ['Research', ICONS.search], memory: ['Frameworks', ICONS.db], executor: ['Assess', ICONS.scale], reviewer: ['Reviewer', ICONS.shield], tools: ['Evidence', ICONS.tool] },
    steps: [
      ['Scope', 'Works out what the system does, who it affects and how automated it is.'],
      ['Research', 'Gathers the facts from the design document or vendor material.'],
      ['Frameworks', 'Applies ethics principles and the EU AI Act risk tiers.'],
      ['Assess', 'Rates findings by severity, each with a concrete mitigation.'],
      ['Reviewer', 'Produces the verdict and report, and flags points for legal to confirm.'],
    ],
    human: 'The report is a first review for your legal and compliance team, who confirm the regulatory points and make the decision.',
    services: ['ai-agents', 'process-automation'],
    agent: 'ai-ethics-advisor',
  },
]

export const findUseCase = (slug) => USE_CASES.find((u) => u.slug === slug)
