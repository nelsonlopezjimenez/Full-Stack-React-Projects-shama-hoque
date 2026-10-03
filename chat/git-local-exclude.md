# Ignoring leftover files locally with `.git/info/exclude`

**Date:** 2026-10-03

## The situation

After switching from `refactor/ch03-migration` back to `main`, `git status` showed:

```
?? Chapter03 and 04/mern-skeleton/client/dist/
```

`dist/` is the Vite build output, created while working on the migration branch, where `client/.gitignore` ignores it. **Untracked files stay in the working folder when you switch branches.** `main` has no `.gitignore` that covers `dist/`, so Git listed it as new.

(The old `client/node_modules/` is in the same situation, but the repo-root `.gitignore` already ignores `node_modules/`.)

## Why not add a `.gitignore` on `main`

| Branch | `.gitignore` files under `mern-skeleton/` |
|---|---|
| `main` | none |
| `teach/ch03-server-01` … `19` | `mern-skeleton/.gitignore` + `server/.gitignore` |
| `refactor/ch03-migration` | `client/.gitignore` + `server/.gitignore` |

If `main` added its own `mern-skeleton/.gitignore` (or `client/.gitignore`), merging a ladder branch or a future client-ladder branch into `main` would hit an **add/add conflict**: both sides created the same file with different contents. Committing an ignore file on `main` only to hide one local folder is not worth that risk.

## What was done

One line was added to `.git/info/exclude`:

```
Chapter03 and 04/mern-skeleton/client/dist/
```

`.git/info/exclude` uses the same syntax as `.gitignore`, but:

- it lives inside `.git/`, so it is **never committed or pushed**;
- it applies to **this clone only**, on every branch;
- **no branch changes**, so the ladder and the migration branch are not affected.

Check it with:

```bash
git check-ignore -v "Chapter03 and 04/mern-skeleton/client/dist/index.html"
# → .git/info/exclude:10:Chapter03 and 04/mern-skeleton/client/dist/  …
```

## Which ignore file to use

| File | Shared through git? | Use it for |
|---|---|---|
| `.gitignore` (committed) | yes, for everyone on that branch | files the *project* always produces (`node_modules/`, `dist/`, `.env`) |
| `.git/info/exclude` | no, this clone only | leftovers specific to one machine or one workflow, like this one |
| `core.excludesFile` (e.g. `~/.gitignore_global`) | no, every repo on this machine | editor/OS files (`.vscode/`, `Thumbs.db`, `.DS_Store`) |

## Notes

- On another computer (or a student's clone) the rule does not exist. There `dist/` simply shows up as untracked; delete it, or add the same line.
- `client/dist/` can be deleted at any time: `npm run build` in `client/` recreates it.
- When the ladder or migration work is merged into `main`, the committed `.gitignore` files cover `dist/`, and this line can be removed.
