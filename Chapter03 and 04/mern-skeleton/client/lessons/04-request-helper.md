# Client stage 04 — One job per file: the API layer

**Branch:** `teach/ch03-client-04-request-helper`

## Goal

Nothing new on the page. The code is reorganised so that the next ten pages stay short, the same reason
the server was split into files in server stage 07.

## The problem

`Users.jsx` and `Signup.jsx` each had their own `fetch` code: the URL, the headers, `JSON.stringify`,
`response.json()`, `response.ok`. Ten more requests are coming (sign in, read, update, delete, …),
and each would copy the same lines. When the server is down, the form also had no answer at all:
`await fetch` threw, and the error only reached the console.

## New ideas

- **A helper for all requests: `core/request.js`.** It sets the headers, turns the body into JSON, reads the
  answer, and **never throws**. Every failure (400, 401, 500, server down, cancelled) comes back as
  `{ error: 'message' }`, so every page checks errors with a single `if (data.error)`.
- **One function per API route: `user/api-user.js`.** `create(user)` and `list(signal)`. Pages call
  functions with names, not URLs. If a URL changes on the server, only this file changes.
- **Folders by feature.** `core/` holds things every page uses, and `user/` holds what belongs to users
  (pages + their API). `auth/` joins them in stage 08. The book uses the same layout.
- **`.env` for the client.** `API_PROXY_TARGET` says where Vite forwards `/api`. It is read by
  `vite.config.js` with `loadEnv`. It is a setting of the development server and is never sent to the browser.
- **Default parameters and destructuring:** `request(path, { method = 'GET', body, signal } = {})`.
- **`??` (nullish coalescing):** `data.error ?? 'Request failed (500)'` uses the right side only when the
  left side is `null` or `undefined`.

## What changed

| File | What |
|---|---|
| `src/core/request.js` | new: the one place that calls `fetch` |
| `src/user/api-user.js` | new: `create`, `list` |
| `src/user/Users.jsx`, `src/user/Signup.jsx` | moved into `user/`; they call `list()` / `create()` |
| `src/App.jsx` | new import paths |
| `vite.config.js` | `loadEnv`, `API_PROXY_TARGET` |
| `.env.example` | new |

See the moves: `git diff --stat -M teach/ch03-client-03-signup-form teach/ch03-client-04-request-helper -- .`

## Try it

1. Everything works as in stage 03. That is the point of a refactor.
2. Stop the Express server and press **Submit**: "Request failed (502)" appears under the form. Vite
   is still running, and its proxy answers **502 Bad Gateway** with an empty body when Express is not
   there. `request()` cannot read JSON from an empty body, so it builds the message from the status.
3. Now also stop Vite (Ctrl+C) and press **Submit** on the page that is still open: there is no answer at
   all, so `fetch` throws and you see "Cannot reach the server". In stage 03 this case only logged an
   error in the console.
4. Copy `.env.example` to `.env`, change the port to 3999 and restart `npm run dev`: the list says
   "Request failed (502)". Change it back.

## Exercise

Open `request.js` and find the line that makes a 400 answer become `{ error, status }`. Why is
`status` useful? (Stage 10 uses it to recognise an expired sign-in: status 401.)
