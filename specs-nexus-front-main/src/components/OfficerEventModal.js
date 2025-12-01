import React, { useState, useEffect, useRef } from 'react';
import ConfirmationModal from './ConfirmationModal';
import StatusModal from './StatusModal';
import '../styles/OfficerEventModal.css';

const OfficerEventModal = ({ show, onClose, onSave, initialEvent }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [location, setLocation] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [registrationStart, setRegistrationStart] = useState('');
  const [registrationEnd, setRegistrationEnd] = useState('');
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

  // Function to get current date and time in Manila time zone
  const getManilaDateTime = () => {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Manila',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    const parts = formatter.formatToParts(now);
    const year = parts.find((part) => part.type === 'year').value;
    const month = parts.find((part) => part.type === 'month').value;
    const day = parts.find((part) => part.type === 'day').value;
    const hour = parts.find((part) => part.type === 'hour').value;
    const minute = parts.find((part) => part.type === 'minute').value;
    return `${year}-${month}-${day}T${hour}:${minute}`;
  };

  useEffect(() => {
    if (initialEvent) {
      setTitle(initialEvent.title || '');
      setDescription(initialEvent.description || '');
      setDateTime(initialEvent.date ? initialEvent.date.slice(0, 16) : '');
      setLocation(initialEvent.location || '');
      setRegistrationStart(initialEvent.registration_start ? initialEvent.registration_start.slice(0, 16) : '');
      setRegistrationEnd(initialEvent.registration_end ? initialEvent.registration_end.slice(0, 16) : initialEvent.date ? initialEvent.date.slice(0, 16) : '');
      setImageFile(null);
      setPreviewUrl(initialEvent.image_url || '');
      setErrors({});
    } else {
      const manilaDateTime = getManilaDateTime();
      setTitle('');
      setDescription('');
      setDateTime('');
      setLocation('');
      setRegistrationStart(manilaDateTime);
      setRegistrationEnd('');
      setImageFile(null);
      setPreviewUrl('');
      setErrors({});
    }
  }, [initialEvent, show]);

  const resetForm = () => {
    const manilaDateTime = getManilaDateTime();
    setTitle('');
    setDescription('');
    setDateTime('');
    setLocation('');
    setRegistrationStart(manilaDateTime);
    setRegistrationEnd('');
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
      setPreviewUrl(initialEvent?.image_url || '');
    }
  }, [imageFile, initialEvent]);

  useEffect(() => {
    // Automatically set registrationEnd to dateTime when dateTime changes, only if registrationEnd is not manually set
    if (dateTime && !registrationEnd && !initialEvent) {
      setRegistrationEnd(dateTime);
    }
  }, [dateTime, registrationEnd, initialEvent]);

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

    if (!registrationStart) {
      newErrors.registrationStart = 'Registration start is required.';
    }

    if (!registrationEnd) {
      newErrors.registrationEnd = 'Registration end is required.';
    } else if (registrationStart && new Date(registrationEnd) <= new Date(registrationStart)) {
      newErrors.registrationEnd = 'End time must be after start.';
    } else if (dateTime && new Date(registrationEnd) > new Date(dateTime)) {
      newErrors.registrationEnd = 'Registration end cannot be after event date and time.';
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
      registrationStart: setRegistrationStart,
      registrationEnd: setRegistrationEnd,
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
      title: initialEvent ? 'Confirm Event Update' : 'Confirm Event Creation',
      message: `Are you sure you want to ${initialEvent ? 'update' : 'create'} the event "${title}"?`,
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
      formData.append('registration_start', new Date(registrationStart).toISOString());
      formData.append('registration_end', new Date(registrationEnd).toISOString());

      if (imageFile) {
        const sanitizedFileName = imageFile.name.replace(/\s+/g, '_');
        const sanitizedFile = new File([imageFile], sanitizedFileName, {
          type: imageFile.type,
          lastModified: imageFile.lastModified,
        });
        formData.append('image', sanitizedFile);
      }

      await onSave(formData, initialEvent?.id);
      setConfirmationModal((prev) => ({ ...prev, isOpen: false, isLoading: false }));
      onClose();
    } catch (error) {
      console.error('Action failed:', error);
      setConfirmationModal((prev) => ({ ...prev, isLoading: false }));
      setStatusModal({
        isOpen: true,
        title: 'Error Saving Event',
        message: 'Failed to save the event. Please try again.',
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
      <div className="z-event-modal-overlay" onClick={onClose}>
        <div className="z-event-modal-container" onClick={(e) => e.stopPropagation()}>
          <button className="z-close-modal" onClick={onClose} aria-label="Close modal">
            <i className="fas fa-times"></i>
          </button>

          <div className="z-event-modal-header z-event-modal-header-green">
            <h2 className="z-event-title">{initialEvent ? 'Edit Event' : 'Create Event'}</h2>
          </div>

          <form onSubmit={handleSubmit} className="z-event-modal-content">
            <div className="z-form-section">
              <h3>Event Details</h3>
              <div className="z-form-grid">
                <div className="z-event-meta-item">
                  <label htmlFor="title">Title</label>
                  <input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    required
                    placeholder="Enter event title"
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

                <div className="z-event-meta-item">
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

                <div className="z-event-meta-item">
                  <label htmlFor="location">Location</label>
                  <input
                    id="location"
                    type="text"
                    value={location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    required
                    placeholder="Enter event location"
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
              <div className="z-event-meta-item z-full-width">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  required
                  placeholder="Describe the event"
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
              <h3>Event Setup</h3>
              <div className="z-image-preview">
                {previewUrl ? (
                  <div className="z-image-wrapper">
                    <img
                      src={previewUrl}
                      alt="Event Preview"
                      className="z-event-image"
                      onClick={handleImageClick}
                      style={{ cursor: 'pointer' }}
                    />
                  </div>
                ) : (
                  <div className="z-image-placeholder">
                    <i className="fas fa-image"></i>
                    <span>Add event image</span>
                  </div>
                )}
              </div>
              <div className="z-event-meta-item">
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

              <div className="z-form-grid">
                <div className="z-event-meta-item">
                  <label htmlFor="registrationStart">Registration Start</label>
                  <input
                    id="registrationStart"
                    type="datetime-local"
                    value={registrationStart}
                    onChange={(e) => handleInputChange('registrationStart', e.target.value)}
                    required
                    className={errors.registrationStart ? 'z-input-error' : ''}
                    aria-invalid={errors.registrationStart ? 'true' : 'false'}
                    aria-describedby={errors.registrationStart ? 'registrationStart-error' : undefined}
                  />
                  {errors.registrationStart && (
                    <span id="registrationStart-error" className="z-error-message">
                      {errors.registrationStart}
                    </span>
                  )}
                </div>

                <div className="z-event-meta-item">
                  <label htmlFor="registrationEnd">Registration End</label>
                  <input
                    id="registrationEnd"
                    type="datetime-local"
                    value={registrationEnd}
                    onChange={(e) => handleInputChange('registrationEnd', e.target.value)}
                    required
                    className={errors.registrationEnd ? 'z-input-error' : ''}
                    aria-invalid={errors.registrationEnd ? 'true' : 'false'}
                    aria-describedby={errors.registrationEnd ? 'registrationEnd-error' : undefined}
                  />
                  {errors.registrationEnd && (
                    <span id="registrationEnd-error" className="z-error-message">
                      {errors.registrationEnd}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="z-event-modal-footer">
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
              alt="Full-size Event Image"
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

export default OfficerEventModal;