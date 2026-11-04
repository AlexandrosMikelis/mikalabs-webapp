import { useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Home from './pages/Home.jsx'
import About from './pages/About.jsx'
import Vision from './pages/Vision.jsx'
import Store from './pages/Store.jsx'
import { STORE_URL } from './components/AgentStore.jsx'
import AgentDetail from './pages/AgentDetail.jsx'
import { findAgent } from './data/agents.js'
import Privacy from './pages/Privacy.jsx'
import Services from './pages/Services.jsx'
import ServiceDetail from './pages/ServiceDetail.jsx'
import Contact from './pages/Contact.jsx'
import Terms from './pages/Terms.jsx'
import { findService } from './data/services.js'
import Platform from './pages/Platform.jsx'
import UseCases from './pages/UseCases.jsx'
import UseCaseDetail from './pages/UseCaseDetail.jsx'
import Resources from './pages/Resources.jsx'
import GuideInstall from './pages/GuideInstall.jsx'
import { findUseCase } from './data/useCases.js'

const TITLES = {
  '/': 'MIKA Labs — AI & automation',
  '/about': 'About — MIKA Labs',
  '/vision': 'Vision — MIKA Labs',
  '/services/ai-agents/store': 'Agent store — MIKA Labs',
  '/privacy': 'Privacy — MIKA Labs',
  '/services': 'Services — MIKA Labs',
  '/contact': 'Contact — MIKA Labs',
  '/terms': 'Terms — MIKA Labs',
  '/platform': 'Platform — MIKA Labs',
  '/use-cases': 'Use cases — MIKA Labs',
  '/resources': 'Resources — MIKA Labs',
  '/resources/install-an-agent': 'Install an agent in any AI tool — MIKA Labs',
}

/* Scroll to #hash after navigation, or to top on a plain route change. */
function ScrollManager() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    const path = pathname.replace(/(.)\/$/, '$1')
    const agent = path.startsWith('/agents/') && findAgent(path.split('/')[2])
    const service = path.startsWith('/services/') && findService(path.split('/')[2])
    const useCase = path.startsWith('/use-cases/') && findUseCase(path.split('/')[2])
    const named = agent ? `${agent.name} — MIKA Labs agents` : (service || useCase) && `${(service || useCase).title} — MIKA Labs`
    document.title = TITLES[path] || named || TITLES['/']
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
        <Route path="/agents" element={<Navigate to={STORE_URL} replace />} />
        <Route path="/vision" element={<Vision />} />
        <Route path="/agents/:slug" element={<AgentDetail />} />
        <Route path="/team" element={<Navigate to="/about" replace />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/services" element={<Services />} />
        <Route path="/services/ai-agents/store" element={<Store />} />
        <Route path="/services/:slug" element={<ServiceDetail />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/platform" element={<Platform />} />
        <Route path="/use-cases" element={<UseCases />} />
        <Route path="/use-cases/:slug" element={<UseCaseDetail />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/resources/install-an-agent" element={<GuideInstall />} />
        {/* old static URLs */}
        <Route path="/index.html" element={<Navigate to="/" replace />} />
        <Route path="/company.html" element={<Navigate to="/" replace />} />
        <Route path="/privacy.html" element={<Navigate to="/privacy" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}
