# Client stage 16 — Deleting your account

**Branch:** `teach/ch03-client-16-delete-user` (starts from `teach/ch03-client-15-edit-profile`)

## Goal

A delete button on your own profile. It asks for confirmation, deletes the account, signs you out and
takes you home. With this, the client uses every route in the server's REST table.

## Build it yourself first

Try the goal on your own before you look at this stage's code. Start from the end of stage 15 and copy
this note into your branch (the instructions on `main`, section 5, explain these commands):

```bash
git fetch upstream
git switch --no-track -c my/ch03-client-16-delete-user upstream/teach/ch03-client-15-edit-profile
git restore --source=upstream/teach/ch03-client-16-delete-user -- ":/Chapter03 and 04/mern-skeleton/client/lessons/16-delete-user.md"
```

**What must be running:** MongoDB, the server (`cd server && npm run dev`) and the client
(`cd client && npm run dev`). Check the server first: `server/api.http` → request **2. List users** answers `200`.

**Your task:**

1. `remove(userId, token)` in `api-user.js`: `DELETE /api/users/<id>` (`delete` is a reserved word).
2. `src/user/DeleteUser.jsx`: a delete button plus a confirm dialog, with its own `open` state. It gets the
   `userId` as a prop.
3. On **Confirm**: delete, then `auth.signout()`, then go home. If the delete fails, show the error in the dialog.
4. Put `<DeleteUser>` next to the Edit button on your own profile.

**Done when:** Deleting a throw-away account signs you out, takes you home, and the name is gone from the list.
Network shows `DELETE /api/users/<id>` (200), then `DELETE /api/auth/sessions`.

**Compare** with the finished stage (from the `client` folder):
`git diff upstream/teach/ch03-client-16-delete-user -- . ":!package-lock.json"`.
To run the finished stage next to yours, see "Check your result" in lesson 06.

## New ideas

- **A component with its own state.** `DeleteUser` is a small component: a button plus a dialog. Its
  `open` state lives inside it, so `Profile` does not need to know about the dialog.
- **Props as input:** `<DeleteUser userId={user._id} />`. The component destructures `{ userId }`.
- **Confirm before destroying.** A dialog with Cancel / Confirm. `onClose` closes it on Escape or a click
  outside. Compare with the signup dialog (stage 12), which has no `onClose` on purpose.
- **Order of steps:** `DELETE /api/users/:id`, then `auth.signout()` (clears the storage and asks the
  server to clear the cookie), then `navigate('/')`. If the DELETE fails, nothing else happens and
  the error is shown in the dialog.
- **`remove`, not `delete`:** `delete` is a reserved word in JavaScript.
- **A fragment as a prop:** `secondaryAction={<>…</>}` passes two buttons where one element is expected.

## The REST table, from the client's side

| Action | Request | Client function | Page |
|---|---|---|---|
| create a user | `POST /api/users` | `create` | Signup (07) |
| list users | `GET /api/users` | `list` | Users (06) |
| read a user | `GET /api/users/:userId` | `read` | Profile (11) |
| update a user | `PATCH /api/users/:userId` | `update` | EditProfile (15) |
| delete a user | `DELETE /api/users/:userId` | `remove` | DeleteUser (16) |
| sign in | `POST /api/auth/sessions` | `signin` | Signin (12) |
| sign out | `DELETE /api/auth/sessions` | `signout` | Menu, DeleteUser (13, 16) |

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
