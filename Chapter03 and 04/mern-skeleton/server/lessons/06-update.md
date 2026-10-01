# Stage 06 — Update a user (and the full REST table)

**Branch:** `teach/ch03-server-06-update`

## Goal

`PATCH /api/users/:userId` changes some fields of a user. With it, the API can create, read, update
and delete users.

## New ideas

- **PATCH vs PUT.** PATCH means "change these fields" and PUT means "replace the whole thing". The client sends
  `{ "name": "Ann B." }` and the email stays as it was, so PATCH is the right verb.
- **`Object.assign(target, ...sources)`** copies properties onto an existing object.
- **`save()` checks the rules again**, so an update cannot store an invalid email.
- **The `updated` field** records when the user last changed.
- **CRUD** = Create, Read, Update, Delete, the four things almost every API does with its data.

## The full REST table

| CRUD | Method | Path | Does |
|---|---|---|---|
| Create | POST | `/api/users` | create a user |
| Read | GET | `/api/users` | list all users |
| Read | GET | `/api/users/:userId` | read one user |
| Update | PATCH | `/api/users/:userId` | change some fields |
| Delete | DELETE | `/api/users/:userId` | delete one user |

There are two URLs and five operations. The method is the verb.

## Try it

1. Send request 7 (stores the id), then request 14: the name changes, and `updated` appears.
2. Request 8 (read): the email is unchanged, which is PATCH behaviour.
3. Request 15: the invalid email is refused, but again as an HTML 500.

## Look back at `server.js`

It is now about 150 lines and does everything:

- configuration (the port, the database address),
- the database schema and model,
- five routes, three of them starting with the **same four lines** (find the user, 404 if missing),
- connecting and starting the server.

It works, but every change means scrolling through everything, and every copied block has to be
fixed three times. The next stage splits it into files, one job per file.

## Exercise

Send `{ "created": "1990-01-01" }` in a PATCH. What happens? Should a user be able to do that?
(Keep the answer for stage 15.)
