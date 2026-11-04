import { Link, Navigate, useParams } from 'react-router-dom'
import { PlainHeader, Footer, EMAIL } from '../components/Layout.jsx'
import AgentIcon from '../components/AgentIcon.jsx'
import { STORE_URL } from '../components/AgentStore.jsx'
import Rich from '../components/Rich.jsx'
import { findAgent, zipUrl, zipName } from '../data/agents.js'

function DownloadIcon() {
  return <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M10 3v10M5.5 8.5L10 13l4.5-4.5M4 17h12" /></svg>
}

/* Document-style sample output: what a review from the agent looks like. */
function SampleReport({ sample }) {
  return (
    <div className="report">
      <div className="report-head">
        <span>Sample review</span>
        <span className="muted">Illustrative · shortened</span>
      </div>
      <div className="report-req"><span className="lbl">Request</span><p>{sample.request}</p></div>
      <dl className="report-meta">
        <div><dt>System</dt><dd>{sample.system}</dd></div>
        <div><dt>Regulatory flags</dt><dd><ul>{sample.flags.map((f) => <li key={f}>{f}</li>)}</ul></dd></div>
      </dl>
      <table className="findings">
        <thead><tr><th>Severity</th><th>Finding</th><th>Mitigation</th></tr></thead>
        <tbody>
          {sample.findings.map((f) => (
            <tr key={f.issue}>
              <td><span className={`sev sev-${f.sev.toLowerCase()}`}>{f.sev}</span></td>
              <td><b>{f.issue}</b><span className="lens">{f.lens}</span></td>
              <td>{f.mitigation}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="report-verdict">
        <span className="lbl">Verdict</span>
        <b>{sample.verdict}</b>
        <span className="muted">Confidence: {sample.confidence}</span>
      </div>
    </div>
  )
}

export default function AgentDetail() {
  const { slug } = useParams()
  const agent = findAgent(slug)
  if (!agent) return <Navigate to="/agents" replace />

  const facts = [
    ['Price', agent.price],
    ['Version', agent.version],
    ['Updated', agent.updated],
    ['Size', `${agent.size} · .zip`],
    ['Category', agent.category],
    ['License', <Link to="/terms#agents">{agent.license}</Link>],
  ]

  return (
    <>
      <PlainHeader />

      <main className="listing wrap">
        <div className="crumbs"><Link to="/services/ai-agents">AI agents</Link><span aria-hidden="true">/</span><Link to={STORE_URL}>Agent store</Link><span aria-hidden="true">/</span><span>{agent.name}</span></div>

        <div className="listing-grid">
          <aside className="side">
            <div className="side-card">
              <AgentIcon agent={agent} size={64} />
              <a className="btn side-get" href={zipUrl(agent)} download={zipName(agent)}><DownloadIcon />Get it, free</a>
              <dl className="facts-list">
                {facts.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
              </dl>
              <div className="side-works">
                <span>Works with</span>
                <ul className="product-tags">{agent.worksWith.map((w) => <li key={w}>{w}</li>)}</ul>
              </div>
            </div>
            <p className="side-help">Need it adapted to your company? <a href={`mailto:${EMAIL}`}>Contact us</a></p>
          </aside>

          <article className="listing-main">
            <header className="listing-head">
              <h1>{agent.name}</h1>
              <p>{agent.tagline}</p>
              <ul className="product-tags">{agent.tags.map((t) => <li key={t}>{t}</li>)}</ul>
            </header>

            <section className="lsec">
              <h2>Overview</h2>
              <p className="ltext">{agent.description}</p>
              <ul className="checks two-col">{agent.features.map((f) => <li key={f}>{f}</li>)}</ul>
            </section>

            <section className="lsec">
              <h2>Sample review</h2>
              <SampleReport sample={agent.sample} />
            </section>

            <section className="lsec">
              <h2>Install</h2>
              <ol className="install">
                {agent.install.map(([h, p]) => <li key={h}><b>{h}</b><span><Rich text={p} /></span></li>)}
              </ol>
            </section>

            <section className="lsec lsec-split">
              <div>
                <h2>Use it from another agent</h2>
                <p className="ltext small">Optional headers set the mode and output. <code>FORMAT: structured</code> returns JSON.</p>
                <pre className="code">{agent.agentCall}</pre>
              </div>
              <div>
                <h2>What's included</h2>
                <dl className="specs">
                  {agent.files.map(([f, d]) => <div key={f}><dt><code>{f}</code></dt><dd>{d}</dd></div>)}
                </dl>
              </div>
            </section>

            <p className="limits">{agent.limits}</p>
          </article>
        </div>
      </main>

      <Footer />
    </>
  )
}
