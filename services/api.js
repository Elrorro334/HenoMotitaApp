import { API_BASE_URL, API_ROOT_URL } from '../config';
import { safeStorage } from './storage';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const TOKEN_STORAGE_KEY = '@heno_motita_token';
const USER_STORAGE_KEY  = '@heno_motita_user';

/** Timeout for regular API requests (ms) */
const REQUEST_TIMEOUT_MS = 15_000;
/** Timeout for image upload requests (ms) */
const UPLOAD_TIMEOUT_MS  = 30_000;

// ---------------------------------------------------------------------------
// Session-invalidation callback (set by AuthContext on mount)
// ---------------------------------------------------------------------------
let _onUnauthorized = null;

/**
 * Register a callback to be fired when the API returns 401.
 * AuthContext calls this so it can force-logout immediately.
 * @param {() => void} fn
 */
export const registerUnauthorizedHandler = (fn) => {
  _onUnauthorized = typeof fn === 'function' ? fn : null;
};

// ---------------------------------------------------------------------------
// Secure Token / User Storage
// ---------------------------------------------------------------------------

/**
 * Get current auth token from secure storage.
 * @returns {Promise<string|null>}
 */
export const getStoredToken = async () => {
  try {
    return await safeStorage.getItem(TOKEN_STORAGE_KEY);
  } catch (error) {
    if (__DEV__) console.error('[api] Error reading auth token:', error);
    return null;
  }
};

/**
 * Persist auth token to secure storage, or delete it when `null`.
 * @param {string|null} token
 */
export const setStoredToken = async (token) => {
  try {
    if (token) {
      await safeStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      await safeStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  } catch (error) {
    if (__DEV__) console.error('[api] Error storing auth token:', error);
  }
};

/**
 * Get stored user object.
 * @returns {Promise<object|null>}
 */
export const getStoredUser = async () => {
  try {
    const json = await safeStorage.getItem(USER_STORAGE_KEY);
    return json ? JSON.parse(json) : null;
  } catch (error) {
    if (__DEV__) console.error('[api] Error reading user state:', error);
    return null;
  }
};

/**
 * Persist user object to storage, or delete it when `null`.
 * @param {object|null} user
 */
export const setStoredUser = async (user) => {
  try {
    if (user) {
      await safeStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } else {
      await safeStorage.removeItem(USER_STORAGE_KEY);
    }
  } catch (error) {
    if (__DEV__) console.error('[api] Error storing user state:', error);
  }
};

// ---------------------------------------------------------------------------
// Error Sanitization
// ---------------------------------------------------------------------------
/**
 * Convert a raw server/network error into a safe, user-friendly Spanish message.
 * Ensures no HTTP codes, SQL details, internal stack traces, or framework names
 * are ever surfaced to the end user.
 *
 * @param {string|unknown} rawMessage
 * @param {number}         status  – HTTP status code (0 = no connection)
 * @returns {string}
 */
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
    return 'Tiempo de espera agotado. Por favor verifica tu conexión a internet e inténtalo de nuevo.';
  }
  if (
    status >= 500 ||
    msg.includes('gin') || msg.includes('gorm') || msg.includes('sql') ||
    msg.includes('database') || msg.includes('render') || msg.includes('server')
  ) {
    return 'El servicio no se encuentra disponible temporalmente. Intenta nuevamente en unos momentos.';
  }

  // Allow clean, non-technical messages from the server to pass through
  const BLOCKED_TERMS = ['http', 'render', 'github', 'api', 'stack', 'trace', 'error:'];
  if (
    typeof rawMessage === 'string' &&
    rawMessage.trim() &&
    !BLOCKED_TERMS.some((t) => msg.includes(t))
  ) {
    return rawMessage;
  }

  return 'Ocurrió un inconveniente al procesar la solicitud. Por favor intenta de nuevo.';
}

// ---------------------------------------------------------------------------
// Core HTTP Helper
// ---------------------------------------------------------------------------
/**
 * Make an authenticated JSON API request.
 *
 * @param {string} endpoint  – Path relative to API_BASE_URL (e.g. '/auth/login')
 * @param {RequestInit} [options]
 * @param {number} [timeoutMs]
 * @returns {Promise<any>}
 */
