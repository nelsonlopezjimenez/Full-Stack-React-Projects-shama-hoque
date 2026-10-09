# Working with the lesson stages

The server of Chapter 3 is built in **19 stages**, from an empty folder to a finished, secure API.
Each stage is a **branch** in this repository, and each one adds a single idea to the stage before it:

```
teach/ch03-server-01-hello
teach/ch03-server-02-memory-users
...
teach/ch03-server-19-tests
```

Every stage has a lesson note in `Chapter03 and 04/mern-skeleton/server/lessons/` that explains what's new,
what to try, and an exercise.

The React client (Chapter 4) continues on top of the last server stage, in **16 more stages**:

```
teach/ch03-client-01-hello
...
teach/ch03-client-16-tests
```

Their notes are in `Chapter03 and 04/mern-skeleton/client/lessons/`. Everything below works the same way
for them: replace `server` with `client` in the branch names. To run a client stage, start the server
(`cd server && npm run dev`) and then the client (`cd client && npm install && npm run dev`) in a
second terminal.

**New to React? Start with Tic-Tac-Toe.** React's official tutorial,
[Tutorial: Tic-Tac-Toe](https://react.dev/learn/tutorial-tic-tac-toe), is built in **15 stages**, one
per section of the tutorial (stages 14 and 15 come after it: one file per component, and tests):

```
teach/ch00-ttt-01-setup
...
teach/ch00-ttt-15-tests
```

It needs only Node.js: no server, no MongoDB. Its folder is `Chapter00/tic-tac-toe` (no spaces) and its
notes are in `Chapter00/tic-tac-toe/lessons/`. To run a stage:

```bash
cd Chapter00/tic-tac-toe
npm install
npm run dev
```

Everything below works the same way: use
`teach/ch00-ttt-…` branch names and `Chapter00/tic-tac-toe` instead of the server folder, for example
`git diff origin/teach/ch00-ttt-07-taking-turns origin/teach/ch00-ttt-08-winner -- . ":!package-lock.json"`
from inside `Chapter00/tic-tac-toe`.

These instructions show you how to get the code, how to see what each lesson changed, and how to do
the lessons yourself **without ever getting stuck with git**.

---

## 1. Before you start

You need:

- **Git** — `git --version`
- **Node.js 22.9 or newer** — `node -v`
- **MongoDB** running on your computer (from stage 03 on)
- **VS Code** with the **REST Client** extension (`humao.rest-client`) to send the requests in `api.http`

---

## 2. Get the code (once)

```bash
git clone http://192.168.1.28:3000/s888888/Full-Stack-React-Projects-shama-hoque.git
cd Full-Stack-React-Projects-shama-hoque
```

The course server is on the classroom network: your computer must be connected to it.
You can also browse the repository, its branches and its files in the browser:
http://192.168.1.28:3000/s888888/Full-Stack-React-Projects-shama-hoque

That's your own private copy. Nothing you do in it can change the course repository.

---

## 3. Look at a stage

```bash
git fetch origin
git switch --detach origin/teach/ch03-server-05-delete
cd "Chapter03 and 04/mern-skeleton/server"
npm install
npm run dev
```

- `git fetch origin` downloads the newest stages. It's always safe to run.
- `--detach` means "just look". You're not on any branch, so you can't break anything.
- Run `npm install` **every time you switch stages**: some stages add new packages.
- From stage 07 on, the server reads its settings from a `.env` file. Create it once:
  `cp .env.example .env` (PowerShell: `Copy-Item .env.example .env`). It's never committed.

The folder name has spaces, so keep the quotes in `"Chapter03 and 04/..."`.

---

## 4. See what a lesson changed: the diff

A **diff** shows only the lines a lesson added or removed, in the place where they go. It's the
fastest way to see "what is today's lesson".

From inside the `server` folder:

```bash
git diff origin/teach/ch03-server-04-read-one origin/teach/ch03-server-05-delete -- . ":!package-lock.json"
```

- The first name is the **older** stage, the second the **newer** one.
- `-- .` means "only this folder". (From the `mern-skeleton` folder, write `-- server` instead.)
- `":!package-lock.json"` hides a long automatic file that is not part of the lesson.

**Reading a diff:**

```diff
@@ -102,6 +102,19 @@ app.get('/api/users/:userId', async (req, res) => {
   res.json(user)          ← unchanged line (context)
 })
+                          ← line added in this lesson (green, starts with +)
+// Delete one user
+app.delete('/api/users/:userId', async (req, res) => {
-  old line               ← line removed in this lesson (red, starts with -)
```

- `+` lines are new, and `-` lines were removed. Lines without a sign are context, shown to help you find
  the place.
- `@@ -102,6 +102,19 @@` says where in the file this piece is (around line 102).

**Tips:**

- Start with the file list: add `--stat` to see which files changed and how much.
- VS Code shows diffs side by side, which is easier to read: in the Source Control view, or with the GitLens
  extension ("Compare References…").
- Stage 07 is a big refactor made of six small commits. Look at them one at a time:
  ```bash
  git log --oneline origin/teach/ch03-server-06-update..origin/teach/ch03-server-07-split
  git show <commit id>
  ```

---

## 5. Do a lesson yourself: your own branch

**Always work on your own branch.** Don't commit on `main` or on the `teach/...` branches. Your
instructor keeps updating those, and your commits would collide with the updates the next time you pull.

To do lesson 05, start from where stage **04** ends and give your branch a name starting with `my/`:

```bash
git fetch origin
git switch -c my/05-delete origin/teach/ch03-server-04-read-one
```

1. Read `server/lessons/05-delete.md`.
2. Write the code yourself.
3. Test it with `api.http`.
4. Save your work as often as you like:
   ```bash
   git add .
   git commit -m "lesson 05: delete route"
   ```
5. Compare with the instructor's version:
   ```bash
   git diff origin/teach/ch03-server-05-delete -- . ":!package-lock.json"
   ```
   `-` lines are in the instructor's version but missing in yours. `+` lines are in yours but not in the
   instructor's. They aren't always mistakes: there's often more than one right answer.

For the **next** lesson, start again from the instructor's stage, not from your own branch. That way a
mistake in lesson 05 doesn't follow you into lesson 06:

```bash
git switch -c my/06-update origin/teach/ch03-server-05-delete
```

Your `my/...` branches are never changed by the instructor's updates.

---

## 6. Save your work online or hand it in

Your clone is only on your computer. To keep it online, or to hand it in, use **your own repository**
on the course Gitea server, as your instructor tells you. The easiest way is a **fork**: sign in at
http://192.168.1.28:3000, open the course repository, and click **Fork**. Gitea makes a copy under your
own user name, e.g. `http://192.168.1.28:3000/<your user name>/Full-Stack-React-Projects-shama-hoque.git`.

Then connect your clone to it once, and push your branches there:

```bash
git remote add mine http://192.168.1.28:3000/<your user name>/Full-Stack-React-Projects-shama-hoque.git
git push mine my/05-delete
```

The course repository stays read-only for you. That's normal.

---

## 7. Rules

1. **Never commit `.env`.** It holds passwords and secrets. Git already ignores it; don't force it in.
2. **`git fetch` is always safe.** Use `git pull` only on a branch you have not committed to.
3. **Work on `my/...` branches only.**
4. Run `npm install` after switching stages.

---

## 8. When something goes wrong

| You see | Why | Fix |
|---|---|---|
| `fatal: bad revision 'teach/ch03-server-02-...'` | Only branches you switched to exist under the short name | Put `origin/` in front: `origin/teach/ch03-server-02-...` |
| The diff is **empty** | The path at the end is wrong for the folder you're in | `-- .` inside `server`, `-- server` inside `mern-skeleton` |
| `Your local changes ... would be overwritten by checkout` | You have unsaved edits | Commit them on your `my/...` branch (or `git stash`), then switch |
| `Cannot find package 'mongoose'` (or another package) | The new stage needs a package you don't have yet | `npm install` |
| `Unable to connect to database` | MongoDB isn't running, or the address in `.env` is wrong | Start MongoDB; check `MONGODB_URI` in `.env` |
| `EADDRINUSE` | Another server already uses port 3000 | Stop the other one, or set `PORT=3001` in `.env` (and in `api.http`) |
| `Need to specify how to reconcile divergent branches` | You committed on a branch that was also updated by the instructor | Ask your instructor. Next time, work on a `my/...` branch |
