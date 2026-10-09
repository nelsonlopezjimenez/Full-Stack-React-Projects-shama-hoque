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
`git diff upstream/teach/ch00-ttt-07-taking-turns upstream/teach/ch00-ttt-08-winner -- . ":!package-lock.json"`
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
- An account on the course Gitea server, http://192.168.1.28:3000 (on the classroom network: your
  computer must be connected to it)

---

## ⌨️ Typo-proof your terminal: let the computer spell for you

> [!IMPORTANT]
> ### Don't type long names. Press **Tab**.
>
> Most git errors are not git problems; they are one wrong letter: `get` instead of `git`,
> `upsteam` instead of `upstream`, `ch03-sever-05` instead of `ch03-server-05`. Professionals don't
> spell these by hand. They let the terminal do it.
>
> #### 1. Tab completion
>
> Type the first few letters and press **Tab**. Press **Tab** twice to see all choices.
>
> ```
> git fetch ups<Tab>                         →  git fetch upstream
> git diff upstream/teach/ch03-server-0<Tab><Tab>   (lists every stage)
> ```
>
> - **Git Bash** and the VS Code terminal with Git Bash: works out of the box.
> - **PowerShell**: install **posh-git** once, then open a new terminal:
>
>   ```powershell
>   Install-Module posh-git -Scope CurrentUser
>   Add-PoshGitToProfile
>   ```
>
> #### 2. Let git fix its own commands (once)
>
> ```bash
> git config --global help.autocorrect prompt
> ```
>
> Now `git comit` or `git fecth` asks *"Did you mean `commit`?"*. Answer `y`.
>
> #### 3. Copy, don't retype
>
> - **Copy** commands and addresses from this guide (the copy button on each code box).
> - Press **↑** (up arrow) to bring back a command you already typed correctly.
>
> #### 4. Check before you go on
>
> | After you…             | Run                          | Look for                        |
> |------------------------|------------------------------|---------------------------------|
> | add a remote           | `git remote -v`              | `origin` and `upstream`, spelled right |
> | switch or create a branch | `git branch --show-current` | the exact name you meant       |
> | anything else          | `git status`                 | no surprises                    |
>
> #### 5. Read the first word of the error
>
> `'get' is not recognized` or `get: command not found` means the **first word** is misspelled.
> `'upsteam' does not appear to be a git repository` means the **remote name** is misspelled.
> Compare it letter by letter with the command in this guide.
> For any other error, see [Reading error messages](reading-error-messages.md): read from the top,
> fix the first error, run again.
>
> **Tip:** keep a short list of the words *you* tend to mistype (`git`, `upstream`, `server`, your user
> name…) and check those words before pressing **Enter**.

---

## 2. Get the code (once): fork, clone, add `upstream`

This is the usual way to work on a project you can't change yourself, on Gitea, GitHub and everywhere
else. There are two repositories online and one on your computer:

```
course repository   http://192.168.1.28:3000/s888888/Full-Stack-React-Projects-shama-hoque
   │                read only for you; the instructor adds new stages here   → remote "upstream"
   │ Fork
your fork           http://192.168.1.28:3000/<your user name>/Full-Stack-React-Projects-shama-hoque
   │                yours: you push your work here                            → remote "origin"
   │ clone
your computer
```

