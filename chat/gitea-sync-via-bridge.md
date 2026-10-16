# Keeping the Gitea repo in sync with GitHub (bridge machine)

Context (2026-10-02): students clone from **Gitea**. Work is pushed to **GitHub**. Gitea cannot pull
from GitHub directly, so a **bridge machine** with two remotes copies everything across:

```
work machine ──push──▶ GitHub ──fetch──▶ bridge machine ──push──▶ Gitea ──clone──▶ students
```

The work machine only knows GitHub (`origin`). Only the bridge knows Gitea.
The commands below assume the bridge's remotes are named `github` and `gitea` (check with `git remote -v`).

**The bridge is never on both networks at once** (updated 2026-10-16). While it can reach GitHub it cannot
reach Gitea, and the other way round. So a sync is always two separate sessions:

```
  Part 1, on the GitHub network            Part 2, later, on the Gitea (classroom) network
  ─────────────────────────────            ──────────────────────────────────────────────
  git fetch --prune github                  git fetch --prune gitea
     saves GitHub's branches on the            git push gitea "refs/remotes/github/…:refs/heads/…"
     bridge as github/main,                    git push gitea --delete …
     github/teach/…  (they stay there          (uses only what Part 1 saved; GitHub is not needed)
     after you disconnect)
```

Never run a `github` command in Part 2 or a `gitea` command in Part 1: it only waits and then fails with
*Could not resolve host* or *Connection timed out*.

## Why `git pull` is not enough

`git pull` only updates the branch that is checked out. `git fetch` downloads every branch, but only as
remote-tracking names (`github/main`, `github/teach/...`), not as local branches. Part 2 pushes those
remote-tracking names straight to Gitea, so the bridge never needs local copies of the stage branches, and
it does not matter which branch the bridge has checked out.

In each refspec, the part before `:` is what the bridge fetched from GitHub (saved in Part 1). The part
after `:` is the branch name on Gitea.

---

## Part 1 — on the GitHub network

```bash
git fetch --prune github
git fetch github --tags
```

- `--prune` also forgets branches that were deleted on GitHub (for example the old client stages and the
  `teach-nc/*` series), so Part 2 does not copy them back by mistake.
- Check what was saved: `git for-each-ref --format="%(refname:short)" "refs/remotes/github/teach/ch03-client-*"`
  (20 names, `01-hello` … `20-tests`, since 2026-10-15).

**Optional: keep the stages as local branches too** (to look at them or work on the bridge offline).

Git Bash:

```bash
for r in $(git for-each-ref --format='%(refname:short)' 'refs/remotes/github/teach/ch03-client-*'); do
  git branch -f --track "${r#github/}" "$r"
done
```

PowerShell:

```powershell
git for-each-ref --format='%(refname:short)' 'refs/remotes/github/teach/ch03-client-*' | ForEach-Object {
  git branch -f --track ($_ -replace '^github/', '') $_
}
```

`-f` creates the branch or moves it to GitHub's version; a branch that is checked out cannot be moved
(switch to `main` first). Part 2 does not need these local branches.

---

## Part 2 — on the Gitea network

Everything here works without GitHub. Start every session with:

```bash
git fetch --prune gitea
```

It tells the bridge what Gitea has right now; `--force-with-lease` compares against it.

### Normal sync (new commits, nothing rewritten)

```bash
git push gitea "refs/remotes/github/main:refs/heads/main"
git push gitea "refs/remotes/github/teach/ch03-server-*:refs/heads/teach/ch03-server-*"
git push gitea "refs/remotes/github/teach/ch03-client-*:refs/heads/teach/ch03-client-*"
git push gitea "refs/remotes/github/teach/ch00-ttt-*:refs/heads/teach/ch00-ttt-*"
```

### After a rebase (stage branches were rewritten on GitHub)

```bash
git push --force-with-lease gitea "refs/remotes/github/teach/ch03-client-*:refs/heads/teach/ch03-client-*"
```

(The same with `ch03-server-*` or `ch00-ttt-*`.) `--force-with-lease` refuses if somebody changed a Gitea
branch after your `git fetch --prune gitea`. Students who already cloned have to reset their stage branches.
Never force-push `main`: once the ladder is merged, `main` only grows.

### Client ladder renumbered (2026-10-15): copy the 20 stages, delete the 15 old names

Tic-Tac-Toe became client stages 02–05 and the old stages 02–16 became 06–20. On GitHub the old names are
gone; Gitea still has them until you delete them.

