// Give every route a real HTML file so GitHub Pages answers 200 (not the 404.html fallback),
// and package the downloadable agents from agents/ into dist/downloads/.
import { copyFileSync, mkdirSync, readdirSync, rmSync } from 'node:fs'
import { resolve } from 'node:path'
import { AGENTS } from '../src/data/agents.js'
import { SERVICES } from '../src/data/services.js'
import { USE_CASES } from '../src/data/useCases.js'
import { packageAgent } from './package-agent.js'

const ROUTES = ['about', 'agents', 'privacy', 'services', 'contact', 'terms', 'platform', 'use-cases', 'vision', 'services/ai-agents/store',
  'resources', 'resources/install-an-agent',
  'team', // old URLs: the app redirects /team to /about and /agents to the store
  ...AGENTS.map((a) => `agents/${a.slug}`), ...SERVICES.map((s) => `services/${s.slug}`),
  ...USE_CASES.map((u) => `use-cases/${u.slug}`)]

for (const r of ROUTES) {
  mkdirSync(`dist/${r}`, { recursive: true })
  copyFileSync('dist/index.html', `dist/${r}/index.html`)
}
copyFileSync('dist/index.html', 'dist/404.html') // unknown URLs still load the app, which redirects home

mkdirSync('dist/downloads', { recursive: true })
const names = readdirSync('agents').filter((n) => !n.startsWith('.'))
for (const name of names) {
  const out = resolve(`dist/downloads/${name}.zip`)
  rmSync(out, { force: true })
  packageAgent(name, { outFile: out })
}
console.log('postbuild: route pages for', ROUTES.join(', '), '· agent zips:', names.join(', '))
