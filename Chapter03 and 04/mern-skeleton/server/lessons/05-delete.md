# Stage 05 — Delete a user

**Branch:** `teach/ch03-server-05-delete`

## Goal

`DELETE /api/users/:userId` removes a user.

## New ideas

- **Same URL, different method.** `GET /api/users/42` reads user 42 and `DELETE /api/users/42` deletes
  it. The URL says *which thing*, the method says *what to do*. That is the core of REST.
- **`deleteOne()`** on a document removes it from the collection.
- **What to answer.** We send back the deleted user. Some APIs answer `204 No Content` with an empty
  body instead. Both are fine; pick one and use it everywhere.

| Method | Path | Does |
|---|---|---|
| GET | `/api/users` | list all users |
| POST | `/api/users` | create a user |
| GET | `/api/users/:userId` | read one user |
| **DELETE** | **`/api/users/:userId`** | **delete one user** |

## Try it

1. Request 11 creates Dan. Copy his `_id` from request 2 into `@deleteId`.
2. Request 12 deletes him (200). Request 13 does it again: 404, because he is gone.
3. Notice that `server.js` now has the same four lines in two routes:
   find the user, and answer 404 if there is none. Remember this; it comes back in stage 07.

## Exercise

Change the delete route to answer `204` with no body (`res.status(204).end()`). What does
request 12 show now? Change it back afterwards. The later stages and the React client expect the user.
