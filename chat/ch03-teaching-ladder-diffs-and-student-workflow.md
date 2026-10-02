# Chapter 03 teaching ladder — why diffs, and how students should work

Instructor notes (2026-10-02). The student-facing version is
[`instructions/working-with-the-lesson-stages.md`](../instructions/working-with-the-lesson-stages.md).

Related: [ch03-teaching-ladder-checklist.md](ch03-teaching-ladder-checklist.md),
[ch03-teaching-ladder-doc-changes.md](ch03-teaching-ladder-doc-changes.md),
[gitea-sync-via-bridge.md](gitea-sync-via-bridge.md).

---

## Part 1 — Why show the diff between stages?

A diff between two stages shows **only what's new in that lesson, in the place where it goes**. That's
hard to see any other way. A full file shows everything at once, and a beginner can't tell which ten
lines matter.

### What it does for learning

- **It separates the new idea from what's already known.** In stage 05 the diff is about 12 lines: one
  `app.delete(...)` route. The other ~120 lines of `server.js` are things students already know. The diff
  makes "this is today's lesson" visible.
- **It shows where code goes, not just what it is.** Beginners often understand a snippet but don't know
  where to put it. In the stage 10 diff, `requireSignin` appears *in the route, before* `userByID`. The
  position is part of the lesson.
- **It makes refactors understandable.** In stage 07, the behaviour doesn't change at all; code only moves.
  The diff shows lines leaving `server.js` and the same lines arriving in `controllers/`. Students see
  that a refactor is moving code, not rewriting it.
- **It shows how much a feature costs.** The fix for mass assignment (stage 15) is about 10 lines. Hashing
  passwords (stage 14) touches the model and one line of sign-in. Students learn that good structure
  keeps changes small, which is the payoff promised in lesson 07.
- **It lets students check their own work.** If they code a stage themselves first, they can compare their
  attempt with the stage branch. If they get stuck, a diff of their code against the stage shows what's
  missing.
- **It's a real professional skill.** Code review, pull requests and `git log -p` are all diffs.
  Developers read far more diffs than whole files, and the ladder trains that habit from day one.

### Ways to use it in class

1. **Predict, then compare.** Read the lesson's "Goal", let students guess which files change and roughly
   how, then show the diff.
2. **Type it.** Students type the diff into the previous stage by hand, run `api.http`, and confirm they
   get the same answers. That's more active than reading.
3. **Stuck? Diff it.** Students compare their own folder with the stage branch
   (`git diff origin/teach/ch03-server-05-delete -- .` from inside `server/`).

### Things to watch out for

- **Teach how to read a diff first.** Lines starting with `+` and `-`, the `@@` markers, and the unchanged
  context lines are confusing at first. A 5-minute intro on stage 02 (a small diff) is enough.
- **Hide noise.** Stages that add a package also change `package-lock.json` by hundreds of lines. Leave it
  out:
  ```
  git diff <stage A> <stage B> -- . ":!package-lock.json"
  ```
- **Use a visual view for beginners.** VS Code's side-by-side compare (Source Control or GitLens: "Compare
  with…") is easier to read than the terminal. `git diff --stat` first gives the file list, a good
  overview before the details.
- **Big diffs need a guide.** Stage 07 is large, so walk through it commit by commit (07a–07f) with
  `git show`, as lesson 07 suggests, not all at once.

---

## Part 2 — Should students work on `main`, or on their own branch?

Have them work on **their own branches**, not on `main` and not on the `teach/...` branches. They can't
harm the instructor's repo either way: a clone is a private copy, and Gitea won't accept their pushes
unless they're given write access. So the reason isn't protecting the repo. It's keeping **their own
copy** easy to update.

### Why not `main` or the `teach/...` branches?

- **Instructor updates would collide with their commits.** `main` keeps changing (the ladder merge, the
  client series, fixes). If students commit on `main`, their next `git pull` hits the "divergent
  branches" situation (the same one met on the bridge machine on 2026-10-02), and beginners get stuck
  there.
- **The `teach/...` branches may be rewritten.** If a stage is fixed and force-pushed, a student who
  committed on that branch gets conflicts or confusing errors when pulling.
- **Their own branches are never touched by instructor pushes.** `git fetch` brings in the changes, and
  their work stays exactly as they left it.

### Suggested routine: one branch per lesson, starting from the previous stage

To do lesson 05, start where stage 04 ends:
```
git fetch origin
git switch -c my/05-delete origin/teach/ch03-server-04-read-one
```
Then write the code, commit as often as they like, and compare with the instructor's version:
```
git diff origin/teach/ch03-server-05-delete -- .
```
For the next lesson, start fresh from the instructor's stage 05, so a mistake in their lesson 05 doesn't
carry into lesson 06:
```
git switch -c my/06-update origin/teach/ch03-server-05-delete
```

The `my/` prefix keeps their branches visibly separate from the instructor's.

### If they need to hand in work or save it online

Give each student their own repo: a **fork on Gitea**, or a personal repo they add as a second remote
(`git remote add mine <url>`). They push their `my/...` branches there; the course repo stays read-only
for them. The instructor can then look at a student's branch or diff it against a stage.

### Two rules worth stating on day one

1. Never commit `.env` (the root `.gitignore` now covers it).
2. `git fetch` is always safe. `git pull` only on a branch they haven't committed to.
