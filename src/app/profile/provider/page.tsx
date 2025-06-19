'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { providers, appointments } from '../../../lib/api';
import { Dialog } from '@headlessui/react';
import CustomSelect from '../../../components/CustomSelect'; // Import CustomSelect

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
  description?: string;
}

interface IWorkingHours {
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  open: string; // HH:mm format
  close: string; // HH:mm format
  isClosed: boolean;
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

export default function ProviderProfilePage() {
  const { user, isLoading: userLoading } = useAuth();
  const queryClient = useQueryClient();

  const [showEditProviderModal, setShowEditProviderModal] = useState(false);
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const [showEditServiceModal, setShowEditServiceModal] = useState(false);
  const [selectedService, setSelectedService] = useState<IService | null>(null);

  const [providerEditFormData, setProviderEditFormData] = useState({
    businessName: '',
    category: '',
    description: '',
    locationAddress: '',
    locationCoordinates: [] as [number, number],
  });
  const [addServiceFormData, setAddServiceFormData] = useState<IService>({ name: '', duration: 0, price: 0, description: '' });
  const [editServiceFormData, setEditServiceFormData] = useState<IService>({ name: '', duration: 0, price: 0, description: '' });

  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  const { data: providerData, isLoading: providerLoading, error: providerError, refetch: refetchProvider } = useQuery<IProviderData | null>({
    queryKey: ['provider-profile'],
    queryFn: async () => {
      if (!user || user.role !== 'provider') return null;
      try {
        const res = await providers.getProfile();
        return res.data;
      } catch (err) {
        console.error("Failed to fetch provider profile:", err);
        return null;
      }
    },
    enabled: typeof window !== 'undefined' && !!user && user.role === 'provider',
    staleTime: 5 * 60 * 1000,
  });

  const { data: appointmentsData, isLoading: appointmentsLoading, error: appointmentsError } = useQuery({
    queryKey: ['provider-appointments'],
    queryFn: async () => {
      const res = await appointments.getProviderAppointments();
      return res.data;
    },
    enabled: typeof window !== 'undefined' && !!user && user.role === 'provider',
    staleTime: 60 * 1000,
  });

  const updateProviderMutation = useMutation({
    mutationFn: providers.update, // Make sure providers.update expects (id: string, data: any) or just (data: any) if it updates logged-in provider
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider-profile'] });
      setFormSuccess('تم تحديث معلومات مقدم الخدمة بنجاح!');
      setShowEditProviderModal(false);
      refetchProvider();
    },
    onError: (err: any) => { // Use 'any' for error type or specific AxiosError
      setFormError(err.response?.data?.message || 'فشل تحديث معلومات مقدم الخدمة');
    }
  });

