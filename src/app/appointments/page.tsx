'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appointments, reviews } from '../../lib/api'; // Import reviews API
import { useAuth } from '../../hooks/useAuth'; // Import useAuth to ensure user context
import { Dialog } from '@headlessui/react'; // For the review modal

export default function AppointmentsPage() {
  const { user, isLoading: userLoading } = useAuth();
  const queryClient = useQueryClient();

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedAppointmentForReview, setSelectedAppointmentForReview] = useState<any>(null);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');

  // Fetch customer's appointments
  const { data: userAppointments, isLoading: appointmentsLoading, error: appointmentsError } = useQuery({
    queryKey: ['userAppointments', user?._id], // Key includes user ID for specific fetching
    queryFn: async () => {
      if (!user) return []; // Don't fetch if user is not available
      const res = await appointments.getAll(); // Assuming this fetches appointments for the logged-in customer
      // Sort appointments: upcoming first, then completed, then others
      return res.data.sort((a: any, b: any) => {
        const dateA = new Date(a.dateTime).getTime();
        const dateB = new Date(b.dateTime).getTime();
        const now = new Date().getTime();

        if (a.status === 'completed' && b.status !== 'completed') return 1;
        if (a.status !== 'completed' && b.status === 'completed') return -1;
        
        // Prioritize upcoming (future) appointments
        if (dateA > now && dateB < now) return -1;
        if (dateA < now && dateB > now) return 1;

        return dateB - dateA; // Sort by date descending (latest first for past, earliest for future)
      });
    },
    enabled: typeof window !== 'undefined' && !!user, // Only enabled if in browser and user is logged in
    staleTime: 60 * 1000,
    cacheTime: 5 * 60 * 1000,
  });

  // Mutation for submitting a review
  const addReviewMutation = useMutation({
    mutationFn: (data: { providerId: string; rating: number; comment?: string; appointmentId: string }) =>
      reviews.create(data.providerId, { rating: data.rating, comment: data.comment, appointmentId: data.appointmentId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userAppointments', user?._id] }); // Invalidate to update appointment status/rating
      queryClient.invalidateQueries({ queryKey: ['provider-reviews'] }); // Also invalidate provider reviews if viewing them
      setReviewSuccess('تم إضافة تقييمك بنجاح!');
      setReviewError('');
      setShowReviewModal(false); // Close modal
      setReviewRating(0); // Reset form
      setReviewComment('');
      setSelectedAppointmentForReview(null);
    },
    onError: (err: any) => {
      setReviewError(err.response?.data?.message || 'فشل إضافة التقييم.');
      setReviewSuccess('');
    },
  });

  const handleOpenReviewModal = (appointment: any) => {
    setSelectedAppointmentForReview(appointment);
    setReviewRating(0);
    setReviewComment('');
    setReviewError('');
    setReviewSuccess('');
    setShowReviewModal(true);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppointmentForReview || reviewRating === 0) {
      setReviewError('الرجاء اختيار تقييم (نجوم) وكتابة مراجعة.');
      return;
    }
    try {
      await addReviewMutation.mutateAsync({
        providerId: selectedAppointmentForReview.serviceProvider?._id || selectedAppointmentForReview.serviceProvider, // Ensure provider ID is correctly passed
        rating: reviewRating,
        comment: reviewComment,
        appointmentId: selectedAppointmentForReview._id,
      });
    } catch (error) {
      // Error handled by mutation's onError
    }
  };

  // --- Render Logic ---
  if (userLoading || appointmentsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-20">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-primary-600 border-opacity-50 mb-6"></div>
          <p className="text-gray-700">جاري تحميل مواعيدك...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-20">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-red-600 mb-4">خطأ في الوصول</h2>
          <p className="text-gray-700">الرجاء تسجيل الدخول لعرض مواعيدك.</p>
        </div>
      </div>
    );
  }

  if (appointmentsError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-20">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-red-600 mb-4">خطأ في تحميل المواعيد</h2>
          <p className="text-gray-700">حدث خطأ أثناء جلب مواعيدك. يرجى المحاولة مرة أخرى لاحقاً.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 pt-24 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">مواعيدي</h1>

      {userAppointments && userAppointments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userAppointments.map((apt: any) => (
            <div key={apt._id} className="bg-white rounded-lg shadow-md p-6 border-t-4
              border-primary-600"> {/* Default border color */}
              
              {/* Conditional border color based on status */}
              <div className={`
                ${apt.status === 'confirmed' ? 'border-green-600' : ''}
                ${apt.status === 'pending' ? 'border-yellow-600' : ''}
                ${apt.status === 'cancelled' ? 'border-red-600' : ''}
                ${apt.status === 'completed' && !apt.rating ? 'border-blue-600' : ''}
                ${apt.status === 'completed' && apt.rating ? 'border-gray-400' : ''}
              `}>
                <p className="font-bold text-xl text-primary-700 mb-2">الخدمة: {apt.service?.name}</p>
                <p className="text-sm text-gray-700 mb-1">المقدم: {apt.serviceProvider?.businessName || 'N/A'}</p>
                <p className="text-sm text-gray-700 mb-1">
                  التاريخ: {new Date(apt.dateTime).toLocaleString('ar-SY', { dateStyle: 'full', timeStyle: 'short' })}
                </p>
                <p className={`text-lg font-semibold mb-3
                  ${apt.status === 'confirmed' ? 'text-green-600' : ''}
                  ${apt.status === 'pending' ? 'text-yellow-600' : ''}
                  ${apt.status === 'cancelled' ? 'text-red-600' : ''}
                  ${apt.status === 'completed' ? 'text-gray-600' : ''}
                `}>
                  الحالة: {apt.status === 'pending' ? 'معلق' : apt.status === 'confirmed' ? 'مؤكد' : apt.status === 'cancelled' ? 'ملغى' : 'مكتمل'}
                </p>

                {/* Review section/button for completed appointments */}
                {apt.status === 'completed' && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    {apt.rating ? (
                      <p className="text-md text-gray-700">تقييمك: {apt.rating} ⭐ {apt.review && `"${apt.review}"`}</p>
                    ) : (
                      <button onClick={() => handleOpenReviewModal(apt)} className="bg-blue-500 text-white px-4 py-2 text-sm rounded-md hover:bg-blue-600 transition">
                        أضف تقييم
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center p-8 bg-white rounded-lg shadow-md border-t-4 border-gray-400">
          <p className="text-lg text-gray-700">لا يوجد لديك مواعيد حالياً.</p>
          <button onClick={() => router.push('/providers')} className="mt-4 text-primary-600 hover:underline text-sm font-semibold">
            ابحث عن مقدمي خدمات لحجز موعد
          </button>
        </div>
      )}

      {/* Review Modal */}
      <Dialog open={showReviewModal} onClose={() => setShowReviewModal(false)} className="fixed z-50 inset-0 flex items-center justify-center">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <Dialog.Panel className="relative bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-auto">
          <button
            onClick={() => setShowReviewModal(false)}
            className="absolute top-4 left-4 text-gray-400 hover:text-red-600 text-2xl font-bold focus:outline-none"
            aria-label="إغلاق"
          >
            ×
          </button>
          <Dialog.Title className="text-2xl font-bold text-gray-800 mb-6 text-center">أضف تقييمك</Dialog.Title>
          {addReviewMutation.isPending && <div className="text-center text-primary-600 mb-4">جاري الإرسال...</div>}
          {reviewError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <span className="block sm:inline">{reviewError}</span>
            </div>
          )}
          {reviewSuccess && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
              <span className="block sm:inline">{reviewSuccess}</span>
            </div>
          )}
          
          <form onSubmit={handleReviewSubmit} className="space-y-4">
            <div>
              <label htmlFor="rating" className="block text-sm font-medium text-gray-700 text-right mb-1">التقييم (نجوم):</label>
              <div className="flex justify-end gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setReviewRating(star)}
                    className={`text-3xl ${reviewRating >= star ? 'text-yellow-400' : 'text-gray-300'} focus:outline-none`}
                  >
                    ⭐
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label htmlFor="comment" className="block text-sm font-medium text-gray-700 text-right mb-1">تعليق (اختياري):</label>
              <textarea
                id="comment"
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                rows={4}
                className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-primary-500 focus:border-primary-500 text-right"
                placeholder="اكتب تعليقك هنا..."
              ></textarea>
            </div>
            <button
              type="submit"
              className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 transition"
              disabled={addReviewMutation.isPending || reviewRating === 0}
            >
              {addReviewMutation.isPending ? 'جاري الإرسال...' : 'أرسل التقييم'}
            </button>
          </form>
        </Dialog.Panel>
      </Dialog>
    </div>
  );
}