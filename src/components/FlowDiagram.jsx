import { useEffect, useRef, useState } from 'react'
import { ICONS } from '../data/icons.js'

// A live agent-graph diagram: work comes in on the left, a graph of connected agents handles it
// (a task hops along the edges, each agent lights up as it works), and the result lands in your
// systems on the right. Used in the Home hero, and on each use case, with its own labels.

const ROWS = [70, 200, 330] // y of the three input and output cards
const INPUTS = [['Email', ICONS.mail], ['Invoice', ICONS.doc], ['Form', ICONS.form]]
const OUTPUTS = [['ERP', ICONS.db], ['CRM', ICONS.users], ['Team chat', ICONS.chat]]
const NR = 27 // agent node radius
// graph geometry is fixed; labels and icons can be overridden per diagram
const NODES = {
  router: { x: 240, y: 200, label: 'Router', icon: ICONS.route },
  research: { x: 318, y: 82, label: 'Research', icon: ICONS.search },
  memory: { x: 432, y: 82, label: 'Memory', icon: ICONS.db },
  executor: { x: 380, y: 214, label: 'Executor', icon: ICONS.bolt },
  reviewer: { x: 500, y: 200, label: 'Reviewer', icon: ICONS.shield },
  tools: { x: 318, y: 318, label: 'Tools', icon: ICONS.tool },
}
const LINKS = [
  ['router', 'research'], ['router', 'executor'], ['router', 'tools'],
  ['research', 'memory'], ['research', 'executor'], ['memory', 'executor'], ['memory', 'reviewer'],
  ['executor', 'reviewer'], ['executor', 'tools'],
]
const IN_X = 156, OUT_X = 576 // card edges the wires attach to
const R = NODES.router, V = NODES.reviewer
const wireIn = (y) => `M${IN_X},${y} C${IN_X + 44},${y} ${R.x - NR - 44},${R.y} ${R.x - NR},${R.y}`
const wireOut = (y) => `M${V.x + NR},${V.y} C${V.x + NR + 44},${V.y} ${OUT_X - 44},${y} ${OUT_X},${y}`

// each run: [input, agents visited in order, output]
const RUNS = [
  [1, ['router', 'research', 'memory', 'executor', 'reviewer'], 0],
  [0, ['router', 'executor', 'tools', 'executor', 'reviewer', 'executor', 'reviewer'], 1], // sent back once
  [2, ['router', 'tools', 'executor', 'memory', 'reviewer'], 2],
]
const HOP = 650, WIRE = 900, DWELL = 380, GAP = 700 // ms

const linkKey = (a, b) => [a, b].sort().join('-')

function Card({ x, y, label, icon, side }) {
  return (
    <g transform={`translate(${x},${y - 26})`}>
      <rect className="fd-card" width="136" height="52" rx="12" />
      <g transform="translate(14,14)"><path className="fd-ico" d={icon} /></g>
      <text className="fd-label" x="48" y="31">{label}</text>
      <circle className={`fd-dot ${side}`} cx={side === 'in' ? 136 : 0} cy="26" r="4" />
    </g>
  )
}

export default function FlowDiagram({ inputs = INPUTS, outputs = OUTPUTS, nodes: labels = {}, label }) {
  const nodes = Object.fromEntries(Object.entries(NODES).map(([k, n]) => [k, { ...n, ...(labels[k] && { label: labels[k][0], icon: labels[k][1] }) }]))
  const paths = useRef({})
  const pkt = useRef(null)
  const [active, setActive] = useState(null)
  const [hot, setHot] = useState(null)

  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    // flatten every run into moves along paths and dwells at nodes
    const steps = RUNS.flatMap(([i, hops, o]) => {
      const s = [{ move: `in${i}`, dur: WIRE }]
      hops.forEach((n, k) => {
        s.push({ dwell: n, dur: DWELL })
        const next = hops[k + 1]
        if (next) {
          const key = linkKey(n, next)
          s.push({ move: key, reverse: key.split('-')[0] !== n, dur: HOP, link: key })
        }
      })
      s.push({ move: `out${o}`, dur: WIRE }, { pause: true, dur: GAP })
      return s
    })
    const total = steps.reduce((t, s) => t + s.dur, 0)
    let raf, last
    const t0 = performance.now()
    const frame = (t) => {
      raf = requestAnimationFrame(frame)
      let ms = Math.max(0, t - t0) % total
      let idx = 0
      while (ms >= steps[idx].dur) ms -= steps[idx++].dur
      const s = steps[idx]
      const p = ms / s.dur
      const dot = pkt.current
      if (s.move) {
        const el = paths.current[s.move]
        const len = el.getTotalLength()
        const e = p < 0.5 ? 2 * p * p : 1 - (-2 * p + 2) ** 2 / 2
        const pt = el.getPointAtLength((s.reverse ? 1 - e : e) * len)
        dot.setAttribute('cx', pt.x); dot.setAttribute('cy', pt.y)
        dot.style.opacity = 1
      } else if (s.pause) dot.style.opacity = 0
      if (idx !== last) {
        last = idx
        setActive(s.dwell || null)
        if (s.link) setHot(s.link)
      }
    }
    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <svg className="flow" viewBox="0 0 720 400" role="img"
      aria-label={label || `Diagram: ${inputs.map((n) => n[0]).join(', ')} go to a network of connected AI agents (${Object.values(nodes).map((n) => n.label).join(', ')}) that pass the work between them, then update ${outputs.map((n) => n[0]).join(', ')}`}>
      {ROWS.map((y, i) => <path key={`in${i}`} ref={(el) => (paths.current[`in${i}`] = el)} className="fd-wire" d={wireIn(y)} />)}
      {ROWS.map((y, i) => <path key={`out${i}`} ref={(el) => (paths.current[`out${i}`] = el)} className="fd-wire" d={wireOut(y)} />)}

      {LINKS.map(([a, b]) => {
        const key = linkKey(a, b)
        const [p, q] = key.split('-').map((k) => nodes[k])
        return <path key={key} ref={(el) => (paths.current[key] = el)} className={`fd-edge${hot === key ? ' hot' : ''}`} d={`M${p.x},${p.y} L${q.x},${q.y}`} />
      })}

      <circle ref={pkt} className="fd-pkt" r="5.5" style={{ opacity: 0 }} />

      {inputs.map(([l, icon], i) => <Card key={l} x={IN_X - 136} y={ROWS[i]} label={l} icon={icon} side="in" />)}
      {outputs.map(([l, icon], i) => <Card key={l} x={OUT_X} y={ROWS[i]} label={l} icon={icon} side="out" />)}

      {Object.entries(nodes).map(([k, n]) => (
        <g key={k} className={`fd-node${active === k ? ' on' : ''}`} transform={`translate(${n.x},${n.y})`}>
          <circle className="fd-node-halo" r={NR + 8} />
          <circle className="fd-node-c" r={NR} />
          <g transform="translate(-10.8,-10.8) scale(.9)"><path className="fd-node-ico" d={n.icon} /></g>
          <text className="fd-node-label" y={NR + 17}>{n.label}</text>
        </g>
      ))}
    </svg>
  )
}
