# Client stage 06 — Data from the server: the users list

**Branch:** `teach/ch03-client-06-users-list` (starts from `teach/ch03-client-05-ttt-time-travel`)

## Goal

Show the users stored in MongoDB. The page asks the server with `GET /api/users`, the same request
you sent from `api.http` in server stage 02. The Tic-Tac-Toe game is put away: it stays in stages 02–05.

## Build it yourself first

Try the goal on your own before you look at this stage's code. Start from the end of stage 05 and copy
this note into your branch:

```bash
git fetch upstream
git switch --no-track -c my/ch03-client-06-users-list upstream/teach/ch03-client-05-ttt-time-travel
git restore --source=upstream/teach/ch03-client-06-users-list -- ":/Chapter03 and 04/mern-skeleton/client/lessons/06-users-list.md"
```

The note appears as a new file; commit it together with your work.

### What must be running: from now on, the server too

From this stage on, every client stage needs **three** things running:

| What | How | Check |
|---|---|---|
| MongoDB | it runs in the background (as in the server series) | the server prints that it is connected |
| the Express server (port 3000) | terminal 1: `cd server`, `npm install`, `npm run dev` (it needs `server/.env`: `cp .env.example .env` once) | `server/api.http` → request **2. List users** answers `200` |
| the Vite client (port 5173) | terminal 2: `cd client`, `npm install`, `npm run dev` | http://localhost:5173 shows the page |

If the list stays empty, create two users first with `server/api.http` (requests **3** and **6**).

### `fetch` in five minutes

`fetch` is the browser's built-in function for HTTP requests: the same requests you send with `api.http`,
but sent by JavaScript in the page. It returns a **Promise** (a value that arrives later), and the answer
comes in two steps: first the status and headers (`response`), then the body (`response.json()`, another Promise).

```js
// with .then: the older style, still common in existing code and tutorials
fetch('/api/users')
  .then((response) => response.json())   // read the body as JSON
  .then((users) => console.log(users))   // an array of user objects
  .catch((err) => console.log('no answer at all', err))

// the same with async/await: today's practice, used in this stage and every later one
const response = await fetch('/api/users')
console.log(response.status, response.ok)   // 200 true
const users = await response.json()
```

Three things that surprise everybody once:

- **`fetch` only fails when there is no answer at all** (server unreachable, request cancelled). A 404 or
  500 is still an answer: `response.ok` is `false`, and the `catch` does **not** run. (Stage 07 checks `response.ok`.)
- **A GET needs no options.** A POST needs `method`, a `Content-Type` header and a body made with
  `JSON.stringify` (stage 07).
- **`fetch` cannot be called directly while a component renders** (render runs again on every state change:
  an endless loop). It goes into an **effect**, `useEffect(() => { … }, [])`, which runs after the first render.

**Test `fetch` before you write any React.** With the server and the client running, open
http://localhost:5173, press F12 → **Console**, and type (the Console allows `await` directly):

```js
const response = await fetch('/api/users')
response.status
await response.json()
```

Without the proxy (step 1 below) this fails, and how it fails is worth seeing:

- `fetch('/api/users')` reaches **Vite**, which answers every unknown address with `index.html`.
  `response.json()` then throws *SyntaxError: Unexpected token '<', "<!doctype "... is not valid JSON*:
  the body was HTML, not JSON.
- `fetch('http://localhost:3000/api/users')` reaches Express, but the browser blocks the answer:
  *…has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header…*. The page (port 5173) and the API
  (port 3000) are different *origins*. Server lesson 18 explains CORS; the proxy avoids the problem.

**Ways to load data in React**, so you recognise them elsewhere:

| Way | Looks like | Notes |
|---|---|---|
| `fetch` in `useEffect` | this stage | built in, no library; you handle loading, errors and cancelling yourself |
| `async`/`await` around `fetch` | this stage, inside the effect | the same `fetch`, written top to bottom |
| a helper around `fetch` | stage 08, `request()` | one place for headers, JSON and errors |
| `XMLHttpRequest` | `xhr.open('GET', url)` … | the old browser API that `fetch` replaced; you see it in old code |
| axios (library) | `axios.get('/api/users').then((r) => r.data)` | JSON by default, rejects on 4xx/5xx |
| TanStack Query, SWR (libraries) | `useQuery({ queryKey: ['users'], queryFn })` | caching, loading/error state, refetching; common in bigger apps |
| React Router loaders, React 19 `use()` | data before or while the page renders | other patterns; this course stays with effects |

### Your task

1. In `vite.config.js`, forward every request under `/api` to `http://localhost:3000` (`server.proxy`).
   Restart `npm run dev` and repeat the Console test: now it returns the array.
2. Put the game away: `App.jsx` shows a new component `<Users />` instead of `<TicTacToe />`, and the
   `src/tic-tac-toe` folder can go (it stays in stages 02–05).
