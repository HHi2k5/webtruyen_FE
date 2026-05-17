import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import * as api from '../services/apiClient.js';

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user')) || null;
    } catch { return null; }
  });

  const logout = useCallback(() => { 
    setUser(null); 
    setToken(null); 
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }, []);

  useEffect(() => {
    api.setLogoutCallback(logout);
  }, [logout]);

  useEffect(() => {
    if (token) localStorage.setItem('token', token);
    else localStorage.removeItem('token');

    if (user) localStorage.setItem('user', JSON.stringify(user));
    else localStorage.removeItem('user');
  }, [token, user]);

  useEffect(() => {
    if (token && user?.id) {
      api.getUserById(user.id).then(u => {
        if (u) setUser(u);
      }).catch(e => {
        if (e.response?.status === 401 || e.response?.status === 403) {
          logout();
        }
      });
    }
  }, []);

  const login = useCallback(async ({ email, password }) => {
    const u = await api.login(email, password);
    setToken(u.token);
    setUser(u);
    return u;
  }, []);

  const register = useCallback(async ({ name, email, password }) => {
    const u = await api.register({ name, email, password });
    await login({ email, password });
    return u;
  }, [login]);


  const updateUserInfo = useCallback(async (updates) => {
    if (!user) return null;
    const updated = await api.updateUser(user.id, updates);
    setUser(prev => ({ ...prev, ...updated }));
    return updated;
  }, [user]);

  const contextValue = useMemo(() => ({
    user,
    token,
    login,
    register,
    logout,
    updateUserInfo
  }), [user, token, login, register, logout, updateUserInfo]);

  return (
    <AuthCtx.Provider value={contextValue}>
      {children}
    </AuthCtx.Provider>
  );
}
