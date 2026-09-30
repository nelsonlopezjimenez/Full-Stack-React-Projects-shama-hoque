# Chapter 03 (and 04) — mern-skeleton migration log

**Checklist:** [ch03-migration-checklist.md](ch03-migration-checklist.md)
**Branch:** `refactor/ch03-migration`

The newest entry goes at the bottom. There is one entry for each commit; a commit can cover a small group of checklist steps.

## Entry template

```
### <date> — <step IDs> <short title>
- **Changed:** files and what changed in them
- **Why:** one line
- **Verified:** how the step was checked (command, curl, test), and the result
- **Notes / surprises:** anything unexpected; follow-up steps that were added to the checklist
- **Commit:** <subject line> (look it up with `git log --oneline refactor/ch03-migration`)
```

---

<!-- entries start here -->

### 2026-09-30 — 0.1–0.3 Preparation
- **Changed:** created the branch `refactor/ch03-migration` from `main` (a28fe85). Filled in the Decision column of the checklist; added the new steps 3.8, 3.9, 6.9, 7.10–7.12 and 9.4; updated the target versions to the latest releases (Mongoose 9, React Router 8, MUI 9, Vitest 5 — newer than the Ch05 versions).
- **Why:** agree on the plan before touching code.
- **Verified:** baseline — `package.json` requires `node 8.11.1`, Babel 6 and webpack 4, and `material-ui@1.0.0-beta` has peer dependencies on React 16. `npm install` cannot produce a working build on Node 24.13 (the machine's Node), so there is no runnable "before" state. The behaviour to keep is the one described in the book: signup, signin, list users, view/edit/delete own profile, signout.
- **Notes / surprises:** MongoDB is already running locally on `localhost:27017` and is used as it is (no Docker, step 9.2 = later).
- **Commit:** `docs(ch03): migration checklist decisions and log baseline`
