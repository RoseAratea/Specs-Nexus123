import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const OfficerAuthGuard = ({ children }) => {
  const location = useLocation();
  const token = localStorage.getItem('officerAccessToken');
  let isAuthenticated = !!token;

  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiry = payload.exp * 1000;
      if (Date.now() > expiry) {
        console.log('OfficerAuthGuard: Token expired, redirecting to /officer-login');
        localStorage.removeItem('officerAccessToken');
        localStorage.removeItem('officerInfo');
        isAuthenticated = false;
      }
      if (!payload.sub) {
        console.log('OfficerAuthGuard: Invalid token, missing sub claim');
        localStorage.removeItem('officerAccessToken');
        localStorage.removeItem('officerInfo');
        isAuthenticated = false;
      }
    } catch (error) {
      console.error('OfficerAuthGuard: Invalid token:', error);
      localStorage.removeItem('officerAccessToken');
      localStorage.removeItem('officerInfo');
      isAuthenticated = false;
    }
  }

  console.log('OfficerAuthGuard:', { isAuthenticated, route: location.pathname });

  if (!isAuthenticated) {
    console.log('OfficerAuthGuard: Redirecting to /officer-login');
    return <Navigate to="/officer-login" state={{ from: location.pathname }} replace />;
  }

  return children;
};

export default OfficerAuthGuard;