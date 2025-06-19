'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { providers, reviews, appointments } from '../../../lib/api';
import { useAuth } from '../../../hooks/useAuth';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import CustomSelect from '../../../components/CustomSelect'; // Import CustomSelect

// Define types for clarity
interface ILocation {
  type: 'Point';
  coordinates: [number, number];
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

const getDayName = (date: Date): IWorkingHours['day'] => {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days[date.getDay()] as IWorkingHours['day'];
};

const generateTimeSlots = (open: string, close: string, duration: number): string[] => {
  const slots: string[] = [];
  let [openHour, openMin] = open.split(':').map(Number);
  let [closeHour, closeMin] = close.split(':').map(Number);

  let currentTime = openHour * 60 + openMin;
  const endTime = closeHour * 60 + closeMin;

  while (currentTime + duration <= endTime) {
    const hours = Math.floor(currentTime / 60);
    const minutes = currentTime % 60;
    // FIX: Correct string interpolation for time slots
    slots.push(`<span class="math-inline">\{String\(hours\)\.padStart\(2, '0'\)\}\:</span>{String(minutes).padStart(2, '0')}`);
    currentTime += duration;
  }
  return slots;
};

export default function ProviderDetailsPage() {
  const params = useParams();
  const providerId = params?.id as string;
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();

  const [selectedServiceId, setSelectedServiceId] = useState<string | number>('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [notes, setNotes] = useState('');

  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  const { data: provider, isLoading: providerLoading, error: providerError } = useQuery<IProviderDetails | null>({
    queryKey: ['provider', providerId],
    queryFn: async () => {
      if (!providerId) return null;
      const res = await providers.getById(providerId);
      return res.data;
    },
    enabled: typeof window !== 'undefined' && !!providerId,
    staleTime: 5 * 60 * 1000,
  });

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

  useEffect(() => {
    if (provider && selectedDate && selectedServiceId) {
      const dayName = getDayName(selectedDate);
      const daySchedule = provider.workingHours.find(wh => wh.day === dayName);
      const service = provider.services.find(s => s._id === selectedServiceId);

      if (daySchedule && !daySchedule.isClosed && service) {
        const slots = generateTimeSlots(daySchedule.open, daySchedule.close, service.duration);
        setAvailableTimeSlots(slots);
        setSelectedTimeSlot('');
      } else {
        setAvailableTimeSlots([]);
        setSelectedTimeSlot('');
      }
    }
  }, [provider, selectedDate, selectedServiceId]);

  const createAppointmentMutation = useMutation({
    mutationFn: appointments.create,
    onSuccess: () => {
      setFormSuccess('تم حجز موعدك بنجاح!');
      setFormError('');
      setSelectedServiceId('');
      setSelectedDate(null);
      setSelectedTimeSlot('');
      setNotes('');
    },
    onError: (err: any) => {
      setFormError(err.response?.data?.message || 'فشل حجز الموعد.');
      setFormSuccess('');
    },
  });

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!isAuthenticated) {
      setFormError('يجب عليك تسجيل الدخول لحجز موعد.');
      return;
    }
    if (!selectedServiceId || !selectedDate || !selectedTimeSlot || !provider?._id) {
      setFormError('الرجاء اختيار الخدمة والتاريخ والوقت.');
      return;
    }

    const [hour, minute] = String(selectedTimeSlot).split(':').map(Number);
    const dateTime = new Date(selectedDate);
    dateTime.setHours(hour, minute, 0, 0);

    createAppointmentMutation.mutate({
      providerId: provider._id,
      serviceId: String(selectedServiceId),
      dateTime: dateTime.toISOString(),
      notes,
    });
  };

