# Client stage 12 — Signing in: the browser keeps the cookie

**Branch:** `teach/ch03-client-12-signin` (starts from `teach/ch03-client-11-profile`)

## Goal

A sign-in page. After signing in you land on your own profile, and the 401 from stage 11 is gone,
although the client code does nothing with the token yet.

## Build it yourself first

Try the goal on your own before you look at this stage's code. Start from the end of stage 11 and copy
this note into your branch (the instructions on `main`, section 5, explain these commands):

```bash
git fetch upstream
git switch --no-track -c my/ch03-client-12-signin upstream/teach/ch03-client-11-profile
git restore --source=upstream/teach/ch03-client-12-signin -- ":/Chapter03 and 04/mern-skeleton/client/lessons/12-signin.md"
```

**What must be running:** MongoDB, the server (`cd server && npm run dev`) and the client
(`cd client && npm run dev`). Check the server first: `server/api.http` → request **2. List users** answers `200`.

**Your task:**

1. `src/auth/api-auth.js` with `signin(user)`: `POST /api/auth/sessions` with email and password, like
   request **19** in `server/api.http`.
2. `src/auth/Signin.jsx`: a form like Signup. After a success, go to the user's profile with `useNavigate()`.
3. A route `/signin` and a "Sign In" button in the menu.
4. After signing up, show a dialog (`Dialog`) with a button that leads to `/signin`.

**Done when:** After signing in you land on your profile, and it loads (no 401). F12 → Network → the sign-in request
→ Response is `{ token, user }`, the same as in `api.http`, and its Response Headers have `Set-Cookie: t=…; HttpOnly`.
Your client code does nothing with the token yet: why does the profile load anyway?

**Compare** with the finished stage (from the `client` folder):
`git diff upstream/teach/ch03-client-12-signin -- . ":!package-lock.json"`.
To run the finished stage next to yours, see "Check your result" in lesson 06.

## New ideas

- **`POST /api/auth/sessions`** (server stage 09): signing in *creates a session*. The answer is
  `{ token, user }`, and the response also has a `Set-Cookie: t=<the same token>; HttpOnly; SameSite=Strict`
  header (server stage 13).
- **The browser handles cookies by itself.** It stores `t` and sends it back with every later request to the
  same origin, including `fetch('/api/users/…')`. The server's `getToken` reads the cookie first, so the
  profile loads.
- **`HttpOnly`** means JavaScript cannot read the cookie: `document.cookie` does not show it. A script
  injected into the page (XSS) cannot steal it either. That is the point.
- **`useNavigate()`** changes the page from code: "when the sign-in succeeded, go to the profile".
- **One error message for both failures** ("Email and password don't match."), so the form does not tell
  an attacker which emails exist (server stage 09).
- **`required`** on an input: the browser itself refuses to submit an empty field.
- **A dialog after signing up** (`Dialog`), with a button that leads to the sign-in page.

## What changed

| File | What |
|---|---|
| `src/auth/api-auth.js` | new: `signin(user)` |
| `src/auth/Signin.jsx` | new: the form, `navigate()` to the profile |
| `src/user/Signup.jsx` | the success text becomes a dialog with a "Sign In" button |
| `src/core/Menu.jsx` | "Sign In" button |
| `src/MainRouter.jsx` | route `/signin` |

## Try it

1. Sign up, press **Sign In** in the dialog, sign in with a wrong password: "Email and password don't match.".
2. Sign in correctly: you are on `/users/<your id>` and see your name, email and "Joined".
3. DevTools → **Application** → Cookies → `http://localhost:5173`: cookie `t`, with **HttpOnly** and
   **SameSite Strict** ticked. In the **Console**, type `document.cookie`: an empty string.
4. DevTools → Network → the profile request → Request Headers: `Cookie: t=eyJ…`. The browser added it.
5. Open another user's profile from the list: it loads too. Any signed-in user may *read* any profile.
   Only update and delete check whose profile it is (server stage 11).
6. Now look at the menu: it still says "Sign up" and "Sign In". The page does not know that you are signed
   in, because the cookie is invisible to JavaScript. Stage 13 fixes that.
7. Delete the cookie in DevTools and reload the profile: 401 again.

## Exercise

There is no way to sign out yet. Which HTTP request would sign you out, according to the server's REST
routes? Send it from `server/api.http`, then reload the profile in the browser. Does it still load? Why not?
