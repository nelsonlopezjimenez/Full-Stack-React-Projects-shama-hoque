# Git diff with a tiny Reddit-style Express server

In this lesson you build a very small Express server, one route at a time.
After every change you ask Git **"what did I just change?"** with `git diff`.
The server is the excuse. The main topic is reading diffs.

What you will practice:

- `diff` and `diff -u` (the plain tool that Git's diff is based on)
- `git init` and a `.gitignore` that keeps `node_modules/` out of the repo
- `git diff`, `git diff --staged`, `git diff --stat`, `git diff --word-diff`
- comparing commits: `git diff HEAD~1`, `git diff <commit> <commit>`, `git log -p`
- undoing a change you saw in the diff: `git restore`
- Express routes with **route parameters** (`/r/:topic`) and how to read them from `req.params`

Requirements: Node.js 20 or newer (`node -v`), Git (`git --version`), a terminal (Git Bash on Windows) and a browser.

> Every output shown below is real. It was copied from a run of these exact steps.
> Your commit hashes (like `1e0bb2a`) and dates will be different. That is normal.

---

## Part 0. What is a diff?

A **diff** is a list of the differences between two versions of a text file.
Git did not invent it. Unix has had the `diff` command since the 1970s, and Git Bash includes it.

Make two small files somewhere outside any project:

```bash
mkdir diff-playground && cd diff-playground
printf 'r/cats\nr/dogs\nr/javascript\n' > subs-v1.txt
printf 'r/cats\nr/javascript\nr/node\n' > subs-v2.txt
```

Version 1 has `cats, dogs, javascript`. Version 2 removed `dogs` and added `node`.

### The classic format

```bash
diff subs-v1.txt subs-v2.txt
```

```text
2d1
< r/dogs
3a3
> r/node
```

Read it as instructions to turn the **left** file into the **right** file:

- `2d1`: **d**elete line 2 of the left file (`<` means "from the left file")
- `3a3`: after line 3 of the left file, **a**dd line 3 of the right file (`>` means "from the right file")

It is correct, but hard to read. Nobody uses it for code reviews.

### The unified format (the one Git uses)

```bash
diff -u subs-v1.txt subs-v2.txt
```

```diff
--- subs-v1.txt	2026-10-05 05:05:38.042204800 -0700
+++ subs-v2.txt	2026-10-05 05:05:38.043638500 -0700
@@ -1,3 +1,3 @@
 r/cats
-r/dogs
 r/javascript
+r/node
```

| Part | Meaning |
|---|---|
| `--- subs-v1.txt` | the **old** version (marked with `-`) |
| `+++ subs-v2.txt` | the **new** version (marked with `+`) |
| `@@ -1,3 +1,3 @@` | a **hunk header**: "in the old file, starting at line 1, 3 lines; in the new file, starting at line 1, 3 lines" |
| line starting with a space | **context**: unchanged, shown so you know where you are |
| line starting with `-` | removed |
| line starting with `+` | added |

Learn this format once and you can read diffs in Git, GitHub, Gitea, VS Code and code reviews.

> [BEGINNER] A changed line is shown as one `-` line (the old text) followed by one `+` line (the new text).
> Diff tools do not have a "modified" marker. A change is always "remove the old line, add the new one".

---

## Part 1. Create the project and the Git repo

```bash
mkdir reddit-routes && cd reddit-routes
git init -b main
```

`git init` creates a hidden `.git/` folder. That folder **is** the repository: every commit and every branch lives in it.
`-b main` names the first branch `main`.

Now create `package.json` and install Express:

```bash
npm init -y
npm install express
```

`npm init` asks questions (name, version, entry point...). `-y` accepts all the defaults.
If you prefer to answer the questions, type `app.js` when it asks for the **entry point**.

Two small changes to `package.json`. You can edit the file by hand, or run:

```bash
npm pkg set main=app.js type=module
npm pkg set scripts.start="node app.js" scripts.dev="node --watch app.js"
```

- `"type": "module"` lets us write `import express from 'express'` (modern JavaScript modules) instead of `require`.
- `npm run dev` uses `node --watch`, which restarts the server every time you save. No `nodemon` needed.

The important part of `package.json` now looks like this:

```json
{
  "name": "reddit-routes",
  "main": "app.js",
  "type": "module",
  "scripts": {
    "start": "node app.js",
    "dev": "node --watch app.js"
  },
  "dependencies": {
    "express": "^5.2.1"
  }
}
```

### Why `.gitignore` matters: the `node_modules/` folder

Ask Git what it sees:

```bash
git status
```

```text
Untracked files:
  (use "git add <file>..." to include in what will be committed)
	node_modules/
	package-lock.json
	package.json
```

`node_modules/` is where npm downloaded Express **and everything Express depends on**.
We installed one package, but look inside:

```bash
ls node_modules | wc -l           # 65 packages
find node_modules -type f | wc -l # 601 files
```

A React project usually has hundreds of packages and tens of thousands of files.

**Never commit `node_modules/`.** The reasons:

1. **It can be rebuilt.** `package.json` lists what you need and `package-lock.json` records the exact versions.
   Anyone who clones the repo runs `npm install` (or `npm ci`) and gets the same folder.
2. **It is huge.** Thousands of files make every clone, push and pull slow. Git keeps every committed file in history **forever**: deleting the folder later does not shrink the repo.
3. **It ruins your diffs.** One `npm install` can change thousands of files. Your three-line change would be buried in that noise, and `git diff` (this lesson's topic) becomes useless.
4. **It can be different on each computer.** Some packages download or compile files for one operating system. A `node_modules/` made on Windows may break on a Mac or on the Linux server.

The fix is a `.gitignore` file in the project root. It lists names or patterns that Git should **pretend not to see**:

```bash
cat > .gitignore << 'EOF'
node_modules/
.env
.DS_Store
npm-debug.log*
EOF
```

| Line | Why |
|---|---|
| `node_modules/` | rebuilt by `npm install`, see above |
| `.env` | holds secrets (passwords, API keys). Never put secrets in a repo |
| `.DS_Store` | junk file that macOS Finder creates in every folder |
| `npm-debug.log*` | log files npm writes when something fails |

Check again:

```bash
git status --short
```

```text
?? .gitignore
?? package-lock.json
?? package.json
```

`node_modules/` is gone from the list. **Do commit** `package-lock.json`: it is how everyone gets the same versions.

> [BEGINNER] Create `.gitignore` **before** your first `git add .`.
> `.gitignore` only hides files Git is not tracking yet. If `node_modules/` was already committed, adding it to `.gitignore` does nothing until you run `git rm -r --cached node_modules` and commit.

First commit:

```bash
git add .
git commit -m "chore: init project with express and .gitignore"
```

> [BEGINNER] On Windows you may see `warning: in the working copy of 'package.json', LF will be replaced by CRLF the next time Git touches it`.
> It is only a warning about line endings (Windows ends lines with CRLF, Linux and macOS with LF). It is safe to ignore in this lesson.

---

## Part 2. The first route

Create `app.js`:

```js
import express from 'express'

const app = express()
const PORT = process.env.PORT ?? 3000

app.get('/', (req, res) => {
  res.send('<h1>Welcome to the front page of the internet</h1>')
})

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`)
})
```

Run it with `npm run dev` and open <http://localhost:3000>. Stop it later with `Ctrl+C`.

Now try `git diff`:

```bash
git diff
```

It prints **nothing**. Look at `git status --short`:

```text
?? app.js
```

`??` means **untracked**: Git has never seen this file, so it has no old version to compare with.

> [BEGINNER] `git diff` only shows changes to files Git already tracks. A brand new file appears in the diff only after `git add` (with `git diff --staged`, see Part 3).

```bash
git add app.js
git commit -m "feat: add home route"
```

---

## Part 3. A route with a parameter: `/r/:topic`

On Reddit, `reddit.com/r/cats` and `reddit.com/r/javascript` are not two separate HTML files somebody wrote by hand.
There is **one** route that reads the topic name from the URL.
In Express, a part of the path that starts with `:` is a **route parameter**:

```text
route pattern:   /r/:topic
URL visited:     /r/cats
req.params:      { topic: 'cats' }
```

Add this route **above** `app.listen`:

```js
app.get('/r/:topic', (req, res) => {
  const { topic } = req.params
  res.send(`<h1>Welcome to r/${topic}</h1>`)
})
```

> [BEGINNER] `const { topic } = req.params` is **destructuring**. It is the same as `const topic = req.params.topic`.
> The backticks make a **template literal**: `${topic}` puts the value of `topic` into the string.

Visit <http://localhost:3000/r/cats>, then `/r/javascript`, then `/r/anything-you-like`. One route, any number of pages.

### Your first `git diff`

Save the file (do **not** run `git add` yet) and run:

```bash
git diff
```

```diff
diff --git a/app.js b/app.js
index a5b509b..1e0bb2a 100644
--- a/app.js
+++ b/app.js
@@ -7,6 +7,11 @@ app.get('/', (req, res) => {
   res.send('<h1>Welcome to the front page of the internet</h1>')
 })
 
