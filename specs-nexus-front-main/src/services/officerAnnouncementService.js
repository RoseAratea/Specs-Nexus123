import axios from 'axios';

const backendBaseUrl = 'https://specs-nexus.onrender.com';

const API_URL =
  process.env.REACT_APP_API_URL ||
  (typeof window !== 'undefined' && window.location && window.location.hostname === 'localhost'
    ? 'http://localhost:8000'
    : backendBaseUrl);

export const getOfficerAnnouncements = async (token, showArchived = false) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    const response = await fetch(`${API_URL}/announcements/officer/list?archived=${showArchived}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`HTTP error! Status: ${response.status}, detail: ${errorData.detail || 'Unknown'}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching announcements:", error);
    if (error.name === 'AbortError') {
      throw new Error('Request timeout: The server took too long to respond. Please try again.');
    }
    throw error;
  }
};

export const createOfficerAnnouncement = async (formData, token) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    const response = await fetch(`${API_URL}/announcements/officer/create`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`HTTP error! Status: ${response.status}, detail: ${errorData.detail || 'Unknown'}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error creating announcement:", error);
    throw error;
  }
};

export const updateOfficerAnnouncement = async (announcementId, formData, token) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    const response = await fetch(`${API_URL}/announcements/officer/update/${announcementId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`HTTP error! Status: ${response.status}, detail: ${errorData.detail || 'Unknown'}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error updating announcement:", error);
    throw error;
  }
};

export const deleteOfficerAnnouncement = async (announcementId, token) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    const response = await fetch(`${API_URL}/announcements/officer/delete/${announcementId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`HTTP error! Status: ${response.status}, detail: ${errorData.detail || 'Unknown'}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error archiving announcement:", error);
    throw error;
  }
};