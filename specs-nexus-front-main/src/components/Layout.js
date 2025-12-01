import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import Chatbot from './Chatbot';
import LogoutModal from './LogoutModal';
import '../styles/Layout.css';

const Layout = ({ user, children }) => {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    const savedState = localStorage.getItem('userSidebarOpen');
    if (savedState !== null) {
      return JSON.parse(savedState);
    }
    return window.innerWidth > 768;
  });
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('userSidebarOpen', JSON.stringify(isSidebarOpen));
  }, [isSidebarOpen]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSidebarOverlayClick = () => {
    if (isMobile && isSidebarOpen) {
      setIsSidebarOpen(false);
    }
  };

  const handleOpenLogoutModal = () => {
    setIsLogoutModalOpen(true);
  };

  const handleCloseLogoutModal = () => {
    setIsLogoutModalOpen(false);
  };

  const handleLogout = () => {
    console.log('Logging out: clearing access_token and user_id from localStorage');
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_id');
    navigate('/');
    handleCloseLogoutModal();
  };

  const contentStyle = isMobile 
    ? { marginLeft: 0 }
    : { marginLeft: isSidebarOpen ? '220px' : '60px' };

  return (
    <div className={`layout-container ${isSidebarOpen ? 'sidebar-open' : ''}`}>
      <Sidebar 
        user={user} 
        isOpen={isSidebarOpen}
        isMobile={isMobile}
        onToggle={toggleSidebar}
        onOpenLogoutModal={handleOpenLogoutModal}
      />
      {isMobile && isSidebarOpen && (
        <div
          className="sidebar-overlay-ss"
          onClick={handleSidebarOverlayClick}
        />
      )}
      <div className="main-content" style={contentStyle}>
        <Header 
          toggleSidebar={toggleSidebar} 
          isSidebarOpen={isSidebarOpen}
          isMobile={isMobile}
        />
        <div className="content-wrapper">
          {children}
        </div>
        <Chatbot userId={user?.id || localStorage.getItem('user_id')} token={localStorage.getItem('access_token')} user={user} />
      </div>
      <LogoutModal 
        isOpen={isLogoutModalOpen}
        onClose={handleCloseLogoutModal}
        onConfirm={handleLogout}
      />
    </div>
  );
};

export default Layout;