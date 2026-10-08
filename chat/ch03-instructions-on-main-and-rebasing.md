# Student instructions live on `main` only; how a rebase rewrites history

Context (2026-10-08): the client ladder `teach/ch03-client-01-hello` … `teach/ch03-client-16-tests` was built
on top of `teach/ch03-server-19-tests`. The student instructions
`instructions/working-with-the-lesson-stages.md` were added to `main` on 2026-10-02, after the server ladder
was built, so no `teach/` branch contains them.

Related: [ch03-teaching-ladder-doc-changes.md](ch03-teaching-ladder-doc-changes.md) (where documentation
changes go), [gitea-force-sync-from-github.md](gitea-force-sync-from-github.md),
[gitea-sync-via-bridge.md](gitea-sync-via-bridge.md), [ch03-client-ladder-checklist.md](ch03-client-ladder-checklist.md).

## The question (the prompts, as asked)

> the instructions folder is in main. What would happen if adding it to stage 01, i presume all the
> references need to be updated dowstream, will it conflict with forks already created from the server
> lessons? if instructions is added from the lesson 01 client can be done withous side issues

and the decision:

> The "drift apart" situation is what i want to prevent. Add the pointer to client lesson 01, the client
> README and rebase. Also, make note on log or readme or another relevant document of my prompt and your
> analysis for future reference adding a brief explanation of rebase process, how it changes history and
> what would happen if the repo were already cloned or forked

## The analysis

| Question | Answer |
|---|---|
| Do references downstream need updating? | No. No file on any `teach/` branch mentions `instructions/`. A new file in stage 01 reaches every later stage automatically through the rebase, and no later stage touches that folder, so the rebase does not conflict. |
| Does it conflict with students' forks of the server lessons? | No. Students' branches (`my/05-delete` …) start from `teach/ch03-server-*`. A commit on a *client* stage does not change any server branch. |
| Any side issue? | Yes: **two copies of one file.** `main` already has `instructions/working-with-the-lesson-stages.md`. If client stage 01 added its own copy, the ladder and `main` would each have one. When the ladder is merged into `main`, the merge is clean only while both copies are byte-for-byte identical. Any edit on one side and not on the other gives an **add/add conflict** at merge time, so every change would have to be made twice. Students would also see the folder on client stages but not on server stages. |

**Decision:** one copy, on `main`. The client lesson 01 and the client README only **point** to it, with a
Gitea link and `git show origin/main:instructions/working-with-the-lesson-stages.md`. Those two files exist
only on the ladder branches, so the pointer can never conflict with `main`.

## What was done

```bash
git branch backup/ch03-client-before-pointer teach/ch03-client-16-tests   # cheap undo (see the surprise below)
git switch teach/ch03-client-01-hello
# edit client/lessons/01-hello.md and client/README.md
git commit -m "docs(ch03-ladder): client lesson 01 and README point to the student instructions on main"
git switch teach/ch03-client-16-tests
git rebase --update-refs teach/ch03-client-01-hello                      # replays stages 02–16
git switch main && node tools/make-nc-ladder.mjs                         # rebuilds the teach-nc/ copy
```

Checks afterwards: all 16 stages contain both pointers; the old and new stage 16 differ only in those two
files (9 added lines); and every stage's lesson diff (stage N-1 → N) is otherwise identical to before.
The code did not change, so the earlier build and browser test results still apply.
The client branches were **not pushed yet**, so nobody had to do anything.

**Surprise:** `--update-refs` moves *every* branch that points into the rebased range, including the backup
branch, which pointed at the old stage 16. It was moved back with
`git branch -f backup/ch03-client-before-pointer "backup/ch03-client-before-pointer@{1}"`.
A safer way to keep a backup is a tag (`git tag backup-before-x teach/ch03-client-16-tests`): `--update-refs`
never moves tags.

## How a rebase changes history

A commit's id is a hash of its content, its message, its date **and its parent's id**. So:

```
before:  S19 ── 01 ── 02 ── 03 … 16          (01 = stage 1, 02 = stage 2, …)
                 │
add one commit:  01 ── P                    (P = the pointer commit)

rebase replays 02…16 on top of P:
after:   S19 ── 01 ── P ── 02' ── 03' … 16'
                 └── 02 ── 03 … 16           (old commits: no branch points to them any more)
```

- `02'` has the same changes and message as `02`, but a **new parent** (`P`), so it gets a **new id**. That
  ripples through every later stage: all 15 later commits get new ids.
- `--update-refs` moves the branch names `teach/ch03-client-02…15` to the new commits. Without it, only the
  branch you are on (stage 16) would move, and the others would still point at the old commits.
- The old commits are not deleted at once. They stay reachable through the reflog
  (`git reflog teach/ch03-client-16-tests`, or `teach/ch03-client-16-tests@{1}`) for about 90 days, which
  makes a rebase easy to undo: `git branch -f <branch> <branch>@{1}`.
- Nothing about the server branches changed: their commits are *before* the rebased range.

## What if the branches had already been pushed, cloned or forked?

A rebase rewrites history that other copies already have. Their copies still contain the old commits.

| Who | What happens | What to do |
|---|---|---|
| **You, pushing** | A normal `git push` is refused ("non-fast-forward"), because the new branch tip does not contain the old one. | `git push --force-with-lease origin "refs/heads/teach/ch03-client-*:refs/heads/teach/ch03-client-*"`. `--force-with-lease` refuses if someone else pushed in the meantime. |
| **The bridge machine / Gitea** | Gitea keeps the old commits until it gets a forced push too. | Force-sync as in [gitea-force-sync-from-github.md](gitea-force-sync-from-github.md). |
| **A student who only looks at stages** (switches to them, never commits) | `git pull` on a rewritten branch reports *divergent branches* (or makes a merge commit that mixes old and new history). | Throw the local copy of the stage away and take the new one: `git fetch origin` then `git switch teach/ch03-client-05-mui && git reset --hard origin/teach/ch03-client-05-mui`. Or simply `git switch --detach origin/teach/…` as the instructions recommend. |
| **A student with their own branch** (`my/05-…` started from an old stage) | Their branch still sits on the **old** commits. Nothing breaks, and their work is safe, but `git diff origin/teach/…` now also shows the rewrite (here: the pointer lines). | Usually: nothing; the difference is two documentation files. To move their work onto the new stage: `git rebase --onto origin/teach/ch03-client-04-request-helper <old stage 04 id> my/05-…` |
| **A fork on Gitea/GitHub** (a server-side copy) | A fork does not follow the original automatically; it keeps the old history until its owner syncs it. Syncing a rewritten branch needs a force as well. | The fork's owner fetches the original and resets or force-pushes their copies of the `teach/` branches. Their own branches stay as they are. |

**The rule of thumb:** rewriting branches is cheap *before* they are pushed and costs every clone a manual step
*after*. For pushed branches, prefer a new commit on the last stage (no rewrite), or bundle several fixes into
one rebase. See "Does it need a rebase?" in [ch03-teaching-ladder-doc-changes.md](ch03-teaching-ladder-doc-changes.md).
