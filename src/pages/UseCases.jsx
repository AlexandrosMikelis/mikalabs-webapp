import { Link } from 'react-router-dom'
import { Hero, Footer } from '../components/Layout.jsx'
import CtaBand from '../components/CtaBand.jsx'
import { USE_CASES } from '../data/useCases.js'

export function UseCaseCards({ items = USE_CASES }) {
  return (
    <div className="caps caps-3">
      {items.map((u) => (
        <Link className="cap cap-link uc-card" key={u.slug} to={`/use-cases/${u.slug}`}>
          <span className="uc-flow mono">{u.inputs[0][0]} → {u.steps.length} agents → {u.outputs[0][0]}</span>
          <h3>{u.title}</h3>
          <p>{u.tagline}</p>
          <span className="more">See the workflow →</span>
        </Link>
      ))}
    </div>
  )
}

export default function UseCases() {
  return (
    <>
      <Hero>
        <div className="herobody left">
          <span className="eyebrow">Use cases</span>
          <h1>Agent workflows, by business process.</h1>
          <p>Examples of processes we turn into agent workflows: what goes in, which agents handle it, where people stay in control, and what comes out.</p>
        </div>
      </Hero>

      <main>
        <section className="build wrap">
          <UseCaseCards />
          <p className="uc-disclaimer">These are example workflows that show how we approach each process, not client case studies. Every real project starts by mapping your own process.</p>
        </section>
        <CtaBand title="Have a process like these?" />
      </main>

      <Footer />
    </>
  )
}
