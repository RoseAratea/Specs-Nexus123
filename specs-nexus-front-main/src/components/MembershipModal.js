import React, { useState, useEffect, useRef } from 'react';
import '../styles/MembershipModal.css';
import { getQRCode, uploadReceiptFile, updateMembershipReceipt } from '../services/membershipService';
import StatusModal from './StatusModal';

const MembershipModal = ({ membership, onClose, onReceiptUploaded }) => {
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [receiptPreviewUrl, setReceiptPreviewUrl] = useState(null);
  const [activeTab, setActiveTab] = useState("paymaya");
  const [qrPreviewUrl, setQrPreviewUrl] = useState(null);
  const [qrError, setQrError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isReceiptLoading, setIsReceiptLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentMembership, setCurrentMembership] = useState(membership);
  const [showFullReceiptModal, setShowFullReceiptModal] = useState(false);
  const [fullReceiptUrl, setFullReceiptUrl] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [pendingUpdateResponse, setPendingUpdateResponse] = useState(null);
  const token = localStorage.getItem('access_token');
  const fileInputRef = useRef(null);

  const paymentMethods = ["paymaya", "gcash", "cash"];
  const expectedDomain = "specsnexus-images.senya-videos.workers.dev";

  const isPaid = currentMembership.payment_status?.toLowerCase() === "paid";
  const isDenied = currentMembership.payment_status?.toLowerCase() === "not paid" && currentMembership.denial_reason;

  useEffect(() => {
    setCurrentMembership(membership);
  }, [membership]);

  const fetchQRCodeData = async () => {
    setIsLoading(true);
    setQrError(null);
    try {
      const data = await getQRCode(activeTab, token);
      if (data && data.qr_code_url) {
        setQrPreviewUrl(data.qr_code_url.trim());
      } else {
        setQrPreviewUrl(null);
        setQrError(`No QR code available for ${activeTab}.`);
      }
    } catch (error) {
      console.error("Failed to fetch QR code:", error);
      setQrPreviewUrl(null);
      setQrError(error.response?.data?.detail || `Failed to load QR code for ${activeTab}. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isPaid && activeTab !== "cash") {
      fetchQRCodeData();
    } else if (activeTab === "cash") {
      setQrPreviewUrl(null);
      setQrError(null);
    }
  }, [activeTab, token, currentMembership, isPaid]);

  useEffect(() => {
    if (currentMembership.receipt_path && !selectedReceipt) {
      setIsReceiptLoading(true);
      const trimmedPath = currentMembership.receipt_path.trim();
      console.log("Receipt path received:", trimmedPath);

      try {
        const url = new URL(trimmedPath);
        if (url.hostname !== expectedDomain) {
          console.warn(`Receipt URL domain mismatch. Expected: ${expectedDomain}, Got: ${url.hostname}`);
          setQrError(`Invalid receipt URL domain. Please contact support.`);
          setReceiptPreviewUrl(null);
        } else {
          setReceiptPreviewUrl(trimmedPath);
          setQrError(null);
        }
      } catch (error) {
        console.error("Invalid receipt URL:", trimmedPath, error);
        setQrError("Invalid receipt URL format. Please contact support.");
        setReceiptPreviewUrl(null);
      } finally {
        setIsReceiptLoading(false);
      }
    } else if (!selectedReceipt) {
      setReceiptPreviewUrl(null);
      setIsReceiptLoading(false);
    }
  }, [currentMembership.receipt_path, selectedReceipt]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Restrict to PNG and JPEG only
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
      if (!allowedTypes.includes(file.type.toLowerCase())) {
        setQrError("Only PNG and JPEG images are allowed.");
        setSelectedReceipt(null);
        if (!currentMembership.receipt_path) {
          setReceiptPreviewUrl(null);
        }
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }
      setSelectedReceipt(file);
      setReceiptPreviewUrl(URL.createObjectURL(file));
      setQrError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedReceipt) {
      setQrError("No receipt file selected.");
      return;
    }

    try {
      setIsUploading(true);
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = prev + 10;
          if (newProgress >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return newProgress;
        });
      }, 300);

      const sanitizedFileName = selectedReceipt.name.replace(/\s+/g, '_');
      const sanitizedFile = new File([selectedReceipt], sanitizedFileName, {
        type: selectedReceipt.type,
        lastModified: selectedReceipt.lastModified,
      });
      console.log("Uploading file with sanitized name:", sanitizedFileName);

      const uploadResponse = await uploadReceiptFile(sanitizedFile, token);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      const updatePayload = {
        membership_id: currentMembership.id,
        payment_type: activeTab.toLowerCase(),
        receipt_path: uploadResponse.file_path,
      };
      const updateResponse = await updateMembershipReceipt(updatePayload, token);
      
      const updatedMembership = {
        ...currentMembership,
        receipt_path: uploadResponse.file_path,
        payment_method: activeTab.toLowerCase()
      };
      setCurrentMembership(updatedMembership);
      
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
        setSelectedReceipt(null);
        setPendingUpdateResponse(updateResponse);
        setShowStatusModal(true);
      }, 500);
      
    } catch (error) {
      setIsUploading(false);
      setUploadProgress(0);
      console.error("Receipt upload error:", error);
      setQrError(`Failed to upload receipt: ${error.response?.data?.detail || 'Unknown error'}`);
    }
  };

  const handlePaymentCompletedClose = () => {
    setShowStatusModal(false);
    if (pendingUpdateResponse) {
      onReceiptUploaded(pendingUpdateResponse);
      setPendingUpdateResponse(null);
    }
  };

  const switchToNext = () => {
    const currentIndex = paymentMethods.indexOf(activeTab);
    const nextIndex = (currentIndex + 1) % paymentMethods.length;
    setActiveTab(paymentMethods[nextIndex]);
  };

  const switchToPrevious = () => {
    const currentIndex = paymentMethods.indexOf(activeTab);
    const prevIndex = (currentIndex - 1 + paymentMethods.length) % paymentMethods.length;
    setActiveTab(paymentMethods[prevIndex]);
  };

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const getPaymentMethodLabel = (method) => {
    if (method === "gcash") return "G-Cash";
    if (method === "paymaya") return "PayMaya";
    if (method === "cash") return "Cash";
    return method.charAt(0).toUpperCase() + method.slice(1);
  };

  const formatDate = (date) => {
    return date ? new Date(date).toLocaleString('en-PH', { timeZone: 'Asia/Manila' }) : "N/A";
  };

  const openFullReceiptModal = (url) => {
    if (url) {
      setFullReceiptUrl(url);
      setShowFullReceiptModal(true);
    }
  };

  const closeFullReceiptModal = () => {
    setShowFullReceiptModal(false);
    setFullReceiptUrl(null);
  };

  const handleReceiptImageError = () => {
    console.error("Failed to load receipt image from:", receiptPreviewUrl);
    setQrError("Failed to load receipt image. The image may be corrupted or no longer available.");
    setReceiptPreviewUrl(null);
  };

  const ReceiptPreview = ({ label, receiptUrl }) => (
    <div className="receipt-preview-container">
      <p className="receipt-label"><strong>{label}:</strong></p>
      {isReceiptLoading ? (
        <div className="receipt-loading">Loading receipt...</div>
      ) : receiptUrl ? (
        <div className="receipt-image-container">
          <img 
            src={receiptUrl} 
            alt={label} 
            className="receipt-preview" 
            onClick={() => openFullReceiptModal(receiptUrl)}
            onError={handleReceiptImageError}
          />
          <p className="receipt-hint">Click to view full size</p>
        </div>
      ) : (
        <div className="receipt-placeholder">
          Receipt image not available.
        </div>
      )}
    </div>
  );

  return (
    <>
      <div className="modal-overlay" onClick={(e) => {
        if (e.target.className === "modal-overlay" && !showStatusModal) {
          onClose();
        }
      }}>
        <div className="modal-container">
          <div className="payment-header">
            <div className="payment-name">
              {isPaid ? "Membership Details" : getPaymentMethodLabel(activeTab)}
            </div>
            <button className="close-buttons" onClick={onClose} aria-label="Close">×</button>
          </div>
          
          {isPaid ? (
            <div className="membership-details-section">
              <h3 className="details-title">Membership Details</h3>
              <div className="details-grid">
                <div className="detail-card">
                  <span className="detail-label">Requirement:</span>
                  <span className="detail-value">{currentMembership.requirement || "N/A"}</span>
                </div>
                <div className="detail-card">
                  <span className="detail-label">Amount:</span>
                  <span className="detail-value">₱{currentMembership.amount || "0"}</span>
                </div>
                <div className="detail-card">
                  <span className="detail-label">Payment Method:</span>
                  <span className="detail-value">{currentMembership.payment_method ? getPaymentMethodLabel(currentMembership.payment_method) : "N/A"}</span>
                </div>
                <div className="detail-card">
                  <span className="detail-label">Payment Date:</span>
                  <span className="detail-value">{formatDate(currentMembership.payment_date)}</span>
                </div>
                <div className="detail-card">
                  <span className="detail-label">Approval Date:</span>
                  <span className="detail-value">{formatDate(currentMembership.approval_date)}</span>
                </div>
              </div>
              
              {currentMembership.receipt_path && (
                <ReceiptPreview label="Receipt" receiptUrl={receiptPreviewUrl} />
              )}
            </div>
          ) : (
            <div className={isDenied ? "denial-section" : ""}>
              {isDenied && (
                <div className="denial-details">
                  <h3 className="details-title">Payment Denied</h3>
                  <div className="details-grid">
                    <div className="detail-card">
                      <span className="detail-label">Requirement:</span>
                      <span className="detail-value">{currentMembership.requirement || "N/A"}</span>
                    </div>
                    <div className="detail-card">
                      <span className="detail-label">Amount:</span>
                      <span className="detail-value">₱{currentMembership.amount || "0"}</span>
                    </div>
                    <div className="detail-card">
                      <span className="detail-label">Denial Reason:</span>
                      <span className="detail-value denial-reason">{currentMembership.denial_reason || "No reason provided"}</span>
                    </div>
                  </div>
                </div>
              )}
              
              {currentMembership.receipt_path && !selectedReceipt && (
                <>
                  <div className="membership-details-section">
                    <h3 className="details-title">Payment Details</h3>
                    <div className="details-grid">
                      <div className="detail-card">
                        <span className="detail-label">Requirement:</span>
                        <span className="detail-value">{currentMembership.requirement || "N/A"}</span>
                      </div>
                      <div className="detail-card">
                        <span className="detail-label">Amount:</span>
                        <span className="detail-value">₱{currentMembership.amount || "0"}</span>
                      </div>
                      <div className="detail-card">
                        <span className="detail-label">Payment Method:</span>
                        <span className="detail-value">{currentMembership.payment_method ? getPaymentMethodLabel(currentMembership.payment_method) : "N/A"}</span>
                      </div>
                      <div className="detail-card">
                        <span className="detail-label">Payment Date:</span>
                        <span className="detail-value">{formatDate(currentMembership.payment_date)}</span>
                      </div>
                      <div className="detail-card">
                        <span className="detail-label">Approval Date:</span>
                        <span className="detail-value">{formatDate(currentMembership.approval_date)}</span>
                      </div>
                    </div>
                  </div>
                  <ReceiptPreview label="Current Receipt" receiptUrl={receiptPreviewUrl} />
                </>
              )}
              
              {/* Payment Method Selector */}
              <div className="payment-method-selector">
                <label className="payment-method-label">Select Payment Method:</label>
                <div className="payment-method-buttons">
                  {paymentMethods.map((method) => (
                    <button
                      key={method}
                      type="button"
                      className={`payment-method-btn ${activeTab === method ? 'active' : ''}`}
                      onClick={() => setActiveTab(method)}
                      disabled={isLoading}
                    >
                      {getPaymentMethodLabel(method)}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="qr-container">
                {isLoading ? (
                  <div className="qr-loading">Loading QR code...</div>
                ) : qrError && !receiptPreviewUrl ? (
                  <div className="qr-error">{qrError}</div>
                ) : qrPreviewUrl ? (
                  <>
                    <div className="scan-badge">SCAN ME</div>
                    <img 
                      src={qrPreviewUrl} 
                      alt="QR Code" 
                      className="qr-image" 
                      onError={() => setQrError(`Failed to load QR code image for ${activeTab}.`)} 
                    />
                  </>
                ) : (
                  <div className="qr-placeholder">No QR Code available</div>
                )}
                
                {paymentMethods.length > 1 && (
                  <div className="navigation-arrows">
                    <button 
                      className="nav-arrow left" 
                      onClick={switchToPrevious} 
                      aria-label="Previous" 
                      disabled={isLoading}
                    >
                    &lt;
                    </button>
                    <button 
                      className="nav-arrow right" 
                      onClick={switchToNext} 
                      aria-label="Next" 
                      disabled={isLoading}
                    >
                    &gt;
                    </button>
                  </div>
                )}
              </div>
              
              <div className="instruction-section">
                <h3>Instructions</h3>
                <ol className="instruction-steps">
                  {activeTab === "cash" ? (
                    <>
                      <li>Complete the cash payment for {currentMembership.requirement || "membership"}</li>
                      <li>Take a photo or screenshot of your receipt</li>
                      <li>Upload the receipt below</li>
                    </>
                  ) : (
                    <>
                      <li>Scan the QR code with your {getPaymentMethodLabel(activeTab)} app</li>
                      <li>Complete the payment for {currentMembership.requirement || "membership"}</li>
                      <li>Take a screenshot of your receipt</li>
                      <li>Upload the receipt below</li>
                    </>
                  )}
                </ol>
              </div>
              
              <div className="upload-section">
                <div className="upload-label">
                  {currentMembership.receipt_path ? 'Upload New Payment Receipt' : 'Upload Payment Receipt'}
                </div>
                <button 
                  className="upload-button" 
                  onClick={handleUploadClick} 
                  disabled={isUploading || isLoading}
                >
                  <span className="upload-icon">+</span>
                  <span>{selectedReceipt ? 'CHANGE FILE' : 'UPLOAD'}</span>
                </button>
                <input 
                  type="file" 
                  accept="image/png,image/jpeg,image/jpg" 
                  onChange={handleFileChange} 
                  style={{ display: 'none' }} 
                  ref={fileInputRef} 
                  disabled={isUploading || isLoading}
                />
              </div>
              
              {selectedReceipt && receiptPreviewUrl && (
                <div className="receipt-preview-container">
                  <p className="receipt-label"><strong>New Receipt Preview:</strong></p>
                  <div className="receipt-image-container">
                    <img 
                      src={receiptPreviewUrl} 
                      alt="Receipt Preview" 
                      className="receipt-preview" 
                      onClick={() => openFullReceiptModal(receiptPreviewUrl)}
                      onError={() => {
                        setQrError("Failed to load receipt preview image.");
                        setReceiptPreviewUrl(null);
                      }} 
                    />
                    <p className="receipt-hint">Click to view full size</p>
                  </div>
                  
                  {isUploading ? (
                    <div className="upload-progress-container">
                      <div className="upload-progress-bar">
                        <div 
                          className="upload-progress-fill" 
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                      <div className="upload-progress-text">
                        Uploading... {uploadProgress}%
                      </div>
                    </div>
                  ) : (
                    <button 
                      className="submit-receipt-btn" 
                      onClick={handleSubmit}
                      disabled={isLoading}
                    >
                      Submit Receipt
                    </button>
                  )}
                </div>
              )}
              
              {qrError && !receiptPreviewUrl && (
                <div className="error-message">
                  {qrError}
                </div>
              )}
            </div>
          )}

          {showFullReceiptModal && (
            <div className="modal-overlay full-receipt-overlay" onClick={closeFullReceiptModal}>
              <div className="full-recept-modal">
                <div className="full-receipt-header">
                  <button className="close-buttons" onClick={closeFullReceiptModal} aria-label="Close">×</button>
                </div>
                <img 
                  src={fullReceiptUrl} 
                  alt="Full Receipt" 
                  className="full-receipt-image"
                  onError={() => {
                    setQrError("Failed to load full receipt image.");
                    closeFullReceiptModal();
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <StatusModal 
        isOpen={showStatusModal}
        onClose={handlePaymentCompletedClose}
        title="Payment Updated"
        message="Your payment receipt has been successfully uploaded."
      />
    </>
  );
};

export default MembershipModal;