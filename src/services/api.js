// src/services/api.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5005/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
      return Promise.reject(new Error('Session expired. Please login again.'));
    }
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error || 
                        error.message || 
                        'An error occurred';
    return Promise.reject(new Error(errorMessage));
  }
);

export default api;

// Fetch all users (superadmin only)
export async function fetchUsers() {
  const response = await api.get('/users');
  return response.data.users;
}

// Fetch all forms from the real backend
export async function fetchForms() {
  const response = await api.get('/forms');
  return response.data;
}

// Submit a form to the real backend
export async function submitForm(formData) {
  const response = await api.post('/forms', formData);
  return response.data;
}

// Fetch all admins (for assignment modal)
export async function fetchAdmins() {
  const response = await api.get('/admins');
  return response.data.admins || response.data;
}

// Fetch admin users for reassignment
export async function fetchAdminUsers() {
  const response = await api.get('/forms/admin-users');
  return response.data;
}

// Reassign form to different admin
export async function reassignForm(formId, assignedToId) {
  const response = await api.put(`/forms/${formId}/reassign`, { assignedToId });
  return response.data;
}

// Update existing form
export async function updateForm(formId, formData) {
  const response = await api.put(`/forms/${formId}`, formData);
  return response.data;
}

// Search clients by email
export async function searchClients(email) {
  const response = await api.get(`/clients/search?email=${encodeURIComponent(email)}`);
  return response.data.clients;
}

// Create new client
export async function createClient(clientData) {
  const response = await api.post('/clients', clientData);
  return response.data.client;
}

// Create new user (superadmin only)
export async function createUser(userData) {
  const response = await api.post('/users', userData);
  return response.data.user;
}

// Delete user (superadmin only)
export async function deleteUser(userId) {
  console.log('DEBUG: Attempting to delete user with ID:', userId);
  
  // Check if token exists
  const token = localStorage.getItem('token');
  console.log('DEBUG: Token exists:', !!token);
  if (token) {
    console.log('DEBUG: Token preview:', token.substring(0, 20) + '...');
  }
  
  try {
    console.log('DEBUG: Making DELETE request to:', `/users/${userId}`);
    const response = await api.delete(`/users/${userId}`);
    console.log('DEBUG: Delete response status:', response.status);
    console.log('DEBUG: Delete response data:', response.data);
    return response.data;
  } catch (error) {
    console.error('DEBUG: Delete error caught:', error);
    console.error('DEBUG: Error response data:', error.response?.data);
    console.error('DEBUG: Error status:', error.response?.status);
    console.error('DEBUG: Error message:', error.message);
    
    // Check if it's an authentication error
    if (error.response?.status === 401) {
      console.error('DEBUG: Authentication error - token might be expired');
    }
    
    throw error;
  }
}

// Update user (superadmin only)
export async function updateUser(userId, userData) {
  console.log('DEBUG: Attempting to update user with ID:', userId);
  console.log('DEBUG: User data to update:', userData);
  
  try {
    const response = await api.put(`/users/${userId}`, userData);
    console.log('DEBUG: Update response status:', response.status);
    console.log('DEBUG: Update response data:', response.data);
    return response.data.user;
  } catch (error) {
    console.error('DEBUG: Update error caught:', error);
    console.error('DEBUG: Error response data:', error.response?.data);
    console.error('DEBUG: Error status:', error.response?.status);
    console.error('DEBUG: Error message:', error.message);
    throw error;
  }
}

// Update current user profile
export async function updateProfile(profileData) {
  console.log('DEBUG: Attempting to update profile with data:', profileData);
  
  try {
    const response = await api.put('/users/profile', profileData);
    console.log('DEBUG: Profile update response status:', response.status);
    console.log('DEBUG: Profile update response data:', response.data);
    return response.data.user;
  } catch (error) {
    console.error('DEBUG: Profile update error caught:', error);
    console.error('DEBUG: Error response data:', error.response?.data);
    console.error('DEBUG: Error status:', error.response?.status);
    console.error('DEBUG: Error message:', error.message);
    throw error;
  }
}

// Get last closeout date for a client
export async function getLastCloseoutDate(clientId) {
  try {
    const response = await api.get(`/clients/${clientId}/last-closeout`);
    return response.data.lastCloseoutDate;
  } catch (error) {
    console.error('Error fetching last closeout date:', error);
    throw error;
  }
}

// Update form status (including amendment requests)
export const updateFormStatus = async (formId, status, comment, amendmentNote) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token');
    }

    const response = await axios.put(
      `${API_BASE_URL}/forms/${formId}/status`,
      {
        status,
        comment,
        amendmentNote
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error updating form status:', error);
    throw error;
  }
};