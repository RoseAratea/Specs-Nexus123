import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FaUser, 
  FaHome, 
  FaCalendarAlt, 
  FaBullhorn, 
  FaMoneyBill, 
  FaSignOutAlt,
  FaBars,
  FaCertificate 
} from 'react-icons/fa';
import '../styles/Sidebar.css';

const Sidebar = ({ user, isOpen, isMobile, onToggle, onOpenLogoutModal }) => {
  const location = useLocation();

  const sidebarClass = isOpen ? 'sidebar' : 'sidebar collapsed';

  return (
    <div className={sidebarClass}>
      {isMobile && (
        <div className="hamburger-container">
          <button 
            className="hamburger-btn" 
            onClick={onToggle} 
            >
            <FaBars className="hamburger-icon" />
          </button>
        </div>
      )}
      
      <div className="profile-container">
        <div className="profile-icon">
          <FaUser />
        </div>
        {isOpen && (
          <div className="user-info">
            <h3>{user?.full_name || 'User'}</h3>
            <p>{user?.student_number || 'Loading...'}</p>
          </div>
        )}
      </div>
      
      <nav>
        <ul>
          <li>
            <Link to="/dashboard" className={location.pathname === '/dashboard' ? 'active' : ''}>
              <span className="nav-icon"><FaHome /></span>
              {isOpen && <span className="nav-text">Dashboard</span>}
            </Link>
          </li>
          <li>
            <Link to="/profile" className={location.pathname === '/profile' ? 'active' : ''}>
              <span className="nav-icon"><FaUser /></span>
              {isOpen && <span className="nav-text">Profile</span>}
            </Link>
          </li>
          <li>
            <Link to="/events" className={location.pathname === '/events' ? 'active' : ''}>
              <span className="nav-icon"><FaCalendarAlt /></span>
              {isOpen && <span className="nav-text">Events</span>}
            </Link>
          </li>
          <li>
            <Link to="/announcements" className={location.pathname === '/announcements' ? 'active' : ''}>
              <span className="nav-icon"><FaBullhorn /></span>
              {isOpen && <span className="nav-text">Announcements</span>}
            </Link>
          </li>
          <li>
            <Link to="/membership" className={location.pathname === '/membership' ? 'active' : ''}>
              <span className="nav-icon"><FaMoneyBill /></span>
              {isOpen && <span className="nav-text">Membership</span>}
            </Link>
          </li>
          <li>
            <Link to="/certificates" className={location.pathname === '/certificates' ? 'active' : ''}>
              <span className="nav-icon"><FaCertificate /></span>
              {isOpen && <span className="nav-text">My e-Certificates</span>}
            </Link>
          </li>
        </ul>
      </nav>
      
      <button className="logout-btn" onClick={onOpenLogoutModal}>
        <span className="nav-icon"><FaSignOutAlt /></span>
        {isOpen && <span className="nav-text">Logout</span>}
      </button>
    </div>
  );
};

export default Sidebar;