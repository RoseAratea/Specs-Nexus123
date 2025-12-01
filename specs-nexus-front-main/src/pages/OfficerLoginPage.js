import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import OfficerLoginForm from '../components/OfficerLoginForm';
import '../styles/OfficerLoginPage.css';

const OfficerLoginPage = () => {
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

  const handleLoginSuccess = () => {
    navigate('/officer-dashboard');
  };

  const openModal = () => setShowModal(true);
  const closeModal = () => {
    if (!isMobile) {
      setShowModal(false);
    }
  };

  return (
    <div className="login-page">
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
            Officer Login
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
            <h2 className="welcome-title">Officer Login</h2>
            <OfficerLoginForm onLoginSuccess={handleLoginSuccess} />
            <div className="member-login-link">
              Not an officer? <a href="/">Member login</a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfficerLoginPage;