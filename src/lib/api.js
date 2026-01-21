import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para logging de errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const apiClient = {
  // Users
  getUsers: async (period = 'all') => {
    const params = new URLSearchParams({ period });
    const { data } = await api.get(`/users?${params.toString()}`);
    return data;
  },

  getUser: async (handle) => {
    const { data } = await api.get(`/users/${handle}`);
    return data;
  },

  // Submissions
  getSubmissions: async (handle, filters = {}) => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value);
      }
    });

    const { data } = await api.get(`/submissions/${handle}?${params.toString()}`);
    return data;
  },

  getStats: async (handle) => {
    const { data } = await api.get(`/submissions/${handle}/stats`);
    return data;
  },

  getLatestSubmissions: async (handle, limit = 10) => {
    const { data } = await api.get(`/submissions/${handle}/latest?limit=${limit}`);
    return data;
  },

  getAllLatestSubmissions: async (period = 'month', sortBy = 'submission_time', order = 'desc', limit = 20) => {
    const params = new URLSearchParams({
      period,
      sortBy,
      order,
      limit: limit.toString()
    });
    const { data } = await api.get(`/submissions?${params.toString()}`);
    return data;
  },

  // Health check
  health: async () => {
    const { data } = await api.get('/health');
    return data;
  },
};

export default api;
