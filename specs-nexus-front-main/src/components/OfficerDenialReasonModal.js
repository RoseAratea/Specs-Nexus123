import React, { useState, useEffect, useRef } from 'react';
import '../styles/OfficerDenialReasonModal.css';

const OfficerDenialReasonModal = ({ show, onClose, onSubmit }) => {
  const [denialReason, setDenialReason] = useState('');
  const [selectedReason, setSelectedReason] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const modalRef = useRef(null);
  const firstInputRef = useRef(null);

  const predefinedReasons = [
    { value: '', label: 'Select a reason...' },
    { value: 'Receipt is too blurry', label: 'Receipt is too blurry' },
    { value: 'Not the correct receipt', label: 'Not the correct receipt' },
    { value: 'Invalid payment amount', label: 'Invalid payment amount' },
    { value: 'Payment method not supported', label: 'Payment method not supported' },
    { value: 'Other', label: 'Other (please specify)' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalReason = selectedReason === 'Other' ? denialReason.trim() : selectedReason;
    if (!finalReason) {
      setError('Please select a reason or provide a custom reason.');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      await onSubmit(finalReason);
      handleClose();
    } finally {
      setIsLoading(false);
    }
  };

  const handleReasonChange = (e) => {
    const value = e.target.value;
    setSelectedReason(value);
    setError('');
    if (value !== 'Other') {
      setDenialReason('');
    }
  };

  const handleClose = () => {
    setDenialReason('');
    setSelectedReason('');
    setError('');
    setIsLoading(false);
    onClose();
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape' && !isLoading) {
      handleClose();
    }
  };

  useEffect(() => {
    if (show && firstInputRef.current) {
      firstInputRef.current.focus();
    }
  }, [show]);

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
        <button
          className="modal-close-ss"
          onClick={handleClose}
          aria-label="Close modal"
          disabled={isLoading}
        >
          <i className="fas fa-times"></i>
        </button>
        <h2 id="modal-title-ss">Deny Membership Payment</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-field-ss">
            <label htmlFor="denial-reason">Reason for Denial</label>
            <select
              id="denial-reason"
              value={selectedReason}
              onChange={handleReasonChange}
              ref={firstInputRef}
              disabled={isLoading}
              aria-describedby={error ? 'error-message-ss' : undefined}
            >
              {predefinedReasons.map((reason) => (
                <option key={reason.value} value={reason.value}>
                  {reason.label}
                </option>
              ))}
            </select>
          </div>
          <div className="form-field-ss">
            <label htmlFor="custom-reason">
              {selectedReason === 'Other' ? 'Custom Reason' : 'Custom Reason (Optional)'}
            </label>
            <textarea
              id="custom-reason"
              value={denialReason}
              onChange={(e) => setDenialReason(e.target.value)}
              placeholder="Enter a custom reason (required if 'Other' is selected)..."
              disabled={selectedReason !== 'Other' || isLoading}
              rows="4"
              aria-describedby={error ? 'error-message-ss' : undefined}
            />
            {error && (
              <span id="error-message-ss" className="error-message-ss">
                {error}
              </span>
            )}
          </div>
          <div className="form-buttons-ss">
            <button
              type="submit"
              className="save-button-ss"
              disabled={isLoading}
            >
              {isLoading ? 'Submitting...' : 'Submit Denial'}
            </button>
            <button
              type="button"
              className="cancel-button-ss"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OfficerDenialReasonModal;