# Keeping your `main` up to date: on the command line, not with the Sync button

Your fork's `main` should always be an **exact copy** of the course repository's `main`. You never commit
on it (your work lives on `my/...` branches), so updating it should never need a merge.

**Update `main` only from the terminal**, with the commands below. **Don't** use VS Code's
**Sync Changes** button, **Pull**, or Gitea's **Sync fork** button for `main`. Those buttons merge
whenever the two histories differ even a little. The result is a `main` that no longer matches the
course repository, and it gets worse with every update.

---

## 1. The routine update (every time the instructor announces changes)

From any branch, with no unsaved edits (commit them on your `my/...` branch first):

```bash
git switch main
git fetch upstream
git merge --ff-only upstream/main
git push origin main
git switch -            # back to the branch you were on
```

- `git fetch upstream` downloads the course repository's latest state. It never changes your files.
- `git merge --ff-only` moves your `main` forward to `upstream/main`, **only if** that needs no merge commit.
  If it can't, it stops with `fatal: Not possible to fast-forward, aborting.` and changes nothing.
  That error means your `main` has diverged. Go to section 3.
- `git push origin main` updates `main` on your fork in Gitea.

### Make Git refuse merge-pulls (once per clone)

```bash
git config pull.ff only
```

After this, a pull that would create a merge commit fails with an error instead. That includes a pull
started from VS Code's Sync button. An error is good here: it stops the problem before it happens.

---

## 2. Why not the Sync button?

What VS Code does when you click **Sync Changes** (the ↻ ↓↑ button in the status bar):

1. It works only with the branch's **tracking branch**. For `main` in your clone, that's `origin/main`:
   **your fork**, not the course repository. The ↓ and ↑ numbers compare your `main` with your fork's
   `main`. They never show the instructor's new commits.
2. It runs `git pull` (fetch + **merge**) and then `git push`.
3. If your local `main` and the remote `main` each have a commit the other doesn't, `git pull` silently
   creates a **merge commit**. Then the push sends that merge commit to your fork. Now your `main`
   differs from the course repository's `main` for good.

What Gitea's **Sync fork** button does: it updates your fork in the browser, but your computer doesn't
know about it. The next VS Code Sync merges the browser's version with your local version, which is
another merge commit.

**Command Palette → Git: Pull from... → upstream → main** pulls from the right place, but it still
merges. Use it only after `git config pull.ff only`, or just use the commands in section 1.

**Why the histories can differ.** Sometimes the instructor has to rewrite history on the course
repository (for example, to fix a stage or remove a file that shouldn't be there). The old commits on your
`main` and the new ones on `upstream/main` then look like two different stories. A merge glues them
together; a reset (section 3) simply takes the new story.

---

## 3. Repair: make your `main` exactly match the course repository

Use this when `git merge --ff-only` fails, when Git says `divergent branches`, or when your instructor
asks you to. It throws away whatever is on your `main` and replaces it with the course repository's
`main`. That's safe because your work is on `my/...` branches, and the backup in step 3 keeps the old
`main` in case you need it.

```bash
# 1. No unsaved edits (commit them on your my/... branch, or: git stash)
git status

# 2. origin = your fork, upstream = http://192.168.1.28:3000/s888888/...
git remote -v
git fetch upstream --prune
git fetch origin --prune

# 3. Go to main and keep a backup of it
git switch main
git branch backup/main-before-sync

# 4. Make main identical to the course repository's main
git reset --hard upstream/main

# 5. Overwrite main on your fork
git push origin main --force-with-lease

# 6. Check: both commands must print nothing
git log --oneline upstream/main..main
git log --oneline main..upstream/main

# 7. Prevent it from happening again
git config pull.ff only
```

`--force-with-lease` is a careful force push. It overwrites your fork's `main`, but it refuses if your
fork changed since your last `git fetch origin`, so nothing gets lost by surprise.

Once everything works, you may delete the backup: `git branch -D backup/main-before-sync`.

---

## 4. Your `my/...` branches after a repair

Branches created from `upstream/teach/...`, as [Working with the lesson stages](working-with-the-lesson-stages.md)
describes, are **not affected**. Leave them alone.

Only a branch that you created from your **own `main`** may still contain the old merge. To move it onto
the repaired `main`:

```bash
git switch my/some-branch
git branch backup/my-some-branch      # safety net
git merge main                        # easiest: a normal merge, no force push needed
git push
```

Or, if you're comfortable with rebasing (cleaner history, but needs a force push):

```bash
git rebase main                       # fix conflicts, git add <file>, git rebase --continue
git push --force-with-lease
```

If anything goes wrong: `git reset --hard backup/my-some-branch` restores the branch, and you can ask
your instructor.

---

## 5. Summary

| Do | Don't |
|---|---|
| `git fetch upstream` + `git merge --ff-only upstream/main` on `main` | click **Sync Changes** or **Pull** in VS Code on `main` |
| `git push origin main` after updating | press **Sync fork** in Gitea and then Sync in VS Code |
| `git config pull.ff only` once per clone | commit on `main` |
| reset `main` to `upstream/main` when it has diverged | "fix" a diverged `main` with another merge |

The VS Code buttons are fine **on your own `my/...` branches**. There you are the only one who commits,
so Sync just pushes your work to your fork.
