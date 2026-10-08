import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Roboto is MUI's default font. Bundling it (instead of the book's Google Fonts <link>) means
// no request to a third party and it also works offline in a classroom.
import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'
import App from './App.jsx'

// [BEGINNER] createRoot (React 18+) replaces the book's `hydrate(<App/>, ...)`. hydrate was
// for HTML already rendered by the server (SSR); now the page starts empty and React renders it.
//
// [ADVANCED] <StrictMode> only affects development: it renders components twice and runs every
// effect as mount → unmount → mount, to expose effects that forget to clean up (see the
// AbortController in Users.jsx). Nothing of this happens in the production build.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
