# A new Vite + React project from the command line

Every client in this course (Tic-Tac-Toe, the Chapter 2 and Chapter 3 clients) is a small Vite + React
project. This page builds one from an empty folder, by typing commands instead of editing
`package.json` by hand. Then you can make one yourself whenever a lesson says "build it yourself first".

> [!IMPORTANT]
> ### What you end up with
>
> ```
> my-app/
> ├── .gitignore         node_modules/ and dist/ are never committed
> ├── index.html         the one HTML page, with an empty <div id="root">
> ├── package.json       "type": "module", scripts dev / build / preview, the dependencies
> ├── package-lock.json  the exact versions npm installed (written by npm, commit it)
> ├── vite.config.js     turns on the React plugin
> └── src/
>     ├── main.jsx       starts React and draws <App /> inside #root
>     └── App.jsx        your first component
> ```

The commands work the same in PowerShell, Git Bash and the VS Code terminal.

## 1. Make the folder and `package.json`

```bash
mkdir my-app
cd my-app
npm init -y
```

`npm init` writes a `package.json`. `-y` accepts all the default answers.

## 2. Edit `package.json` with `npm pkg`

`npm pkg set` writes a field into `package.json` for you. That means no missing comma and no wrong quote.

```bash
npm pkg set type=module "scripts.dev=vite" "scripts.build=vite build" "scripts.preview=vite preview"
npm pkg set private=true --json
npm pkg delete main scripts.test
```

| Command | What it does |
|---|---|
| `type=module` | lets you write `import … from …` (modern JavaScript modules) |
| `"scripts.dev=vite"` | `npm run dev` starts the development server with hot reload |
| `"scripts.build=vite build"` | `npm run build` writes the finished site to `dist/` |
| `"scripts.preview=vite preview"` | `npm run preview` serves that `dist/` folder, to check the build |
| `private=true --json` | npm refuses to publish this project to the npm registry by accident |
| `delete main scripts.test` | removes two defaults from `npm init` that a Vite app doesn't use |

- **Quote any value that has a space** in it, like `"scripts.build=vite build"`. Without the quotes,
  the shell splits it into two words.
- **`--json`** stores `true` as a real true/false value. Without it, npm saves the text `"true"`.
- A dot means "inside": `scripts.dev` is the `dev` key inside `scripts`.

Check the result with `npm pkg get` or by opening the file:

```bash
npm pkg get scripts
```

## 3. Install React and Vite

```bash
npm install react react-dom
npm install -D vite @vitejs/plugin-react
```

- **`react` and `react-dom`** go under `"dependencies"`. They are part of the app that reaches the
  browser.
- **`-D`** (short for `--save-dev`) puts `vite` and `@vitejs/plugin-react` under `"devDependencies"`.
  You use them to build the app, but they are not part of it.

`npm install` also creates `node_modules/` (the downloaded code) and `package-lock.json`.

## 4. Write the four files

**`index.html`** (in the project folder, not in `src/`):

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>My app</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

**`vite.config.js`**:

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: { port: 5173 }
})
```

**`src/main.jsx`**:

```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
```

**`src/App.jsx`**:

```jsx
export default function App() {
  return <h1>Hello from React and Vite</h1>
}
```

**`.gitignore`**:

```
node_modules/
dist/
```

## 5. Run it

```bash
npm run dev
```

Open the address Vite prints (normally http://localhost:5173). Change the text in `App.jsx` and save:
the page updates by itself. Stop the server with **Ctrl+C**.

To check the production build:

```bash
npm run build
npm run preview
```

> [!TIP]
> **Port already taken?** If another chapter's client is still running on 5173, Vite picks the next
> free port and prints it. Read the address in the terminal instead of assuming 5173.

## 6. The shortcut, and why the course doesn't use it

```bash
npm create vite@latest my-app -- --template react
```

This makes a similar project in one step, plus an ESLint setup, a sample logo, sample CSS and a
counter demo. Do the steps above at least once, so you know what each file is for. After that, the
shortcut is fine. The `--` passes `--template react` to the Vite tool instead of to npm.

## `npm pkg`, quick reference

| Task | Command |
|---|---|
| Set a field | `npm pkg set name=my-app` |
| Set a nested field | `npm pkg set scripts.dev=vite` |
| Set several at once | `npm pkg set type=module "scripts.build=vite build"` |
| Set a number, true/false or list | add `--json`: `npm pkg set private=true --json` |
| Read a field | `npm pkg get scripts.dev` |
| Read everything | `npm pkg get` |
| Remove a field | `npm pkg delete scripts.test` |

The same commands set up an Express server too. See
[`Chapter00/git-diff-express-routes/README.md`](../Chapter00/git-diff-express-routes/README.md).
