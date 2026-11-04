import { Link } from 'react-router-dom'
import { Hero, Footer } from '../components/Layout.jsx'
import FlowDiagram from '../components/FlowDiagram.jsx'
import CtaBand from '../components/CtaBand.jsx'

const PARTS = [
  ['Router', 'Takes each incoming task, decides which agents handle it and in what order.'],
  ['Agents', 'Specialised agents that read, research, act and check, each with a clear job.'],
  ['Memory', 'Shared context: your documents, records and what happened in earlier steps.'],
  ['Tools & MCP', 'Controlled access to your systems through APIs and the Model Context Protocol.'],
  ['Reviewer', 'A checking agent that validates results before anything leaves the workflow.'],
  ['People', 'Approval steps where decisions matter, with the full context in front of the approver.'],
]

const PRINCIPLES = [
  ['Human in the loop', 'Approvals, exceptions and escalations are part of the workflow, not an afterthought.'],
  ['Guardrails', 'Each agent only gets the tools and data its job needs, with permissions you set.'],
  ['Audit trail', 'Every step, input, output and decision is logged, so you can see why something happened.'],
  ['Observability', 'Runs, failures and retries are monitored, so nothing fails silently.'],
  ['Model-independent', 'Works with the LLM provider that suits you, in the cloud or on your own servers.'],
  ['EU-ready', 'Designed around GDPR and the EU AI Act: data minimisation, logging and human oversight.'],
]

export default function Platform() {
  return (
    <>
      <Hero>
        <div className="herobody left">
          <span className="eyebrow">Platform · in development</span>
          <h1>A workflow system built for AI agents.</h1>
          <p>The orchestration layer we use to run agent workflows: it routes work between agents, gives them memory and tools, and keeps people in control of the decisions.</p>
        </div>
      </Hero>

      <main>
        <section className="wrap uc-diagram">
          <FlowDiagram />
        </section>

        <section className="build wrap">
          <div className="head">
            <span className="eyebrow">Architecture</span>
            <h2>The building blocks of every workflow.</h2>
          </div>
          <div className="parts">
            {PARTS.map(([t, d]) => <div className="part" key={t}><h3>{t}</h3><p>{d}</p></div>)}
          </div>
        </section>

        <section className="build wrap svc-steps">
          <div className="head">
            <span className="eyebrow">Built for production</span>
            <h2>Agents you can trust with real work.</h2>
          </div>
          <ul className="checks two-col principles">
            {PRINCIPLES.map(([t, d]) => <li key={t}><b>{t}.</b> {d}</li>)}
          </ul>
          <p className="uc-disclaimer">The platform is in development. See how this approach applies to common processes in our <Link to="/use-cases">use cases</Link>.</p>
        </section>

        <CtaBand title="Get early access." text="Book a call to see the platform on one of your own processes, or to ask about early access." />
      </main>

      <Footer />
    </>
  )
}
