# Stage 15 — Mass assignment

**Branch:** `teach/ch03-server-15-mass-assignment`

## Goal

A PATCH can only change the fields a user is meant to change: name, email and password.

## The attack (try it on stage 14)

Since stage 06, `update` did `Object.assign(user, req.body, ...)`, copying **everything** the client
sent. A signed-in user can send:

| Body | Effect |
|---|---|
| `{ "created": "1990-01-01" }` | rewrites history (the stage 06 exercise) |
| `{ "hashed_password": "x", "salt": "y" }` | breaks their own sign-in for good (stage 14) |
| `{ "role": "admin" }` | in an app with roles, this is how users make themselves admin |

This is called **mass assignment**, and it is a classic: it once let a user push code to any
project on GitHub (2012). The schema cannot help, because these are real fields.

## The fix: an allow-list

```js
const UPDATABLE_FIELDS = ['name', 'email', 'password']
```

`update` copies **only** these fields from the body, and only the ones that were sent. Everything else
is silently ignored.

- **Allow-list, not deny-list.** Listing what is *forbidden* (`salt`, `hashed_password`, …) fails as
  soon as someone adds a new field and forgets the list. Listing what is *allowed* fails safe.
- `Object.fromEntries` builds an object from `[key, value]` pairs. Together with `filter` and `map`
  it is a common way to pick fields.

## Try it

1. Request 30 → 200. Only the name changed; `created` is the same, and sign-in still works.
2. Request 14 (name only) still leaves the email alone, which is PATCH behaviour.

## Exercise

Sign-up has the same pattern: `new User(req.body)`. Send `{ ..., "created": "1990-01-01" }` to
`POST /api/users`. What is stored? Write a `SIGNUP_FIELDS` allow-list for `create`.
