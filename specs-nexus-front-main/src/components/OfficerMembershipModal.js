import React, { useState } from 'react';
import '../styles/OfficerMembershipModal.css'; // Reuse existing modal styles

const OfficerDenialReasonModal = ({ show, onClose, onSubmit }) => {
  const [denialReason, setDenialReason] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!denialReason.trim()) {
      alert('Please provide a denial reason.');
      return;
    }
    onSubmit(denialReason);
    setDenialReason('');
  };

  if (!show) return null;

  return (
    <div className="officer-membership-modal-overlay">
      <div className="officer-membership-modal-container">
        <button className="officer-membership-modal-close" onClick={onClose}>×</button>
        <h2>Deny Membership Payment</h2>
        <form onSubmit={handleSubmit} className="officer-membership-form">
          <label>Reason for Denial:</label>
          <textarea
            value={denialReason}
            onChange={(e) => setDenialReason(e.target.value)}
            placeholder="Enter the reason for denying this payment..."
            required
            rows="4"
            style={{ width: '100%', resize: 'vertical' }}
          />
          <button type="submit">Submit Denial</button>
        </form>
      </div>
    </div>
  );
};

export default OfficerDenialReasonModal;