import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Relative asset URLs: works on the custom domain (/) and on github.io/mikalabs-webapp/
  base: './',
})
