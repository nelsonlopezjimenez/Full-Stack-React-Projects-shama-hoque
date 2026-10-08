import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// [BEGINNER] Vite replaces the book's three webpack configs, Babel, webpack-dev-middleware and
// react-hot-loader. `npm run dev` serves the app with hot reload; `npm run build` writes dist/.
// The React plugin teaches Vite to read JSX (the HTML-like syntax inside .jsx files).
//
// dev: Vite serves the React app on 5173 and forwards /api/* to the Express server, so
//      the browser only ever talks to ONE origin (no CORS needed in development).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Every API route of the server starts with /api, so one proxy rule is enough.
      '/api': 'http://localhost:3000'
    }
  }
})
