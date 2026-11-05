/* App-style icons for agents: white glyph on the agent's gradient tile. */
const GLYPHS = {
  // scales of justice: ethics advisor
  scale: (
    <>
      <path d="M12 3v17M7 20h10" />
      <path d="M5 7h14" />
      <circle cx="12" cy="4.6" r="1.1" fill="#fff" stroke="none" />
      <path d="M5 7l-3 6.2a3 3 0 006 0L5 7zM19 7l-3 6.2a3 3 0 006 0L19 7z" />
    </>
  ),
  // braces with connector: API design reviewer
  api: (
    <>
      <path d="M8 4H7a2 2 0 00-2 2v3.5a2 2 0 01-2 2.5 2 2 0 012 2.5V18a2 2 0 002 2h1" />
      <path d="M16 4h1a2 2 0 012 2v3.5a2 2 0 002 2.5 2 2 0 00-2 2.5V18a2 2 0 01-2 2h-1" />
      <path d="M9.5 12h5" />
      <circle cx="9.5" cy="12" r="1.3" fill="#fff" stroke="none" />
      <circle cx="14.5" cy="12" r="1.3" fill="#fff" stroke="none" />
    </>
  ),
  // eye inside a shield: API security reviewer
  shield: (
    <>
      <path d="M12 2.5 4.5 5.5v6c0 4.6 3.1 8.6 7.5 10 4.4-1.4 7.5-5.4 7.5-10v-6L12 2.5Z" />
      <path d="M7.5 12c1.2-2 2.7-3 4.5-3s3.3 1 4.5 3c-1.2 2-2.7 3-4.5 3s-3.3-1-4.5-3Z" />
      <circle cx="12" cy="12" r="1.4" />
    </>
  ),
  // gateway arch routing traffic to backends: API platform architect
  gateway: (
    <>
      <path d="M4 21V10a8 8 0 0116 0v11" />
      <path d="M8 21v-9a4 4 0 018 0v9" />
      <path d="M2 21h20" />
      <path d="M12 12v5M12 14l-3 3M12 14l3 3" />
    </>
  ),
  // river of events: event flow architect
  flow: (
    <>
      <path d="M2 8c2.5-2.5 5-2.5 7.5 0s5 2.5 7.5 0 3.5-2 5-1" />
      <path d="M2 16c2.5-2.5 5-2.5 7.5 0s5 2.5 7.5 0 3.5-2 5-1" />
      <circle cx="6" cy="6.3" r="1.2" fill="#fff" stroke="none" />
      <circle cx="13" cy="9.7" r="1.2" fill="#fff" stroke="none" />
      <circle cx="9.5" cy="14.3" r="1.2" fill="#fff" stroke="none" />
      <circle cx="18" cy="17.6" r="1.2" fill="#fff" stroke="none" />
    </>
  ),
}

// Designed icons in src/assets/agent-icons/, named after the agent (themis.svg, hermes.svg, …).
// When an agent has one it is used; otherwise the gradient tile with a glyph below is the fallback.
const FILES = import.meta.glob('../assets/agent-icons/*.svg', { eager: true, import: 'default' })
const iconFor = (agent) => FILES[`../assets/agent-icons/${agent.name.toLowerCase()}.svg`]

export default function AgentIcon({ agent, size = 56 }) {
  const src = iconFor(agent)
  if (src) {
    return <img className="agent-icon agent-icon-img" src={src} width={size} height={size} alt="" aria-hidden="true" style={{ borderRadius: size * 0.22 }} />
  }
  return (
    <span className="agent-icon" style={{ width: size, height: size, background: agent.cover, borderRadius: size * 0.26 }} aria-hidden="true">
      <svg width={size * 0.56} height={size * 0.56} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        {GLYPHS[agent.icon] || GLYPHS.scale}
      </svg>
    </span>
  )
}
