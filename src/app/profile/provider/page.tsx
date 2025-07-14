'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { providers, appointments, uploads } from '../../../lib/api';
import { Dialog } from '@headlessui/react'; // Import Dialog component from Headless UI
import CustomSelect from '../../../components/CustomSelect'; // Import CustomSelect component
import ImageUpload from '../../../components/ImageUpload'; // Import ImageUpload component

// Helper function to convert day string to number (not strictly used in rendering, but useful for backend interaction)
const getDayNumber = (day: string): number => {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days.indexOf(day.toLowerCase());
};

// Define interfaces for better type safety and clarity
interface ILocation {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
  address: string;
}

interface IService {
  _id?: string; // Services have an _id after being saved
  name: string;
  duration: number; // in minutes
  price: number;
  description: string;
}

interface IWorkingHours {
  day: number;
  start: string; // HH:mm format
  end: string; // HH:mm format
  isOpen: boolean;
}

interface IProviderData {
  _id: string;
  userId: string;
  businessName: string;
  category: string;
  description: string;
  location: ILocation;
  services: IService[];
  workingHours: IWorkingHours[];
  rating: number;
  totalRatings: number;
  isVerified: boolean;
  images: string[];
}

// Available Categories (match your backend's provider registration categories)
const allCategories = [
  { value: 'تجميل وسبا', label: 'تجميل وسبا' },
  { value: 'صحة ولياقة', label: 'صحة ولياقة' },
  { value: 'تعليم', label: 'تعليم' },
  { value: 'صيانة وخدمات منزلية', label: 'صيانة وخدمات منزلية' },
  { value: 'تنظيم فعاليات', label: 'تنظيم فعاليات' },
  { value: 'حلاق', label: 'حلاق' },
  { value: 'فندق', label: 'فندق' },
  { value: 'مطعم', label: 'مطعم' },
  { value: 'عيادة', label: 'عيادة' },
  { value: 'أخرى', label: 'أخرى' }
];

// Helper for Arabic day names
const arabicDays: { [key: number]: string } = {
  0: 'الأحد',
  1: 'الاثنين',
  2: 'الثلاثاء',
  3: 'الأربعاء',
  4: 'الخميس',
  5: 'الجمعة',
  6: 'السبت'
};

// Generate time options for dropdowns (e.g., 09:00, 09:30, ..., 23:30)
const generateTimeOptions = () => {
  const times = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) { // 30 minute intervals
      const hour = String(h).padStart(2, '0');
      const minute = String(m).padStart(2, '0');
      times.push({ value: `${hour}:${minute}`, label: `${hour}:${minute}` }); // Values and labels as plain strings
    }
  }
  return times;
};
const timeOptions = generateTimeOptions();

