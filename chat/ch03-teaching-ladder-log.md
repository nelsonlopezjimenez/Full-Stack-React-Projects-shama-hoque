# Chapter 03 teaching ladder (server) — log

Plan: [ch03-teaching-ladder-checklist.md](ch03-teaching-ladder-checklist.md)

How each stage was checked: the stage was copied (without `node_modules` and `.env`) into a scratch folder that
shares one `node_modules`, started on port **3210** with its own database **`mernskeleton_ladder`**
(so the real `mernskeleton` data and the servers on 3000/3100 were not touched), and a small `fetch`
script sent the stage's requests and compared status codes and bodies.

---

## Stage 01 — hello (`teach/ch03-server-01-hello`)

- **Changed:** first commit removes the book's code (keeps `LICENSE.md`, adds a ladder README).
  Second commit: `server/` with `package.json` (express only), `.gitignore`, `server.js` (`GET /`),
  `api.http`, `README.md`, `lessons/01-hello.md`.
- **Why:** start from nothing, so every later file has a reason to appear.
- **Verified:** `GET /` → 200 with the text; `GET /abc` → 404 "Cannot GET /abc".
- **Surprises:** the migration branch left untracked `server/.env`, `server/node_modules`,
  `client/` (dist, node_modules, .env) and a root `node_modules/` in the working folder. They are
  local files, not part of any commit, so they were left alone. Always `git add` specific paths.
- **Lock files:** each stage's `package-lock.json` is built from the final lock
  (`npm install --package-lock-only`), so every stage uses the same versions as the final code.
