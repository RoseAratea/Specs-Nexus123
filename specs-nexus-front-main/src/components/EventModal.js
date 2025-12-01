import React, { useState } from 'react';
import ConfirmationModal from './ConfirmationModal';
import '../styles/EventModal.css';
import '../styles/ConfirmationModal.css';

const EventModal = ({ event, onClose, onParticipate, onNotParticipate, isOfficerView = false, show = false }) => {
  const [showFullImage, setShowFullImage] = useState(false);
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    type: 'default',
    title: '',
    message: '',
    action: null,
    isLoading: false
  });

  // Guard clause: Don't render if modal is not shown or event is invalid
  if (!show || !event || !event.id) {
    return null;
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getRegistrationStatus = (status) => {
    switch (status) {
      case 'open':
        return 'Registration is open';
      case 'not_started':
        return 'Registration opens soon';
      case 'closed':
        return 'Registration is closed';
      default:
        return 'Unknown status';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'open':
        return 'fa-door-open';
      case 'not_started':
        return 'fa-clock';
      case 'closed':
        return 'fa-door-closed';
      default:
        return 'fa-question-circle';
    }
  };

  const handleRegisterClick = () => {
    setConfirmationModal({
      isOpen: true,
      type: 'success',
      title: 'Confirm Registration',
      message: `Are you sure you want to register for "${event.title || 'this event'}"?`,
      action: 'register',
      isLoading: false
    });
  };

  const handleCancelRegistrationClick = () => {
    setConfirmationModal({
      isOpen: true,
      type: 'danger',
      title: 'Cancel Registration',
      message: `Are you sure you want to cancel your registration for "${event.title || 'this event'}"?`,
      action: 'cancel',
      isLoading: false
    });
  };

  const handleConfirmationClose = () => {
    if (!confirmationModal.isLoading) {
      setConfirmationModal(prev => ({ ...prev, isOpen: false }));
    }
  };

  const handleConfirmationConfirm = async () => {
    setConfirmationModal(prev => ({ ...prev, isLoading: true }));
    
    try {
      if (confirmationModal.action === 'register') {
        await onParticipate(event.id);
      } else if (confirmationModal.action === 'cancel') {
        await onNotParticipate(event.id);
      }
      
      setConfirmationModal(prev => ({ ...prev, isOpen: false, isLoading: false }));
    } catch (error) {
      console.error('Action failed:', error);
      setConfirmationModal(prev => ({ ...prev, isLoading: false }));
    }
  };

  return (
    <>
      <div className="event-modal-overlay" onClick={onClose}>
        <div className="event-modal-container" onClick={e => e.stopPropagation()}>
          {showFullImage && event.image_url && (
            <div className="fullscreen-image-overlay" onClick={() => setShowFullImage(false)}>
              <div className="fullscreen-image-container">
                <button className="close-fullscreen" onClick={(e) => {
                  e.stopPropagation();
                  setShowFullImage(false);
                }}>
                  <i className="fas fa-times"></i>
                </button>
                <img
                  src={
                    event.image_url && event.image_url.startsWith("http")
                      ? event.image_url
                      : `https://specs-nexus-production.up.railway.app${event.image_url || ''}`
                  }
                  alt={event.title || 'Event'}
                  className="fullscreen-image"
                />
              </div>
            </div>
          )}
          <button className="close-modal" onClick={onClose} aria-label="Close modal">
            <i className="fas fa-times"></i>
          </button>

          <div className="event-modal-header">
            {event.image_url && (
              <div className="event-image-container">
                <img 
                  src={
                    event.image_url.startsWith("http")
                      ? event.image_url
                      : `https://specs-nexus-production.up.railway.app${event.image_url}`
                  } 
                  alt={event.title || 'Event'} 
                  className="event-images"
                  onClick={() => setShowFullImage(true)}
                />
                <div className={`event-status-badge status-${event.registration_status || 'closed'}`}>
                  <i className={`fas ${getStatusIcon(event.registration_status || 'closed')}`}></i>
                  {getRegistrationStatus(event.registration_status || 'closed')}
                </div>
                <div className="image-zoom-indicator">
                  <i className="fas fa-search-plus"></i>
                </div>
              </div>
            )}

            <h2 className="event-title">{event.title || 'Untitled Event'}</h2>
          </div>

          <div className="event-modal-content">
            <div className="event-meta">
              <div className="event-meta-item">
                <i className="fas fa-calendar-alt"></i>
                <div>
                  <span className="meta-label">Date & Time</span>
                  <span className="meta-value">{formatDate(event.date)}</span>
                </div>
              </div>

              <div className="event-meta-item">
                <i className="fas fa-map-marker-alt"></i>
                <div>
                  <span className="meta-label">Location</span>
                  <span className="meta-value">{event.location || 'Not specified'}</span>
                </div>
              </div>

              <div className="event-meta-item">
                <i className="fas fa-users"></i>
                <div>
                  <span className="meta-label">Attendees</span>
                  <span className="meta-value">{event.participant_count || 0} registered</span>
                </div>
              </div>
            </div>

            <div className="event-description-section">
              <h3>About this event</h3>
              <p className="event-description">{event.description || 'No description available'}</p>
            </div>

            <div className="event-registration-details">
              <h3>Registration Information</h3>

              <div className="registration-timeline">
                {event.registration_start && (
                  <div className="registration-timeline-item">
                    <i className="fas fa-hourglass-start"></i>
                    <div>
                      <span className="timeline-label">Registration opens</span>
                      <span className="timeline-date">{formatDate(event.registration_start)}</span>
                    </div>
                  </div>
                )}

                {event.registration_end && (
                  <div className="registration-timeline-item">
                    <i className="fas fa-hourglass-end"></i>
                    <div>
                      <span className="timeline-label">Registration closes</span>
                      <span className="timeline-date">{formatDate(event.registration_end)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {!isOfficerView && (
            <div className="event-modal-footer">
              {event.is_participant && (
                <div className="registered-status-banner">
                  <i className="fas fa-check-circle"></i> You are registered for this event
                </div>
              )}

              <div className="registration-actions">
                {event.registration_open ? (
                  event.is_participant ? (
                    <button 
                      className="btn-not-participate" 
                      onClick={handleCancelRegistrationClick}
                    >
                      <i className="fas fa-times-circle"></i> Cancel Registration
                    </button>
                  ) : (
                    <button 
                      className="btn-participate" 
                      onClick={handleRegisterClick}
                    >
                      <i className="fas fa-calendar-check"></i> Register Now
                    </button>
                  )
                ) : (
                  <button className="btn-disabled" disabled>
                    {event.registration_status === 'not_started' ? 
                      <><i className="fas fa-clock"></i> Registration Not Open Yet</> : 
                      <><i className="fas fa-ban"></i> Registration Closed</>
                    }
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {!isOfficerView && (
        <ConfirmationModal
          isOpen={confirmationModal.isOpen}
          onClose={handleConfirmationClose}
          onConfirm={handleConfirmationConfirm}
          title={confirmationModal.title}
          message={confirmationModal.message}
          confirmText={confirmationModal.action === 'register' ? 'Register' : 'Cancel Registration'}
          cancelText="Go Back"
          type={confirmationModal.type}
          icon={confirmationModal.action === 'register' ? 'fa-calendar-check' : 'fa-times-circle'}
          isLoading={confirmationModal.isLoading}
        />
      )}
    </>
  );
};

export default EventModal;