import axios from 'axios';

// Create an axios instance with a base URL
const api = axios.create({
  // Use environment variable for API URL if available, otherwise fallback to localhost
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
});

// Add a request interceptor to add the token to the request headers
api.interceptors.request.use(
  (config) => {
    // Check if we're in a browser environment
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Check if we're in a browser environment
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        // Use a more SSR-friendly approach instead of directly using window.location
        // The actual redirect will be handled by the component using the auth context
      }
    }
    return Promise.reject(error);
  }
);

// Auth API functions
export const auth = {
  login: (credentials: { phone: string; password: string }) => {
    console.log('🔥 auth.login called with:', credentials);
    console.log('🔥 Making POST request to:', (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api') + '/auth/login');
    const request = api.post('/auth/login', credentials);
    console.log('🔥 Request object created:', request);
    return request;
  },
  register: (userData: { 
    name: string; 
    phone: string; 
    password: string; 
    email?: string; 
    role?: 'customer' | 'provider';
    businessName?: string;
    category?: string;
  }) => api.post('/auth/register', userData),
  getCurrentUser: () => api.get('/auth/profile'),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (userData: any) => api.put('/auth/profile', userData),
  requestPasswordReset: (phone: string) => api.post('/auth/forgot-password/request', { phone }),
  verifyResetCode: (phone: string, code: string) => api.post('/auth/forgot-password/verify', { phone, code }),
  resetPassword: (phone: string, code: string, newPassword: string) => 
    api.post('/auth/forgot-password/reset', { phone, code, newPassword }),
  
  // WhatsApp verification functions
  whatsapp: {
    // Registration with WhatsApp verification
    sendRegistrationCode: (phone: string, countryCode: string) => 
      api.post('/auth/whatsapp/register/send-code', { phone, countryCode }),
    verifyRegistrationCode: (phone: string, code: string, userData: {
      name: string;
      password: string;
      email?: string;
      role?: 'customer' | 'provider';
      businessName?: string;
      category?: string;
    }) => api.post('/auth/whatsapp/register/verify-code', { phone, code, ...userData }),
    
    // Login with WhatsApp verification
    sendLoginCode: (phone: string, countryCode: string) => 
      api.post('/auth/whatsapp/login/send-code', { phone, countryCode }),
    verifyLoginCode: (phone: string, code: string) => 
      api.post('/auth/whatsapp/login/verify-code', { phone, code }),
    
    // Password reset with WhatsApp verification
    sendPasswordResetCode: (phone: string, countryCode: string) => 
      api.post('/auth/whatsapp/reset-password/send-code', { phone, countryCode }),
    verifyPasswordResetCode: (phone: string, code: string, newPassword: string) => 
      api.post('/auth/whatsapp/reset-password/verify-code', { phone, code, newPassword }),
  },
};

// Appointments API functions
export const appointments = {
  getAll: () => api.get('/appointments/customer'),
  getProviderAppointments: () => api.get('/appointments/provider'),
  getById: (id: string) => api.get(`/appointments/${id}`),
  create: (appointmentData: any) => api.post('/appointments', appointmentData),
  update: (id: string, appointmentData: any) => api.put(`/appointments/${id}`, appointmentData),
  delete: (id: string) => api.delete(`/appointments/${id}`),
  updateStatus: (id: string, status: string) => api.patch(`/appointments/${id}/status`, { status }),
  addReview: (id: string, reviewData: any) => api.post(`/appointments/${id}/review`, reviewData),
};

// Provider API functions
export const providers = {
  getAll: (params: any = {}) => api.get('/providers', { params }),
  getById: (id: string) => api.get(`/providers/${id}`),
  getProfile: () => api.get('/providers/profile'),
  create: (profileData: any) => api.post('/providers', profileData),
  updateProfile: (profileData: any) => api.put('/providers/profile', profileData),
  update: ({ id, data }: { id: string; data: any }) => api.put(`/providers/${id}`, data),
  addService: (data: any) => api.post('/providers/services', data),
  updateService: (serviceId: string, data: any) => api.put(`/providers/services/${serviceId}`, data),
  deleteService: (serviceId: string) => api.delete(`/providers/services/${serviceId}`),
  getServices: (id: string) => api.get(`/providers/${id}/services`),
  getAvailability: (id: string, date: string) => api.get(`/providers/${id}/availability`, { params: { date } }),
  updateWorkingHours: (data: any) => api.put('/providers/working-hours', data),
  addAvailabilityException: (data: any) => api.post('/providers/availability-exceptions', data),
  deleteAvailabilityException: (exceptionId: string) => api.delete(`/providers/availability-exceptions/${exceptionId}`),
  getAvailabilityExceptions: () => api.get('/providers/availability-exceptions'),
};

// Upload API functions
export const uploads = {
  uploadProviderImages: (formData: FormData) => api.post('/uploads/provider/images', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  deleteProviderImage: (imageUrl: string) => api.delete('/uploads/provider/images', {
    data: { imageUrl },
  }),
};

// Search API functions
export const search = {
  providers: (query: string) => api.get(`/search/providers?q=${query}`),
  categories: () => api.get('/search/categories'),
  popularServices: () => api.get('/search/popular-services'),
};

// Legacy forgotPassword export for backward compatibility
export const forgotPassword = {
  requestReset: (phone: string) => auth.requestPasswordReset(phone),
  verifyCode: (phone: string, code: string) => auth.verifyResetCode(phone, code),
  resetPassword: (phone: string, code: string, newPassword: string) => auth.resetPassword(phone, code, newPassword),
};

// Reviews API functions
export const reviews = {
  getByProvider: (providerId: string) => api.get(`/providers/${providerId}/reviews`),
  // Note: Reviews are created through appointments.addReview(appointmentId, reviewData)
  // after an appointment is completed
};

export default api;