import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle 401 responses (token expired/invalid)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Only redirect if we're not already on login page and not checking auth
      const isAuthCheck = error.config?.url?.includes('/auth/');
      if (!isAuthCheck && !window.location.pathname.includes('/login')) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  check: () => api.get('/auth/check'),
  updatePassword: (data) => api.put('/auth/password', data),
};

// Products API
export const productAPI = {
  getAll: () => api.get('/products'),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  uploadImages: (id, images) => api.post(`/products/${id}/images`, { images }),
  deleteImage: (productId, imageId) => api.delete(`/products/${productId}/images/${imageId}`),
};

// Shipping API
export const shippingAPI = {
  getAll: () => api.get('/shipping'),
  getByState: (state) => api.get(`/shipping/${state}`),
  createOrUpdate: (data) => api.post('/shipping', data),
  update: (id, data) => api.put(`/shipping/${id}`, data),
  delete: (id) => api.delete(`/shipping/${id}`),
};

// Analytics API
export const analyticsAPI = {
  getDashboard: () => api.get('/analytics/dashboard'),
  getSales: (period) => api.get('/analytics/sales', { params: { period } }),
};

// Orders API
export const orderAPI = {
  getAll: (params) => api.get('/orders', { params }),
  getById: (id) => api.get(`/orders/${id}`),
  getByOrderNumber: (orderNumber) => api.get(`/orders/number/${orderNumber}`),
  updateStatus: (id, orderStatus) => api.patch(`/orders/${id}/status`, { orderStatus }),
  updatePaymentStatus: (id, paymentStatus) => api.patch(`/orders/${id}/payment`, { paymentStatus }),
  getStats: () => api.get('/orders/stats/summary'),
};

// Image conversion utility
export const convertToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

export default api;

