import { Link } from 'react-router-dom'
import { Hero, Footer } from '../components/Layout.jsx'
import CtaBand from '../components/CtaBand.jsx'

export const GUIDES = [
  {
    slug: 'install-an-agent',
    title: 'Install a downloadable agent in any AI tool',
    text: 'Step-by-step setup for ChatGPT, Gemini, Copilot, Claude, Mistral, local models and APIs.',
    kind: 'Guide',
  },
]

export default function Resources() {
  return (
    <>
      <Hero>
        <div className="herobody left">
          <span className="eyebrow">Resources</span>
          <h1>Guides for working with AI agents.</h1>
          <p>Practical guides from our work: how to set up agents, connect them to your tools and run them responsibly.</p>
        </div>
      </Hero>

      <main>
        <section className="build wrap">
          <div className="head"><span className="eyebrow">Guides</span></div>
          <div className="caps caps-3">
            {GUIDES.map((g) => (
              <Link className="cap cap-link" key={g.slug} to={`/resources/${g.slug}`}>
                <span className="uc-flow mono">{g.kind}</span>
                <h3>{g.title}</h3>
                <p>{g.text}</p>
                <span className="more">Read the guide →</span>
              </Link>
            ))}
          </div>
          <p className="uc-disclaimer">More guides and articles are on the way.</p>
        </section>
        <CtaBand />
      </main>

      <Footer />
    </>
  )
}
