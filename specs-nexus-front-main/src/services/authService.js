import axios from 'axios';

const backendBaseUrl = 'https://specs-nexus.onrender.com';

const API_URL =
  process.env.REACT_APP_API_URL ||
  (typeof window !== 'undefined' && window.location && window.location.hostname === 'localhost'
    ? 'http://localhost:8000'
    : backendBaseUrl);

// Log API URL for debugging
if (typeof window !== 'undefined') {
  console.log('API URL:', API_URL);
}
export const login = async ({ emailOrStudentNumber, password }) => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, { 
      email_or_student_number: emailOrStudentNumber, 
      password 
    }, {
      timeout: 10000, // 10 second timeout
      headers: {
        'Content-Type': 'application/json',
      }
    });
    return response.data;
  } catch (error) {
    // Log the full error for debugging
    console.error('Login API error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      url: `${API_URL}/auth/login`
    });
    throw error;
  }
};