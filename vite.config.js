import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { existsSync } from 'node:fs'
import { packageAgent } from './scripts/package-agent.js'

// Dev only: serve /downloads/<agent>.zip packaged on the fly from agents/<agent>/
// (production zips are written by scripts/postbuild.js, same packaging)
const agentZips = {
  name: 'agent-zips',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      const m = req.url?.match(/^\/downloads\/([\w-]+)\.zip$/)
      if (!m || !existsSync(`agents/${m[1]}`)) return next()
      res.setHeader('Content-Type', 'application/zip')
      res.setHeader('Content-Disposition', `attachment; filename="${m[1]}.zip"`)
      res.end(packageAgent(m[1]))
    })
  },
}

export default defineConfig({
  plugins: [react(), agentZips],
  // Served from the root of mikalaboratories.com (github.io/mikalabs-webapp redirects there)
  base: '/',
})