async function request(endpoint, options = {}, timeoutMs = REQUEST_TIMEOUT_MS) {
  const token = await getStoredToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timeoutId  = setTimeout(() => controller.abort(), timeoutMs);

  const config = {
    ...options,
    headers,
    signal: controller.signal,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    clearTimeout(timeoutId);

    const data = await response.json().catch(() => ({}));

    if (response.status === 401) {
      // Clear stored credentials immediately
      await setStoredToken(null);
      await setStoredUser(null);
      // Notify AuthContext so it can navigate to Login
      if (_onUnauthorized) {
        _onUnauthorized();
      }
    }

    if (!response.ok) {
      const rawMsg     = data?.error || data?.message || data?.details || data?.msg || '';
      const cleanMsg   = sanitizeErrorMessage(rawMsg, response.status);
      const error      = new Error(cleanMsg);
      error.status     = response.status;
      error.data       = data;
      throw error;
    }

    return data;

  } catch (err) {
    clearTimeout(timeoutId);

    if (err.name === 'AbortError') {
      const timeoutError = new Error(
        'Tiempo de espera agotado. Por favor verifica tu conexión a internet.'
      );
      timeoutError.status = 408;
      throw timeoutError;
    }

    if (!err.status) {
      // Network-level failure (no response received)
      err.status  = 0;
      err.message = 'No se pudo conectar a la red. Verifica tu conexión a internet e inténtalo nuevamente.';
    } else {
      err.message = sanitizeErrorMessage(err.message, err.status);
    }

    throw err;
  }
}

// ---------------------------------------------------------------------------
// Health Check
// ---------------------------------------------------------------------------
/**
 * Ping the API root health endpoint.
 * @returns {Promise<{status: string, message?: string}>}
 */
export const checkHealth = async () => {
  try {
    const controller = new AbortController();
    const timeoutId  = setTimeout(() => controller.abort(), 10_000);
    const res        = await fetch(`${API_ROOT_URL}/health`, { signal: controller.signal });
    clearTimeout(timeoutId);
    return await res.json();
  } catch (err) {
    return { status: 'error', message: 'No se pudo verificar el estado del servidor.' };
  }
};

// ---------------------------------------------------------------------------
// Authentication Endpoints
// ---------------------------------------------------------------------------
/**
 * Authenticate with email + password and persist the session locally.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{accessToken: string, user: object}>}
 */
export const login = async (email, password) => {
  // Normalize email only — passwords must NEVER be modified
  const sanitizedEmail = String(email).trim().toLowerCase().substring(0, 254);

  const response = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: sanitizedEmail, password: String(password) }),
  });

  const token = response.accessToken || response.token || response.access_token || response?.data?.token;
  const user  = response.user || response?.data?.user || response;

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

/**
 * Activate a student account.
 * @param {object} data
 */
