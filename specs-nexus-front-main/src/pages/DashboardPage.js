import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getClearance } from '../services/clearanceService';
import { getProfile } from '../services/userService';
import Layout from '../components/Layout';
import Loading from '../components/Loading';
import '../styles/DashboardPage.css';

const DashboardPage = () => {
  const [user, setUser] = useState(null);
  const [clearanceData, setClearanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('access_token'); // Changed to access_token
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchUserProfile() {
      try {
        setLoading(true);
        if (!token) {
          console.log('DashboardPage: No token, redirecting to /');
          navigate('/');
          return;
        }
        const userProfile = await getProfile(token);
        console.log('DashboardPage: Profile fetched:', userProfile);
        setUser(userProfile);
        
        if (userProfile && userProfile.id) {
          try {
            const data = await getClearance(userProfile.id, token);
            setClearanceData(data);
          } catch (err) {
            console.error('DashboardPage: Failed to fetch clearance:', err);
            // Optionally display clearance error to user
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error('DashboardPage: Failed to fetch user profile:', err);
        setLoading(false); // Ensure loading is set to false even on error
        localStorage.removeItem('access_token'); // Clear correct key
        localStorage.removeItem('user_id');
        navigate('/');
      }
    }
    
    fetchUserProfile();
  }, [token, navigate]);

  const renderContent = () => {
    if (loading) {
      return <Loading message="Loading dashboard data..." />;
    }

    if (!user) {
      console.log('DashboardPage: No user, redirecting to /');
      navigate('/');
      return null;
    }

    return (
      <>
        <div className="about-us-card">
          <h2>About Us</h2>
          <p>
            The Society of Programming Enthusiasts in Computer Science (SPECS) is one of the three
            recognized organizations under the College of Computer Studies and the only organization
            under the Computer Science course. We aim to promote the skills, knowledge, and
            camaraderie among CS Students of Gordon College and establish leadership among the
            SPECS Officers and CS Students.
          </p>
        </div>
        
        <div className="dashboard-grid">
          <div className="clearance-card">
            <h3>Clearance for 2024 - 2025</h3>
            {clearanceData.length > 0 ? (
              <table className="clearance-table">
                <thead>
                  <tr>
                    <th>Requirement</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {clearanceData.map((clearance) => (
                    <tr key={clearance.id}>
                      <td>{clearance.requirement}</td>
                      <td className={clearance.status === 'Cleared' ? 'status-cleared' : 'status-not-cleared'}>
                        {clearance.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No clearance records found.</p>
            )}
          </div>
          
          <div className="membership-cards">
            <h3>Membership Fee Status Description</h3>
            <table className="membership-table">
              <thead>
                <tr>
                  <th>Membership Fee Status</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Pending</td>
                  <td>You have not yet paid the membership fee. Please settle the payment to proceed with clearance.</td>
                </tr>
                <tr>
                  <td>Processing</td>
                  <td>Your payment is being verified. Please wait for confirmation.</td>
                </tr>
                <tr>
                  <td>Cleared</td>
                  <td>Your membership fee has been successfully paid and verified. You are cleared.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </>
    );
  };

  return (
    <Layout user={user}>
      <div className="dashboard-page">
        {renderContent()}
      </div>
    </Layout>
  );
};

export default DashboardPage;