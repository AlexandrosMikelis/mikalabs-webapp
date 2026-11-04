import { Link } from 'react-router-dom'
import { Hero, Footer } from '../components/Layout.jsx'
import { Icon } from '../components/Icons.jsx'
import CtaBand from '../components/CtaBand.jsx'
import { SERVICES } from '../data/services.js'
import { STORE_URL } from '../components/AgentStore.jsx'

export default function Services() {
  return (
    <>
      <Hero>
        <div className="herobody left">
          <span className="eyebrow">Services</span>
          <h1>The AI and the infrastructure, from one team.</h1>
          <p>Automation only works when the AI and the systems underneath it are built together. We do both, from the first process map to the system running in production.</p>
        </div>
      </Hero>

      <main>
        <section className="build wrap">
          <div className="caps">
            {SERVICES.map((s) => (
              <Link className="cap cap-link" key={s.slug} to={`/services/${s.slug}`}>
                <Icon name={s.icon} />
                <h3>{s.title}</h3>
                <p>{s.text}</p>
                <p className="mono">{s.tags}</p>
                <span className="more">Learn more →</span>
              </Link>
            ))}
          </div>
        </section>

        <nav className="wrap more-links" aria-label="Related">
          <span>How we work:</span><Link to="/vision">Map → Build → Automate → Run</Link>
          <span className="sep" aria-hidden="true">·</span><Link to={STORE_URL}>Free agent store</Link>
        </nav>

        <CtaBand />
      </main>

      <Footer />
    </>
  )
}
