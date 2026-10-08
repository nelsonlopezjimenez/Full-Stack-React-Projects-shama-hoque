# Client stage 18 — Code splitting: lazy pages

**Branch:** `teach/ch03-client-18-lazy-pages` (starts from `teach/ch03-client-17-form-actions`)

## Goal

Since stage 12, `npm run build` has printed a warning: *Some chunks are larger than 500 kB after
minification*. Everything was in one JavaScript file, so a visitor who only wants the home page also
downloaded the code of every form and dialog. This stage splits the pages into separate files that load on demand.

## Build it yourself first

Try the goal on your own before you look at this stage's code. Start from the end of stage 17 and copy
this note into your branch (the instructions on `main`, section 5, explain these commands):

```bash
git fetch upstream
git switch --no-track -c my/ch03-client-18-lazy-pages upstream/teach/ch03-client-17-form-actions
git restore --source=upstream/teach/ch03-client-18-lazy-pages -- ":/Chapter03 and 04/mern-skeleton/client/lessons/18-lazy-pages.md"
```

**What must be running:** MongoDB, the server (`cd server && npm run dev`) and the client
(`cd client && npm run dev`). Check the server first: `server/api.http` → request **2. List users** answers `200`.

**Your task:**

1. Run `npm run build` first and note the warning about chunks larger than 500 kB.
2. In `MainRouter.jsx`, load the pages behind a link with `lazy(() => import('./auth/Signin.jsx'))` (and the
   same for Signup, Users, Profile, EditProfile).
3. Wrap `<Routes>` in `<Suspense fallback={…}>` (the finished stage uses a thin `LinearProgress`).

**Done when:** `npm run build` prints no warning and writes many small files named after the pages; in the dev
server, Network → JS shows a page's file only when you open that page.

**Compare** with the finished stage (from the `client` folder):
`git diff upstream/teach/ch03-client-18-lazy-pages -- . ":!package-lock.json"`.
To run the finished stage next to yours, see "Check your result" in lesson 06.

## New ideas

- **Bundle.** `vite build` follows every `import` from `main.jsx` and writes the result into as few files
  as possible. Bigger app → bigger file → slower first visit, especially on a phone.
- **Dynamic `import()`.** `import('./auth/Signin.jsx')` is a *function call* that returns a Promise. The
  bundler turns every dynamic import into its own file ("chunk").
- **`lazy(() => import(...))`** makes a component from a dynamic import. React downloads the chunk the
  first time the component is rendered.
- **`<Suspense fallback={...}>`** shows the fallback (a thin `LinearProgress` bar) while a lazy page is still
  downloading.
- **What to split.** Pages behind a link (Signin, Signup, Users, Profile, EditProfile) are split. `Menu` and `Home`
  are on screen at once, so splitting them would only add a second request.
- **Shared chunks.** Code that several pages use (`TextField`, `Button`, `request.js`) goes into shared
  chunks, which the browser downloads once and caches.

## What changed

| File | What |
|---|---|
| `src/MainRouter.jsx` | `lazy()` for five pages, `<Suspense>` around `<Routes>` |

## Numbers (measured for this lesson)

| | Stage 17 | Stage 18 |
|---|---|---|
| JavaScript files in `dist/assets` | 1 | 17 |
| Largest JS file | 510 kB (warning) | 256 kB (no warning) |
| Files the home page loads | everything | the entry file plus a few shared chunks |

## Try it

1. `npm run build` on stage 17 and on stage 18, and compare the output: one big `index-….js` vs. many small files
   named after the pages (`Signin-….js`, `Profile-….js`).
2. `npm run dev`, DevTools → Network → filter **JS**, open the home page and clear the list. Click **Sign In**:
   `Signin.jsx` is only requested now. Click it again later: no new request.
3. Throttle to "Slow 3G" and open **Users** for the first time: the progress bar appears under the menu.

## Exercise

Make `NotFound` lazy as well. Is it worth it? Look at the size of its chunk after `npm run build`, and think
about how often a visitor sees it.
