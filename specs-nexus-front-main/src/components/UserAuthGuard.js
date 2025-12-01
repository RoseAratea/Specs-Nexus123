import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const UserAuthGuard = ({ children }) => {
  const location = useLocation();
  const token = localStorage.getItem('access_token');
  let isAuthenticated = !!token;

  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiry = payload.exp * 1000;
      if (Date.now() > expiry) {
        console.log('UserAuthGuard: Token expired, redirecting to /');
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_id');
        isAuthenticated = false;
      }
    } catch (error) {
      console.error('UserAuthGuard: Invalid token:', error);
      isAuthenticated = false;
    }
  }

  console.log('UserAuthGuard:', { isAuthenticated, route: location.pathname });

  if (!isAuthenticated) {
    console.log('UserAuthGuard: Redirecting to /');
    return <Navigate to="/" state={{ from: location.pathname }} replace />;
  }

  return children;
};

export default UserAuthGuard;