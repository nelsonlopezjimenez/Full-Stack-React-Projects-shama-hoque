import { Route, Routes } from 'react-router'
import Home from './core/Home.jsx'
import Menu from './core/Menu.jsx'
import NotFound from './core/NotFound.jsx'
import Signin from './auth/Signin.jsx'
import Users from './user/Users.jsx'
import Signup from './user/Signup.jsx'
import Profile from './user/Profile.jsx'

// [BEGINNER] The book's MainRouter was a class whose componentDidMount removed the CSS that
// server-side rendering had injected (#jss-server-side). No SSR now → a plain function.
//
// [BEGINNER] React Router v6+ (this is v8): <Routes> replaces <Switch>, and each <Route> gets
// an `element` (<Home />) instead of `component={Home}`. `exact` is gone: paths match exactly
// unless they end in `/*`.
// [ADVANCED] <Switch> rendered the FIRST route that matched, so the order mattered. <Routes>
// ranks all routes and picks the most specific one, so the order no longer changes the result.
//
// Page URLs vs API URLs: these paths are React pages, the /api/... paths are the server.
// They use the same plural nouns (/users/:userId ↔ /api/users/:userId) so they are easy to
// connect. The book used /user/:userId.
const MainRouter = () => (
  <>
    {/* [BEGINNER] <>...</> is a Fragment: it groups elements without adding a <div> to the page. */}
    {/* The menu is outside <Routes>, so it is on every page. */}
    <Menu />
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/users" element={<Users />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/signin" element={<Signin />} />
      {/* [BEGINNER] `:userId` is a URL parameter: /users/abc123 shows Profile with userId "abc123". */}
      <Route path="/users/:userId" element={<Profile />} />

      {/* [ADVANCED] React Router's catch-all is still path="*". The Express 5 server writes
          its catch-all as '/{*splat}' (path-to-regexp v8): same idea, different library. */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  </>
)

export default MainRouter
