import React, { useState } from 'react';
import '../styles/ConfirmationModal.css';

const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = "Confirm", 
  cancelText = "Cancel",
  type = "default", // default, danger, success
  icon,
  isLoading = false
}) => {
  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          iconClass: 'fa-exclamation-triangle',
          iconColor: '#dc2626',
          confirmButtonClass: 'btn-danger'
        };
      case 'success':
        return {
          iconClass: 'fa-check-circle',
          iconColor: '#16a34a',
          confirmButtonClass: 'btn-success'
        };
      default:
        return {
          iconClass: 'fa-question-circle',
          iconColor: '#2563eb',
          confirmButtonClass: 'btn-primary'
        };
    }
  };

  const typeStyles = getTypeStyles();

  return (
    <div className="confirmation-modal-overlay" onClick={onClose}>
      <div className="confirmation-modal-container" onClick={e => e.stopPropagation()}>
        <div className="confirmation-modal-header">
          <div className="confirmation-icon-container">
            <i 
              className={`fas ${icon || typeStyles.iconClass}`}
              style={{ color: typeStyles.iconColor }}
            ></i>
          </div>
          <button className="close-confirmation-modal" onClick={onClose} aria-label="Close modal">
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="confirmation-modal-content">
          <h3 className="confirmation-title">{title}</h3>
          <p className="confirmation-message">{message}</p>
        </div>

        <div className="confirmation-modal-footer">
          <button 
            className="btn-cancel" 
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </button>
          <button 
            className={`btn-confirm ${typeStyles.confirmButtonClass}`}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="loading-spinner"></div>
                Processing...
              </>
            ) : (
              <>
                <i className={`fas ${icon || typeStyles.iconClass}`}></i>
                {confirmText}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;