import { Route, Routes } from 'react-router'
import Home from './core/Home.jsx'
import Menu from './core/Menu.jsx'
import NotFound from './core/NotFound.jsx'
import Signin from './auth/Signin.jsx'
import Users from './user/Users.jsx'
import Signup from './user/Signup.jsx'
import Profile from './user/Profile.jsx'

const MainRouter = () => (
  <>
    <Menu />
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/users" element={<Users />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/signin" element={<Signin />} />
      <Route path="/users/:userId" element={<Profile />} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  </>
)

export default MainRouter
