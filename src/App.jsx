import { useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Home from './pages/Home.jsx'
import About from './pages/About.jsx'
import Privacy from './pages/Privacy.jsx'

const TITLES = {
  '/': 'MIKA Labs — AI & automation',
  '/about': 'About — MIKA Labs',
  '/privacy': 'Privacy — MIKA Labs',
}

/* Scroll to #hash after navigation, or to top on a plain route change. */
function ScrollManager() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    document.title = TITLES[pathname.replace(/(.)\/$/, '$1')] || TITLES['/']
    if (hash) {
      const el = document.getElementById(hash.slice(1))
      if (el) el.scrollIntoView()
      return // hashes like #cv open UI instead of scrolling
    }
    window.scrollTo({ top: 0, behavior: 'instant' }) // jump, the page fade-in is the transition
  }, [pathname, hash])
  return null
}

export default function App() {
  return (
    <>
      <ScrollManager />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/team" element={<Navigate to="/about" replace />} />
        <Route path="/privacy" element={<Privacy />} />
        {/* old static URLs */}
        <Route path="/index.html" element={<Navigate to="/" replace />} />
        <Route path="/company.html" element={<Navigate to="/" replace />} />
        <Route path="/privacy.html" element={<Navigate to="/privacy" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}
