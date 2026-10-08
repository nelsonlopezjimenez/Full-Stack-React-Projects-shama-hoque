# Client stage 20 — Tests

**Branch:** `teach/ch03-client-20-tests` (starts from `teach/ch03-client-19-production`)

## Goal

Automatic checks for the parts of the client that are easy to break without noticing: the session
helper, the request helper, the menu and the route guard. The same four levels as the server tests
(server lesson 19), from a plain function to routing.

## Build it yourself first

Try the goal on your own before you look at this stage's code. Start from the end of stage 19 and copy
this note into your branch (the instructions on `main`, section 5, explain these commands):

```bash
git fetch upstream
git switch --no-track -c my/ch03-client-20-tests upstream/teach/ch03-client-19-production
git restore --source=upstream/teach/ch03-client-20-tests -- ":/Chapter03 and 04/mern-skeleton/client/lessons/20-tests.md"
```

**What must be running:** nothing. Tests fake every request, so neither the server nor MongoDB is
needed (`npm test` runs in the `client` folder).

This stage adds packages. To get exactly the versions of the finished stage, copy its
`package.json` and `package-lock.json` and install (from the `client` folder):
`git restore --source=upstream/teach/ch03-client-20-tests -- package.json package-lock.json`, then `npm install`.

**Your task:**

1. `npm install -D vitest jsdom @testing-library/react @testing-library/jest-dom` (or copy the finished
   stage's package files) and add the scripts `test` (`vitest run`) and `test:watch` (`vitest`).
2. In `vite.config.js`: `test: { environment: 'jsdom', setupFiles: … }`; a `src/test/setup.js` that adds the
   jest-dom matchers and cleans up after each test.
3. Four test files, one per level: the session helper, `request()` with a fake `fetch`, the rendered `Menu`,
   and `PrivateRoute` inside a `MemoryRouter`.

**Done when:** `npm test` passes, and each of the three breakages in "Try it" makes at least one test fail.

**Compare** with the finished stage (from the `client` folder):
`git diff upstream/teach/ch03-client-20-tests -- . ":!package-lock.json"`.
To run the finished stage next to yours, see "Check your result" in lesson 06.

## New ideas

- **Vitest** is a test runner made for Vite. It reuses `vite.config.js`, so tests can import `.jsx` files and
  images exactly like the app. `npm test` runs once; `npm run test:watch` re-runs on every save.
- **jsdom** is a fake browser in Node: `document`, `sessionStorage`, `atob`. Tests run without opening a real browser.
- **Testing Library** renders a component and looks for things **the way a user does**: by role and visible
  name (`getByRole('link', { name: 'Sign In' })`), not by CSS classes or component internals. A test written
  this way keeps passing when the markup is refactored, as long as the user sees the same page.
- **Fakes:**
  - `vi.mock(module)` replaces a whole module (the sign-out request must not really be sent)
  - `vi.stubGlobal('fetch', vi.fn(...))` replaces `fetch` and records how it was called
  - `MemoryRouter` keeps the URL in memory, so `NavLink` and `<Navigate>` work in a test
- **`setup.js`** runs before every test file: it adds matchers like `toBeInTheDocument()`, and after each test it
  empties the page and `sessionStorage`, so no test depends on another.

## The four levels

| File | What it tests | Fakes |
|---|---|---|
| `1-auth-helper.test.js` | plain JavaScript + `sessionStorage`: stored session, expired token, garbage, sign-out | `vi.mock` for the API |
| `2-request.test.js` | what `request()` sends (PATCH, JSON, Bearer) and how it reports 401 / server down | `vi.stubGlobal('fetch')` |
| `3-Menu.test.jsx` | a rendered component: signed-in vs signed-out buttons, `active` link | `MemoryRouter` |
| `4-PrivateRoute.test.jsx` | routing: redirect to `/signin` with `from`, or the protected page | `MemoryRouter` + `<Routes>` |

Each test protects a lesson: expired tokens (13), the Bearer header and `{ error, status }` (08, 13),
the menu switch (13), `NavLink end` (10), `from` + `Outlet` (14).

## What changed

| File | What |
|---|---|
| `package.json` | scripts `test`, `test:watch`; `vitest`, `jsdom`, `@testing-library/react`, `@testing-library/jest-dom` |
| `vite.config.js` | `test: { environment: 'jsdom', setupFiles }` |
| `src/test/` | `setup.js`, `helpers.js` (a fake JWT, `signInAs()`), four test files |
| `README.md` | final version, with a "Lessons" table |

## Try it

```bash
npm test
npm run test:watch
```

Then break something on purpose and watch which test fails:

1. In `auth-helper.js`, make `isExpired` always return `false`.
2. In `Menu.jsx`, remove `end` from the Home icon.
3. In `PrivateRoute.jsx`, drop `state={{ from: location }}`.

The server does not need to be running: every request in these tests is faked.

## Exercise

Write a fifth test file, `5-FormError.test.jsx`: `FormError` renders nothing without a message, and a
`role="alert"` element with the text when there is one. Which level is it?
