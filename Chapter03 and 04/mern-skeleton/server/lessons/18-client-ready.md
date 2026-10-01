# Stage 18 — Ready for a browser client: CORS and serving the built app

**Branch:** `teach/ch03-server-18-client-ready`

## Goal

Prepare the server for the React client (the client series), in the two ways a client can be deployed:

1. **Separately** (another port in development, or a CDN): the browser needs **CORS** permission.
2. **Together**: Express also sends the built React files, and there is one process and one origin.

Both are **off by default**. Nothing changes until you set `CORS_ORIGIN` or `CLIENT_DIST`.

## New ideas

- **Origin** = scheme + host + port. `http://localhost:5173` and `http://localhost:3000` are
  *different* origins.
- **Same-origin policy.** A page may only read answers from its own origin unless the server says
  otherwise. **CORS** headers (`Access-Control-Allow-Origin`, `…-Allow-Credentials`) are that
  "otherwise". CORS is a browser rule: `api.http`, curl and mobile apps ignore it.
- **Allow-list, again.** `CORS_ORIGIN=http://localhost:4173,https://app.example.com`. Allowing
  every origin (`*`) is not even possible together with cookies (`credentials: true`).
- **`express.static(folder)`** sends files (index.html, JS, CSS, images) from a folder.
- **SPA fallback.** `/users/123` is a React Router page, not a file. Every GET that is not a file and
  not `/api` gets `index.html`, and React Router shows the right page. Express 5 writes the catch-all
  as `'/{*splat}'`.
- **`import.meta.dirname`** is the folder of the current file in an ES module (`__dirname` is CommonJS
  only).

## Try it

1. **CORS:** set `CORS_ORIGIN=http://localhost:4173` in `.env` and restart. Request 33 (with an
   `Origin` header) shows `Access-Control-Allow-Origin: http://localhost:4173` and
   `Access-Control-Allow-Credentials: true`. Request 34 (another origin) gets no CORS header, so a
   browser would block the answer. Remove the line afterwards.
2. **Serving a client:** make a folder `demo-dist` next to `server` with an `index.html` saying
   "Hello from the client", set `CLIENT_DIST=../demo-dist`, restart, and open
   http://localhost:3000/ and http://localhost:3000/users/123: both show the page.
   http://localhost:3000/api/nope is still a JSON 404. Remove the line and the folder afterwards.

## Exercise

Why does the SPA fallback skip URLs with a file extension (`path.extname`)? What would the browser get
for a missing `/assets/app.js` without that check, and why would that be confusing?
