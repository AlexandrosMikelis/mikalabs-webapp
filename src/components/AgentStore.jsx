import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AGENTS, TIER_LABEL, zipUrl, zipName } from '../data/agents.js'
import AgentIcon from './AgentIcon.jsx'

export const STORE_URL = '/services/ai-agents/store'

// The agent store: category chips, search and download tiles. Rendered by the /services/ai-agents/store page.
export default function AgentStore() {
  const [query, setQuery] = useState('')
  const [cat, setCat] = useState('All')
  const cats = ['All', ...new Set(AGENTS.map((a) => a.category))]

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase()
    return AGENTS.filter((a) =>
      (cat === 'All' || a.category === cat) &&
      (!q || [a.name, a.tagline, a.category, ...a.tags].join(' ').toLowerCase().includes(q)))
  }, [query, cat])

  return (
    <div className="store">
      <div className="store-bar">
        <div className="chips-row" role="tablist" aria-label="Categories">
          {cats.map((c) => (
            <button key={c} role="tab" aria-selected={cat === c} className={`chip${cat === c ? ' on' : ''}`} onClick={() => setCat(c)}>{c}</button>
          ))}
        </div>
        <label className="search">
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="9" cy="9" r="6" /><path d="M14 14l4 4" /></svg>
          <input type="search" placeholder="Search agents" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search agents" />
        </label>
      </div>

      <p className="store-count">{shown.length} {shown.length === 1 ? 'agent' : 'agents'}</p>

      {shown.length ? (
        <div className="tiles">
          {shown.map((a) => (
            <article className="tile" key={a.slug}>
              <Link to={`/agents/${a.slug}`} className="tile-link">
                <AgentIcon agent={a} size={52} />
                <div className="tile-text">
                  <h3>{a.name}{a.tier && <span className="tier-badge">{TIER_LABEL[a.tier] || a.tier}</span>}</h3>
                  <span className="tile-cat">{a.category}</span>
                  <p>{a.tagline}</p>
                </div>
              </Link>
              <a className="get" href={zipUrl(a)} download={zipName(a)} aria-label={`Download ${a.name}`}>Get</a>
            </article>
          ))}
        </div>
      ) : (
        <p className="empty">No agents match “{query}”.</p>
      )}
    </div>
  )
}
