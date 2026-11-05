const ICONS = {
  compass: { bg: '#E9F8EF', stroke: '#1F8A4C', d: <><circle cx="10" cy="10" r="7.5" /><path d="M13 7l-1.8 4.2L7 13l1.8-4.2z" /></> },
  shield: { bg: '#EEF2FF', stroke: '#3B5BDB', d: <><path d="M10 2.5l6 2.3v4.6c0 3.6-2.5 6.6-6 8.1-3.5-1.5-6-4.5-6-8.1V4.8z" /><path d="M7.3 10l1.9 1.9 3.6-3.6" /></> },
  layers: { bg: '#F4EFFF', stroke: '#7B4FD6', d: <><path d="M10 2.5l7.5 3.8L10 10 2.5 6.3z" /><path d="M2.5 10l7.5 3.8 7.5-3.8M2.5 13.7l7.5 3.8 7.5-3.8" /></> },
  spark: { bg: '#EFEEFF', stroke: '#635BFF', d: <path d="M10 2l2 5.2L17.5 9l-5.5 1.8L10 16l-2-5.2L2.5 9 8 7.2z" /> },
  flow: { bg: '#FFEEF6', stroke: '#D63F8C', d: <><rect x="2" y="2" width="6" height="5" rx="1" /><rect x="12" y="13" width="6" height="5" rx="1" /><path d="M5 7v5h10v1" /></> },
  code: { bg: '#E6F9FF', stroke: '#0088B3', d: <path d="M6 5l-4 5 4 5M14 5l4 5-4 5M11.5 3l-3 14" /> },
  server: { bg: '#FFF3EA', stroke: '#C2602B', d: <><rect x="2.5" y="3" width="15" height="5" rx="1.2" /><rect x="2.5" y="12" width="15" height="5" rx="1.2" /><path d="M6 5.5h.01M6 14.5h.01" /></> },
}

export function Icon({ name }) {
  const i = ICONS[name]
  return (
    <div className="ic" style={{ background: i.bg }}>
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke={i.stroke} strokeWidth="1.8" aria-hidden="true">{i.d}</svg>
    </div>
  )
}
