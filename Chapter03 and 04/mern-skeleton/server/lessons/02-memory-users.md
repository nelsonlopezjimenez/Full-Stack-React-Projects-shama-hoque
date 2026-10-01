# Stage 02 — Users in memory

**Branch:** `teach/ch03-server-02-memory-users`

## Goal

Create users and list them, with JSON in and JSON out, and no database yet, so the only new thing is HTTP.

## New ideas

- **JSON** is text that looks like a JavaScript object: `{ "name": "Ann" }`. APIs use it to send data.
- **HTTP methods.** `GET` reads data and never changes anything. `POST` sends data to create something.
- **Request body.** A POST carries data after the headers. The `Content-Type: application/json` header says
  what kind of data it is.
- **Middleware.** `app.use(express.json())` runs before every route and turns the JSON body into
  `req.body`.
- **Status codes.** `200 OK`, `201 Created`, `404 Not Found`. The first digit is the family:
  2xx success, 4xx the client made a mistake, 5xx the server failed.
- **REST.** The URL names a *thing* (`/api/users`) and the method names the *action*.

| Method | Path | Does |
|---|---|---|
| GET | `/api/users` | list all users |
| POST | `/api/users` | create a user |

## What changed

`server.js` only: `express.json()`, a `users` array, two routes. `api.http` has requests 2–4.

## Try it

1. Send request 3 twice, then request 2. Both users are in the list, each with an `_id`.
2. Save `server.js` (or stop and start the server) and send request 2 again: **the list is empty.**
   Data in a variable lives only as long as the program runs.
3. Send request 4. A user without a name or email is accepted. Nothing checks the data.

Both problems (data lost on restart, no checks) are solved by the next stage: a database with a schema.

## Exercise

Remove `app.use(express.json())`, send request 3 and look at the list. What is stored, and why?
(Put the line back afterwards.)
