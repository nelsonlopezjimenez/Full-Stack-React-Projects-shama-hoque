# Chapter 03 teaching ladder — where to put documentation changes

Context (2026-10-02): the 19 stage branches `teach/ch03-server-01-hello` … `teach/ch03-server-19-tests`
are pushed. Students clone from Gitea. Question: if a "How to compare stages" note is added to the
ladder README and lesson 01, does that need a commit and a rebase?

Related: [ch03-teaching-ladder-checklist.md](ch03-teaching-ladder-checklist.md) (section "Fixing an
earlier stage later"), [ch03-teaching-ladder-log.md](ch03-teaching-ladder-log.md).
Follow-up (2026-10-08): the student instructions stay on `main` only, and the client ladder points to them;
rebase and clone/fork effects explained in [ch03-instructions-on-main-and-rebasing.md](ch03-instructions-on-main-and-rebasing.md).

## Where the files are

- **Ladder README:** `Chapter03 and 04/mern-skeleton/README.md`, one level above `server/`. It was
  added in the commit "start from an empty folder", just before stage 01. It explains that every stage
  is a branch and shows a `git switch` / `git diff` example.
- **Lesson 01:** `Chapter03 and 04/mern-skeleton/server/lessons/01-hello.md`, in stage 01.

## Does it need a rebase? It depends where the note goes

| Where | Rebase? | Result |
|---|---|---|
| In the README / lesson 01 **at their original place** (stage 01) | **Yes.** Commit on stage 01, then `rebase --update-refs`, then force-push all 19 branches (to Gitea too) | Every stage shows the note |
| **One new commit on top of stage 19** that edits the README and lesson 01 | **No.** It's a normal commit and a normal push of one branch | Only stage 19 (and later `main`) shows the note; stages 01–18 keep the old text |
| **Outside the ladder**: your course page, the Gitea wiki, or a handout | **No** | Students see it before they clone, whichever stage they're on |

## Recommendation

- Don't rebase for a documentation note. Put the "how to compare stages" instructions where students read
  them first, which is your course page or the Gitea wiki. There the instructions can't go stale in older stages.
- If you also want it in the repo, add one commit on stage 19. Better still, wait: if your review finds
  a real fix in an early stage, you'll rebase anyway, and the note can ride along in the same rebase at
  no extra cost.
- The client series will eventually replace this ladder README with the migration's full README.
  Whatever you add here should be carried over then.

## Scenario: the note goes into stage 01 (with a rebase)

```bash
git branch backup/ladder-before-docs teach/ch03-server-19-tests   # cheap undo
git switch teach/ch03-server-01-hello
# edit README.md / lessons/01-hello.md
git commit -am "docs(ch03-ladder): how to compare stages"
git switch teach/ch03-server-19-tests
git rebase --update-refs teach/ch03-server-01-hello
# then, for every remote the students or you use:
git push --force-with-lease origin "refs/heads/teach/ch03-server-*:refs/heads/teach/ch03-server-*"
```

Keep the log file (`chat/ch03-teaching-ladder-log.md`) out of this commit, or the rebase will conflict
at every stage. Anyone who already pulled the branches has to reset them afterwards.

## Scenario: the note goes on top of stage 19 (no rebase)

```bash
git switch teach/ch03-server-19-tests
# edit README.md / lessons/01-hello.md
git commit -am "docs(ch03-ladder): how to compare stages"
git push origin teach/ch03-server-19-tests
```

## The note itself (ready to paste anywhere)

> **How to compare two stages**
>
> In a fresh clone, only the stage you switched to exists as a local branch; the others are
> `origin/teach/...`. Either put `origin/` in front of the names:
>
> ```bash
> git diff origin/teach/ch03-server-01-hello origin/teach/ch03-server-02-memory-users -- .
> ```
>
> or `git switch teach/ch03-server-02-memory-users` once, and the short name works from then on.
>
> The path at the end depends on where you are: `-- .` inside `server/`, `-- server` inside
> `mern-skeleton/`. A wrong path gives an empty diff, not an error.
>
> (`origin` is whatever server you cloned from: for students that is Gitea.)
