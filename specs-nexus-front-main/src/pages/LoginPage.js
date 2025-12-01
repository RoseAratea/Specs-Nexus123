import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../components/LoginForm';
import '../styles/LoginPage.css';

const LoginPage = ({ onLogin }) => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isMobile) {
      setShowModal(true);
    }
  }, [isMobile]);

  const handleLoginSuccess = (accessToken, userId) => {
    onLogin(accessToken, userId);
    navigate('/dashboard');
  };

  const openModal = () => setShowModal(true);
  const closeModal = () => {
    if (!isMobile) {
      setShowModal(false);
    }
  };

  return (
    <div className="login-page">
      <div className="bubble bubble1"></div>
      <div className="bubble bubble2"></div>
      <div className="bubble bubble3"></div>
      <div className="bubble bubble4"></div>
      <div className="bubble bubble5"></div>
      <div className="bubble bubble6"></div>
      <div className="bubble bubble7"></div>
      <div className="bubble bubble8"></div>
      <div className="bubble bubble9"></div>
      <div className="bubble bubble10"></div>

      <div className="top-elements">
        <div className="branding">
          <img src="/images/diamond_design.png" alt="SPECS Logo" className="header-logo" />
          <h1 className="header-title">
            <span className="specs">SPECS</span> <span className="nexus">Nexus</span>
          </h1>
        </div>
        {!isMobile && (
          <button className="login-button" onClick={openModal}>
            <i className="user-icon"></i>
            Login
          </button>
        )}
      </div>

      <div className="container">
        {isMobile ? (
          <>
            <div className="right-section">
              <img src="/images/specslogo.png" alt="SPECS Seal" className="seal-image" />
            </div>
            <div className="left-section">
              <ul className="acronym">
                <li><span>S</span>ociety of</li>
                <li><span>P</span>rogramming</li>
                <li><span>E</span>nthusiasts in</li>
                <li><span>C</span>omputer</li>
                <li><span>S</span>cience</li>
              </ul>
              <div className="seals">
                <img src="/images/gclogo.png" alt="Gordon College Seal" />
                <img src="/images/ccslogo.png" alt="CCS Seal" />
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="left-section">
              <ul className="acronym">
                <li><span>S</span>ociety of</li>
                <li><span>P</span>rogramming</li>
                <li><span>E</span>nthusiasts in</li>
                <li><span>C</span>omputer</li>
                <li><span>S</span>cience</li>
              </ul>
              <div className="seals">
                <img src="/images/gclogo.png" alt="Gordon College Seal" />
                <img src="/images/ccslogo.png" alt="CCS Seal" />
              </div>
            </div>
            <div className="right-section">
              <img src="/images/specslogo.png" alt="SPECS Seal" className="seal-image" />
            </div>
          </>
        )}
      </div>

      {showModal && (
        <div
          className="modal"
          onClick={(e) => {
            if (e.target.classList.contains('modal') && !isMobile) closeModal();
          }}
        >
          <div className={`modal-content ${isMobile ? 'mobile-modal' : ''}`}>
            {!isMobile && <span className="close" onClick={closeModal}>&times;</span>}
            <h2 className="welcome-title">Welcome!</h2>
            <LoginForm onLoginSuccess={handleLoginSuccess} />
            <div className="member-login-link">
              Are you an officer? <a href="/officer-login">Log in here</a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;