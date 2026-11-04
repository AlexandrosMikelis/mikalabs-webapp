import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { SERVICES } from '../data/services.js'
import { STORE_URL } from './AgentStore.jsx'

export const EMAIL = 'info@mikalaboratories.com'

function Logo() {
  return (
    <Link className="logo" to="/" aria-label="MIKA Labs home">
      <svg width="44" height="31" viewBox="0 0 82 58" aria-hidden="true">
        <path d="M4 44V6l17 26L38 6v38M48 14v38h30" fill="none" stroke="#0A2540" strokeWidth="3.4" />
      </svg>
      <span>MIKA LABS</span>
    </Link>
  )
}

/* Fixed navbar: transparent over the gradient, frosted white once the page scrolls. */
export function Nav({ solid = false }) {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false) // mobile menu
  const { pathname } = useLocation()
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  useEffect(() => setOpen(false), [pathname])

  return (
    <div className={`navbar${scrolled || solid || open ? ' scrolled' : ''}${open ? ' open' : ''}`}>
      <div className="wrap">
        <nav aria-label="Main">
          <Logo />
          <button className="menu-btn" aria-expanded={open} aria-controls="main-links" onClick={() => setOpen((o) => !o)}>
            <span className="sr-only">Menu</span>
            <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d={open ? 'M6 6l12 12M18 6 6 18' : 'M4 7h16M4 12h16M4 17h16'} /></svg>
          </button>
          <div className="links" id="main-links">
            <div className="dd">
              <NavLink to="/services" className="dd-top">Services <span aria-hidden="true">▾</span></NavLink>
              <div className="dd-menu">
                {SERVICES.map((s) => s.slug === 'ai-agents' ? (
                  <div className="dd-sub" key={s.slug}>
                    <Link to={`/services/${s.slug}`}>{s.title} <span className="dd-caret" aria-hidden="true">›</span></Link>
                    <div className="dd-fly">
                      <Link to={STORE_URL}>Agent store</Link>
                    </div>
                  </div>
                ) : <Link key={s.slug} to={`/services/${s.slug}`}>{s.title}</Link>)}
              </div>
            </div>
            <NavLink to="/platform">Platform</NavLink>
            <NavLink to="/use-cases">Use cases</NavLink>
            <NavLink to="/vision">Vision</NavLink>
            <NavLink to="/about">About</NavLink>
            <NavLink className="pill" to="/contact">Contact</NavLink>
          </div>
        </nav>
      </div>
    </div>
  )
}

export function Hero({ children }) {
  return (
    <>
    {/* outside .hero: its isolation would trap the navbar's z-index under the page content */}
    <Nav />
    <header className="hero">
      <div className="hero-bg" aria-hidden="true" />
      <div className="wrap">
        {children}
      </div>
    </header>
    </>
  )
}

/* For plain white pages: solid navbar, no gradient header. */
export function PlainHeader() {
  return (
    <>
      <Nav solid />
      <div className="plain-spacer" aria-hidden="true" />
    </>
  )
}

export function Footer() {
  return (
    <footer>
      <div className="wrap">
        <span><b>MIKA LABS ΜΟΝΟΠΡΟΣΩΠΗ Ι.Κ.Ε.</b> · MIKA LABS SINGLE MEMBER P.C.</span>
        <span>Γ.Ε.ΜΗ. 196695102000 · Α.Φ.Μ. 803427107 · Δ.Ο.Υ. ΚΕΦΟΔΕ Αττικής</span>
        <span className="foot-links">
          <Link to="/services">Services</Link><Link to="/platform">Platform</Link><Link to="/use-cases">Use cases</Link>
          <Link to="/vision">Vision</Link><Link to={STORE_URL}>Agent store</Link><Link to="/resources">Resources</Link><Link to="/about">About</Link>
          <Link to="/contact">Contact</Link><Link to="/terms">Terms</Link><Link to="/privacy">Privacy</Link>
        </span>
      </div>
    </footer>
  )
}
