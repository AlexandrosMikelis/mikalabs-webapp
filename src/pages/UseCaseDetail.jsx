import { Link, Navigate, useParams } from 'react-router-dom'
import { Hero, Footer } from '../components/Layout.jsx'
import FlowDiagram from '../components/FlowDiagram.jsx'
import CtaBand from '../components/CtaBand.jsx'
import { USE_CASES, findUseCase } from '../data/useCases.js'
import { findService } from '../data/services.js'
import { findAgent } from '../data/agents.js'

export default function UseCaseDetail() {
  const { slug } = useParams()
  const u = findUseCase(slug)
  if (!u) return <Navigate to="/use-cases" replace />
  const agent = u.agent && findAgent(u.agent)

  return (
    <>
      <Hero>
        <div className="herobody left">
          <nav className="crumbs" aria-label="Breadcrumb"><Link to="/use-cases">Use cases</Link> / {u.title}</nav>
          <h1>{u.title}</h1>
          <p>{u.tagline}</p>
        </div>
      </Hero>

      <main>
        <section className="wrap uc-diagram">
          <FlowDiagram inputs={u.inputs} outputs={u.outputs} nodes={u.nodes} />
          <p className="uc-caption">Example workflow · illustrative</p>
        </section>

        <section className="wrap svc-body">
          <div className="svc-col">
            <h2>The problem</h2>
            <p className="uc-text">{u.problem}</p>
            <h2 className="uc-h2">People stay in control</h2>
            <p className="uc-text">{u.human}</p>
          </div>
          <div className="svc-col">
            <h2>The agent workflow</h2>
            <ol className="uc-steps">
              {u.steps.map(([t, d]) => <li key={t}><b>{t}</b><span>{d}</span></li>)}
            </ol>
          </div>
          <aside className="svc-fit">
            <span className="eyebrow">Built with</span>
            <p className="uc-links">
              {u.services.map(findService).filter(Boolean).map((s) => <Link key={s.slug} to={`/services/${s.slug}`}>{s.title}</Link>)}
              {agent && <Link to={`/agents/${agent.slug}`}>Try the free {agent.name} →</Link>}
            </p>
          </aside>
        </section>

        <nav className="wrap more-links" aria-label="Related">
          <span>Other use cases:</span>
          {USE_CASES.filter((o) => o.slug !== u.slug).map((o) => <Link key={o.slug} to={`/use-cases/${o.slug}`}>{o.title}</Link>)}
          <span className="sep" aria-hidden="true">·</span><Link to="/services/ai-agents">How we build agents</Link>
        </nav>

        <CtaBand title={`Want this for your ${u.title.toLowerCase()}?`} text="We start by mapping how the process runs at your company today, then show you what an agent workflow would change." />
      </main>

      <Footer />
    </>
  )
}
