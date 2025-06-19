'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { appointments } from '../../lib/api';

export default function AppointmentsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['appointments'],
    queryFn: async () => {
      const res = await appointments.getAll();
      return res.data;
    },
    enabled: typeof window !== 'undefined',
  });

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">مواعيدي</h1>
      <div className="bg-white rounded shadow p-4">
        {isLoading ? '...جاري التحميل' : data && data.length > 0 ? (
          <ul>
            {data.map((apt: any) => (
              <li key={apt._id} className="mb-2 border-b pb-2">
                <div>الخدمة: {apt.service?.name}</div>
                <div>المقدم: {apt.serviceProvider?.businessName || apt.serviceProvider}</div>
                <div>التاريخ: {new Date(apt.dateTime).toLocaleString()}</div>
                <div>الحالة: {apt.status}</div>
                {/* TODO: Add review button for completed appointments */}
                {apt.status === 'completed' && !apt.rating && (
                  <button className="bg-green-700 text-white px-2 py-1 rounded mt-2">أضف تقييم</button>
                )}
                {apt.rating && <div>تقييمك: {apt.rating} ⭐</div>}
              </li>
            ))}
          </ul>
        ) : 'لا يوجد مواعيد'}
      </div>
    </div>
  );
}