3. New file `src/Users.jsx`: a state `users` (starts as `[]`), an effect that fetches `/api/users` once and
   stores the answer, and a `<ul>` with one `<li key={…}>` per user name. Which value is a good key?
4. Show "Cannot reach the server" when `fetch` fails (a second state for the error).
5. Optional, harder: cancel the request in the effect's cleanup with an `AbortController` (see "New ideas").

### Check your result: three views of the same data

1. **`server/api.http`**, request **2. List users**: a JSON array, for example
   ```json
   [
     { "_id": "6a1f0c…", "name": "Ann", "email": "ann@test.io", "created": "2026-…" },
     { "_id": "6a1f0d…", "name": "Bob", "email": "bob@test.io", "created": "2026-…" }
   ]
   ```
   No passwords: the server only selects `name email updated created` (and `updated` only exists after a user was edited).
   (`curl.exe http://localhost:3000/api/users` in a terminal shows the same.)
2. **Your page:** the same names, in the same order. F12 → **Network** → the `users` request → **Response**
   shows the same JSON as `api.http`, but the address is `http://localhost:5173/api/users`: the browser only
   talked to Vite, and Vite asked Express.
3. **The finished stage:** commit your work, then run the instructor's version and compare the page:
   ```bash
   git switch --detach upstream/teach/ch03-client-06-users-list
   npm run dev
   # look, stop it (Ctrl+C), then go back to your branch:
   git switch my/ch03-client-06-users-list
   ```
   Both talk to the same server and database, so both must list the same names. To compare the code:
   `git diff upstream/teach/ch03-client-06-users-list -- . ":!package-lock.json"` (from the `client` folder).

> **Both side by side?** `git worktree add ../teach-06 upstream/teach/ch03-client-06-users-list` makes a
> second folder with the finished stage. In its `client` folder run `npm install` and `npm run dev -- --port 5174`,
> and open both pages. Remove it afterwards with `git worktree remove ../teach-06`.

## New ideas

- **State (`useState`).** A value that belongs to a component and that, when changed with its setter,
  makes React draw the component again. `const [users, setUsers] = useState([])` starts with an
  empty list. (In stages 02–05 a click changed the state; here the server's answer does.)
- **Effects (`useEffect`).** Code that runs *after* React has drawn the page, for work that talks to
  the outside world (the network, timers). `[]` as the second argument means "only after the first draw".
- **`fetch`** is the browser's built-in way to send HTTP requests. It returns a Promise;
  `await` waits for its value, and `response.json()` (another Promise) reads the body as JSON.
- **`async`/`await` instead of `.then`.** Both handle Promises. `.then(callback)` chains are the
  older style you will meet in existing code; `async`/`await` reads top to bottom and uses ordinary
  `try`/`catch` for errors, so it is today's practice. An effect cannot be `async` itself (it may
  only return a cleanup function), so `Users.jsx` puts the work in `async function loadUsers()`
  and calls it right away.
- **Lists and `key`.** `users.map(...)` turns each user into an `<li>`. React needs a `key` on each
  one to know which item is which when the list changes. The database id is ideal (stage 04: a good key
  is unique and stable).
- **The Vite proxy.** The page comes from Vite (port 5173) but the API is Express (port 3000).
  Vite forwards every request under `/api` to Express, so the browser only talks to one *origin*
  (server lesson 18 explains origins and CORS).
- **Cleanup.** An effect may return a function. React calls it when the component disappears, and
  `AbortController` uses it to cancel a request that is still running.

## What changed

| Commit | File | What |
|---|---|---|
| put the game away | `src/tic-tac-toe/` | removed (it stays in stages 02–05) |
| | `src/App.jsx`, `README.md` | back to stage 01 |
| users list | `vite.config.js` | `server.proxy`: `/api` → `http://localhost:3000` |
| | `src/Users.jsx` | new: state, effect, fetch, list |
| | `src/App.jsx` | uses `<Users />` |
| | `src/main.jsx` | the StrictMode comment points to the example in `Users.jsx` |

To see only the users-list part: `git show upstream/teach/ch03-client-06-users-list -- .`

## Try it

Start the server first (`cd server && npm run dev`), then the client (`cd client && npm run dev`).

1. Open http://localhost:5173. If the database is empty you see only the heading. Create two users with
   `server/api.http` (request "create a user") and reload the page.
2. DevTools → **Network**, reload, click the `users` request. The URL is `http://localhost:5173/api/users`.
   The browser never saw port 3000. You also see one request marked *(canceled)*: StrictMode runs the
   effect twice in development, and the cleanup cancelled the first request.
3. Stop the server (Ctrl+C) and reload: "Cannot reach the server". (Vite also prints a proxy error in
   its terminal.) Start the server again.
4. Remove the `key` prop and look at the console: React warns that each child needs a unique key.

## Exercise

Show the number of users above the list: "3 users". Where does the number come from? Do you need a
second `useState` for it?
