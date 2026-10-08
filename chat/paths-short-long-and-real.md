# One folder, two names: short vs long paths, and how other systems compare

Context (2026-10-08): while making `tools/ladder-e2e/` run on its own, every client stage from 05 on showed a
blank page in the Vite dev server, with `404 GET /@vite/client`. The cause was a Windows short (8.3) path.
The fix is in `tools/ladder-e2e/config.mjs` (see the README there).

## The question (as asked)

> the short vs long paths is a source of warning and/or errors. How other operating systems deal with path;
> I believe linux, mac os, unix always deal with full paths, correct

**Answer in one line:** mostly correct. Unix-like systems have no short-name aliases, so this exact bug cannot
happen there, but they have other ways for one folder to have two names (symbolic links above all), and tools
trip on those the same way.

## What happened here

Windows keeps an 8.3 short name next to long names, for compatibility with MS-DOS (8 letters, a dot, 3 letters).
The user folder `usergolden26` (12 letters) also has the name `USERGO~1`. On this machine the `TEMP` and `TMP`
environment variables are stored with the short form:

```
TEMP=C:\Users\USERGO~1\AppData\Local\Temp
```

Node's `os.tmpdir()` simply returns `TEMP`. The test worktree was created there, so Vite got
`C:\Users\USERGO~1\…` as the project root. Vite resolves files to their **real** path, `C:\Users\usergolden26\…`.
It then compared the two spellings as text, decided the files were outside the project, and answered 404.
It only showed from stage 05, the first stage whose dependencies (MUI) Vite pre-bundles.

```
same folder ─┬─ C:\Users\USERGO~1\AppData\Local\Temp\ladder-e2e-wt-…      (what TEMP says)
             └─ C:\Users\usergolden26\AppData\Local\Temp\ladder-e2e-wt-…  (the real path)
"C:\Users\USERGO~1\…" === "C:\Users\usergolden26\…"  →  false
```

The earlier checks never hit it because they ran inside the repository, whose path has only long names.

## Other operating systems

### Linux, macOS, BSD (Unix-like)

- **No 8.3 aliases.** Each part of a path is just a name (up to 255 bytes).
- **Not always "full" paths.** Paths can be relative (`./client`, `../server`). "Full" means *absolute*, and tools
  make paths absolute on every system.
- **The same kind of bug comes from symbolic links.** A symlink is a second name that points to the same folder.
  - **macOS:** `/tmp` is a link to `/private/tmp`, and the per-user temp folder `/var/folders/…` is really
    `/private/var/folders/…`. Node, Vite, Jest and webpack have all had bugs like ours because of this.
  - **Linux:** symlinked project folders, bind mounts and Docker volumes give one folder two names.
- **Upper and lower case:**
  - Linux is case-sensitive: `App.jsx` and `app.jsx` are two different files.
  - macOS (APFS) is case-insensitive by default, like Windows: `Foo` and `foo` are the same file.
  - Consequence: code with a wrong-case import works on a Mac or a Windows PC and breaks on a Linux server.
- **Unicode:** macOS may store an accented letter like `é` as two characters (`e` plus the accent) where other
  systems store one. Two names can look identical and still compare as different.

### Windows, besides 8.3 names

- `C:\` vs `c:\`, and `\` vs `/` (Node accepts both slashes)
- junctions and symbolic links (the `node_modules` junctions used during the ladder build are an example)
- mapped network drives and UNC paths (`\\server\share\…`), and `subst` drives
- the old 260-character path limit (`MAX_PATH`), lifted only when long paths are enabled

| | Windows | macOS | Linux |
|---|---|---|---|
| short (8.3) aliases | yes | no | no |
| symbolic links | yes (plus junctions) | yes (`/tmp`, `/var` are links) | yes |
| case-sensitive names | no | no (by default) | yes |
| separator | `\` (also accepts `/`) | `/` | `/` |

## The rule tools follow

Before comparing two paths, convert both to the **canonical** form, the "real path": absolute, every link
resolved, and on Windows the long names and the real upper/lower case.

| Where | How |
|---|---|
| Node.js | `fs.realpathSync.native(p)`, or `await fs.promises.realpath(p)` |
| Unix shell | `realpath path` (or `readlink -f path`) |
| PowerShell | `(Get-Item path).FullName` gives the long form; `Resolve-Path` does **not** expand 8.3 names |

`tools/ladder-e2e/config.mjs` does exactly this:

```js
export const tempDir = realpathSync.native(os.tmpdir())   // C:\Users\usergolden26\AppData\Local\Temp
```

Measured on this machine with `C:\Users\USERGO~1\AppData\Local\Temp`:

| Call | Result |
|---|---|
| `path.resolve(p)` (Node) | `C:\Users\USERGO~1\…`: only makes it absolute, never looks at the disk |
| `fs.realpathSync(p)` (Node) | `C:\Users\USERGO~1\…`: resolves links, but keeps the short name |
| `fs.realpathSync.native(p)` (Node) | `C:\Users\usergolden26\…` ✓ |
| `Resolve-Path` (PowerShell) | `C:\Users\USERGO~1\…` |
| `(Get-Item p).FullName` (PowerShell) | `C:\Users\usergolden26\…` ✓ |

So in Node, `.native` is the one to use.

## Optional: fix it for every tool on this machine

Set the user environment variables `TEMP` and `TMP` to `C:\Users\usergolden26\AppData\Local\Temp`
(Settings → System → About → Advanced system settings → Environment Variables), then open new terminals.
The ladder scripts do not need this; they correct the path themselves.
