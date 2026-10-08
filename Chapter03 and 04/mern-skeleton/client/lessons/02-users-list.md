# Client stage 02 — Data from the server: the users list

**Branch:** `teach/ch03-client-02-users-list`

## Goal

Show the users stored in MongoDB. The page asks the server with `GET /api/users`, the same request
you sent from `api.http` in server stage 02.

## New ideas

- **State (`useState`).** A value that belongs to a component and that, when changed with its setter,
  makes React draw the component again. `const [users, setUsers] = useState([])` starts with an
  empty list.
- **Effects (`useEffect`).** Code that runs *after* React has drawn the page, for work that talks to
  the outside world (the network, timers). `[]` as the second argument means "only after the first draw".
- **`fetch`** is the browser's built-in way to send HTTP requests. It returns a Promise; `.then` runs
  when the answer arrives, and `response.json()` reads the body as JSON.
- **Lists and `key`.** `users.map(...)` turns each user into an `<li>`. React needs a `key` on each
  one to know which item is which when the list changes. The database id is ideal.
- **The Vite proxy.** The page comes from Vite (port 5173) but the API is Express (port 3000).
  Vite forwards every request under `/api` to Express, so the browser only talks to one *origin*
  (server lesson 18 explains origins and CORS).
- **Cleanup.** An effect may return a function. React calls it when the component disappears, and
  `AbortController` uses it to cancel a request that is still running.

## What changed

| File | What |
|---|---|
| `vite.config.js` | `server.proxy`: `/api` → `http://localhost:3000` |
| `src/Users.jsx` | new: state, effect, fetch, list |
| `src/App.jsx` | uses `<Users />` |
| `src/main.jsx` | the StrictMode comment points to the example in `Users.jsx` |

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
