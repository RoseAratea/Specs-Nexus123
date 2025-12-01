import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import EventsPage from './pages/EventsPage';
import AnnouncementsPage from './pages/AnnouncementsPage';
import MembershipPage from './pages/MembershipPage';
import ECertificatesPage from './pages/ECertificatesPage';
import OfficerLoginPage from './pages/OfficerLoginPage';
import OfficerDashboardPage from './pages/OfficerDashboardPage';
import OfficerManageEventsPage from './pages/OfficerManageEventsPage';
import OfficerManageAnnouncementsPage from './pages/OfficerManageAnnouncementsPage';
import OfficerManageMembershipPage from './pages/OfficerManageMembershipPage';
import AdminManageOfficerPage from './pages/AdminManageOfficerPage';
import UserAuthGuard from './components/UserAuthGuard';
import OfficerAuthGuard from './components/OfficerAuthGuard';
import Chatbot from './components/Chatbot';

function App() {
  const [userId, setUserId] = useState(null);
  const [token, setToken] = useState(null);

  const checkAuth = useCallback(() => {
    try {
      const storedToken = localStorage.getItem('access_token');
      const storedUserId = localStorage.getItem('user_id');
      if (storedToken && storedUserId) {
        // Basic token expiration check (decode JWT)
        const payload = JSON.parse(atob(storedToken.split('.')[1]));
        const expiry = payload.exp * 1000;
        if (Date.now() > expiry) {
          console.log('Token expired, clearing storage');
          localStorage.removeItem('access_token');
          localStorage.removeItem('user_id');
          setToken(null);
          setUserId(null);
          return;
        }
        console.log('Loaded credentials:', { userId: storedUserId, token: storedToken });
        setToken(storedToken);
        setUserId(parseInt(storedUserId));
      } else {
        console.log('No stored credentials');
      }
    } catch (error) {
      console.error('Authentication check failed:', error);
    }
  }, []);

  useEffect(() => {
    checkAuth();
    const handleStorageChange = () => {
      checkAuth();
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [checkAuth]);

  const handleLogin = useCallback((newToken, newUserId) => {
    localStorage.setItem('access_token', newToken);
    localStorage.setItem('user_id', newUserId);
    setToken(newToken);
    setUserId(newUserId);
    console.log('Login successful:', { userId: newUserId, token: newToken });
  }, []);

  console.log('App rendering:', { userId, token });

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage onLogin={handleLogin} />} />
        <Route path="/officer-login" element={<OfficerLoginPage />} />
        <Route
          path="/dashboard"
          element={
            <UserAuthGuard>
              <DashboardPage />
            </UserAuthGuard>
          }
        />
        <Route
          path="/profile"
          element={
            <UserAuthGuard>
              <ProfilePage />
            </UserAuthGuard>
          }
        />
        <Route
          path="/events"
          element={
            <UserAuthGuard>
              <EventsPage />
            </UserAuthGuard>
          }
        />
        <Route
          path="/announcements"
          element={
            <UserAuthGuard>
              <AnnouncementsPage />
            </UserAuthGuard>
          }
        />
        <Route
          path="/membership"
          element={
            <UserAuthGuard>
              <MembershipPage />
            </UserAuthGuard>
          }
        />
        <Route
          path="/certificates"
          element={
            <UserAuthGuard>
              <ECertificatesPage />
            </UserAuthGuard>
          }
        />
        <Route
          path="/officer-dashboard"
          element={
            <OfficerAuthGuard>
              <OfficerDashboardPage />
            </OfficerAuthGuard>
          }
        />
        <Route
          path="/officer-manage-events"
          element={
            <OfficerAuthGuard>
              <OfficerManageEventsPage />
            </OfficerAuthGuard>
          }
        />
        <Route
          path="/officer-manage-announcements"
          element={
            <OfficerAuthGuard>
              <OfficerManageAnnouncementsPage />
            </OfficerAuthGuard>
          }
        />
        <Route
          path="/officer-manage-membership"
          element={
            <OfficerAuthGuard>
              <OfficerManageMembershipPage />
            </OfficerAuthGuard>
          }
        />
        <Route
          path="/admin-manage-officers"
          element={
            <OfficerAuthGuard>
              <AdminManageOfficerPage />
            </OfficerAuthGuard>
          }
        />
      </Routes>
      {userId && token && (
        <>
          {console.log('Rendering Chatbot with:', { userId, token })}
          <Chatbot userId={userId} token={token} />
        </>
      )}
    </Router>
  );
}

export default App;