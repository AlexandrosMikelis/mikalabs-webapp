import { Link } from 'react-router-dom'
import { Hero, Footer } from '../components/Layout.jsx'
import Cycle from '../components/Cycle.jsx'
import CtaBand from '../components/CtaBand.jsx'
import { STEPS } from '../data/services.js'

export default function Vision() {
  return (
    <>
      <Hero>
        <div className="herobody left">
          <span className="eyebrow">Vision</span>
          <h1>Every manual process, turned into a system that runs itself.</h1>
          <p>We see automation as a loop, not a one-off project: map the work, build the foundations, add the AI, run it, and keep improving.</p>
        </div>
      </Hero>

      <main>
        <section className="how">
          <div className="wrap">
            <span className="eyebrow">How we work</span>
            <h2>Four steps, repeated for every process.</h2>
            <Cycle steps={STEPS} />
            <nav className="more-links on-dark" aria-label="Related">
              <span>See it applied:</span>
              <Link to="/services">Services</Link>
              <Link to="/use-cases">Use cases</Link>
            </nav>
          </div>
        </section>

        <CtaBand />
      </main>

      <Footer />
    </>
  )
}
