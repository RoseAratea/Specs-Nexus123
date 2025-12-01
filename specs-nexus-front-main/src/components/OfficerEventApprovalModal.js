import React, { useState } from 'react';
import '../styles/OfficerDenialReasonModal.css';

/**
 * OfficerEventApprovalModal
 *
 * Props:
 * - show: boolean
 * - onClose: () => void
 * - onSubmit: ({ action: 'approve' | 'decline', reason?: string }) => Promise<void> | void
 */
const OfficerEventApprovalModal = ({ show, onClose, onSubmit }) => {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!show) return null;

  const handleApprove = async () => {
    if (isSubmitting) return;
    setError('');
    setIsSubmitting(true);
    try {
      await onSubmit({ action: 'approve', reason: reason.trim() || undefined });
      setReason('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDecline = async () => {
    if (isSubmitting) return;
    const trimmed = reason.trim();
    if (!trimmed) {
      setError('Please provide a reason for declining this event.');
      return;
    }
    setError('');
    setIsSubmitting(true);
    try {
      await onSubmit({ action: 'decline', reason: trimmed });
      setReason('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    setReason('');
    setError('');
    onClose();
  };

  return (
    <div
      className="modal-overlay-ss"
      role="dialog"
      aria-modal="true"
      aria-labelledby="event-approval-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div className="modal-container-ss">
        <button
          className="modal-close-ss"
          onClick={handleClose}
          aria-label="Close approval modal"
          disabled={isSubmitting}
        >
          <i className="fas fa-times"></i>
        </button>
        <h2 id="event-approval-title">Approve Event Plan</h2>
        <p style={{ marginBottom: '10px', color: '#555' }}>
          You can approve this event plan or decline it with a reason.
        </p>
        <div className="form-field-ss">
          <label htmlFor="event-approval-reason">
            Reason (required if declining)
          </label>
          <textarea
            id="event-approval-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Enter the reason for declining, or any notes for approval..."
            rows="4"
            disabled={isSubmitting}
            aria-describedby={error ? 'event-approval-error' : undefined}
          />
          {error && (
            <span id="event-approval-error" className="error-message-ss">
              {error}
            </span>
          )}
        </div>
        <div className="form-buttons-ss">
          <button
            type="button"
            className="save-button-ss"
            onClick={handleApprove}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Processing...' : 'Approve'}
          </button>
          <button
            type="button"
            className="cancel-button-ss"
            onClick={handleDecline}
            disabled={isSubmitting}
          >
            Decline
          </button>
          <button
            type="button"
            className="cancel-button-ss"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default OfficerEventApprovalModal;


