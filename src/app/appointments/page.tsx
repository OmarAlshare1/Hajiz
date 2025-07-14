'use client';

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { appointments } from '../../lib/api';
import '../../styles/syrian-theme.css';

export default function AppointmentsPage() {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['appointments'],
    queryFn: async () => {
      const res = await appointments.getAll();
      return res.data;
    },
    enabled: isClient,
  });

  return (
    <div className="min-h-screen bg-gray-100 font-inter">
      {/* Syrian Hero Header */}
      <div className="syrian-hero relative overflow-hidden py-16">
        {/* Syrian Wave Background */}
        <div className="syrian-wave-bg"></div>
        
        {/* Syrian Flag Decorations */}
        
        
        {/* Hajiz Logo */}
        <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-24 h-24">
          <img src="/hajiz logo.jpeg" alt="Hajiz Logo" className="w-full h-full object-contain rounded-full shadow-lg" />
        </div>
        
        <div className="relative z-10 text-center pt-16">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4 drop-shadow-lg">
            مواعيدي
          </h1>
          <p className="text-white/90 text-lg drop-shadow">
            إدارة مواعيدك المحجوزة
          </p>
        </div>
      </div>
      
      <div className="container mx-auto p-4 sm:p-6 lg:p-8 -mt-8 relative z-10">
        <div className="max-w-4xl mx-auto py-8 px-6 sm:px-8 lg:px-10 bg-white rounded-xl shadow-2xl border-t-4 border-blue-600">
          {isLoading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">جاري التحميل...</p>
            </div>
          )}
          
          {error && (
            <div className="text-center py-8">
              <p className="text-red-600">خطأ في تحميل المواعيد</p>
            </div>
          )}
          
          {data && data.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-600">لا توجد مواعيد محجوزة</p>
            </div>
          )}
          
          {data && data.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                مواعيدك
              </h2>
              {data.map((appointment: any) => (
                <div key={appointment.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-800 mb-1">{appointment.service || 'خدمة'}</h3>
                      <p className="text-red-600 font-medium">{appointment.provider || 'غير محدد'}</p>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <span className={`px-4 py-2 rounded-full text-sm font-bold border-2 ${
                        appointment.status === 'confirmed' ? 'bg-green-50 text-green-800 border-green-200' :
                        appointment.status === 'pending' ? 'bg-yellow-50 text-yellow-800 border-yellow-200' :
                        'bg-red-50 text-red-800 border-red-200'
                      }`}>
                        {appointment.status === 'confirmed' && '✓ مؤكد'}
                        {appointment.status === 'pending' && '⏳ في الانتظار'}
                        {appointment.status === 'cancelled' && '✗ ملغي'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center bg-gray-50 p-3 rounded-lg">
                      <div className="bg-blue-100 p-2 rounded-full mr-3">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">التاريخ</p>
                        <p className="font-semibold text-gray-800">{appointment.date || 'غير محدد'}</p>
                      </div>
                    </div>
                    <div className="flex items-center bg-gray-50 p-3 rounded-lg">
                      <div className="bg-green-100 p-2 rounded-full mr-3">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">الوقت</p>
                        <p className="font-semibold text-gray-800">{appointment.time || 'غير محدد'}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-3">
                    {appointment.status === 'pending' && (
                      <button className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 py-2 rounded-lg text-sm font-bold transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg">
                        إلغاء الموعد
                      </button>
                    )}
                    <button className="bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-800 px-6 py-2 rounded-lg text-sm font-bold transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg border border-gray-300">
                      عرض التفاصيل
                    </button>
                    {appointment.status === 'confirmed' && (
                      <button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-2 rounded-lg text-sm font-bold transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg">
                        إعادة جدولة
                      </button>
                    )}
                  </div>
                  {appointment.notes && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-gray-600 text-sm">
                        ملاحظات: {appointment.notes}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}