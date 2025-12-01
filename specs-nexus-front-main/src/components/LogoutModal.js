import React, { useState, useEffect, useRef } from 'react';
import '../styles/LogoutModal.css';

const LogoutModal = ({ isOpen, onClose, onConfirm }) => {
  const [isLoading, setIsLoading] = useState(false);
  const modalRef = useRef(null);
  const firstButtonRef = useRef(null);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
    } finally {
      setIsLoading(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !isLoading) {
      onClose();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape' && !isLoading) {
      onClose();
    }
  };

  useEffect(() => {
    if (isOpen && firstButtonRef.current) {
      firstButtonRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay-ss"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title-ss"
      onKeyDown={handleKeyDown}
      ref={modalRef}
    >
      <div className="modal-container-ss">
        <button
          className="modal-close-ss"
          onClick={onClose}
          aria-label="Close modal"
          disabled={isLoading}
        >
          <i className="fas fa-times"></i>
        </button>
        <h2 id="modal-title-ss">Confirm Logout</h2>
        <div className="confirmation-content-ss">
          <p>Are you sure you want to log out?</p>
        </div>
        <div className="confirmation-actions-ss">
          <button
            className="cancel-button-ss"
            onClick={onClose}
            disabled={isLoading}
            ref={firstButtonRef}
          >
            Cancel
          </button>
          <button
            className="confirm-button-ss"
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Logging out...' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal;