import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getOfficerEvents, createOfficerEvent, updateOfficerEvent, deleteOfficerEvent } from '../services/officerEventService';
import EventParticipantsModal from '../components/EventParticipantsModal';
import OfficerEventModal from '../components/OfficerEventModal';
import EventModal from '../components/EventModal';
import StatusModal from '../components/StatusModal';
import ConfirmationModal from '../components/ConfirmationModal';
import OfficerEventApprovalModal from '../components/OfficerEventApprovalModal';
import OfficerLayout from '../components/OfficerLayout';
import Loading from '../components/Loading';
import '../styles/OfficerManageEventsPage.css';

const API_URL =
  process.env.REACT_APP_API_URL ||
  (typeof window !== 'undefined' && window.location && window.location.hostname === 'localhost'
    ? 'http://localhost:8000'
    : 'https://specs-nexus.onrender.com');
const OfficerManageEventsPage = () => {
  const [officer, setOfficer] = useState(null);
  const [events, setEvents] = useState([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showParticipantsModal, setShowParticipantsModal] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showArchived, setShowArchived] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [statusModal, setStatusModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'success',
  });
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    eventId: null,
    isLoading: false,
  });
  const [approvalModal, setApprovalModal] = useState({
    isOpen: false,
    eventId: null,
  });
  const token = localStorage.getItem('officerAccessToken');
  const navigate = useNavigate();

  // Handle authentication check on mount
  useEffect(() => {
    if (!token || !localStorage.getItem('officerInfo')) {
      console.log('No officer token or info found, redirecting to login');
      localStorage.removeItem('officerAccessToken');
      localStorage.removeItem('officerInfo');
      navigate('/officer-login');
    }
  }, [token, navigate]);

  // Fetch events
  useEffect(() => {
    async function fetchData() {
      if (!token) return; // Navigation handled by first useEffect

      try {
        const storedOfficer = localStorage.getItem('officerInfo');
        const officerData = storedOfficer ? JSON.parse(storedOfficer) : null;
        setOfficer(officerData);

        console.log("Fetching events with showArchived:", showArchived);
        const eventsData = await getOfficerEvents(token, showArchived);
        console.log("Fetched events:", eventsData);
        setEvents(eventsData);
      } catch (error) {
        console.error("Failed to fetch data:", error.message);
        let errorMessage = 'Failed to load events. Please try again later.';
        if (error.message.includes('Officer not found')) {
          errorMessage = 'Your officer account was not found or is deactivated. Please contact support or log in again.';
        }
        if (error.message.includes('Invalid or expired token') || error.message.includes('HTTP error! status: 401')) {
          console.log('Authentication failed, clearing storage and redirecting to login');
          localStorage.removeItem('officerAccessToken');
          localStorage.removeItem('officerInfo');
          navigate('/officer-login');
        } else {
          setStatusModal({
            isOpen: true,
            title: 'Error',
            message: errorMessage,
            type: 'error',
          });
        }
      } finally {
        setIsLoading(false);
        setIsTransitioning(false);
      }
    }

    fetchData();
  }, [token, showArchived, navigate]);

  const handleAddNewEvent = () => {
    console.log("Opening add new event modal");
    setSelectedEvent(null);
    setShowEventModal(true);
  };

  const handleEdit = (evt, e) => {
    e.stopPropagation();
    console.log("Editing event:", evt.id);
    setSelectedEvent(evt);
    setShowEventModal(true);
  };

  // Open approval modal (admin only) before approving/declining
  const handleApproveEvent = (eventId, e) => {
    e.stopPropagation();
    setApprovalModal({
      isOpen: true,
      eventId,
    });
  };

  // Handle approve/decline action from approval modal
  const handleApprovalSubmit = async ({ action, reason }) => {
    const eventId = approvalModal.eventId;
    if (!eventId) {
      setApprovalModal({ isOpen: false, eventId: null });
      return;
    }

    if (action === 'decline') {
      // Frontend-only decline feedback for now
      setApprovalModal({ isOpen: false, eventId: null });
      setStatusModal({
        isOpen: true,
        title: 'Event Declined',
        message: `The event plan has been declined.${reason ? ` Reason: ${reason}` : ''}`,
        type: 'error',
      });
      return;
    }

    // Approve path – call backend endpoint
    try {
      const response = await fetch(`${API_URL}/events/${eventId}/approve`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 401) {
          localStorage.removeItem('officerAccessToken');
          localStorage.removeItem('officerInfo');
          navigate('/officer-login');
          return;
        }
        throw new Error(errorData.detail || 'Failed to approve event');
      }

      setApprovalModal({ isOpen: false, eventId: null });

      setStatusModal({
        isOpen: true,
        title: 'Event Approved',
        message: 'The event plan has been successfully approved.',
        type: 'success',
      });

      // Refresh the event list
      const updated = await getOfficerEvents(token, showArchived);
      setEvents(updated);
    } catch (error) {
      console.error("Failed to approve event:", error.message);
      setApprovalModal({ isOpen: false, eventId: null });
      setStatusModal({
        isOpen: true,
        title: 'Error',
        message: error.message || 'Failed to approve event. Please try again.',
        type: 'error',
      });
    }
  };

  const handleArchive = (eventId, e) => {
    e.stopPropagation();
    console.log("Opening archive confirmation for event:", eventId);
    setConfirmationModal({
      isOpen: true,
      title: 'Archive Event',
      message: 'Are you sure you want to archive this event? This action will move the event to archived status.',
      eventId: eventId,
      onConfirm: confirmArchive,
      isLoading: false,
    });
  };

  const confirmArchive = async () => {
    const eventId = confirmationModal.eventId;
    
    setConfirmationModal(prev => ({ ...prev, isLoading: true }));
    
    try {
      console.log("Archiving event:", eventId);
      await deleteOfficerEvent(eventId, token);
      const updated = await getOfficerEvents(token, showArchived);
      setEvents(updated);
      
      setConfirmationModal(prev => ({ ...prev, isOpen: false, isLoading: false }));
      
      setStatusModal({
        isOpen: true,
        title: 'Event Archived',
        message: 'The event has been successfully archived.',
        type: 'success',
      });
    } catch (error) {
      console.error("Failed to archive event:", error.message);
      if (error.message.includes('Invalid or expired token') || error.message.includes('HTTP error! status: 401')) {
        console.log('Authentication failed, clearing storage and redirecting to login');
        localStorage.removeItem('officerAccessToken');
        localStorage.removeItem('officerInfo');
        navigate('/officer-login');
      } else {
        setConfirmationModal(prev => ({ ...prev, isOpen: false, isLoading: false }));
        setStatusModal({
          isOpen: true,
          title: 'Error Archiving Event',
          message: 'Failed to archive the event. Please try again.',
          type: 'error',
        });
      }
    }
  };

  const handleDetails = (event, e) => {
    e.stopPropagation();
    console.log("Opening details for event:", event.id);
    setSelectedEvent(event);
    setShowDetailsModal(true);
  };

  const handleParticipants = async (event, e) => {
    e.stopPropagation();
    if (!event?.id) {
      console.error("Invalid event ID");
      setStatusModal({
        isOpen: true,
        title: 'Error',
        message: 'Cannot load participants: Invalid event.',
        type: 'error',
      });
      return;
    }
    setShowDetailsModal(false);
    setSelectedEvent(event);
    try {
      console.log("Fetching participants for event:", event.id);
      console.log("API URL:", `${API_URL}/events/${event.id}/participants`);
      console.log("Token:", token.substring(0, 10) + '...');
      const res = await fetch(`${API_URL}/events/${event.id}/participants`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Response status:", res.status);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        if (res.status === 401) {
          console.log('Authentication failed, redirecting to login');
          localStorage.removeItem('officerAccessToken');
          localStorage.removeItem('officerInfo');
          navigate('/officer-login');
          return;
        } else {
          console.error('Failed to fetch participants:', errorData.detail || 'Unknown');
          throw new Error(`HTTP error! Status: ${res.status}, detail: ${errorData.detail || 'Unknown'}`);
        }
      }
      const participantsData = await res.json();
      console.log("Participants data:", participantsData);
      setParticipants(participantsData || []);
      setShowParticipantsModal(true);
    } catch (error) {
      console.error('Failed to fetch participants:', error.message);
      setParticipants([]);
      setStatusModal({
        isOpen: true,
        title: 'Error',
        message: 'Failed to load participants. Please try again later.',
        type: 'error',
      });
      setShowParticipantsModal(true);
    }
  };

  const handleCloseEventModal = () => {
    console.log("Closing event modal");
    setShowEventModal(false);
  };

  const handleCloseDetailsModal = () => {
    console.log("Closing details modal");
    setShowDetailsModal(false);
    setSelectedEvent(null);
  };

  const handleCloseParticipantsModal = () => {
    console.log("Closing participants modal");
    setShowParticipantsModal(false);
    setParticipants([]);
  };

  const handleCloseStatusModal = () => {
    setStatusModal((prev) => ({ ...prev, isOpen: false }));
  };

  const handleCloseConfirmationModal = () => {
    if (!confirmationModal.isLoading) {
      setConfirmationModal(prev => ({ ...prev, isOpen: false }));
    }
  };

  const handleSave = async (formData, eventId) => {
    try {
      if (eventId) {
        console.log("Updating event:", eventId);
        await updateOfficerEvent(eventId, formData, token);
        setStatusModal({
          isOpen: true,
          title: 'Event Updated',
          message: 'Event updated successfully!',
          type: 'success',
        });
      } else {
        console.log("Creating new event");
        await createOfficerEvent(formData, token);
        setStatusModal({
          isOpen: true,
          title: 'Event Created',
          message: 'Event created successfully!',
          type: 'success',
        });
      }
      setShowEventModal(false);
      const updated = await getOfficerEvents(token, showArchived);
      setEvents(updated);
    } catch (error) {
      console.error("Error saving event:", error.message);
      let errorMessage = 'Failed to save the event. Please try again.';
      if (error.message.includes('Officer not found')) {
        errorMessage = 'Your officer account was not found or is deactivated. Please contact support or log in again.';
      }
      if (error.message.includes('Invalid or expired token') || error.message.includes('HTTP error! status: 401')) {
        console.log('Authentication failed, redirecting to login');
        localStorage.removeItem('officerAccessToken');
        localStorage.removeItem('officerInfo');
        navigate('/officer-login');
      } else {
        setStatusModal({
          isOpen: true,
          title: 'Error Saving Event',
          message: errorMessage,
          type: 'error',
        });
      }
    }
  };

  const toggleArchived = () => {
    console.log("Toggling archived:", !showArchived);
    setIsTransitioning(true);
    setShowArchived(!showArchived);
  };

  const formatEventDate = (dateString) => {
    if (!dateString) return { day: '', month: '', date: '', time: '', year: '' };
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

  const truncateText = (text, maxLength) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  // Show loading while fetching data or if officer info is not yet loaded
  if (isLoading || !token) {
    return <Loading message="Loading Events..." />;
  }

  // If no officer data after loading completes, redirect (handled by useEffect)
  if (!officer) {
    return null; // Navigation handled by useEffect
  }

  return (
    <OfficerLayout>
      <div className="events-page">
        <div className="events-header">
          <h1>Manage Events</h1>
          <div className="events-controls">
            <div className="events-toggle">
              <button
                className={`toggle-btn ${!showArchived ? 'active' : ''}`}
                onClick={toggleArchived}
              >
                Active Events
              </button>
              <button
                className={`toggle-btn ${showArchived ? 'active' : ''}`}
                onClick={toggleArchived}
              >
                Archived Events
              </button>
            </div>
            <button
              className="add-event-btn"
              onClick={handleAddNewEvent}
            >
              <i className="fas fa-plus"></i> Add New Event
            </button>
          </div>
        </div>

        <div className="events-section">
          {isTransitioning ? (
            <p className="transition-placeholder">Loading...</p>
          ) : events.length > 0 ? (
            <div className={`events-grid ${isTransitioning ? 'fade-out' : 'fade-in'}`}>
              {events.map((event) => {
                const eventDate = formatEventDate(event.date);
                return (
                  <div key={event.id} className="event-card">
                    <div className="event-card-inner">
                      <div className="event-date-badge">
                        <div className="event-month">{eventDate.month}</div>
                        <div className="event-day">{eventDate.day}</div>
                      </div>
                      <div className="event-image-wrapper">
                        <img 
                          src={
                            event.image_url
                              ? (event.image_url.startsWith("http")
                                ? event.image_url
                                : `${API_URL}${event.image_url}`)
                              : "/default_event.png"
                          } 
                          alt={event.title || 'Event'} 
                          className="event-image"
                        />
                        <div className="image-overlay"></div>
                        <div className="status-badge">
                          <i className="fas fa-users"></i> {event.participant_count || 0} Attendees
                        </div>
                        {!showArchived && (
                          <button 
                            className="participants-icon" 
                            onClick={(e) => handleParticipants(event, e)}
                            title="View Participants"
                          >
                            <i className="fas fa-users"></i>
                          </button>
                        )}
                      </div>
                      <div className="event-content">
                        <h3 className="events-title">{truncateText(event.title || '', 40)}</h3>
                        <div className="event-info">
                          <div className="event-info-item">
                            <i className="fas fa-clock event-icon"></i>
                            <span>{eventDate.time}</span>
                          </div>
                          <div className="event-info-item">
                            <i className="fas fa-map-marker-alt event-icon"></i>
                            <span>{truncateText(event.location || '', 25)}</span>
                          </div>
                        </div>
                        <div className="cards-actions">
                          {showArchived ? (
                            <>
                              <button className="details-btn" onClick={(e) => handleDetails(event, e)}>
                                <span>DETAILS</span>
                                <i className="fas fa-info-circle"></i>
                              </button>
                              <button className="participants-btn" onClick={(e) => handleParticipants(event, e)}>
                                <span>PARTICIPANTS</span>
                                <i className="fas fa-users"></i>
                              </button>
                            </>
                          ) : (
                            <>
                              <button className="edit-btn" onClick={(e) => handleEdit(event, e)}>
                                <span>EDIT</span>
                                <i className="fas fa-edit"></i>
                              </button>
                              {officer?.position?.toLowerCase() === 'admin' && (
                                <button 
                                  className="approve-btn" 
                                  onClick={(e) => handleApproveEvent(event.id, e)}
                                >
                                  <span>APPROVE EVENT PLAN</span>
                                  <i className="fas fa-check-circle"></i>
                                </button>
                              )}
                              <button className="archive-btn" onClick={(e) => handleArchive(event.id, e)}>
                                <span>ARCHIVE</span>
                                <i className="fas fa-archive"></i>
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className={`no-events-message ${isTransitioning ? 'fade-out' : 'fade-in'}`}>
              No {showArchived ? 'archived' : 'active'} events found. {showArchived ? '' : 'Click \'Add New Event\' to create one.'}
            </p>
          )}
        </div>

        <OfficerEventModal
          show={showEventModal}
          onClose={handleCloseEventModal}
          onSave={handleSave}
          initialEvent={selectedEvent}
        />
        {selectedEvent && (
          <EventModal
            event={selectedEvent}
            onClose={handleCloseDetailsModal}
            isOfficerView={true}
            show={showDetailsModal}
          />
        )}
        <EventParticipantsModal
          show={showParticipantsModal}
          participants={participants}
          onClose={handleCloseParticipantsModal}
          eventId={selectedEvent?.id}
        />
        <StatusModal
          isOpen={statusModal.isOpen}
          onClose={handleCloseStatusModal}
          title={statusModal.title}
          message={statusModal.message}
          type={statusModal.type}
        />
        <OfficerEventApprovalModal
          show={approvalModal.isOpen}
          onClose={() => setApprovalModal({ isOpen: false, eventId: null })}
          onSubmit={handleApprovalSubmit}
        />
        <ConfirmationModal
          isOpen={confirmationModal.isOpen}
          onClose={handleCloseConfirmationModal}
          onConfirm={confirmationModal.onConfirm}
          title={confirmationModal.title}
          message={confirmationModal.message}
          confirmText="Archive Event"
          cancelText="Cancel"
          type="danger"
          icon="fa-archive"
          isLoading={confirmationModal.isLoading}
        />
      </div>
    </OfficerLayout>
  );
};

export default OfficerManageEventsPage;