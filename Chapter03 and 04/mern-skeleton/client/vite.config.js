import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, import.meta.dirname, '')

  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        '/api': env.API_PROXY_TARGET || 'http://localhost:3000'
      }
    },
    preview: {
      port: 4173,
      proxy: {
        '/api': env.API_PROXY_TARGET || 'http://localhost:3000'
      }
    }
  }
})
