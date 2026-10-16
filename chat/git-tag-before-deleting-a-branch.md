# Tag a branch before deleting it

Context (2026-10-16): cleaning up old branches. `refactor/ch03-simple-auth` (local only) had nothing
worth keeping: 20 of its 22 commits were already on `main` under new hashes, and the other two were
replaced by the `teach/ch03-*` ladder. It was archived as the tag `backup/ch03-simple-auth` and then
deleted. Details: the 2026-10-16 entry in [ch03-migration-log.md](ch03-migration-log.md).

## The question (the prompts, as asked)

> why tag and then delete

> Let's tag and delete it, and add the explanation in the log and/or relevant readme

## Why a tag

When a branch is deleted, nothing points to its commits any more.

- **Without a tag**, the commits survive only in the **reflog**, the local record of where branches
  used to point. Reflog entries expire (90 days by default, 30 for commits no branch can reach), and
  then `git gc` removes the commits for good. Getting them back means finding the hash in `git reflog`.
- **With a tag**, the commits stay reachable, so they are never garbage-collected. Getting the work
  back is one command.

## Why not just keep the branch

| | Branch | Tag |
|---|---|---|
| Shows in `git branch` | yes, clutters the list | no |
| Can move | yes: a commit, a rebase or `--update-refs` can move it by accident | no, it stays fixed |
| Signals | "work in progress here" | "archived snapshot" |

The "can move" row already bit this repo: `git rebase --update-refs` moved a backup **branch** along
with the ladder rebase. That is why backups here are tags
(see [ch03-instructions-on-main-and-rebasing.md](ch03-instructions-on-main-and-rebasing.md)).

## Commands

```bash
# archive, then delete (-D because the commits on main have other hashes, so Git calls it unmerged)
git tag -a backup/ch03-simple-auth -m "why it was archived" refactor/ch03-simple-auth
git branch -D refactor/ch03-simple-auth

# list archived branches
git tag --list 'backup/*'

# bring one back as a branch
git switch -c refactor/ch03-simple-auth backup/ch03-simple-auth

# drop the archive for good
git tag -d backup/ch03-simple-auth
```

A tag stays on the machine that made it: `git push` does not send tags unless asked
(`git push origin <tag>`). So `backup/*` tags do not clutter GitHub or Gitea, but they also exist only
on this machine. Push the tag if the other machine should have it too.

## Before deleting any branch: is everything somewhere else?

`git diff A B --stat` is not enough: it compares files, not commits. Check the commits:

```bash
git log --oneline main..old-branch          # commits on old-branch that main does not have
git branch -a --contains <sha>              # which branches contain one of them
git cherry -v main old-branch               # '-' = same change already in main (even with a new hash)
```

After a rebase the commits on `main` have new hashes, so `--contains` misses them. Then compare the
content instead, e.g. `git diff old-branch main -- "Chapter03 and 04"` (empty = identical).
