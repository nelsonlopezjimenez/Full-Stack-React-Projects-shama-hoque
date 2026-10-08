import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// [BEGINNER] Vite replaces the book's three webpack configs, Babel, webpack-dev-middleware and
// react-hot-loader. `npm run dev` serves the app with hot reload; `npm run build` writes dist/.
// The React plugin teaches Vite to read JSX (the HTML-like syntax inside .jsx files).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173
  }
})
