# Client stage 14 — Code splitting: lazy pages

**Branch:** `teach/ch03-client-14-lazy-pages`

## Goal

Since stage 08, `npm run build` has printed a warning: *Some chunks are larger than 500 kB after
minification*. Everything was in one JavaScript file, so a visitor who only wants the home page also
downloaded the code of every form and dialog. This stage splits the pages into separate files that load on demand.

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

| | Stage 13 | Stage 14 |
|---|---|---|
| JavaScript files in `dist/assets` | 1 | 17 |
| Largest JS file | 510 kB (warning) | 256 kB (no warning) |
| Files the home page loads | everything | the entry file plus a few shared chunks |

## Try it

1. `npm run build` on stage 13 and on stage 14, and compare the output: one big `index-….js` vs. many small files
   named after the pages (`Signin-….js`, `Profile-….js`).
2. `npm run dev`, DevTools → Network → filter **JS**, open the home page and clear the list. Click **Sign In**:
   `Signin.jsx` is only requested now. Click it again later: no new request.
3. Throttle to "Slow 3G" and open **Users** for the first time: the progress bar appears under the menu.

## Exercise

Make `NotFound` lazy as well. Is it worth it? Look at the size of its chunk after `npm run build`, and think
about how often a visitor sees it.
