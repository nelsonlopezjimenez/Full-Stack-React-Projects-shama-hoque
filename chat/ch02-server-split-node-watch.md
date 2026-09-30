# Chapter 02 — Splitting the server from the client, and `node --watch` vs nodemon

**Date:** 2026-09-29
**Project:** `Chapter02/mern-simplesetup`
**Status:** server step done. **Update:** the server template was later deleted and the client became a standalone Vite app with its own `index.html`; see [ch02-server-template-vs-vite.md](ch02-server-template-vs-vite.md). The template sections below describe the intermediate state.

---

## The request

> Chapter02: refactor so the client and the server are independent from each other. Use the most current versions of packages: express, react etc. Keep the template to be served by the server (express) for now. On the client side use the modern approach to installation (Vite). Start with the server (Express). Refactor the code to use watch, explain the difference between watch and nodemon.

## Starting point (original book code)

One `package.json` at the root held everything:

- **Server:** Express 4, mongodb 3 (callback API), written with ES module syntax, so it had to be compiled by **Babel 6 + webpack 4** into `dist/server.generated.js` before it could run.
- **Dev loop:** `nodemon.json` watched `./server` and ran `webpack … && node ./dist/server.generated.js` on every change.
- **Client:** React 16 + `react-hot-loader`, bundled by webpack. In development, `server/devBundle.js` attached `webpack-dev-middleware` and `webpack-hot-middleware` to Express, so **the server imported the client's webpack config**. The two were tightly coupled.
- `template.js` (root) returned the HTML shell that loads `/dist/bundle.js`.

Latest versions found (`npm view`, 2026-09-29):

| Package | Version |
|---|---|
| express | 5.2.1 |
| mongodb | 7.7.0 |
| react / react-dom | 19.3.0 |
| vite | 8.3.1 |
| @vitejs/plugin-react | 6.1.1 |
| nodemon | 3.1.14 |

Local toolchain: Node v24.13.1, npm 11.13.0.

---

## What was done (server step)

### New layout

```
Chapter02/mern-simplesetup/
├── server/                 ← independent project
│   ├── package.json
│   ├── server.js
│   ├── template.js         ← moved here from the root
│   ├── .env.example
│   └── .gitignore          (node_modules/, .env)
└── client/                 ← next step: its own Vite project
```

Removed: `server/devBundle.js` (webpack middleware) and the root `template.js`.
Left for the client step: the root `package.json`, `package-lock.json`, `.babelrc`, `nodemon.json`, `webpack.config.*.js`, and the old `client/` files.

### `server/package.json`

```json
{
  "name": "mern-simplesetup-server",
  "version": "2.0.0",
  "private": true,
  "type": "module",
  "main": "server.js",
  "scripts": {
    "dev": "node --watch --env-file-if-exists=.env server.js",
    "start": "node --env-file-if-exists=.env server.js"
  },
  "engines": { "node": ">=22.9.0" },
  "dependencies": {
    "express": "^5.2.1",
    "mongodb": "^7.7.0"
  }
}
```

- `"type": "module"` lets Node run `import`/`export` directly, so Babel and webpack are no longer needed on the server.
- `--env-file-if-exists` (Node 22.9+) loads `.env` if it exists; it replaces the `dotenv` package.
- nodemon is gone; `node --watch` does the restarting.

### `server/server.js`

```js
import path from 'node:path'
import express from 'express'
import { MongoClient } from 'mongodb'
import template from './template.js'

const isDev = process.env.NODE_ENV !== 'production'
const port = process.env.PORT || 3000
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/mernSimpleSetup'
const viteUrl = process.env.VITE_DEV_SERVER || 'http://localhost:5173'
// The client is a separate project; the server only needs to know where its build output lives.
const clientDist = path.resolve(import.meta.dirname, process.env.CLIENT_DIST || '../client/dist')

const app = express()

app.use('/dist', express.static(clientDist))

app.get('/', (req, res) => {
  res.status(200).send(template({ isDev, viteUrl }))
})

app.listen(port, (err) => {
  if (err) {
    console.error(err)
    return
  }
  console.info('Server started on port %s (%s).', port, isDev ? 'development' : 'production')
})

// Database connection check
const client = new MongoClient(mongoUri, { serverSelectionTimeoutMS: 5000 })
try {
  await client.connect()
  console.info('Connected successfully to mongodb server')
} catch (err) {
  console.error('MongoDB connection failed: %s', err.message)
} finally {
  await client.close()
}
```

What changed compared with the original:

