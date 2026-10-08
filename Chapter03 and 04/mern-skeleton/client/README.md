# mern-skeleton — client

This is the React 19 single-page app, built with Vite 8.

> How to switch, compare and work on the lesson stages: [`instructions/working-with-the-lesson-stages.md`](http://192.168.1.28:3000/s888888/Full-Stack-React-Projects-shama-hoque/src/branch/main/instructions/working-with-the-lesson-stages.md)
> on `main` (or `git show origin/main:instructions/working-with-the-lesson-stages.md`).

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | dev server on http://localhost:5173, forwards `/api` to the server |
| `npm run build` | production build in `dist/` |

## Layout

```
index.html            the one HTML page; React fills <div id="root">
src/main.jsx          createRoot + StrictMode
src/App.jsx           the page: a heading and the users list
src/Users.jsx         loads GET /api/users and shows the names
```
