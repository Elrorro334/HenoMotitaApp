import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// In-memory fallback store for environments where NativeModule and localStorage are both unavailable
const memoryStore = new Map();

export const safeStorage = {
  async getItem(key) {
    // 1. Try Web localStorage if running on Web platform
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
      try {
        return window.localStorage.getItem(key);
      } catch (e) {
        // Fallthrough to memory store if localStorage is blocked
      }
    }

    // 2. Try native AsyncStorage
    try {
      return await AsyncStorage.getItem(key);
    } catch (err) {
      // 3. Fallback to localStorage or in-memory map if native module is null
      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          return window.localStorage.getItem(key);
        } catch (e) {}
      }
      return memoryStore.get(key) || null;
    }
  },

  async setItem(key, value) {
    // 1. Try Web localStorage if running on Web platform
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem(key, value);
        return;
      } catch (e) {
        // Fallthrough
      }
    }

    // 2. Try native AsyncStorage
    try {
      await AsyncStorage.setItem(key, value);
    } catch (err) {
      // 3. Fallback to localStorage or in-memory map if native module is null
      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          window.localStorage.setItem(key, value);
          return;
        } catch (e) {}
      }
      memoryStore.set(key, value);
    }
  },

  async removeItem(key) {
    // 1. Try Web localStorage if running on Web platform
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.removeItem(key);
        return;
      } catch (e) {
        // Fallthrough
      }
    }

    // 2. Try native AsyncStorage
    try {
      await AsyncStorage.removeItem(key);
    } catch (err) {
      // 3. Fallback to localStorage or in-memory map if native module is null
      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          window.localStorage.removeItem(key);
          return;
        } catch (e) {}
      }
      memoryStore.delete(key);
    }
  },
};
