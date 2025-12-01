import React, { useState, useEffect, useRef } from 'react';
import '../styles/OfficerAddRequirementModal.css';

const OfficerAddRequirementModal = ({ show, onClose, onSave }) => {
  const [requirement, setRequirement] = useState('1st Semester Membership');
  const [amount, setAmount] = useState('');
  const [errors, setErrors] = useState({ requirement: '', amount: '' });
  const modalRef = useRef(null);
  const firstInputRef = useRef(null);

  const predefinedRequirements = [
    { value: '1st Semester Membership', label: '1st Semester Membership' },
    { value: '2nd Semester Membership', label: '2nd Semester Membership' },
  ];

  const validateForm = () => {
    const newErrors = { requirement: '', amount: '' };
    if (!requirement.trim()) {
      newErrors.requirement = 'Please select a requirement.';
    }
    if (!amount || amount <= 0) {
      newErrors.amount = 'Please enter a valid positive amount.';
    }
    setErrors(newErrors);
    return !newErrors.requirement && !newErrors.amount;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    await onSave({ requirement, amount });
  };

  const handleClose = () => {
    setRequirement('1st Semester Membership');
    setAmount('');
    setErrors({ requirement: '', amount: '' });
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
        <h2 id="modal-title-ss">Add Requirement</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-field-ss">
            <label htmlFor="requirement">Requirement</label>
            <select
              id="requirement"
              value={requirement}
              onChange={(e) => setRequirement(e.target.value)}
              required
              ref={firstInputRef}
              aria-describedby={errors.requirement ? 'requirement-error-ss' : undefined}
            >
              {predefinedRequirements.map((req) => (
                <option key={req.value} value={req.value}>
                  {req.label}
                </option>
              ))}
            </select>
            {errors.requirement && (
              <span id="requirement-error-ss" className="error-message-ss">
                {errors.requirement}
              </span>
            )}
          </div>
          <div className="form-field-ss">
            <label htmlFor="amount">Amount</label>
            <input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              min="0"
              step="0.01"
              aria-describedby={errors.amount ? 'amount-error-ss' : undefined}
            />
            {errors.amount && (
              <span id="amount-error-ss" className="error-message-ss">
                {errors.amount}
              </span>
            )}
          </div>
          <div className="form-buttons-ss">
            <button type="submit" className="save-button-ss">
              Add Requirement
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

export default OfficerAddRequirementModal;