import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor to include the auth token in all requests
API.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method.toUpperCase(), config.url);
    
    const token = localStorage.getItem('token');
    if (token) {
      console.log('Adding token to request:', token.substring(0, 20) + '...');
      config.headers['Authorization'] = `Bearer ${token}`;
    } else {
      console.log('No token found in localStorage');
    }
    
    console.log('Request headers:', config.headers);
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors
API.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.method.toUpperCase(), response.config.url);
    return response;
  },
  (error) => {
    console.error('API Error:', error.message);
    
    // Log more details if available
    if (error.response) {
      console.error('Response error details:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        url: error.config.url,
        method: error.config.method.toUpperCase()
      });
    }
    
    // Handle 401 Unauthorized errors
    if (error.response && error.response.status === 401) {
      // Clear local storage and redirect to login if not already there
      if (window.location.pathname !== '/admin/login') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

export default API;
