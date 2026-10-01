# Stage 01 — Hello, Express

**Branch:** `teach/ch03-server-01-hello`

## Goal

A web server that answers one request. It is about 10 lines, and everything later is built on top of it.

## New ideas

- **Node.js** runs JavaScript outside the browser. A server is a program that waits for requests.
- **npm and `package.json`.** `package.json` is the project's ID card: its name, the packages it needs
  (`dependencies`) and short commands (`scripts`). `npm install` downloads the packages into `node_modules/`.
- **`"type": "module"`** lets us write `import express from 'express'`.
- **Express** is a small library that turns "a request arrived" into "call this function".
- **A route** is a method + a path + a handler: `app.get('/', (req, res) => { ... })`.
- **`node --watch`** restarts the server whenever you save a file (`npm run dev`).

## What changed

| File | What |
|---|---|
| `package.json` | name, `"type": "module"`, scripts `dev` / `start`, dependency `express` |
| `.gitignore` | files git must never commit: `node_modules/` (anyone can recreate it with `npm install`) and `.env` (passwords and secrets, used from stage 07 on) |
| `server.js` | the whole server |
| `api.http` | the first request to try |

## Try it

```bash
npm install
npm run dev
```

1. Open http://localhost:3000 in the browser. The browser sends a **GET** request for `/`.
2. Send request 1 in `api.http`. You see the same text, plus the **status code** `200 OK` and the
   **headers** (for example `Content-Type: text/html`).
3. Change the text in `server.js` and save. The terminal shows the restart; send the request again.
4. Open http://localhost:3000/abc. Express answers **404** "Cannot GET /abc": no route matches.

## Exercise

Add a route `GET /about` that answers with your name. Try it in the browser and in `api.http`.
