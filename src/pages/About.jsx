import { useCallback, useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Hero, Footer, EMAIL } from '../components/Layout.jsx'
import CtaBand from '../components/CtaBand.jsx'
import { Icon } from '../components/Icons.jsx'
import CvDrawer from '../components/CvDrawer.jsx'
import { COMPANY } from '../data/company.js'

const LINKEDIN = 'https://www.linkedin.com/in/alexandros-mikelis-b4a9521a5/'

const VALUES = [
  ['spark', 'Engineering first', 'The AI is only as good as the systems under it, so we build both.'],
  ['flow', 'Honest scoping', "We tell you what's worth automating, and what isn't."],
  ['server', 'You own it', 'Documented, monitored and handed over, with no lock-in.'],
]

export default function About() {
  const { hash } = useLocation()
  const [cvOpen, setCvOpen] = useState(hash === '#cv')

  useEffect(() => { if (hash === '#cv') setCvOpen(true) }, [hash])

  // #cv in the URL makes the CV shareable; replaceState avoids a router scroll jump
  const openCv = () => { setCvOpen(true); window.history.replaceState(window.history.state, '', '#cv') }
  const closeCv = useCallback(() => {
    setCvOpen(false)
    window.history.replaceState(window.history.state, '', window.location.pathname)
  }, [])

  return (
    <>
      <Hero>
        <div className="herobody">
          <span className="member">Our mission</span>
          <h1>AI &amp; automation that actually ships.</h1>
          <p>MIKA Labs is an Athens-based engineering company. We design, build and run AI agents, automated workflows and the systems underneath them.</p>
          <div className="ctas">
            <a className="btn" href="#team">Meet the team</a>
            <a className="text" href="#company">Company details</a>
          </div>
        </div>
      </Hero>

      <main>
        <section className="build wrap">
          <div className="head">
            <span className="eyebrow">What we stand for</span>
            <h2>How we work with you.</h2>
          </div>
          <div className="values">
            {VALUES.map(([icon, h, p]) => (
              <article className="value" key={h}><Icon name={icon} /><h3>{h}</h3><p>{p}</p></article>
            ))}
          </div>
        </section>

        <section id="team" className="exp wrap">
          <div className="head">
            <span className="eyebrow">Team</span>
            <h2>The people behind MIKA Labs.</h2>
          </div>
          <div className="team-grid">
            <article className="person">
              <div className="photo" aria-hidden="true"><span>AM</span></div>
              <div className="body">
                <h3>Alexandros Mikelis</h3>
                <span className="role">Founder · Electrical &amp; Computer Engineer</span>
                <p>Builds AI agents, backend integrations and process automation, from the model down to the servers it runs on.</p>
                <div className="actions">
                  <button className="linkbtn" onClick={openCv}>View CV →</button>
                  <a href={LINKEDIN} target="_blank" rel="noopener">LinkedIn</a>
                </div>
              </div>
            </article>
          </div>
        </section>

        <section id="company" className="wrap">
          <div className="company-box">
            <div className="intro">
              <span className="eyebrow">Company details</span>
              <h2>MIKA Labs</h2>
              <p>A Greek single-member private company, registered in Athens.</p>
            </div>
            <dl className="facts">
              {COMPANY.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
              <div><dt>Email</dt><dd><a href={`mailto:${EMAIL}`}>{EMAIL}</a></dd></div>
            </dl>
          </div>
        </section>

        <CtaBand title="Let's talk about your processes." text="Book a 30-minute call and we'll look at where your team loses the most time." />
      </main>

      <Footer />
      {cvOpen && <CvDrawer onClose={closeCv} />}
    </>
  )
}
