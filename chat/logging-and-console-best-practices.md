# console.log for debugging: keeping it out of production

**Date:** 2026-10-03
**Context:** debugging the Chapter 3 ladder (e.g. `console.log('req.auth =', req.auth)` in stage 10) with `console.log` instead of the VS Code debugger.
**Related:** [ch03-auth-where-is-the-session-stored.md](ch03-auth-where-is-the-session-stored.md) §9 (where `req.auth` is visible)

There are two kinds of `console.log`, and each has its own rule.

---

## 1. Temporary debugging logs: delete them, don't comment them out

Logs like `console.log('req.auth =', req.auth)` are scaffolding. They should **never reach a commit**. Commented-out logs pile up, go stale and clutter the diffs students read.

Safety nets:

| Safety net | How |
|---|---|
| Look before committing | `git diff`, or `git add -p` (shows each change and asks yes/no) |
| Search | `git grep -n "console.log"` before committing |
| Linter | ESLint rule `"no-console": "warn"`: VS Code underlines every `console.log` |
| Automatic check (team or class) | a pre-commit hook (husky + lint-staged) that runs ESLint and refuses the commit |

Tip: give temporary logs a searchable marker, e.g. `console.log('DBG req.auth', req.auth)`, then `git grep DBG` to find them all.

## 2. Logs worth keeping: a logger with levels, switched by environment

Some output is useful in development and should stay in the code ("JWT issued for …", one line per request). Send it through something that turns off in production instead of using bare `console.log`.

Ladder stage 17 (logging), `helpers/logger.js`:

```js
const isDev = config.env === 'development'

const logger = {
  info:  (...args) => console.info(...args),                // always
  error: (...args) => console.error(...args),               // always
  debug: (...args) => { if (isDev) console.debug(...args) } // development only
}
```

`logger.debug(...)` can stay in the code: with `NODE_ENV=production` it prints nothing.

Other options, from simplest to most professional:

| Option | Switch on with |
|---|---|
| Node's built-in `util.debuglog('app')` | `NODE_DEBUG=app` |
| the `debug` package (`createDebug('app:auth')`) | `DEBUG=app:*` |
| **pino** or **winston** (structured JSON logs) | `LOG_LEVEL=debug` / `info` / `warn` |

In production keep **errors and important events** (server started, DB connection failed), not debug output.

## 3. In the React client (Vite)

- Wrap dev-only logs in `if (import.meta.env.DEV) { … }`. Vite sets this to `false` in the production build, and the minifier removes the whole block.
- Or let the build strip every `console.*` call. In Vite 8 this is a minifier option, found in Vite 8.3's types but **not yet tried** in this project:

  ```js
  // vite.config.js
  build: { rolldownOptions: { output: { minify: { compress: { dropConsole: true } } } } }
  ```

  This also removes `console.error`, which you may want to keep for real errors, so the `DEV` guard is the more precise tool.

## 4. Never log secrets, even in development

Passwords, the full `req.body` of a sign-in, tokens and cookies end up in terminal history, log files and screenshots. Stage 17 logs the JWT only at `debug` level (development only), on purpose, for teaching.

## Practical habit

1. Debug with `console.log` freely.
2. Remove those lines before `git add` (check with `git diff` / `git grep`).
3. Promote the few worth keeping to `logger.debug`.
4. Later: a breakpoint in the VS Code debugger (JavaScript Debug Terminal → `npm run dev`) replaces most temporary logs and leaves nothing to clean up.
