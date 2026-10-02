# Keeping the Gitea repo in sync with GitHub (bridge machine)

Context (2026-10-02): students clone from **Gitea**. Work is pushed to **GitHub**. Gitea cannot pull
from GitHub directly, so a **bridge machine** with two remotes copies everything across:

```
work machine ──push──▶ GitHub ──fetch──▶ bridge machine ──push──▶ Gitea ──clone──▶ students
```

The work machine only knows GitHub (`origin`). Only the bridge knows Gitea.
The commands below assume the bridge's remotes are named `github` and `gitea` (check with `git remote -v`).

## Why `git pull` is not enough

`git pull` only updates the branch that is checked out. `git fetch` downloads every branch, but only as
remote-tracking names (`github/main`, `github/teach/...`), not as local branches. The commands below
push those remote-tracking names straight to Gitea, so the bridge never needs local copies of the
19 stage branches, and it does not matter which branch the bridge has checked out.

In each refspec, the part before `:` is what the bridge fetched from GitHub. The part after `:` is the
branch name on Gitea.

## Normal sync (new commits, nothing rewritten)

```
git fetch github
git push gitea "refs/remotes/github/main:refs/heads/main"
git push gitea "refs/remotes/github/teach/ch03-server-*:refs/heads/teach/ch03-server-*"
```

## After a rebase (the stage branches were rewritten on GitHub)

```
git fetch github
git fetch gitea
git push --force-with-lease gitea "refs/remotes/github/teach/ch03-server-*:refs/heads/teach/ch03-server-*"
```

Fetching `gitea` first lets `--force-with-lease` check that nobody else changed those branches on Gitea
before they are overwritten. Students who already cloned have to reset their stage branches afterwards.

Never force-push `main`: once the ladder is merged, `main` only grows.

## Tags

```
git fetch github --tags
git push gitea --tags
```

## Other branch series

Repeat the branch line with another pattern, for example the future client series:

```
git push gitea "refs/remotes/github/teach/ch03-client-*:refs/heads/teach/ch03-client-*"
```

Avoid `refs/remotes/github/*:refs/heads/*`. It also matches `github/HEAD`, which would create a branch
called `HEAD` on Gitea. To copy **all** branches at once (and make Gitea an exact copy of GitHub), use the
procedure in [gitea-force-sync-from-github.md](gitea-force-sync-from-github.md), which removes `github/HEAD` first.

## Check that both servers agree

```
git ls-remote --heads github "teach/*"
git ls-remote --heads gitea "teach/*"
```

The two lists should show the same commit for each branch.

## Removing a branch

A branch deleted on GitHub stays on Gitea until it is deleted there too:

```
git push gitea --delete <branch>
```
