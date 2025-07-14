'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { providers, reviews, appointments } from '../../../lib/api'; // API imports
import { useAuth } from '../../../hooks/useAuth'; // Auth hook
import Calendar from 'react-calendar'; // Calendar component
import 'react-calendar/dist/Calendar.css'; // Calendar default styles (will be overridden/enhanced)
import CustomSelect from '../../../components/CustomSelect'; // Custom dropdown component
import ImageGallery from '../../../components/ImageGallery'; // Image gallery with lightbox

// Define types for clarity and type safety
interface ILocation {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
  address: string;
}

interface IService {
  _id: string;
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

interface IProviderDetails {
  _id: string;
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

interface IReview {
  _id: string;
  customer: { _id: string; name: string };
  rating: number;
  comment?: string;
  createdAt: string;
}

// Helper function to get the day name (e.g., 'sunday') from a Date object
const getDayName = (date: Date): IWorkingHours['day'] => {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days[date.getDay()] as IWorkingHours['day'];
};

// Helper function to generate time slots based on open/close times and service duration
const generateTimeSlots = (open: string, close: string, duration: number): string[] => {
  const slots: string[] = [];
  let [openHour, openMin] = open.split(':').map(Number);
  let [closeHour, closeMin] = close.split(':').map(Number);

  let currentTimeInMinutes = openHour * 60 + openMin;
  const endTimeInMinutes = closeHour * 60 + closeMin;

  // Generate slots until the current time + duration exceeds the closing time
  while (currentTimeInMinutes + duration <= endTimeInMinutes) {
    const hours = Math.floor(currentTimeInMinutes / 60);
    const minutes = currentTimeInMinutes % 60;
    // Format hours and minutes with leading zeros
    slots.push(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`);
    currentTimeInMinutes += duration; // Move to the next slot
  }
  return slots;
};

export default function ProviderDetailsPage() {
  const params = useParams(); // Get URL parameters
  const providerId = params?.id as string; // Extract provider ID from params
  const queryClient = useQueryClient(); // React Query client for cache management
  const { isAuthenticated } = useAuth(); // Check user authentication status

  // State for booking form
  const [selectedServiceId, setSelectedServiceId] = useState<string | number>('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [notes, setNotes] = useState('');

  // States for form feedback (errors and success messages)
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Fetch provider details
  const { data: provider, isLoading: providerLoading, error: providerError } = useQuery<IProviderDetails | null>({
    queryKey: ['provider', providerId], // Unique key for this query
    queryFn: async () => {
      if (!providerId) return null; // Don't fetch if providerId is not available
      const res = await providers.getById(providerId);
      return res.data;
    },
    enabled: typeof window !== 'undefined' && !!providerId, // Only run in browser and if providerId exists
    staleTime: 5 * 60 * 1000, // Data considered fresh for 5 minutes
    gcTime: 5 * 60 * 1000,    // Data garbage collected after 5 minutes of inactivity
  });

  // Fetch provider reviews
  const { data: reviewsData, isLoading: reviewsLoading, error: reviewsError } = useQuery<IReview[]>({
    queryKey: ['provider-reviews', providerId],
    queryFn: async () => {
      if (!providerId) return [];
      const res = await reviews.getByProvider(providerId);
      return res.data;
    },
    enabled: typeof window !== 'undefined' && !!providerId,
    staleTime: 5 * 60 * 1000,
  });

  // Effect to generate available time slots when service, date, or provider data changes
  useEffect(() => {
    if (provider && selectedDate && selectedServiceId) {
      const dayName = getDayName(selectedDate); // Get day name (e.g., 'sunday')
      // Find the working hours for the selected day
      const daySchedule = provider.workingHours.find(wh => wh.day.toLowerCase() === dayName.toLowerCase());
      // Find the selected service details
      const service = provider.services.find(s => s._id === selectedServiceId);

      // If a schedule exists, is open, and service is found, generate time slots
      if (daySchedule && !daySchedule.isClosed && service) {
        const slots = generateTimeSlots(daySchedule.open, daySchedule.close, service.duration);
        setAvailableTimeSlots(slots);
        setSelectedTimeSlot(''); // Reset selected time slot
      } else {
        // No slots if day is closed or service not found
        setAvailableTimeSlots([]);
        setSelectedTimeSlot('');
      }
    } else {
      // Clear slots if no date or service is selected
      setAvailableTimeSlots([]);
      setSelectedTimeSlot('');
    }
  }, [provider, selectedDate, selectedServiceId]);

  // Mutation for creating a new appointment
  const createAppointmentMutation = useMutation({
    mutationFn: appointments.create,
    onSuccess: () => {
      setFormSuccess('تم حجز موعدك بنجاح! سيتم إرسال تأكيد إليك.');
      setFormError('');
      // Reset booking form fields after successful booking
      setSelectedServiceId('');
      setSelectedDate(null);
      setAvailableTimeSlots([]); // Clear time slots
      setSelectedTimeSlot('');
      setNotes('');
      // Optionally invalidate appointments query for the customer to show new appointment
      queryClient.invalidateQueries({ queryKey: ['userAppointments'] });
    },
    onError: (err: any) => {
      setFormError(err.response?.data?.message || 'فشل حجز الموعد. يرجى التأكد من البيانات والمحاولة مرة أخرى.');
      setFormSuccess('');
    },
  });

  // Handler for booking form submission
  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    // Pre-submission validation
    if (!isAuthenticated) {
      setFormError('يجب عليك تسجيل الدخول لحجز موعد. يرجى تسجيل الدخول أو إنشاء حساب.');
      return;
    }
    if (!selectedServiceId || !selectedDate || !selectedTimeSlot || !provider?._id) {
      setFormError('الرجاء اختيار خدمة وتاريخ ووقت قبل الحجز.');
      return;
    }

    // Combine selected date and time slot into a full DateTime object
    const [hour, minute] = String(selectedTimeSlot).split(':').map(Number);
    const dateTime = new Date(selectedDate);
    dateTime.setHours(hour, minute, 0, 0); // Set hours and minutes, seconds and milliseconds to 0

    // Trigger the appointment creation mutation
    createAppointmentMutation.mutate({
      providerId: provider._id,
      serviceId: String(selectedServiceId), // Ensure serviceId is a string
      dateTime: dateTime.toISOString(),     // Send as ISO string
      notes,
    });
  };

  // --- Conditional Renderings for Loading, Error ---
  if (providerLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 font-inter p-4">
        <div className="flex flex-col items-center p-8 bg-white rounded-xl shadow-2xl border-t-4 border-blue-600 max-w-sm w-full text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-blue-500 mb-6 border-opacity-75"></div>
          <p className="text-gray-700 text-lg">جاري تحميل تفاصيل مقدم الخدمة...</p>
        </div>
      </div>
    );
  }

  // Handle case where provider data is not found or an error occurred
  if (providerError || !provider) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 font-inter p-4">
        <div className="text-center p-8 bg-white rounded-xl shadow-2xl border-t-4 border-red-600 max-w-sm w-full">
          <h2 className="text-2xl font-bold text-red-600 mb-4">خطأ في تحميل البيانات</h2>
          <p className="text-gray-700 text-lg">لم يتم العثور على مقدم الخدمة المطلوب أو حدث خطأ. يرجى المحاولة لاحقاً.</p>
          <button onClick={() => window.history.back()} className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition font-semibold">
            العودة للصفحة السابقة
          </button>
        </div>
      </div>
    );
  }

  // Options for CustomSelect components
  const serviceOptions = provider.services.map(service => ({
    value: service._id,
    label: `${service.name} (${service.price} ل.س - ${service.duration} دقيقة)`,
  }));

  const timeSlotOptions = availableTimeSlots.map(slot => ({
    value: slot,
    label: slot,
  }));

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 bg-gray-100 min-h-screen font-inter">
      {/* Provider Business Name as Page Title */}
      <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-8 text-center">
        {provider.businessName}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Left Column (Provider Info & Booking) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Provider Images Gallery */}
          {provider.images && provider.images.length > 0 && (
            <section className="bg-white rounded-xl shadow-lg p-6 sm:p-8 border-t-4 border-green-600">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 text-right">معرض الصور</h2>
              <ImageGallery images={provider.images} />
            </section>
          )}
          
          {/* Provider Overview Card */}
          <section className="bg-white rounded-xl shadow-lg p-6 sm:p-8 border-t-4 border-blue-600">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 text-right">معلومات مقدم الخدمة</h2>
            <div className="space-y-3 text-gray-800 text-right">
              <p className="flex flex-col sm:flex-row sm:items-center">
                <span className="font-semibold sm:w-24 sm:text-right sm:ml-4 text-gray-700">التصنيف:</span>
                <span className="flex-1 text-base">{provider.category}</span>
              </p>
              <p className="flex flex-col sm:flex-row sm:items-center">
                <span className="font-semibold sm:w-24 sm:text-right sm:ml-4 text-gray-700">الوصف:</span>
                <span className="flex-1 text-base">{provider.description || 'لا يوجد وصف.'}</span>
              </p>
              <p className="flex flex-col sm:flex-row sm:items-center">
                <span className="font-semibold sm:w-24 sm:text-right sm:ml-4 text-gray-700">العنوان:</span>
                <span className="flex-1 text-base">{provider.location?.address || 'غير محدد'}</span>
              </p>
              <p className="flex flex-col sm:flex-row sm:items-center">
                <span className="font-semibold sm:w-24 sm:text-right sm:ml-4 text-gray-700">التقييم:</span>
                <span className="flex-1 text-base flex items-center">
                  {provider.rating?.toFixed(1) || 'جديد'}
                  <span className="text-yellow-400 rtl:mr-1 ltr:ml-1">⭐</span>
                  <span className="text-sm text-gray-500 rtl:mr-2 ltr:ml-2">({provider.totalRatings} تقييم)</span>
                </span>
              </p>
              {/* Optional: Add working hours display here */}
              <p className="flex flex-col sm:flex-row sm:items-center">
                <span className="font-semibold sm:w-24 sm:text-right sm:ml-4 text-gray-700">ساعات العمل:</span>
                <span className="flex-1 text-base">
                  {provider.workingHours && provider.workingHours.length > 0 ? (
                    provider.workingHours.map(wh => {
                      const arabicDay = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'][
                        ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].indexOf(wh.day)
                      ];
                      return (
                        <span key={wh.day} className="block">
                          {arabicDay}: {wh.isClosed ? 'مغلق' : `${wh.open} - ${wh.close}`}
                        </span>
                      );
                    })
                  ) : (
                    'غير محددة'
                  )}
                </span>
              </p>
            </div>
          </section>

          {/* Booking Section */}
          <section className="bg-white rounded-xl shadow-lg p-6 sm:p-8 border-t-4 border-green-600">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-6 text-right">احجز موعداً</h2>
            {createAppointmentMutation.isPending && (
              <div className="text-center text-blue-600 text-lg mb-4">جاري حجز الموعد...</div>
            )}
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

            <form onSubmit={handleBookingSubmit} className="space-y-6">
              {/* Service Selection - Using CustomSelect */}
              <div>
                <label htmlFor="service-select" className="block text-sm sm:text-base font-medium text-gray-700 text-right mb-1">اختر خدمة:</label>
                <CustomSelect
                  label="اختر خدمة"
                  options={serviceOptions}
                  value={selectedServiceId}
                  onChange={setSelectedServiceId}
                  className="w-full"
                  containerClasses="rounded-md shadow-sm border border-gray-300 focus-within:ring-blue-500 focus-within:border-blue-500"
                  selectClasses="py-3 px-3 text-base text-gray-900 focus:outline-none"
                  placeholder="-- اختر خدمة --"
                />
              </div>

              {/* Date Selection */}
              <div>
                <label className="block text-sm sm:text-base font-medium text-gray-700 text-right mb-1">اختر التاريخ:</label>
                <div className="flex justify-center p-2 border border-gray-300 rounded-md shadow-sm bg-white">
                  <Calendar
                    onChange={setSelectedDate as any} // Cast to any to satisfy type for react-calendar
                    value={selectedDate}
                    minDate={new Date()} // Prevent selecting past dates
                    className="border-none w-full max-w-full text-base" // Responsive calendar styling
                    locale="ar" // Set calendar locale to Arabic
                    calendarType="gregory" // Ensure Gregorian calendar if needed
                    // Add more styling for react-calendar to align with Tailwind
                    tileClassName={({ date, view }) => {
                      if (view === 'month' && date.getDay() === 5) { // Fridays
                        return 'text-red-500'; // Example: highlight Fridays
                      }
                      return null;
                    }}
                  />
                </div>
              </div>

              {/* Time Slot Selection - Using CustomSelect */}
              {selectedDate && selectedServiceId && availableTimeSlots.length > 0 && (
                <div>
                  <label htmlFor="time-slot-select" className="block text-sm sm:text-base font-medium text-gray-700 text-right mb-1">اختر الوقت:</label>
                  <CustomSelect
                    label="اختر الوقت"
                    options={timeSlotOptions}
                    value={selectedTimeSlot}
                    onChange={(value) => setSelectedTimeSlot(String(value))}
                    className="w-full"
                    containerClasses="rounded-md shadow-sm border border-gray-300 focus-within:ring-blue-500 focus-within:border-blue-500"
                    selectClasses="py-3 px-3 text-base text-gray-900 focus:outline-none"
                    placeholder="-- اختر وقتاً --"
                  />
                </div>
              )}
              {selectedDate && selectedServiceId && availableTimeSlots.length === 0 && (
                <p className="text-sm text-red-600 text-right p-2 bg-red-50 rounded-md border border-red-300">
                  لا توجد أوقات متاحة في هذا اليوم أو لهذه الخدمة. يرجى اختيار تاريخ آخر أو خدمة مختلفة.
                </p>
              )}

              {/* Notes Input */}
              <div>
                <label htmlFor="notes" className="block text-sm sm:text-base font-medium text-gray-700 text-right mb-1">ملاحظات (اختياري):</label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4} // Increased rows for better mobile usability
                  className="w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500 text-right text-base placeholder-gray-400 resize-y"
                  placeholder="أي ملاحظات خاصة لمقدم الخدمة..."
                ></textarea>
              </div>

              {/* Booking Button */}
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed text-base font-semibold"
                disabled={createAppointmentMutation.isPending || !isAuthenticated || !selectedServiceId || !selectedDate || !selectedTimeSlot}
              >
                {createAppointmentMutation.isPending ? 'جاري الحجز...' : isAuthenticated ? 'احجز موعداً الآن' : 'يرجى تسجيل الدخول للحجز'}
              </button>
              {!isAuthenticated && (
                <p className="text-center text-sm text-gray-600 mt-2">
                  <Link href="/auth/login" className="text-blue-600 hover:underline font-semibold">
                    تسجيل الدخول
                  </Link>{' '}
                  أو{' '}
                  <Link href="/auth/register-customer" className="text-blue-600 hover:underline font-semibold">
                    إنشاء حساب
                  </Link>
                </p>
              )}
            </form>
          </section>
        </div>

        {/* Right Column (Services & Reviews) */}
        <div className="lg:col-span-1 space-y-6">
          {/* Services Section */}
          <section className="bg-white rounded-xl shadow-lg p-6 sm:p-8 border-t-4 border-purple-600">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-6 text-right">الخدمات المتوفرة</h2>
            {provider.services && provider.services.length > 0 ? (
              <div className="space-y-4">
                {provider.services.map((service) => (
                  <div key={service._id} className="bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm text-right hover:shadow-md transition duration-200">
                    <p className="font-semibold text-gray-800 text-lg mb-1">{service.name}</p>
                    <p className="text-sm text-gray-600 mb-1">المدة: {service.duration} دقيقة | السعر: {service.price} ل.س</p>
                    {service.description && <p className="text-sm text-gray-500">{service.description}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-600 p-4 border rounded-md bg-gray-50 text-lg">
                <p>لا توجد خدمات مسجلة لهذا المقدم بعد.</p>
              </div>
            )}
          </section>

          {/* Reviews Section */}
          <section className="bg-white rounded-xl shadow-lg p-6 sm:p-8 border-t-4 border-orange-600">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-6 text-right">التقييمات</h2>
            {reviewsLoading ? (
              <div className="text-center text-gray-600 text-lg">جاري تحميل التقييمات...</div>
            ) : reviewsData && reviewsData.length > 0 ? (
              <div className="space-y-4">
                {reviewsData.map((review) => (
                  <div key={review._id} className="bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm text-right hover:shadow-md transition duration-200">
                    <p className="font-semibold text-gray-800 text-lg mb-1">العميل: {review.customer?.name || 'غير معروف'}</p>
                    <p className="text-sm text-yellow-500 mb-1">التقييم: {review.rating} ⭐</p> {/* Changed text color for stars */}
                    {review.comment && <p className="text-sm text-gray-700">{review.comment}</p>}
                    <p className="text-xs text-gray-500 mt-2">بتاريخ: {new Date(review.createdAt).toLocaleDateString('ar-SY')}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-600 p-4 border rounded-md bg-gray-50 text-lg">
                <p>لا يوجد تقييمات لهذا المقدم بعد.</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
