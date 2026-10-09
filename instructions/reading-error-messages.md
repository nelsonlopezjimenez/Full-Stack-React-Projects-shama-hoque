# Reading error messages

An error message is not the computer shouting at you. It is the computer telling you **what** went
wrong and **where**, usually in the first few lines. This guide shows you how to find those lines fast.

> [!IMPORTANT]
> ### The three rules
>
> 1. **Read from the top down.** The first error is the real one. Most of what comes after it is a
>    consequence of it.
> 2. **Fix only the first error, then run again.** Fixing the first one often makes all the others
>    disappear. Don't try to fix ten errors at once.
> 3. **Find the first line that points to *your* file.** Skip lines that mention `node:internal`,
>    `node_modules` or `<anonymous>`: that is code you didn't write, and the bug is almost never there.

---

## 1. The shape of a Node error

Every Node error has the same four parts, from top to bottom:

```
file:///.../server/b.js:2                                   ← 1. WHERE: file and line number
  return users.map((u) => u.name.toUpperCase())             ← 2. the line itself
                                 ^                          ←    the exact spot
TypeError: Cannot read properties of undefined (reading 'toUpperCase')   ← 3. WHAT went wrong
    at file:///.../server/b.js:2:34                         ← 4. HOW we got there (stack trace)
    at Array.map (<anonymous>)                                   skip: not your code
    at list (file:///.../server/b.js:2:16)
    at read (file:///.../server/b.js:4:24)
    at file:///.../server/b.js:5:13
    at ModuleJob.run (node:internal/modules/esm/module_job:430:25)     skip: Node itself
    at async asyncRunEntryPointWithESMLoader (node:internal/modules/run_main:101:5)   skip
```

**How to read it:**

- **Line 3, the error type and message**, tells you *what*: something is `undefined`, and the code
  tried to call `.toUpperCase()` on it. The thing before `.toUpperCase` is `u.name`, so some user has
  no `name`.
- **Lines 1–2** tell you *where* it blew up: `b.js`, line 2, at the `^`.
- **The stack trace** (the `at …` lines) is the path that led there, the **most recent call first**.
  `list` was called by `read` (line 4), which was called from line 5. If line 2 looks right, go down
  the stack: the bad data came from one of those callers. Here, line 4 passes a user with only an
  `email`.

`file:2:34` means **line 2, column 34**. In VS Code, **Ctrl+G** jumps to a line, and **Ctrl+click** on
the path in the terminal opens the file at that spot.

---

## 2. Many errors, one cause

Here, `npm test` shows **three** failing tests:

```
✖ returns the message (0.3942ms)
✖ create reports the error (0.4167ms)
✖ update reports the error (0.0766ms)
ℹ tests 3
ℹ pass 0
ℹ fail 3

✖ failing tests:

test at tests\1-dbErrorHandler.test.js:4:1
✖ returns the message (0.3942ms)
  TypeError: errorHandler.getErrorMessage is not a function
      at TestContext.<anonymous> (file:///.../server/tests/1-dbErrorHandler.test.js:4:59)
      at Test.runInAsyncScope (node:async_hooks:214:14)
      ...

test at tests\2-users.test.js:4:1
✖ create reports the error (0.4167ms)
  TypeError: errorHandler.getErrorMessage is not a function
      at create (file:///.../server/controllers/user.controller.js:2:45)
      ...

test at tests\2-users.test.js:5:1
✖ update reports the error (0.0766ms)
  TypeError: errorHandler.getErrorMessage is not a function
      at update (file:///.../server/controllers/user.controller.js:3:45)
      ...
```

It looks like three problems in three places. Read the **first** one only: `getErrorMessage is not a
function`. The other two say the **same thing**. So it's one problem: whatever `errorHandler` is, it has
no `getErrorMessage`. Open the file where it's defined, `helpers/dbErrorHandler.js`:

```js
export default { getErrorMesage: getErrorMessage }   // ← "Mesage": one "s" missing
```

One missing letter, three failing tests. Fix it, run `npm test` again, and all three pass.

Notice that the typo is **not** in any line of the stack trace. The trace shows where the code
*crashed*, not always where the *mistake* is. The message tells you what to look for
(`getErrorMessage`), and you follow that name to where it's defined.

**This is why rule 2 matters.** If you had "fixed" `user.controller.js` lines 2 and 3 first, you would
have changed correct code and still had three failing tests.

The same thing happens everywhere:

- One missing `}` or `)` → the editor underlines the **rest of the file** in red. Fix the first one.
- MongoDB not running → `connect ECONNREFUSED 127.0.0.1:27017` first, then every request and every test
  that needs the database fails.
- A package not installed → `Cannot find package 'mongoose'`, and nothing else even gets to run.

---

## 3. Where to look, tool by tool

| Tool | Where the important line is | What to skip |
|---|---|---|
| **Node** (`npm run dev`, `node server.js`) | The line starting with the error type: `TypeError:`, `SyntaxError:`, `ReferenceError:`, `Error:` | `at …` lines with `node:internal` or `node_modules` |
| **`npm test`** (`node --test`) | The first test under **`✖ failing tests:`** | The other tests failing with the **same message** |
| **`npm install`** | The **first** `npm error` lines (`code ERESOLVE`, `code ENOENT`, `404 Not Found`) | `A complete log of this run can be found in: …` at the bottom |
| **Browser console** (F12) | The **first red** error | Later errors such as `The above error occurred in the <Board> component`: they're a follow-up |
| **Vite** (red overlay in the browser) | The first line: file, line, and message | It shows one error at a time: fix it, save, and the next one appears |
| **git** | The `fatal:` or `error:` line | `hint:` lines: they are suggestions, read them *after* the error |
| **Python** (if you meet it elsewhere) | The **last** line: Python prints `most recent call last` | This is the one tool you read bottom-up |

---

## 4. Your routine

1. **Scroll up** to where the red text **starts**. The terminal shows you the end; the beginning is
   what matters.
2. **Read the first error line out loud**: its type and its message. Words like `undefined`,
   `not a function`, `not defined`, `Cannot find`, `ECONNREFUSED`, `EADDRINUSE` already tell you a lot.
3. **Find the first line that points to your file**, and open it at that line and column.
4. **Fix that one thing.** Save. **Run again.**
5. **New error?** That's progress: start again at step 1. **Same error?** Your fix didn't touch the
   cause: reread the message, and go one line down the stack trace.
6. **Still stuck?** Copy the **whole** error (from its first line, not just the last one) into a
   search engine or your message to the instructor, plus the command you ran.

> [!TIP]
> Most messages contain the name of the thing that's wrong: `getErrorMessage`, `upsteam`, `'mongoose'`.
> Copy that name and search for it (**Ctrl+Shift+F** in VS Code). A surprising number of errors are one
> letter off; see *Typo-proof your terminal* in [Working with the lesson stages](working-with-the-lesson-stages.md).
