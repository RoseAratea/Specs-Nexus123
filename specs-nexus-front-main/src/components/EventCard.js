import React from 'react';
import '../styles/EventCard.css';

const EventCard = ({ event, onClick }) => {
  // Function to determine registration status badge
  const getStatusBadge = (status) => {
    const statusConfig = {
      open: { class: 'status-badge status-open', icon: 'fa-door-open', text: 'REGISTRATION OPEN' },
      not_started: { class: 'status-badge status-not-started', icon: 'fa-clock', text: 'OPENS SOON' },
      closed: { class: 'status-badge status-closed', icon: 'fa-lock', text: 'REGISTRATION CLOSED' }
    };
    
    const config = statusConfig[status] || { class: 'status-badge', icon: 'fa-question-circle', text: 'UNKNOWN' };
    
    return (
      <div className={config.class}>
        <i className={`fas ${config.icon}`}></i> {config.text}
      </div>
    );
  };

  // Format date for display in card
  const formatEventDate = (dateString) => {
    const date = new Date(dateString);
    const options = { 
      month: 'short', 
      day: 'numeric'
    };
    
    const timeOptions = {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    };
    
    return {
      day: date.getDate(),
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      date: date.toLocaleDateString('en-US', options),
      time: date.toLocaleTimeString('en-US', timeOptions),
      year: date.getFullYear()
    };
  };
  
  const eventDate = formatEventDate(event.date);
  
  // Check if the card should show the registered badge
  const isParticipating = event.is_participant === true;
  
  // Truncate description to keep cards consistent
  const truncateText = (text, maxLength) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <div className="event-card" onClick={() => onClick(event)}>
      <div className="event-card-inner">
        {/* Date display in top left corner */}
        <div className="event-date-badge">
          <div className="event-month">{eventDate.month}</div>
          <div className="event-day">{eventDate.day}</div>
        </div>
        
        {/* Event image with overlay */}
        <div className="event-image-wrapper">
          <img 
            src={
              event.image_url
                ? (event.image_url.startsWith("http")
                  ? event.image_url
                  : `https://specs-nexus-production.up.railway.app${event.image_url}`)
                : "/default_event.png"
            } 
            alt={event.title} 
            className="event-image"
          />
          <div className="image-overlay"></div>
          
          {/* Status badge */}
          {getStatusBadge(event.registration_status)}
          
          {/* Registered indicator */}
          {isParticipating && (
            <div className="registered-badge">
              <i className="fas fa-check-circle"></i> REGISTERED
            </div>
          )}
        </div>
        
        {/* Event content */}
        <div className="event-content">
          <h3 className="events-title">{truncateText(event.title, 40)}</h3>
          
          <div className="event-info">
            <div className="event-info-item">
              <i className="fas fa-clock event-icon"></i>
              <span>{eventDate.time}</span>
            </div>
            <div className="event-info-item">
              <i className="fas fa-map-marker-alt event-icon"></i>
              <span>{truncateText(event.location, 25)}</span>
            </div>
            <div className="event-info-item">
              <i className="fas fa-users event-icon"></i>
              <span>{event.participant_count} Attendees</span>
            </div>
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

export default EventCard;