import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ECertificateModal from '../components/ECertificateModal';
import Layout from '../components/Layout';
import Loading from '../components/Loading';
import { getProfile } from '../services/userService';
import '../styles/ECertificatesPage.css';

const backendBaseUrl = 'https://specs-nexus.onrender.com';

const API_URL =
  process.env.REACT_APP_API_URL ||
  (typeof window !== 'undefined' && window.location && window.location.hostname === 'localhost'
    ? 'http://localhost:8000'
    : backendBaseUrl);
const ECertificatesPage = () => {
  const [certificates, setCertificates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCertificatesLoading, setIsCertificatesLoading] = useState(true);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [user, setUser] = useState(null);
  const token = localStorage.getItem('access_token');
  const navigate = useNavigate();

  // Early token check
  useEffect(() => {
    if (!token) {
      console.log('No access token found, redirecting to login');
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_id');
      navigate('/');
      return;
    }
  }, [token, navigate]);

  // Fetch user profile
  useEffect(() => {
    if (!token) return;

    async function fetchProfile() {
      try {
        console.log('Fetching user profile...');
        const userData = await getProfile(token);
        console.log('User profile fetched successfully:', userData);
        setUser(userData);
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
        console.log('Clearing storage and redirecting to login due to profile fetch error');
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_id');
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    }
    fetchProfile();
  }, [token, navigate]);

  // Fetch certificates and their thumbnails
  useEffect(() => {
    if (!token) return;

    async function fetchCertificates() {
      setIsCertificatesLoading(true);
      try {
        const response = await fetch(`${backendBaseUrl}/events/certificates`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!response.ok) throw new Error(`Failed to fetch certificates: ${response.status} ${response.statusText}`);
        const data = await response.json();
        console.log('Certificates fetched:', data);

        // Fetch thumbnails for each certificate
        const certificatesWithThumbnails = await Promise.all(
          data.map(async (certificate) => {
            if (certificate.thumbnail_url) {
              return certificate;
            }
            try {
              const thumbnailResponse = await fetch(`${backendBaseUrl}/events/certificates/${certificate.id}/thumbnail`, {
                headers: {
                  'Authorization': `Bearer ${token}`,
                },
              });
              if (!thumbnailResponse.ok) throw new Error(`Failed to fetch thumbnail: ${thumbnailResponse.status}`);
              const thumbnailUrl = await thumbnailResponse.text();
              return { ...certificate, thumbnail_url: thumbnailUrl };
            } catch (error) {
              console.error(`Failed to fetch thumbnail for certificate ${certificate.id}:`, error);
              return { ...certificate, thumbnail_url: '/assets/pdf-placeholder.png' };
            }
          })
        );

        setCertificates(certificatesWithThumbnails);
      } catch (error) {
        console.error('Error fetching certificates:', error);
      } finally {
        setIsCertificatesLoading(false);
      }
    }
    fetchCertificates();
  }, [token]);

  const handleCertificateClick = (certificate) => {
    setSelectedCertificate(certificate);
    setShowCertificateModal(true);
  };

  const handleCertificateModalClose = () => {
    setShowCertificateModal(false);
    setSelectedCertificate(null);
  };

  // Determine if the certificate is a PDF or image
  const isPdf = (url) => url && url.toLowerCase().endsWith('.pdf');
  const isImage = (url) => url && /\.(jpg|jpeg|png)$/i.test(url.toLowerCase());

  const getFileExtension = (url) => {
    if (isPdf(url)) return 'PDF';
    if (isImage(url)) return url.split('.').pop().toUpperCase();
    return 'Unknown';
  };

  // Get display URL for images (use thumbnail for PDFs)
  const getDisplayUrl = (certificate) => {
    if (!certificate.certificate_url) {
      console.warn(`No certificate URL for certificate ${certificate.id}`);
      return '/assets/pdf-placeholder.png';
    }
    if (isPdf(certificate.certificate_url)) {
      return certificate.thumbnail_url || '/assets/pdf-placeholder.png';
    }
    const url = certificate.certificate_url.startsWith("http")
      ? certificate.certificate_url
      : `${backendBaseUrl}${certificate.certificate_url}`;
    console.log(`Image URL for certificate ${certificate.id}: ${url}`);
    return url;
  };

  if (isLoading) {
    return <Loading message="Loading Certificates..." />;
  }

  if (!user) {
    console.log('No user data, redirecting to login');
    return null;
  }

  return (
    <Layout user={user}>
      <div className="v-ecertificates-page">
        <div className="v-ecertificates-header">
          <h1>My E-Certificates</h1>
        </div>

        {isCertificatesLoading ? (
          <Loading message="Loading Certificates..." />
        ) : certificates.length === 0 ? (
          <p className="v-no-certificates-message">No e-Certificates found.</p>
        ) : (
          <div className="v-ecertificates-grid">
            {certificates.map((certificate) => (
              <div
                key={certificate.id}
                className="v-ecertificate-card"
                onClick={() => handleCertificateClick(certificate)}
              >
                <div className="v-ecertificate-image-wrapper">
                  <img
                    src={getDisplayUrl(certificate)}
                    alt={certificate.event_title || 'Untitled Certificate'}
                    className="v-ecertificate-image"
                  />
                  {(isPdf(certificate.certificate_url) || isImage(certificate.certificate_url)) && (
                    <div className="v-file-indicator">
                      <i className={isPdf(certificate.certificate_url) ? 'fas fa-file-pdf' : 'fas fa-image'}></i>
                      <span>{getFileExtension(certificate.certificate_url)}</span>
                    </div>
                  )}
                  <div className="v-image-overlay"></div>
                </div>
                <div className="v-ecertificate-content">
                  <h3 className="v-ecertificate-title">
                    {certificate.event_title || 'Untitled Certificate'}
                  </h3>
                  <div className="v-ecertificate-info">
                    <div className="v-ecertificate-info-item">
                      <i className="fas fa-calendar-alt v-e-certificate-icon"></i>
                      <span>
                        {certificate.issued_date
                          ? new Date(certificate.issued_date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })
                          : 'Unknown Date'}
                      </span>
                    </div>
                  </div>
                  <button className="v-view-details-btn">
                    <span>VIEW DETAILS</span>
                    <i className="fas fa-arrow-right"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <ECertificateModal
          show={showCertificateModal}
          certificate={selectedCertificate}
          onClose={handleCertificateModalClose}
        />
      </div>
    </Layout>
  );
};

export default ECertificatesPage;