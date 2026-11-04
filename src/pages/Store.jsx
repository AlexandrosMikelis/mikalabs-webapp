import { Link } from 'react-router-dom'
import { Hero, Footer } from '../components/Layout.jsx'
import AgentStore from '../components/AgentStore.jsx'
import CtaBand from '../components/CtaBand.jsx'

export default function Store() {
  return (
    <>
      <Hero>
        <div className="herobody left store-hero">
          <nav className="crumbs" aria-label="Breadcrumb"><Link to="/services">Services</Link> / <Link to="/services/ai-agents">AI agents</Link> / Agent store</nav>
          <h1>Agent store</h1>
          <p>Ready-made AI agents, free. Download one and load it into ChatGPT, Gemini, Copilot, Claude or any LLM, and it works on your behalf.</p>
        </div>
      </Hero>

      <main className="wrap store-page">
        <AgentStore />
        <p className="uc-disclaimer">New to this? Read <Link to="/resources/install-an-agent">how to install an agent in any AI tool</Link>.</p>
      </main>

      <CtaBand title="Need an agent built for your business?" text="We design and build custom AI agents around your processes, tools and data." />
      <Footer />
    </>
  )
}