**1. Fork.** Sign in at http://192.168.1.28:3000, open the
[course repository](http://192.168.1.28:3000/s888888/Full-Stack-React-Projects-shama-hoque) and click
**Fork**. Gitea makes a copy under your own user name.

**2. Clone your fork** (not the course repository):

```bash
git clone http://192.168.1.28:3000/<your user name>/Full-Stack-React-Projects-shama-hoque.git
cd Full-Stack-React-Projects-shama-hoque
```

Your clone calls your fork `origin`.

**3. Connect the course repository as `upstream`:**

```bash
git remote add upstream http://192.168.1.28:3000/s888888/Full-Stack-React-Projects-shama-hoque.git
git fetch upstream
git remote -v
```

`git remote -v` must now list `origin` (your fork) and `upstream` (the course repository).

**Why `upstream` and not `origin` for the stages?** A fork is a copy made **once**, at the moment you
click Fork. When the instructor adds new stages or fixes old ones, your fork does not get them, and
Gitea's "Sync" button only updates branches your fork already has, one at a time. `git fetch upstream`
always gets the newest stages straight from the course repository. So in this guide:

- **stages** (`teach/...`) always come from **`upstream`**,
- **your work** (`my/...`) always goes to **`origin`**.

Your fork also holds old copies of the `teach/...` branches from the day you forked. Ignore them (or
delete them, see section 9). Never use `origin/teach/...`.

---

## 3. Look at a stage

```bash
git fetch upstream
git switch --detach upstream/teach/ch03-server-05-delete
cd "Chapter03 and 04/mern-skeleton/server"
npm install
npm run dev
```

- `git fetch upstream` downloads the newest stages. It's always safe to run.
- `--detach` means "just look". You're not on any branch, so you can't break anything.
- Run `npm install` **every time you switch stages**: some stages add new packages.
- From stage 07 on, the server reads its settings from a `.env` file. Create it once:
  `cp .env.example .env` (PowerShell: `Copy-Item .env.example .env`). It's never committed.

The folder name has spaces, so keep the quotes in `"Chapter03 and 04/..."`.

You can also browse the stages in the browser: open the
[course repository](http://192.168.1.28:3000/s888888/Full-Stack-React-Projects-shama-hoque) and pick a
branch.

---

## 4. See what a lesson changed: the diff

A **diff** shows only the lines a lesson added or removed, in the place where they go. It's the
fastest way to see "what is today's lesson".

From inside the `server` folder:

```bash
git diff upstream/teach/ch03-server-04-read-one upstream/teach/ch03-server-05-delete -- . ":!package-lock.json"
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
  git log --oneline upstream/teach/ch03-server-06-update..upstream/teach/ch03-server-07-split
  git show <commit id>
  ```

---

## 5. Do a lesson yourself: your own branch

**Always work on your own branch.** Don't commit on `main` or on the `teach/...` branches. Your
instructor keeps updating those, and your commits would collide with the updates.

To do lesson 05, start from where stage **04** ends and give your branch a name starting with `my/`:

```bash
git fetch upstream
git switch --no-track -c my/05-delete upstream/teach/ch03-server-04-read-one
```

`--no-track` keeps your branch apart from the instructor's stage: it starts there, but it belongs to
you, and you push it to your fork (section 6).

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
   git diff upstream/teach/ch03-server-05-delete -- . ":!package-lock.json"
   ```
   `-` lines are in the instructor's version but missing in yours. `+` lines are in yours but not in the
   instructor's. They aren't always mistakes: there's often more than one right answer.

For the **next** lesson, start again from the instructor's stage, not from your own branch. That way a
mistake in lesson 05 doesn't follow you into lesson 06:

```bash
git switch --no-track -c my/06-update upstream/teach/ch03-server-05-delete
```

Your `my/...` branches are never changed by the instructor's updates.

---

## 6. Save your work online or hand it in

Your commits are only on your computer until you push them to **your fork**. The first time you push a
branch, add `-u`; after that, `git push` alone is enough for that branch:

```bash
git push -u origin my/05-delete
# later, on the same branch:
git push
```

Your branch now appears in your fork in the browser. Hand it in as your instructor tells you, for example
by sending the link to the branch.

You can't push to the course repository (`upstream`). That's normal: it's read only for you.

**Pull requests.** In open-source projects, a fork is also how you *propose* a change: you push a branch to
your fork and open a **pull request** from it to the original repository. In this course, open one only
when your instructor asks for it.

---

## 7. Rules

1. **Never commit `.env`.** It holds passwords and secrets. Git already ignores it; don't force it in.
2. **`git fetch upstream` is always safe.** Use `git pull` only on a branch you have not committed to.
3. **Stages from `upstream`, your work to `origin`.** Never use `origin/teach/...`: those are old copies.
4. **Work on `my/...` branches only.**
5. Run `npm install` after switching stages.

---

## 8. When something goes wrong

First, read the error **from the top** and fix only the **first** one: see
[Reading error messages](reading-error-messages.md).

| You see | Why | Fix |
|---|---|---|
| `'get' is not recognized`, `command not found`, `'upsteam' does not appear to be a git repository`, `is not a git command` | A typo: one letter wrong or missing | Compare letter by letter with this guide; use **Tab** (see *Typo-proof your terminal*) |
| `fatal: bad revision 'teach/ch03-server-02-...'` | Only branches you switched to exist under the short name | Put `upstream/` in front: `upstream/teach/ch03-server-02-...` |
| `fatal: bad revision 'upstream/teach/...'` or `'upstream' does not appear to be a git repository` | `upstream` is not connected yet, or not fetched | Section 2, step 3: `git remote add upstream …`, then `git fetch upstream` |
| A stage is **missing** under `origin/teach/...`, or looks older than the lesson | Your fork is a copy from the day you forked | Use `upstream/teach/...` |
| The diff is **empty** | The path at the end is wrong for the folder you're in | `-- .` inside `server`, `-- server` inside `mern-skeleton` |
| `Your local changes ... would be overwritten by checkout` | You have unsaved edits | Commit them on your `my/...` branch (or `git stash`), then switch |
| `fatal: The upstream branch of your current branch does not match the name of your current branch` | The branch was made without `--no-track`, so it follows the instructor's stage | `git push -u origin my/05-delete` (with your branch name) |
| `403`, `permission denied` or `User permission denied for writing` when pushing | You pushed to the course repository | Push to your fork: `git push -u origin my/...` |
| `Cannot find package 'mongoose'` (or another package) | The new stage needs a package you don't have yet | `npm install` |
| `Unable to connect to database` | MongoDB isn't running, or the address in `.env` is wrong | Start MongoDB; check `MONGODB_URI` in `.env` |
| `EADDRINUSE` | Another server already uses port 3000 | Stop the other one, or set `PORT=3001` in `.env` (and in `api.http`) |
| `Need to specify how to reconcile divergent branches` | You committed on a branch that was also updated by the instructor | Ask your instructor. Next time, work on a `my/...` branch |

---

## 9. Already set up differently?

Check with `git remote -v`.

**You cloned your fork, but have no `upstream`:** do section 2, step 3. Your `my/...` branches stay as
they are.

**You cloned the course repository directly** (`origin` points to `…/s888888/…`), maybe with your fork as
a remote called `mine`: rename the remotes once, so they match this guide.

```bash
git remote rename origin upstream
git remote rename mine origin
git fetch upstream
git remote -v
```

If you have no `mine` remote, add your fork instead of the second line:
`git remote add origin http://192.168.1.28:3000/<your user name>/Full-Stack-React-Projects-shama-hoque.git`.
Your commits and `my/...` branches are not touched; only the names of the remotes change.

**Old `teach/...` branches in your fork** (optional clean-up). They are copies from the day you forked and
never get updated. You may delete them, after checking that you never committed on them. For each one,
this must print nothing:

```bash
git log --oneline upstream/teach/ch03-server-05-delete..origin/teach/ch03-server-05-delete
```

If it prints commits, either they are yours, or the instructor fixed that stage after you forked: ask
before deleting. Then delete them in Gitea (your fork → **Branches** → trash icon) or with
`git push origin --delete teach/ch03-server-05-delete`, and run `git fetch --prune origin`. Keep `main`.

**The newest version of this guide** is always in the course repository: open it in Gitea (branch `main`),
or in the terminal: `git show upstream/main:instructions/working-with-the-lesson-stages.md`.
