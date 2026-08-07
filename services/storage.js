import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

// ---------------------------------------------------------------------------
// Keys that must be stored encrypted (JWT token)
// ---------------------------------------------------------------------------
const SECURE_KEYS = new Set([
  '@heno_motita_token',
]);

// In-memory fallback store for environments where all persistence is unavailable
const memoryStore = new Map();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
/**
 * Returns true if expo-secure-store is usable on this platform.
 * SecureStore requires a native runtime — it does not work on Web.
 */
function canUseSecureStore() {
  return Platform.OS !== 'web' && typeof SecureStore?.getItemAsync === 'function';
}

/**
 * SecureStore can hold strings up to ~2 KB on iOS Keychain.
 * Larger payloads fall back to AsyncStorage automatically.
 */
const SECURE_STORE_MAX_BYTES = 2000;

function isSafeForSecureStore(value) {
  return typeof value === 'string' && value.length <= SECURE_STORE_MAX_BYTES;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------
/**
 * Cross-platform safe storage layer.
 *
 * Hierarchy per platform:
 *  - Sensitive keys (JWT):  SecureStore (Keychain / EncryptedSharedPreferences) → AsyncStorage
 *  - Other keys (native):   AsyncStorage → in-memory
 *  - Web:                   localStorage → in-memory
 */
export const safeStorage = {
  /**
   * Get a value by key.
   * @param {string} key
   * @returns {Promise<string|null>}
   */
  async getItem(key) {
    // 1. Secure path for token keys (native only)
    if (canUseSecureStore() && SECURE_KEYS.has(key)) {
      try {
        const val = await SecureStore.getItemAsync(key);
        return val; // null when not found, which is correct
      } catch (e) {
        // SecureStore can fail on some emulators — fall through to AsyncStorage
        console.warn('[storage] SecureStore.getItemAsync failed, falling back:', e?.code);
      }
    }

    // 2. Web localStorage
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
      try {
        return window.localStorage.getItem(key);
      } catch (e) {
        // Private browsing mode may block storage
      }
    }

    // 3. Native AsyncStorage
    try {
      return await AsyncStorage.getItem(key);
    } catch (err) {
      // 4. localStorage fallback (unexpected native failure)
      if (typeof window !== 'undefined' && window.localStorage) {
        try { return window.localStorage.getItem(key); } catch (e) { /* ignored */ }
      }
      return memoryStore.get(key) ?? null;
    }
  },

  /**
   * Store a value by key.
   * @param {string} key
   * @param {string} value
   * @returns {Promise<void>}
   */
  async setItem(key, value) {
    // 1. Secure path for token keys (native only)
    if (canUseSecureStore() && SECURE_KEYS.has(key)) {
      if (isSafeForSecureStore(value)) {
        try {
          await SecureStore.setItemAsync(key, value);
          return;
        } catch (e) {
          console.warn('[storage] SecureStore.setItemAsync failed, falling back:', e?.code);
        }
      }
      // Value too large → fall through to AsyncStorage
    }

    // 2. Web localStorage
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem(key, value);
        return;
      } catch (e) { /* continue */ }
    }

    // 3. Native AsyncStorage
    try {
      await AsyncStorage.setItem(key, value);
    } catch (err) {
      if (typeof window !== 'undefined' && window.localStorage) {
        try { window.localStorage.setItem(key, value); return; } catch (e) { /* ignored */ }
      }
      memoryStore.set(key, value);
    }
  },

  /**
   * Remove a value by key.
   * @param {string} key
   * @returns {Promise<void>}
   */
  async removeItem(key) {
    // 1. Secure path
    if (canUseSecureStore() && SECURE_KEYS.has(key)) {
      try {
        await SecureStore.deleteItemAsync(key);
      } catch (e) {
        console.warn('[storage] SecureStore.deleteItemAsync failed, falling back:', e?.code);
      }
    }

    // 2. Web localStorage
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
      try { window.localStorage.removeItem(key); return; } catch (e) { /* continue */ }
    }

    // 3. Native AsyncStorage
    try {
      await AsyncStorage.removeItem(key);
    } catch (err) {
      if (typeof window !== 'undefined' && window.localStorage) {
        try { window.localStorage.removeItem(key); return; } catch (e) { /* ignored */ }
      }
      memoryStore.delete(key);
    }
  },
};
