'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appointments } from '../../lib/api';
import { Dialog } from '@headlessui/react'; // For the modal

export default function ProfilePage() {
  const { user, isLoading: userLoading, updateProfile } = useAuth();
  const queryClient = useQueryClient(); // Get query client for mutation success handling

  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '', // Password field is typically separate for security
  });
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState('');

  // Update form data if user prop changes (e.g., after initial load or successful update)
  useEffect(() => {
    if (user) {
      setEditFormData((prev) => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
      }));
    }
  }, [user]);

  // Fetch appointments for the logged-in user
  const { data: userAppointments, isLoading: appointmentsLoading } = useQuery({
    queryKey: ['userAppointments', user?._id], // Key includes user ID to refetch if user changes
    queryFn: async () => {
      const res = await appointments.getAll(); // This should be getCustomerAppointments
      return res.data;
    },
    enabled: typeof window !== 'undefined' && !!user, // Only run if in browser and user is available
  });

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditFormData({
      ...editFormData,
      [e.target.name]: e.target.value,
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError('');
    setEditSuccess('');

    try {
      await updateProfile(editFormData); // Call the updateProfile mutation
      setEditSuccess('تم تحديث الملف الشخصي بنجاح!');
      setShowEditModal(false); // Close modal on success
      // Invalidate queries to ensure fresh data in other parts of the app
      queryClient.invalidateQueries({ queryKey: ['user'] });
    } catch (err: any) {
      setEditError(err.response?.data?.message || 'فشل تحديث الملف الشخصي');
      console.error('Profile update error:', err);
    }
  };


  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-20">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-primary-600 border-opacity-50 mb-6"></div>
          <p className="text-gray-700">جاري تحميل الملف الشخصي...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-20">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-red-600 mb-4">خطأ</h2>
          <p className="text-gray-700">لم يتم العثور على معلومات المستخدم. يرجى تسجيل الدخول.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 pt-24 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">ملفك الشخصي</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* User Info Card */}
        <section className="bg-white rounded-lg shadow-md p-6 border-t-4 border-primary-600">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-gray-700">معلومات الحساب</h2>
            <button
              onClick={() => setShowEditModal(true)}
              className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition"
            >
              تعديل الملف
            </button>
          </div>
          <div className="space-y-3 text-gray-800">
            <p className="flex items-center">
              <span className="font-semibold w-24 text-right mr-4">الاسم:</span>
              <span className="flex-1">{user.name}</span>
            </p>
            <p className="flex items-center">
              <span className="font-semibold w-24 text-right mr-4">رقم الهاتف:</span>
              <span className="flex-1">{user.phone}</span>
            </p>
            <p className="flex items-center">
              <span className="font-semibold w-24 text-right mr-4">البريد الإلكتروني:</span>
              <span className="flex-1">{user.email || 'غير متوفر'}</span>
            </p>
            <p className="flex items-center">
              <span className="font-semibold w-24 text-right mr-4">الدور:</span>
              <span className="flex-1">{user.role === 'provider' ? 'مقدم خدمة' : 'عميل'}</span>
            </p>
          </div>
        </section>

        {/* Appointments Section */}
        <section className="bg-white rounded-lg shadow-md p-6 border-t-4 border-secondary-500">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">مواعيدي القادمة</h2>
          {appointmentsLoading ? (
            <div className="text-center text-gray-600">جاري تحميل المواعيد...</div>
          ) : userAppointments && userAppointments.length > 0 ? (
            <div className="space-y-4">
              {userAppointments.map((apt: any) => (
                <div key={apt._id} className="bg-gray-50 p-4 rounded-md border border-gray-200 shadow-sm">
                  <p className="font-semibold text-gray-800 mb-1">الخدمة: {apt.service?.name}</p>
                  <p className="text-sm text-gray-600 mb-1">المقدم: {apt.serviceProvider?.businessName || 'N/A'}</p>
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
                  {/* Add action buttons like "View Details", "Cancel" etc. here if needed */}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-600 p-4 border rounded-md bg-gray-50">
              <p>لا يوجد لديك مواعيد حالياً.</p>
              {user.role === 'customer' && (
                <button onClick={() => router.push('/providers')} className="mt-4 text-primary-600 hover:underline">
                  ابحث عن مقدمي خدمات لحجز موعد
                </button>
              )}
            </div>
          )}
        </section>
      </div>

      {/* Edit Profile Modal */}
      <Dialog open={showEditModal} onClose={() => setShowEditModal(false)} className="fixed z-50 inset-0 flex items-center justify-center">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <Dialog.Panel className="relative bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-auto">
          <button
            onClick={() => setShowEditModal(false)}
            className="absolute top-4 left-4 text-gray-400 hover:text-red-600 text-2xl font-bold focus:outline-none"
            aria-label="إغلاق"
          >
            ×
          </button>
          <Dialog.Title className="text-2xl font-bold text-gray-800 mb-6 text-center">تعديل الملف الشخصي</Dialog.Title>
          {editError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <span className="block sm:inline">{editError}</span>
            </div>
          )}
          {editSuccess && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
              <span className="block sm:inline">{editSuccess}</span>
            </div>
          )}
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 text-right mb-1">الاسم:</label>
              <input
                id="name"
                name="name"
                type="text"
                value={editFormData.name}
                onChange={handleEditChange}
                className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-primary-500 focus:border-primary-500 text-right"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 text-right mb-1">البريد الإلكتروني:</label>
              <input
                id="email"
                name="email"
                type="email"
                value={editFormData.email}
                onChange={handleEditChange}
                className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-primary-500 focus:border-primary-500 text-right"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 text-right mb-1">كلمة المرور الجديدة (اختياري):</label>
              <input
                id="password"
                name="password"
                type="password"
                value={editFormData.password}
                onChange={handleEditChange}
                placeholder="اترك فارغاً لعدم التغيير"
                className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-primary-500 focus:border-primary-500 text-right"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 transition"
            >
              حفظ التغييرات
            </button>
          </form>
        </Dialog.Panel>
      </Dialog>
    </div>
  );
}