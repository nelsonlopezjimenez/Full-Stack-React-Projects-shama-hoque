# Chapter 03 (and 04) — teaching ladder, client

**Status:** draft for review (2026-10-07). Nothing built yet.
**Log:** `ch03-client-ladder-log.md` (created with stage 01)
**Starts from:** `teach/ch03-server-19-tests` (the last server stage)
**Target:** the client of `refactor/ch03-migration`, plus the intended differences listed under
"Final check" below.

## Goal

Build the React client of the MERN skeleton (the book's Chapter 4) **from an empty `client/` folder**,
one idea at a time, for beginners. This is the "client series" planned in decision D5 of the
server checklist. Every stage is a branch that starts from the previous one, so

```bash
git diff teach/ch03-client-05-mui teach/ch03-client-06-router -- "Chapter03 and 04/mern-skeleton/client"
```

shows exactly one lesson, written as **additions**. The server stays exactly as stage 19 left it
(unless a decision below says otherwise), so every client stage runs against the finished API.

On top of that, a **second, parallel series without comments** (see Part F).

## Decisions

Marked **proposed**: change any of them before the build starts.

| # | Decision | Choice |
|---|---|---|
| C1 | Branch prefix | **`teach/ch03-client-NN-name`** (your choice, 2026-10-07). The series continues the server one. |
| C2 | First client stage based on | **`teach/ch03-server-19-tests`** (your choice). The server ladder and the client ladder are one long chain: 19 + 16 branches. |
| C3 | Where the token lives in the final client | **proposed: same as the migration.** `{ token, user }` in `sessionStorage`, sent as `Authorization: Bearer`, and the browser also sends the httpOnly cookie `t` (`credentials: 'include'`). Stage 08 shows that the cookie alone already makes the API work. Stage 09 explains why the UI still needs to know *who* is signed in. Switching to "cookie only" (no token in JS, a `GET /api/auth/sessions/me` route on the server) would be safer, but it changes the server and moves the final code away from the migration. It is listed as idea L1. |
| C4 | Plain React before MUI | **proposed: yes.** Stages 02–04 use plain HTML elements (`<ul>`, `<form>`, `<input>`), so the first lessons are about React itself (components, state, effects, fetch) and not about a component library. Stage 05 restyles the same pages with MUI. |
| C5 | Forms | **proposed: `onSubmit` + `useState` first (stages 03, 08, 11), React 19 `useActionState` form actions later (stage 13)**, as a refactor. The migration uses `useActionState` in Signin and Signup only. Stage 13 converts exactly those two. |
| C6 | Lesson notes | One file per stage, `client/lessons/NN-name.md`, like the server. |
| C7 | Lock file | Each stage's `package-lock.json` is built from the final client lock (`npm install --package-lock-only`), so every stage uses the final versions, as in the server series. |
| C8 | Comment-free series | **Yes** (your request). Naming and scope are in Part F. |

## Conventions

Same as the server series:

- One branch per stage, pointing at the **last** commit of the stage. Most stages are one commit.
- Every commit runs (`npm run dev` in `client/`, with the stage-19 server running) and has
  `[BEGINNER]` / `[ADVANCED]` comments (in JSX: `{/* [BEGINNER] … */}`).
- Code comments are written for the stage they appear in. When a later stage changes the code, it
  also updates the comments.
- Each stage gets a log entry (changed / why / verified / surprises).
- Verification on ports other than 3000/5173 (e.g. server 3210, Vite 5210), database
  `mernskeleton_ladder`, killing only my own processes.

## Stages

### Part A — React on one page (no router, no MUI)

| # | Branch | Content | Packages |
|---|---|---|---|
| 01 | `…-01-hello` | Empty `client/` → `package.json` (`"type": "module"`, `dev`/`build`/`preview`), `index.html` with `#root`, `vite.config.js` (plugin + port 5173), `main.jsx` (`createRoot`, `StrictMode`), `App.jsx` returns a heading. JSX, components are functions. `.gitignore`. | react, react-dom, vite, @vitejs/plugin-react |
| 02 | `…-02-users-list` | `Users.jsx` loads `GET /api/users` in `useEffect` and keeps them in `useState`. Vite proxy for `/api` (why: one origin, no CORS). `key` in lists, loading and error states, `AbortController` cleanup (StrictMode runs the effect twice). | |
| 03 | `…-03-signup-form` | `Signup.jsx`: controlled inputs, `onSubmit`, `POST /api/users`, shows the server's 400 message. After success the list reloads: state lifted into `App`, passed down as props. | |
| 04 | `…-04-request-helper` | The same `fetch` code is now repeated → `core/request.js` (never throws, returns `{ error }`) + `user/api-user.js`. `.env.example`, `loadEnv`, `API_PROXY_TARGET`, `VITE_API_URL`. This mirrors server stage 07 (why one job per file). | |

### Part B — looks and pages

| # | Branch | Content | Packages |
|---|---|---|---|
| 05 | `…-05-mui` | Same pages with MUI: theme (`createTheme`, the book's `openTitle`/`protectedTitle`), `CssBaseline`, Roboto from `@fontsource`, `Card`, `TextField`, `List`, `sx`. `Home.jsx` with the seashell image (Vite image import). `FormError.jsx`. | @mui/material, @mui/icons-material, @emotion/react, @emotion/styled, @fontsource/roboto |
| 06 | `…-06-router` | React Router: `BrowserRouter`, `MainRouter.jsx` with `<Routes>`, pages `/`, `/users`, `/signup`, catch-all `NotFound.jsx`. `Menu.jsx` with `NavLink` and the `active` style. Folders `core/` and `user/`. Page URLs vs API URLs. Signup success `Dialog` with a link to sign in. | react-router |
| 07 | `…-07-profile` | `/users/:userId`, `useParams`, users in the list link to their profile. The server answers **401** (reading a user needs sign-in): the page shows the error. That 401 is the reason for Part C. | |

### Part C — signing in

| # | Branch | Content |
|---|---|---|
| 08 | `…-08-signin` | `auth/api-auth.js`, `Signin.jsx` (`onSubmit`), `POST /api/auth/sessions`. Demo: after sign-in the profile loads, because the browser sends the httpOnly cookie `t` by itself (DevTools → Application → Cookies; `document.cookie` cannot see it). |
| 09 | `…-09-auth-helper` | The UI does not know who is signed in (the cookie is unreadable on purpose). `auth/auth-helper.js`: `{ token, user }` in `sessionStorage`, reading `exp` from the JWT, `isAuthenticated()`. `request.js` sends the Bearer header. `Menu` shows "My Profile" / "Sign out" or "Sign up" / "Sign in". Sign out = `DELETE /api/auth/sessions` (C3). |
| 10 | `…-10-private-route` | `PrivateRoute.jsx` as a layout route with `<Outlet />`, `<Navigate replace state={{ from }}>`. Signin goes back to the page the user wanted. Profile is protected. |
| 11 | `…-11-edit-profile` | `/users/:userId/edit`, form filled from `GET`, saves with `PATCH` (only the changed fields), edit button on your own profile only. Demo: editing someone else → 403 from the server (server lesson 11). |
| 12 | `…-12-delete-user` | `DeleteUser.jsx`: confirm `Dialog`, `DELETE /api/users/:userId`, then sign out and go home. |

### Part D — modern React and production

| # | Branch | Content | Packages |
|---|---|---|---|
| 13 | `…-13-form-actions` | React 19 `useActionState` + `<form action>` in Signin and Signup: pending state, no `preventDefault`, `FormData` (C5). | |
| 14 | `…-14-lazy-pages` | `vite build` warns about a bundle > 500 kB → `lazy()` + `Suspense` with `LinearProgress`. Compare the `dist/assets` file list before/after. | |
| 15 | `…-15-production` | `npm run build` + `vite preview` (port 4173 with proxy); the server's `CLIENT_DIST` serves `dist/` with the SPA fallback (server lesson 18). Final `client/README.md`. | |
| 16 | `…-16-tests` | Vitest + Testing Library in four levels, like the server: `auth-helper` (pure) → `request` (mocked `fetch`) → `Menu` (render) → `PrivateRoute` (routing). `test` block in `vite.config.js`, `setup.js`, `helpers.js`. | vitest, jsdom, @testing-library/react, @testing-library/jest-dom |

## Part F — the comment-free series

A copy of every stage with **all code comments removed**, so you can compare reading the code with and
without explanations, and later keep or delete the whole series.

| # | Item | Proposal |
|---|---|---|
| F1 | Branch names | **`teach-nc/ch03-client-NN-name`** (nc = no comments). It cannot be `teach/ch03-client-01-hello-nc`, because the separate namespace lets you list, push and delete the whole series with one pattern: `git branch --list "teach-nc/*"`, `git branch -D $(git branch --list "teach-nc/*" --format="%(refname:short)")`. |
| F2 | Also the server stages? | **proposed: yes, `teach-nc/ch03-server-01..19`.** Otherwise the comment-free client branches would sit on the server *with* comments. The client series then continues from `teach-nc/ch03-server-19-tests`, the same way the commented one does. |
| F3 | Stacked as well | **Yes.** Each `teach-nc` stage is one commit on top of the previous `teach-nc` stage. Its files are the commented stage's files, minus comments. So `git diff teach-nc/…-04 teach-nc/…-05` is the same lesson without comments. One commit per stage, even where the commented stage has several (07a–f, 09a–c), with the message `<original subject> (no comments)`. |
| F4 | What is removed | `//` and `/* */` comments in `.js` / `.jsx` / `.mjs`. In JSX, the whole `{/* … */}` element. `<!-- -->` in `.html`. Lines starting with `#` in `.env.example` and `api.http` (the `###` request separators stay, because REST Client needs them). A line that only held a comment is deleted, and two or more blank lines in a row become one. |
| F5 | What stays | `lessons/*.md`, `README.md` files, `chat/` (these are documentation, not code comments). The shebang and string contents (a `//` inside a string or URL is not a comment). |
| F6 | How it is made | **proposed:** a script, `tools/make-nc-ladder.mjs`, committed on `main`. It uses `@babel/parser` to find the comments, so strings and regexes are never touched, and it rebuilds all `teach-nc/*` branches from the `teach/*` ones. After a fix and a `rebase --update-refs` on the commented series, you run it again. Nobody edits the `teach-nc` branches by hand. |
| F7 | How it is checked | For every stage: parsing the commented and the stripped file gives the **same syntax tree** (comments ignored), the server tests and the client tests pass, and `vite build` succeeds. |
| F8 | Push | **Not pushed until you decide to keep it.** The commented series is pushed as before. |

## Final check

After stage 16:

```bash
git diff refactor/ch03-migration teach/ch03-client-16-tests --stat -- "Chapter03 and 04/mern-skeleton/client"
```

may show **only** intended differences, expected to be:

- `README.md`: a "Lessons" section.
- `lessons/`: new.
- comments, where the ladder explains things in its own order.

With comments and blank lines removed, every source file, `package.json` and `package-lock.json`
should match the migration exactly. Each difference that is found goes into a table, as in the
server checklist.

## Fixing an earlier stage later

As for the server: commit on the stage where the fix belongs, then
`git switch teach/ch03-client-16-tests && git rebase --update-refs <that stage>`, then run
`node tools/make-nc-ladder.mjs` again to rebuild the comment-free series.

## Later / ideas

| ID | Idea |
|---|---|
| L1 | Cookie-only sign-in: no token in JavaScript, `GET /api/auth/sessions/me` to learn who is signed in (C3). |
| L2 | Show password rules (min length) in the Signup form before sending. |
| L3 | Users list with avatars from an image upload (that is Chapter 5, mern-social). |
| L4 | ESLint + `eslint-plugin-react-hooks` as a stage before the tests. |
