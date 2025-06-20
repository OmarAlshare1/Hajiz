'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { appointments } from '../../lib/api'; // Ensure this path is correct

export default function AppointmentsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['appointments'],
    queryFn: async () => {
      const res = await appointments.getAll();
      return res.data;
    },
    enabled: typeof window !== 'undefined',
  });

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-gray-800">مواعيدي</h1>

      {isLoading && (
        <div className="flex justify-center items-center h-48">
          <p className="text-gray-600 text-lg">جاري التحميل...</p>
        </div>
      )}

      {error && (
        <div className="flex justify-center items-center h-48">
          <p className="text-red-600 text-lg">حدث خطأ أثناء تحميل المواعيد.</p>
        </div>
      )}

      {!isLoading && !error && (!data || data.length === 0) && (
        <div className="flex justify-center items-center h-48">
          <p className="text-gray-600 text-lg">لا يوجد مواعيد حاليًا.</p>
        </div>
      )}

      {!isLoading && !error && data && data.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((apt: any) => (
            <div key={apt._id} className="bg-white rounded-lg shadow-md p-4 sm:p-5 border border-gray-200 hover:shadow-lg transition-shadow duration-300">
              <div className="flex flex-col space-y-2">
                <div className="text-lg font-semibold text-gray-800">
                  <span className="text-gray-600">الخدمة:</span> {apt.service?.name}
                </div>
                <div className="text-base text-gray-700">
                  <span className="text-gray-600">المقدم:</span> {apt.serviceProvider?.businessName || apt.serviceProvider}
                </div>
                <div className="text-base text-gray-700">
                  <span className="text-gray-600">التاريخ:</span> {new Date(apt.dateTime).toLocaleString('ar-EG', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true,
                  })}
                </div>
                <div className={`text-base font-medium ${
                    apt.status === 'completed' ? 'text-green-600' :
                    apt.status === 'cancelled' ? 'text-red-600' :
                    'text-blue-600'
                }`}>
                  <span className="text-gray-600">الحالة:</span> {apt.status === 'completed' ? 'مكتملة' : apt.status === 'pending' ? 'معلقة' : apt.status === 'cancelled' ? 'ملغاة' : apt.status}
                </div>

                {apt.status === 'completed' && !apt.rating && (
                  <button className="mt-3 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md shadow-sm transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50">
                    أضف تقييم
                  </button>
                )}
                {apt.rating && (
                  <div className="mt-3 text-yellow-500 font-bold">
                    تقييمك: {apt.rating} ⭐
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}