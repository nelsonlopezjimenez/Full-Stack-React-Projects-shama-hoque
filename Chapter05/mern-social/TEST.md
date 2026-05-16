# Testing Guide — mern-social

## Why automated tests?

Running the app by hand in a browser works, but it has two problems:

1. **It is slow.** You have to click through every feature every time you change something.
2. **It depends on live data.** If MongoDB has different records on two machines,
   the same code can behave differently — a real issue in this project (see below).

Automated tests solve both problems: they run in milliseconds, they do not need a
running server or database, and they produce the same result on every machine.

---

## Thought process: choosing what to test and how

The goal was to build up from the simplest possible test to a real component test,
introducing one new concept at a time. The four levels follow a natural dependency order:

```
Level 1  Pure function — no imports from our code, no browser, no database
   ↓
Level 2  Module that reads process.env — needs module-cache reset between tests
   ↓
Level 3  Client utility that touches sessionStorage — needs a fake browser (jsdom)
   ↓
Level 4  React component — needs jsdom + mocked dependencies + router context
```

**Why this order?**  
Each level adds exactly one new challenge. If a Level 4 test fails you can be
confident the problem is in the component, not in the utilities it calls
(those are already proven at lower levels).

---

## Test infrastructure added

### Config files

| File | What it does |
|---|---|
| `server/vitest.config.js` | Tells Vitest to run in Node environment, look for tests under `tests/` |
| `client/vite.config.js` | Added `test` block: jsdom environment + setup file |
| `client/src/test/setup.js` | Imports `@testing-library/jest-dom` so DOM matchers like `toBeInTheDocument()` are available in every client test |

### `client/vite.config.js` test block added

```js
test: {
  environment: 'jsdom',      // simulate a browser inside Node.js
  setupFiles: ['./src/test/setup.js'],
  globals: true,
}
```

### npm scripts added

| Command | Where to run | What it does |
|---|---|---|
| `npm test` | `server/` or `client/` | Run all tests once, then exit |
| `npm run test:watch` | `server/` or `client/` | Re-run tests on every file save |
| `npm run test:server` | repo root | Delegates to `server/npm test` |
| `npm run test:client` | repo root | Delegates to `client/npm test` |

---

## Test files added

### Level 1 — Pure function (no deps, no environment)

**`server/tests/unit/dbErrorHandler.test.js`**

Tests the `getErrorMessage(err)` helper that formats MongoDB and Mongoose errors
into user-readable strings.

**Why this was a good first test:**  
`getErrorMessage` has zero imports from our own code, no side effects, and no I/O.
Input goes in, string comes out. This is the easiest possible test to write.

**Key lesson discovered:**  
The parser uses `err.message.lastIndexOf('.$')` to find the field name in a MongoDB
duplicate-key error. This assumes the **older MongoDB message format**:

```
E11000 duplicate key error index: test.users.$email_1 dup key: {}
                                           ^^
                                           ".$" is the anchor the parser looks for
```

Newer MongoDB versions emit a different format (`index: email_1` without `.$`).
If you ever see `getErrorMessage` return a garbled string like
`"11000 duplicate key error... already exists"` instead of `"Email already exists"`,
this is why. The test documents the expected input format.

**Tests written:**

```
✓ extracts the field name from the error message (code 11000)
✓ handles code 11001 the same way
✓ falls back gracefully when the message is missing entirely (catch block fires)
✓ returns the message from the first failing validator (Mongoose validation)
✓ returns a non-empty string when multiple fields fail
✓ returns "Something went wrong" for an unrecognised error code
✓ returns an empty string when there are no errors at all
```

---

### Level 2 — Config defaults (module-cache reset)

**`server/tests/unit/config.test.js`**

Tests that `config/config.js` reads the correct defaults from `process.env`.

**New challenge:**  
`config.js` evaluates `process.env` at **import time**, not at call time.
Node caches imported modules, so the first import wins and later `process.env`
changes are ignored. The solution:

```js
beforeEach(() => {
  vi.resetModules()          // clears the module cache
})

it('reads PORT from env', async () => {
  process.env.PORT = '8080'
  const { default: config } = await import('../../config/config.js')  // fresh import
  expect(Number(config.port)).toBe(8080)
})
```

**Key concept:** `vi.resetModules()` + dynamic `import()` is the standard pattern
for testing modules that read from environment variables.

**Tests written:**

```
✓ uses default port 3333 when PORT is not set
✓ reads PORT from the environment when provided
✓ falls back to the placeholder jwtSecret when JWT_SECRET is absent
✓ reads JWT_SECRET from the environment when provided
✓ falls back to "development" when NODE_ENV is not set
```

---

### Level 3 — Client utility with browser APIs (sessionStorage)

**`client/src/__tests__/auth-helper.test.js`**

Tests the `auth-helper` object: `isAuthenticated()`, `authenticate()`, `signout()`.

**New challenges:**

1. **jsdom environment** — `sessionStorage` exists in test because `vite.config.js`
   sets `environment: 'jsdom'`. Without this, `window` is undefined and the tests crash.

