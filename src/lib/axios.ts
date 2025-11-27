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
}, (error) => {
  return Promise.reject(error);
});

// 2. RESPONSE INTERCEPTOR (BARU: Penanganan Token Expired)
api.interceptors.response.use(
  (response) => {
    // Jika request sukses (2xx), teruskan data
    return response;
  },
  (error) => {
    // Jika request gagal
    if (error.response && error.response.status === 401) {
      // Cek apakah error 401 (Unauthorized)
      // Artinya Token Expired atau Tidak Valid
      
      console.warn("Sesi berakhir, melakukan logout otomatis...");
      
      // 1. Hapus data lokal
      localStorage.clear();
      
      // 2. Redirect paksa ke halaman login
      // Kita pakai window.location agar halaman refresh bersih
      if (window.location.pathname !== '/login') {
          window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;