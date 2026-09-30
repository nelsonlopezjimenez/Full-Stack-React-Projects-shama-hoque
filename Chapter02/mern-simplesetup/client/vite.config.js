import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// index.html is the HTML shell (no server template).
// dev:   Vite serves the app on 5173 and forwards API calls to Express on 3000.
// build: emits dist/ (index.html + assets/), which Express serves in production.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      '/hello': 'http://localhost:3000',
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
})
