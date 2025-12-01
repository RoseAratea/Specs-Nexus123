import React from 'react';
import '../styles/StatusModal.css';

const StatusModal = ({ 
  isOpen, 
  onClose, 
  title = "Action Completed", 
  message = "Your action was successful.", 
  type = "success" // success or error
}) => {
  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'error':
        return {
          iconClass: 'fa-exclamation-triangle',
          iconColor: '#dc2626',
          buttonClass: 'btn-error'
        };
      case 'success':
      default:
        return {
          iconClass: 'fa-check-circle',
          iconColor: '#16a34a',
          buttonClass: 'btn-success'
        };
    }
  };

  const typeStyles = getTypeStyles();

  return (
    <div className="payment-completed-modal-overlay" onClick={onClose}>
      <div className="payment-completed-modal-container" onClick={e => e.stopPropagation()}>
        <div className="payment-completed-modal-header">
          <div className="payment-completed-icon-container">
            <i className={`fas ${typeStyles.iconClass}`} style={{ color: typeStyles.iconColor }}></i>
          </div>
          <button 
            className="close-payment-completed-modal" 
            onClick={onClose} 
            aria-label="Close modal"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="payment-completed-modal-content">
          <h3 className="payment-completed-title">{title}</h3>
          <p className="payment-completed-message">{message}</p>
        </div>

        <div className="payment-completed-modal-footer">
          <button 
            className={`btn-close ${typeStyles.buttonClass}`} 
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatusModal;