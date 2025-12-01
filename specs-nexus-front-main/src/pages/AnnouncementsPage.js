import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile } from '../services/userService';
import { getAnnouncements } from '../services/announcementService';
import AnnouncementCard from '../components/AnnouncementCard';
import AnnouncementModal from '../components/AnnouncementModal';
import Layout from '../components/Layout';
import Loading from '../components/Loading';
import '../styles/AnnouncementsPage.css';

const AnnouncementsPage = () => {
  const [user, setUser] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnnouncementsLoading, setIsAnnouncementsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
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

  useEffect(() => {
    if (!token) return; // Skip if no token

    async function fetchUserProfile() {
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
    fetchUserProfile();
  }, [token, navigate]);

  useEffect(() => {
    if (!token) return; // Skip if no token

    async function fetchAnnouncements() {
      try {
        setIsAnnouncementsLoading(true);
        const announcementsData = await getAnnouncements(token);
        setAnnouncements(announcementsData);
      } catch (error) {
        console.error('Failed to fetch announcements:', error);
      } finally {
        setIsAnnouncementsLoading(false);
      }
    }
    fetchAnnouncements();
  }, [token]);

  const handleCardClick = (announcement) => {
    setSelectedAnnouncement(announcement);
  };

  const closeModal = () => {
    setSelectedAnnouncement(null);
  };

  const filterAnnouncements = () => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    if (filter === 'recent') {
      return announcements.filter(
        (a) => a.date && new Date(a.date) >= thirtyDaysAgo
      );
    } else if (filter === 'featured') {
      return announcements.filter((a) => a.featured === true);
    }
    return announcements;
  };

  const filteredAnnouncements = filterAnnouncements();

  if (isLoading) {
    return <Loading message="Loading Announcements..." />;
  }

  if (!user) {
    console.log('No user data, redirecting to login');
    return null;
  }

  return (
    <Layout user={user}>
      <div className="announcements-page">
        <div className="announcements-header">
          <h1>SPECS Announcements</h1>
          <div className="announcements-filters">
            <button
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button
              className={`filter-btn ${filter === 'recent' ? 'active' : ''}`}
              onClick={() => setFilter('recent')}
            >
              Recent
            </button>
            <button
              className={`filter-btn ${filter === 'featured' ? 'active' : ''}`}
              onClick={() => setFilter('featured')}
            >
              Featured
            </button>
          </div>
        </div>

        <div className="announcements-section">
          {isAnnouncementsLoading ? (
            <Loading message="Loading Announcements.." />
          ) : filteredAnnouncements.length > 0 ? (
            <div className="announcements-grid">
              {filteredAnnouncements.map((announcement) => (
                <AnnouncementCard
                  key={announcement.id}
                  announcement={announcement}
                  onClick={handleCardClick}
                />
              ))}
            </div>
          ) : (
            <div className="no-announcements-message">
              <i className="fas fa-bullhorn"></i>
              <p>No announcements found for the selected filter.</p>
            </div>
          )}
        </div>

        {selectedAnnouncement && (
          <AnnouncementModal
            announcement={selectedAnnouncement}
            onClose={closeModal}
          />
        )}
      </div>
    </Layout>
  );
};

export default AnnouncementsPage;