import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';
import '../styles/Header.css';

const Header = ({ toggleSidebar, isSidebarOpen, isMobile }) => {
  const location = useLocation();
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  
  // Update the page title based on the current route
  const getPageTitle = () => {
    const path = location.pathname;
    // Remove the slash and capitalize the first letter
    if (path === '/') return 'Home';
    if (path === 'officer-dashboard') return 'Dashboard';
    if (path === '/officer-manage-events') return 'Manage Events';
    if (path === '/officer-manage-announcements') return 'Manage Announcements';
    if (path === '/officer-manage-membership') return 'Manage Membership';
    if (path === '/officer-manage-officers') return 'Manage Officers';
    if (path === '/dashboard') return 'Dashboard';
    return path.substring(1).split('-').map(word => 
      word.charAt(0).toUpperCase() + word.substring(1)
    ).join(' ');
  };
  
  // Update the date and time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 60000); // Update every minute
    
    return () => {
      clearInterval(timer);
    };
  }, []);
  
  // Format the date and time
  const formatDateTime = () => {
    const options = { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    };
    
    return currentDateTime.toLocaleDateString('en-US', options);
  };
  
  return (
    <div className="header">
      <div className="header-left">
        <button 
          className="toggle-sidebar-btn" 
          onClick={toggleSidebar}
          aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          {isSidebarOpen ? <FaTimes /> : <FaBars />}
        </button>
        <h1 className="page-title">{getPageTitle()}</h1>
      </div>
      <div className="datetime">
        {formatDateTime()}
      </div>
    </div>
  );
};

export default Header;