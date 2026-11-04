import { Hero, Footer } from '../components/Layout.jsx'
import { Icon } from '../components/Icons.jsx'
import { BookButton } from '../components/BookButton.jsx'
import FlowDiagram from '../components/FlowDiagram.jsx'
import { Link } from 'react-router-dom'
import { SERVICES } from '../data/services.js'
import CtaBand from '../components/CtaBand.jsx'

const EXPLORE = [
  ['/platform', 'Platform', 'A workflow system for agents', 'How agents, memory, tools and people fit together in one workflow.'],
  ['/use-cases', 'Use cases', 'Agent workflows in practice', 'Invoice processing, document intake and AI compliance review, step by step.'],
  ['/vision', 'Vision', 'Map, build, automate, run', 'Why we treat automation as a loop, not a one-off project.'],
]


export default function Home() {
  return (
    <>
      <Hero>
        <div className="herobody split">
          <div>
            <h1>AI &amp; automation, built around you.</h1>
            <p>From AI agents to automated workflows and the systems underneath them, we design, build and run the technology that takes manual work off you and your team.</p>
            <div className="ctas">
              <BookButton label="Book a demo" className="btn" />
              <a className="text" href="#services">Explore our services</a>
            </div>
          </div>
          <FlowDiagram />
        </div>
      </Hero>

      <main>
        <section id="services" className="build wrap">
          <div className="head">
            <span className="eyebrow">Services</span>
            <h2>The AI and the infrastructure, from one team.</h2>
            <p>Automation only works when the AI and the systems underneath it are built together. We do both. <Link to="/services">All services →</Link></p>
          </div>
          <div className="caps">
            {SERVICES.map((s) => (
              <Link className="cap cap-link" key={s.slug} to={`/services/${s.slug}`}>
                <Icon name={s.icon} />
                <h3>{s.title}</h3>
                <p>{s.text}</p>
                <span className="more">Learn more →</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="build wrap svc-steps">
          <div className="head">
            <span className="eyebrow">Explore</span>
            <h2>How we build agent workflows.</h2>
          </div>
          <div className="caps caps-3">
            {EXPLORE.map(([to, eyebrow, title, text]) => (
              <Link className="cap cap-link" key={to} to={to}>
                <span className="uc-flow mono">{eyebrow}</span>
                <h3>{title}</h3>
                <p>{text}</p>
                <span className="more">Read more →</span>
              </Link>
            ))}
          </div>
        </section>

        <CtaBand />
      </main>

      <Footer />
    </>
  )
}
