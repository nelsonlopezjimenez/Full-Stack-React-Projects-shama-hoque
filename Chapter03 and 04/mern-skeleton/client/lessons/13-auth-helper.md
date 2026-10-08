# Client stage 13 — Who is signed in? The session helper

**Branch:** `teach/ch03-client-13-auth-helper` (starts from `teach/ch03-client-12-signin`)

## Goal

The page knows who is signed in. The menu shows "My Profile" and "Sign out" when you are signed in,
and "Sign up" and "Sign In" when you are not. Signing out really ends the session.

## Build it yourself first

Try the goal on your own before you look at this stage's code. Start from the end of stage 12 and copy
this note into your branch (the instructions on `main`, section 5, explain these commands):

```bash
git fetch upstream
git switch --no-track -c my/ch03-client-13-auth-helper upstream/teach/ch03-client-12-signin
git restore --source=upstream/teach/ch03-client-13-auth-helper -- ":/Chapter03 and 04/mern-skeleton/client/lessons/13-auth-helper.md"
```

**What must be running:** MongoDB, the server (`cd server && npm run dev`) and the client
(`cd client && npm run dev`). Check the server first: `server/api.http` → request **2. List users** answers `200`.

**Your task:**

1. `src/auth/auth-helper.js` with three functions: `authenticate(jwt, cb)` stores `{ token, user }` in
   `sessionStorage`, `isAuthenticated()` returns it (or `false`, also when the token's `exp` has passed), and
   `signout(cb)` clears it and asks the server to delete the cookie.
2. `signout()` in `api-auth.js`: `DELETE /api/auth/sessions`.
3. `request()` gets a `token` option and sends it as `Authorization: Bearer <token>`; `read()` passes it.
4. `Signin` calls `authenticate`; `Menu` shows "My Profile" and "Sign out" when signed in, "Sign up" and
   "Sign In" when not. (The menu must draw again after every page change: `useLocation()`.)

**Done when:** The menu changes after signing in and out; Session storage holds `jwt`; "Sign out" sends
`DELETE /api/auth/sessions`, and afterwards the profile answers 401 again.

**Compare** with the finished stage (from the `client` folder):
`git diff upstream/teach/ch03-client-13-auth-helper -- . ":!package-lock.json"`.
To run the finished stage next to yours, see "Check your result" in lesson 06.

## The problem

After stage 12 the *server* knows who you are (the cookie), but the *page* does not. The cookie is
`HttpOnly` on purpose, so JavaScript cannot read it. The page still needs your id, for the "My Profile" link
and, in stage 15, to show "Edit" only on your own profile.

## New ideas

- **`sessionStorage`** stores strings in the browser, per tab, until the tab is closed. The helper keeps
  `{ token, user }` there (as JSON) after signing in. This is the book's design (decision C3).
- **`auth-helper.js`** has three functions, so no page touches the storage directly:
  - `authenticate(jwt, cb)` stores the session, then calls `cb` (e.g. "go home")
  - `isAuthenticated()` returns `{ token, user }` or `false`
  - `signout(cb)` clears the storage, calls `cb`, and asks the server to clear the cookie
- **Reading a JWT.** The middle part of the token is readable JSON (base64url). The helper reads its `exp`
  and treats an expired token as "signed out". It cannot check the signature; only the server has the
  secret. Paste a token into https://jwt.io to see the same thing (server lesson 13).
- **The `Authorization: Bearer <token>` header.** `request()` adds it when a page passes `token`. The browser
  also sends the cookie, so the server gets the token twice and uses the cookie first.
- **Signing out = `DELETE /api/auth/sessions`.** Only the server can delete an httpOnly cookie
  (`Set-Cookie: t=; Expires=1970…`). The book tried `document.cookie = …`, which cannot touch it.
- **Re-rendering the menu.** `Menu` calls `useLocation()` only so that React draws it again after every
  page change, which is how it notices that you signed in or out.
- **Optional chaining in a call: `cb?.()`** calls `cb` only if it was passed.

## What changed

| File | What |
|---|---|
| `src/auth/auth-helper.js` | new |
| `src/auth/api-auth.js` | `signout()` |
| `src/auth/Signin.jsx` | `auth.authenticate(data, () => navigate('/'))` |
| `src/core/request.js` | `token` option → `Authorization: Bearer` header |
| `src/user/api-user.js` | `read(userId, token, signal)` |
| `src/user/Profile.jsx` | sends `jwt?.token` |
| `src/core/Menu.jsx` | signed-in / signed-out buttons, "Sign out" |

## Try it

1. Sign in. You land on the home page and the menu has changed. **My Profile** opens your profile.
2. DevTools → Application → **Session storage** → `jwt`: `{"token":"eyJ…","user":{…}}`. Copy the token into
   https://jwt.io: `_id`, `iat`, `exp`.
3. Network → the profile request: both `Cookie: t=…` and `Authorization: Bearer …` are sent.
4. Delete the cookie `t` in DevTools and reload the profile: it still works, through the Bearer header. Then
   delete `jwt` from Session storage (keep no cookie) and reload: 401, and the menu says "Sign In".
5. Sign in again and press **Sign out**: Network shows `DELETE /api/auth/sessions`, and the cookie and the
   storage are gone.
6. Sign in, then open a **new tab** on http://localhost:5173: you are signed out there (sessionStorage
   belongs to one tab), but `/users/<your id>` loads in that tab. Why? (The cookie is shared by all tabs.)

## Exercise

`isAuthenticated()` is called in `Menu` on every render. Put a `console.log('isAuthenticated')` in it and
click through the pages. How often does it run? Is that a problem? (It only reads from sessionStorage, so not really.)
