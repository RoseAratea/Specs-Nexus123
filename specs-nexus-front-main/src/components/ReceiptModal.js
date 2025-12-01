import React from 'react';
import '../styles/OfficerManageMembershipPage.css';

const ReceiptModal = ({ show, receiptUrl, onClose }) => {
  if (!show) return null;

  // Handle click on the overlay to close the modal
  const handleOverlayClick = (e) => {
    // Ensure the click is directly on the overlay, not on its children
    if (e.target.classList.contains('modal-overlay')) {
      onClose();
    }
  };

  // Prevent clicks on the image or close button from closing the modal
  const handleContentClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div
      className="modal-overlay receipt-overlay"
      onClick={handleOverlayClick}
    >
      <div className="receipt-modal-container" onClick={handleContentClick}>
        <button
          className="modal-close"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        {receiptUrl ? (
          <img
            src={receiptUrl}
            alt="Receipt"
            className="receipt-image"
            onError={() => console.error(`Failed to load receipt image: ${receiptUrl}`)}
            onClick={handleContentClick}
          />
        ) : (
          <p className="receipt-error">No receipt image available.</p>
        )}
      </div>
    </div>
  );
};

export default ReceiptModal;