import axios from 'axios';

const backendBaseUrl = 'https://specs-nexus.onrender.com';

const API_URL =
  process.env.REACT_APP_API_URL ||
  (typeof window !== 'undefined' && window.location && window.location.hostname === 'localhost'
    ? 'http://localhost:8000'
    : backendBaseUrl);

const apiClient = axios.create({
  baseURL: API_URL,
});

apiClient.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

export async function getMembership(userId, token) {
  const response = await apiClient.get(`/membership/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

export async function getMemberships(userId, token) {
  const response = await apiClient.get(`/membership/memberships/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

export async function getQRCode(paymentOption, token) {
  const response = await apiClient.get(`/membership/qrcode?payment_type=${paymentOption}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  let url = response.data.qr_code_url || "";
  if (url.includes("/app/static")) {
    url = url.replace("/app/static", "/static");
  }
  return { qr_code_url: url };
}

export async function uploadReceiptFile(file, token) {
  const formData = new FormData();
  formData.append("file", file);
  const response = await apiClient.post(`/membership/upload_receipt_file`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
}

export async function updateMembershipReceipt(data, token) {
  const response = await apiClient.put(`/membership/update_receipt`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

// Add this function to your membershipService.js

export async function getMembershipReceipt(membershipId, token) {
  const response = await apiClient.get(`/membership/receipt/${membershipId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}