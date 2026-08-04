import { API_BASE_URL, API_ROOT_URL } from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_STORAGE_KEY = '@heno_motita_token';
const USER_STORAGE_KEY = '@heno_motita_user';

// Get current auth token from storage
export const getStoredToken = async () => {
  try {
    return await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
  } catch (error) {
    console.error('Error reading auth token:', error);
    return null;
  }
};

// Save auth token to storage
export const setStoredToken = async (token) => {
  try {
    if (token) {
      await AsyncStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  } catch (error) {
    console.error('Error storing auth token:', error);
  }
};

// Get stored user details
export const getStoredUser = async () => {
  try {
    const json = await AsyncStorage.getItem(USER_STORAGE_KEY);
    return json ? JSON.parse(json) : null;
  } catch (error) {
    console.error('Error reading user state:', error);
    return null;
  }
};

// Save user details to storage
export const setStoredUser = async (user) => {
  try {
    if (user) {
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } else {
      await AsyncStorage.removeItem(USER_STORAGE_KEY);
    }
  } catch (error) {
    console.error('Error storing user state:', error);
  }
};

// Helper for making API HTTP requests
async function request(endpoint, options = {}) {
  const token = await getStoredToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMessage = data?.message || data?.details || `Error del servidor (${response.status})`;
    const error = new Error(errorMessage);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

// Health check
export const checkHealth = async () => {
  try {
    const res = await fetch(`${API_ROOT_URL}/health`);
    return await res.json();
  } catch (err) {
    return { status: 'error', message: err.message };
  }
};

// Authentication Endpoints
export const login = async (email, password) => {
  const response = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  if (response.accessToken) {
    await setStoredToken(response.accessToken);
  }
  if (response.user) {
    await setStoredUser(response.user);
  }

  return response;
};

export const activateStudent = async (data) => {
  return await request('/auth/activate', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

// Manager & Crew Endpoints
export const getManagerDashboard = async () => {
  return await request('/manager/dashboard');
};

export const getCurrentCrews = async () => {
  try {
    // Try manager endpoint first
    return await request('/manager/current-crews');
  } catch (err) {
    // Fallback to general crews endpoint
    return await request('/crews');
  }
};

export const getAllCrews = async () => {
  return await request('/crews');
};

// Tree Endpoints
export const getTreesByCrew = async (crewId) => {
  return await request(`/crews/${crewId}/trees`);
};

export const createTree = async (crewId, treeData) => {
  // treeData: { code, commonName, scientificName, latitude, longitude, locationDescription }
  return await request(`/crews/${crewId}/trees`, {
    method: 'POST',
    body: JSON.stringify(treeData),
  });
};

export const getTreeById = async (treeId) => {
  return await request(`/trees/${treeId}`);
};

// Observation Endpoints
export const getObservationsByTree = async (treeId) => {
  return await request(`/trees/${treeId}/observations`);
};

export const createObservation = async (treeId, obsData) => {
  // obsData: { lowerThirdScore, middleThirdScore, upperThirdScore, notes, observationDate, latitude, longitude }
  return await request(`/trees/${treeId}/observations`, {
    method: 'POST',
    body: JSON.stringify(obsData),
  });
};

export const getObservationById = async (observationId) => {
  return await request(`/observations/${observationId}`);
};

// Image Upload Endpoint (Multipart Form Data)
export const uploadObservationImage = async (observationId, imageUri, description = '') => {
  const token = await getStoredToken();
  const formData = new FormData();

  const filename = imageUri.split('/').pop() || 'photo.jpg';
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1].toLowerCase() === 'jpg' ? 'jpeg' : match[1].toLowerCase()}` : 'image/jpeg';

  formData.append('image', {
    uri: imageUri,
    name: filename,
    type,
  });

  if (description) {
    formData.append('description', description);
  }

  const response = await fetch(`${API_BASE_URL}/observations/${observationId}/images`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      // Note: Do NOT set Content-Type header manually when using FormData in React Native
    },
    body: formData,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMessage = data?.message || `Error al subir imagen (${response.status})`;
    const error = new Error(errorMessage);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
};

export const getObservationImages = async (observationId) => {
  return await request(`/observations/${observationId}/images`);
};
