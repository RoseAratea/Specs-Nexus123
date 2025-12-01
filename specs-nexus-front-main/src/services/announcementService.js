import axios from 'axios';
const backendBaseUrl = 'https://specs-nexus.onrender.com';

const API_URL =
  process.env.REACT_APP_API_URL ||
  (typeof window !== 'undefined' && window.location && window.location.hostname === 'localhost'
    ? 'http://localhost:8000'
    : backendBaseUrl);

export async function getAnnouncements(token) {
  const response = await axios.get(`${API_URL}/announcements/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}
