# mern-skeleton — client

This is the React 19 single-page app, built with Vite 8. It uses React Router 8 (declarative mode) and MUI 9.

> How to switch, compare and work on the lesson stages: [`instructions/working-with-the-lesson-stages.md`](http://192.168.1.28:3000/s888888/Full-Stack-React-Projects-shama-hoque/src/branch/main/instructions/working-with-the-lesson-stages.md)
> on `main` (or `git show upstream/main:instructions/working-with-the-lesson-stages.md`).

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | dev server on http://localhost:5173, forwards `/api` to the server |
| `npm run build` | production build in `dist/` |
| `npm run preview` | serves `dist/` on http://localhost:4173 (also forwards `/api`) |
| `npm test` | Vitest + Testing Library (13 tests) |

## Environment (`.env`, see `.env.example`)

| Variable | Default | Notes |
|---|---|---|
| `API_PROXY_TARGET` | `http://localhost:3000` | where the dev/preview server forwards `/api` (only read by `vite.config.js`) |
| `VITE_API_URL` | empty | only when the client is deployed on its own origin; it is copied **into** the bundle, so never put secrets in it |

## Pages

| URL | Page | Signed in? |
|---|---|---|
| `/` | Home | — |
| `/users` | All users | — |
| `/signup`, `/signin` | Forms (React 19 `useActionState`) | — |
| `/users/:userId` | Profile | yes |
| `/users/:userId/edit` | Edit profile (controlled inputs) | yes |
| anything else | Not found | — |

## Layout

```
src/main.jsx          createRoot + StrictMode, Roboto font
src/App.jsx           theme, CssBaseline, BrowserRouter
src/MainRouter.jsx    routes, lazy-loaded pages, PrivateRoute layout route
src/core/request.js   the one fetch helper (token, JSON, errors → { error })
src/auth/             sign-in page, session helper, PrivateRoute, auth API
src/user/             user pages and user API
src/test/             1-helper … 4-routing tests
```

## Deploying

| How | Steps |
|---|---|
| One process (simplest) | `npm run build`, then start the server with `CLIENT_DIST=../client/dist` (server lesson 18). Open http://localhost:3000. |
| Client on its own origin | build with `VITE_API_URL=https://api.example.com`, and start the server with `CORS_ORIGIN=<the client's origin>`. |

## Lessons

This client was built in 20 stages, from an empty folder to this code, on top of the finished server
(`teach/ch03-server-19-tests`). Stages 02–05 are React's Tic-Tac-Toe tutorial, built inside the client
and put away again in stage 06. Each stage is a branch (`teach/ch03-client-01-hello` …
`teach/ch03-client-20-tests`) and has a note in [`lessons/`](lessons/):

| # | Lesson | # | Lesson |
|---|---|---|---|
| 01 | [Hello, React](lessons/01-hello.md) | 11 | [URL parameters: one user's profile](lessons/11-profile.md) |
| 02 | [Tic-Tac-Toe 1: a board you can click](lessons/02-ttt-lift-state.md) | 12 | [Signing in: the browser keeps the cookie](lessons/12-signin.md) |
| 03 | [Tic-Tac-Toe 2: immutability, turns and a winner](lessons/03-ttt-winner.md) | 13 | [Who is signed in? The session helper](lessons/13-auth-helper.md) |
| 04 | [Tic-Tac-Toe 3: history, a list of moves, keys](lessons/04-ttt-keys.md) | 14 | [Protected pages: PrivateRoute](lessons/14-private-route.md) |
| 05 | [Tic-Tac-Toe 4: time travel and final cleanup](lessons/05-ttt-time-travel.md) | 15 | [Editing your profile (PATCH, 403)](lessons/15-edit-profile.md) |
| 06 | [Data from the server: the users list](lessons/06-users-list.md) | 16 | [Deleting your account](lessons/16-delete-user.md) |
| 07 | [A form: sign up](lessons/07-signup-form.md) | 17 | [React 19 form actions](lessons/17-form-actions.md) |
| 08 | [One job per file: the API layer](lessons/08-request-helper.md) | 18 | [Code splitting: lazy pages](lessons/18-lazy-pages.md) |
| 09 | [A component library: Material UI](lessons/09-mui.md) | 19 | [Production: build, preview, deploy](lessons/19-production.md) |
| 10 | [Pages and URLs: React Router](lessons/10-router.md) | 20 | [Tests](lessons/20-tests.md) |

See one lesson as a diff: `git diff upstream/teach/ch03-client-10-router upstream/teach/ch03-client-11-profile -- .`
