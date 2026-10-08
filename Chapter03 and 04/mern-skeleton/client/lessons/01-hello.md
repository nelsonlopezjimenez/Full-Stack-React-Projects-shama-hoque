# Client stage 01 — Hello, React

**Branch:** `teach/ch03-client-01-hello` (starts from `teach/ch03-server-19-tests`)

## Goal

A web page made by React. It is three small files. The server from the server series is finished
and stays as it is; from now on we build the part that runs **in the browser**.

## New ideas

- **Single-page app (SPA).** The server sends one almost empty HTML page (`index.html`) and a
  JavaScript bundle. JavaScript then builds everything you see, and later changes the page without
  asking the server for new HTML.
- **React** builds the page from **components**: functions that return what to show.
- **JSX** is the HTML-like syntax inside `.jsx` files: `<h1>MERN Skeleton</h1>`. The browser cannot
  read it; a build tool turns it into JavaScript first.
- **Vite** is that build tool. `npm run dev` starts a development server with **hot reload** (save a
  file and the page updates without losing its state); `npm run build` makes the files for production.
- **`createRoot(...).render(<App />)`** connects React to the `<div id="root">` in `index.html`.
- **`<StrictMode>`** is a development helper (more about it in stage 02).

## What changed

| File | What |
|---|---|
| `package.json` | name, `"type": "module"`, scripts `dev` / `build`, `react`, `react-dom`, `vite`, `@vitejs/plugin-react` |
| `.gitignore` | `node_modules/`, `dist/` (the build output) and `.env` files |
| `index.html` | the one HTML page, with `<div id="root">` and the script tag for `src/main.jsx` |
| `vite.config.js` | the React plugin and the port (5173) |
| `src/main.jsx` | starts React |
| `src/App.jsx` | the first component |

`dependencies` are needed by the app in the browser (React). `devDependencies` are only needed to
build it (Vite).

## Try it

```bash
cd client
npm install
npm run dev
```

1. Open http://localhost:5173. You see the heading.
2. Change the text in `App.jsx` and save. The page updates by itself.
3. Open the browser's developer tools (F12) → **Elements**. `<div id="root">` now contains the `<main>`.
   Then **View page source** (Ctrl+U): the HTML that arrived is still empty. React built the rest.
4. Run `npm run build` and look into `dist/`: one `index.html` and one JavaScript file in `assets/`.

## Exercise

Add a second component `Footer` in `App.jsx` that shows the current year
(`new Date().getFullYear()`), and use it below the paragraph as `<Footer />`. In JSX, a JavaScript
value goes inside curly braces: `<p>{year}</p>`.
