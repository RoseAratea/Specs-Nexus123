import axios from 'axios';

const backendBaseUrl = 'https://specs-nexus.onrender.com';

const API_URL =
  process.env.REACT_APP_API_URL ||
  (typeof window !== 'undefined' && window.location && window.location.hostname === 'localhost'
    ? 'http://localhost:8000'
    : backendBaseUrl);

export async function officerLogin(credentials) {
  const response = await axios.post(`${API_URL}/officers/login`, credentials);
  return response.data;
}
