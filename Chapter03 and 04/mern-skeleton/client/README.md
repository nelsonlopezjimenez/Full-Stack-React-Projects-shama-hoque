# mern-skeleton — client

This is the React 19 single-page app, built with Vite 8. It uses React Router 8 (declarative mode) and MUI 9.

> How to switch, compare and work on the lesson stages: [`instructions/working-with-the-lesson-stages.md`](http://192.168.1.28:3000/s888888/Full-Stack-React-Projects-shama-hoque/src/branch/main/instructions/working-with-the-lesson-stages.md)
> on `main` (or `git show origin/main:instructions/working-with-the-lesson-stages.md`).

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

This client was built in 16 stages, from an empty folder to this code, on top of the finished server
(`teach/ch03-server-19-tests`). Each stage is a branch (`teach/ch03-client-01-hello` …
`teach/ch03-client-16-tests`) and has a note in [`lessons/`](lessons/):

| # | Lesson | # | Lesson |
|---|---|---|---|
| 01 | [Hello, React](lessons/01-hello.md) | 09 | [Who is signed in? The session helper](lessons/09-auth-helper.md) |
| 02 | [Data from the server: the users list](lessons/02-users-list.md) | 10 | [Protected pages: PrivateRoute](lessons/10-private-route.md) |
| 03 | [A form: sign up](lessons/03-signup-form.md) | 11 | [Editing your profile (PATCH, 403)](lessons/11-edit-profile.md) |
| 04 | [One job per file: the API layer](lessons/04-request-helper.md) | 12 | [Deleting your account](lessons/12-delete-user.md) |
| 05 | [A component library: Material UI](lessons/05-mui.md) | 13 | [React 19 form actions](lessons/13-form-actions.md) |
| 06 | [Pages and URLs: React Router](lessons/06-router.md) | 14 | [Code splitting: lazy pages](lessons/14-lazy-pages.md) |
| 07 | [URL parameters: one user's profile](lessons/07-profile.md) | 15 | [Production: build, preview, deploy](lessons/15-production.md) |
| 08 | [Signing in: the browser keeps the cookie](lessons/08-signin.md) | 16 | [Tests](lessons/16-tests.md) |

See one lesson as a diff: `git diff teach/ch03-client-06-router teach/ch03-client-07-profile -- .`