```bash
git push gitea "refs/remotes/github/teach/ch03-client-*:refs/heads/teach/ch03-client-*"
git push gitea "refs/remotes/github/main:refs/heads/main"
git push gitea --delete teach/ch03-client-02-users-list teach/ch03-client-03-signup-form teach/ch03-client-04-request-helper teach/ch03-client-05-mui teach/ch03-client-06-router teach/ch03-client-07-profile teach/ch03-client-08-signin teach/ch03-client-09-auth-helper teach/ch03-client-10-private-route teach/ch03-client-11-edit-profile teach/ch03-client-12-delete-user teach/ch03-client-13-form-actions teach/ch03-client-14-lazy-pages teach/ch03-client-15-production teach/ch03-client-16-tests
```

No force is needed for the first push: stage 01 only got one more commit, and the other 19 names are new.
The delete line works in Git Bash and PowerShell. A name that is already gone gives
`error: unable to delete '…': remote ref does not exist` and `error: failed to push some refs`; the others
are still deleted.

**Shorter, by pattern:** `--prune` with a pattern deletes every Gitea branch matching the pattern that has no
source in the saved GitHub copy, so this one push copies the 20 stages *and* deletes the 15 old names:

```bash
git push --prune gitea "refs/remotes/github/teach/ch03-client-*:refs/heads/teach/ch03-client-*"
```

Add `--dry-run` first to see the plan (`* [new branch]`, `- [deleted]`) without changing anything.

### Delete the comment-free series `teach-nc/*` (deleted on GitHub 2026-10-16)

The 35 `teach-nc/*` branches had the old client numbering. They were deleted on GitHub and on the work
machine; they are regenerated later with `tools/make-nc-ladder.mjs` (on the work machine) and pushed again.
To delete them on Gitea, list what Gitea has and delete each one.

Git Bash:

```bash
git fetch --prune gitea
git push gitea --delete $(git for-each-ref --format='%(refname:lstrip=3)' 'refs/remotes/gitea/teach-nc/*')
```

PowerShell:

```powershell
git fetch --prune gitea
$nc = git for-each-ref --format='%(refname:lstrip=3)' 'refs/remotes/gitea/teach-nc/*'
if ($nc) { git push gitea --delete $nc }
```

`refname:lstrip=3` turns `refs/remotes/gitea/teach-nc/ch03-client-01-hello` into
`teach-nc/ch03-client-01-hello` (the branch name on Gitea). Check afterwards: after another
`git fetch --prune gitea`, `git for-each-ref "refs/remotes/gitea/teach-nc/*"` prints nothing.

If the bridge has **local** `teach-nc/*` branches, remove them too (Git Bash:
`git branch -D $(git for-each-ref --format='%(refname:short)' 'refs/heads/teach-nc/*')`; PowerShell: put the
`for-each-ref` output in a variable as above and run `git branch -D $nc`).

**When the series is regenerated** and back on GitHub: Part 1 as usual, then in Part 2

```bash
git push --force gitea "refs/remotes/github/teach-nc/*:refs/heads/teach-nc/*"
```

(`--force`, because the generator rewrites the series every time a source stage changes.)

### Tags

```bash
git push gitea --tags
```

(Pushes the tags Part 1 fetched with `git fetch github --tags`, plus any local tags of the bridge.)

### Check that Gitea matches what was saved from GitHub

The bridge cannot ask both servers at once, so compare GitHub's saved copy (from Part 1) with a fresh
fetch of Gitea:

Git Bash:

```bash
git fetch --prune gitea
diff <(git for-each-ref --format='%(objectname) %(refname:lstrip=3)' refs/remotes/github/teach refs/remotes/github/main) \
     <(git for-each-ref --format='%(objectname) %(refname:lstrip=3)' refs/remotes/gitea/teach refs/remotes/gitea/main) \
  && echo "identical"
```

PowerShell:

```powershell
git fetch --prune gitea
$gh = git for-each-ref --format='%(objectname) %(refname:lstrip=3)' refs/remotes/github/teach refs/remotes/github/main
$gt = git for-each-ref --format='%(objectname) %(refname:lstrip=3)' refs/remotes/gitea/teach refs/remotes/gitea/main
Compare-Object $gh $gt     # no output = identical
```

Lines that only show up on one side are branches that differ or exist on one server only.

### Removing any other branch

A branch deleted on GitHub stays on Gitea until it is deleted there too:

```bash
git push gitea --delete <branch>
```

---

Avoid `refs/remotes/github/*:refs/heads/*`. It also matches `github/HEAD`, which would create a branch
called `HEAD` on Gitea. To make Gitea an exact copy of GitHub in one go, use the procedure in
[gitea-force-sync-from-github.md](gitea-force-sync-from-github.md), which removes `github/HEAD` first
(its step 1 is Part 1 here; everything after it is Part 2).
