# Git: push syntax, upstream tracking, and the settings used on every machine

**Date:** 2026-10-03
**Related:** [vscode-declutter-and-autocomplete.md](vscode-declutter-and-autocomplete.md) (editor settings), [git-local-exclude.md](git-local-exclude.md) (per-clone ignore rules)

---

## 1. Settings to apply on every machine (once)

```bash
git config --global push.autoSetupRemote true   # needs Git 2.37+ (this machine: 2.53)
git config --global push.default simple         # the default since Git 2.0; set it explicitly anyway
```

They are stored in the user's global config (`C:\Users\<user>\.gitconfig` on Windows), not in the repository, so **every machine needs them once**. Check them with:

```bash
git config --global --get push.autoSetupRemote   # → true
git config --global --get push.default           # → simple
```

| Setting | Effect |
|---|---|
| `push.default simple` | a plain `git push` pushes only the **current** branch, to the remote branch **with the same name** (old Git versions pushed every matching branch) |
| `push.autoSetupRemote true` | the first plain `git push` of a new branch creates the remote branch **and** links the local branch to it, so `-u` is never needed |

Applied on this machine on 2026-10-03.

## 2. Upstream ("tracking") is a per-branch setting

A local branch is linked to a remote branch only when one of these happened:

| How the branch was made | Upstream set? |
|---|---|
| `git clone` (the default branch only) | yes |
| `git switch foo` when only `origin/foo` exists | yes |
| `git push -u origin foo` | yes |
| a plain `git push` with `push.autoSetupRemote true` | yes |
| `git switch -c foo`, then `git push origin foo` | **no**, even though `origin/foo` exists |
| a branch renamed locally (e.g. `master` → `main`) | the old link does not carry over |

What you get from the link: `git status` shows **ahead / behind**, and plain `git pull` / `git push` and VS Code's Sync button know where to go. An explicit `git push origin <branch>` works the same with or without it.

State on this machine on 2026-10-03:

- `main` had **no** upstream, probably lost in a `master` → `main` rename (Git still has a `vscode-merge-base` entry for `origin/master`). It was linked with `git branch --set-upstream-to=origin/main main`, and `git status` immediately showed `[ahead 1]` for an unpushed commit.
- Still without upstream: `refactor/separate-client-server` (it exists on GitHub) and `refactor/ch03-simple-auth` (local only).
- All `teach/ch03-server-*` branches and `refactor/ch03-migration` were already linked.

To see the links: `git branch -vv`.
To link an existing branch: `git branch --set-upstream-to=origin/<branch> <branch>`.

## 3. Push syntax: what to use when

`git push origin <branch>` (explicit) is **always correct** and is the safest form for scripts and for pushing a branch you are not on.

| Situation | Command |
|---|---|
| push the current, linked branch | `git push` |
| push a branch you are not on, or in a script | `git push origin <branch>` |
| first push of a new branch (without autoSetupRemote) | `git push -u origin <branch>` |
| push several branches (e.g. ladder stages) | `git push origin <branch1> <branch2> …` |
| after a rebase or `--amend` (history rewritten) | `git push --force-with-lease origin <branch>` |
| delete a remote branch | `git push origin --delete <branch>` |

Avoid:

- **`--force`**: it overwrites the remote even if someone else pushed in the meantime. `--force-with-lease` refuses when the remote moved since your last fetch. This is important when rebasing the stacked `teach/*` branches.
- **`git push --all`**: it publishes every local branch, including experiments.
- **`git push origin :branch`**: the old deletion syntax, easy to type by accident; `--delete` says what it does.

### For students

Teach `git push -u origin <branch>` on the first push and plain `git push` afterwards. It is the most common convention and works without any global settings. Explain `-u` once, as "remember where this branch goes".
