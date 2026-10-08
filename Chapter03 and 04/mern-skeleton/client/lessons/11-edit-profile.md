# Client stage 11 — Editing your profile (PATCH, 403)

**Branch:** `teach/ch03-client-11-edit-profile`

## Goal

An "Edit" button on your own profile opens a form that is already filled in. Saving sends only the
fields you filled, and someone else's profile cannot be changed, even if you type the URL yourself.

## New ideas

- **A form filled from the server.** The effect loads the user and copies `name` and `email` into the form
  state. The password field stays empty: the server never sends passwords or hashes (server stage 09b).
- **Functional state updates:** `setValues((v) => ({ ...v, name: data.name }))` starts from the latest state.
- **`PATCH` sends only what changes** (server stage 06). `password: values.password || undefined` leaves an
  empty password out of the JSON, because `JSON.stringify` drops `undefined` values. So "leave empty to keep
  the current password" works.
- **Showing a button only to the owner**: `jwt.user._id === user._id`. That is for the looks only: the
  server's `hasAuthorization` (server stage 11) answers **403** to anyone else.
- **401 vs 403** in the browser: 401 = "who are you?" (sent to `/signin`), 403 = "I know who you are, and
  you may not" (shown as an error).
- **Nested routes under one guard:** `/users/:userId/edit` sits next to the profile inside the same
  `PrivateRoute`.

## What changed

| File | What |
|---|---|
| `src/user/EditProfile.jsx` | new |
| `src/user/api-user.js` | `update(userId, token, user)` with `PATCH` |
| `src/user/Profile.jsx` | `isOwnProfile`, Edit button as the list item's `secondaryAction` |
| `src/MainRouter.jsx` | route `/users/:userId/edit` inside `PrivateRoute` |

## Try it

1. Sign in, open **My Profile**, press the pencil. Change your name and press Submit: you are back on the
   profile with the new name. Network → the PATCH request → Payload: no `password` key.
2. Open another user's profile: no pencil. Now add `/edit` to the URL yourself and submit: "User is not
   authorized" (403). The client hid the button, and the server enforced the rule.
3. Edit your own email to one that another user has: "Email already exists" (the same 400 as at sign-up).
4. Change your password, sign out, and sign in with the new one.

## Exercise

After you change your name, the session in sessionStorage still has the old `user.name`. Nothing shows it
yet, but if the menu said "Hello, Ann" it would be wrong. Where would you update the stored session after
a successful PATCH? (Hint: `auth.authenticate({ ...jwt, user: data })`.)
