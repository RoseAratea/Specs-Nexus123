import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StatusModal from './StatusModal';
import '../styles/EventParticipantsModal.css';

// Use the same API resolution logic as the rest of the app
const defaultBackendBaseUrl = 'https://specs-nexus.onrender.com';
const API_URL =
  process.env.REACT_APP_API_URL ||
  (typeof window !== 'undefined' && window.location && window.location.hostname === 'localhost'
    ? 'http://localhost:8000'
    : defaultBackendBaseUrl);

const EventParticipantsModal = ({ show, participants = [], onClose, isLoading = false, eventId }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusModal, setStatusModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'success',
  });
  const [uploading, setUploading] = useState({});
  const [certificateData, setCertificateData] = useState({});
  const navigate = useNavigate();

  // Fetch certificate metadata for each participant
  useEffect(() => {
    if (!show || !eventId || isLoading || !participants.length) return;

    const fetchCertificates = async () => {
      const newCertificateData = {};
      const token = localStorage.getItem('officerAccessToken');
      if (!token) {
        console.log('No officer token found, redirecting to login');
        localStorage.removeItem('officerAccessToken');
        localStorage.removeItem('officerInfo');
        navigate('/officer-login');
        return;
      }

      for (const participant of participants) {
        try {
          const response = await fetch(`${API_URL}/events/${eventId}/certificates/${participant.id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (response.ok) {
            const data = await response.json();
            newCertificateData[participant.id] = {
              file_url: data.certificate_url || null,
              file_name: data.file_name || 'Certificate',
              event_title: data.event_title || 'Unknown Event',
            };
          } else if (response.status === 404) {
            // Certificate not found for this user
            newCertificateData[participant.id] = null;
          } else if (response.status === 401) {
            console.log('Authentication failed, redirecting to login');
            localStorage.removeItem('officerAccessToken');
            localStorage.removeItem('officerInfo');
            navigate('/officer-login');
            return;
          } else {
            console.warn(`Failed to fetch certificate for user ${participant.id}: ${response.status}`);
            newCertificateData[participant.id] = null;
          }
        } catch (err) {
          console.error(`Failed to fetch certificate for user ${participant.id}:`, err);
          newCertificateData[participant.id] = null;
        }
      }
      setCertificateData(newCertificateData);
    };

    fetchCertificates();
  }, [show, eventId, participants, isLoading, navigate]);

  const filteredParticipants = useMemo(() => {
    if (!searchTerm) return participants;
    const lowerSearch = searchTerm.toLowerCase();
    return participants.filter(p =>
      (p.full_name?.toLowerCase()?.includes(lowerSearch) || '') ||
      (p.email?.toLowerCase()?.includes(lowerSearch) || '') ||
      (p.block?.toLowerCase()?.includes(lowerSearch) || '') ||
      (p.year?.toString()?.includes(lowerSearch) || '')
    );
  }, [participants, searchTerm]);

  if (!show) return null;

  const bccEmails = participants.map(p => p.email).filter(email => email).join(',');
  const subject = encodeURIComponent("Message to Event Participants");
  const mailtoLink = `mailto:?bcc=${encodeURIComponent(bccEmails)}&subject=${subject}`;

  const handleCopyEmails = async () => {
    if (!bccEmails) {
      setStatusModal({
        isOpen: true,
        title: 'No Emails',
        message: 'No valid participant emails available to copy.',
        type: 'error',
      });
      return;
    }
    try {
      await navigator.clipboard.writeText(bccEmails);
      setStatusModal({
        isOpen: true,
        title: 'Emails Copied',
        message: 'Emails copied successfully!',
        type: 'success',
      });
    } catch (err) {
      console.error('Failed to copy emails:', err);
      setStatusModal({
        isOpen: true,
        title: 'Copy Failed',
        message: 'Failed to copy emails. Please try again.',
        type: 'error',
      });
    }
  };

  const handleUploadCertificate = async (userId, file) => {
    if (!file) {
      setStatusModal({
        isOpen: true,
        title: 'No File Selected',
        message: 'Please select a file to upload.',
        type: 'error',
      });
      return;
    }

    if (!eventId) {
      setStatusModal({
        isOpen: true,
        title: 'Invalid Event',
        message: 'Event ID is missing. Please try again.',
        type: 'error',
      });
      return;
    }

    setUploading(prev => ({ ...prev, [userId]: true }));

    try {
      const sanitizedFileName = file.name.replace(/\s+/g, '');
      const sanitizedFile = new File([file], sanitizedFileName, { type: file.type });

      const formData = new FormData();
      formData.append('certificate', sanitizedFile);

      const token = localStorage.getItem('officerAccessToken');
      if (!token) {
        console.log('No officer token found, redirecting to login');
        localStorage.removeItem('officerAccessToken');
        localStorage.removeItem('officerInfo');
        navigate('/officer-login');
        return;
      }

      const response = await fetch(`${API_URL}/events/${eventId}/certificates/${userId}`, {
        method: 'POST',
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('Certificate upload response:', { status: response.status, statusText: response.statusText });

      if (!response.ok) {
        let errorMessage = 'Failed to upload certificate';
        let errorData = {};
        try {
          errorData = await response.json();
          errorMessage = errorData.detail || errorMessage;
        } catch (e) {
          console.error('Failed to parse error response:', e);
        }
        console.error('Certificate upload error:', errorData);
        if (response.status === 401) {
          console.log('Authentication failed, redirecting to login');
          localStorage.removeItem('officerAccessToken');
          localStorage.removeItem('officerInfo');
          navigate('/officer-login');
          return;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setCertificateData(prev => ({
        ...prev,
        [userId]: {
          file_url: data.certificate_url || null,
          file_name: data.file_name || 'Certificate',
          event_title: data.event_title || 'Unknown Event',
        },
      }));

      setStatusModal({
        isOpen: true,
        title: 'Certificate Uploaded',
        message: certificateData[userId] ? 'E-Certificate replaced successfully!' : 'Certificate uploaded successfully!',
        type: 'success',
      });
    } catch (err) {
      console.error('Failed to upload certificate:', err);
      setStatusModal({
        isOpen: true,
        title: 'Upload Failed',
        message: err.message || 'Failed to upload certificate. Please try again.',
        type: 'error',
      });
    } finally {
      setUploading(prev => ({ ...prev, [userId]: false }));
    }
  };

  const closeStatusModal = () => {
    setStatusModal(prev => ({ ...prev, isOpen: false }));
  };

  return (
    <div className="ep-modal-overlay">
      <div className="ep-modal-container">
        <button
          className="ep-modal-close"
          onClick={onClose}
          aria-label="Close modal"
        >
          ×
        </button>
        <h2>Event Participants</h2>

        <div className="ep-search-container">
          <input
            type="text"
            placeholder="Search by name, email, block, or year..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="ep-search-input"
            aria-label="Search participants"
          />
        </div>

        <div className="ep-participant-stats">
          <p>Total: {participants.length}</p>
          <p>Showing: {filteredParticipants.length}</p>
        </div>

        {isLoading ? (
          <div className="ep-loading">Loading participants...</div>
        ) : filteredParticipants.length > 0 ? (
          <div className="ep-participants-list">
            {filteredParticipants.map((participant) => (
              <div key={participant.id} className="ep-participant-item">
                <div className="ep-participant-header">
                  <h3 className="ep-participant-name">{participant.full_name || 'Unknown'}</h3>
                  <div className="ep-participant-actions">
                    <input
                      type="file"
                      id={`certificate-upload-${participant.id}`}
                      accept="image/*,application/pdf"
                      style={{ display: 'none' }}
                      onChange={(e) => handleUploadCertificate(participant.id, e.target.files[0])}
                      disabled={uploading[participant.id]}
                    />
                    <button
                      className="ep-upload-cert-btn"
                      onClick={() => document.getElementById(`certificate-upload-${participant.id}`).click()}
                      disabled={uploading[participant.id]}
                    >
                      {uploading[participant.id] ? 'Uploading...' : certificateData[participant.id] ? 'Replace Certificate' : 'Upload Certificate'}
                    </button>
                    <a
                      href={participant.email ? `mailto:${participant.email}` : '#'}
                      className={`ep-participant-email-link ${!participant.email ? 'disabled' : ''}`}
                      title={participant.email ? `Email ${participant.full_name || 'Unknown'}` : 'No email available'}
                    >
                      Email
                    </a>
                  </div>
                </div>
                <div className="ep-participant-details">
                  <span>{participant.block || 'N/A'} - {participant.year || 'N/A'}</span>
                  <span className="ep-participant-email">{participant.email || 'No email'}</span>
                </div>
                <div className="ep-certificate-column">
                  {certificateData[participant.id] ? (
                    <a
                      href={certificateData[participant.id].file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ep-certificate-link"
                      title="View certificate"
                    >
                      {certificateData[participant.id].file_name} ({certificateData[participant.id].event_title})
                    </a>
                  ) : (
                    <span className="ep-no-certificate">No certificate uploaded</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="ep-no-results">No participants found.</p>
        )}

        <div className="ep-modal-actions">
          <button
            className="ep-copy-emails-btn"
            onClick={handleCopyEmails}
            disabled={isLoading || !participants.length || !bccEmails}
          >
            Copy All Emails
          </button>
          <a
            href={bccEmails ? mailtoLink : '#'}
            target="_blank"
            rel="noopener noreferrer"
            className={bccEmails ? '' : 'disabled'}
          >
            <button
              className="ep-send-email-btn"
              disabled={isLoading || !participants.length || !bccEmails}
            >
              Send Group Email
            </button>
          </a>
        </div>
      </div>

      <StatusModal
        isOpen={statusModal.isOpen}
        onClose={closeStatusModal}
        title={statusModal.title}
        message={statusModal.message}
        type={statusModal.type}
      />
    </div>
  );
};

class EventParticipantsModalWithBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="ep-modal-overlay">
          <div className="ep-modal-container">
            <h2>Error</h2>
            <p>Something went wrong displaying the participants. Please try again.</p>
            <button
              className="ep-send-email-btn"
              onClick={this.props.onClose}
            >
              Close
            </button>
          </div>
        </div>
      );
    }
    return <EventParticipantsModal {...this.props} />;
  }
}

export default EventParticipantsModalWithBoundary;