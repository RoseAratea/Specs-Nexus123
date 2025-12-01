import React, { useState, useEffect, useRef } from 'react';
import ConfirmationModal from './ConfirmationModal';
import StatusModal from './StatusModal';
import '../styles/OfficerAnnouncementModal.css';

const OfficerAnnouncementModal = ({ show, onClose, onSave, initialAnnouncement }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [location, setLocation] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [errors, setErrors] = useState({});
  const [statusModal, setStatusModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'error',
  });
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    type: 'success',
    title: '',
    message: '',
    action: null,
    isLoading: false,
  });
  const [imageModal, setImageModal] = useState({
    isOpen: false,
    imageUrl: '',
  });
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (initialAnnouncement) {
      setTitle(initialAnnouncement.title || '');
      setDescription(initialAnnouncement.description || '');
      setDateTime(initialAnnouncement.date ? initialAnnouncement.date.slice(0, 16) : '');
      setLocation(initialAnnouncement.location || '');
      setImageFile(null);
      setPreviewUrl(initialAnnouncement.image_url || '');
      setErrors({});
    } else {
      resetForm();
    }
  }, [initialAnnouncement, show]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDateTime('');
    setLocation('');
    setImageFile(null);
    setPreviewUrl('');
    setErrors({});
  };

  useEffect(() => {
    if (imageFile) {
      const url = URL.createObjectURL(imageFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(initialAnnouncement?.image_url || '');
    }
  }, [imageFile, initialAnnouncement]);

  const validateForm = () => {
    const newErrors = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required.';
    }

    if (!description.trim()) {
      newErrors.description = 'Description is required.';
    }

    if (!dateTime) {
      newErrors.dateTime = 'Date and time are required.';
    }

    if (!location.trim()) {
      newErrors.location = 'Location is required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    const setters = {
      title: setTitle,
      description: setDescription,
      dateTime: setDateTime,
      location: setLocation,
    };
    setters[field](value);
    validateForm();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    setErrors((prev) => ({ ...prev, image: null }));
  };

  const handleImageButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleImageClick = () => {
    if (previewUrl) {
      setImageModal({ isOpen: true, imageUrl: previewUrl });
    }
  };

  const handleImageModalClose = () => {
    setImageModal({ isOpen: false, imageUrl: '' });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setConfirmationModal({
      isOpen: true,
      type: 'success',
      title: initialAnnouncement ? 'Confirm Announcement Update' : 'Confirm Announcement Creation',
      message: `Are you sure you want to ${initialAnnouncement ? 'update' : 'create'} the announcement "${title}"?`,
      action: 'save',
      isLoading: false,
    });
  };

  const handleConfirmationClose = () => {
    if (!confirmationModal.isLoading) {
      setConfirmationModal((prev) => ({ ...prev, isOpen: false }));
    }
  };

  const handleConfirmationConfirm = async () => {
    setConfirmationModal((prev) => ({ ...prev, isLoading: true }));

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('date', new Date(dateTime).toISOString());
      formData.append('location', location);
      if (imageFile) {
        const sanitizedFileName = imageFile.name.replace(/\s+/g, '_');
        const sanitizedFile = new File([imageFile], sanitizedFileName, {
          type: imageFile.type,
          lastModified: imageFile.lastModified,
        });
        formData.append('image', sanitizedFile);
      }

      await onSave(formData, initialAnnouncement?.id);
      setConfirmationModal((prev) => ({ ...prev, isOpen: false, isLoading: false }));
      onClose();
    } catch (error) {
      console.error('Action failed:', error);
      setConfirmationModal((prev) => ({ ...prev, isLoading: false }));
      setStatusModal({
        isOpen: true,
        title: 'Error Saving Announcement',
        message: 'Failed to save the announcement. Please try again.',
        type: 'error',
      });
    }
  };

  const handleCloseStatusModal = () => {
    setStatusModal((prev) => ({ ...prev, isOpen: false }));
  };

  const handleReset = () => {
    resetForm();
  };

  if (!show) return null;

  return (
    <>
      <div className="z-announcement-modal-overlay" onClick={onClose}>
        <div className="z-announcement-modal-container" onClick={(e) => e.stopPropagation()}>
          <button className="z-close-modal" onClick={onClose} aria-label="Close modal">
            <i className="fas fa-times"></i>
          </button>

          <div className="z-announcement-modal-header z-announcement-modal-header-green">
            <h2 className="z-announcement-title">{initialAnnouncement ? 'Edit Announcement' : 'Create Announcement'}</h2>
          </div>

          <form onSubmit={handleSubmit} className="z-announcement-modal-content">
            <div className="z-form-section">
              <h3>Announcement Details</h3>
              <div className="z-form-grid">
                <div className="z-announcement-meta-item">
                  <label htmlFor="title">Title</label>
                  <input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    required
                    placeholder="Enter announcement title"
                    className={errors.title ? 'z-input-error' : ''}
                    aria-invalid={errors.title ? 'true' : 'false'}
                    aria-describedby={errors.title ? 'title-error' : undefined}
                  />
                  {errors.title && (
                    <span id="title-error" className="z-error-message">
                      {errors.title}
                    </span>
                  )}
                </div>

                <div className="z-announcement-meta-item">
                  <label htmlFor="dateTime">Date and Time</label>
                  <input
                    id="dateTime"
                    type="datetime-local"
                    value={dateTime}
                    onChange={(e) => handleInputChange('dateTime', e.target.value)}
                    required
                    className={errors.dateTime ? 'z-input-error' : ''}
                    aria-invalid={errors.dateTime ? 'true' : 'false'}
                    aria-describedby={errors.dateTime ? 'dateTime-error' : undefined}
                  />
                  {errors.dateTime && (
                    <span id="dateTime-error" className="z-error-message">
                      {errors.dateTime}
                    </span>
                  )}
                </div>

                <div className="z-announcement-meta-item">
                  <label htmlFor="location">Location</label>
                  <input
                    id="location"
                    type="text"
                    value={location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    required
                    placeholder="Enter announcement location"
className={errors.location ? 'z-input-error' : ''}
                    aria-invalid={errors.location ? 'true' : 'false'}
                    aria-describedby={errors.location ? 'location-error' : undefined}
                  />
                  {errors.location && (
                    <span id="location-error" className="z-error-message">
                      {errors.location}
                    </span>
                  )}
                </div>
              </div>
              <div className="z-announcement-meta-item z-full-width">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  required
                  placeholder="Describe the announcement"
                  className={errors.description ? 'z-input-error' : ''}
                  aria-invalid={errors.description ? 'true' : 'false'}
                  aria-describedby={errors.description ? 'description-error' : undefined}
                />
                {errors.description && (
                  <span id="description-error" className="z-error-message">
                    {errors.description}
                  </span>
                )}
              </div>
            </div>

            <div className="z-form-section">
              <h3>Announcement Image</h3>
              <div className="z-image-preview">
                {previewUrl ? (
                  <div className="z-image-wrapper">
                    <img
                      src={previewUrl}
                      alt="Announcement Preview"
                      className="z-announcement-image"
                      onClick={handleImageClick}
                      style={{ cursor: 'pointer' }}
                    />
                  </div>
                ) : (
                  <div className="z-image-placeholder">
                    <i className="fas fa-image"></i>
                    <span>Add announcement image</span>
                  </div>
                )}
              </div>
              <div className="z-announcement-meta-item">
                <label htmlFor="image">Image</label>
                <input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  aria-describedby="image-error"
                />
                <button
                  type="button"
                  className="z-btn-image-upload"
                  onClick={handleImageButtonClick}
                >
                  <i className="fas fa-upload"></i> Upload Image
                </button>
              </div>
            </div>

            <div className="z-announcement-modal-footer">
              <button type="button" className="z-btn-reset" onClick={handleReset}>
                Reset
              </button>
              <button type="button" className="z-btn-cancel" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="z-btn-save" disabled={Object.keys(errors).length > 0}>
                <i className="fas fa-save"></i> Save
              </button>
            </div>
          </form>
        </div>
      </div>

      {imageModal.isOpen && (
        <div className="z-image-modal-overlay" onClick={handleImageModalClose}>
          <div className="z-image-modal-container" onClick={(e) => e.stopPropagation()}>
            <button
              className="z-image-modal-close"
              onClick={handleImageModalClose}
              aria-label="Close image modal"
            >
              <i className="fas fa-times"></i>
            </button>
            <img
              src={imageModal.imageUrl}
              alt="Full-size Announcement Image"
              className="z-image-modal-content"
            />
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={handleConfirmationClose}
        onConfirm={handleConfirmationConfirm}
        title={confirmationModal.title}
        message={confirmationModal.message}
        confirmText="Save"
        cancelText="Go Back"
        type={confirmationModal.type}
        icon="fa-save"
        isLoading={confirmationModal.isLoading}
      />
      <StatusModal
        isOpen={statusModal.isOpen}
        onClose={handleCloseStatusModal}
        title={statusModal.title}
        message={statusModal.message}
        type={statusModal.type}
      />
    </>
  );
};

export default OfficerAnnouncementModal;