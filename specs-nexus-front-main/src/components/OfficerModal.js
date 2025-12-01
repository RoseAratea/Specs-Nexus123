import React, { useState, useEffect } from 'react';
import '../styles/OfficerModal.css';

const OfficerModal = ({ show, onClose, onSave, initialOfficer }) => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    student_number: '',
    year: '',
    block: '',
    position: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialOfficer) {
      setFormData({
        full_name: initialOfficer.full_name || '',
        email: initialOfficer.email || '',
        password: '', // Password is optional for editing
        student_number: initialOfficer.student_number || '',
        year: initialOfficer.year || '',
        block: initialOfficer.block || '',
        position: initialOfficer.position || '',
      });
      setErrors({});
    } else {
      setFormData({
        full_name: '',
        email: '',
        password: '',
        student_number: '',
        year: '',
        block: '',
        position: '',
      });
      setErrors({});
    }
  }, [initialOfficer, show]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!initialOfficer && !formData.password) {
      newErrors.password = 'Password is required for new officers';
    } else if (!initialOfficer && formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    if (!formData.student_number.trim()) {
      newErrors.student_number = 'Student number is required';
    }
    if (!formData.year) {
      newErrors.year = 'Year is required';
    }
    if (!formData.block) {
      newErrors.block = 'Block is required';
    }
    if (!formData.position) {
      newErrors.position = 'Position is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'email' || name === 'full_name' || name === 'student_number' ? value.trimStart() : value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (key !== 'password' || value) {
        // Only append password if provided
        data.append(key, (key === 'email' || key === 'full_name' || key === 'student_number' ? value.trim() : value));
      }
    });

    try {
      await onSave(data, initialOfficer?.id);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!show) return null;

  return (
    <div className="z-officer-modal-overlay" onClick={onClose}>
      <div className="z-officer-modal-container" onClick={(e) => e.stopPropagation()}>
        <button
          className="z-close-modal"
          onClick={onClose}
          aria-label="Close modal"
          disabled={isSubmitting}
        >
          <i className="fas fa-times" aria-hidden="true"></i>
        </button>
        <div className="z-modal-header z-modal-header-green">
          <h2 className="z-modal-title">{initialOfficer ? 'Edit Officer' : 'Add New Officer'}</h2>
        </div>
        <form onSubmit={handleSubmit} className="z-officer-form">
          <div className="z-form-group">
            <label htmlFor="full_name">Full Name</label>
            <input
              type="text"
              id="full_name"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              aria-describedby={errors.full_name ? 'full_name-error' : undefined}
              disabled={isSubmitting}
            />
            {errors.full_name && (
              <span id="full_name-error" className="z-form-error">
                {errors.full_name}
              </span>
            )}
          </div>

          <div className="z-form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              aria-describedby={errors.email ? 'email-error' : undefined}
              disabled={isSubmitting}
            />
            {errors.email && (
              <span id="email-error" className="z-form-error">
                {errors.email}
              </span>
            )}
          </div>

          <div className="z-form-group">
            <label htmlFor="password">Password {initialOfficer && '(optional)'}</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              aria-describedby={errors.password ? 'password-error' : undefined}
              disabled={isSubmitting}
            />
            {errors.password && (
              <span id="password-error" className="z-form-error">
                {errors.password}
              </span>
            )}
          </div>

          <div className="z-form-group">
            <label htmlFor="student_number">Student Number</label>
            <input
              type="text"
              id="student_number"
              name="student_number"
              value={formData.student_number}
              onChange={handleChange}
              aria-describedby={errors.student_number ? 'student_number-error' : undefined}
              disabled={isSubmitting}
            />
            {errors.student_number && (
              <span id="student_number-error" className="z-form-error">
                {errors.student_number}
              </span>
            )}
          </div>

          <div className="z-form-group">
            <label htmlFor="year">Year</label>
            <select
              id="year"
              name="year"
              value={formData.year}
              onChange={handleChange}
              aria-describedby={errors.year ? 'year-error' : undefined}
              disabled={isSubmitting}
            >
              <option value="">Select Year</option>
              <option value="1st Year">1st Year</option>
              <option value="2nd Year">2nd Year</option>
              <option value="3rd Year">3rd Year</option>
              <option value="4th Year">4th Year</option>
            </select>
            {errors.year && (
              <span id="year-error" className="z-form-error">
                {errors.year}
              </span>
            )}
          </div>

          <div className="z-form-group">
            <label htmlFor="block">Block</label>
            <select
              id="block"
              name="block"
              value={formData.block}
              onChange={handleChange}
              aria-describedby={errors.block ? 'block-error' : undefined}
              disabled={isSubmitting}
            >
              <option value="">Select Block</option>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
              <option value="D">D</option>
              <option value="E">E</option>
              <option value="F">F</option>
            </select>
            {errors.block && (
              <span id="block-error" className="z-form-error">
                {errors.block}
              </span>
            )}
          </div>

          <div className="z-form-group">
            <label htmlFor="position">Position</label>
            <select
              id="position"
              name="position"
              value={formData.position}
              onChange={handleChange}
              aria-describedby={errors.position ? 'position-error' : undefined}
              disabled={isSubmitting}
            >
              <option value="">Select Position</option>
              <option value="Admin">Admin</option>
              <option value="Officer">Officer</option>
            </select>
            {errors.position && (
              <span id="position-error" className="z-form-error">
                {errors.position}
              </span>
            )}
          </div>

          <div className="z-form-actions">
            <button
              type="button"
              className="z-btn-cancel"
              onClick={onClose}
              disabled={isSubmitting}
              aria-label="Cancel"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="z-btn-save"
              disabled={isSubmitting}
              aria-label={initialOfficer ? 'Update Officer' : 'Add Officer'}
            >
              {isSubmitting ? (
                <>
                  <div className="z-loading-spinner"></div>
                  Processing...
                </>
              ) : initialOfficer ? (
                'Update Officer'
              ) : (
                'Add Officer'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OfficerModal;