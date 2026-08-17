import axios from 'axios';

let rawBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
if (rawBaseUrl.endsWith('/')) {
  rawBaseUrl = rawBaseUrl.slice(0, -1);
}
if (!rawBaseUrl.endsWith('/api')) {
  rawBaseUrl = `${rawBaseUrl}/api`;
}

const api = axios.create({
  baseURL: rawBaseUrl,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Authorization Bearer token from localStorage for reliable cross-site authentication
// (Bypasses third-party cookie restrictions between Vercel and Render)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 responses — redirect to login on unauthorized API calls if not already on auth page
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/register' && currentPath !== '/verify-email') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
