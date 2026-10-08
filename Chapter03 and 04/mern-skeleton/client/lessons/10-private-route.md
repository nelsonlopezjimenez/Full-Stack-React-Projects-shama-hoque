# Client stage 10 — Protected pages: PrivateRoute

**Branch:** `teach/ch03-client-10-private-route`

## Goal

A signed-out visitor who opens a profile is sent to the sign-in page, and after signing in comes back
to the profile they wanted. A token that expired while the page was open does the same.

## New ideas

- **A layout route.** `<Route element={<PrivateRoute />}>` has no `path`; it wraps child routes. When you
  are signed in it renders `<Outlet />`, the place where the matching child page appears. When you are not,
  it renders `<Navigate to="/signin">`. One wrapper protects any number of pages (stage 11 adds the edit page).
- **Remembering where you wanted to go.** `<Navigate state={{ from: location }}>` passes the current
  location along. `Signin` reads `location.state?.from?.pathname ?? '/'` and goes back there.
- **`replace`** swaps the current history entry instead of adding one, so the Back button does not bounce
  between the profile and the sign-in page.
- **Two checks, two places.**
  - *Before* the request: `PrivateRoute` asks `auth.isAuthenticated()`. That only checks that a token exists
    and has not expired, using the `exp` in its payload. The client cannot check the signature.
  - *After* the request: if the server answers **401** anyway (the token was forged, or the server restarted with a
    new `JWT_SECRET`), `Profile` redirects too (`data.status === 401`). This is why `request()` keeps `status`
    (stage 04).
- **The real protection is on the server.** `PrivateRoute` only makes the page friendly. Anyone can open
  DevTools and change sessionStorage, but nobody can forge a token that the server accepts.

## What changed

| File | What |
|---|---|
| `src/auth/PrivateRoute.jsx` | new |
| `src/MainRouter.jsx` | `/users/:userId` moves inside `<Route element={<PrivateRoute />}>` |
| `src/auth/Signin.jsx` | `from`, `navigate(from, { replace: true })` |
| `src/user/Profile.jsx` | `jwt.token` without `?.`; 401 → `<Navigate to="/signin">` |

## Try it

1. Sign out. Open **Users** and click a name: you are on `/signin`. Sign in: you are on that profile.
   Press Back: you are on the list, not on the sign-in page.
2. Sign in, then in DevTools → Session storage edit `jwt` and change one letter of the token's *last* part
   (the signature). Also delete the cookie `t`. Reload the profile: the client still thinks you are signed in, but the
   server answers 401, and you are sent to `/signin`.
3. Stop the server, set `JWT_EXPIRES_IN=1m` and `JWT_COOKIE_MAX_AGE_MS=60000` in `server/.env`, start it, and
   sign in. Wait a minute and click **My Profile**: `/signin`. Remove the two lines afterwards.

## Exercise

`/users` (the list) is not protected. Move it inside the `PrivateRoute` route. What changes for a
signed-out visitor? Would you keep it that way? (Compare idea L3 in the server checklist: the API list is public too.)
