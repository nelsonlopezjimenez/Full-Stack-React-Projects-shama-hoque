# Force Gitea to be an exact copy of GitHub (bridge machine)

**GitHub is the source of truth.** This procedure makes the Gitea repository identical to GitHub:
same branches, same commits, same tags. Anything that exists **only on Gitea** is overwritten or deleted.

For everyday syncing (new commits only, nothing rewritten), the gentler commands in
[gitea-sync-via-bridge.md](gitea-sync-via-bridge.md) are enough. Use this procedure when:

- Gitea has commits that GitHub does not have (like `018b56c` on 2026-10-02),
- branches were rebased or force-pushed on GitHub (e.g. the `teach/ch03-server-*` ladder),
- branches were deleted on GitHub and should disappear from Gitea too,
- or you're simply not sure, and want both servers to match exactly.

Everything runs on the **bridge machine** (remotes `github` and `gitea`; check with `git remote -v`).
**You don't need to switch branches**: the commands never touch your checked-out branch, your local
branches or your working files.

Tested on 2026-10-02 with Git 2.53 against throwaway repositories (a diverged `main`, a Gitea-only
branch, a new GitHub commit, a tag).

---

## The big picture

```
  ┌─────────────┐   git push   ┌─────────────┐   git fetch   ┌──────────────────┐
  │ work laptop │ ───────────▶ │   GitHub    │ ────────────▶ │  bridge machine  │
  │ origin =    │              │ (source of  │               │ remotes: github  │
  │   GitHub    │              │   truth)    │               │          gitea   │
  └─────────────┘              └─────────────┘               └────────┬─────────┘
                                                                      │ git push
                                                                      ▼
                               ┌─────────────┐   git clone   ┌──────────────────┐
                               │  students   │ ◀──────────── │      Gitea       │
                               │             │               │ 192.168.1.28:3000│
                               └─────────────┘               └──────────────────┘
```

Water flows one way: **GitHub → bridge → Gitea**. Gitea never sends anything back.

### What lives on the bridge after `git fetch`

```
  bridge machine
  ├── your own branches            refs/heads/...            ← main, feature, ...   (never touched here)
  ├── copy of GitHub  (fetch)      refs/remotes/github/...   ← github/main, github/teach/...
  └── copy of Gitea   (fetch)      refs/remotes/gitea/...    ← gitea/main, ...      (used by --force-with-lease)

  The push copies   refs/remotes/github/*   ──────▶   Gitea's   refs/heads/*
                    (what GitHub has)                 (Gitea's real branches)
```

That's why you never need to switch branches: the push takes the **GitHub copies**, not your own
branches.

---

## One-time setup: stop `github/HEAD` from becoming a branch on Gitea

`git fetch` can create a pointer `github/HEAD` ("GitHub's default branch"). The push below copies
every `github/*` name, so it would create a **branch called `HEAD`** on Gitea. Remove the pointer and
tell Git not to recreate it:

```
  the trap                                              after the one-time setup

  refs/remotes/github/HEAD  ──▶ Gitea branch "HEAD"  ✗   (gone)
  refs/remotes/github/main  ──▶ Gitea branch "main"  ✓   refs/remotes/github/main  ──▶ "main"  ✓
  refs/remotes/github/teach ──▶ Gitea branch "teach" ✓   refs/remotes/github/teach ──▶ "teach" ✓
```

```bash
git config remote.github.followRemoteHEAD never
git remote set-head github --delete
```

