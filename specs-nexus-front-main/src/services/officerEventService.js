const backendBaseUrl = 'https://specs-nexus.onrender.com';

const API_URL =
  process.env.REACT_APP_API_URL ||
  (typeof window !== 'undefined' && window.location && window.location.hostname === 'localhost'
    ? 'http://localhost:8000'
    : backendBaseUrl);

export const getOfficerEvents = async (token, archived = false) => {
  if (!token) {
    throw new Error('Missing authentication token');
  }

  try {
    console.log(`Fetching events with token: ${token.substring(0, 10)}...`);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    const response = await fetch(`${API_URL}/events/officer/list?archived=${archived}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Server response:', errorData);
      throw new Error(`HTTP error! status: ${response.status}, detail: ${errorData.detail || 'Unknown'}`);
    }

    const data = await response.json();
    console.log('Events fetched successfully:', data);
    return data;
  } catch (error) {
    console.error('Error fetching officer events:', error.message);
    if (error.name === 'AbortError') {
      throw new Error('Request timeout: The server took too long to respond. Please try again.');
    }
    throw error;
  }
};

export const createOfficerEvent = async (formData, token) => {
  if (!token) {
    throw new Error('Missing authentication token');
  }

  try {
    console.log('Creating event with token:', token.substring(0, 10) + '...');
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    const response = await fetch(`${API_URL}/events/officer/create`, {
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
      console.error('Server response:', errorData);
      throw new Error(`HTTP error! status: ${response.status}, detail: ${errorData.detail || 'Unknown'}`);
    }

    const data = await response.json();
    console.log('Event created successfully:', data);
    return data;
  } catch (error) {
    console.error('Error creating event:', error.message);
    throw error;
  }
};

export const updateOfficerEvent = async (eventId, formData, token) => {
  if (!token) {
    throw new Error('Missing authentication token');
  }

  try {
    console.log(`Updating event ${eventId} with token: ${token.substring(0, 10)}...`);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    const response = await fetch(`${API_URL}/events/officer/update/${eventId}`, {
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
      console.error('Server response:', errorData);
      throw new Error(`HTTP error! status: ${response.status}, detail: ${errorData.detail || 'Unknown'}`);
    }

    const data = await response.json();
    console.log('Event updated successfully:', data);
    return data;
  } catch (error) {
    console.error('Error updating event:', error.message);
    throw error;
  }
};

export const deleteOfficerEvent = async (eventId, token) => {
  if (!token) {
    throw new Error('Missing authentication token');
  }

  try {
    console.log(`Deleting event ${eventId} with token: ${token.substring(0, 10)}...`);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    const response = await fetch(`${API_URL}/events/officer/delete/${eventId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Server response:', errorData);
      throw new Error(`HTTP error! status: ${response.status}, detail: ${errorData.detail || 'Unknown'}`);
    }

    const data = await response.json();
    console.log('Event deleted successfully:', data);
    return data;
  } catch (error) {
    console.error('Error deleting event:', error.message);
    throw error;
  }
};

export const declineOfficerEvent = async (eventId, reason, token) => {
  if (!token) {
    throw new Error('Missing authentication token');
  }

  try {
    console.log(`Declining event ${eventId} with reason: ${reason}`);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    const formData = new FormData();
    formData.append('reason', reason);
    
    const response = await fetch(`${API_URL}/events/${eventId}/decline`, {
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
      console.error('Server response:', errorData);
      throw new Error(`HTTP error! status: ${response.status}, detail: ${errorData.detail || 'Unknown'}`);
    }

    const data = await response.json();
    console.log('Event declined successfully:', data);
    return data;
  } catch (error) {
    console.error('Error declining event:', error.message);
    throw error;
  }
};

export const approveOfficerEvent = async (eventId, token) => {
  if (!token) {
    throw new Error('Missing authentication token');
  }

  try {
    console.log(`Approving event ${eventId}`);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    const response = await fetch(`${API_URL}/events/${eventId}/approve`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Server response:', errorData);
      throw new Error(`HTTP error! status: ${response.status}, detail: ${errorData.detail || 'Unknown'}`);
    }

    const data = await response.json();
    console.log('Event approved successfully:', data);
    return data;
  } catch (error) {
    console.error('Error approving event:', error.message);
    throw error;
  }
};