import React, { createContext, useState, useEffect, useContext } from 'react';
import { 
  getStoredToken, 
  getStoredUser, 
  setStoredToken, 
  setStoredUser, 
  login as apiLogin,
  getCurrentCrews,
  getAllCrews
} from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [crews, setCrews] = useState([]);
  const [activeCrew, setActiveCrew] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load session on startup
  useEffect(() => {
    async function loadSession() {
      try {
        const storedToken = await getStoredToken();
        const storedUser = await getStoredUser();

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(storedUser);
          await refreshCrews(storedUser);
        }
      } catch (err) {
        console.warn('Error loading auth session:', err);
      } finally {
        setLoading(false);
      }
    }

    loadSession();
  }, []);

  const refreshCrews = async (currentUser) => {
    try {
      let crewList = [];
      const res = await getCurrentCrews().catch(() => null);
      if (res && Array.isArray(res)) {
        crewList = res;
      } else if (res && res.crews && Array.isArray(res.crews)) {
        crewList = res.crews;
      } else {
        const allRes = await getAllCrews().catch(() => null);
        if (allRes && Array.isArray(allRes)) crewList = allRes;
        else if (allRes && allRes.crews && Array.isArray(allRes.crews)) crewList = allRes.crews;
      }

      setCrews(crewList);
      if (crewList.length > 0 && !activeCrew) {
        setActiveCrew(crewList[0]);
      }
    } catch (err) {
      console.warn('Error loading crews:', err);
    }
  };

  const loginUser = async (email, password) => {
    setLoading(true);
    try {
      const res = await apiLogin(email, password);
      const authenticatedUser = res.user;
      const accessToken = res.accessToken;

      setUser(authenticatedUser);
      setToken(accessToken);

      await refreshCrews(authenticatedUser);
      return res;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logoutUser = async () => {
    setLoading(true);
    try {
      await setStoredToken(null);
      await setStoredUser(null);
      setUser(null);
      setToken(null);
      setCrews([]);
      setActiveCrew(null);
    } finally {
      setLoading(false);
    }
  };

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

export const useAuth = () => useContext(AuthContext);
