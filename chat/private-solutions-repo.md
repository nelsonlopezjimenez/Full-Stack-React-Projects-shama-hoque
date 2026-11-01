# Keeping solutions in a private repo, in sync with the public exercises

**Date:** 2026-10-26, set up 2026-11-01
**Status:** Option B is **set up** (see "What was done"). Option A (private repo with the public repos as submodules) to test later.

## The situation

`Chapter12/solutions/` held exercise solutions, quiz answers and the exam bank. `Chapter12/.gitignore` kept it out of the public repo, but the files were copied by hand, so they had no history, no backup and no way to sync between machines. The goal is one **private** repo for the solutions of several public repos, without the solutions drifting away from the exercises.

## Why not symlinks or junctions

| Link type | Problem |
|---|---|
| Symlink | Windows needs Developer Mode or admin rights to create one. Git for Windows defaults to `core.symlinks=false`, so a committed symlink is checked out as a small text file containing the target path. |
| Junction | Windows only, and Git does not store junctions at all. They exist only on the machine where you made them. |
| Both | A broken link fails silently: the folder looks empty or stale, which is exactly the drift we want to avoid. |

Use Git itself to sync. Both options below are plain clones with remotes, so they work the same on Windows, macOS and Linux.

## Option A — private repo that contains the public repos (later)

```
instructor-private/                ← private repo
├── repos/
│   ├── fullstack-react/           ← submodule → public course repo
│   └── other-course/              ← submodule → another public repo
└── solutions/
    ├── fullstack-react/
    └── other-course/
```

```bash
git submodule add https://github.com/<you>/Full-Stack-React-Projects repos/fullstack-react
git submodule update --remote repos/fullstack-react   # bump to the latest exercises
```

- **Version pin:** each submodule is pinned to a commit, so the private repo records which exercise version the solutions were written against. You bump the pin on purpose and see right away if a solution no longer fits.
- **Testable:** solution tests reach the exercises by relative path. A CI job in the private repo can run every solution against the pinned exercises.
- **No leak path:** the public repos never contain or reference the private one.
- **Cost:** submodule housekeeping — bump, then commit the bump.

## Option B — private clone inside the public repo (set up)

### The private repo

`git@github.com:nelsonlopezjimenez/course-solutions.git` (private). It reuses the old `tictactoe-game` repo, renamed on 2026-11-01; GitHub redirects the old URL. One top-level folder per public repo; inside it, paths **mirror the public repo**:

```text
course-solutions/
├── README.md
├── full-stack-react-projects/        ← this repo
│   ├── Chapter12/                    ← solutions for Chapter12/<topic>/
│   │   ├── README.md
│   │   ├── solutions.env             CH12_SOLUTIONS=1
│   │   ├── 01-strings/  03-arrays-basics/  04-arrays-callbacks/  05-arrays-modern/
│   ├── exam-bank/                    ch00-ttt-midterm, ch03-server-midterm (cross-chapter)
│   └── osn-testing-env/
└── tictactoe-game/                   the 2023 vanilla Tic-Tac-Toe, moved here with its history
```

To add another public repo, add another top-level folder named after it.

### The clone in this repo: `.solutions/` with sparse-checkout

```bash
# from the public repo root
git clone --no-checkout git@github.com:nelsonlopezjimenez/course-solutions.git .solutions
cd .solutions
git sparse-checkout set full-stack-react-projects
git checkout main
```

- **Only this repo's folder on disk.** Sparse-checkout writes only `full-stack-react-projects/` (plus the root files, like `README.md`). Other folders, e.g. `tictactoe-game/`, stay in the repo but not on disk. The full history is still downloaded; add `--filter=blob:none` to the clone to skip other folders' file contents too.
- **Pull and push work on the whole repo** as usual. Commits from this clone only touch the folder you can see.
- `git sparse-checkout add <folder>` shows another folder; `git sparse-checkout disable` shows everything.
- **Sync** with `git pull` / `git push` **inside `.solutions/`**.
- The root `.gitignore` ignores `.solutions/`. Check with `git check-ignore -v .solutions`.

### Public repo changes

| File | Change |
|---|---|
| `.gitignore` | `.solutions/` |
| `Chapter12/_lib/load-exercises.js` | `CH12_SOLUTIONS` loads `../.solutions/full-stack-react-projects/Chapter12/<topic>/exercises.js` |
| `Chapter12/package.json` | `test:solutions` reads `../.solutions/full-stack-react-projects/Chapter12/solutions.env` |
| `Chapter12/.gitignore` | keeps `solutions/` as a safety net for an old local copy |

`npm run test:solutions` (from `Chapter12/`): 46/46 pass from the new location.

### Pre-commit hook (the leak guard)

`.gitignore` alone can be defeated by `git add -f` or by a later `.gitignore` edit. If the nested clone is ever added, Git records it as a *gitlink* (an embedded-repo pointer), which still leaks its name and the private repo's commit id. The hook refuses both.

`.git/hooks/pre-commit` in the **public** repo (no extension). Git for Windows runs it with its own `sh`, so the same file works on every OS:

```sh
#!/bin/sh
# Refuse commits that stage anything under .solutions/ or a solutions/ folder
# (files, or the nested private repo itself as a gitlink).
bad=$(git diff --cached --name-only --diff-filter=ACMR | grep -E '(^|/)\.?solutions(/|$)')
if [ -n "$bad" ]; then
  echo "pre-commit: refusing to commit private solutions:" >&2
  echo "$bad" | sed 's/^/  /' >&2
  echo "Unstage with: git restore --staged <path>" >&2
  exit 1
fi
```

On macOS/Linux also run `chmod +x .git/hooks/pre-commit`. `.git/hooks/` is not versioned, so the hook stays on this machine and students never see it. **Reinstall it on every machine** where you clone the private repo into the public one. Note that it blocks a folder named `solutions` anywhere in the public repo.

### Hook tests (2026-11-01)

| Test | Result |
|---|---|
| `git add -f .solutions` (stages the gitlink), commit | **refused** by the hook |
| `git add -f Chapter12/solutions/leak.txt`, commit | **refused** by the hook |
| `git add -f .solutions/README.md` | Git itself refuses: it won't stage files inside a nested repo, only the gitlink |
| Normal commit | goes through |

`git commit --no-verify` skips the hook, so never use it in this repo.

### On another machine

```bash
git clone --no-checkout git@github.com:nelsonlopezjimenez/course-solutions.git .solutions
cd .solutions && git sparse-checkout set full-stack-react-projects && git checkout main
# then install the pre-commit hook above
```

If Windows reports `Filename too long` (deep paths such as a temp folder), run `git config core.longpaths true` in that clone.

## Notes

- **Gitea bridge:** the private repo lives on GitHub only. Students never need it, so it does not go through the bridge.
- **Answer gists** (see `gist-exercise-answers-and-git-auth.md`) stay as they are. They are separate from the solutions repo.
- **Choosing:** Option B is the more convenient for editing next to the exercises. Option A is the better source of truth (one place, version pins, CI). They can be combined: A as the source of truth, plus a B-style clone wherever you work.
