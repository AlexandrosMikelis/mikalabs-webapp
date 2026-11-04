import { Link } from 'react-router-dom'
import { Hero, Footer, EMAIL } from '../components/Layout.jsx'

const Mail = () => <a href={`mailto:${EMAIL}`}>{EMAIL}</a>

// DRAFT — have a lawyer review before relying on it.
export default function Terms() {
  return (
    <>
      <Hero>
        <div className="herobody left">
          <span className="eyebrow">Terms</span>
          <h1>Terms of use.</h1>
          <p>The rules for using this website and the free agents you can download from it.</p>
        </div>
      </Hero>

      <main className="privacy wrap">
        <div className="doc">
          <p className="updated">Last updated: 4 November 2026</p>

          <section>
            <h2>Who we are</h2>
            <p>This website is run by <b>MIKA LABS ΜΟΝΟΠΡΟΣΩΠΗ Ι.Κ.Ε.</b> (MIKA LABS SINGLE MEMBER P.C.), Γ.Ε.ΜΗ. 196695102000, Α.Φ.Μ. 803427107, Athens, Greece. Contact: <Mail />.</p>
          </section>

          <section>
            <h2>Using this website</h2>
            <p>You may browse the site and share links to it. The text, design, logo and images belong to MIKA Labs; please don't copy them for your own site or products without asking us first.</p>
            <p>The site is provided for information. We keep it accurate, but it is not an offer, and services are agreed only in a separate written contract.</p>
          </section>

          <section id="agents">
            <h2>Downloadable agents</h2>
            <ul>
              <li><b>Free to use.</b> You may download, use and adapt the agents in our <Link to="/services/ai-agents/store">agent store</Link> for personal and business use, free of charge.</li>
              <li><b>Attribution.</b> If you share an agent or a modified version with others, keep the credit to MIKA Labs in its README.</li>
              <li><b>As is.</b> The agents are provided without warranty of any kind. Their output is produced by the AI model you run them on and can be wrong or incomplete.</li>
              <li><b>Not professional advice.</b> An agent's output is not legal, compliance, financial or other professional advice. Check important results with a qualified person before acting on them.</li>
              <li><b>Your AI provider.</b> You choose and run the AI tool or model. Its terms, costs and data handling apply, and you are responsible for what you send to it, including any personal data.</li>
            </ul>
          </section>

          <section>
            <h2>Liability</h2>
            <p>To the extent the law allows, MIKA Labs is not liable for loss or damage arising from your use of this website or of the downloadable agents. Nothing in these terms limits liability that cannot be limited by law, such as liability for intent or gross negligence.</p>
          </section>

          <section>
            <h2>Other services</h2>
            <p>Booking a call uses Google Calendar and the site is hosted on GitHub Pages; their own terms apply to those services. How we handle your data is described in the <Link to="/privacy">privacy notice</Link>.</p>
          </section>

          <section>
            <h2>Law and changes</h2>
            <p>These terms are governed by Greek law, and the courts of Athens have jurisdiction. If you are a consumer, you keep the protections of the law of your country of residence.</p>
            <p>We may update these terms; the date at the top shows the latest version.</p>
          </section>
        </div>
      </main>

      <Footer />
    </>
  )
}