+app.get('/r/:topic', (req, res) => {
+  const { topic } = req.params
+  res.send(`<h1>Welcome to r/${topic}</h1>`)
+})
+
 app.listen(PORT, () => {
   console.log(`Server listening on http://localhost:${PORT}`)
 })
```

Compare it with Part 0. It is the same unified format, plus a few Git extras:

| Part | Meaning |
|---|---|
| `diff --git a/app.js b/app.js` | which file. `a/` is the old version, `b/` the new one |
| `index a5b509b..1e0bb2a 100644` | short IDs of the old and new file contents, and the file mode (`100644` = normal file) |
| `@@ -7,6 +7,11 @@` | old: 6 lines from line 7. New: 11 lines from line 7. So 5 lines were added |
| `app.get('/', (req, res) => {` after `@@` | Git shows the nearest function-like line above the hunk, to help you find your place |

Only the 5 `+` lines are new. The 3 lines above and below are context.

Want just a summary?

```bash
git diff --stat
```

```text
 app.js | 5 +++++
 1 file changed, 5 insertions(+)
```

### The staging area: `git diff` vs `git diff --staged`

Git has **three places** a change can be:

```text
working directory  --git add-->  staging area  --git commit-->  repository (history)
  (your files)                    ("index")                      (commits)
        \___ git diff ___/              \___ git diff --staged ___/
```

- `git diff`: working directory vs staging area. "What did I change that I have **not** added yet?"
- `git diff --staged` (same as `--cached`): staging area vs last commit. "What will my **next commit** contain?"

Try it:

```bash
git add app.js
git diff            # prints nothing: everything is already staged
git diff --staged   # prints the same 5 + lines you saw above
```

> [BEGINNER] Make it a habit: run `git diff --staged` right before every `git commit`. It is your last chance to catch a `console.log`, a typo, or a file you did not mean to include.

```bash
git commit -m "feat: add /r/:topic route"
```

---

## Part 4. Two parameters: `/r/:topic/comments/:comment`

Reddit puts comments under a topic: `/r/cats/comments/...`.
A route can mix **fixed** parts (`r`, `comments`) and **parameters** (`:topic`, `:comment`):

```text
route pattern:   /r/:topic/comments/:comment
URL visited:     /r/cats/comments/naps
req.params:      { topic: 'cats', comment: 'naps' }
```

Add, below the `/r/:topic` route:

```js
app.get('/r/:topic/comments/:comment', (req, res) => {
  const { topic, comment } = req.params
  res.send(`
    <h1>r/${topic}</h1>
    <p>Please add your comment about <strong>${comment}</strong></p>
  `)
})
```

Visit <http://localhost:3000/r/cats/comments/naps>.

```bash
git diff
```

```diff
@@ -12,6 +12,14 @@ app.get('/r/:topic', (req, res) => {
   res.send(`<h1>Welcome to r/${topic}</h1>`)
 })
 
+app.get('/r/:topic/comments/:comment', (req, res) => {
+  const { topic, comment } = req.params
+  res.send(`
+    <h1>r/${topic}</h1>
+    <p>Please add your comment about <strong>${comment}</strong></p>
+  `)
+})
+
 app.listen(PORT, () => {
```

(From now on the four header lines `diff --git`, `index`, `---`, `+++` are left out. They look like the ones in Part 3.)

Question: the hunk header says `-12,6 +12,14`. How many lines did you add? (14 - 6 = 8.)

`git commit -a` stages every change to files Git **already tracks** and commits, in one step. It does not add new files.

```bash
git commit -am "feat: add /r/:topic/comments/:comment route"
```

---

## Part 5. Changing a line (not only adding)

So far every diff only added lines. Now change the existing `/r/:topic` response:

```js
  res.send(`<h1>Welcome to r/${topic}!</h1><p>Posts about ${topic} will appear here.</p>`)
```

```bash
git diff
```

```diff
@@ -9,7 +9,7 @@ app.get('/', (req, res) => {
 
 app.get('/r/:topic', (req, res) => {
   const { topic } = req.params
-  res.send(`<h1>Welcome to r/${topic}</h1>`)
+  res.send(`<h1>Welcome to r/${topic}!</h1><p>Posts about ${topic} will appear here.</p>`)
 })
 
 app.get('/r/:topic/comments/:comment', (req, res) => {
```

One `-` line, one `+` line: that is how a diff shows a **changed line**. `-9,7 +9,7` means the line count did not change.

When the line is long, it is hard to spot what changed. Ask for a **word diff**:

```bash
git diff --word-diff
```

```text
  res.send(`<h1>Welcome to [-r/${topic}</h1>`)-]{+r/${topic}!</h1><p>Posts about ${topic} will appear here.</p>`)+}
```

`[-...-]` was removed and `{+...+}` was added, inside the same line.

> [ADVANCED] `git diff --color-words` shows the same thing using colors instead of brackets. It is nicer in a terminal, but the brackets survive copy and paste into a document.

```bash
git commit -am "feat: describe the topic page"
```

---

## Part 6. Oops: use the diff to catch a mistake, then undo it

Pretend you made a typo and removed the `:` from the route:

```js
app.get('/r/topic', (req, res) => {
```

The server still starts, but `/r/cats` now gives a "Cannot GET" error. Before you start hunting through the code, ask Git:

```bash
git diff
```

```diff
@@ -7,7 +7,7 @@ app.get('/', (req, res) => {
   res.send('<h1>Welcome to the front page of the internet</h1>')
 })
 
-app.get('/r/:topic', (req, res) => {
+app.get('/r/topic', (req, res) => {
   const { topic } = req.params
   res.send(`<h1>Welcome to r/${topic}!</h1><p>Posts about ${topic} will appear here.</p>`)
 })
```

The diff points straight at the bug. Without the colon, `topic` is a **fixed** word: the route only matches the exact URL `/r/topic`.

Throw away every unstaged change to the file and go back to the last commit:

```bash
git restore app.js
git diff           # nothing: the file matches the last commit again
```

> [BEGINNER] `git restore` **deletes your uncommitted changes to that file** and you cannot get them back. Read the `git diff` first, then restore.

---

## Part 7. A 404 page for every other URL

Visit <http://localhost:3000/nope>. Express answers `Cannot GET /nope`. Let's write our own message.

Add this **after all routes** and **before** `app.listen`:

```js
// Runs only when no route above matched
app.use((req, res) => {
  res.status(404).send('<h1>404</h1><p>Sorry, this page does not exist. Try r/javascript</p>')
})
```

Express checks routes **from top to bottom** and stops at the first one that sends a response.
`app.use` with no path matches every request, so it must be last. If you put it first, every page would be a 404.

> [ADVANCED] Older tutorials (and the book) write `app.get('*', ...)` for this.
> In Express 5 the server crashes on start with `Missing parameter name at index 1: *`, because Express 5 uses a newer, stricter path parser.
> `app.use((req, res) => ...)` at the end works in every Express version.
> If you really need a "match everything" route in Express 5, write `app.get('/*splat', ...)`.

Try `/nope`, `/r` (no topic) and `/r/cats/comments` (no comment). All three get the 404 page, because none of them matches a route pattern completely.

```bash
git diff
```

```diff
@@ -20,6 +20,11 @@ app.get('/r/:topic/comments/:comment', (req, res) => {
   `)
 })
 
+// Runs only when no route above matched
+app.use((req, res) => {
+  res.status(404).send('<h1>404</h1><p>Sorry, this page does not exist. Try r/javascript</p>')
+})
+
 app.listen(PORT, () => {
```

```bash
git commit -am "feat: add 404 handler"
```

---

## Part 8. Comparing commits (looking back in history)

Your history so far:

```bash
git log --oneline
```

```text
7d40149 feat: add 404 handler
1e9f6ee feat: describe the topic page
15bf016 feat: add /r/:topic/comments/:comment route
d898717 feat: add /r/:topic route
73b42c1 feat: add home route
041eec2 chore: init project with express and .gitignore
```

`git diff` can compare **any two versions**, not only "now vs last commit".

| Command | Compares |
|---|---|
| `git diff HEAD` | your files (staged and unstaged) vs the last commit |
| `git diff HEAD~1` | your files vs the commit **before** the last one |
| `git diff HEAD~2 --stat` | summary of everything changed in the last 2 commits |
| `git diff d898717 7d40149` | commit `d898717` vs commit `7d40149` (use your own hashes) |
| `git diff d898717 7d40149 -- app.js` | the same, only for `app.js` |
| `git diff HEAD~4 HEAD --name-only` | only the names of the files that changed |
| `git show 1e9f6ee` | one commit: its message **and** its diff |
| `git log -p` | the whole history, each commit followed by its diff (press `q` to quit) |

`HEAD` is the commit you are on now. `HEAD~1` is its parent, `HEAD~2` its grandparent, and so on.

```bash
git diff HEAD~2 --stat
```

```text
 app.js | 7 ++++++-
 1 file changed, 6 insertions(+), 1 deletion(-)
```

The last two commits: the 404 handler (5 lines added) and the changed topic line (1 removed, 1 added). 5 + 1 = 6 insertions, 1 deletion.

> [BEGINNER] Order matters. `git diff A B` shows how to get **from A to B**. Swap them and every `+` becomes `-`.

---

## Part 9 (optional). Escaping user input, a security fix in a diff

Route parameters come from the URL, and **anyone can type any URL**. Try:

```text
http://localhost:3000/r/x/comments/<script>alert(1)</script>
```

Our code puts `comment` straight into the HTML, so the browser **runs** that script.
This is called **cross-site scripting (XSS)**. On a real site the script could steal the user's session.

> Some browsers rewrite `<` in the address bar. If you see no alert, the bug is still there:
> run `curl "http://localhost:3000/r/x/comments/%3Cb%3Ehi%3C%2Fb%3E"` and you will see raw `<b>hi</b>` in the HTML.

The fix: turn the characters that mean something in HTML (`< > & " '`) into harmless text **before** putting them in the page.
Add a helper below `const PORT` and use it in both routes:

```bash
git diff
```

```diff
@@ -3,17 +3,27 @@ import express from 'express'
 const app = express()
 const PORT = process.env.PORT ?? 3000
 
+// Turn characters that mean something in HTML into harmless text
+const escapeHtml = (text) =>
+  text
+    .replaceAll('&', '&amp;')
+    .replaceAll('<', '&lt;')
+    .replaceAll('>', '&gt;')
+    .replaceAll('"', '&quot;')
+    .replaceAll("'", '&#39;')
+
 app.get('/', (req, res) => {
   res.send('<h1>Welcome to the front page of the internet</h1>')
 })
 
 app.get('/r/:topic', (req, res) => {
-  const { topic } = req.params
+  const topic = escapeHtml(req.params.topic)
   res.send(`<h1>Welcome to r/${topic}!</h1><p>Posts about ${topic} will appear here.</p>`)
 })
 
 app.get('/r/:topic/comments/:comment', (req, res) => {
-  const { topic, comment } = req.params
+  const topic = escapeHtml(req.params.topic)
+  const comment = escapeHtml(req.params.comment)
   res.send(`
     <h1>r/${topic}</h1>
     <p>Please add your comment about <strong>${comment}</strong></p>
```

This is a good diff to read slowly: one **hunk** that both adds lines and changes lines, across two routes.
After the fix, the page shows `&lt;script&gt;alert(1)&lt;/script&gt;` in the HTML, which the browser displays as text.

> [ADVANCED] `&` must be replaced **first**. Otherwise the `&` inside `&lt;` would be escaped again into `&amp;lt;`.
> In real projects, a template engine (EJS, Pug) or React escapes for you. Raw HTML strings like ours are only for small demos.

```bash
git diff --staged     # nothing yet, we have not added
git commit -am "fix: escape route params before putting them in HTML"
```

---

## Things to know about params

- `req.params` values are **always strings**. `/r/cats/hot/3` gives `'3'`, not `3`. Use `Number(...)` and check the result (see the exercises).
- Express **decodes** the URL for you: `/r/node%20js` gives `topic === 'node js'`.
- A parameter matches **one** path segment. It stops at `/`. So `/r/cats/comments` does not match `/r/:topic` and does not match `/r/:topic/comments/:comment`.
- A trailing slash is allowed by default: `/r/cats/` matches `/r/:topic`.
- Order matters when two routes could match the same URL. `/r/popular` (fixed) must come **before** `/r/:topic`, or `:topic` catches it first.

---

## Cheat sheet

| I want to see... | Command |
|---|---|
| changes I have not staged | `git diff` |
| changes I staged (my next commit) | `git diff --staged` |
| all changes since the last commit | `git diff HEAD` |
| only file names and line counts | `git diff --stat` |
| changes inside a long line | `git diff --word-diff` |
| one file only | `git diff -- app.js` |
| what one commit changed | `git show <hash>` |
| two commits compared | `git diff <old> <new>` |
| history with diffs | `git log -p` |
| two files that are not in Git | `diff -u old.txt new.txt` |
| two files, using Git's nicer output | `git diff --no-index old.txt new.txt` |
| throw away unstaged changes to a file | `git restore app.js` |
| unstage a file (keep the changes) | `git restore --staged app.js` |

Now do the [exercises](EXERCISES.md).
