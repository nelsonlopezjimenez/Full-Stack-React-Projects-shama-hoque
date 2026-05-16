import React from 'react';
import { Navigate, useLocation } from 'react-router';
import auth from './auth-helper';

const PrivateRoute = ({ component: Component }) => {
  const location = useLocation();
  if (auth.isAuthenticated()) {
    return <Component />;
  }
  return (
    <Navigate
      to='/signin'
      state={{ from: location }}
      replace
    />
  );
};

export default PrivateRoute;
