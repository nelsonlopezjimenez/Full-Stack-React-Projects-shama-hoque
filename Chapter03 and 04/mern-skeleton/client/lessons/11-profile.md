# Client stage 11 — URL parameters: one user's profile

**Branch:** `teach/ch03-client-11-profile` (starts from `teach/ch03-client-10-router`)

## Goal

Click a user in the list to open their profile at `/users/<id>`. The page loads
`GET /api/users/<id>`, and the server refuses: **401**, you are not signed in. That 401 is the reason for
the next stages.

## Build it yourself first

Try the goal on your own before you look at this stage's code. Start from the end of stage 10 and copy
this note into your branch (the instructions on `main`, section 5, explain these commands):

```bash
git fetch upstream
git switch --no-track -c my/ch03-client-11-profile upstream/teach/ch03-client-10-router
git restore --source=upstream/teach/ch03-client-11-profile -- ":/Chapter03 and 04/mern-skeleton/client/lessons/11-profile.md"
```

**What must be running:** MongoDB, the server (`cd server && npm run dev`) and the client
(`cd client && npm run dev`). Check the server first: `server/api.http` → request **2. List users** answers `200`.

**Your task:**

1. A route `/users/:userId` and a new page `src/user/Profile.jsx` that reads the id with `useParams()`.
2. `read(userId, signal)` in `api-user.js`: `GET /api/users/<id>`, like request **8** in `server/api.http`.
3. In `Profile`, an effect that loads the user **again whenever `userId` changes** (its dependency list), and shows
   the name and email, or the server's error.
4. Each row in the users list becomes a link to that user's profile.

**Done when:** Clicking a user opens `/users/<id>`, and the page shows the server's 401 message
("UnauthorizedError: No authorization token was found"). Compare: request **8** in `api.http` also answers 401
if you have not sent request **19 (sign in)** first, and 200 after it. The browser has not signed in yet.

**Compare** with the finished stage (from the `client` folder):
`git diff upstream/teach/ch03-client-11-profile -- . ":!package-lock.json"`.
To run the finished stage next to yours, see "Check your result" in lesson 06.

## New ideas

- **URL parameters.** `<Route path="/users/:userId">` matches `/users/6ac6…`, and `useParams()` gives
  `{ userId: '6ac6…' }`. The same idea as `req.params.userId` on the server (server stage 04).
- **A link as a list row.** `ListItemButton component={Link} to={...}` makes the whole row clickable.
- **Effect dependencies.** `useEffect(fn, [userId])` runs again when `userId` changes. Without
  `[userId]` the page would keep showing the first profile when the URL changes to another one.
- **Race conditions.** If you switch profiles quickly, two requests are running, and the slower one could
  arrive last and show the wrong person. The cleanup aborts the old request, and
  `if (controller.signal.aborted) return` ignores its answer.
- **Render nothing until the data is there**: `{user && (...)}`.
- **`401 Unauthorized`.** The server protects `GET /api/users/:userId` with `requireSignin` (server stage 10).
  The client shows the server's message as it is.

## What changed

| File | What |
|---|---|
| `src/user/Users.jsx` | each row is a link to `/users/<id>`, with an arrow icon |
| `src/user/api-user.js` | `read(userId, signal)` |
| `src/user/Profile.jsx` | new |
| `src/MainRouter.jsx` | route `/users/:userId` |

## Try it

1. Open **Users** and click a name: the address bar shows the id, and the page shows
   "UnauthorizedError: No authorization token was found".
2. DevTools → Network → the request to `/api/users/<id>`: status **401**, no cookie in the request headers.
3. Change one character of the id in the address bar: still 401. The server checks sign-in **before** it
   looks for the user (server stage 10), so it does not even reveal whether the id exists.
4. Send the same request from `server/api.http` after "sign in": there it works. The browser has not
   signed in yet. That is stage 12.

## Exercise

Make the error friendlier: when the error message contains "authorization", show
"Please sign in to see this profile." instead. (Stage 14 will do something better: redirect to the
sign-in page.)
