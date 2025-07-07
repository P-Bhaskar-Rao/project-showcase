import axios from 'axios';
import { useAuthStore } from '@/store/useAuthStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Helper to refresh the access token
async function refreshAccessToken() {
  try {
    const response = await axios.post(`${API_URL}/auth/refresh`, {}, { withCredentials: true });
    if (response.data && response.data.accessToken) {
      const user = useAuthStore.getState().user;
      useAuthStore.getState().setAuth(user, response.data.accessToken);
      return response.data.accessToken;
    }
  } catch (e) {
    // Refresh failed
  }
  return null;
}

// Response interceptor for handling token expiry
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response &&
      (error.response.status === 401 || error.response.data?.code === 'TOKEN_EXPIRED') &&
      !originalRequest._retry &&
      !originalRequest.url.includes('/auth/refresh')
    ) {
      originalRequest._retry = true;
      const newToken = await refreshAccessToken();
      if (newToken) {
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
        return axiosInstance(originalRequest);
      } else {
        useAuthStore.getState().clearAuth();
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

// Request interceptor to attach access token
axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = useAuthStore.getState().accessToken;
    if (accessToken) {
      if (!config.headers) config.headers = {} as Record<string, string>;
      (config.headers as Record<string, string>)["Authorization"] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance; 