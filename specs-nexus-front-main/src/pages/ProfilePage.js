import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { getProfile, updateProfile } from '../services/userService';
import ProfileCard from '../components/ProfileCard';
import StatusModal from '../components/StatusModal';
import Loading from '../components/Loading';
import '../styles/ProfilePage.css';

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: 'success',
    title: '',
    message: ''
  });
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

  const handleUpdateProfile = async (updatedData) => {
    try {
      const updatedUser = await updateProfile(token, updatedData);
      setUser(updatedUser);
      setModalState({
        isOpen: true,
        type: 'success',
        title: 'Profile Updated',
        message: 'Your profile has been successfully updated.'
      });
    } catch (error) {
      console.error('Failed to update user profile:', error);
      setModalState({
        isOpen: true,
        type: 'error',
        title: 'Profile Update Failed',
        message: 'Failed to update profile. Please try again.'
      });
    }
  };

  const closeModal = () => {
    setModalState({ ...modalState, isOpen: false });
  };

  if (isLoading) {
    return <Loading message="Loading Profile..." />;
  }

  if (!user) {
    console.log('No user data, redirecting to login');
    return null;
  }

  return (
    <Layout user={user}>
      <div className="profile-section">
        <ProfileCard user={user} onUpdate={handleUpdateProfile} />
        <StatusModal
          isOpen={modalState.isOpen}
          onClose={closeModal}
          type={modalState.type}
          title={modalState.title}
          message={modalState.message}
        />
      </div>
    </Layout>
  );
};

export default ProfilePage;