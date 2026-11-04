import { Link, Navigate, useParams } from 'react-router-dom'
import { Hero, Footer } from '../components/Layout.jsx'
import CtaBand from '../components/CtaBand.jsx'
import { STORE_URL } from '../components/AgentStore.jsx'
import { SERVICES, findService } from '../data/services.js'

export default function ServiceDetail() {
  const { slug } = useParams()
  const s = findService(slug)
  if (!s) return <Navigate to="/services" replace />
  const others = SERVICES.filter((o) => o.slug !== s.slug)

  return (
    <>
      <Hero>
        <div className="herobody left">
          <nav className="crumbs" aria-label="Breadcrumb"><Link to="/services">Services</Link> / {s.title}</nav>
          <h1>{s.title}</h1>
          <p>{s.intro}</p>
          <p className="mono svc-tags">{s.tags}</p>
        </div>
      </Hero>

      <main>
        <section className="wrap svc-body">
          <div className="svc-col">
            <h2>What we do</h2>
            <ul className="checks">{s.what.map((x) => <li key={x}>{x}</li>)}</ul>
          </div>
          <div className="svc-col">
            <h2>What you get</h2>
            <ul className="checks">{s.get.map((x) => <li key={x}>{x}</li>)}</ul>
          </div>
          <aside className="svc-fit">
            <span className="eyebrow">A good fit if</span>
            <p>{s.fit}</p>
          </aside>
        </section>

        {s.slug === 'ai-agents' && (
          <section className="wrap promo-sec">
            <Link className="store-promo" to={STORE_URL}>
              <span><b>Agent store</b><small>Ready-made agents, free, for ChatGPT, Gemini, Copilot, Claude or any LLM.</small></span>
              <span className="more">Browse the store →</span>
            </Link>
          </section>
        )}

        <nav className="wrap more-links" aria-label="Related">
          <span>Other services:</span>
          {others.map((o) => <Link key={o.slug} to={`/services/${o.slug}`}>{o.title}</Link>)}
          <span className="sep" aria-hidden="true">·</span>
          <Link to="/vision">How we work</Link>
        </nav>

        <CtaBand />
      </main>

      <Footer />
    </>
  )
}
