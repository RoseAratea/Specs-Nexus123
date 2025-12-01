import React, { useState } from 'react';
import '../styles/ECertificateModal.css';

const ECertificateModal = ({ certificate, onClose, show = false }) => {
  const [showFullImage, setShowFullImage] = useState(false);

  if (!show || !certificate) {
    return null;
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown Date';
    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const isPdf = certificate.certificate_url && certificate.certificate_url.toLowerCase().endsWith('.pdf');
  const isImage = certificate.certificate_url && /\.(jpg|jpeg|png)$/i.test(certificate.certificate_url.toLowerCase());

  const getCertificateUrl = () => {
    if (!certificate.certificate_url) return '/assets/pdf-placeholder.png';
    return certificate.certificate_url.startsWith('http')
      ? certificate.certificate_url
      : `https://specs-nexus-production.up.railway.app${certificate.certificate_url}`;
  };

  const getThumbnailUrl = () => {
    if (!isPdf) return getCertificateUrl();
    return certificate.thumbnail_url || '/assets/pdf-placeholder.png';
  };

  const getFileExtension = () => {
    if (isPdf) return 'PDF';
    if (isImage) return certificate.certificate_url.split('.').pop().toUpperCase();
    return 'Unknown';
  };

  const handleDownload = async () => {
    const url = getCertificateUrl();
    const fileName = certificate.file_name || (isPdf ? 'certificate.pdf' : `certificate.${certificate.certificate_url.split('.').pop()}`);

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch file');
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Download failed:', error);
      // Fallback to opening the URL in a new tab if download fails
      window.open(url, '_blank');
    }
  };

  return (
    <>
      <div className="v-ecertificate-modal-overlay" onClick={onClose}>
        <div className="v-ecertificate-modal-container" onClick={(e) => e.stopPropagation()}>
          {showFullImage && certificate.certificate_url && (
            <div className="v-fullscreen-image-overlay" onClick={() => setShowFullImage(false)}>
              <div className="v-fullscreen-image-container">
                <button
                  className="v-close-fullscreen"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowFullImage(false);
                  }}
                >
                  <i className="fas fa-times"></i>
                </button>
                <img
                  src={getThumbnailUrl()}
                  alt={certificate.event_title || 'Untitled Certificate'}
                  className="v-fullscreen-image"
                />
              </div>
            </div>
          )}
          <button className="v-close-modal" onClick={onClose} aria-label="Close modal">
            <i className="fas fa-times"></i>
          </button>

          <div className="v-ecertificate-modal-header">
            {certificate.certificate_url ? (
              <div className="v-ecertificate-image-container">
                <img
                  src={getThumbnailUrl()}
                  alt={certificate.event_title || 'Untitled Certificate'}
                  className="v-ecertificate-images"
                  onClick={() => setShowFullImage(true)}
                />
                {(isPdf || isImage) && (
                  <div className="v-file-indicator">
                    <i className={isPdf ? 'fas fa-file-pdf' : 'fas fa-image'}></i>
                    <span>{getFileExtension()}</span>
                  </div>
                )}
                <div className="v-image-zoom-indicator">
                  <i className="fas fa-search-plus"></i>
                </div>
              </div>
            ) : (
              <div className="v-ecertificate-placeholder">
                <img
                  src="/assets/pdf-placeholder.png"
                  alt="No certificate available"
                  className="v-ecertificate-images"
                />
                <p>No certificate available</p>
              </div>
            )}
            <h2 className="v-ecertificate-title">{certificate.event_title || 'Untitled Certificate'}</h2>
          </div>

          <div className="v-ecertificate-modal-content">
            <div className="v-ecertificate-meta">
              <div className="v-ecertificate-meta-item">
                <i className="fas fa-certificate"></i>
                <div>
                  <span className="v-meta-label">Event</span>
                  <span className="v-meta-value">{certificate.event_title || 'Untitled Certificate'}</span>
                </div>
              </div>

              <div className="v-ecertificate-meta-item">
                <i className="fas fa-calendar-alt"></i>
                <div>
                  <span className="v-meta-label">Issued Date</span>
                  <span className="v-meta-value">{formatDate(certificate.issued_date)}</span>
                </div>
              </div>

              <div className="v-ecertificate-meta-item">
                <i className="fas fa-file-alt"></i>
                <div>
                  <span className="v-meta-label">File Name</span>
                  <span className="v-meta-value">{certificate.file_name || (isPdf ? 'certificate.pdf' : `certificate.${certificate.certificate_url.split('.').pop()}`)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="v-ecertificate-modal-footer">
            {certificate.certificate_url && (
              <button className="v-btn-download" onClick={handleDownload}>
                <i className="fas fa-download"></i> Download Certificate
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ECertificateModal;