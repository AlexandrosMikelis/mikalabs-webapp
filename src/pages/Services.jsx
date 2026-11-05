import { Link } from 'react-router-dom'
import { Hero, Footer } from '../components/Layout.jsx'
import CtaBand from '../components/CtaBand.jsx'
import ServiceTracks from '../components/ServiceTracks.jsx'
import { STORE_URL } from '../components/AgentStore.jsx'

export default function Services() {
  return (
    <>
      <Hero>
        <div className="herobody left">
          <span className="eyebrow">Services</span>
          <h1>Consulting and implementation, from one team.</h1>
          <p>We start as your advisors: where AI pays off, what the regulation requires, which technology to choose. When you're ready, we build and run it, from the first process map to the system in production.</p>
        </div>
      </Hero>

      <main>
        <section className="build wrap">
          <ServiceTracks showTags />
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