| Original | Now | Why |
|---|---|---|
| `import template from './../template'` | `import template from './template.js'` | Native ES modules need the file extension; the template now lives inside the server project |
| `import devBundle …; devBundle.compile(app)` | removed | The server no longer builds the client. Vite runs on its own |
| `process.cwd()` for paths | `import.meta.dirname` | Paths no longer depend on which folder you start the server from |
| `MongoClient.connect(url, (err, db) => …)` | `await client.connect()` in `try/catch/finally` | Callbacks were removed in mongodb v4+. The old code also ignored `err` and would crash on `db.close()` when Mongo was down |
| no timeout | `serverSelectionTimeoutMS: 5000` | Fails after 5 s instead of the default 30 s when Mongo is unreachable |

### `server/template.js`

Express still serves the HTML shell. The page is different in development and production:

```js
export default ({ isDev = false, viteUrl = 'http://localhost:5173' } = {}) => {
  const scripts = isDev
    ? `<script type="module">
          import RefreshRuntime from '${viteUrl}/@react-refresh'
          RefreshRuntime.injectIntoGlobalHook(window)
          window.$RefreshReg$ = () => {}
          window.$RefreshSig$ = () => (type) => type
          window.__vite_plugin_react_preamble_installed__ = true
        </script>
        <script type="module" src="${viteUrl}/@vite/client"></script>
        <script type="module" src="${viteUrl}/main.jsx"></script>`
    : `<script type="module" src="/dist/bundle.js"></script>`

  return `<!doctype html> … <div id="root"></div> ${scripts} …`
}
```

- **Development:** the page loads the app from the Vite dev server. This is Vite's standard way to work alongside a backend. The first script sets up React Fast Refresh, which replaces `react-hot-loader`.
- **Production:** it loads `/dist/bundle.js` from the client's build folder. The client's Vite build must therefore name its output file `bundle.js` (to be set in the client step).

### `server/.env.example`

```
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/mernSimpleSetup
VITE_DEV_SERVER=http://localhost:5173
CLIENT_DIST=../client/dist
```

### Verification

- `npm install` in `server/`: 0 vulnerabilities.
- `PORT=3099 npm run dev`: `GET /` returned the HTML shell.
- Editing `template.js` (which `server.js` imports) made `node --watch` log `Restarting 'server.js'` and start the server again.
- MongoDB: the environment has `MONGODB_URI` pointing at a host named `mongodb` (a Docker name), which this machine can't find. The check logged `MongoDB connection failed: getaddrinfo ENOTFOUND mongodb` and the server kept running.
- A known harmless message: with no `.env`, `.env not found. Continuing without it.` appears twice, once from the watcher and once from the server.

---

## `node --watch` vs nodemon

| | `node --watch` | nodemon |
|---|---|---|
| **Install** | Built into Node (stable since v22) | Extra npm package |
| **What it watches** | By default, the entry file and every file it imports. Add `--watch-path=<dir>` to watch folders instead | Folders and file extensions you configure (`watch`, `ext`, `ignore` in `nodemon.json`) |
| **What it restarts** | Only that Node script | Any command. The old `nodemon.json` ran `webpack … && node dist/server.generated.js` |
| **Delay, manual restart, events** | Not available | `delay`, typing `rs` to restart, event hooks |
| **Windows / Docker volumes** | Uses the operating system's file-change notifications | Can fall back to checking files on a timer (`legacyWatch`), which helps on some mounted volumes |

**In short:** nodemon was needed in the original book because the server had to be rebuilt by webpack before every run. Now the server runs its source files directly, so Node's built-in watcher is enough and is one less dependency.

**When nodemon is still worth it:**

- You need to restart something that isn't a Node script.
- You need to watch files your code never imports, such as `.json` or `.env`.
- You're working on a Docker volume where file-change notifications don't arrive. In that case, either add `--watch-path=.` to `node --watch`, or use nodemon with `legacyWatch`.

---

## Next step: the client

- Create a separate Vite + React 19 project in `client/` with its own `package.json` (Vite 8.3.1, `@vitejs/plugin-react` 6.1.1). Its entry file must be `main.jsx` at the Vite root, because the development template loads `${viteUrl}/main.jsx`.
- Rewrite `HelloWorld` as a function component, drop `react-hot-loader` (Fast Refresh replaces it), and use `createRoot` from `react-dom/client`.
- Configure the build to output `client/dist/bundle.js`, which the production template expects.
- Delete the root `package.json`, `package-lock.json`, `.babelrc`, `nodemon.json` and `webpack.config.*.js`.
- Update the README with how to run the server and client separately.
