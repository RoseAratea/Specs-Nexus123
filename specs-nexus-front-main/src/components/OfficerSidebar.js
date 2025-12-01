import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FaUserCircle, 
  FaTachometerAlt, 
  FaCalendarAlt, 
  FaBullhorn, 
  FaUsers, 
  FaTools,
  FaSignOutAlt 
} from 'react-icons/fa';
import '../styles/OfficerSidebar.css';

const OfficerSidebar = ({ officer, isSidebarOpen, setIsSidebarOpen, isMobile, onOpenLogoutModal }) => {
  const location = useLocation();

  return (
    <div className={isSidebarOpen ? 'sidebar' : 'sidebar collapsed'}>
      <div className="profile-container">
        <div className="profile-icon">
          <FaUserCircle />
        </div>
        {isSidebarOpen && (
          <div className="user-info">
            <h3>{officer?.full_name || 'Officer'}</h3>
            <p>{officer?.position || 'Admin'}</p>
          </div>
        )}
      </div>
      
      <nav>
        <ul>
          <li>
            <Link to="/officer-dashboard" className={location.pathname === '/officer-dashboard' ? 'active' : ''}>
              <span className="nav-icon"><FaTachometerAlt /></span>
              {isSidebarOpen && <span className="nav-text">Dashboard</span>}
            </Link>
          </li>
          <li>
            <Link to="/officer-manage-events" className={location.pathname === '/officer-manage-events' ? 'active' : ''}>
              <span className="nav-icon"><FaCalendarAlt /></span>
              {isSidebarOpen && <span className="nav-text">Manage Events</span>}
            </Link>
          </li>
          <li>
            <Link to="/officer-manage-announcements" className={location.pathname === '/officer-manage-announcements' ? 'active' : ''}>
              <span className="nav-icon"><FaBullhorn /></span>
              {isSidebarOpen && <span className="nav-text">Manage Announcements</span>}
            </Link>
          </li>
          <li>
            <Link to="/officer-manage-membership" className={location.pathname === '/officer-manage-membership' ? 'active' : ''}>
              <span className="nav-icon"><FaUsers /></span>
              {isSidebarOpen && <span className="nav-text">Manage Membership</span>}
            </Link>
          </li>
          {officer?.position?.toLowerCase() === 'admin' && (
            <li>
              <Link to="/admin-manage-officers" className={location.pathname === '/admin-manage-officers' ? 'active' : ''}>
                <span className="nav-icon"><FaTools /></span>
                {isSidebarOpen && <span className="nav-text">Manage Officers</span>}
              </Link>
            </li>
          )}
        </ul>
      </nav>
      
      <button className="logout-btn" onClick={onOpenLogoutModal}>
        <span className="nav-icon"><FaSignOutAlt /></span>
        {isSidebarOpen && <span className="nav-text">Logout</span>}
      </button>
    </div>
  );
};

export default OfficerSidebar;