import { Navigate, Outlet, useLocation } from 'react-router'
import auth from './auth-helper.js'

// [BEGINNER] A "layout route": in MainRouter it wraps the protected pages,
//   <Route element={<PrivateRoute />}> ...protected routes... </Route>
// When signed in it renders <Outlet />, the placeholder where the matching child page
// appears. Otherwise it redirects to /signin and remembers where the user wanted to go.
//
// [ADVANCED] Book (React Router 4): PrivateRoute took `component` and wrapped a
// <Route render={...}>. Ch05 kept a `component` prop around <Navigate>. The Outlet version
// protects any number of routes with one wrapper and needs no props.
const PrivateRoute = () => {
  const location = useLocation()

  if (!auth.isAuthenticated()) {
    // `replace`: the protected URL is not kept in history, so "Back" after signing in does
    // not bounce the user to /signin again. Signin.jsx reads state.from to come back here.
    return <Navigate to="/signin" replace state={{ from: location }} />
  }
  return <Outlet />
}

export default PrivateRoute
