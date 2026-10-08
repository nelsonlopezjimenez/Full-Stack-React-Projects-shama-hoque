# Client stage 12 — Deleting your account

**Branch:** `teach/ch03-client-12-delete-user`

## Goal

A delete button on your own profile. It asks for confirmation, deletes the account, signs you out and
takes you home. With this, the client uses every route in the server's REST table.

## New ideas

- **A component with its own state.** `DeleteUser` is a small component: a button plus a dialog. Its
  `open` state lives inside it, so `Profile` does not need to know about the dialog.
- **Props as input:** `<DeleteUser userId={user._id} />`. The component destructures `{ userId }`.
- **Confirm before destroying.** A dialog with Cancel / Confirm. `onClose` closes it on Escape or a click
  outside. Compare with the signup dialog (stage 08), which has no `onClose` on purpose.
- **Order of steps:** `DELETE /api/users/:id`, then `auth.signout()` (clears the storage and asks the
  server to clear the cookie), then `navigate('/')`. If the DELETE fails, nothing else happens and
  the error is shown in the dialog.
- **`remove`, not `delete`:** `delete` is a reserved word in JavaScript.
- **A fragment as a prop:** `secondaryAction={<>…</>}` passes two buttons where one element is expected.

## The REST table, from the client's side

| Action | Request | Client function | Page |
|---|---|---|---|
| create a user | `POST /api/users` | `create` | Signup (03) |
| list users | `GET /api/users` | `list` | Users (02) |
| read a user | `GET /api/users/:userId` | `read` | Profile (07) |
| update a user | `PATCH /api/users/:userId` | `update` | EditProfile (11) |
| delete a user | `DELETE /api/users/:userId` | `remove` | DeleteUser (12) |
| sign in | `POST /api/auth/sessions` | `signin` | Signin (08) |
| sign out | `DELETE /api/auth/sessions` | `signout` | Menu, DeleteUser (09, 12) |

## What changed

| File | What |
|---|---|
| `src/user/DeleteUser.jsx` | new |
| `src/user/api-user.js` | `remove(userId, token)` |
| `src/user/Profile.jsx` | `<DeleteUser>` next to the Edit button |

## Try it

1. Create a throw-away account, sign in, open **My Profile**, press the bin: the dialog. Press Escape:
   it closes. Press the bin again and **Confirm**: you are home and signed out, and the name has gone from **Users**.
2. Network: `DELETE /api/users/<id>` (200) followed by `DELETE /api/auth/sessions`.
3. Sign in as user A, copy A's token from Session storage, sign out, sign in as B, and send
   `DELETE /api/users/<B's id>` with A's token from `server/api.http`: 403. The server checks who is
   deleting whom, not the client.

## Exercise

Show the user's name in the dialog: "Delete the account of Ann?". `DeleteUser` only gets `userId`; what
would you pass from `Profile`, and what does the dialog text become?