(The first line needs Git 2.48 or newer. Older Git never recreates the pointer on fetch, so there the
second line alone is enough. If the first line gives an error, that's fine.)

Check: this list must **not** contain `refs/remotes/github/HEAD`:

```bash
git for-each-ref --format="%(refname)" refs/remotes/github
```

> Tested and **not** working: the exclusion `"^refs/remotes/github/HEAD"` in the push command. Git 2.53
> ignored it and still created a `HEAD` branch on Gitea. If that ever happens, delete it with
> `git push gitea --delete HEAD`.

---

## The procedure

```bash
# 1. Get the current state of both servers
git fetch --prune github
git fetch --prune gitea

# 2. Preview: nothing is sent, Git only lists what it would do
git push --dry-run --force-with-lease --prune gitea "refs/remotes/github/*:refs/heads/*"

# 3. Do it: every branch on Gitea becomes exactly the GitHub branch
git push --force-with-lease --prune gitea "refs/remotes/github/*:refs/heads/*"

# 4. Tags
git fetch --force github --tags
git push --force gitea "refs/tags/*:refs/tags/*"
```

### Before and after

```
              GitHub (truth)          Gitea BEFORE                 Gitea AFTER
  main        A ─ B ─ C               A ─ B ─ Y                    A ─ B ─ C        + forced update (Y dropped)
  teach/x     A ─ D                   A ─ D                        A ─ D              already equal: nothing
  teach/new   A ─ E                   (missing)                    A ─ E            * new branch
  old-stuff   (deleted on GitHub)     A ─ F                        (gone)           - deleted (--prune)
  tag v1      ▶ C                     (missing)                    ▶ C              * new tag
```

### `--force-with-lease`: when does it refuse?

```
  step 1:  git fetch gitea      bridge remembers   gitea/main = Y
                                       │
  step 3:  push                 Gitea really has?  ├── still Y        →  overwrite ✓   (expected state)
                                                   └── Y ─ W (new!)   →  refuse    ✗   ("stale info")
                                                                          someone pushed in between:
                                                                          fetch again, look, decide
```

### What each part means

| Part | Meaning |
|---|---|
| `git fetch --prune github` | Download every GitHub branch as `github/...`, and forget branches that were deleted on GitHub (so step 3 deletes them on Gitea too) |
| `git fetch --prune gitea` | Learn exactly what Gitea has now; `--force-with-lease` compares against this |
| `"refs/remotes/github/*:refs/heads/*"` | Source `:` destination: each `github/<name>` the bridge fetched becomes branch `<name>` on Gitea |
| `--force-with-lease` | Overwrite Gitea's branches even if they have other commits, **but** refuse if a Gitea branch changed after step 1 (someone pushed in the meantime). Then repeat from step 1 |
| `--prune` | Delete Gitea branches that do not exist on GitHub |
| `--dry-run` | Show the plan without changing anything |

Output lines to expect: `+ abc...def github/main -> main (forced update)` (overwritten),
`- [deleted] some-branch` (removed from Gitea), `* [new branch]` (created), and nothing for
branches that were already equal.

---

## Only `main`

```bash
git fetch github
git fetch gitea
git push --force-with-lease gitea "refs/remotes/github/main:refs/heads/main"
```

## Case: Gitea's `main` has one extra commit on top of a GitHub commit

This is what happened on 2026-10-02 with `018b56c`: Gitea's `main` was a GitHub commit plus one commit
that was never pushed to GitHub, and GitHub had moved on since:

```
                  ┌── Z            ◀── github/main   (Z = newer GitHub commits)
  ... ─ W ─ X ────┤
                  └── Y            ◀── gitea/main    (Y = the extra commit, only on Gitea)
```

**The idea:** drop `Y` by moving `main` back one commit, to `X`. Because `X` is part of GitHub's
history, `main` can then simply move forward to GitHub's `main` (`--ff-only`), with no merge and no
merge commit. Then Gitea gets that result.

Step by step (`main` = the bridge's local `main`, `[…]` = which names point at a commit):

```
  ① start                                   ┌── Z   [github/main]
                                    ─ X ────┤
                                            └── Y   [gitea/main] [main]

  ② step back one                           ┌── Z   [github/main]
     reset --hard gitea/main~1      ─ X ────┤
     (or: branch -f main gitea/main~1)  ▲   └── Y   [gitea/main]
                                        └── [main]

  ③ fast-forward                            ┌── Z   [github/main] [main]      ◀ main slid forward X → Z
     pull --ff-only github main     ─ X ────┤
     (or: fetch github main:main)           └── Y   [gitea/main]

  ④ push to Gitea (force)                   ┌── Z   [github/main] [main] [gitea/main]
     push --force-with-lease        ─ X ────┤
       gitea main                           └── Y   (no name points here any more: dropped)
```

Two corrections to keep in mind:

- You can't reset Gitea itself. You move the bridge's **local** `main` back, and then push it.
- That final push **needs force** (`--force-with-lease`): it removes `Y`, which Gitea already has.

### Check first that it applies

```bash
git fetch github
git fetch gitea
git log --oneline --graph github/main gitea/main     # look at the picture
git merge-base --is-ancestor gitea/main~1 github/main && echo "yes: one step back, then fast-forward works"
```

If it doesn't print "yes", Gitea's `main` is more than one commit off (or GitHub rewrote history).
Then use the full procedure above instead.

**Does `Y` matter?** This throws `Y` away. To keep it, push it to GitHub first instead:
`git push github "refs/remotes/gitea/main:refs/heads/main"`. That only works if GitHub has no newer
commits, or you merge them first.

### Way 1 — on `main` (your way)

```bash
git switch main
git status                        # must say "nothing to commit": reset --hard discards local edits
git reset --hard gitea/main~1     # local main = X (one commit before Gitea's main)
git pull --ff-only github main    # X → GitHub's main, only if that is a straight move forward
git push --force-with-lease gitea main
git switch -                      # back to the branch you were working on
```

`gitea/main~1` means "one commit before Gitea's `main`". It is safer than `HEAD~1`, which depends on
where your local `main` happens to be.

### Way 2 — without switching branches (tested)

```bash
git branch -f main gitea/main~1        # move local main to X (not allowed while main is checked out)
git fetch github main:main             # fast-forward local main to GitHub's main; refuses if not a straight move
git push --force-with-lease gitea main
```

### Check

```bash
git fetch gitea
git rev-parse github/main gitea/main   # the two lines must be the same commit
```

### Shortcut

The result is exactly the same as the "Only `main`" section above, which does it in one push:

```bash
git push --force-with-lease gitea "refs/remotes/github/main:refs/heads/main"
```

The one-step-back way is useful when you also want the bridge's local `main` to end up equal to GitHub's.

### More than one extra commit (2, 3, 4 …)

Same logic: go back past **all** the Gitea-only commits to the last commit both share, then
fast-forward. Don't count them by hand (`gitea/main~3`). With a merge among them, `~N` follows only
one side. Let Git find the shared commit:

```
                         ┌── Z1 ─ Z2              ◀── github/main
  ... ─ W ─ X ───────────┤
          ▲              └── Y1 ─ Y2 ─ Y3         ◀── gitea/main      (3 Gitea-only commits)
          │
          └── merge base: the last commit both share  =  git merge-base gitea/main github/main
              github/main..gitea/main  =  Y1, Y2, Y3   (what will be dropped)
```

```bash
git fetch github
git fetch gitea
git rev-list --count github/main..gitea/main   # how many commits only Gitea has
git log --oneline github/main..gitea/main      # which ones: they will be dropped
git merge-base gitea/main github/main          # the last commit both share
```

The merge base is always part of GitHub's history, so the fast-forward after it always works:

```bash
git branch -f main $(git merge-base gitea/main github/main)   # works in Git Bash and PowerShell
git fetch github main:main
git push --force-with-lease gitea main
```

**But note what the two steps add up to:** back to the shared commit, then forward to GitHub's `main`,
always ends at **exactly GitHub's `main`**, however many commits Gitea had extra. So the direct way
gives the same result:

```
  long road:   gitea/main ──back──▶ merge base X ──forward──▶ github/main
  short road:  gitea/main ──────────────jump───────────────▶ github/main

  same destination, same result on Gitea
```

```bash
git branch -f main github/main                 # local main = GitHub's main (not while main is checked out)
git push --force-with-lease gitea main
```

or, without touching the bridge's local `main` at all, the one-push shortcut above.

---

## Only one branch series (e.g. the teaching ladder)

```bash
git fetch --prune github
git fetch --prune gitea
git push --force-with-lease gitea "refs/remotes/github/teach/ch03-server-*:refs/heads/teach/ch03-server-*"
```

Add `--prune` to also delete ladder branches that were removed on GitHub. With a pattern, `--prune`
only deletes Gitea branches that match the pattern (`teach/ch03-server-*`); other branches are left alone.

---

## Check that both servers match

Bash (Git Bash):

```bash
diff <(git ls-remote --heads --tags github) <(git ls-remote --heads --tags gitea) && echo "identical"
```

PowerShell (no `<( )`):

```powershell
git ls-remote --heads --tags github > gh.txt
git ls-remote --heads --tags gitea  > gt.txt
Compare-Object (Get-Content gh.txt) (Get-Content gt.txt)   # no output = identical
Remove-Item gh.txt, gt.txt
```

---

## Before you run it — be aware

- **Gitea-only work is lost.** Commits or branches that exist only on Gitea are overwritten or deleted.
  If something there matters, push it to GitHub first (from the bridge:
  `git push github "refs/remotes/gitea/<branch>:refs/heads/<branch>"`).
- **Students' forks are not affected.** A fork is a separate repository on Gitea; this procedure only
  changes the course repository `s888888/Full-Stack-React-Projects-shama-hoque`.
- **Students who already pulled overwritten commits** have to reset their copy. Only if they did not
  commit on that branch themselves (the student instructions tell them to use `my/...` branches):
  ```bash
  git fetch origin
  git switch main
  git reset --hard origin/main
  ```
- **Branch protection.** If `main` is protected on Gitea (Settings → Branches), the forced push is
  refused. Allow force-push for your user, or disable the protection for the sync.
- **Why not `git push --mirror`?** It mirrors the bridge's *own* local branches (`refs/heads/*`), not
  what was fetched from GitHub. It would push your bridge work branches and delete everything else.

---

## Copy-paste block

```bash
# once
git config remote.github.followRemoteHEAD never
git remote set-head github --delete

# every time
git fetch --prune github
git fetch --prune gitea
git push --dry-run --force-with-lease --prune gitea "refs/remotes/github/*:refs/heads/*"
git push --force-with-lease --prune gitea "refs/remotes/github/*:refs/heads/*"
git fetch --force github --tags
git push --force gitea "refs/tags/*:refs/tags/*"
```
