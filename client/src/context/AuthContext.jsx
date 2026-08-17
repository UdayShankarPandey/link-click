import React, { createContext, useState, useEffect, useContext, useMemo } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check authentication on mount (hydrates from localStorage and validates via /auth/me)
  useEffect(() => {
    const loadUser = async () => {
      const savedUser = localStorage.getItem('auth_user');
      const token = localStorage.getItem('auth_token');

      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch {
          localStorage.removeItem('auth_user');
        }
      }

      // If there is a token or saved user, validate with the backend
      if (token || savedUser) {
        try {
          const response = await api.get('/auth/me');
          const userData = response.data.data || response.data;
          setUser(userData);
          localStorage.setItem('auth_user', JSON.stringify(userData));
        } catch (error) {
          if (error.response?.status === 401) {
            setUser(null);
            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_user');
          }
        } finally {
          setLoading(false);
        }
      } else {
        // Fallback check for HttpOnly cookie in same-origin environments
        try {
          const response = await api.get('/auth/me');
          const userData = response.data.data || response.data;
          setUser(userData);
          localStorage.setItem('auth_user', JSON.stringify(userData));
        } catch {
          setUser(null);
        } finally {
          setLoading(false);
        }
      }
    };

    loadUser();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const token = response.data.data?.token || response.data?.token;
      const userData = response.data.data?.user || response.data.user || response.data;

      if (token) {
        localStorage.setItem('auth_token', token);
      }
      if (userData) {
        localStorage.setItem('auth_user', JSON.stringify(userData));
      }

      setUser(userData);
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      const emailVerified = error.response?.data?.emailVerified;
      return { success: false, message, emailVerified };
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await api.post('/auth/register', { name, email, password });
      const resData = response.data?.data || response.data;
      return {
        success: true,
        email,
        message: response.data?.message || 'Registration successful. Please check your email.',
        verificationUrl: resData?.verificationUrl,
      };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      return { success: false, message };
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      setUser(null);
    }
  };

  const value = useMemo(
    () => ({ user, loading, login, register, logout, setUser }),
    [user, loading]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// oxlint-disable-next-line react/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
