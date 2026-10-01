# Stage 11 — Allowed or not: authorization

**Branch:** `teach/ch03-server-11-authorization`

## Goal

Signed-in users can change and delete **their own** account only.

## New ideas

- **Authentication vs authorization.**
  - *Authentication*: who are you? (`requireSignin`, **401** if unknown)
  - *Authorization*: are you allowed to do this? (`hasAuthorization`, **403** if not)
- **`hasAuthorization`** compares the user in the URL (`req.profile`, loaded by `userByID`) with
  the user who signed in (`req.auth`, set by `requireSignin`).
- **`ObjectId.equals()`.** `req.profile._id` is an ObjectId and `req.auth._id` is a string, so
  `===` would always be `false`. `.equals()` compares the two correctly.
- **Middleware chains as a checklist.** Each function checks one thing and stops the request (with
  401, 404 or 403) or passes it on:

```
PATCH /api/users/:userId
  requireSignin  →  userByID  →  hasAuthorization  →  update
     401              404             403             200
```

Reading a profile only needs a sign-in. Changing and deleting also need ownership.

| Status | Meaning | Example |
|---|---|---|
| 401 Unauthorized | I don't know who you are | no cookie |
| 403 Forbidden | I know who you are, and you may not | Ann edits Bob |

(Yes, the name "401 Unauthorized" is confusing; it really means "unauthenticated".)

## Try it

1. Sign in as Ann (request 19), then request 26: 403.
2. Request 14 (Ann edits Ann) still works.
3. Request 27: a hand-made cookie with **Bob's** id passes every check, because the server believes the
   cookie says Bob. Authorization is only as good as the authentication behind it. Stage 12 fixes that.

## Exercise

Let users also *read* only their own profile. Which one line changes? Would the React client's
public "Users" page still work? (It uses `GET /api/users`, not `/api/users/:id`.)