2. **Mocking a module** — `auth-helper` calls `signout()` from `api-auth.jsx`,
   which makes a real `fetch` HTTP request. We replace it with a stub:

   ```js
   vi.mock('../auth/api-auth.jsx', () => ({
     signout: vi.fn().mockResolvedValue({ message: 'signed out' }),
   }))
   ```

   `vi.fn()` creates a *spy function* — a fake that records every call and
   returns whatever we configure. No HTTP request is ever made.

3. **Test isolation** — `beforeEach(() => sessionStorage.clear())` prevents
   one test's stored data from leaking into the next test.

**Tests written:**

```
✓ isAuthenticated() returns false when nothing is stored
✓ isAuthenticated() returns the stored JWT object after authenticate()
✓ authenticate() stores the JWT in sessionStorage
✓ authenticate() calls the callback
✓ signout() removes the JWT from sessionStorage
✓ signout() calls the callback
✓ isAuthenticated() returns false after signout
```

---

### Level 4 — React component test

**`client/src/__tests__/Menu.test.jsx`**

Tests the `Menu` component: correct links shown for guests vs. signed-in users.

**New challenges:**

1. **Rendering a component** — `render(<Menu />)` mounts the component into
   the jsdom DOM. `screen` provides queries to find what was rendered:

   ```js
   screen.getByText('Sign up')       // throws if not found — use for "must exist"
   screen.queryByText('My Profile')  // returns null if not found — use for "must NOT exist"
   ```

2. **Router context** — `Menu` uses `Link` and `useNavigate` from react-router.
   Those require a router provider. We use `MemoryRouter` (no real URL bar needed):

   ```jsx
   render(
     <MemoryRouter initialEntries={['/']}>
       <Menu />
     </MemoryRouter>
   )
   ```

3. **Controlling auth state** — `Menu` calls `auth.isAuthenticated()` to decide
   which links to show. We mock the whole module and control the return value per test:

   ```js
   vi.mock('../auth/auth-helper', () => ({
     default: { isAuthenticated: vi.fn(), signout: vi.fn() }
   }))

   auth.isAuthenticated.mockReturnValue(false)          // guest view
   auth.isAuthenticated.mockReturnValue(fakeAuthObject) // logged-in view
   ```

4. **`vi.clearAllMocks()` in `beforeEach`** — resets call counts and return values
   so each test group starts clean.

**Tests written:**

```
✓ shows Sign up and Sign In links (guest)
✓ does NOT show My Profile or Sign out (guest)
✓ shows My Profile and Sign out (signed in)
✓ does NOT show Sign up or Sign In (signed in)
✓ includes the user id in the My Profile link href
```

---

## Running the tests

```bash
# from repo root — run all tests for one package
npm run test:server
npm run test:client

# from within a package — run once
cd server && npm test
cd client && npm test

# watch mode (re-runs on save — useful while writing code)
cd server && npm run test:watch
cd client && npm run test:watch
```

### Expected output (all passing)

**Server:**
```
 Test Files  2 passed (2)
      Tests  12 passed (12)
   Duration  ~135ms
```

**Client:**
```
 Test Files  2 passed (2)
      Tests  12 passed (12)
   Duration  ~1.2s
```

---

## Running on another machine — what to expect

### These tests are machine-independent

All four test levels are **unit tests**: they do not connect to MongoDB, do not
start the Express server, and do not make HTTP requests. The only runtime
dependency is Node.js and the installed `node_modules`.

**Steps on a fresh machine:**

```bash
git pull                         # get the latest branch
cd server  && npm install        # install server deps (includes vitest)
cd ../client && npm install      # install client deps (includes vitest + testing-library)

# run from repo root
npm run test:server
npm run test:client
```

Both commands should produce identical output regardless of:
- Which MongoDB data is present
- Whether the server is running
- Whether `.env` exists
- What was imported/exported between machines

### Why the app behaved differently before (but tests don't)

The earlier issues — 400 "User not found" errors, `CastError` in the feed — happened
because the **JWT stored in sessionStorage** referenced a MongoDB `_id` that did not
exist in the database on the second machine. That is a **data problem**, not a code
problem:

```
Machine A: user _id = 64a1f2e3...  (created here, exists in Mongo A)
Machine B: JWT copied over, but   (Mongo B has no document with that _id)
           → lookups return null  → 400 errors
```

Unit tests bypass this entirely because they never touch the database.

### When you *will* see machine-dependent test failures

Integration tests (not yet written) that start the real Express server and hit
a real MongoDB will depend on data. When that layer is added, the typical pattern
is to use `mongodb-memory-server` — an in-process MongoDB that starts empty,
gets seeded by the test, and is destroyed when the test finishes:

```
mongodb-memory-server  ← spins up in-memory Mongo, same on every machine
      ↓ seed test data
      ↓ run test
      ↓ verify response
      ↓ tear down
```

That level of test will be added as a future step (Level 5+).
