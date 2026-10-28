# Vite 8: "Cannot find native binding" (Rolldown) on a student laptop

Date: 2026-10-28. Seen on a student's Windows laptop when running `npm run dev`
in a fresh `npm create vite` project, using Node v22.11.0.

## The error (shortened)

```
> vite
Error: Cannot find native binding. npm has a bug related to optional dependencies
(https://github.com/npm/cli/issues/4828). Please try `npm i` again after removing
both package-lock.json and node_modules directory.
  cause: Cannot find module '@rolldown/binding-wasm32-wasi'
    cause: Cannot find module './rolldown-binding.wasi.cjs'
      cause: Cannot find module '@rolldown/binding-win32-x64-msvc'
        cause: Cannot find module './rolldown-binding.win32-x64-msvc.node'

Node.js v22.11.0
```

## What it means

Vite 8 bundles with **Rolldown**, which is written in Rust. Rolldown needs a
compiled binary for your OS and CPU, and npm installs that binary as an
*optional* dependency. On Windows x64 that package is
`@rolldown/binding-win32-x64-msvc`.

Read the error chain from the bottom up. Rolldown looked for the Windows binary,
didn't find it, then tried the WASM fallback (`@rolldown/binding-wasm32-wasi`)
and didn't find that either. **The binary package was never installed.**

## Why it happens

1. **The npm optional-dependencies bug** ([npm/cli#4828](https://github.com/npm/cli/issues/4828)).
   If `package-lock.json` was made on a different OS or CPU, npm may skip the
   binary your machine needs.
2. **Copying `node_modules` or `package-lock.json` from another machine**: USB
   stick, zip file, OneDrive, or a classmate's repo.
3. **npm set to skip optional deps**: `npm config get omit` prints `optional`.
4. **Node too old for Vite 8.** Rolldown and Vite 8 need
   `^20.19.0 || >=22.12.0`. **v22.11.0 is just below that minimum**, so fix it
   either way.
5. **Antivirus** on a managed laptop can quarantine the `.node` file. The
   package folder exists, but the binary inside it is gone.

## Fix (PowerShell, in the project folder)

```powershell
# 1. Check Node and CPU type (should say x64)
node -v
node -p "process.arch"

# 2. If node -v is below v22.12.0, install the current Node LTS from nodejs.org,
#    then close and reopen the terminal and check node -v again.

# 3. Check that npm isn't skipping optional deps (should print nothing)
npm config get omit

# 4. Reinstall cleanly
Remove-Item -Recurse -Force node_modules, package-lock.json
npm install
npm run dev
```

## If it still fails

- **Step 3 printed `optional`:** run `npm config delete omit`, then repeat step 4.
- **Force the binary in:**
  `npm i -D @rolldown/binding-win32-x64-msvc`.
  If `process.arch` says `arm64` (Snapdragon / Copilot+ laptops), use
  `@rolldown/binding-win32-arm64-msvc` instead.
- **Antivirus:** look in `node_modules\@rolldown\binding-win32-x64-msvc\`. If
  that folder has no `.node` file, antivirus probably removed it. Moving the
  project out of a OneDrive-synced folder can also help.

## Most likely cause in this case

An old Node (22.11.0) plus a lockfile or `node_modules` that came from
somewhere else. Updating Node and doing the clean reinstall in step 4 fixes it
for most students.

## Teaching note

Never commit or share `node_modules`. Be careful about copying
`package-lock.json` between Windows, macOS and Linux machines too: it is meant
to be committed, but packages with native binaries (Rolldown, esbuild, sharp)
are where cross-platform lockfiles go wrong. When in doubt, delete both and run
`npm install` again.
