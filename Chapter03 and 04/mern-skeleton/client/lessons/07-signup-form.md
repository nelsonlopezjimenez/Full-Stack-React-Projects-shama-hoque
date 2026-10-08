# Client stage 07 — A form: sign up

**Branch:** `teach/ch03-client-07-signup-form` (starts from `teach/ch03-client-06-users-list`)

## Goal

Create users from the page instead of `api.http`: a form that sends `POST /api/users`, shows the
server's validation messages, and refreshes the list after a success.

## Build it yourself first

Try the goal on your own before you look at this stage's code. Start from the end of stage 06 and copy
this note into your branch (the instructions on `main`, section 5, explain these commands):

```bash
git fetch upstream
git switch --no-track -c my/ch03-client-07-signup-form upstream/teach/ch03-client-06-users-list
git restore --source=upstream/teach/ch03-client-07-signup-form -- ":/Chapter03 and 04/mern-skeleton/client/lessons/07-signup-form.md"
```

**What must be running:** MongoDB, the server (`cd server && npm run dev`) and the client
(`cd client && npm run dev`). Check the server first: `server/api.http` → request **2. List users** answers `200`.

**Your task:**

1. New file `src/Signup.jsx`: a `<form>` with Name, Email and Password. Keep the three values in **one**
   state object, and give every `<input>` a `value` and an `onChange` (controlled inputs).
2. On submit, call `event.preventDefault()` (or the browser reloads the page) and send the form with `fetch`.
   A POST is the GET of stage 06 plus three options, the same three parts as request **3** in `server/api.http`:
   ```js
   const response = await fetch('/api/users', {
     method: 'POST',                                   // POST {{baseUrl}}/api/users
     headers: { 'Content-Type': 'application/json' },  // Content-Type: application/json
     body: JSON.stringify(values)                      // { "name": …, "email": …, "password": … }
   })
   const data = await response.json()
   if (!response.ok) { /* 400: data.error is the server's message */ }
   ```
   Try this `fetch` in the Console first (with a made-up user), then put it into the component.
3. Show `data.error` in red, or the server's `data.message` after a success, and empty the fields.
4. Show the form and the list together in `App.jsx`. After a success the list must reload. The form and
   the list are siblings, so their parent has to help (stage 02: lifting state up; stage 04: what a new `key` does).

**Done when:** the three answers match `server/api.http`: an empty form shows the same three messages as request **4**
(400; the order may differ, because the form sends empty strings and request 4 sends `{}`), a new user shows "Successfully signed up!" and appears in the list (request **3**, 201), and the same
email again shows "Email already exists" (request **5**, 400). F12 → Network → the POST → **Payload** is the
JSON you sent, **Response** is the server's answer.

**Compare** with the finished stage (from the `client` folder):
`git diff upstream/teach/ch03-client-07-signup-form -- . ":!package-lock.json"`.
To run the finished stage next to yours, see "Check your result" in lesson 06.

## New ideas

- **Controlled inputs.** The value of each `<input>` comes from state (`value={values.email}`), and
  every keystroke updates the state (`onChange`). React state is the "single source of truth" for the form.
- **One handler per field** with a function that returns a function: `handleChange('email')`.
- **`onSubmit` + `event.preventDefault()`.** A `<form>` normally reloads the page when it is submitted;
  `preventDefault()` stops that, so JavaScript can send the data itself.
- **A POST with `fetch`**: `method`, a `Content-Type: application/json` header and `JSON.stringify` the body.
- **`response.ok`.** `fetch` only fails when there is no answer at all. A 400 is still an answer:
  `response.ok` is `false` and the body contains `{ error }`.
- **Props.** `App` passes a function `onCreated` to `Signup`. Data goes *down* as props and events go
  *up* through functions that the parent passed down.
- **Lifting state up** and **`key` as a reset button**: `App` owns a counter that becomes the `key` of
  `<Users>`. A new key → React builds a new `Users` → its effect loads the list again.

## What changed

| File | What |
|---|---|
| `src/Signup.jsx` | new: the form, its state and the POST |
| `src/App.jsx` | holds `version`, renders `<Signup onCreated>` and `<Users key={version}>` |

## Try it

1. Press **Submit** with an empty form: "Name is required. Email is required. Password is required."
   The message comes from the server (the Mongoose schema, server stage 03, made readable in server stage 08).
2. Create a user. The fields empty, "Successfully signed up!" appears, and the new name is in the list.
3. Submit the same email again: "Email already exists", the 400 from server stage 08.
4. React DevTools (browser extension) → **Components** → `Signup`: watch `values` change while you type.
5. In `App.jsx`, remove `key={version}` and create a user: the list does not update until you reload.

## Exercise

Disable the button while the request is running (`<button disabled={...}>`). You need one more piece
of state; when do you set it to `true`, and when back to `false`?
