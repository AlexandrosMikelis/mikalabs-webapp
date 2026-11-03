import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'

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
export function Nav() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className={`navbar${scrolled ? ' scrolled' : ''}`}>
      <div className="wrap">
        <nav aria-label="Main">
          <Logo />
          <div className="links">
            <Link className="hide-sm" to="/#services">Services</Link>
            <Link className="hide-sm" to="/#vision">Vision</Link>
            <NavLink to="/about">About</NavLink>
            <Link className="pill" to="/#contact">Contact</Link>
          </div>
        </nav>
      </div>
    </div>
  )
}

export function Hero({ children, short = false }) {
  return (
    <>
    {/* outside .hero: its isolation would trap the navbar's z-index under the page content */}
    <Nav />
    <header className="hero">
      <div className="mesh" aria-hidden="true" style={{
        // resume the drift where the previous page left it (36s = one full alternate cycle)
        '--mesh-t': `-${Math.round(performance.now() % 36000)}ms`,
        ...(short && { maskImage: 'linear-gradient(180deg,#000 40%,transparent)', WebkitMaskImage: 'linear-gradient(180deg,#000 40%,transparent)' }),
      }} />
      <div className="wrap">
        {children}
      </div>
    </header>
    </>
  )
}

export function Footer() {
  return (
    <footer>
      <div className="wrap">
        <span><b>MIKA LABS ΜΟΝΟΠΡΟΣΩΠΗ Ι.Κ.Ε.</b> · MIKA LABS SINGLE MEMBER P.C.</span>
        <span>Γ.Ε.ΜΗ. 196695102000 · Α.Φ.Μ. 803427107 · Δ.Ο.Υ. ΚΕΦΟΔΕ Αττικής · <Link to="/privacy">Privacy</Link></span>
      </div>
    </footer>
  )
}
