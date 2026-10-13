import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: API_BASE,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('civic_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  const lang = localStorage.getItem('civic_lang') || 'ta';
  config.headers['Accept-Language'] = lang;
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('civic_token');
      localStorage.removeItem('civic_user');
      const path = window.location.pathname;
      const isPublic = path === '/' || path === '/login' || path === '/register' || path.startsWith('/complaints/') || path === '/leaderboard';
      if (!isPublic) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

