'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth'; // Assuming useAuth hook path is correct
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appointments } from '../../lib/api'; // Assuming appointments API path is correct
import { Dialog } from '@headlessui/react'; // For the modal

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoading: userLoading, updateProfile } = useAuth(); // useAuth provides user data and updateProfile function
  const queryClient = useQueryClient(); // Get query client for cache invalidation

  // State for controlling the profile edit modal
  const [showEditModal, setShowEditModal] = useState(false);
  // Form data for profile editing, initialized with current user data
  const [editFormData, setEditFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '', // Password field is typically separate for security, sent only if changed
  });
  const [editError, setEditError] = useState('');     // Error message for profile edit form
  const [editSuccess, setEditSuccess] = useState(''); // Success message for profile edit form

  // Effect to update form data when the user object changes (e.g., on initial load or after successful update)
  useEffect(() => {
    if (user) {
      setEditFormData((prev) => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        // Do not pre-fill password for security
        password: '', // Ensure password field is reset/empty
      }));
    }
  }, [user]);

  // Fetch appointments for the logged-in user
  // Assuming appointments.getAll() fetches appointments specific to the logged-in customer.
  // If there's a getCustomerAppointments() in your API, that would be more specific.
  const { data: userAppointments, isLoading: appointmentsLoading } = useQuery({
    queryKey: ['userAppointments', user?._id], // Key includes user ID to refetch if user changes
    queryFn: async () => {
      const res = await appointments.getAll(); // Consider using appointments.getCustomerAppointments() if available
      return res.data;
    },
    // Only run this query if in a browser environment and user data is available
    enabled: typeof window !== 'undefined' && !!user,
    staleTime: 60 * 1000, // Data is fresh for 1 minute
    gcTime: 5 * 60 * 1000, // Data garbage collected after 5 minutes of inactivity
  });

  // Handler for changes in profile edit form inputs
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditFormData({
      ...editFormData,
      [e.target.name]: e.target.value,
    });
  };

  // Handler for submitting the profile edit form
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError('');     // Clear previous errors
    setEditSuccess('');   // Clear previous success messages

    try {
      // Call the updateProfile function from useAuth hook
      // Filter out empty password if user didn't change it
      const dataToUpdate = { ...editFormData };
      if (dataToUpdate.password === '') {
        delete dataToUpdate.password; // Don't send empty password
      }

      await updateProfile(dataToUpdate); // Pass the filtered data
      setEditSuccess('تم تحديث الملف الشخصي بنجاح!');
      setShowEditModal(false); // Close modal on success
      // Invalidate queries to ensure fresh user data in other parts of the app
      queryClient.invalidateQueries({ queryKey: ['user'] });
    } catch (err: any) {
      setEditError(err.response?.data?.message || 'فشل تحديث الملف الشخصي. يرجى المحاولة مرة أخرى.');
      console.error('Profile update error:', err);
    }
  };

  // --- Conditional Renderings for Loading, Error, Access Denied ---
  if (userLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 font-inter p-4">
        <div className="flex flex-col items-center p-8 bg-white rounded-xl shadow-2xl border-t-4 border-blue-600 max-w-sm w-full text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-blue-500 mb-6 border-opacity-75"></div>
          <p className="text-gray-700 text-lg">جاري تحميل الملف الشخصي...</p>
        </div>
      </div>
    );
  }

  // If no user is found after loading, redirect to login
  if (!user) {
    // This typically means the user is not authenticated or session expired.
    // The useAuth hook or a global redirect should handle sending them to login.
    // This fallback ensures a clear message if they somehow land here without a user.
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 font-inter p-4">
        <div className="text-center p-8 bg-white rounded-xl shadow-2xl border-t-4 border-red-600 max-w-sm w-full">
          <h2 className="text-2xl font-bold text-red-600 mb-4">خطأ في الوصول</h2>
          <p className="text-gray-700 text-lg">لم يتم العثور على معلومات المستخدم. يرجى تسجيل الدخول.</p>
          <button onClick={() => router.push('/auth/login')} className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition font-semibold">
            العودة لتسجيل الدخول
          </button>
        </div>
      </div>
    );
  }

  // Main Profile Page Content
  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 bg-gray-100 min-h-screen font-inter">
      <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-8 text-center">ملفك الشخصي</h1>

      {/* Global Form Feedback Messages (if any) */}
      {editError && (
        <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg relative mb-4 text-sm sm:text-base text-right" role="alert">
          <span className="block">{editError}</span>
        </div>
      )}
      {editSuccess && (
        <div className="bg-green-50 border border-green-300 text-green-700 px-4 py-3 rounded-lg relative mb-4 text-sm sm:text-base text-right" role="alert">
          <span className="block">{editSuccess}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* User Info Card */}
        <section className="bg-white rounded-xl shadow-lg p-6 sm:p-8 border-t-4 border-blue-600">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">معلومات الحساب</h2>
            <button
              onClick={() => {
                setShowEditModal(true);
                setEditError(''); setEditSuccess(''); // Clear feedback for modal
              }}
              className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 transition font-semibold text-sm sm:text-base"
            >
              تعديل الملف
            </button>
          </div>
          <div className="space-y-4 text-gray-800 text-right">
            <p className="flex flex-col sm:flex-row sm:items-center">
              <span className="font-semibold sm:w-32 sm:text-right sm:ml-4 text-gray-700">الاسم:</span>
              <span className="flex-1 text-base">{user.name}</span>
            </p>
            <p className="flex flex-col sm:flex-row sm:items-center">
              <span className="font-semibold sm:w-32 sm:text-right sm:ml-4 text-gray-700">رقم الهاتف:</span>
              <span className="flex-1 text-base" dir="ltr">{user.phone}</span>
            </p>
            <p className="flex flex-col sm:flex-row sm:items-center">
              <span className="font-semibold sm:w-32 sm:text-right sm:ml-4 text-gray-700">البريد الإلكتروني:</span>
              <span className="flex-1 text-base" dir="ltr">{user.email || 'غير متوفر'}</span>
            </p>
            <p className="flex flex-col sm:flex-row sm:items-center">
              <span className="font-semibold sm:w-32 sm:text-right sm:ml-4 text-gray-700">الدور:</span>
              <span className="flex-1 text-base">{user.role === 'provider' ? 'مقدم خدمة' : 'عميل'}</span>
            </p>
          </div>
        </section>

        {/* Appointments Section */}
        <section className="bg-white rounded-xl shadow-lg p-6 sm:p-8 border-t-4 border-indigo-600">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-6">مواعيدي القادمة</h2>
          {appointmentsLoading ? (
            <div className="text-center text-gray-600 text-lg">جاري تحميل المواعيد...</div>
          ) : userAppointments && userAppointments.length > 0 ? (
            <div className="space-y-4">
              {userAppointments.map((apt: any) => (
                <div key={apt._id} className="bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm text-right">
                  <p className="font-semibold text-gray-800 text-lg mb-1">الخدمة: {apt.service?.name}</p>
                  <p className="text-sm text-gray-600 mb-1">المقدم: {apt.serviceProvider?.businessName || 'N/A'}</p>
                  <p className="text-sm text-gray-600 mb-1">
                    التاريخ: {new Date(apt.dateTime).toLocaleString('ar-SY', { dateStyle: 'full', timeStyle: 'short' })}
                  </p>
                  <p className={`text-sm font-medium ${
                      apt.status === 'confirmed' ? 'text-green-600' :
                      apt.status === 'pending' ? 'text-orange-600' : // Changed yellow to orange for better contrast
                      apt.status === 'cancelled' ? 'text-red-600' : 'text-blue-600' // Changed grey to blue for completed
                  }`}>
                    الحالة: {apt.status === 'pending' ? 'معلق' : apt.status === 'confirmed' ? 'مؤكد' : apt.status === 'cancelled' ? 'ملغى' : 'مكتمل'}
                  </p>
                  {/* Add action buttons like "View Details", "Cancel" etc. here if needed */}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-600 p-4 border rounded-md bg-gray-50 text-lg">
              <p>لا يوجد لديك مواعيد حالياً.</p>
              {user.role === 'customer' && (
                <button onClick={() => router.push('/home')} className="mt-4 text-blue-600 hover:underline font-semibold text-base">
                  ابحث عن مقدمي خدمات لحجز موعد
                </button>
              )}
            </div>
          )}
        </section>
      </div>

      {/* Edit Profile Modal */}
      <Dialog open={showEditModal} onClose={() => setShowEditModal(false)} className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <div className="fixed inset-0 bg-black bg-opacity-60" aria-hidden="true" />
        <Dialog.Panel className="relative bg-white rounded-xl shadow-2xl p-6 sm:p-8 w-full max-w-lg mx-auto animate-fade-in-scale">
          <button
            onClick={() => setShowEditModal(false)}
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-3xl transition"
            aria-label="إغلاق"
          >
            &times;
          </button>
          <Dialog.Title className="text-xl sm:text-2xl font-bold text-gray-800 mb-6 text-center">تعديل الملف الشخصي</Dialog.Title>

          {/* Display loading state for mutation (if useMutation was used for updateProfile) */}
          {/* This assumes updateProfile internally uses useMutation and exposes its pending state */}
          {/* If updateProfile is just a direct API call, you'd manage isLoading state within handleSubmit */}
          {/* For now, assuming direct API call from useAuth hook */}
          {userLoading && <div className="text-center text-blue-600 text-lg mb-4">جاري الحفظ...</div>}

          {editError && (
            <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg relative mb-4 text-sm sm:text-base text-right" role="alert">
              <span className="block">{editError}</span>
            </div>
          )}
          {editSuccess && (
            <div className="bg-green-50 border border-green-300 text-green-700 px-4 py-3 rounded-lg relative mb-4 text-sm sm:text-base text-right" role="alert">
              <span className="block">{editSuccess}</span>
            </div>
          )}

          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm sm:text-base font-medium text-gray-700 text-right mb-1">الاسم:</label>
              <input
                id="name"
                name="name"
                type="text"
                value={editFormData.name}
                onChange={handleEditChange}
                className="w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500 text-right text-base placeholder-gray-400"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm sm:text-base font-medium text-gray-700 text-right mb-1">البريد الإلكتروني:</label>
              <input
                id="email"
                name="email"
                type="email"
                value={editFormData.email}
                onChange={handleEditChange}
                className="w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500 text-right text-base placeholder-gray-400"
                dir="ltr"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm sm:text-base font-medium text-gray-700 text-right mb-1">كلمة المرور الجديدة (اختياري):</label>
              <input
                id="password"
                name="password"
                type="password"
                value={editFormData.password}
                onChange={handleEditChange}
                placeholder="اترك فارغاً لعدم التغيير"
                className="w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500 text-right text-base placeholder-gray-400"
                minLength={8} // Suggesting a minimum password length
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed text-base font-semibold"
              disabled={userLoading} // Assuming userLoading reflects updateProfile status
            >
              {userLoading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
            </button>
          </form>
        </Dialog.Panel>
      </Dialog>
    </div>
  );
}
