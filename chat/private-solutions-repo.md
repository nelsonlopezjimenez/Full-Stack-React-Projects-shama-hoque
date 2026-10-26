# Keeping solutions in a private repo, in sync with the public exercises

**Date:** 2026-10-26
**Status:** trying Option B first (private clone inside the public repo + pre-commit hook). Option A (private repo with the public repos as submodules) to test later.

## The situation

`Chapter12/solutions/` holds exercise solutions, quiz answers and the exam bank. `Chapter12/.gitignore` keeps it out of the public repo, but the files are copied by hand, so they have no history, no backup and no way to sync between machines. The goal is one **private** repo for the solutions of several public repos, without the solutions drifting away from the exercises.

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
    │   ├── ch12-01-strings/
    │   └── ch03-server/
    └── other-course/
```

```bash
git submodule add https://github.com/<you>/Full-Stack-React-Projects repos/fullstack-react
git submodule update --remote repos/fullstack-react   # bump to the latest exercises
```

- **Version pin:** each submodule is pinned to a commit, so the private repo records which exercise version the solutions were written against. You bump the pin on purpose and see right away if a solution no longer fits.
- **Testable:** solution tests reach the exercises by relative path (`repos/fullstack-react/Chapter12/...`). A CI job in the private repo can run every solution against the pinned exercises.
- **No leak path:** the public repos never contain or reference the private one.
- **Cost:** submodule housekeeping — bump, then commit the bump.

## Option B — private clone inside the public repo's ignored folder (trying now)

`Chapter12/solutions/` is already ignored. Make it a clone of the private repo instead of a hand-copied folder.

### 1. Create the private repo and move the current files into it

```bash
# from the public repo root
mv Chapter12/solutions Chapter12/solutions.bak
gh repo create solutions-private --private
git clone https://github.com/<you>/solutions-private Chapter12/solutions
cp -r Chapter12/solutions.bak/. Chapter12/solutions/
cd Chapter12/solutions
git add -A && git commit -m "Import Chapter12 solutions" && git push
cd ../..
# check the clone, then remove the backup
rm -rf Chapter12/solutions.bak
```

The public repo still sees nothing:

```bash
git status                                   # no Chapter12/solutions entry
git check-ignore -v Chapter12/solutions      # prints the Chapter12/.gitignore rule
```

From now on, sync with `git pull` / `git push` **inside** `Chapter12/solutions/`.

### 2. Several public repos, one private repo

Give the private repo one top-level folder per public repo, and in each public repo check out only its own folder:

```bash
git clone --no-checkout https://github.com/<you>/solutions-private Chapter12/solutions
cd Chapter12/solutions
git sparse-checkout set fullstack-react
git checkout main
```

### 3. Pre-commit hook in the public repo (the leak guard)

The `.gitignore` rule alone can be defeated by `git add -f`, or by a later `.gitignore` edit that stops ignoring the folder. If the nested folder is ever added, Git records it as a *gitlink* (an embedded-repo pointer), which still leaks its name and the private repo's commit id. The hook refuses both cases.

Save as `.git/hooks/pre-commit` in the **public** repo (no extension). Git for Windows runs it with its own `sh`, so the same file works on every OS:

```sh
#!/bin/sh
# Refuse commits that stage anything under a solutions/ folder
# (files, or the nested private repo itself as a gitlink).
bad=$(git diff --cached --name-only --diff-filter=ACMR | grep -E '(^|/)solutions(/|$)')
if [ -n "$bad" ]; then
  echo "pre-commit: refusing to commit private solutions:" >&2
  echo "$bad" | sed 's/^/  /' >&2
  echo "Unstage with: git restore --staged <path>" >&2
  exit 1
fi
```

On macOS/Linux also run `chmod +x .git/hooks/pre-commit`.

`.git/hooks/` is not versioned, so the hook stays on this machine and students never see it. Reinstall it on every machine where you clone the public repo with the private folder inside.

### 4. Test the hook

```bash
# should be refused
git add -f Chapter12/solutions/README.md      # any file inside the private clone
git commit -m "test: should be refused"
git restore --staged Chapter12/solutions/README.md

# a normal commit should still go through
git commit --allow-empty -m "test: hook allows normal commits"
git reset --soft HEAD~1                        # drop the test commit
```

Note: `git commit --no-verify` skips the hook, so never use it in this repo.

## Notes

- **Gitea bridge:** the private repo lives on GitHub only. Students never need it, so it does not go through the bridge.
- **Answer gists** (see `gist-exercise-answers-and-git-auth.md`) stay as they are. They are separate from the solutions repo.
- **Choosing:** Option B is the more convenient for editing next to the exercises. Option A is the better source of truth (one place, version pins, CI). They can be combined: A as the source of truth, plus a B-style clone wherever you work.
