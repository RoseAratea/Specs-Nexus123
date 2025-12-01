import React from 'react';
import '../styles/AnnouncementCard.css';

const backendBaseUrl = 'https://specs-nexus-production.up.railway.app';

const API_URL =
  process.env.REACT_APP_API_URL ||
  (typeof window !== 'undefined' && window.location && window.location.hostname === 'localhost'
    ? 'http://localhost:8000'
    : backendBaseUrl);
const AnnouncementCard = ({ announcement, onClick }) => {
  const imageUrl =
    announcement.image_url && announcement.image_url.startsWith("http")
      ? announcement.image_url
      : announcement.image_url 
        ? `${backendBaseUrl}${announcement.image_url}`
        : "/default_announcement.png";

  // Format date for display in card
  const formatAnnouncementDate = (dateString) => {
    if (!dateString) return { day: '', month: '' };
    
    const date = new Date(dateString);
    return {
      day: date.getDate(),
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      time: date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
    };
  };
  
  const announcementDate = formatAnnouncementDate(announcement.date);
  
  // Truncate description to keep cards consistent
  const truncateText = (text, maxLength) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const description = announcement.content || announcement.description || "";

  return (
    <div className="announcement-card" onClick={() => onClick(announcement)}>
      <div className="announcement-card-inner">
        {/* Date display in top left corner */}
        {announcement.date && (
          <div className="announcement-date-badge">
            <div className="announcement-month">{announcementDate.month}</div>
            <div className="announcement-day">{announcementDate.day}</div>
          </div>
        )}
        
        {/* Announcement image with overlay */}
        <div className="announcement-image-wrapper">
          <img 
            src={imageUrl}
            alt={announcement.title} 
            className="announcement-image"
          />
          <div className="image-overlay"></div>
        </div>
        
        {/* Announcement content */}
        <div className="announcement-content">
          <h3 className="announcements-title">{truncateText(announcement.title, 40)}</h3>
          
          <div className="announcement-info">
            {announcement.date && (
              <div className="announcement-info-item">
                <i className="fas fa-clock announcement-icon"></i>
                <span>{announcementDate.time}</span>
              </div>
            )}
            {announcement.location && (
              <div className="announcement-info-item">
                <i className="fas fa-map-marker-alt announcement-icon"></i>
                <span>{truncateText(announcement.location, 25)}</span>
              </div>
            )}
          </div>
          
          <button className="view-details-btn">
            <span>VIEW DETAILS</span>
            <i className="fas fa-arrow-right"></i>
          </button>
        </div>
      </div>
    </div> 
  );
};

export default AnnouncementCard;