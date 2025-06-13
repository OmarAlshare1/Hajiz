import axios from 'axios';

const api = axios.create({
  baseURL: process.env.API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor
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

// Add a response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const auth = {
  login: (data: { phone: string; password: string }) =>
    api.post('/auth/login', data),
  register: (data: {
    name: string;
    phone: string;
    email: string;
    password: string;
    role: 'customer' | 'provider';
  }) => api.post('/auth/register', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data: {
    name?: string;
    email?: string;
    password?: string;
  }) => api.put('/auth/profile', data),
};

// Appointments
export const appointments = {
  getAll: () => api.get('/appointments'),
  getById: (id: string) => api.get(`/appointments/${id}`),
  create: (data: {
    providerId: string;
    serviceId: string;
    dateTime: string;
    notes?: string;
  }) => api.post('/appointments', data),
  update: (id: string, data: {
    status?: 'confirmed' | 'cancelled' | 'completed';
    dateTime?: string;
    notes?: string;
  }) => api.put(`/appointments/${id}`, data),
  delete: (id: string) => api.delete(`/appointments/${id}`),
};

// Service Providers
export const providers = {
  getAll: (params?: {
    location?: string;
    service?: string;
    rating?: number;
  }) => api.get('/providers', { params }),
  getById: (id: string) => api.get(`/providers/${id}`),
  getServices: (id: string) => api.get(`/providers/${id}/services`),
  getAvailability: (id: string, date: string) =>
    api.get(`/providers/${id}/availability`, { params: { date } }),
  addService: (data: {
    name: string;
    description: string;
    price: number;
    duration: number;
  }) => api.post('/providers/services', data),
  updateService: (id: string, data: {
    name?: string;
    description?: string;
    price?: number;
    duration?: number;
  }) => api.put(`/providers/services/${id}`, data),
  deleteService: (id: string) => api.delete(`/providers/services/${id}`),
  updateWorkingHours: (data: {
    day: number;
    start: string;
    end: string;
    isOpen: boolean;
  }[]) => api.put('/providers/working-hours', data),
};

// Reviews
export const reviews = {
  getByProvider: (providerId: string) =>
    api.get(`/providers/${providerId}/reviews`),
  create: (providerId: string, data: {
    rating: number;
    comment?: string;
    appointmentId: string;
  }) => api.post(`/providers/${providerId}/reviews`, data),
};

export default api; 