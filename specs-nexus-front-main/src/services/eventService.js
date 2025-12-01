import axios from 'axios';

const backendBaseUrl = 'https://specs-nexus.onrender.com';

const API_URL =
  process.env.REACT_APP_API_URL ||
  (typeof window !== 'undefined' && window.location && window.location.hostname === 'localhost'
    ? 'http://localhost:8000'
    : backendBaseUrl);

export async function getEvents(token) {
  try {
    const response = await axios.get(`${API_URL}/events/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching events:', error.response ? error.response.data : error.message);
    throw error;
  }
}

export async function getEvent(eventId, token) {
  try {
    const response = await axios.get(`${API_URL}/events/${eventId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching event ${eventId}:`, error.response ? error.response.data : error.message);
    throw error;
  }
}

export async function joinEvent(eventId, token) {
  try {
    const response = await axios.post(`${API_URL}/events/join/${eventId}`, {}, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error joining event ${eventId}:`, error.response ? error.response.data : error.message);
    throw error;
  }
}

export async function leaveEvent(eventId, token) {
  try {
    const response = await axios.post(`${API_URL}/events/leave/${eventId}`, {}, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error leaving event ${eventId}:`, error.response ? error.response.data : error.message);
    throw error;
  }
}