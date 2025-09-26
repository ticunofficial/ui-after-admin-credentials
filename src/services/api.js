import axios from 'axios'

// Environment-based configuration
const isDevelopment = import.meta.env.DEV
const API_BASE_URL = import.meta.env.VITE_API_URL || (isDevelopment ? 'http://admin.test/api' : '/api')

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  },
  withCredentials: true,
  timeout: 30000
})

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    console.log('=== API REQUEST DEBUG ===');
    console.log('Request URL:', config.url);
    console.log('Token from localStorage:', token ? token.substring(0, 20) + '...' : 'NULL');
    console.log('Token length:', token ? token.length : 0);
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      console.log('Authorization header set:', config.headers.Authorization.substring(0, 30) + '...');
    } else {
      console.log('No token found in localStorage');
    }
    console.log('=== END REQUEST DEBUG ===');
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('session_expiry')
      localStorage.removeItem('social_login')
      localStorage.removeItem('remember_me')
      delete api.defaults.headers.common['Authorization']
      window.location.href = '/login'
    }
    
    // Handle CSRF token mismatch
    if (error.response?.status === 419) {
      console.error('CSRF token mismatch')
      window.location.reload()
    }
    
    return Promise.reject(error)
  }
)

export default api