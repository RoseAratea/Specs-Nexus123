import React, { useState } from 'react';
import '../styles/AnnouncementModal.css';

const backendBaseUrl = 'https://specs-nexus-production.up.railway.app';

const API_URL =
  process.env.REACT_APP_API_URL ||
  (typeof window !== 'undefined' && window.location && window.location.hostname === 'localhost'
    ? 'http://localhost:8000'
    : backendBaseUrl);
const AnnouncementModal = ({ announcement, onClose }) => {
  const [showFullImage, setShowFullImage] = useState(false);
  
  if (!announcement) return null;

  const imageUrl =
    announcement.image_url && announcement.image_url.startsWith("http")
      ? announcement.image_url
      : announcement.image_url
        ? `${backendBaseUrl}${announcement.image_url}`
        : null;

  const formatDate = (dateString) => {
    if (!dateString) return 'No date provided';
    
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <>
      <div className="announcement-modal-overlay" onClick={onClose}>
        <div className="announcement-modal-container" onClick={e => e.stopPropagation()}>
          {/* Full Image Viewer */}
          {showFullImage && imageUrl && (
            <div className="fullscreen-image-overlay" onClick={() => setShowFullImage(false)}>
              <div className="fullscreen-image-container">
                <button className="close-fullscreen" onClick={(e) => {
                  e.stopPropagation();
                  setShowFullImage(false);
                }}>
                  <i className="fas fa-times"></i>
                </button>
                <img
                  src={imageUrl}
                  alt={announcement.title}
                  className="fullscreen-image"
                />
              </div>
            </div>
          )}
          
          <button className="close-modal" onClick={onClose} aria-label="Close modal">
            <i className="fas fa-times"></i>
          </button>
          
          <div className="announcement-modal-header">
            {imageUrl && (
              <div className="announcement-image-container">
                <img 
                  src={imageUrl}
                  alt={announcement.title} 
                  className="announcement-image"
                  onClick={() => setShowFullImage(true)}
                />
                
                {/* Clickable indicator */}
                <div className="image-zoom-indicator">
                  <i className="fas fa-search-plus"></i>
                </div>
              </div>
            )}
            
            <h2 className="announcement-title">{announcement.title}</h2>
          </div>
          
          <div className="announcement-modal-content">
            <div className="announcement-meta">
              {announcement.date && (
                <div className="announcement-meta-item">
                  <i className="fas fa-calendar-alt"></i>
                  <div>
                    <span className="meta-label">Date & Time</span>
                    <span className="meta-value">{formatDate(announcement.date)}</span>
                  </div>
                </div>
              )}
              
              {announcement.location && (
                <div className="announcement-meta-item">
                  <i className="fas fa-map-marker-alt"></i>
                  <div>
                    <span className="meta-label">Location</span>
                    <span className="meta-value">{announcement.location}</span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="announcement-description-section">
              <h3>Details</h3>
              <p className="announcement-description">
                {announcement.content || announcement.description || "No details available."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AnnouncementModal;