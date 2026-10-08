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
```

## Deploying

| How | Steps |
|---|---|
| One process (simplest) | `npm run build`, then start the server with `CLIENT_DIST=../client/dist` (server lesson 18). Open http://localhost:3000. |
| Client on its own origin | build with `VITE_API_URL=https://api.example.com`, and start the server with `CORS_ORIGIN=<the client's origin>`. |