// Component for creating provider profile
function CreateProviderProfileForm({ onSuccess }: { onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    businessName: '',
    category: '',
    description: '',
    locationAddress: 'سوريا', // Default address
    locationCoordinates: [36.2021, 37.1343] as [number, number], // Default coordinates (Aleppo, Syria)
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!formData.businessName || !formData.category) {
      setError('يرجى ملء جميع الحقول المطلوبة');
      setIsLoading(false);
      return;
    }

    try {
      await providers.create({
        businessName: formData.businessName,
        category: formData.category,
        description: formData.description || `${formData.businessName} - ${formData.category}`,
        location: {
          type: 'Point',
          coordinates: formData.locationCoordinates,
          address: formData.locationAddress,
        },
        services: [], // Empty services array - to be filled later
        workingHours: [ // Default working hours
          { day: 'sunday', open: '09:00', close: '17:00', isClosed: false },
          { day: 'monday', open: '09:00', close: '17:00', isClosed: false },
          { day: 'tuesday', open: '09:00', close: '17:00', isClosed: false },
          { day: 'wednesday', open: '09:00', close: '17:00', isClosed: false },
          { day: 'thursday', open: '09:00', close: '17:00', isClosed: false },
          { day: 'friday', open: '09:00', close: '17:00', isClosed: true },
          { day: 'saturday', open: '09:00', close: '17:00', isClosed: false }
        ]
      });
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'فشل إنشاء ملف مقدم الخدمة');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (value: string | number) => {
    setFormData(prev => ({ ...prev, category: value as string }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-right">
      {error && (
        <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg text-sm" role="alert">
          <span className="block">{error}</span>
        </div>
      )}
      
      <div>
        <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-1">
          اسم العمل *
        </label>
        <input
          id="businessName"
          name="businessName"
          type="text"
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="مثال: صالون الأمل، مطعم الوردة"
          value={formData.businessName}
          onChange={handleInputChange}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          فئة الخدمة *
        </label>
        <CustomSelect
          label="فئة الخدمة"
          options={allCategories}
          value={formData.category}
          onChange={handleCategoryChange}
          className="w-full"
          containerClasses="rounded-md shadow-sm border border-gray-300 focus-within:ring-blue-500 focus-within:border-blue-500"
          selectClasses="py-2 px-3 text-sm text-gray-900 focus:outline-none"
          placeholder="اختر الفئة"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          وصف العمل
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="وصف مختصر عن خدماتك"
          value={formData.description}
          onChange={handleInputChange}
        />
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed font-semibold"
        disabled={isLoading}
      >
        {isLoading ? 'جاري الإنشاء...' : 'إنشاء ملف مقدم الخدمة'}
      </button>
    </form>
  );
}

export default function ProviderProfilePage() {
  const router = useRouter();
  const { user, isLoading: userLoading } = useAuth(); // User authentication status and data
  const queryClient = useQueryClient(); // For invalidating React Query caches

  // States for controlling modal visibility
  const [showEditProviderModal, setShowEditProviderModal] = useState(false);
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const [showEditServiceModal, setShowEditServiceModal] = useState(false);
  const [showEditWorkingHoursModal, setShowEditWorkingHoursModal] = useState(false);

  const [selectedService, setSelectedService] = useState<IService | null>(null); // State for the service being edited

  // Form data states for various modals
  const [providerEditFormData, setProviderEditFormData] = useState({
    businessName: '',
    category: '',
    description: '',
    locationAddress: '',
    locationCoordinates: [0, 0] as [number, number], // Default coordinates
  });
  const [addServiceFormData, setAddServiceFormData] = useState<IService>({ name: '', duration: 0, price: 0, description: '' });
  const [editServiceFormData, setEditServiceFormData] = useState<IService>({ name: '', duration: 0, price: 0, description: '' });
  const [workingHoursFormData, setWorkingHoursFormData] = useState<IWorkingHours[]>([]); // Form data for working hours

  const [formError, setFormError] = useState('');     // Generic error message for forms
  const [formSuccess, setFormSuccess] = useState(''); // Generic success message for forms

  // Fetch provider profile data
  const { data: providerData, isLoading: providerLoading, error: providerError, refetch: refetchProvider } = useQuery<IProviderData | null>({
    queryKey: ['provider-profile'],
    queryFn: async () => {
      // Only fetch if user is a provider and window is defined
      if (!user || user.role !== 'provider') return null;
      try {
        const res = await providers.getProfile();
        return res.data;
      } catch (err) {
        console.error("Failed to fetch provider profile:", err);
        return null;
      }
    },
    // Enable query only when user is loaded and is a provider
    enabled: typeof window !== 'undefined' && !!user && user.role === 'provider',
    staleTime: 5 * 60 * 1000, // Data considered fresh for 5 minutes
    gcTime: 5 * 60 * 1000,    // Data garbage collected after 5 minutes of inactivity
  });

  // Fetch provider appointments
  const { data: appointmentsData, isLoading: appointmentsLoading, error: appointmentsError } = useQuery({
    queryKey: ['provider-appointments'],
    queryFn: async () => {
      const res = await appointments.getProviderAppointments();
      return res.data;
    },
    enabled: typeof window !== 'undefined' && !!user && user.role === 'provider',
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  // Mutation for updating provider general information
  const updateProviderMutation = useMutation({
    mutationFn: providers.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider-profile'] }); // Invalidate cache to refetch updated data
      setFormSuccess('تم تحديث معلومات مقدم الخدمة بنجاح!');
      setShowEditProviderModal(false); // Close modal on success
      refetchProvider(); // Explicitly refetch to ensure UI updates immediately
    },
    onError: (err: any) => {
      setFormError(err.response?.data?.message || 'فشل تحديث معلومات مقدم الخدمة');
    }
  });

  // Mutation for adding a new service
  const addServiceMutation = useMutation({
    mutationFn: providers.addService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider-profile'] });
      setFormSuccess('تمت إضافة الخدمة بنجاح!');
      setShowAddServiceModal(false);
      setAddServiceFormData({ name: '', duration: 0, price: 0, description: '' }); // Reset form
    },
    onError: (err: any) => {
      setFormError(err.response?.data?.message || 'فشل إضافة الخدمة');
    }
  });

  // Mutation for updating an existing service
  const updateServiceMutation = useMutation({
    mutationFn: (data: { serviceId: string, serviceData: Partial<IService> }) =>
      providers.updateService(data.serviceId, data.serviceData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider-profile'] });
      setFormSuccess('تم تحديث الخدمة بنجاح!');
      setShowEditServiceModal(false);
      setSelectedService(null); // Clear selected service
    },
    onError: (err: any) => {
      setFormError(err.response?.data?.message || 'فشل تحديث الخدمة');
    }
  });

  // Mutation for deleting a service
  const deleteServiceMutation = useMutation({
    mutationFn: providers.deleteService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider-profile'] });
      setFormSuccess('تم حذف الخدمة بنجاح!');
    },
    onError: (err: any) => {
      setFormError(err.response?.data?.message || 'فشل حذف الخدمة');
    }
  });

  // Mutation for updating appointment status
  const updateAppointmentStatusMutation = useMutation({
    mutationFn: (data: { appointmentId: string; status: string }) =>
      appointments.updateStatus(data.appointmentId, data.status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider-appointments'] }); // Refetch appointments
      setFormSuccess('تم تحديث حالة الموعد بنجاح!');
    },
    onError: (err: any) => {
      setFormError(err.response?.data?.message || 'فشل تحديث حالة الموعد');
    }
  });

  // NEW: Mutation for updating working hours
  const updateWorkingHoursMutation = useMutation({
    mutationFn: async (workingHoursData: IWorkingHours[]) => {
      const response = await providers.updateWorkingHours(workingHoursData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider-profile'] }); // Invalidate provider profile to show new hours
      setFormSuccess('تم تحديث ساعات العمل بنجاح!');
      setShowEditWorkingHoursModal(false);
    },
    onError: (err: any) => {
      setFormError(err.response?.data?.message || 'فشل تحديث ساعات العمل.');
    }
  });


  // Effect to populate provider edit form data and working hours data when providerData is fetched
  useEffect(() => {
    if (providerData) {
      setProviderEditFormData({
        businessName: providerData.businessName,
        category: providerData.category,
        description: providerData.description,
        locationAddress: providerData.location?.address || '',
        locationCoordinates: providerData.location?.coordinates || [0, 0],
      });
      // Initialize working hours form data if not already set, ensuring all 7 days are present
      const defaultWorkingHours: IWorkingHours[] = [
        0, 1, 2, 3, 4, 5, 6 // Days of the week (Sunday to Saturday)
      ].map(day => {
        const existing = providerData.workingHours.find(wh => wh.day === day);
        return {
          day,
          start: existing?.start || '09:00', // Default start time
          end: existing?.end || '17:00',     // Default end time
          isOpen: existing?.isOpen ?? true    // Default to open
        };
      });
      setWorkingHoursFormData(defaultWorkingHours);
    }
  }, [providerData]);

  // Effect to populate edit service form data when a service is selected for editing
  useEffect(() => {
    if (selectedService) {
      setEditServiceFormData({
        name: selectedService.name,
        duration: selectedService.duration,
        price: selectedService.price,
        description: selectedService.description,
        _id: selectedService._id // Keep _id for mutation
      });
    }
  }, [selectedService]);


  // Handler for submitting provider profile edits
  const handleProviderEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    if (!providerData?._id) {
      setFormError("معلومات مقدم الخدمة غير متوفرة للتحديث.");
      return;
    }
    // Basic validation for required fields
    if (!providerEditFormData.businessName || !providerEditFormData.category || !providerEditFormData.locationAddress) {
        setFormError('الرجاء ملء جميع الحقول المطلوبة (اسم العمل، التصنيف، العنوان).');
        return;
    }

    try {
      await updateProviderMutation.mutateAsync({
        id: providerData._id,
        data: {
          businessName: providerEditFormData.businessName,
          category: providerEditFormData.category,
          description: providerEditFormData.description,
          location: {
            type: 'Point',
            coordinates: providerEditFormData.locationCoordinates, // Assuming these are managed elsewhere or default to [0,0]
            address: providerEditFormData.locationAddress,
          },
        }
      });
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'فشل تحديث معلومات مقدم الخدمة');
    }
  };

  // Handler for adding a new service
  const handleAddServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    // Basic validation for required fields
    if (!addServiceFormData.name || addServiceFormData.duration <= 0 || addServiceFormData.price <= 0) {
        setFormError('الرجاء ملء جميع الحقول المطلوبة (الاسم، المدة، السعر) بشكل صحيح.');
        return;
    }
    try {
      await addServiceMutation.mutateAsync(addServiceFormData);
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'فشل إضافة الخدمة');
    }
  };

  // Handler for editing an existing service
  const handleEditServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    if (!selectedService?._id) {
      setFormError("الخدمة غير محددة للتحديث.");
      return;
    }
    // Basic validation for required fields
    if (!editServiceFormData.name || editServiceFormData.duration <= 0 || editServiceFormData.price <= 0) {
        setFormError('الرجاء ملء جميع الحقول المطلوبة (الاسم، المدة، السعر) بشكل صحيح.');
        return;
    }
    try {
      await updateServiceMutation.mutateAsync({
        serviceId: selectedService._id,
        serviceData: editServiceFormData
      });
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'فشل تحديث الخدمة');
    }
  };

  // Handler for deleting a service
  const handleDeleteService = async (serviceId: string) => {
    setFormError('');
    setFormSuccess('');
    // Using a custom modal for confirmation instead of window.confirm
    // For this example, I'll use a simple alert as a placeholder for a custom modal
    if (!window.confirm('هل أنت متأكد أنك تريد حذف هذه الخدمة؟')) return;
    try {
      await deleteServiceMutation.mutateAsync(serviceId);
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'فشل حذف الخدمة');
    }
  };

  // Handler for updating an appointment's status
  const handleUpdateAppointmentStatus = async (appointmentId: string, status: string) => {
    setFormError('');
    setFormSuccess('');
    try {
      await updateAppointmentStatusMutation.mutateAsync({ appointmentId, status });
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'فشل تحديث حالة الموعد');
    }
  };

  // NEW: Handler for submitting working hours edits
  const handleWorkingHoursSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    if (!providerData?._id) {
      setFormError("معلومات مقدم الخدمة غير متوفرة لتحديث ساعات العمل.");
      return;
    }
    try {
      // Ensure data is sent in the correct format for the backend
      const formattedData = workingHoursFormData.map(wh => ({
        day: wh.day,
        start: wh.start,
        end: wh.end,
        isOpen: wh.isOpen
      }));
      await updateWorkingHoursMutation.mutateAsync(formattedData);
      setShowEditWorkingHoursModal(false);
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'فشل تحديث ساعات العمل.');
    }
  };

  // NEW: Handle change for working hours form fields
  // Takes day number, field name ('start', 'end', 'isOpen'), and the new value
  const handleWorkingHoursChange = (day: number, field: 'start' | 'end' | 'isOpen', value: string | boolean) => {
    setWorkingHoursFormData(prevHours =>
      prevHours.map(wh =>
        wh.day === day ? { ...wh, [field]: value } : wh
      )
    );
  };


  // --- Conditional Renderings for Loading, Error, Access Denied ---
  if (userLoading || providerLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 font-inter p-4">
        <div className="flex flex-col items-center p-8 bg-white rounded-xl shadow-2xl border-t-4 border-blue-600 max-w-sm w-full text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-blue-500 mb-6 border-opacity-75"></div>
          <p className="text-gray-700 text-lg">جاري تحميل ملف مقدم الخدمة...</p>
        </div>
      </div>
    );
  }

  // Access denied if not a provider
  if (!user || user.role !== 'provider') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 font-inter p-4">
        <div className="text-center p-8 bg-white rounded-xl shadow-2xl border-t-4 border-red-600 max-w-sm w-full">
          <h2 className="text-2xl font-bold text-red-600 mb-4">خطأ في الوصول</h2>
          <p className="text-gray-700 text-lg">هذه الصفحة مخصصة لمقدمي الخدمات فقط.</p>
          <button onClick={() => router.push('/auth/login')} className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition font-semibold">
            العودة لتسجيل الدخول
          </button>
        </div>
      </div>
    );
  }

  // Error fetching provider data or no provider profile exists
  if (providerError || !providerData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 font-inter p-4">
        <div className="text-center p-8 bg-white rounded-xl shadow-2xl border-t-4 border-yellow-600 max-w-md w-full">
          <h2 className="text-2xl font-bold text-yellow-600 mb-4">ملف مقدم الخدمة غير مكتمل</h2>
          <p className="text-gray-700 text-lg mb-6">
            يبدو أنك مسجل كمقدم خدمة ولكن لم يتم إنشاء ملفك الشخصي بعد. 
            يرجى إكمال معلومات ملفك الشخصي للوصول إلى لوحة التحكم.
          </p>
          <CreateProviderProfileForm onSuccess={() => {
            refetchProvider();
            setFormSuccess('تم إنشاء ملف مقدم الخدمة بنجاح!');
          }} />
        </div>
      </div>
    );
  }

  // Main Profile Page Content
  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 bg-gray-100 min-h-screen font-inter">
      <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-8 text-center">ملف مقدم الخدمة الخاص بك</h1>

      {/* Global Form Feedback Messages */}
      {formError && (
        <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg relative mb-4 text-sm sm:text-base text-right" role="alert">
          <span className="block">{formError}</span>
        </div>
      )}
      {formSuccess && (
        <div className="bg-green-50 border border-green-300 text-green-700 px-4 py-3 rounded-lg relative mb-4 text-sm sm:text-base text-right" role="alert">
          <span className="block">{formSuccess}</span>
        </div>
      )}

      {/* Main Grid Layout for Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Provider Images Section */}
        <section className="bg-white rounded-xl shadow-lg p-6 sm:p-8 border-t-4 border-purple-600">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4">صور مقدم الخدمة</h2>
          <ImageUpload 
            images={providerData.images || []} 
            onImagesUpdate={(newImages) => {
              // Update the provider data with the new images
              queryClient.setQueryData(['provider-profile'], {
                ...providerData,
                images: newImages
              });
            }} 
          />
        </section>
        
        {/* Provider Info Card */}
        <section className="bg-white rounded-xl shadow-lg p-6 sm:p-8 border-t-4 border-blue-600">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">معلومات العمل</h2>
            <button
              onClick={() => {
                setShowEditProviderModal(true);
                setFormError(''); setFormSuccess(''); // Clear feedback for modal
              }}
              className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 transition font-semibold text-sm sm:text-base"
            >
              تعديل الملف
            </button>
          </div>
          <div className="space-y-4 text-gray-800 text-right">
            <p className="flex flex-col sm:flex-row sm:items-center">
              <span className="font-semibold sm:w-32 sm:text-right sm:ml-4 text-gray-700">اسم العمل:</span>
              <span className="flex-1 text-base">{providerData.businessName}</span>
            </p>
            <p className="flex flex-col sm:flex-row sm:items-center">
              <span className="font-semibold sm:w-32 sm:text-right sm:ml-4 text-gray-700">التصنيف:</span>
              <span className="flex-1 text-base">{providerData.category}</span>
            </p>
            <p className="flex flex-col sm:flex-row sm:items-center">
              <span className="font-semibold sm:w-32 sm:text-right sm:ml-4 text-gray-700">الوصف:</span>
              <span className="flex-1 text-base">{providerData.description || 'لا يوجد وصف'}</span>
            </p>
            <p className="flex flex-col sm:flex-row sm:items-center">
              <span className="font-semibold sm:w-32 sm:text-right sm:ml-4 text-gray-700">العنوان:</span>
              <span className="flex-1 text-base">{providerData.location?.address || 'غير محدد'}</span>
            </p>
            <p className="flex flex-col sm:flex-row sm:items-center">
              <span className="font-semibold sm:w-32 sm:text-right sm:ml-4 text-gray-700">التقييم:</span>
              <span className="flex-1 text-base flex items-center">
                {providerData.rating?.toFixed(1) || 'جديد'}
                <span className="text-yellow-400 rtl:mr-1 ltr:ml-1">⭐</span>
                <span className="text-sm text-gray-500 rtl:mr-2 ltr:ml-2">({providerData.totalRatings} تقييم)</span>
              </span>
            </p>
          </div>
        </section>

        {/* Services Management Section */}
        <section className="bg-white rounded-xl shadow-lg p-6 sm:p-8 border-t-4 border-green-600">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">الخدمات</h2>
            <button
              onClick={() => {
                setFormError('');
                setFormSuccess('');
                setAddServiceFormData({ name: '', duration: 0, price: 0, description: '' }); // Clear form
                setShowAddServiceModal(true);
              }}
              className="bg-green-600 text-white px-5 py-2 rounded-md hover:bg-green-700 transition font-semibold text-sm sm:text-base"
            >
              إضافة خدمة
            </button>
          </div>
          {providerLoading ? (
            <div className="text-center text-gray-600 text-lg">جاري تحميل الخدمات...</div>
          ) : providerData.services && providerData.services.length > 0 ? (
            <div className="space-y-4">
              {providerData.services.map((service) => (
                <div key={service._id} className="bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm flex flex-col sm:flex-row sm:justify-between sm:items-center text-right">
                  <div className="flex-1 mb-2 sm:mb-0">
                    <p className="font-semibold text-gray-800 text-lg mb-0.5">{service.name}</p>
                    <p className="text-sm text-gray-600">المدة: {service.duration} دقيقة | السعر: {service.price} ل.س</p>
                    <p className="text-sm text-gray-500">{service.description || 'لا يوجد وصف'}</p>
                  </div>
                  <div className="flex flex-row-reverse sm:flex-row gap-2"> {/* Buttons align right for RTL on small screens */}
                    <button
                      onClick={() => {
                        setSelectedService(service);
                        setEditServiceFormData({ ...service });
                        setFormError(''); setFormSuccess('');
                        setShowEditServiceModal(true);
                      }}
                      className="bg-yellow-500 text-white px-3 py-1 text-sm rounded-md hover:bg-yellow-600 transition font-semibold"
                    >
                      تعديل
                    </button>
                    <button
                      onClick={() => handleDeleteService(service._id!)}
                      className="bg-red-500 text-white px-3 py-1 text-sm rounded-md hover:bg-red-600 transition font-semibold"
                    >
                      حذف
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-600 p-4 border rounded-md bg-gray-50 text-lg">
              <p>لا يوجد خدمات مسجلة بعد. استخدم زر "إضافة خدمة" للبدء.</p>
            </div>
          )}
        </section>

        {/* Working Hours Section */}
        <section className="bg-white rounded-xl shadow-lg p-6 sm:p-8 border-t-4 border-purple-600">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">ساعات العمل</h2>
            <button
              onClick={() => {
                setFormError('');
                setFormSuccess('');
                setShowEditWorkingHoursModal(true);
              }}
              className="bg-purple-600 text-white px-5 py-2 rounded-md hover:bg-purple-700 transition font-semibold text-sm sm:text-base"
            >
              تعديل الساعات
            </button>
          </div>
          {providerData.workingHours && providerData.workingHours.length > 0 ? (
            <div className="space-y-3 text-gray-800">
              {workingHoursFormData.sort((a,b) => a.day - b.day).map((wh) => ( // Sort to ensure consistent order
                <p key={wh.day} className="flex justify-between items-center text-base sm:text-lg">
                  <span className="font-semibold text-gray-700">{arabicDays[wh.day]}</span>
                  <span className={!wh.isOpen ? 'text-red-500' : 'text-green-600'}>
                    {!wh.isOpen ? 'مغلق' : `${wh.start} - ${wh.end}`}
                  </span>
                </p>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-600 p-4 border rounded-md bg-gray-50 text-lg">
              <p>ساعات العمل غير محددة بعد. الرجاء تحديدها لإتاحة الحجز.</p>
            </div>
          )}
        </section>

        {/* Provider Appointments Section */}
        <section className="bg-white rounded-xl shadow-lg p-6 sm:p-8 border-t-4 border-indigo-600">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-6">مواعيد العملاء</h2>
          {appointmentsLoading ? (
            <div className="text-center text-gray-600 text-lg">جاري تحميل المواعيد...</div>
          ) : appointmentsData && appointmentsData.length > 0 ? (
            <div className="space-y-4">
              {appointmentsData.map((apt: any) => (
                <div key={apt._id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 text-right group">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-bold text-gray-900 text-lg mb-1 group-hover:text-primary-700 transition-colors">
                            {apt.customer?.name || 'عميل غير محدد'}
                          </h3>
                          <p className="text-primary-600 font-medium">{apt.service?.name}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${
                          apt.status === 'confirmed' ? 'bg-green-50 text-green-700 border-green-200' :
                          apt.status === 'pending' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                          apt.status === 'cancelled' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-blue-50 text-blue-700 border-blue-200'
                        }`}>
                          {apt.status === 'pending' ? 'معلق' : apt.status === 'confirmed' ? 'مؤكد' : apt.status === 'cancelled' ? 'ملغى' : 'مكتمل'}
                        </span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-sm font-medium">
                          {new Date(apt.dateTime).toLocaleString('ar-SY', { dateStyle: 'full', timeStyle: 'short' })}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-row-reverse sm:flex-col gap-2 sm:gap-3">
                      {apt.status === 'pending' && (
                        <button 
                          onClick={() => handleUpdateAppointmentStatus(apt._id, 'confirmed')} 
                          className="bg-green-600 text-white px-4 py-2 text-sm rounded-lg hover:bg-green-700 hover:shadow-md transition-all duration-200 font-semibold flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          تأكيد
                        </button>
                      )}
                      {(apt.status === 'pending' || apt.status === 'confirmed') && (
                        <button 
                          onClick={() => handleUpdateAppointmentStatus(apt._id, 'cancelled')} 
                          className="bg-red-600 text-white px-4 py-2 text-sm rounded-lg hover:bg-red-700 hover:shadow-md transition-all duration-200 font-semibold flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          إلغاء
                        </button>
                      )}
                      {apt.status === 'confirmed' && (
                        <button 
                          onClick={() => handleUpdateAppointmentStatus(apt._id, 'completed')} 
                          className="bg-blue-600 text-white px-4 py-2 text-sm rounded-lg hover:bg-blue-700 hover:shadow-md transition-all duration-200 font-semibold flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          إتمام
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-600 p-4 border rounded-md bg-gray-50 text-lg">
              <p>لا يوجد لديك مواعيد عملاء حالياً.</p>
            </div>
          )}
        </section>
      </div>

      {/* Edit Provider Profile Modal */}
      <Dialog open={showEditProviderModal} onClose={() => setShowEditProviderModal(false)} className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <div className="fixed inset-0 bg-black bg-opacity-60" aria-hidden="true" />
        <Dialog.Panel className="relative bg-white rounded-xl shadow-2xl p-6 sm:p-8 w-full max-w-lg mx-auto animate-fade-in-scale">
          <button
            onClick={() => setShowEditProviderModal(false)}
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-3xl transition"
            aria-label="إغلاق"
          >
            &times;
          </button>
          <Dialog.Title className="text-xl sm:text-2xl font-bold text-gray-800 mb-6 text-center">تعديل معلومات العمل</Dialog.Title>

          {updateProviderMutation.isPending && <div className="text-center text-blue-600 text-lg mb-4">جاري الحفظ...</div>}
          {formError && (
            <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg relative mb-4 text-sm sm:text-base text-right" role="alert">
              <span className="block">{formError}</span>
            </div>
          )}
          {formSuccess && (
            <div className="bg-green-50 border border-green-300 text-green-700 px-4 py-3 rounded-lg relative mb-4 text-sm sm:text-base text-right" role="alert">
              <span className="block">{formSuccess}</span>
            </div>
          )}

          <form onSubmit={handleProviderEditSubmit} className="space-y-4">
            <div>
              <label htmlFor="editBusinessName" className="block text-sm sm:text-base font-medium text-gray-700 text-right mb-1">اسم العمل:</label>
              <input
                id="editBusinessName"
                name="businessName"
                type="text"
                value={providerEditFormData.businessName}
                onChange={(e) => setProviderEditFormData({...providerEditFormData, businessName: e.target.value})}
                className="w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500 text-right text-base placeholder-gray-400"
                required
              />
            </div>
            <div>
              <label htmlFor="editCategory" className="block text-sm sm:text-base font-medium text-gray-700 text-right mb-1">التصنيف:</label>
              {/* Using CustomSelect for Category in the modal */}
              <CustomSelect
                label="التصنيف"
                options={allCategories}
                value={providerEditFormData.category}
                onChange={(value) => setProviderEditFormData({...providerEditFormData, category: value as string})}
                className="w-full"
                containerClasses="rounded-md shadow-sm border border-gray-300 focus-within:ring-blue-500 focus-within:border-blue-500"
                selectClasses="py-3 px-3 text-base text-gray-900 focus:outline-none"
                placeholder="اختر فئة الخدمة"
              />
            </div>
            <div>
              <label htmlFor="editDescription" className="block text-sm sm:text-base font-medium text-gray-700 text-right mb-1">الوصف:</label>
              <textarea
                id="editDescription"
                name="description"
                value={providerEditFormData.description}
                onChange={(e) => setProviderEditFormData({...providerEditFormData, description: e.target.value})}
                rows={4}
                className="w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500 text-right text-base placeholder-gray-400 resize-y"
              ></textarea>
            </div>
            <div>
              <label htmlFor="editLocationAddress" className="block text-sm sm:text-base font-medium text-gray-700 text-right mb-1">العنوان:</label>
              <input
                id="editLocationAddress"
                name="locationAddress"
                type="text"
                value={providerEditFormData.locationAddress}
                onChange={(e) => setProviderEditFormData({...providerEditFormData, locationAddress: e.target.value})}
                className="w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500 text-right text-base placeholder-gray-400"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed text-base font-semibold"
              disabled={updateProviderMutation.isPending}
            >
              {updateProviderMutation.isPending ? 'جاري الحفظ...' : 'حفظ التغييرات'}
            </button>
          </form>
        </Dialog.Panel>
      </Dialog>

      {/* Add Service Modal */}
      <Dialog open={showAddServiceModal} onClose={() => setShowAddServiceModal(false)} className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <div className="fixed inset-0 bg-black bg-opacity-60" aria-hidden="true" />
        <Dialog.Panel className="relative bg-white rounded-xl shadow-2xl p-6 sm:p-8 w-full max-w-lg mx-auto animate-fade-in-scale">
          <button
            onClick={() => setShowAddServiceModal(false)}
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-3xl transition"
            aria-label="إغلاق"
          >
            &times;
          </button>
          <Dialog.Title className="text-xl sm:text-2xl font-bold text-gray-800 mb-6 text-center">إضافة خدمة جديدة</Dialog.Title>

          {addServiceMutation.isPending && <div className="text-center text-blue-600 text-lg mb-4">جاري الإضافة...</div>}
          {formError && (
            <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg relative mb-4 text-sm sm:text-base text-right" role="alert">
              <span className="block">{formError}</span>
            </div>
          )}
          {formSuccess && (
            <div className="bg-green-50 border border-green-300 text-green-700 px-4 py-3 rounded-lg relative mb-4 text-sm sm:text-base text-right" role="alert">
              <span className="block">{formSuccess}</span>
            </div>
          )}

          <form onSubmit={handleAddServiceSubmit} className="space-y-4">
            <div>
              <label htmlFor="addServiceName" className="block text-sm sm:text-base font-medium text-gray-700 text-right mb-1">اسم الخدمة:</label>
              <input
                id="addServiceName"
                name="name"
                type="text"
                value={addServiceFormData.name}
                onChange={(e) => setAddServiceFormData({...addServiceFormData, name: e.target.value})}
                className="w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500 text-right text-base placeholder-gray-400"
                placeholder="مثال: قص شعر رجالي"
                required
              />
            </div>
            <div>
              <label htmlFor="addServicePrice" className="block text-sm sm:text-base font-medium text-gray-700 text-right mb-1">السعر (ل.س):</label>
              <input
                id="addServicePrice"
                name="price"
                type="number"
                value={addServiceFormData.price === 0 ? '' : addServiceFormData.price}
                onChange={(e) => setAddServiceFormData({...addServiceFormData, price: parseFloat(e.target.value) || 0})}
                className="w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500 text-right text-base placeholder-gray-400"
                placeholder="5000"
                required
                min="0"
              />
            </div>
            <div>
              <label htmlFor="addServiceDuration" className="block text-sm sm:text-base font-medium text-gray-700 text-right mb-1">المدة (دقائق):</label>
              <input
                id="addServiceDuration"
                name="duration"
                type="number"
                value={addServiceFormData.duration === 0 ? '' : addServiceFormData.duration}
                onChange={(e) => setAddServiceFormData({...addServiceFormData, duration: parseInt(e.target.value) || 0})}
                className="w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500 text-right text-base placeholder-gray-400"
                placeholder="60"
                required
                min="1"
              />
            </div>
            <div>
              <label htmlFor="addServiceDescription" className="block text-sm sm:text-base font-medium text-gray-700 text-right mb-1">الوصف (اختياري):</label>
              <textarea
                id="addServiceDescription"
                name="description"
                value={addServiceFormData.description}
                onChange={(e) => setAddServiceFormData({...addServiceFormData, description: e.target.value})}
                rows={4}
                className="w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500 text-right text-base placeholder-gray-400 resize-y"
                placeholder="وصف تفصيلي للخدمة"
              ></textarea>
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed text-base font-semibold"
              disabled={addServiceMutation.isPending}
            >
              {addServiceMutation.isPending ? 'جاري الإضافة...' : 'حفظ الخدمة'}
            </button>
          </form>
        </Dialog.Panel>
      </Dialog>

      {/* Edit Service Modal */}
      <Dialog open={showEditServiceModal} onClose={() => setShowEditServiceModal(false)} className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <div className="fixed inset-0 bg-black bg-opacity-60" aria-hidden="true" />
        <Dialog.Panel className="relative bg-white rounded-xl shadow-2xl p-6 sm:p-8 w-full max-w-lg mx-auto animate-fade-in-scale">
          <button
            onClick={() => setShowEditServiceModal(false)}
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-3xl transition"
            aria-label="إغلاق"
          >
            &times;
          </button>
          <Dialog.Title className="text-xl sm:text-2xl font-bold text-gray-800 mb-6 text-center">تعديل الخدمة</Dialog.Title>

          {updateServiceMutation.isPending && <div className="text-center text-blue-600 text-lg mb-4">جاري الحفظ...</div>}
          {formError && (
            <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg relative mb-4 text-sm sm:text-base text-right" role="alert">
              <span className="block">{formError}</span>
            </div>
          )}
          {formSuccess && (
            <div className="bg-green-50 border border-green-300 text-green-700 px-4 py-3 rounded-lg relative mb-4 text-sm sm:text-base text-right" role="alert">
              <span className="block">{formSuccess}</span>
            </div>
          )}

          <form onSubmit={handleEditServiceSubmit} className="space-y-4">
            <div>
              <label htmlFor="editServiceName" className="block text-sm sm:text-base font-medium text-gray-700 text-right mb-1">اسم الخدمة:</label>
              <input
                id="editServiceName"
                name="name"
                type="text"
                value={editServiceFormData.name}
                onChange={(e) => setEditServiceFormData({...editServiceFormData, name: e.target.value})}
                className="w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500 text-right text-base placeholder-gray-400"
                required
              />
            </div>
            <div>
              <label htmlFor="editServicePrice" className="block text-sm sm:text-base font-medium text-gray-700 text-right mb-1">السعر (ل.س):</label>
              <input
                id="editServicePrice"
                name="price"
                type="number"
                value={editServiceFormData.price === 0 ? '' : editServiceFormData.price}
                onChange={(e) => setEditServiceFormData({...editServiceFormData, price: parseFloat(e.target.value) || 0})}
                className="w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500 text-right text-base placeholder-gray-400"
                required
                min="0"
              />
            </div>
            <div>
              <label htmlFor="editServiceDuration" className="block text-sm sm:text-base font-medium text-gray-700 text-right mb-1">المدة (دقائق):</label>
              <input
                id="editServiceDuration"
                name="duration"
                type="number"
                value={editServiceFormData.duration === 0 ? '' : editServiceFormData.duration}
                onChange={(e) => setEditServiceFormData({...editServiceFormData, duration: parseInt(e.target.value) || 0})}
                className="w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500 text-right text-base placeholder-gray-400"
                required
                min="1"
              />
            </div>
            <div>
              <label htmlFor="editServiceDescription" className="block text-sm sm:text-base font-medium text-gray-700 text-right mb-1">الوصف (اختياري):</label>
              <textarea
                id="editServiceDescription"
                name="description"
                value={editServiceFormData.description}
                onChange={(e) => setEditServiceFormData({...editServiceFormData, description: e.target.value})}
                rows={4}
                className="w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500 text-right text-base placeholder-gray-400 resize-y"
              ></textarea>
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed text-base font-semibold"
              disabled={updateServiceMutation.isPending}
            >
              {updateServiceMutation.isPending ? 'جاري الحفظ...' : 'حفظ التغييرات'}
            </button>
          </form>
        </Dialog.Panel>
      </Dialog>

      {/* Edit Working Hours Modal */}
      <Dialog open={showEditWorkingHoursModal} onClose={() => setShowEditWorkingHoursModal(false)} className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <div className="fixed inset-0 bg-black bg-opacity-60" aria-hidden="true" />
        <Dialog.Panel className="relative bg-white rounded-xl shadow-2xl p-6 sm:p-8 w-full max-w-lg mx-auto animate-fade-in-scale">
          <button
            onClick={() => setShowEditWorkingHoursModal(false)}
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-3xl transition"
            aria-label="إغلاق"
          >
            &times;
          </button>
          <Dialog.Title className="text-xl sm:text-2xl font-bold text-gray-800 mb-6 text-center">تعديل ساعات العمل</Dialog.Title>

          {updateWorkingHoursMutation.isPending && <div className="text-center text-blue-600 text-lg mb-4">جاري الحفظ...</div>}
          {formError && (
            <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg relative mb-4 text-sm sm:text-base text-right" role="alert">
              <span className="block">{formError}</span>
            </div>
          )}
          {formSuccess && (
            <div className="bg-green-50 border border-green-300 text-green-700 px-4 py-3 rounded-lg relative mb-4 text-sm sm:text-base text-right" role="alert">
              <span className="block">{formSuccess}</span>
            </div>
          )}

          <form onSubmit={handleWorkingHoursSubmit} className="space-y-4">
            {workingHoursFormData.map((dayHour) => (
              <div key={dayHour.day} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-gray-50 rounded-md border border-gray-200">
                <div className="flex items-center mb-2 sm:mb-0">
                  <span className="font-semibold text-gray-800 text-base sm:text-lg rtl:ml-4 ltr:mr-4 w-24 text-right">
                    {arabicDays[dayHour.day]}:
                  </span>
                  <label htmlFor={`toggle-day-${dayHour.day}`} className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      id={`toggle-day-${dayHour.day}`}
                      className="sr-only peer"
                      checked={dayHour.isOpen}
                      onChange={(e) => handleWorkingHoursChange(dayHour.day, 'isOpen', e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border after:border-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    <span className="rtl:mr-3 ltr:ml-3 text-sm font-medium text-gray-900">
                      {dayHour.isOpen ? 'مفتوح' : 'مغلق'}
                    </span>
                  </label>
                </div>

                {dayHour.isOpen && (
                  <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                    <CustomSelect
                      label={`بداية دوام ${arabicDays[dayHour.day]}`}
                      options={timeOptions}
                      value={dayHour.start}
                      onChange={(value) => handleWorkingHoursChange(dayHour.day, 'start', value as string)}
                      className="flex-1"
                      containerClasses="rounded-md shadow-sm border border-gray-300 focus-within:ring-blue-500 focus-within:border-blue-500"
                      selectClasses="py-2.5 px-2 text-sm sm:text-base text-gray-900 focus:outline-none"
                    />
                    <CustomSelect
                      label={`نهاية دوام ${arabicDays[dayHour.day]}`}
                      options={timeOptions}
                      value={dayHour.end}
                      onChange={(value) => handleWorkingHoursChange(dayHour.day, 'end', value as string)}
                      className="flex-1"
                      containerClasses="rounded-md shadow-sm border border-gray-300 focus-within:ring-blue-500 focus-within:border-blue-500"
                      selectClasses="py-2.5 px-2 text-sm sm:text-base text-gray-900 focus:outline-none"
                    />
                  </div>
                )}
              </div>
            ))}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed text-base font-semibold"
              disabled={updateWorkingHoursMutation.isPending}
            >
              {updateWorkingHoursMutation.isPending ? 'جاري الحفظ...' : 'حفظ ساعات العمل'}
            </button>
          </form>
        </Dialog.Panel>
      </Dialog>
    </div>
  );
}