export const activateStudent = async (data) => {
  const payload = {
    ...data,
    activation_code:  data.activationCode  || data.activation_code,
    student_name:     data.name            || data.student_name,
    enrollment_code:  data.enrollment      || data.enrollment_code,
  };
  return await request('/auth/activate', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

// ---------------------------------------------------------------------------
// Manager & Crew Endpoints
// ---------------------------------------------------------------------------

/** Fetch the manager's dashboard summary. */
export const getManagerDashboard = async () => request('/manager/dashboard');

/**
 * Get current active crews (falls back to /crews if manager endpoint fails).
 */
export const getCurrentCrews = async () => {
  try {
    return await request('/manager/current-crews');
  } catch (err) {
    return await request('/crews');
  }
};

/** Get all available crews. */
export const getAllCrews = async () => request('/crews');

// ---------------------------------------------------------------------------
// Tree Endpoints
// ---------------------------------------------------------------------------

/** Get all trees for a crew. */
export const getTreesByCrew = async (crewId) => request(`/crews/${crewId}/trees`);

/**
 * Create a new tree under a crew.
 * @param {string|number} crewId
 * @param {object} treeData
 */
export const createTree = async (crewId, treeData) => {
  const payload = {
    ...treeData,
    code:                 treeData.code,
    commonName:           treeData.commonName    || treeData.common_name,
    common_name:          treeData.commonName    || treeData.common_name,
    scientificName:       treeData.scientificName || treeData.scientific_name,
    scientific_name:      treeData.scientificName || treeData.scientific_name,
    latitude:             treeData.latitude,
    longitude:            treeData.longitude,
    locationDescription:  treeData.locationDescription || treeData.location_description,
    location_description: treeData.locationDescription || treeData.location_description,
  };

  return await request(`/crews/${crewId}/trees`, {
    method: 'POST',
    body:   JSON.stringify(payload),
  });
};

/** Get a single tree by its ID. */
export const getTreeById = async (treeId) => request(`/trees/${treeId}`);

// ---------------------------------------------------------------------------
// Observation Endpoints
// ---------------------------------------------------------------------------

/** Get all observations for a tree. */
export const getObservationsByTree = async (treeId) => request(`/trees/${treeId}/observations`);

/**
 * Create an observation for a tree.
 * @param {string|number} treeId
 * @param {object} obsData
 */
export const createObservation = async (treeId, obsData) => {
  // Clamp each third score to valid Hawksworth range [0, 2]
  const clamp = (v, min, max) => Math.min(max, Math.max(min, Number(v) || 0));

  const payload = {
    ...obsData,
    lowerThirdScore:       clamp(obsData.lowerThirdScore  ?? obsData.lower_third_score,  0, 2),
    lower_third_score:     clamp(obsData.lowerThirdScore  ?? obsData.lower_third_score,  0, 2),
    middleThirdScore:      clamp(obsData.middleThirdScore ?? obsData.middle_third_score, 0, 2),
    middle_third_score:    clamp(obsData.middleThirdScore ?? obsData.middle_third_score, 0, 2),
    upperThirdScore:       clamp(obsData.upperThirdScore  ?? obsData.upper_third_score,  0, 2),
    upper_third_score:     clamp(obsData.upperThirdScore  ?? obsData.upper_third_score,  0, 2),
    notes:                 (obsData.notes || '').substring(0, 1000), // cap notes length
    observationDate:       obsData.observationDate || obsData.observation_date || new Date().toISOString(),
    observation_date:      obsData.observationDate || obsData.observation_date || new Date().toISOString(),
    latitude:              obsData.latitude,
    longitude:             obsData.longitude,
  };

  return await request(`/trees/${treeId}/observations`, {
    method: 'POST',
    body:   JSON.stringify(payload),
  });
};

/** Get a single observation by ID. */
export const getObservationById = async (observationId) =>
  request(`/observations/${observationId}`);

// ---------------------------------------------------------------------------
// Image Upload Endpoint (Multipart Form Data)
// ---------------------------------------------------------------------------
/**
 * Upload a photo as evidence for an observation.
 *
 * Allows only JPEG and PNG files by validating the extension.
 *
 * @param {string|number} observationId
 * @param {string}        imageUri    – Local file URI from expo-camera
 * @param {string}        [description]
 * @returns {Promise<object|null>}
 */
export const uploadObservationImage = async (observationId, imageUri, description = '') => {
  if (!imageUri) return null;

  // Validate file extension to guard against unexpected file types
  const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'];
  const filename  = imageUri.split('/').pop() || 'photo.jpg';
  const extMatch  = /\.(\w+)$/.exec(filename);
  const ext       = extMatch ? extMatch[1].toLowerCase() : 'jpg';

  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    throw new Error('Tipo de archivo no permitido. Solo se aceptan imágenes JPEG o PNG.');
  }

  const mimeType = ext === 'jpg' ? 'image/jpeg' : `image/${ext}`;

  const token    = await getStoredToken();
  const formData = new FormData();

  const filePayload = { uri: imageUri, name: filename, type: mimeType };
  formData.append('image', filePayload);
  formData.append('file',  filePayload);

  if (description) {
    // Sanitize description before uploading
    formData.append('description', String(description).substring(0, 500));
  }

  const controller = new AbortController();
  const timeoutId  = setTimeout(() => controller.abort(), UPLOAD_TIMEOUT_MS);

  try {
    const response = await fetch(`${API_BASE_URL}/observations/${observationId}/images`, {
      method:  'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body:    formData,
      signal:  controller.signal,
    });
    clearTimeout(timeoutId);

    const data = await response.json().catch(() => ({}));

    if (response.status === 401) {
      await setStoredToken(null);
      await setStoredUser(null);
      if (_onUnauthorized) _onUnauthorized();
    }

    if (!response.ok) {
      const rawMsg   = data?.error || data?.message || '';
      const cleanMsg = sanitizeErrorMessage(rawMsg, response.status);
      const error    = new Error(cleanMsg);
      error.status   = response.status;
      error.data     = data;
      throw error;
    }

    return data;

  } catch (err) {
    clearTimeout(timeoutId);

    if (err.name === 'AbortError') {
      const e = new Error('Tiempo de espera agotado al subir la imagen. Verifica tu conexión.');
      e.status = 408;
      throw e;
    }

    if (!err.status) {
      err.message = 'No se pudo subir la imagen. Verifica tu conexión a internet.';
    }

    throw err;
  }
};

/** Get all images for an observation. */
export const getObservationImages = async (observationId) =>
  request(`/observations/${observationId}/images`);
