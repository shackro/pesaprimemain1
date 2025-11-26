// src/services/api/client.js
import axios from 'axios';

// Create axios instance with default configuration
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for authentication
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add timestamp to avoid caching
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now(),
      };
    }
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    console.error('API Error:', error);
    
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem('authToken');
          localStorage.removeItem('userData');
          window.location.href = '/';
          break;
        case 403:
          // Forbidden
          console.error('Access forbidden:', data.detail);
          break;
        case 404:
          // Not found
          console.error('Resource not found:', data.detail);
          break;
        case 422:
          // Validation error
          console.error('Validation error:', data.detail);
          break;
        case 500:
          // Server error
          console.error('Server error:', data.detail);
          break;
        default:
          console.error('API error:', data.detail);
      }
      
      // Return formatted error
      return Promise.reject({
        message: data.detail || data.message || 'An error occurred',
        status,
        data: data.detail || data,
      });
    } else if (error.request) {
      // Network error
      console.error('Network error:', error.request);
      return Promise.reject({
        message: 'Network error: Unable to connect to server',
        status: 0,
      });
    } else {
      // Other error
      console.error('Error:', error.message);
      return Promise.reject({
        message: error.message,
        status: 0,
      });
    }
  }
);

export default apiClient;