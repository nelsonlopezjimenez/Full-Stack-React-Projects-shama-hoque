# Client stage 03 — A form: sign up

**Branch:** `teach/ch03-client-03-signup-form`

## Goal

Create users from the page instead of `api.http`: a form that sends `POST /api/users`, shows the
server's validation messages, and refreshes the list after a success.

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
   The message comes from the server (the Mongoose schema, server stage 03, made readable in stage 08).
2. Create a user. The fields empty, "Successfully signed up!" appears, and the new name is in the list.
3. Submit the same email again: "Email already exists", the 400 from server stage 08.
4. React DevTools (browser extension) → **Components** → `Signup`: watch `values` change while you type.
5. In `App.jsx`, remove `key={version}` and create a user: the list does not update until you reload.

## Exercise

Disable the button while the request is running (`<button disabled={...}>`). You need one more piece
of state; when do you set it to `true`, and when back to `false`?
