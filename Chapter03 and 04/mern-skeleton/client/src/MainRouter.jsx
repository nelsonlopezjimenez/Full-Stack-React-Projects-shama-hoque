import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router'
import LinearProgress from '@mui/material/LinearProgress'
import Home from './core/Home.jsx'
import Menu from './core/Menu.jsx'
import NotFound from './core/NotFound.jsx'
import PrivateRoute from './auth/PrivateRoute.jsx'

// [ADVANCED] Code splitting. lazy(() => import(...)) turns each page into its own JS file that
// the browser downloads only when that page is first opened, so the first visit to the home page
// loads less code. `vite build` warned that the single bundle was over 500 kB before this change
// (since stage 08). The small, always-visible parts (Menu, Home) stay in the main bundle.
const Signin = lazy(() => import('./auth/Signin.jsx'))
const Signup = lazy(() => import('./user/Signup.jsx'))
const Users = lazy(() => import('./user/Users.jsx'))
const Profile = lazy(() => import('./user/Profile.jsx'))
const EditProfile = lazy(() => import('./user/EditProfile.jsx'))

// [BEGINNER] The book's MainRouter was a class whose componentDidMount removed the CSS that
// server-side rendering had injected (#jss-server-side). No SSR now → a plain function.
//
// [BEGINNER] React Router v6+ (this is v8): <Routes> replaces <Switch>, and each <Route> gets
// an `element` (<Home />) instead of `component={Home}`. `exact` is gone: paths match exactly
// unless they end in `/*`.
// [ADVANCED] <Switch> rendered the FIRST route that matched, so the order mattered (the book
// had to put /user/edit/:userId before /user/:userId). <Routes> ranks all routes and picks the
// most specific one, so the order no longer changes the result.
//
// Page URLs vs API URLs: these paths are React pages, the /api/... paths are the server.
// They use the same plural nouns (/users/:userId ↔ /api/users/:userId) so they are easy to
// connect. The book used /user/:userId and /user/edit/:userId.
const MainRouter = () => (
  <>
    {/* [BEGINNER] <>...</> is a Fragment: it groups elements without adding a <div> to the page. */}
    <Menu />
    {/* [BEGINNER] While a lazy page's file is downloading, Suspense shows the fallback
        (a thin progress bar) instead of the page. */}
    <Suspense fallback={<LinearProgress />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/users" element={<Users />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/signin" element={<Signin />} />

        {/* Protected pages: everything inside this route needs a signed-in user.
            [ADVANCED] The book only protected the edit page. A profile needs a token anyway
            (GET /api/users/:userId requires sign-in), so it is protected here too instead of
            loading, failing with 401 and then redirecting. */}
        <Route element={<PrivateRoute />}>
          <Route path="/users/:userId" element={<Profile />} />
          <Route path="/users/:userId/edit" element={<EditProfile />} />
        </Route>

        {/* [ADVANCED] React Router's catch-all is still path="*". The Express 5 server writes
            its catch-all as '/{*splat}' (path-to-regexp v8): same idea, different library. */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  </>
)

export default MainRouter
