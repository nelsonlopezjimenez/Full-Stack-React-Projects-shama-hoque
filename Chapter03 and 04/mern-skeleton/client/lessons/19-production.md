# Client stage 19 — Production: build, preview, deploy

**Branch:** `teach/ch03-client-19-production` (starts from `teach/ch03-client-18-lazy-pages`)

## Goal

Run the app the way it runs for real users, with no Vite dev server. There are two ways to deploy it, and
the server has been ready for both since server stage 18.

## Build it yourself first

Try the goal on your own before you look at this stage's code. Start from the end of stage 18 and copy
this note into your branch (the instructions on `main`, section 5, explain these commands):

```bash
git fetch upstream
git switch --no-track -c my/ch03-client-19-production upstream/teach/ch03-client-18-lazy-pages
git restore --source=upstream/teach/ch03-client-19-production -- ":/Chapter03 and 04/mern-skeleton/client/lessons/19-production.md"
```

**What must be running:** MongoDB and the server. The client runs as a **build** this time
(`npm run build`, then `npm run preview`) instead of `npm run dev`.

**Your task:**

1. A `preview` script in `package.json` and a `preview` block in `vite.config.js` with the same `/api` proxy.
2. In `request.js`: an optional `API_URL` from `import.meta.env.VITE_API_URL` in front of every path, and
   `credentials: 'include'` so cookies also work across origins.
3. `.env.example`: document `VITE_API_URL`, with a warning that it ends up in the bundle.

**Done when:** `npm run preview` serves the build on http://localhost:4173 and everything works there; the
"one process" deploy (server with `CLIENT_DIST`) serves the app on port 3000.

**Compare** with the finished stage (from the `client` folder):
`git diff upstream/teach/ch03-client-19-production -- . ":!package-lock.json"`.
To run the finished stage next to yours, see "Check your result" in lesson 06.

## New ideas

- **`npm run build`** writes plain files into `dist/`: one `index.html` and hashed JS, CSS, images and fonts.
  Any web server can send them. The hash in each file name changes when the content changes, so browsers
  can cache the files for a long time.
- **`npm run preview`** serves `dist/` on port 4173 (with the same `/api` proxy), to check the build before
  deploying it.
- **Deploy 1: one process.** The Express server sends the built files too: `CLIENT_DIST=../client/dist`.
  Page and API share one origin, so cookies and relative URLs work as in development, and no CORS is needed.
  The **SPA fallback** answers `/users/123` with `index.html`, and React Router shows the page.
- **Deploy 2: client on its own origin** (a CDN, another port). The API calls must then use a full URL:
  `VITE_API_URL=https://api.example.com`. The server must allow that origin (`CORS_ORIGIN`), and `fetch` must
  send the cookie across origins: **`credentials: 'include'`**.
- **`import.meta.env.VITE_*`.** Vite copies variables that start with `VITE_` **into the bundle** at build time.
  Anyone can read them in the browser, so they must never hold secrets. `API_PROXY_TARGET` has no `VITE_`
  prefix, so it stays in `vite.config.js`.

## What changed

| File | What |
|---|---|
| `package.json` | script `preview` |
| `vite.config.js` | `preview` block with the same proxy |
| `src/core/request.js` | `API_URL` from `VITE_API_URL`; `credentials: 'include'` |
| `.env.example` | `VITE_API_URL`, with a warning about secrets |
| `README.md` | preview, environment, a "Deploying" table |

## Try it

1. **Preview:** `npm run build`, then `npm run preview`, and open http://localhost:4173. Sign in and click around.
   DevTools → Network: minified files with hashes in their names, and no `.jsx` files.
2. **One process:** stop Vite. In `server/.env` set `CLIENT_DIST=../client/dist` and restart the server. Open
   http://localhost:3000/users: the whole app on port 3000. Reload on a profile URL: it still works (SPA fallback).
   http://localhost:3000/api/nope is still a JSON 404. Remove the line afterwards.
3. **Own origin:** build with `VITE_API_URL=http://localhost:3000 npm run build` (PowerShell:
   `$env:VITE_API_URL='http://localhost:3000'; npm run build`) and run `npm run preview`. The list says "Cannot reach the
   server": the browser blocked the answer (Console: *CORS policy*). Add `CORS_ORIGIN=http://localhost:4173` to
   `server/.env`, restart the server and reload: it works, and signing in works too (`credentials: 'include'`).
   Remove both settings and build again without `VITE_API_URL`.

## Exercise

Search `dist/assets/*.js` for `localhost:3000` after a normal build and after the build of step 3. What does
that tell you about where `VITE_API_URL` ends up?
