import axios from 'axios'
import toast from 'react-hot-toast'

// Create axios instance with proper environment handling
const getApiBaseURL = () => {
  // Check if we're in production
  const isProduction = window.location.hostname !== 'localhost'

  if (isProduction) {
    // Production - use Render backend
    return 'https://shopwise-ai-1.onrender.com/api'
  } else {
    // Development - use environment variable or default
    return import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
  }
}

const baseURL = getApiBaseURL()
console.log('🔗 API Base URL:', baseURL)

const api = axios.create({
  baseURL,
  timeout: 15000, // Increased timeout for better reliability
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false, // Ensure CORS works properly
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    // Return the data directly for successful responses
    return response.data.data || response.data
  },
  (error) => {
    // Handle different error scenarios
    if (error.response) {
      const { status, data } = error.response

      switch (status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem('token')
          if (window.location.pathname !== '/login') {
            toast.error('Session expired. Please login again.')
            window.location.href = '/login'
          }
          break
        
        case 403:
          // Forbidden
          toast.error('You do not have permission to perform this action')
          break
        
        case 404:
          // Not found
          if (!data?.message?.includes('not found')) {
            toast.error('Resource not found')
          }
          break
        
        case 422:
          // Validation error
          if (data?.errors && Array.isArray(data.errors)) {
            data.errors.forEach(err => toast.error(err.msg || err.message))
          } else if (data?.message) {
            toast.error(data.message)
          }
          break
        
        case 429:
          // Rate limit exceeded
          toast.error('Too many requests. Please try again later.')
          break
        
        case 500:
          // Server error
          toast.error('Server error. Please try again later.')
          break
        
        default:
          // Other errors
          if (data?.message) {
            toast.error(data.message)
          } else {
            toast.error('An unexpected error occurred')
          }
      }
    } else if (error.request) {
      // Network error - this is the main issue we're trying to fix
      console.error('🚨 Network Error Details:')
      console.error('API Base URL:', baseURL)
      console.error('Request URL:', error.config?.url)
      console.error('Full URL:', error.config?.baseURL + error.config?.url)
      console.error('Error:', error)

      toast.error('Unable to connect to server. Please try again.', { duration: 3000 })
    } else {
      // Other errors
      console.error('🚨 Unexpected Error:', error)
      toast.error('An unexpected error occurred')
    }

    return Promise.reject(error)
  }
)

// API methods
const apiMethods = {
  // GET request
  get: (url, config = {}) => api.get(url, config),
  
  // POST request
  post: (url, data = {}, config = {}) => api.post(url, data, config),
  
  // PUT request
  put: (url, data = {}, config = {}) => api.put(url, data, config),
  
  // PATCH request
  patch: (url, data = {}, config = {}) => api.patch(url, data, config),
  
  // DELETE request
  delete: (url, config = {}) => api.delete(url, config),
}

// Specific API endpoints
export const authAPI = {
  login: (credentials) => apiMethods.post('/auth/login', credentials),
  register: (userData) => apiMethods.post('/auth/register', userData),
  getProfile: () => apiMethods.get('/auth/me'),
  updateProfile: (data) => apiMethods.put('/auth/profile', data),
  changePassword: (data) => apiMethods.post('/auth/change-password', data),
  logout: () => apiMethods.post('/auth/logout'),
}

export const productsAPI = {
  getProducts: (params) => apiMethods.get('/products', { params }),
  getProduct: (id) => apiMethods.get(`/products/${id}`),
  getFeaturedProducts: (limit = 8) => apiMethods.get(`/products/featured?limit=${limit}`),
  getCategories: () => apiMethods.get('/products/categories'),
  getBrands: () => apiMethods.get('/products/brands'),
  addReview: (productId, review) => apiMethods.post(`/products/${productId}/reviews`, review),
}

export const cartAPI = {
  getCart: () => apiMethods.get('/cart'),
  addToCart: (data) => apiMethods.post('/cart/add', data),
  updateQuantity: (itemId, quantity) => apiMethods.put(`/cart/update/${itemId}`, { quantity }),
  removeFromCart: (itemId) => apiMethods.delete(`/cart/remove/${itemId}`),
  clearCart: () => apiMethods.delete('/cart/clear'),
  applyDiscount: (code) => apiMethods.post('/cart/apply-discount', { discountCode: code }),
  removeDiscount: (code) => apiMethods.delete(`/cart/remove-discount/${code}`),
}

export const ordersAPI = {
  createOrder: (orderData) => apiMethods.post('/orders', orderData),
  getOrders: (params) => apiMethods.get('/orders', { params }),
  getOrder: (id) => apiMethods.get(`/orders/${id}`),
  cancelOrder: (id) => apiMethods.put(`/orders/${id}/cancel`),
  returnOrder: (id, reason) => apiMethods.post(`/orders/${id}/return`, { returnReason: reason }),
}

export const usersAPI = {
  getProfile: () => apiMethods.get('/users/profile'),
  updateProfile: (data) => apiMethods.put('/users/profile', data),
  addAddress: (address) => apiMethods.post('/users/addresses', address),
  updateAddress: (id, address) => apiMethods.put(`/users/addresses/${id}`, address),
  deleteAddress: (id) => apiMethods.delete(`/users/addresses/${id}`),
  getOrderHistory: (params) => apiMethods.get('/users/order-history', { params }),
  getRewardPoints: () => apiMethods.get('/users/reward-points'),
  getBuyAgainProducts: (userId, limit = 5) => apiMethods.get(`/users/${userId}/buy-again?limit=${limit}`),
}

export const adminAPI = {
  getDashboard: () => apiMethods.get('/admin/dashboard'),
  getUsers: (params) => apiMethods.get('/admin/users', { params }),
  updateUserStatus: (id, isActive) => apiMethods.put(`/admin/users/${id}/status`, { isActive }),
  getOrders: (params) => apiMethods.get('/admin/orders', { params }),
  updateOrderStatus: (id, status, note) => apiMethods.put(`/admin/orders/${id}/status`, { status, note }),
  createProduct: (product) => apiMethods.post('/admin/products', product),
  updateProduct: (id, product) => apiMethods.put(`/admin/products/${id}`, product),
  deleteProduct: (id) => apiMethods.delete(`/admin/products/${id}`),
}

// Analytics API
export const analyticsAPI = {
  getDashboard: (params) => apiMethods.get('/analytics/dashboard', { params }),
  getRevenue: (params) => apiMethods.get('/analytics/revenue', { params }),
  getProducts: (params) => apiMethods.get('/analytics/products', { params }),
}

export default apiMethods
