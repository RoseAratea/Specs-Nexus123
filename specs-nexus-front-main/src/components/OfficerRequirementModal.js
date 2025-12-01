import React, { useState, useEffect, useRef } from 'react';
import '../styles/OfficerRequirementModal.css';

const OfficerRequirementModal = ({ show, requirementData, onClose, onSave }) => {
  const [amount, setAmount] = useState(requirementData?.amount || '');
  const [error, setError] = useState('');
  const modalRef = useRef(null);
  const firstInputRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || amount <= 0) {
      setError('Please enter a valid positive amount.');
      return;
    }
    setError('');
    await onSave(amount);
  };

  const handleClose = () => {
    setAmount(requirementData?.amount || '');
    setError('');
    onClose();
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      handleClose();
    }
  };

  useEffect(() => {
    if (show && firstInputRef.current) {
      firstInputRef.current.focus();
    }
  }, [show]);

  useEffect(() => {
    setAmount(requirementData?.amount || '');
    setError('');
  }, [requirementData]);

  if (!show) return null;

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
        <button className="modal-close-ss" onClick={handleClose} aria-label="Close modal">
          <i className="fas fa-times"></i>
        </button>
        <h2 id="modal-title-ss">Edit Requirement: {requirementData?.requirement}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-field-ss">
            <label htmlFor="amount">Price</label>
            <input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              min="0"
              step="0.01"
              ref={firstInputRef}
              aria-describedby={error ? 'error-message-ss' : undefined}
            />
            {error && (
              <span id="error-message-ss" className="error-message-ss">
                {error}
              </span>
            )}
          </div>
          <div className="form-buttons-ss">
            <button type="submit" className="save-button-ss">
              Save Price
            </button>
            <button type="button" className="cancel-button-ss" onClick={handleClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OfficerRequirementModal;