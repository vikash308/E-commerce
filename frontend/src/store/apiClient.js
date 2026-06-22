import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Create Axios Instance
const axiosInstance = axios.create({
  baseURL: API_URL,
});

let isRefreshing = false;
let refreshSubscribers = [];

const subscribeTokenRefresh = (cb) => {
  refreshSubscribers.push(cb);
};

const onRefreshed = (token) => {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
};

// Request Interceptor: Attach Access Token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token && !config.headers['Authorization']) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle Token Refresh
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Check if error is 401 and request hasn't been retried yet
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      // Avoid refreshing token if the request itself is the refresh token request
      if (originalRequest.url === '/auth/refresh-token') {
        return Promise.reject(error);
      }

      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');

      if (refreshToken) {
        if (!isRefreshing) {
          isRefreshing = true;
          
          try {
            const refreshRes = await axios.post(`${API_URL}/auth/refresh-token`, { refreshToken });
            const newAccessToken = refreshRes.data.tokens.accessToken;
            
            localStorage.setItem('accessToken', newAccessToken);
            isRefreshing = false;
            onRefreshed(newAccessToken);
          } catch (refreshErr) {
            isRefreshing = false;
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            window.location.href = '/login';
            return Promise.reject(refreshErr);
          }
        }

        // Return a promise that resolves when the token is refreshed
        return new Promise((resolve) => {
          subscribeTokenRefresh((newToken) => {
            originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
            resolve(axiosInstance(originalRequest));
          });
        });
      }
    }

    return Promise.reject(error);
  }
);

// Export apiClient wrapper for backwards compatibility
export const apiClient = async (endpoint, options = {}) => {
  const method = (options.method || 'GET').toLowerCase();
  
  // Map options.body (which might be JSON string or FormData) to axios data
  let data = options.body;
  if (data && typeof data === 'string') {
    try {
      data = JSON.parse(data);
    } catch (e) {
      // Keep as string if it's not valid JSON
    }
  }

  const headers = { ...options.headers };

  try {
    const response = await axiosInstance({
      url: endpoint,
      method,
      data,
      headers,
    });
    
    return response.data;
  } catch (error) {
    // Standardize error formats for existing components
    if (error.response) {
      throw {
        message: error.response.data?.message || 'Something went wrong',
        status: error.response.status,
        data: error.response.data,
      };
    }
    throw {
      message: error.message || 'Network error',
      status: 500,
    };
  }
};