  if (providerLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-20">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-primary-600 border-opacity-50 mb-6"></div>
          <p className="text-gray-700">جاري تحميل تفاصيل مقدم الخدمة...</p>
        </div>
      </div>
    );
  }

  if (providerError || !provider) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-20">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-red-600 mb-4">خطأ في تحميل البيانات</h2>
          <p className="text-gray-700">لم يتم العثور على مقدم الخدمة المطلوب.</p>
        </div>
      </div>
    );
  }

  const serviceOptions = provider.services.map(service => ({
    value: service._id,
    label: `<span class="math-inline">\{service\.name\} \(</span>{service.price} ل.س - ${service.duration} دقيقة)`,
  }));

  const timeSlotOptions = availableTimeSlots.map(slot => ({
    value: slot,
    label: slot,
  }));

  return (
    <div className="container mx-auto p-8 pt-24 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
        {provider.businessName}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Provider Info & Booking Section */}
        <div className="lg:col-span-2 space-y-8">
          {/* Provider Overview Card */}
          <section className="bg-white rounded-lg shadow-md p-6 border-t-4 border-primary-600">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">معلومات مقدم الخدمة</h2>
            <div className="space-y-3 text-gray-800">
              <p className="flex items-center">
                <span className="font-semibold w-24 text-right mr-4">التصنيف:</span>
                <span className="flex-1">{provider.category}</span>
              </p>
              <p className="flex items-center">
                <span className="font-semibold w-24 text-right mr-4">الوصف:</span>
                <span className="flex-1">{provider.description}</span>
              </p>
              <p className="flex items-center">
                <span className="font-semibold w-24 text-right mr-4">العنوان:</span>
                <span className="flex-1">{provider.location?.address || 'غير محدد'}</span>
              </p>
              <p className="flex items-center">
                <span className="font-semibold w-24 text-right mr-4">التقييم:</span>
                <span className="flex-1">{provider.rating?.toFixed(2)} ⭐ ({provider.totalRatings} تقييم)</span>
              </p>
            </div>
          </section>

          {/* Booking Section */}
          <section className="bg-white rounded-lg shadow-md p-6 border-t-4 border-secondary-500">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">احجز موعداً</h2>
            {createAppointmentMutation.isPending && <div className="text-center text-primary-600 mb-4">جاري حجز الموعد...</div>}
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

            <form onSubmit={handleBookingSubmit} className="space-y-4">
              {/* Service Selection - Using CustomSelect */}
              <div>
                <CustomSelect
                  label="اختر خدمة:"
                  options={serviceOptions}
                  value={selectedServiceId}
                  onChange={setSelectedServiceId}
                  className="w-full"
                  placeholder="-- اختر خدمة --"
                />
              </div>

              {/* Date Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 text-right mb-1">اختر التاريخ:</label>
                <div className="flex justify-center">
                  <Calendar
                    onChange={setSelectedDate as any}
                    value={selectedDate}
                    minDate={new Date()}
                    className="border border-gray-300 rounded-md shadow-sm"
                  />
                </div>
              </div>

              {/* Time Slot Selection - Using CustomSelect */}
              {selectedDate && selectedServiceId && availableTimeSlots.length > 0 && (
                <div>
                  <CustomSelect
                    label="اختر الوقت:"
                    options={timeSlotOptions}
                    value={selectedTimeSlot}
                    onChange={(value) => setSelectedTimeSlot(String(value))}
                    className="w-full"
                    placeholder="-- اختر وقتاً --"
                  />
                </div>
              )}
              {selectedDate && selectedServiceId && availableTimeSlots.length === 0 && (
                <p className="text-sm text-red-600 text-right">لا توجد أوقات متاحة في هذا اليوم أو لهذه الخدمة.</p>
              )}

              {/* Notes */}
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 text-right mb-1">ملاحظات (اختياري):</label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-primary-500 focus:border-primary-500 text-right"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 transition"
                disabled={createAppointmentMutation.isPending || !isAuthenticated}
              >
                {createAppointmentMutation.isPending ? 'جاري الحجز...' : isAuthenticated ? 'احجز موعداً الآن' : 'يرجى تسجيل الدخول للحجز'}
              </button>
            </form>
          </section>
        </div>

        {/* Services & Reviews Columns */}
        <div className="lg:col-span-1 space-y-8">
          {/* Services Section */}
          <section className="bg-white rounded-lg shadow-md p-6 border-t-4 border-primary-600">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">الخدمات المتوفرة</h2>
            {provider.services && provider.services.length > 0 ? (
              <div className="space-y-4">
                {provider.services.map((service) => (
                  <div key={service._id} className="bg-gray-50 p-4 rounded-md border border-gray-200 shadow-sm">
                    <p className="font-semibold text-gray-800 mb-1">{service.name}</p>
                    <p className="text-sm text-gray-600 mb-1">المدة: {service.duration} دقيقة | السعر: {service.price} ل.س</p>
                    {service.description && <p className="text-sm text-gray-500">{service.description}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-600 p-4 border rounded-md bg-gray-50">
                <p>لا توجد خدمات مسجلة لهذا المقدم بعد.</p>
              </div>
            )}
          </section>

          {/* Reviews Section */}
          <section className="bg-white rounded-lg shadow-md p-6 border-t-4 border-secondary-500">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">التقييمات</h2>
            {reviewsLoading ? (
              <div className="text-center text-gray-600">جاري تحميل التقييمات...</div>
            ) : reviewsData && reviewsData.length > 0 ? (
              <div className="space-y-4">
                {reviewsData.map((review) => (
                  <div key={review._id} className="bg-gray-50 p-4 rounded-md border border-gray-200 shadow-sm">
                    <p className="font-semibold text-gray-800 mb-1">العميل: {review.customer?.name || 'غير معروف'}</p>
                    <p className="text-sm text-gray-600 mb-1">التقييم: {review.rating} ⭐</p>
                    {review.comment && <p className="text-sm text-gray-500">{review.comment}</p>}
                    <p className="text-xs text-gray-400 mt-2">بتاريخ: {new Date(review.createdAt).toLocaleDateString('ar-SY')}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-600 p-4 border rounded-md bg-gray-50">
                <p>لا يوجد تقييمات لهذا المقدم بعد.</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}