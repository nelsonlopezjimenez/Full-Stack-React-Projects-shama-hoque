# Chapter 02 — Does Express still need the HTML template once the client uses Vite?

**Date:** 2026-09-29
**Project:** `Chapter02/mern-simplesetup/server` (Chapter02 only; the other chapters are unchanged)
**Follows:** [ch02-server-split-node-watch.md](ch02-server-split-node-watch.md)

---

## The question

> Do I still need the template on server express?

## Short answer

**No.** The template was only needed because webpack produced just `bundle.js`, so something had to generate the HTML page that loads it. A Vite project includes its own `index.html`:

- **Development:** Vite serves `client/index.html` at `http://localhost:5173` with hot reload. Express doesn't have to serve the page.
- **Production:** `vite build` writes `client/dist/index.html` next to the bundled JavaScript and CSS, with the file names already filled in. Express can serve that folder as plain static files.

This makes `template.js`, the `isDev`/`viteUrl` logic, the React Fast Refresh setup code and the fixed `bundle.js` file name unnecessary.

---

> ## ⚠️ Server-side rendering (SSR): the one real reason to keep a server template
>
> In **server-side rendering**, Express builds the page's HTML itself for each request. It runs the React components on the server with `renderToString(<App/>)` and puts the result into the template, so the browser receives a finished page instead of an empty `<div id="root">`. The browser's React then attaches to that existing HTML (this is called *hydration*).
>
> A server-generated HTML template is required when:
>
> - **You use SSR.** Later in the book (chapters 3–4) the template receives the output of `renderToString(<App/>)` and the Material UI styles, so that HTML must be built on the server for every request.
> - **You add data to the page per request.** For example, runtime settings or the logged-in user, set when the page is requested rather than when the client is built.
>
> What SSR gets you: the first page shows up faster, search engines can read the content without running JavaScript, and link previews work (Open Graph).
> What it costs: the server needs React and a build step for the server code, the React code must also be able to run on the server (no `window` during render), and the server/client coupling from the original book code comes back.
>
> **Decision for Chapter02:** SSR is not needed now. **The template has been deleted.** React renders in the browser (client-side rendering), and Vite handles the HTML page and the bundle. If SSR is needed later, Vite supports it (`vite build --ssr`, or a framework such as React Router's framework mode), and a template-like HTML page comes back.

---

## What changed in the Chapter02 server

- `server/template.js`: **deleted**.
- `server/server.js`:
  - Removed the `template` import, `isDev` and `viteUrl`.
  - `express.static(clientDist)` is now mounted at `/` instead of `/dist`, because Vite's `index.html` refers to its own `/assets/...` files.
  - Any other GET request returns `index.html`, so pages the React app handles also work when opened by URL or refreshed.
  - If the client hasn't been built yet, the server replies with a 404 and a hint.
- `server/.env.example`: removed `VITE_DEV_SERVER`.

```js
const app = express()

app.get('/hello', (req, res) => {
  res.send("HELLO WORLD!!!")
})

// Built React app (client/dist, produced by `vite build`). The HTML comes from Vite's index.html.
app.use(express.static(clientDist))

// Any other GET returns the React app's index.html. Must stay after the API routes.
// Paths with a file extension (e.g. a missing /assets/x.js) get a real 404 instead of HTML.
app.get('/{*splat}', (req, res, next) => {
  if (path.extname(req.path)) return next()
  res.sendFile(path.join(clientDist, 'index.html'), (err) => {
    if (err && !res.headersSent) {
      res.status(404).send('Client not built. Run `npm run build` in ../client, or use the Vite dev server at http://localhost:5173')
    }
  })
})
```

`/{*splat}` is the Express 5 way to write a catch-all route. The bare `*` from Express 4 now throws an error.

Two safeguards were added during the final review:

- **`path.extname(req.path)` → `next()`:** a request for a missing file such as `/assets/missing.js` gets a real 404. Otherwise it would receive `index.html` with status 200, and the browser would fail with a confusing "wrong file type" error.
- **`!res.headersSent`:** if sending `index.html` fails after the response has already started (e.g. the browser disconnected), the server doesn't try to send a second response, which would throw "headers already sent".

Tested with `PORT=3099 node server.js` (the port was chosen only for the test):

| Request | Result |
|---|---|
| `GET /hello` | `HELLO WORLD!!!` |
| `GET /` (client not built yet) | 404 + "Client not built…" hint |
| `GET /users/1` (client not built yet) | 404 + same hint |
| `GET /assets/index-*.js` (after `vite build`) | 200 `text/javascript` |
| `GET /some/react/route` (after `vite build`) | 200, React app's `index.html` |
| `GET /assets/missing.js` | 404 |
| MongoDB | `Connected successfully to mongodb server` |

---

## Follow-up: which port shows "Hello World" now?

There are two different "Hello World" messages, and each has its own port:

| | Where it comes from | Development | Production |
|---|---|---|---|
| **React page** `<h1>Hello World!</h1>` | `client/HelloWorld` component, rendered in the browser | **http://localhost:5173** (Vite dev server, `npm run dev` in `client/`) | **http://localhost:3000** (Express serves `client/dist` after `npm run build`) |
| **Express route** `HELLO WORLD!!!` | `app.get('/hello')` in `server.js` | **http://localhost:3000/hello** | **http://localhost:3000/hello** |

- **Development runs two processes on two ports.** Port 5173 is Vite and serves the React app. Port 3000 is Express and serves the API. `http://localhost:3000/` shows only the "Client not built" hint until the client is built.
- **Production runs one process on one port (3000).** Express serves both the built React app and `/hello`.
- **For the React app to call Express during development**, add a Vite proxy so that `fetch('/hello')` from the page on 5173 is forwarded to 3000, with no CORS needed:

  ```js
  // client/vite.config.js
  server: { proxy: { '/hello': 'http://localhost:3000' } }
  ```

  Recommended: prefix API routes with `/api` (e.g. `/api/hello`). Then one proxy rule (`'/api': 'http://localhost:3000'`) covers every route, and API routes never overlap with the React app's page addresses.

---

## Follow-up: why `client/vite.config.js` got simpler without the template

> So the vite.config is simpler since there is no template?

**Yes.** Every setting that was removed existed only so Vite's output would fit inside the Express page. Once Vite serves its own `index.html`, Vite's defaults already do the right thing.

| Removed setting | Why the template needed it | Why it's no longer needed |
|---|---|---|
| `base: command === 'build' ? '/dist/' : '/'` | Express served the build under `/dist`, so file links had to start with `/dist/` | Express now serves `client/dist` at `/`, which matches Vite's default `base: '/'` |
| `server.origin: 'http://localhost:5173'` | The page came from port 3000, so file links had to point back to Vite on 5173 | The page comes from Vite itself, so links like `/assets/...` already point to the right place |
| `rollupOptions.input: 'main.jsx'` | There was no `index.html`, so Vite had to be told which file to start from | Vite starts from `index.html` by default and finds `main.jsx` through its `<script>` tag |
| `entryFileNames: 'bundle.js'`, `assetFileNames: '[name][extname]'` | The template contained a fixed `<script src="/dist/bundle.js">`, so the name couldn't change | Vite writes the correct file names into the built `index.html`, so the default names with hashes work |
| `defineConfig(({ command }) => …)` function form | Needed only to pick a different `base` for dev and build | Dev and build use the same settings, so a plain object is enough |

The hashed file names (e.g. `index-Dg-_4mJN.js`) are an improvement. Each build gets new file names, so browsers can cache the files for a long time and still never load an old version after a new deploy.

**What's left and why:**

- `plugins: [react()]`: compiles JSX and enables Fast Refresh.
- `server.port: 5173` and `strictPort: true`: keeps Vite on 5173, which the README and proxy assume. Without `strictPort`, Vite would quietly switch to 5174 if 5173 were busy.
- `server.proxy['/hello']`: forwards API requests to Express during development.
- `build.outDir: 'dist'` and `emptyOutDir: true`: already Vite's defaults. Kept so it's clear where `server.js` (`CLIENT_DIST=../client/dist`) expects the build.

The resulting config:

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

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
```

The only setting the client actually needs beyond the defaults is the proxy.
