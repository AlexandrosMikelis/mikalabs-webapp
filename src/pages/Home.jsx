import { Hero, Footer } from '../components/Layout.jsx'
import { BookButton } from '../components/BookButton.jsx'
import FlowDiagram from '../components/FlowDiagram.jsx'
import { Link } from 'react-router-dom'
import ServiceTracks from '../components/ServiceTracks.jsx'
import CtaBand from '../components/CtaBand.jsx'

const EXPLORE = [
  ['/services/ai-agents/store', 'Agent store', 'Free agents for any LLM', 'Ready-made agents you can use today in ChatGPT, Gemini, Copilot, Claude or your own stack.'],
  ['/use-cases', 'Use cases', 'Agent workflows in practice', 'Invoice processing, document intake and AI compliance review, step by step.'],
  ['/vision', 'Vision', 'Map, build, automate, run', 'Why we treat automation as a loop, not a one-off project.'],
]


export default function Home() {
  return (
    <>
      <Hero>
        <div className="herobody split">
          <div>
            <h1>AI &amp; Automation, built around you.</h1>
            <p>We advise you on where AI pays off, what the EU AI Act asks of you and which technology to choose. Then, if you want, we design, build and run it with you.</p>
            <div className="ctas">
              <BookButton label="Book a call" className="btn" />
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
            <h2>Advice first. Implementation when you're ready.</h2>
            <p>Start with consulting, with no commitment to build. When it makes sense, the same team that gave the advice builds it. <Link to="/services">All services →</Link></p>
          </div>
          <ServiceTracks />
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
