import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

