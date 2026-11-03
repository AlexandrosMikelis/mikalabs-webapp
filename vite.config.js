import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Served from the root of mikalaboratories.com (github.io/mikalabs-webapp redirects there)
  base: '/',
})
