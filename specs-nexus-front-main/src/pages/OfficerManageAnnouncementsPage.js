import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Added import
import {
  getOfficerAnnouncements,
  createOfficerAnnouncement,
  updateOfficerAnnouncement,
  deleteOfficerAnnouncement
} from '../services/officerAnnouncementService';
import OfficerAnnouncementModal from '../components/OfficerAnnouncementModal';
import AnnouncementModal from '../components/AnnouncementModal';
import OfficerLayout from '../components/OfficerLayout';
import Loading from '../components/Loading';
import StatusModal from '../components/StatusModal';
import ConfirmationModal from '../components/ConfirmationModal';
import '../styles/OfficerManageAnnouncementsPage.css';

const backendBaseUrl = 'https://specs-nexus.onrender.com';

const API_URL =
  process.env.REACT_APP_API_URL ||
  (typeof window !== 'undefined' && window.location && window.location.hostname === 'localhost'
    ? 'http://localhost:8000'
    : backendBaseUrl);
    
const OfficerManageAnnouncementsPage = () => {
  const [officer, setOfficer] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
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
    announcementId: null,
    isLoading: false,
  });
  const token = localStorage.getItem('officerAccessToken');
  const navigate = useNavigate(); // Added navigate

  // Handle authentication check on mount
  useEffect(() => {
    if (!token || !localStorage.getItem('officerInfo')) {
      console.log('No officer token or info found, redirecting to login');
      localStorage.removeItem('officerAccessToken');
      localStorage.removeItem('officerInfo');
      navigate('/officer-login');
    }
  }, [token, navigate]);

  // Fetch announcements
  useEffect(() => {
    async function fetchData() {
      if (!token) return; // Navigation handled by first useEffect

      try {
        const storedOfficer = localStorage.getItem('officerInfo');
        const officerData = storedOfficer ? JSON.parse(storedOfficer) : null;
        setOfficer(officerData);

        console.log("Fetching announcements with showArchived:", showArchived);
        const announcementsData = await getOfficerAnnouncements(token, showArchived);
        console.log("Fetched announcements:", announcementsData);
        setAnnouncements(announcementsData);
      } catch (error) {
        console.error("Failed to fetch data:", error.message);
        let errorMessage = 'Failed to load announcements. Please try again later.';
        
        const isOfficerNotFound = error.message.includes('Officer not found') || 
                                  error.message.includes('detail: Officer not found');
        const isTokenExpired = error.message.includes('Token expired') || 
                               error.message.includes('expired token');
        const isInvalidToken = error.message.includes('Invalid token') || 
                               error.message.includes('Invalid authentication credentials') ||
                               error.message.includes('Could not validate credentials');
        const is401Error = error.message.includes('HTTP error! status: 401');
        
        if (isOfficerNotFound) {
          errorMessage = 'Your officer account was not found or is deactivated. Please contact support or log in again.';
        }
        
        if (isOfficerNotFound || isTokenExpired || isInvalidToken || (is401Error && !isOfficerNotFound)) {
          console.log('Authentication failed, clearing storage and redirecting to login');
          localStorage.removeItem('officerAccessToken');
          localStorage.removeItem('officerInfo');
          navigate('/officer-login');
        } else {
          // Don't redirect on other errors, just show error state
          console.error('Error loading announcements:', errorMessage);
        }
      } finally {
        setIsLoading(false);
        setIsTransitioning(false);
      }
    }

    fetchData();
  }, [token, showArchived, navigate]);

  const handleAddNewAnnouncement = () => {
    console.log("Opening add new announcement modal");
    setSelectedAnnouncement(null);
    setShowModal(true);
  };

  const handleEdit = (announcement, e) => {
    e.stopPropagation();
    console.log("Editing announcement:", announcement.id);
    setSelectedAnnouncement(announcement);
    setShowModal(true);
  };

  const handleDetails = (announcement, e) => {
    e.stopPropagation();
    console.log("Viewing details for announcement:", announcement.id);
    setSelectedAnnouncement(announcement);
    setShowDetailsModal(true);
  };

  const handleArchive = (announcementId, e) => {
    e.stopPropagation();
    console.log("Opening archive confirmation for announcement:", announcementId);
    setConfirmationModal({
      isOpen: true,
      title: 'Archive Announcement',
      message: 'Are you sure you want to archive this announcement? This action will move the announcement to archived status.',
      announcementId: announcementId,
      onConfirm: confirmArchive,
      isLoading: false,
    });
  };

  const confirmArchive = async () => {
    const announcementId = confirmationModal.announcementId;
    
    setConfirmationModal(prev => ({ ...prev, isLoading: true }));
    
    try {
      console.log("Archiving announcement:", announcementId);
      await deleteOfficerAnnouncement(announcementId, token);
      const updated = await getOfficerAnnouncements(token, showArchived);
      setAnnouncements(updated);
      
      setConfirmationModal(prev => ({ ...prev, isOpen: false, isLoading: false }));
      
      setStatusModal({
        isOpen: true,
        title: 'Announcement Archived',
        message: 'The announcement has been successfully archived.',
        type: 'success',
      });
    } catch (error) {
      console.error("Failed to archive announcement:", error);
      
      setConfirmationModal(prev => ({ ...prev, isOpen: false, isLoading: false }));
      
      setStatusModal({
        isOpen: true,
        title: 'Error Archiving Announcement',
        message: 'Failed to archive the announcement. Please try again.',
        type: 'error',
      });
    }
  };

  const handleCloseModal = () => {
    console.log("Closing announcement modal");
    setShowModal(false);
    setSelectedAnnouncement(null);
  };

  const handleCloseDetailsModal = () => {
    console.log("Closing details modal");
    setShowDetailsModal(false);
    setSelectedAnnouncement(null);
  };

  const handleCloseStatusModal = () => {
    setStatusModal((prev) => ({ ...prev, isOpen: false }));
  };

  const handleCloseConfirmationModal = () => {
    if (!confirmationModal.isLoading) {
      setConfirmationModal(prev => ({ ...prev, isOpen: false }));
    }
  };

  const handleSave = async (formData, announcementId) => {
    try {
      if (announcementId) {
        console.log("Updating announcement:", announcementId);
        await updateOfficerAnnouncement(announcementId, formData, token);
        setStatusModal({
          isOpen: true,
          title: 'Announcement Updated',
          message: 'Announcement updated successfully!',
          type: 'success',
        });
      } else {
        console.log("Creating new announcement");
        await createOfficerAnnouncement(formData, token);
        setStatusModal({
          isOpen: true,
          title: 'Announcement Created',
          message: 'Announcement created successfully!',
          type: 'success',
        });
      }
      setShowModal(false);
      const updated = await getOfficerAnnouncements(token, showArchived);
      setAnnouncements(updated);
    } catch (error) {
      console.error("Error saving announcement:", error);
      setStatusModal({
        isOpen: true,
        title: 'Error Saving Announcement',
        message: 'Failed to save the announcement. Please try again.',
        type: 'error',
      });
    }
  };

  const toggleArchived = () => {
    console.log("Toggling archived:", !showArchived);
    setIsTransitioning(true);
    setShowArchived(!showArchived);
  };

  const formatAnnouncementDate = (dateString) => {
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

  // Show loading while fetching data or if token is missing
  if (isLoading || !token) {
    return <Loading message="Loading Announcements..." />;
  }

  // If no officer data after loading completes, redirect (handled by useEffect)
  if (!officer) {
    return null; // Navigation handled by useEffect
  }

  return (
    <OfficerLayout>
      <div className="announcements-page">
        <div className="announcements-header">
          <h1>Manage Announcements</h1>
          <div className="announcements-controls">
            <div className="announcements-toggle">
              <button
                className={`toggle-btn ${!showArchived ? 'active' : ''}`}
                onClick={toggleArchived}
              >
                Active Announcements
              </button>
              <button
                className={`toggle-btn ${showArchived ? 'active' : ''}`}
                onClick={toggleArchived}
              >
                Archived Announcements
              </button>
            </div>
            <button
              className="add-announcement-btn"
              onClick={handleAddNewAnnouncement}
            >
              <i className="fas fa-plus"></i> Add New Announcement
            </button>
          </div>
        </div>

        <div className="announcements-section">
          {isTransitioning ? (
            <p className="transition-placeholder">Loading...</p>
          ) : announcements.length > 0 ? (
            <div className={`announcements-grid ${isTransitioning ? 'fade-out' : 'fade-in'}`}>
              {announcements.map((announcement) => {
                const announcementDate = formatAnnouncementDate(announcement.date);
                return (
                  <div key={announcement.id} className="announcement-card">
                    <div className="announcement-card-inner">
                      <div className="announcement-date-badge">
                        <div className="announcement-month">{announcementDate.month}</div>
                        <div className="announcement-day">{announcementDate.day}</div>
                      </div>
                      <div className="announcement-image-wrapper">
                        <img 
                          src={
                            announcement.image_url
                              ? (announcement.image_url.startsWith("http")
                                ? announcement.image_url
                                : `https://specs-nexus-production.up.railway.app${announcement.image_url}`)
                              : "/default_announcement.png"
                          } 
                          alt={announcement.title || 'Announcement'} 
                          className="announcement-image"
                        />
                        <div className="image-overlay"></div>
                      </div>
                      <div className="announcement-content">
                        <h3 className="announcements-title">{truncateText(announcement.title, 40)}</h3>
                        <div className="announcement-info">
                          <div className="announcement-info-item">
                            <i className="fas fa-clock announcement-icon"></i>
                            <span>{announcementDate.time}</span>
                          </div>
                          <div className="announcement-info-item">
                            <i className="fas fa-map-marker-alt announcement-icon"></i>
                            <span>{truncateText(announcement.location, 25)}</span>
                          </div>
                        </div>
                        <div className="cards-actions">
                          {showArchived ? (
                            <button className="details-btn" onClick={(e) => handleDetails(announcement, e)}>
                              <span>DETAILS</span>
                              <i className="fas fa-info-circle"></i>
                            </button>
                          ) : (
                            <>
                              <button className="edit-btn" onClick={(e) => handleEdit(announcement, e)}>
                                <span>EDIT</span>
                                <i className="fas fa-edit"></i>
                              </button>
                              <button className="archive-btn" onClick={(e) => handleArchive(announcement.id, e)}>
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
            <p className={`no-announcements-message ${isTransitioning ? 'fade-out' : 'fade-in'}`}>
              No {showArchived ? 'archived' : 'active'} announcements found. {showArchived ? '' : 'Click \'Add New Announcement\' to create one.'}
            </p>
          )}
        </div>

        <OfficerAnnouncementModal
          show={showModal}
          onClose={handleCloseModal}
          onSave={handleSave}
          initialAnnouncement={selectedAnnouncement}
        />
        <AnnouncementModal
          announcement={selectedAnnouncement}
          onClose={handleCloseDetailsModal}
          show={showDetailsModal}
        />
        <StatusModal
          isOpen={statusModal.isOpen}
          onClose={handleCloseStatusModal}
          title={statusModal.title}
          message={statusModal.message}
          type={statusModal.type}
        />
        <ConfirmationModal
          isOpen={confirmationModal.isOpen}
          onClose={handleCloseConfirmationModal}
          onConfirm={confirmationModal.onConfirm}
          title={confirmationModal.title}
          message={confirmationModal.message}
          confirmText="Archive Announcement"
          cancelText="Cancel"
          type="danger"
          icon="fa-archive"
          isLoading={confirmationModal.isLoading}
        />
      </div>
    </OfficerLayout>
  );
};

export default OfficerManageAnnouncementsPage;