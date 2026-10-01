# Stage 04 — Read one user

**Branch:** `teach/ch03-server-04-read-one`

## Goal

`GET /api/users/:userId` returns a single user.

## New ideas

- **Route parameters.** In `/api/users/:userId`, the `:userId` part matches anything, and Express gives
  you the value in `req.params.userId`.
- **Collection vs item.** `/api/users` is the whole collection and `/api/users/<id>` is one item. This is
  the second REST idea after "the method is the verb".
- **`findById`.** Returns the document, or `null` when nothing has that id.
- **404 Not Found**, sent as JSON: `{ "error": "User not found" }`.
- **`return res...`.** `return` ends the handler early, so the code below it (the second answer) does
  not run.

| Method | Path | Does |
|---|---|---|
| GET | `/api/users` | list all users |
| POST | `/api/users` | create a user |
| **GET** | **`/api/users/:userId`** | **read one user** |

## Try it

1. Send request 7 (it stores the first user's id), then request 8.
2. Request 9 uses an id with the right shape (24 hex characters) that nobody has → 404.
3. Request 10 uses `not-an-id`. Mongoose cannot even turn it into an ObjectId (a *CastError*), and
   we get an HTML 500 again. It is the client's mistake, so it should be a 400. Stage 08 fixes it.

## Why "list all" came before "read one"

Listing all users is just `find()`. Reading one user needs route parameters, a "not found" case and
invalid ids, so it has more new ideas.

## Exercise

Change the route so it answers 404 with `{ "error": "No user with id <the id>" }`, using a template literal.
