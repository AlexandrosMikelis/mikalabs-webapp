// Give every route a real HTML file so GitHub Pages answers 200 (not the 404.html fallback).
import { copyFileSync, mkdirSync } from 'node:fs'

const ROUTES = ['about', 'privacy', 'team'] // team: old URL, the app redirects it to /about

for (const r of ROUTES) {
  mkdirSync(`dist/${r}`, { recursive: true })
  copyFileSync('dist/index.html', `dist/${r}/index.html`)
}
copyFileSync('dist/index.html', 'dist/404.html') // unknown URLs still load the app, which redirects home
console.log('postbuild: route pages written for', ROUTES.join(', '))
