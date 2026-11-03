import { Hero, Footer, EMAIL } from '../components/Layout.jsx'
import { BookButton, BookingNote } from '../components/BookButton.jsx'
import { Icon } from '../components/Icons.jsx'
import Cycle from '../components/Cycle.jsx'

const SERVICES = [
  {
    icon: 'spark',
    title: 'AI agents & assistants',
    text: "Agents that read documents, answer from your company's knowledge and take actions in your tools.",
    tags: 'RAG · Knowledge graphs · MCP · LLM agents',
  },
  {
    icon: 'flow',
    title: 'Process automation',
    text: 'We map how work flows today, then automate it end to end, keeping people in the loop where decisions matter.',
    tags: 'BPMN · Workflow orchestration · Human-in-the-loop',
  },
  {
    icon: 'code',
    title: 'Backend & integration',
    text: 'APIs and integration layers that connect your ERP, CRM, document systems and data, reliably.',
    tags: 'REST · SOAP · Event-driven · Java / Spring',
  },
  {
    icon: 'server',
    title: 'Infrastructure & operations',
    text: 'Containerised, monitored and documented deployments, in the cloud or on your own servers.',
    tags: 'Docker · CI/CD · AWS · Monitoring',
  },
]

const STEPS = [
  ['01', 'Map', 'We study the process, its systems and its bottlenecks, and pick what to automate first.'],
  ['02', 'Build', 'We build the integrations and backend services the automation needs.'],
  ['03', 'Automate', 'We add the AI and the workflow, and test them on real cases with your team.'],
  ['04', 'Run', 'We deploy, monitor and improve it, and hand over everything your team needs.'],
]

export default function Home() {
  return (
    <>
      <Hero>
        <div className="herobody">
          <h1>AI &amp; automation, built around you.</h1>
          <p>From AI agents to automated workflows and the systems underneath them, we design, build and run the technology that takes manual work off you and your team.</p>
          <div className="ctas">
            <BookButton label="Book a demo" className="btn" />
            <a className="text" href="#services">Explore our services</a>
          </div>
        </div>
      </Hero>

      <main>
        <section id="services" className="build wrap">
          <div className="head">
            <span className="eyebrow">Services</span>
            <h2>The AI and the infrastructure, from one team.</h2>
            <p>Automation only works when the AI and the systems underneath it are built together. We do both.</p>
          </div>
          <div className="caps">
            {SERVICES.map((s) => (
              <article className="cap" key={s.title}>
                <Icon name={s.icon} />
                <h3>{s.title}</h3>
                <p>{s.text}</p>
                <p className="mono">{s.tags}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="vision" className="how">
          <div className="wrap">
            <span className="eyebrow">Vision</span>
            <h2>Every manual process, turned into a system that runs itself.</h2>
            <p className="lede">We see automation as a loop, not a one-off project: map the work, build the foundations, add the AI, run it, and keep improving.</p>
            <Cycle steps={STEPS} />
          </div>
        </section>

        <section id="contact" className="contact wrap">
          <div>
            <span className="eyebrow">Get started</span>
            <h2>Which process should run itself?</h2>
            <p>Tell us where your team loses the most time. We'll tell you honestly what can be automated, and what it takes.</p>
            <div className="btnrow">
              <BookButton label="Book a demo" className="btn" />
              <a className="btn-outline" href={`mailto:${EMAIL}`}>Email us</a>
            </div>
            <BookingNote />
          </div>
          <div className="fields">
            <div className="field"><span>Email</span><a href={`mailto:${EMAIL}`}>{EMAIL}</a></div>
            <div className="field"><span>Based in</span><b>Athens, Greece</b></div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
