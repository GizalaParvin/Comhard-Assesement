import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('taskflow_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('taskflow_token'));
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Verify persistent session on mount
  useEffect(() => {
    const verifyAuth = async () => {
      const storedToken = localStorage.getItem('taskflow_token');
      if (storedToken) {
        try {
          const res = await authService.getMe();
          if (res.data && res.data.data) {
            setUser(res.data.data);
            localStorage.setItem('taskflow_user', JSON.stringify(res.data.data));
          }
        } catch (err) {
          console.warn('[Auth] Session validation failed:', err.message);
          logout();
        }
      }
      setLoading(false);
    };

    verifyAuth();
  }, []);

  const login = async (email, password) => {
    setAuthError(null);
    try {
      const res = await authService.login({ email, password });
      const { token: receivedToken, ...userData } = res.data.data;

      setToken(receivedToken);
      setUser(userData);
      localStorage.setItem('taskflow_token', receivedToken);
      localStorage.setItem('taskflow_user', JSON.stringify(userData));
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to sign in. Please verify your credentials.';
      setAuthError(msg);
      return { success: false, error: msg };
    }
  };

  const register = async (name, email, password) => {
    setAuthError(null);
    try {
      const res = await authService.register({ name, email, password });
      const { token: receivedToken, ...userData } = res.data.data;

      setToken(receivedToken);
      setUser(userData);
      localStorage.setItem('taskflow_token', receivedToken);
      localStorage.setItem('taskflow_user', JSON.stringify(userData));
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create account. Please check your inputs.';
      setAuthError(msg);
      return { success: false, error: msg };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('taskflow_token');
    localStorage.removeItem('taskflow_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        authError,
        setAuthError,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
