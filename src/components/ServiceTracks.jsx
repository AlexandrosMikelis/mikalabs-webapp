import { Link } from 'react-router-dom'
import { Icon } from './Icons.jsx'
import { TRACKS, servicesIn } from '../data/services.js'

// Services grouped into the Advise (consulting) and Build & run (implementation) tracks.
export default function ServiceTracks({ showTags = false }) {
  return (
    <div className="tracks">
      {TRACKS.map((t) => {
        const items = servicesIn(t.key)
        return (
          <div className="track" key={t.key}>
            <div className="track-head">
              <span className="track-label mono">{t.label}</span>
              <h3>{t.title}</h3>
              <p>{t.text}</p>
            </div>
            <div className={`caps${items.length === 3 ? ' caps-3' : ''}`}>
              {items.map((s) => (
                <Link className="cap cap-link" key={s.slug} to={`/services/${s.slug}`}>
                  <Icon name={s.icon} />
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                  {showTags && <p className="mono">{s.tags}</p>}
                  <span className="more">Learn more →</span>
                </Link>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
