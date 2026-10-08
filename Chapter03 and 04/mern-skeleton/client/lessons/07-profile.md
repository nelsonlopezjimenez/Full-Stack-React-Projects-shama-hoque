# Client stage 07 — URL parameters: one user's profile

**Branch:** `teach/ch03-client-07-profile`

## Goal

Click a user in the list to open their profile at `/users/<id>`. The page loads
`GET /api/users/<id>`, and the server refuses: **401**, you are not signed in. That 401 is the reason for
the next stages.

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
   signed in yet. That is stage 08.

## Exercise

Make the error friendlier: when the error message contains "authorization", show
"Please sign in to see this profile." instead. (Stage 10 will do something better: redirect to the
sign-in page.)
