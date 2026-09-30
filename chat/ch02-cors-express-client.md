# Chapter 02 — Does the Express server need CORS to talk to the client?

**Date:** 2026-09-29
**Project:** `Chapter02/mern-simplesetup`
**Status:** Q&A only. No code changed.

---

## Question 1

> In an Express server, do I need CORS to interact with the client?

### Answer

It depends on whether the browser treats the client and the API as the **same origin**. An origin is **scheme + host + port**, and CORS only matters when a page on one origin calls an API on a different one.

**In the current Chapter02 setup, Express doesn't need `cors`:**

- The browser loads the page from Express at `http://localhost:3000` (the HTML shell comes from `server/template.js`).
- The only cross-origin requests go the other way: that page loads `/main.jsx` and other scripts from Vite at `:5173`. Vite adds the CORS headers for those itself, since its dev server allows `localhost` origins by default. `client/vite.config.js` sets `server.origin` so those asset URLs point at `:5173`.
- If the React code calls something like `fetch('/api/users')`, the request goes to `:3000`, the same origin as the page, so no CORS is involved.
- In production, Express serves `dist/bundle.js` from `/dist`, so everything is on one origin.

**You would need it if** the setup changes so that:

- Vite serves the page (with an `index.html`, opened at `localhost:5173`) and the client calls `http://localhost:3000/api/...` directly, or
- the client and API are deployed on different domains, e.g. Netlify and Render.

In the first case, a Vite proxy is usually better than CORS because the browser only ever talks to one origin:

```js
// client/vite.config.js
server: {
  proxy: { '/api': 'http://localhost:3000' }
}
```

If you really need cross-origin calls, allow specific origins instead of everything:

```js
import cors from 'cors'
app.use(cors({ origin: 'http://localhost:5173', credentials: true }))
```

`credentials: true` matters later for the JWT cookie auth in Chapter 5. When you allow credentials, you have to name the origin explicitly, because a `*` wildcard won't work.

---

## Question 2

> If the client is the one that renders and requests data from the server (backend), would it need CORS?

### Answer

**Yes, usually, but only because of where the page is served from.** Rendering on the client doesn't trigger CORS by itself. The browser only checks: *is the origin in the address bar the same as the origin of the `fetch` URL?*

In a typical client-rendered SPA (the standard Vite setup, and where Chapter02 is heading):

| | Origin |
|---|---|
| Page (`index.html` + JS) served by Vite | `http://localhost:5173` |
| API served by Express | `http://localhost:3000` |

The ports differ, so they're different origins. A `fetch('http://localhost:3000/api/users')` from the page is cross-origin, and the browser blocks the response unless Express sends `Access-Control-Allow-Origin`. You'd see this in the console:

```
Access to fetch at 'http://localhost:3000/api/users' from origin 'http://localhost:5173'
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present...
```

Note: the request still reaches the server and runs. The browser just refuses to hand the response to your JS. That's why CORS isn't a security layer for the server. It protects users' browsers, and tools like Postman or curl ignore it completely.

### Your options

**1. Dev proxy (recommended for development).** The client calls a relative URL, and Vite forwards it to Express behind the scenes. The browser only sees `:5173`, so no CORS is needed and Express stays unchanged.

```js
// client/vite.config.js
server: {
  proxy: { '/api': 'http://localhost:3000' }
}
```

```js
// client code
const res = await fetch('/api/users')
```

**2. Enable CORS on Express.** Needed when the client really lives on another origin, e.g. in production on separate domains (`app.example.com` → `api.example.com`).

```bash
npm install cors
```

```js
import cors from 'cors'

app.use(cors({
  origin: process.env.CLIENT_ORIGIN, // e.g. http://localhost:5173 or https://app.example.com
  credentials: true,                 // only if you send cookies
}))
```

On the client, cookies only go cross-origin if you ask for it:

```js
fetch(`${API_URL}/api/users`, { credentials: 'include' })
```

**3. Serve the built client from Express (same origin in production).** Run `vite build`, then `express.static('client/dist')`. The page and API share one origin, so there's no CORS in production. Combine this with option 1 in dev and you never need the `cors` package.

### Rule of thumb

| Setup | CORS needed? |
|---|---|
| Express serves the page, client fetches `/api/...` (current Chapter02) | No |
| Vite serves the page, fetches `/api` through the Vite proxy | No |
| Vite serves the page, fetches `http://localhost:3000/...` directly | **Yes** |
| Express serves the built client in production | No |
| Client and API on different domains/ports in production | **Yes** |
