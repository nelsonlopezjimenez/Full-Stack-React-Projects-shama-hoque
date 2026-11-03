# Student forks: `main` diverged after a VS Code sync, and how to force it back

**Date:** 2026-11-03
**Related:** [git-config-and-push.md](git-config-and-push.md) (tracking branches, push syntax),
[gitea-force-sync-from-github.md](gitea-force-sync-from-github.md) (making Gitea match GitHub),
[gitea-sync-via-bridge.md](gitea-sync-via-bridge.md) (everyday GitHub → Gitea sync),
student guide: [../instructions/updating-main.md](../instructions/updating-main.md)

---

## The situation

- Students forked the course repository on Gitea (`http://192.168.1.28:3000/s888888/...`).
  In their clones, `origin` = their fork and `upstream` = the course repository on Gitea.
  The course repository on Gitea is kept identical to GitHub from the bridge machine.
- Students work on their own branches and don't commit on `main`.
- Still, at some point a sync of `main` produced a **merge commit**, and their `main` no longer matches
  `upstream/main`.

## Why it happens: how VS Code syncs

- **Sync Changes** = `git pull` + `git push`, against the branch's **tracking branch** only. For `main`
  in a fork clone, that's `origin/main` (the student's fork), not `upstream`. The ↓↑ counters in the
  status bar compare against that same tracking branch.
- `git pull` merges by default (unless `pull.rebase`/`pull.ff` is set, or VS Code's
  `git.rebaseWhenSync` is on). If local and remote `main` each have commits the other doesn't, it creates
  a merge commit silently, and the push then publishes it to the fork.
- `git.autofetch` only fetches; it never moves branches. With `"git.autofetch": "all"` it fetches
  `upstream` too.
- **Git: Pull from... → upstream → main** fetches from the right place but still merges.
- Gitea's **Sync fork** button updates the fork on the server only. The next VS Code Sync merges that with
  the local `main`, which is another way to get a merge commit.

Typical triggers:
1. History on the course repository was rewritten (force push, rebase). Students' old `main` and the new
   `upstream/main` no longer share the latest commits, so any pull merges the two histories.
2. Mixing the Gitea Sync fork button with VS Code Sync while local `main` had a commit.
3. Gitea mirror lag on its own is harmless. It only matters together with 1 or 2.

## The fix (run in each student's clone)

The idea: don't merge, **reset**. Nothing on the student's `main` needs keeping.

```bash
git status                                   # clean; commit/stash on the work branch first
git remote -v                                # origin = fork, upstream = course repo
git fetch upstream --prune
git fetch origin --prune
git switch main
git branch backup/main-before-sync           # safety net
git reset --hard upstream/main
git push origin main --force-with-lease
git log --oneline upstream/main..main        # both print nothing
git log --oneline main..upstream/main
git config pull.ff only                      # future merge-pulls fail instead of merging
```

Work branches created from `upstream/teach/...` (the documented workflow) are unaffected. A branch created
from the student's own diverged `main`: back it up, then `git merge main` (no force push) or
`git rebase main` + `git push --force-with-lease` (rebase skips commits already in `main` and flattens
merges).

## Policy from now on

- Students update `main` **only on the command line**:
  `git switch main && git fetch upstream && git merge --ff-only upstream/main && git push origin main`.
- No VS Code Sync/Pull, and no Gitea Sync fork, on `main`. Sync is fine on their own `my/...` branches.
- `git config pull.ff only` in every clone.
- When course history *must* be rewritten, announce it and point students to section 3 of
  [updating-main.md](../instructions/updating-main.md).
