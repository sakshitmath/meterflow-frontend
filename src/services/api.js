import axios from 'axios';

const API = axios.create({
baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const registerUser = (data) => API.post('/api/auth/register', data);
export const loginUser = (data) => API.post('/api/auth/login', data);

// APIs
export const createApi = (data) => API.post('/api/apis', data);
export const getApis = () => API.get('/api/apis');
export const deleteApi = (id) => API.delete(`/api/apis/${id}`);
export const generateKey = (id) => API.post(`/api/apis/${id}/keys`);

// Billing
export const getCurrentBill = () => API.get('/api/billing/current');
export const getBillingHistory = () => API.get('/api/billing/history');
export const calculateBill = () => API.post('/api/billing/calculate');