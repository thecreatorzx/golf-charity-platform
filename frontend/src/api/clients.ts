import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      const publicPaths = ['/login', '/register', '/'];
      const isPublicPage = publicPaths.includes(window.location.pathname);

      if (!isPublicPage) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;