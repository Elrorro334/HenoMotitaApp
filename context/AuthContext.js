import React, { createContext, useState, useEffect, useContext, useCallback, useRef } from 'react';
import {
  getStoredToken,
  getStoredUser,
  setStoredToken,
  setStoredUser,
  login as apiLogin,
  getCurrentCrews,
  getAllCrews,
  registerUnauthorizedHandler,
} from '../services/api';

const AuthContext = createContext();

/**
 * AuthProvider wraps the app and manages authentication state globally.
 *
 * Features:
 *  - Restores session from secure storage on startup.
 *  - Exposes loginUser / logoutUser actions.
 *  - Registers an unauthorizedHandler with the API layer so any 401 response
 *    automatically signs the user out and redirects to Login.
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser]               = useState(null);
  const [token, setToken]             = useState(null);
  const [crews, setCrews]             = useState([]);
  const [activeCrew, setActiveCrew]   = useState(null);
  const [loading, setLoading]         = useState(true);

  // Ref lets the unauthorized handler always see the latest logoutUser
  // without triggering effect re-runs.
  const logoutRef = useRef(null);

  // ---------------------------------------------------------------------------
  // Internal: crew loading helper
  // ---------------------------------------------------------------------------
  const refreshCrews = useCallback(async () => {
    try {
      let crewList = [];
      const res = await getCurrentCrews().catch(() => null);

      if (res && Array.isArray(res)) {
        crewList = res;
      } else if (res?.crews && Array.isArray(res.crews)) {
        crewList = res.crews;
      } else {
        const allRes = await getAllCrews().catch(() => null);
        if (allRes && Array.isArray(allRes)) crewList = allRes;
        else if (allRes?.crews && Array.isArray(allRes.crews)) crewList = allRes.crews;
      }

      setCrews(crewList);
      setActiveCrew((prev) => prev ?? (crewList.length > 0 ? crewList[0] : null));
    } catch (err) {
      if (__DEV__) console.warn('[AuthContext] Error loading crews:', err);
    }
  }, []);

  // ---------------------------------------------------------------------------
  // logoutUser — clear all auth state
  // ---------------------------------------------------------------------------
  const logoutUser = useCallback(async () => {
    setLoading(true);
    try {
      await setStoredToken(null);
      await setStoredUser(null);
    } finally {
      setUser(null);
      setToken(null);
      setCrews([]);
      setActiveCrew(null);
      setLoading(false);
    }
  }, []);

  // Keep logoutRef up to date
  useEffect(() => {
    logoutRef.current = logoutUser;
  }, [logoutUser]);

  // ---------------------------------------------------------------------------
  // Register the 401 → auto-logout handler with the API layer.
  // This runs once on mount.
  // ---------------------------------------------------------------------------
  useEffect(() => {
    registerUnauthorizedHandler(() => {
      // Fire and forget — we just need to trigger the logout flow
      if (logoutRef.current) {
        logoutRef.current();
      }
    });

    // Clean up on unmount (rare, but defensive)
    return () => registerUnauthorizedHandler(null);
  }, []);

  // ---------------------------------------------------------------------------
  // Restore session from secure storage on app startup
  // ---------------------------------------------------------------------------
  useEffect(() => {
    let cancelled = false;

    async function loadSession() {
      try {
        const storedToken = await getStoredToken();
        const storedUser  = await getStoredUser();

        if (!cancelled && storedToken && storedUser) {
          setToken(storedToken);
          setUser(storedUser);
          await refreshCrews();
        }
      } catch (err) {
        if (__DEV__) console.warn('[AuthContext] Error loading auth session:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadSession();

    return () => { cancelled = true; };
  }, [refreshCrews]);

  // ---------------------------------------------------------------------------
  // loginUser
  // ---------------------------------------------------------------------------
  const loginUser = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const res = await apiLogin(email, password);

      setUser(res.user);
      setToken(res.accessToken);

      await refreshCrews();
      return res;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  }, [refreshCrews]);

  // ---------------------------------------------------------------------------
  // Context value
  // ---------------------------------------------------------------------------
  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        crews,
        activeCrew,
        setActiveCrew,
        loading,
        loginUser,
        logoutUser,
        refreshCrews,
        isAuthenticated: !!token && !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook to consume AuthContext.
 * Throws if used outside AuthProvider (helpful in development).
 */
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx && __DEV__) {
    throw new Error('[useAuth] must be used within an <AuthProvider>');
  }
  return ctx;
};
