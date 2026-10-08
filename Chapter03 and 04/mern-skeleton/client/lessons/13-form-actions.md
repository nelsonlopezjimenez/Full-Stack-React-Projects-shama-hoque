# Client stage 13 — React 19 form actions

**Branch:** `teach/ch03-client-13-form-actions`

## Goal

Rewrite Signin and Signup with React 19's **form actions**. The page behaves the same, with two small
improvements: the Submit button is disabled while the request runs, and after an error the form keeps
what you typed except the password. Edit Profile keeps controlled inputs, so both styles are in the code to compare.

## New ideas

- **`<form action={fn}>`.** React 19 lets a form call a function with the form's data. No `onSubmit`,
  no `preventDefault()`.
- **`FormData`.** The browser collects every input that has a `name` attribute: `formData.get('email')`,
  or `Object.fromEntries(formData)` for all of them at once.
- **Uncontrolled inputs + `defaultValue`.** The inputs keep their own value while you type (no `useState`
  per field, no `onChange`). After an action finishes, React resets the form to each input's `defaultValue`.
  To keep the email after an error, the action returns it, and it becomes the new `defaultValue`.
- **`useActionState(action, initialState)`** returns `[state, formAction, isPending]`:
  - `state` is whatever the action returned last time (`{ error, email }`)
  - `formAction` goes into `<form action>`
  - `isPending` is `true` while the async action runs. It disables the button and changes its text to "Signing in…".
- **Which one when?** Form actions suit "fill in and send" forms. Controlled inputs suit forms that are
  filled from the server, or that react to every keystroke (live validation, a character counter).

## What changed

| File | What |
|---|---|
| `src/auth/Signin.jsx` | `useActionState`, `name` attributes, `defaultValue`, `isPending` |
| `src/user/Signup.jsx` | the same; the dialog opens from the action's state (`state.open`) |
| `src/user/EditProfile.jsx` | only its comment: it now says it keeps controlled inputs on purpose |

Compare the two styles: `git diff teach/ch03-client-12-delete-user teach/ch03-client-13-form-actions -- src/auth/Signin.jsx`

## Try it

1. Sign up with an email that already exists: the error appears, name and email are still there, the
   password is empty. Sign in with a wrong password: the email is still there.
2. DevTools → Network → throttling "Slow 3G", then sign in: the button says "Signing in…" and is disabled
   until the answer arrives. Set throttling back to "No throttling".
3. Remove `name="email"` from the Signin email field and sign in: the server says the email is missing,
   because `FormData` only collects inputs that have a `name`.

## Exercise

Convert `EditProfile.jsx` to a form action as well. Which part becomes harder? (Hint: the values arrive
from the server *after* the first render, and `defaultValue` is only read when the input is created; look up the `key` trick from stage 03.)
