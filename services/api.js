import { API_BASE_URL, API_ROOT_URL } from '../config';
import { safeStorage } from './storage';

const TOKEN_STORAGE_KEY = '@heno_motita_token';
const USER_STORAGE_KEY = '@heno_motita_user';

// Get current auth token from storage
export const getStoredToken = async () => {
  try {
    return await safeStorage.getItem(TOKEN_STORAGE_KEY);
  } catch (error) {
    console.error('Error reading auth token:', error);
    return null;
  }
};

// Save auth token to storage
export const setStoredToken = async (token) => {
  try {
    if (token) {
      await safeStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      await safeStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  } catch (error) {
    console.error('Error storing auth token:', error);
  }
};

// Get stored user details
export const getStoredUser = async () => {
  try {
    const json = await safeStorage.getItem(USER_STORAGE_KEY);
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
      await safeStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } else {
      await safeStorage.removeItem(USER_STORAGE_KEY);
    }
  } catch (error) {
    console.error('Error storing user state:', error);
  }
};

// Helper for making API HTTP requests with 15s timeout and Gin error handling
async function request(endpoint, options = {}) {
  const token = await getStoredToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

  const config = {
    ...options,
    headers,
    signal: controller.signal,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    clearTimeout(timeoutId);

    const data = await response.json().catch(() => ({}));

// User-friendly error message sanitizer to ensure no technical terms, HTTP codes, or DB details leak to the UI
function sanitizeErrorMessage(rawMessage, status) {
  const msg = (typeof rawMessage === 'string' ? rawMessage : '').toLowerCase();
  
  if (status === 401 || msg.includes('unauthorized') || msg.includes('token') || msg.includes('jwt')) {
    return 'Tu sesión o credenciales no son válidas. Por favor inicia sesión nuevamente.';
  }
  if (status === 403 || msg.includes('forbidden') || msg.includes('permis')) {
    return 'No tienes permisos para realizar esta acción.';
  }
  if (status === 404 || msg.includes('not found')) {
    return 'La información solicitada no estuvo disponible.';
  }
  if (status === 408 || msg.includes('timeout') || msg.includes('abort')) {
    return 'Tiempo de espera agotado. Por favor verifica tu conexión a internet e intentalo de nuevo.';
  }
  if (status >= 500 || msg.includes('gin') || msg.includes('gorm') || msg.includes('sql') || msg.includes('database') || msg.includes('render') || msg.includes('server')) {
    return 'El servicio no se encuentra disponible temporalmente. Intenta nuevamente en unos momentos.';
  }
  
  if (typeof rawMessage === 'string' && rawMessage.trim() && !msg.includes('http') && !msg.includes('render') && !msg.includes('github') && !msg.includes('api')) {
    return rawMessage;
  }

  return 'Ocurrió un inconveniente al procesar la solicitud. Por favor intenta de nuevo.';
}

    if (response.status === 401) {
      // Auto cleanup expired session
      await setStoredToken(null);
      await setStoredUser(null);
    }

    if (!response.ok) {
      const rawMsg = data?.error || data?.message || data?.details || data?.msg || '';
      const cleanMessage = sanitizeErrorMessage(rawMsg, response.status);
      const error = new Error(cleanMessage);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      const timeoutError = new Error('Tiempo de espera agotado. Por favor verifica tu conexión a internet.');
      timeoutError.status = 408;
      throw timeoutError;
    }
    if (!err.status) {
      err.status = 0; // Network connection failure
      err.message = 'No se pudo conectar a la red. Verifica tu conexión a internet e intentalo nuevamente.';
    } else {
      err.message = sanitizeErrorMessage(err.message, err.status);
    }
    throw err;
  }
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

  const token = response.accessToken || response.token || response.access_token || response?.data?.token;
  const user = response.user || response?.data?.user || response;

  if (token) {
    await setStoredToken(token);
  }
  if (user && user !== response) {
    await setStoredUser(user);
  } else if (response.user) {
    await setStoredUser(response.user);
  }

  return { ...response, accessToken: token, user: user || response.user };
};

export const activateStudent = async (data) => {
  const payload = {
    ...data,
    activation_code: data.activationCode || data.activation_code,
    student_name: data.name || data.student_name,
    enrollment_code: data.enrollment || data.enrollment_code,
  };
  return await request('/auth/activate', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

// Manager & Crew Endpoints
export const getManagerDashboard = async () => {
  return await request('/manager/dashboard');
};

export const getCurrentCrews = async () => {
  try {
    return await request('/manager/current-crews');
  } catch (err) {
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
  const payload = {
    ...treeData,
    code: treeData.code,
    commonName: treeData.commonName || treeData.common_name,
    common_name: treeData.commonName || treeData.common_name,
    scientificName: treeData.scientificName || treeData.scientific_name,
    scientific_name: treeData.scientificName || treeData.scientific_name,
    latitude: treeData.latitude,
    longitude: treeData.longitude,
    locationDescription: treeData.locationDescription || treeData.location_description,
    location_description: treeData.locationDescription || treeData.location_description,
  };

  return await request(`/crews/${crewId}/trees`, {
    method: 'POST',
    body: JSON.stringify(payload),
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
  const payload = {
    ...obsData,
    lowerThirdScore: obsData.lowerThirdScore ?? obsData.lower_third_score ?? 0,
    lower_third_score: obsData.lowerThirdScore ?? obsData.lower_third_score ?? 0,
    middleThirdScore: obsData.middleThirdScore ?? obsData.middle_third_score ?? 0,
    middle_third_score: obsData.middleThirdScore ?? obsData.middle_third_score ?? 0,
    upperThirdScore: obsData.upperThirdScore ?? obsData.upper_third_score ?? 0,
    upper_third_score: obsData.upperThirdScore ?? obsData.upper_third_score ?? 0,
    notes: obsData.notes || '',
    observationDate: obsData.observationDate || obsData.observation_date || new Date().toISOString(),
    observation_date: obsData.observationDate || obsData.observation_date || new Date().toISOString(),
    latitude: obsData.latitude,
    longitude: obsData.longitude,
  };

  return await request(`/trees/${treeId}/observations`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const getObservationById = async (observationId) => {
  return await request(`/observations/${observationId}`);
};

// Image Upload Endpoint (Multipart Form Data with 'image' and 'file' field keys)
export const uploadObservationImage = async (observationId, imageUri, description = '') => {
  if (!imageUri) return null;

  const token = await getStoredToken();
  const formData = new FormData();

  const filename = imageUri.split('/').pop() || 'photo.jpg';
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1].toLowerCase() === 'jpg' ? 'jpeg' : match[1].toLowerCase()}` : 'image/jpeg';

  const filePayload = {
    uri: imageUri,
    name: filename,
    type,
  };

  formData.append('image', filePayload);
  formData.append('file', filePayload);

  if (description) {
    formData.append('description', description);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000);

  try {
    const response = await fetch(`${API_BASE_URL}/observations/${observationId}/images`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMessage = data?.error || data?.message || `Error al subir imagen (${response.status})`;
      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
};

export const getObservationImages = async (observationId) => {
  return await request(`/observations/${observationId}/images`);
};
