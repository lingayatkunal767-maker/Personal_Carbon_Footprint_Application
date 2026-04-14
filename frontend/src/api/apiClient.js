import axios from 'axios';
import { ApiClientError, extractApiErrorMessage } from '../services/api';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to handle token refresh on 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config || {};
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
        localStorage.setItem('accessToken', data.accessToken);
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Handle failed refresh (e.g., redirect to login)
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    const normalized = new ApiClientError({
      message: extractApiErrorMessage(error, 'Request failed'),
      status: Number(error?.response?.status || 0),
      error: String(error?.response?.data?.error || 'Request Error'),
      path: String(error?.response?.data?.path || originalRequest?.url || ''),
      errors: (error?.response?.data?.errors && typeof error.response.data.errors === 'object')
        ? error.response.data.errors
        : {},
    });

    return Promise.reject(normalized);
  }
);

export default apiClient;
