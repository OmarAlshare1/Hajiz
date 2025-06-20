'use client';

import React, { useState } from 'react'; // Importing React and useState hook
import { useAuth } from '@/hooks/useAuth'; // Custom authentication hook
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'; // React Query hooks for data fetching and mutations
import { appointments } from '@/lib/api'; // API service for appointments
import { useRouter } from 'next/navigation'; // Next.js router for navigation
// CustomSelect is not used in this component's logic, but keeping import as it was present in original
// import CustomSelect from '@/components/CustomSelect';

export default function ProviderAppointments() {
  const { user, isLoading: userLoading } = useAuth(); // Get authenticated user and loading state
  const queryClient = useQueryClient(); // Get query client for cache invalidation
  const router = useRouter(); // Initialize Next.js router

  const [formError, setFormError] = useState('');     // State for general form errors
  const [formSuccess, setFormSuccess] = useState(''); // State for general form success messages

  // Fetch provider's appointments
  const { data: appointmentsData, isLoading: appointmentsLoading, error: appointmentsError } = useQuery({
    queryKey: ['providerAppointments', user?._id], // Unique query key that updates if user changes
    queryFn: async () => {
      // Throw an error if the user is not a provider or not authenticated
      if (!user || user.role !== 'provider') {
        // Instead of throwing, we might redirect directly here, but throwing allows error state to be caught
        // For production, a redirect might be smoother UX in this specific `queryFn`
        throw new Error('Access Denied: Not authenticated or not a provider.');
      }
      const res = await appointments.getProviderAppointments();
      // Sort appointments by date and time in ascending order
      return res.data.sort((a: any, b: any) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
    },
    // Enable the query only if in a browser environment, user is logged in, and is a provider
    enabled: typeof window !== 'undefined' && !!user && user.role === 'provider',
    staleTime: 60 * 1000, // Data is fresh for 1 minute
    gcTime: 5 * 60 * 1000, // Data garbage collected after 5 minutes of inactivity
  });

  // Mutation for updating appointment status
  const updateStatusMutation = useMutation({
    mutationFn: (data: { appointmentId: string; status: string }) =>
      appointments.updateStatus(data.appointmentId, data.status), // API call to update status
    onSuccess: () => {
      // Invalidate the cache to refetch the updated appointments list
      queryClient.invalidateQueries({ queryKey: ['providerAppointments', user?._id] });
      setFormSuccess('تم تحديث حالة الموعد بنجاح!'); // Show success message
      setFormError(''); // Clear any previous errors
    },
    onError: (err: any) => {
      console.error("Failed to update appointment status:", err);
      // Display error message from API response or a generic one
      setFormError(err.response?.data?.message || 'فشل تحديث حالة الموعد. يرجى المحاولة مرة أخرى.');
      setFormSuccess(''); // Clear any success message
    },
  });

  // Handler to update an appointment's status
  const handleUpdateStatus = (appointmentId: string, status: string) => {
    // For "cancel" action, prompt for confirmation (consider replacing window.confirm with a custom modal for better UX)
    if (status === 'cancelled' && !window.confirm('هل أنت متأكد أنك تريد إلغاء هذا الموعد؟')) {
      return; // If user cancels, do nothing
    }
    updateStatusMutation.mutate({ appointmentId, status }); // Trigger the status update mutation
  };

  // --- Conditional Renderings for Loading, Access Denied, Error ---

  // Display a loading spinner while user data or appointments are being fetched
  if (userLoading || appointmentsLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 font-inter p-4">
        <div className="flex flex-col items-center p-8 bg-white rounded-xl shadow-2xl border-t-4 border-blue-600 max-w-sm w-full text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-blue-500 mb-6 border-opacity-75"></div>
          <p className="text-gray-700 text-lg">جاري تحميل المواعيد...</p>
        </div>
      </div>
    );
  }

  // Handle unauthorized access (not a provider or not authenticated)
  if (!user || user.role !== 'provider') {
    // Redirect to login page and display an access denied message
    router.push('/auth/login'); // Perform the redirect
    return ( // Render a fallback UI while redirecting or if redirect fails
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

  // Handle errors during appointments data fetching
  if (appointmentsError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 font-inter p-4">
        <div className="text-center p-8 bg-white rounded-xl shadow-2xl border-t-4 border-red-600 max-w-sm w-full">
          <h2 className="text-2xl font-bold text-red-600 mb-4">خطأ في تحميل المواعيد</h2>
          <p className="text-gray-700 text-lg">فشل تحميل مواعيد العملاء. يرجى المحاولة مرة أخرى لاحقاً.</p>
          {/* Optional: Add a refresh button or link to home */}
          <button onClick={() => router.reload()} className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition font-semibold">
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  // --- Main Content Display ---
  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 bg-gray-100 min-h-screen font-inter">
      <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-8 text-center">مواعيد العملاء</h1>

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

      {/* Conditional Rendering for Appointments List or No Data Message */}
      {appointmentsData && appointmentsData.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {appointmentsData.map((apt: any) => (
            <div
              key={apt._id}
              className={classNames(
                "bg-white rounded-xl shadow-lg p-6 text-right transition transform hover:scale-[1.02] hover:shadow-xl",
                // Dynamic border color based on status
                apt.status === 'confirmed' ? 'border-t-4 border-green-600' :
                apt.status === 'pending' ? 'border-t-4 border-orange-600' : // Changed yellow to orange for better contrast
                apt.status === 'cancelled' ? 'border-t-4 border-red-600' :
                'border-t-4 border-blue-600' // Default/Completed appointments
              )}
            >
              <h2 className="font-bold text-xl text-gray-800 mb-2">الخدمة: {apt.service?.name}</h2>
              <p className="text-sm text-gray-700 mb-1">العميل: <span className="font-semibold">{apt.customer?.name || 'غير معروف'}</span></p>
              <p className="text-sm text-gray-700 mb-1">رقم العميل: <span dir="ltr">{apt.customer?.phone || 'N/A'}</span></p> {/* LTR for phone number */}
              <p className="text-sm text-gray-700 mb-2">
                التاريخ: <span className="font-semibold">{new Date(apt.dateTime).toLocaleString('ar-SY', { dateStyle: 'full', timeStyle: 'short' })}</span>
              </p>

              <div className="mb-4">
                <p className={`text-lg font-semibold
                  ${apt.status === 'confirmed' ? 'text-green-600' : ''}
                  ${apt.status === 'pending' ? 'text-orange-600' : ''}
                  ${apt.status === 'cancelled' ? 'text-red-600' : ''}
                  ${apt.status === 'completed' ? 'text-blue-600' : ''}
                `}>
                  الحالة: {apt.status === 'pending' ? 'معلق' : apt.status === 'confirmed' ? 'مؤكد' : apt.status === 'cancelled' ? 'ملغى' : 'مكتمل'}
                </p>
              </div>

              {/* Action Buttons based on status */}
              <div className="flex flex-wrap gap-2 mt-4 justify-end"> {/* Use flex-wrap and justify-end for responsive buttons */}
                {apt.status === 'pending' && (
                  <button
                    onClick={() => handleUpdateStatus(apt._id, 'confirmed')}
                    className="bg-green-600 text-white px-4 py-2 text-sm rounded-md hover:bg-green-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={updateStatusMutation.isPending}
                  >
                    تأكيد
                  </button>
                )}
                {(apt.status === 'pending' || apt.status === 'confirmed') && (
                  <button
                    onClick={() => handleUpdateStatus(apt._id, 'cancelled')}
                    className="bg-red-600 text-white px-4 py-2 text-sm rounded-md hover:bg-red-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={updateStatusMutation.isPending}
                  >
                    إلغاء
                  </button>
                )}
                {apt.status === 'confirmed' && (
                  <button
                    onClick={() => handleUpdateStatus(apt._id, 'completed')}
                    className="bg-blue-600 text-white px-4 py-2 text-sm rounded-md hover:bg-blue-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={updateStatusMutation.isPending}
                  >
                    إتمام
                  </button>
                )}
                {/* Optional: Button for viewing notes or other details if apt.notes exists */}
                {apt.notes && apt.notes.length > 0 && (
                   <button
                     onClick={() => alert(`ملاحظات الموعد: ${apt.notes}`)} // Replace with a custom modal if needed
                     className="bg-gray-500 text-white px-4 py-2 text-sm rounded-md hover:bg-gray-600 transition font-semibold"
                   >
                     عرض الملاحظات
                   </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        // No Appointments Message
        <div className="text-center p-8 bg-white rounded-xl shadow-lg border-t-4 border-gray-400">
          <p className="text-lg text-gray-700 mb-4">لا يوجد لديك مواعيد عملاء حالياً.</p>
          <p className="text-md text-gray-500">
            عندما يقوم العملاء بحجز مواعيد معك، ستظهر هنا.
          </p>
        </div>
      )}
    </div>
  );
}
