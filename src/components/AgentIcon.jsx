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
}

export default function AgentIcon({ agent, size = 56 }) {
  return (
    <span className="agent-icon" style={{ width: size, height: size, background: agent.cover, borderRadius: size * 0.26 }} aria-hidden="true">
      <svg width={size * 0.56} height={size * 0.56} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        {GLYPHS[agent.icon] || GLYPHS.scale}
      </svg>
    </span>
  )
}
