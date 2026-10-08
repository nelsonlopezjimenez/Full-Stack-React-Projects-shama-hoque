# Chapter 03 teaching ladder (client) — log

Plan: [ch03-client-ladder-checklist.md](ch03-client-ladder-checklist.md)

How each stage was checked: the server of stage 19 ran from a scratch copy on port **3210** with its own
database **`mernskeleton_ladder`** (the real `mernskeleton` data and the server on 3100 were not touched).
For each client stage a script ran `vite build` (into a scratch folder, not `client/dist`) and started
the stage's own `vite.config.js` on port **5210** with `/api` forwarded to 3210. Then headless Edge
(Playwright) opened the pages, filled the forms, and failed on any page error or React warning in the console.
`node_modules` came from the final client, so every stage ran with the final package versions.

---

## Stage 01 — hello (`teach/ch03-client-01-hello`)

- **Changed:** `client/` with `package.json` (react, react-dom, vite, @vitejs/plugin-react; scripts
  `dev` / `build`), `.gitignore` (the migration's), `index.html`, `vite.config.js`, `src/main.jsx`,
  `src/App.jsx`, `README.md`, `lessons/01-hello.md`. The ladder README lists both series.
- **Why:** the smallest React app, so that later files each have a reason to appear.
- **Verified:** build ok; the page shows "MERN Skeleton" and "Hello from React."; no console errors
  (the only 404 is the browser asking for `/favicon.ico`).
- **Lock files:** as in the server series, each stage's `package-lock.json` is the final client lock
  pruned with `npm install --package-lock-only`. Stage 01 lock has 44 packages.

## Stage 02 — users-list (`teach/ch03-client-02-users-list`)

- **Changed:** `src/Users.jsx` (useState, useEffect, fetch, AbortController cleanup, list with `key`),
  `App.jsx` uses it, `vite.config.js` proxies `/api` to port 3000, lesson 02.
- **Why:** state and effects are the two ideas every later page uses. The list is a GET without
  sign-in, so nothing else is needed yet.
- **Verified:** a user created through the API appears in the list; with `/api/users` blocked in
  the browser the page shows "Cannot reach the server"; no React warnings.
- **Note:** no loading state on purpose. The final `Users.jsx` has none, and adding one only to remove
  it later would make a lesson diff go backwards.

## Stage 03 — signup-form (`teach/ch03-client-03-signup-form`)

- **Changed:** `src/Signup.jsx` (controlled inputs, `handleChange(name)`, `onSubmit` + `preventDefault`,
  POST with JSON, `response.ok`), `App.jsx` lifts a `version` counter that is the `key` of `<Users>`, lesson 03.
- **Why:** the first write request from the browser, and props in both directions.
- **Verified:** empty form → "Name is required. Email is required. Password is required."; a valid form
  → "Successfully signed up!", the fields are cleared and the name appears in the list; the same email
  again → "Email already exists".
- **Surprises:** the order of the messages depends on the body. `{}` gives "Password … Email … Name",
  while empty strings (what the form sends) give "Name … Email … Password". The lesson quotes the form's order.

## Stage 04 — request-helper (`teach/ch03-client-04-request-helper`)

- **Changed:** `src/core/request.js` (never throws, `{ error, status }`), `src/user/api-user.js`
  (`create`, `list`), `Users.jsx` and `Signup.jsx` moved into `src/user/` (git sees renames) and call
  the API functions, `vite.config.js` uses `loadEnv` + `API_PROXY_TARGET`, `.env.example`, lesson 04.
- **Why:** the same reason as server stage 07: ten more requests are coming.
- **Verified:** the stage-03 scenario still passes; a failed POST now shows "Cannot reach the server"
  under the form.
- **Changes to the plan:** (1) the folders `core/` and `user/` come here, not in stage 06, because the
  new files need a home and server stage 07 also split by folder. (2) `VITE_API_URL` and
  `credentials: 'include'` move to stage 15. Both are only needed when the client is deployed on another
  origin, and here they would have no visible effect.
- **Surprises:** when Express is down, Vite 8's proxy answers **502 with an empty body**, not a network
  error. So the page shows "Request failed (502)". "Cannot reach the server" only appears when Vite
  itself is gone (or the request is blocked). Lesson 04 shows both.

## Stage 05 — mui (`teach/ch03-client-05-mui`)

- **Changed:** MUI, Emotion and Roboto in `package.json` (lock: 126 packages), Roboto imports in
  `main.jsx`, the theme + `CssBaseline` in `App.jsx`, `core/Home.jsx` and `core/FormError.jsx` (identical to
  the final files), the seashell image, `Users.jsx` and `Signup.jsx` restyled, lesson 05.
- **Why:** plain React first (stages 01–04, decision C4), then the library. The diff of this stage is
  only presentation.
- **Verified:** the home card shows the seashell (the CSS background URL points to the imported file),
  the body font is Roboto, and the full stage-04 scenario (validation, create, duplicate, failed request) passes.
- **Note:** the `<h1>MERN Skeleton</h1>` heading is gone; the title comes back in the app bar in stage 06.
  Signup still shows its success message as text; the dialog with "Sign In" comes with the sign-in page (08).

## Stage 06 — router (`teach/ch03-client-06-router`)

- **Changed:** `react-router` (lock: 129 packages), `App.jsx` gets `BrowserRouter` + `<MainRouter />`,
  new `MainRouter.jsx` (no lazy loading yet), `core/Menu.jsx` (Home, Users, Sign up), `core/NotFound.jsx`
  (identical to the final file), `Signup.jsx` loses the `onCreated` prop, lesson 06.
- **Why:** the next stages need URLs (`/users/:userId`, `/signin`, `/users/:userId/edit`).
- **Verified:** menu → `/signup`, create a user; menu → `/users` shows it; only "Users" has the class
  `active`; Back returns to `/signup`; reloading `/users` works; `/nope/really` → "Page not found"
  with the path, and "Go home" → `/`.

## Stage 07 — profile (`teach/ch03-client-07-profile`)

- **Changed:** `Users.jsx` rows are `ListItemButton component={Link}` with an arrow (now the final
  markup), `api-user.js` gets `read(userId, signal)`, new `user/Profile.jsx` (useParams, effect on
  `[userId]`, abort check), route `/users/:userId`, lesson 07.
- **Why:** the first page the server refuses, which is the reason for signing in.
- **Verified:** clicking a user opens `/users/<24 hex>`; the page shows
  "UnauthorizedError: No authorization token was found" (401).

## Stage 08 — signin (`teach/ch03-client-08-signin`)

- **Changed:** `auth/api-auth.js` (`signin`), `auth/Signin.jsx` (controlled inputs with `required`,
  `useNavigate` to the own profile), Signup's success text becomes the final dialog with the "Sign In"
  link, Menu gets "Sign In", route `/signin`, lesson 08.
- **Why:** decision C3. The cookie alone already makes the protected API work, and the next stage shows
  why the client still keeps `{ token, user }`.
- **Verified:** signup → dialog → "Sign In" → `/signin`; wrong password → "Email and password don't match.";
  right password → own profile with name, email, "Joined"; cookie `t` is httpOnly + SameSite Strict and
  `document.cookie` is empty.
- **Surprises:** (1) `vite build` now warns about a chunk larger than 500 kB (MUI dialogs and text fields
  added up). The warning is kept on purpose; it is the reason for stage 14. (2) The test first typed the
  email while the signup page was still replacing itself with the sign-in page; it now waits for the
  "Sign In" heading. This was a test problem only.

## Stage 09 — auth-helper (`teach/ch03-client-09-auth-helper`)

- **Changed:** `auth/auth-helper.js` and `core/Menu.jsx` (the final files; one comment in the helper
  changed, see below), `signout()` in `api-auth.js`, `token` → Bearer header in `request.js`,
  `read(userId, token, signal)`, Profile sends `jwt?.token`, Signin calls `auth.authenticate(...)`, lesson 09.
- **Why:** the page cannot read the httpOnly cookie, so it keeps `{ token, user }` to know who is signed in (C3).
- **Verified:** signed out → no "My Profile"; sign in → home, "My Profile" and "Sign out" appear,
  sessionStorage holds `{ token, user }`; the profile request carries `Authorization: Bearer`; with all cookies
  cleared the profile still loads (Bearer only); "Sign out" sends `DELETE /api/auth/sessions`, and the storage and
  cookie `t` are gone, so the menu shows "Sign In" again.
- **Comment changed from the migration:** `auth-helper.js` said "switching the API to read that cookie … is the
  more secure design". The ladder's server already reads the cookie first (server D1), so the comment now
  points to "ask the server who am I?" (idea L1) instead.

## Stage 10 — private-route (`teach/ch03-client-10-private-route`)

- **Changed:** `auth/PrivateRoute.jsx` (the final file), the profile route moves inside the layout route,
  Signin goes back to `from` with `replace`, Profile redirects on 401 and uses `jwt.token`, lesson 10.
- **Why:** the friendly side of protection; the server is still the real one.
- **Verified:** signed out, list → profile → `/signin` → sign in → back on that profile; Back → `/users`
  (the sign-in page is not in history); an expired token in sessionStorage → `/signin` without a request;
  a token with a bad signature and no cookie → the server's 401 → `/signin`.

## Stage 11 — edit-profile (`teach/ch03-client-11-edit-profile`)

- **Changed:** `user/EditProfile.jsx` (the final file; its first comment is adjusted until stage 13), `update()`
  with PATCH, Profile shows the Edit button only on the own profile (`secondaryAction`), route
  `/users/:userId/edit` inside `PrivateRoute`, MainRouter comments mention the book's edit URL, lesson 11.
- **Why:** the full create / read / update cycle of the REST table, and 403 seen from the browser.
- **Verified:** the form is prefilled; the PATCH body is `{"name": …, "email": …}` without `password`; the
  profile shows the new name; no Edit link on someone else's profile; typing their `/edit` URL and
  submitting → "User is not authorized" (403).

## Stage 12 — delete-user (`teach/ch03-client-12-delete-user`)

- **Changed:** `user/DeleteUser.jsx` (the final file), `remove()` in `api-user.js`, Profile renders Edit +
  DeleteUser in a fragment (now the final markup), lesson 12 with the client-side REST table.
- **Why:** the last route of the REST table.
- **Verified:** the dialog opens and Cancel closes it; Confirm sends `DELETE /api/users/<id>`, lands on `/`
  signed out ("Sign In" visible, no "My Profile"); the user is missing from the page list and from
  `GET /api/users`.

## Stage 13 — form-actions (`teach/ch03-client-13-form-actions`)

- **Changed:** `Signin.jsx` and `Signup.jsx` become the final files (`useActionState`, `FormData`,
  `defaultValue`, `isPending`; one Signup comment points to "server stage 08" instead of the migration
  checklist step), EditProfile's comment becomes the final one, lesson 13.
- **Why:** decision C5. The same forms in both styles let students compare them.
- **Verified:** empty signup → all messages; a duplicate email keeps name + email and clears the password;
  a wrong sign-in keeps the email; signup → dialog → wrong, then right password → home and signed in; the
  whole stage-10 scenario (redirect, `from`, Back, expired and forged tokens) passes with the new form.
- **Surprises:** the stage-08 test could not be reused here. It expects sign-in to land on the profile,
  but since stage 09 sign-in goes to `from` (or `/`). The test was changed, not the app.

## Stage 14 — lazy-pages (`teach/ch03-client-14-lazy-pages`)

- **Changed:** `MainRouter.jsx` becomes the final file (`lazy` + `Suspense`); two comments no longer cite
  migration checklist step numbers. Lesson 14.
- **Why:** the 500 kB warning that started in stage 08.
- **Verified:** build with no warning; JS files 1 → 17; largest 510 kB → 256 kB. In the browser `Signin.jsx`
  is not requested on `/` and is requested when the sign-in page opens. The stage-11 and stage-12
  scenarios (edit, 403, delete) pass with lazy pages.
