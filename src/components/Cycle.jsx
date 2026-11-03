import { useState } from 'react'

const C = 200 // centre of the 400x400 viewBox
const R = 140 // ring radius
const NODE = 44 // node radius
const GAP = 25 // degrees left free either side of a node

const pt = (deg, r = R) => {
  const a = (deg * Math.PI) / 180
  return [C + r * Math.cos(a), C + r * Math.sin(a)]
}

const arc = (from, to) => {
  const [x1, y1] = pt(from + GAP)
  const [x2, y2] = pt(to - GAP)
  return `M${x1.toFixed(1)} ${y1.toFixed(1)} A${R} ${R} 0 0 1 ${x2.toFixed(1)} ${y2.toFixed(1)}`
}

/* steps: [[num, title, text], ...] placed clockwise from the top */
export default function Cycle({ steps }) {
  const [active, setActive] = useState(null)
  const angles = steps.map((_, i) => -90 + (360 / steps.length) * i)

  return (
    <div className="cycle">
      <svg className="ring" viewBox="0 0 400 400" role="img" aria-label={`A continuous cycle: ${steps.map((s) => s[1]).join(', then ')}, and back to ${steps[0][1]}.`}>
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0 0L10 5L0 10z" fill="#80E9FF" />
          </marker>
        </defs>

        <circle cx={C} cy={C} r={R} fill="none" stroke="rgba(128,233,255,.12)" strokeWidth="18" />
        {angles.map((a, i) => (
          <path key={i} d={arc(a, angles[(i + 1) % angles.length] + (i === angles.length - 1 ? 360 : 0))}
            fill="none" stroke="#80E9FF" strokeWidth="2" markerEnd="url(#arrow)" />
        ))}

        <g className="orbit" aria-hidden="true">
          <circle cx={C} cy={C - R} r="5" fill="#fff" />
        </g>

        <g className="centre" aria-hidden="true">
          <text x={C} y={C - 6} textAnchor="middle" className="c1">Continuous</text>
          <text x={C} y={C + 16} textAnchor="middle" className="c2">improvement</text>
        </g>

        {steps.map(([n, title], i) => {
          const [x, y] = pt(angles[i])
          const on = active === i
          return (
            <g key={n} className={`node${on ? ' on' : ''}`} onMouseEnter={() => setActive(i)} onMouseLeave={() => setActive(null)}>
              <circle cx={x} cy={y} r={NODE} />
              <text x={x} y={y - 6} textAnchor="middle" className="n">{n}</text>
              <text x={x} y={y + 13} textAnchor="middle" className="t">{title}</text>
            </g>
          )
        })}
      </svg>

      <ol className="cycle-steps">
        {steps.map(([n, title, text], i) => (
          <li key={n} className={active === i ? 'on' : undefined} onMouseEnter={() => setActive(i)} onMouseLeave={() => setActive(null)}>
            <span className="mono">{n}</span>
            <div><h3>{title}</h3><p>{text}</p></div>
          </li>
        ))}
      </ol>
    </div>
  )
}
