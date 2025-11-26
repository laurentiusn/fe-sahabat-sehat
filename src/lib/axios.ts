import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.destroidmous.my.id/api/v1', // Sesuaikan port Laravel
  headers: { 'Content-Type': 'application/json' }
});

// Otomatis pasang token jika ada
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;