/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages serves the site from /<repo-name>/. Override with BASE_PATH if
  // the repo is renamed or a custom domain is used (then BASE_PATH=/).
  base: process.env.BASE_PATH ?? '/eduassai/',
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
})
