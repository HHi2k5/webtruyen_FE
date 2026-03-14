
import React, { createContext, useContext, useEffect, useState } from 'react';
import { createToken, isTokenValid, decodeToken } from '../utils/jwt.js';
import * as api from '../services/apiClient.js';

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [user, setUser] = useState(() => {
    if (!token || !isTokenValid(token)) return null;
    const p = decodeToken(token);
    if (!p || !p.userId) return null;
    return api.getUserById(p.userId);
  });

  useEffect(() => {
    if (token && isTokenValid(token)) localStorage.setItem('token', token);
    else localStorage.removeItem('token');
  }, [token]);

  const login = async ({ email, password }) => {
    const u = api.login(email, password); // mock “API”
    const t = createToken({ userId: u.id, role: u.role, ttlSec: 6 * 3600 });
    setUser(u);
    setToken(t);
    return u;
  };

  const register = async ({ name, email, password }) => {
    const u = api.register({ name, email, password });
    const t = createToken({ userId: u.id, role: u.role, ttlSec: 6 * 3600 });
    setUser(u); setToken(t);
    return u;
  };

  const logout = () => { setUser(null); setToken(null); };

  const updateUserInfo = (updates) => {
    if (!user) return null;
    const updated = api.updateUser(user.id, updates);
    setUser(updated);
    return updated;
  };

  return (
    <AuthCtx.Provider value={{ user, token, login, register, logout, updateUserInfo }}>
      {children}
    </AuthCtx.Provider>
  );
}
