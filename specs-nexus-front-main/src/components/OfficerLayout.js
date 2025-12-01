import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import OfficerSidebar from './OfficerSidebar';
import Header from './Header';
import LogoutModal from './LogoutModal';
import '../styles/OfficerLayout.css';

const OfficerLayout = ({ children }) => {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [officer, setOfficer] = useState({});
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    const savedState = localStorage.getItem('sidebarOpen');
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
    localStorage.setItem('sidebarOpen', JSON.stringify(isSidebarOpen));
  }, [isSidebarOpen]);

  useEffect(() => {
    const officerInfo = JSON.parse(localStorage.getItem('officerInfo'));
    if (officerInfo) setOfficer(officerInfo);
  }, []);

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
    localStorage.removeItem('officerAccessToken');
    localStorage.removeItem('officerInfo');
    navigate('/officer-login');
    handleCloseLogoutModal();
  };

  const contentStyle = isMobile 
    ? { marginLeft: 0 }
    : { marginLeft: isSidebarOpen ? '220px' : '60px' };

  return (
    <div className={`layout-container ${isSidebarOpen ? 'sidebar-open' : ''}`}>
      <OfficerSidebar 
        officer={officer} 
        isSidebarOpen={isSidebarOpen} 
        setIsSidebarOpen={setIsSidebarOpen}
        isMobile={isMobile}
        onOpenLogoutModal={handleOpenLogoutModal}
      />
      {isMobile && isSidebarOpen && (
        <div
          className="sidebar-overlay-ss"
          onClick={handleSidebarOverlayClick}
          aria-hidden="true"
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
      </div>
      <LogoutModal 
        isOpen={isLogoutModalOpen}
        onClose={handleCloseLogoutModal}
        onConfirm={handleLogout}
      />
    </div>
  );
};

export default OfficerLayout;