import React, { useState, useEffect, useRef } from 'react';
import { getQRCode } from '../services/officerMembershipService';
import '../styles/OfficerQRManagementModal.css';

const OfficerQRManagementModal = ({ show, onClose, onQRUpload }) => {
  const token = localStorage.getItem('officerAccessToken');
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedType, setSelectedType] = useState('paymaya');
  const [qrPreviewUrl, setQrPreviewUrl] = useState(null);
  const [qrError, setQrError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const modalRef = useRef(null);
  const firstInputRef = useRef(null);

  const fetchQRCodeData = async () => {
    setIsLoading(true);
    setQrError(null);
    try {
      const data = await getQRCode(selectedType, token);
      if (data && data.qr_code_url) {
        setQrPreviewUrl(data.qr_code_url);
      } else {
        setQrPreviewUrl(null);
        setQrError(`No QR code available for ${selectedType}.`);
      }
    } catch (error) {
      console.error('Failed to fetch QR code:', error);
      setQrPreviewUrl(null);
      setQrError(error.response?.data?.detail || `Failed to load QR code for ${selectedType}.`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!token || !show) return;
    fetchQRCodeData();
  }, [selectedType, token, show]);

  useEffect(() => {
    if (show && firstInputRef.current) {
      firstInputRef.current.focus();
    }
  }, [show]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && !file.type.startsWith('image/')) {
      setQrError('Please select an image file.');
      setSelectedFile(null);
      return;
    }
    setSelectedFile(file);
    setQrError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setQrError('Please select a file.');
      return;
    }
    setIsLoading(true);
    try {
      const sanitizedFileName = selectedFile.name.replace(/\s+/g, '_');
      const sanitizedFile = new File([selectedFile], sanitizedFileName, {
        type: selectedFile.type,
        lastModified: selectedFile.lastModified,
      });
      await onQRUpload(selectedType, sanitizedFile);
      setSelectedFile(null);
      setQrError(null);
      await fetchQRCodeData();
    } catch (error) {
      setQrError(`Failed to upload QR code: ${error.response?.data?.detail || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setQrError(null);
    onClose();
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      handleClose();
    }
  };

  if (!show) return null;

  return (
    <div
      className="modal-overlay-ss"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title-ss"
      onKeyDown={handleKeyDown}
      ref={modalRef}
    >
      <div className="modal-container-ss">
        <button className="modal-close-ss" onClick={handleClose} aria-label="Close modal">
          <i className="fas fa-times"></i>
        </button>
        <h2 id="modal-title-ss">Manage QR Code</h2>
        <div className="qr-code-preview-ss">
          {isLoading ? (
            <p className="loading-message-ss">Loading QR code...</p>
          ) : qrError ? (
            <p className="qr-error-ss">{qrError}</p>
          ) : qrPreviewUrl ? (
            <img
              src={qrPreviewUrl}
              alt="QR Code Preview"
              onError={() => setQrError('Failed to load QR code image.')}
            />
          ) : (
            <div className="qr-placeholder-ss">
              <i className="fas fa-qrcode"></i>
              <p>No QR Code Uploaded</p>
            </div>
          )}
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-field-ss">
            <label htmlFor="payment-type">Select Payment Type</label>
            <select
              id="payment-type"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              ref={firstInputRef}
            >
              <option value="paymaya">PayMaya</option>
              <option value="gcash">GCash</option>
            </select>
          </div>
          <div className="form-field-ss">
            <label htmlFor="qr-file">Upload QR Code</label>
            <input
              id="qr-file"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={isLoading}
              aria-describedby={qrError ? 'qr-error-message-ss' : undefined}
            />
            {qrError && (
              <span id="qr-error-message-ss" className="error-message-ss">
                {qrError}
              </span>
            )}
          </div>
          <div className="form-buttons-ss">
            <button
              type="submit"
              className="save-button-ss"
              disabled={!selectedFile || isLoading}
            >
              {isLoading ? 'Uploading...' : 'Upload New QR Code'}
            </button>
            <button
              type="button"
              className="cancel-button-ss"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OfficerQRManagementModal;