import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// [BEGINNER] Vite replaces the book's three webpack configs, Babel, webpack-dev-middleware and
// react-hot-loader. `npm run dev` serves the app with hot reload; `npm run build` writes dist/.
// The React plugin teaches Vite to read JSX (the HTML-like syntax inside .jsx files).
//
// dev:   Vite serves the React app on 5173 and forwards /api/* to the Express server, so
//        the browser only ever talks to ONE origin (no CORS needed in development).
// build: dist/ can be served by any static host, or by the Express server (CLIENT_DIST).
export default defineConfig(({ mode }) => {
  // [ADVANCED] loadEnv reads .env files for vite.config itself. The '' prefix loads every
  // variable (not only VITE_*), so API_PROXY_TARGET stays out of the browser bundle.
  const env = loadEnv(mode, import.meta.dirname, '')

  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        // Every API route of the server starts with /api, so one proxy rule is enough
        // (the book also needed '/auth').
        '/api': env.API_PROXY_TARGET || 'http://localhost:3000'
      }
    },
    // `npm run preview` serves the built dist/ folder, to check the production build locally.
    preview: {
      port: 4173,
      proxy: {
        '/api': env.API_PROXY_TARGET || 'http://localhost:3000'
      }
    }
  }
})
