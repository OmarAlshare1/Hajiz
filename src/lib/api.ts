import axios, { AxiosError } from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      // Let components handle navigation using Next.js router
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
    businessName?: string;
    category?: string;
  }) => api.post('/auth/register', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data: {
    name?: string;
    email?: string;
    password?: string;
  }) => api.put('/auth/profile', data),
  requestPasswordReset: (email: string) =>
    api.post('/auth/forgot-password', { email }),
  verifyResetCode: (code: string) =>
    api.post('/auth/verify-reset-code', { code }),
  resetPassword: (data: { code: string; password: string }) =>
    api.post('/auth/reset-password', data),
};

// Appointments
export const appointments = {
  getAll: () => api.get('/appointments'),
  getProviderAppointments: () => api.get('/appointments/provider'),
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
  updateStatus: (id: string, status: string) =>
    api.put(`/appointments/${id}/status`, { status }),
};

// Service Providers
export const providers = {
  getProfile: () => api.get('/providers/profile'),
  update: ({ id, data }: {
    id: string;
    data: {
      businessName?: string;
      category?: string;
      description?: string;
      location?: {
        type: 'Point';
        coordinates: [number, number];
        address: string;
      };
    };
  }) => api.put(`/providers/${id}`, data),

  addService: (data: {
    name: string;
    duration: number;
    price: number;
    description: string;
  }) => api.post('/providers/services', data),
  updateService: (serviceId: string, data: {
    name?: string;
    duration?: number;
    price?: number;
    description?: string;
  }) => api.put(`/providers/services/${serviceId}`, data),
  deleteService: (serviceId: string) => api.delete(`/providers/services/${serviceId}`),
  getAll: (params?: {
    location?: string;
    service?: string;
    rating?: number;
  }) => api.get('/providers', { params }),
  getById: (id: string) => api.get(`/providers/${id}`),
  getServices: (id: string) => api.get(`/providers/${id}/services`),
  getAvailability: (id: string, date: string) =>
    api.get(`/providers/${id}/availability`, { params: { date } }),
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

export const search = {
  providers: (query: string) => api.get(`/search/providers?q=${query}`),
  categories: () => api.get('/search/categories'),
  popularServices: () => api.get('/search/popular-services'),
};

export const forgotPassword = {
  requestReset: (phone: string) => api.post('/auth/forgot-password/request', { phone }),
  verifyCode: (phone: string, code: string) => api.post('/auth/forgot-password/verify', { phone, code }),
  resetPassword: (phone: string, code: string, newPassword: string) => api.post('/auth/forgot-password/reset', { phone, code, newPassword }),
};

export default api;