  const addServiceMutation = useMutation({
    mutationFn: providers.addService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider-profile'] });
      setFormSuccess('تمت إضافة الخدمة بنجاح!');
      setShowAddServiceModal(false);
      setAddServiceFormData({ name: '', duration: 0, price: 0, description: '' });
    },
    onError: (err: any) => { // Use 'any' for error type
      setFormError(err.response?.data?.message || 'فشل إضافة الخدمة');
    }
  });

  const updateServiceMutation = useMutation({
    mutationFn: (data: { serviceId: string, serviceData: Partial<IService> }) =>
      providers.updateService(data.serviceId, data.serviceData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider-profile'] });
      setFormSuccess('تم تحديث الخدمة بنجاح!');
      setShowEditServiceModal(false);
      setSelectedService(null);
    },
    onError: (err: any) => { // Use 'any' for error type
      setFormError(err.response?.data?.message || 'فشل تحديث الخدمة');
    }
  });

  const deleteServiceMutation = useMutation({
    mutationFn: providers.deleteService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider-profile'] });
      setFormSuccess('تم حذف الخدمة بنجاح!');
    },
    onError: (err: any) => { // Use 'any' for error type
      setFormError(err.response?.data?.message || 'فشل حذف الخدمة');
    }
  });

  const updateAppointmentStatusMutation = useMutation({
    mutationFn: (data: { appointmentId: string; status: string }) =>
      appointments.updateStatus(data.appointmentId, data.status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider-appointments'] });
      setFormSuccess('تم تحديث حالة الموعد بنجاح!');
    },
    onError: (err: any) => { // Use 'any' for error type
      setFormError(err.response?.data?.message || 'فشل تحديث حالة الموعد');
    }
  });

  useEffect(() => {
    if (providerData) {
      setProviderEditFormData({
        businessName: providerData.businessName,
        category: providerData.category,
        description: providerData.description,
        locationAddress: providerData.location?.address || '',
        locationCoordinates: providerData.location?.coordinates || [0, 0],
      });
    }
  }, [providerData]);

  useEffect(() => {
    if (selectedService) {
      setEditServiceFormData({
        name: selectedService.name,
        duration: selectedService.duration,
        price: selectedService.price,
        description: selectedService.description,
        _id: selectedService._id
      });
    }
  }, [selectedService]);

  const handleProviderEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    if (!providerData?._id) {
        setFormError("معلومات مقدم الخدمة غير متوفرة للتحديث.");
        return;
    }
    try {
        await updateProviderMutation.mutateAsync({
            id: providerData._id, // Pass providerData._id explicitly if your backend's providers.update expects (id, data)
            data: {
              businessName: providerEditFormData.businessName,
              category: providerEditFormData.category,
              description: providerEditFormData.description,
              location: {
                  type: 'Point',
                  coordinates: providerEditFormData.locationCoordinates,
                  address: providerEditFormData.locationAddress,
              },
            }
        });
    } catch (err: any) {
        setFormError(err.response?.data?.message || 'فشل تحديث معلومات مقدم الخدمة');
    }
  };

  const handleAddServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    try {
      await addServiceMutation.mutateAsync(addServiceFormData);
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'فشل إضافة الخدمة');
    }
  };

  const handleEditServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    if (!selectedService?._id) {
      setFormError("الخدمة غير محددة للتحديث.");
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

  const handleDeleteService = async (serviceId: string) => {
    setFormError('');
    setFormSuccess('');
    if (!window.confirm('هل أنت متأكد أنك تريد حذف هذه الخدمة؟')) return;
    try {
      await deleteServiceMutation.mutateAsync(serviceId);
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'فشل حذف الخدمة');
    }
  };

  const handleUpdateAppointmentStatus = async (appointmentId: string, status: string) => {
    setFormError('');
    setFormSuccess('');
    try {
      await updateAppointmentStatusMutation.mutateAsync({ appointmentId, status });
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'فشل تحديث حالة الموعد');
    }
  };

  if (userLoading || providerLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-20">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-primary-600 border-opacity-50 mb-6"></div>
          <p className="text-gray-700">جاري تحميل ملف مقدم الخدمة...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'provider') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-20">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-red-600 mb-4">خطأ في الوصول</h2>
          <p className="text-gray-700">هذه الصفحة مخصصة لمقدمي الخدمات فقط.</p>
        </div>
      </div>
    );
  }

  if (providerError || !providerData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-20">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-red-600 mb-4">خطأ في تحميل البيانات</h2>
          <p className="text-gray-700">فشل تحميل ملف مقدم الخدمة. يرجى التأكد من أنك سجلت كمقدم خدمة.</p>
          <button onClick={() => router.push('/auth/register-provider')} className="mt-4 bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700">
            إنشاء ملف مقدم خدمة
          </button>
        </div>
      </div>
    );
  }

  const categoryOptions = allCategories.map(cat => ({ value: cat, label: cat }));

  return (
    <div className="container mx-auto p-8 pt-24 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">ملف مقدم الخدمة الخاص بك</h1>

      {formError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{formError}</span>
        </div>
      )}
      {formSuccess && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{formSuccess}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Provider Info Card */}
        <section className="bg-white rounded-lg shadow-md p-6 border-t-4 border-primary-600">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-gray-700">معلومات العمل</h2>
            <button
              onClick={() => setShowEditProviderModal(true)}
              className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition"
            >
              تعديل الملف
            </button>
          </div>
          <div className="space-y-3 text-gray-800">
            <p className="flex items-center">
              <span className="font-semibold w-32 text-right mr-4">اسم العمل:</span>
              <span className="flex-1">{providerData.businessName}</span>
            </p>
            <p className="flex items-center">
              <span className="font-semibold w-32 text-right mr-4">التصنيف:</span>
              <span className="flex-1">{providerData.category}</span>
            </p>
            <p className="flex items-center">
              <span className="font-semibold w-32 text-right mr-4">الوصف:</span>
              <span className="flex-1">{providerData.description}</span>
            </p>
            <p className="flex items-center">
              <span className="font-semibold w-32 text-right mr-4">العنوان:</span>
              <span className="flex-1">{providerData.location?.address || 'غير محدد'}</span>
            </p>
            <p className="flex items-center">
              <span className="font-semibold w-32 text-right mr-4">التقييم:</span>
              <span className="flex-1">{providerData.rating?.toFixed(2) || 'جديد'} ⭐ ({providerData.totalRatings} تقييم)</span>
            </p>
          </div>
        </section>

        {/* Services Management Section */}
        <section className="bg-white rounded-lg shadow-md p-6 border-t-4 border-primary-600">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-gray-700">الخدمات</h2>
            <button
              onClick={() => {
                setFormError('');
                setFormSuccess('');
                setShowAddServiceModal(true);
              }}
              className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition"
            >
              إضافة خدمة
            </button>
          </div>
          {providerLoading ? (
            <div className="text-center text-gray-600">جاري تحميل الخدمات...</div>
          ) : providerData.services && providerData.services.length > 0 ? (
            <div className="space-y-4">
              {providerData.services.map((service) => (
                <div key={service._id} className="bg-gray-50 p-4 rounded-md border border-gray-200 shadow-sm flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-gray-800">{service.name}</p>
                    <p className="text-sm text-gray-600">المدة: {service.duration} دقيقة | السعر: {service.price} ل.س</p>
                    <p className="text-sm text-gray-500">{service.description}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setSelectedService(service);
                        setEditServiceFormData({ ...service }); // Initialize edit form with service data
                        setFormError('');
                        setFormSuccess('');
                        setShowEditServiceModal(true);
                      }}
                      className="text-primary-600 hover:text-primary-800 text-sm"
                    >
                      تعديل
                    </button>
                    <button
                      onClick={() => handleDeleteService(service._id!)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      حذف
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-600 p-4 border rounded-md bg-gray-50">
              <p>لا يوجد خدمات مسجلة بعد.</p>
            </div>
          )}
        </section>

        {/* Working Hours Section (Simplified for now) */}
        <section className="bg-white rounded-lg shadow-md p-6 border-t-4 border-secondary-500">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-gray-700">ساعات العمل</h2>
            <button
              // onClick={() => setShowEditWorkingHoursModal(true)} // Implement this modal later
              className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition opacity-50 cursor-not-allowed"
              disabled // Disable for now
            >
              تعديل الساعات
            </button>
          </div>
          {providerData.workingHours && providerData.workingHours.length > 0 ? (
            <div className="space-y-2 text-gray-800">
              {providerData.workingHours.map((wh, idx) => (
                <p key={idx} className="flex justify-between items-center">
                  <span className="font-semibold">
                    {wh.day === 'monday' && 'الاثنين'}
                    {wh.day === 'tuesday' && 'الثلاثاء'}
                    {wh.day === 'wednesday' && 'الأربعاء'}
                    {wh.day === 'thursday' && 'الخميس'}
                    {wh.day === 'friday' && 'الجمعة'}
                    {wh.day === 'saturday' && 'السبت'}
                    {wh.day === 'sunday' && 'الأحد'}
                  </span>
                  <span>{wh.isClosed ? 'مغلق' : `${wh.open} - ${wh.close}`}</span>
                </p>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-600 p-4 border rounded-md bg-gray-50">
              <p>ساعات العمل غير محددة بعد.</p>
            </div>
          )}
        </section>

        {/* Provider Appointments Section */}
        <section className="bg-white rounded-lg shadow-md p-6 border-t-4 border-secondary-500">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">مواعيد العملاء</h2>
          {appointmentsLoading ? (
            <div className="text-center text-gray-600">جاري تحميل المواعيد...</div>
          ) : appointmentsData && appointmentsData.length > 0 ? (
            <div className="space-y-4">
              {appointmentsData.map((apt: any) => (
                <div key={apt._id} className="bg-gray-50 p-4 rounded-md border border-gray-200 shadow-sm">
                  <p className="font-semibold text-gray-800 mb-1">العميل: {apt.customer?.name || 'N/A'}</p>
                  <p className="text-sm text-gray-600 mb-1">الخدمة: {apt.service?.name}</p>
                  <p className="text-sm text-gray-600 mb-1">
                    التاريخ: {new Date(apt.dateTime).toLocaleString('ar-SY', { dateStyle: 'full', timeStyle: 'short' })}
                  </p>
                  <p className={`text-sm font-medium ${
                    apt.status === 'confirmed' ? 'text-green-600' :
                    apt.status === 'pending' ? 'text-yellow-600' :
                    apt.status === 'cancelled' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    الحالة: {apt.status === 'pending' ? 'معلق' : apt.status === 'confirmed' ? 'مؤكد' : apt.status === 'cancelled' ? 'ملغى' : 'مكتمل'}
                  </p>
                  <div className="mt-3 flex gap-2">
                    {apt.status === 'pending' && (
                      <button onClick={() => handleUpdateAppointmentStatus(apt._id, 'confirmed')} className="bg-green-500 text-white px-3 py-1 text-sm rounded hover:bg-green-600">
                        تأكيد
                      </button>
                    )}
                    {(apt.status === 'pending' || apt.status === 'confirmed') && (
                      <button onClick={() => handleUpdateAppointmentStatus(apt._id, 'cancelled')} className="bg-red-500 text-white px-3 py-1 text-sm rounded hover:bg-red-600">
                        إلغاء
                      </button>
                    )}
                    {apt.status === 'confirmed' && (
                      <button onClick={() => handleUpdateAppointmentStatus(apt._id, 'completed')} className="bg-blue-500 text-white px-3 py-1 text-sm rounded hover:bg-blue-600">
                        إتمام
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-600 p-4 border rounded-md bg-gray-50">
              <p>لا يوجد لديك مواعيد عملاء حالياً.</p>
            </div>
          )}
        </section>
      </div>

      {/* Edit Provider Profile Modal */}
      <Dialog open={showEditProviderModal} onClose={() => setShowEditProviderModal(false)} className="fixed z-50 inset-0 flex items-center justify-center">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <Dialog.Panel className="relative bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-auto">
          <button
            onClick={() => setShowEditProviderModal(false)}
            className="absolute top-4 left-4 text-gray-400 hover:text-red-600 text-2xl font-bold focus:outline-none"
            aria-label="إغلاق"
          >
            ×
          </button>
          <Dialog.Title className="text-2xl font-bold text-gray-800 mb-6 text-center">تعديل معلومات العمل</Dialog.Title>
          {updateProviderMutation.isPending && <div className="text-center text-primary-600 mb-4">جاري الحفظ...</div>}
          {formError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <span className="block sm:inline">{formError}</span>
            </div>
          )}
          {formSuccess && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
              <span className="block sm:inline">{formSuccess}</span>
            </div>
          )}
          <form onSubmit={handleProviderEditSubmit} className="space-y-4">
            <div>
              <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 text-right mb-1">اسم العمل:</label>
              <input
                id="businessName"
                name="businessName"
                type="text"
                value={providerEditFormData.businessName}
                onChange={(e) => setProviderEditFormData({...providerEditFormData, businessName: e.target.value})}
                className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-primary-500 focus:border-primary-500 text-right"
              />
            </div>
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 text-right mb-1">التصنيف:</label>
              <select
                id="category"
                name="category"
                value={providerEditFormData.category}
                onChange={(e) => setProviderEditFormData({...providerEditFormData, category: e.target.value})}
                className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-primary-500 focus:border-primary-500 text-right bg-white"
              >
                {allCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 text-right mb-1">الوصف:</label>
              <textarea
                id="description"
                name="description"
                value={providerEditFormData.description}
                onChange={(e) => setProviderEditFormData({...providerEditFormData, description: e.target.value})}
                rows={3}
                className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-primary-500 focus:border-primary-500 text-right"
              ></textarea>
            </div>
            <div>
              <label htmlFor="locationAddress" className="block text-sm font-medium text-gray-700 text-right mb-1">العنوان:</label>
              <input
                id="locationAddress"
                name="locationAddress"
                type="text"
                value={providerEditFormData.locationAddress}
                onChange={(e) => setProviderEditFormData({...providerEditFormData, locationAddress: e.target.value})}
                className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-primary-500 focus:border-primary-500 text-right"
              />
            </div>
            {/* Coordinates field might be hidden or auto-filled via map integration later */}
            <button
              type="submit"
              className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 transition"
              disabled={updateProviderMutation.isPending}
            >
              حفظ التغييرات
            </button>
          </form>
        </Dialog.Panel>
      </Dialog>

      {/* Add Service Modal */}
      <Dialog open={showAddServiceModal} onClose={() => setShowAddServiceModal(false)} className="fixed z-50 inset-0 flex items-center justify-center">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <Dialog.Panel className="relative bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-auto">
          <button
            onClick={() => setShowAddServiceModal(false)}
            className="absolute top-4 left-4 text-gray-400 hover:text-red-600 text-2xl font-bold focus:outline-none"
            aria-label="إغلاق"
          >
            ×
          </button>
          <Dialog.Title className="text-2xl font-bold text-gray-800 mb-6 text-center">إضافة خدمة جديدة</Dialog.Title>
          {addServiceMutation.isPending && <div className="text-center text-primary-600 mb-4">جاري الإضافة...</div>}
          {formError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <span className="block sm:inline">{formError}</span>
            </div>
          )}
          {formSuccess && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
              <span className="block sm:inline">{formSuccess}</span>
            </div>
          )}
          <form onSubmit={handleAddServiceSubmit} className="space-y-4">
            <div>
              <label htmlFor="serviceName" className="block text-sm font-medium text-gray-700 text-right mb-1">اسم الخدمة:</label>
              <input
                id="serviceName"
                name="name"
                type="text"
                value={addServiceFormData.name}
                onChange={(e) => setAddServiceFormData({...addServiceFormData, name: e.target.value})}
                className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-primary-500 focus:border-primary-500 text-right"
                required
              />
            </div>
            <div>
              <label htmlFor="servicePrice" className="block text-sm font-medium text-gray-700 text-right mb-1">السعر (ل.س):</label>
              <input
                id="servicePrice"
                name="price"
                type="number"
                value={addServiceFormData.price}
                onChange={(e) => setAddServiceFormData({...addServiceFormData, price: parseFloat(e.target.value) || 0})}
                className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-primary-500 focus:border-primary-500 text-right"
                required
              />
            </div>
            <div>
              <label htmlFor="serviceDuration" className="block text-sm font-medium text-gray-700 text-right mb-1">المدة (دقائق):</label>
              <input
                id="serviceDuration"
                name="duration"
                type="number"
                value={addServiceFormData.duration}
                onChange={(e) => setAddServiceFormData({...addServiceFormData, duration: parseInt(e.target.value) || 0})}
                className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-primary-500 focus:border-primary-500 text-right"
                required
              />
            </div>
            <div>
              <label htmlFor="serviceDescription" className="block text-sm font-medium text-gray-700 text-right mb-1">الوصف (اختياري):</label>
              <textarea
                id="serviceDescription"
                name="description"
                value={addServiceFormData.description}
                onChange={(e) => setAddServiceFormData({...addServiceFormData, description: e.target.value})}
                rows={3}
                className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-primary-500 focus:border-primary-500 text-right"
              ></textarea>
            </div>
            <button
              type="submit"
              className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 transition"
              disabled={addServiceMutation.isPending}
            >
              حفظ الخدمة
            </button>
          </form>
        </Dialog.Panel>
      </Dialog>

      {/* Edit Service Modal */}
      <Dialog open={showEditServiceModal} onClose={() => setShowEditServiceModal(false)} className="fixed z-50 inset-0 flex items-center justify-center">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <Dialog.Panel className="relative bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-auto">
          <button
            onClick={() => setShowEditServiceModal(false)}
            className="absolute top-4 left-4 text-gray-400 hover:text-red-600 text-2xl font-bold focus:outline-none"
            aria-label="إغلاق"
          >
            ×
          </button>
          <Dialog.Title className="text-2xl font-bold text-gray-800 mb-6 text-center">تعديل الخدمة</Dialog.Title>
          {updateServiceMutation.isPending && <div className="text-center text-primary-600 mb-4">جاري الحفظ...</div>}
          {formError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <span className="block sm:inline">{formError}</span>
            </div>
          )}
          {formSuccess && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
              <span className="block sm:inline">{formSuccess}</span>
            </div>
          )}
          <form onSubmit={handleEditServiceSubmit} className="space-y-4">
            <div>
              <label htmlFor="editServiceName" className="block text-sm font-medium text-gray-700 text-right mb-1">اسم الخدمة:</label>
              <input
                id="editServiceName"
                name="name"
                type="text"
                value={editServiceFormData.name}
                onChange={(e) => setEditServiceFormData({...editServiceFormData, name: e.target.value})}
                className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-primary-500 focus:border-primary-500 text-right"
                required
              />
            </div>
            <div>
              <label htmlFor="editServicePrice" className="block text-sm font-medium text-gray-700 text-right mb-1">السعر (ل.س):</label>
              <input
                id="editServicePrice"
                name="price"
                type="number"
                value={editServiceFormData.price}
                onChange={(e) => setEditServiceFormData({...editServiceFormData, price: parseFloat(e.target.value) || 0})}
                className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-primary-500 focus:border-primary-500 text-right"
                required
              />
            </div>
            <div>
              <label htmlFor="editServiceDuration" className="block text-sm font-medium text-gray-700 text-right mb-1">المدة (دقائق):</label>
              <input
                id="editServiceDuration"
                name="duration"
                type="number"
                value={editServiceFormData.duration}
                onChange={(e) => setEditServiceFormData({...editServiceFormData, duration: parseInt(e.target.value) || 0})}
                className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-primary-500 focus:border-primary-500 text-right"
                required
              />
            </div>
            <div>
              <label htmlFor="editServiceDescription" className="block text-sm font-medium text-gray-700 text-right mb-1">الوصف (اختياري):</label>
              <textarea
                id="editServiceDescription"
                name="description"
                value={editServiceFormData.description}
                onChange={(e) => setEditServiceFormData({...editServiceFormData, description: e.target.value})}
                rows={3}
                className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-primary-500 focus:border-primary-500 text-right"
              ></textarea>
            </div>
            <button
              type="submit"
              className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 transition"
              disabled={updateServiceMutation.isPending}
            >
              حفظ التغييرات
            </button>
          </form>
        </Dialog.Panel>
      </Dialog>
    </div>
  );
}