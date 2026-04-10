import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
// For GitHub Pages project sites, set base to "/<repo-name>/" at build time (see .github/workflows).
const base = process.env.GITHUB_PAGES_BASE ?? '/'

export default defineConfig({
  base,
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/vitest.setup.ts',
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
})
