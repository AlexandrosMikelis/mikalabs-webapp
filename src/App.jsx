import { useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Team from './pages/Team.jsx'
import Privacy from './pages/Privacy.jsx'

const TITLES = {
  '/': 'MIKA Labs — AI & automation',
  '/team': 'Team — Alexandros Mikelis · MIKA Labs',
  '/privacy': 'Privacy — MIKA Labs',
}

/* Scroll to #hash after navigation, or to top on a plain route change. */
function ScrollManager() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    document.title = TITLES[pathname] || TITLES['/']
    if (hash) {
      const el = document.getElementById(hash.slice(1))
      if (el) { el.scrollIntoView(); return }
    }
    window.scrollTo(0, 0)
  }, [pathname, hash])
  return null
}

export default function App() {
  return (
    <>
      <ScrollManager />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/team" element={<Team />} />
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
