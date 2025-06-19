'use client';

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { providers, search as searchApi } from '../../lib/api';
import Link from 'next/link';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import CustomSelect from '../../components/CustomSelect'; // Import the CustomSelect component

// Categories for filtering (ensure these match your backend provider categories)
const filterCategories = [
  { value: 'الكل', label: 'الكل' },
  { value: 'تجميل وسبا', label: 'تجميل وسبا' },
  { value: 'صحة ولياقة', label: 'صحة ولياقة' },
  { value: 'تعليم', label: 'تعليم' },
  { value: 'صيانة وخدمات منزلية', label: 'صيانة وخدمات منزلية' },
  { value: 'تنظيم فعاليات', label: 'تنظيم فعاليات' },
  { value: 'حلاق', label: 'حلاق' },
  { value: 'فندق', label: 'فندق' },
  { value: 'مطعم', label: 'مطعم' },
  { value: 'عيادة', label: 'عيادة' },
  { value: 'أخرى', label: 'أخرى' },
];

// Options for Minimum Rating filter
const ratingOptions = [
  { value: 0, label: 'أي تقييم' },
  { value: 1, label: '1 نجمة فما فوق' },
  { value: 2, label: '2 نجوم فما فوق' },
  { value: 3, label: '3 نجوم فما فوق' },
  { value: 4, label: '4 نجوم فما فوق' },
  { value: 5, label: '5 نجوم' },
];

export default function ProvidersListPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('الكل');
  const [minRating, setMinRating] = useState(0);

  // Fetch all providers based on filters
  const { data: allProviders, isLoading, error } = useQuery({
    queryKey: ['all-providers', searchQuery, selectedCategory, minRating],
    queryFn: async () => {
      const params: { query?: string; category?: string; rating?: number } = {};
      if (searchQuery) {
        params.query = searchQuery;
      }
      if (selectedCategory !== 'الكل') {
        params.category = selectedCategory;
      }
      if (minRating > 0) {
        params.rating = minRating;
      }
      const res = await providers.getAll(params);
      return res.data?.providers || res.data;
    },
    enabled: typeof window !== 'undefined',
    staleTime: 60 * 1000,
    cacheTime: 5 * 60 * 1000,
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className="container mx-auto p-8 pt-24 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">استكشف مقدمي الخدمات</h1>

      {/* Filter and Search Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8 border-t-4 border-primary-600">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">البحث والتصفية</h2>
        <form onSubmit={handleSearchSubmit} className="space-y-4 md:space-y-0 md:flex md:gap-4 items-end">
          {/* Search Input */}
          <div className="flex-1">
            <label htmlFor="search-query" className="block text-sm font-medium text-gray-700 text-right mb-1">بحث بالاسم أو الوصف:</label>
            <input
              id="search-query"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="اسم العمل، الخدمة، الوصف..."
              className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-primary-500 focus:border-primary-500 text-right"
            />
          </div>

          {/* Category Filter - Using CustomSelect */}
          <div className="flex-1">
            <CustomSelect
              label="التصنيف:"
              options={filterCategories}
              value={selectedCategory}
              onChange={setSelectedCategory}
              className="w-full"
              placeholder="اختر التصنيف"
            />
          </div>

          {/* Rating Filter - Using CustomSelect */}
          <div className="flex-1">
            <CustomSelect
              label="التقييم الأدنى:"
              options={ratingOptions}
              value={minRating}
              onChange={setMinRating}
              className="w-full"
              placeholder="أي تقييم"
            />
          </div>

          <button
            type="submit"
            className="flex-none bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700 transition self-end"
          >
            <MagnifyingGlassIcon className="h-5 w-5 inline-block ml-2 -mt-0.5" aria-hidden="true" /> تصفية
          </button>
        </form>
      </div>

      {/* Providers List */}
      {isLoading ? (
        <div className="text-center p-8">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-primary-600 border-opacity-50 mb-6 mx-auto"></div>
          <p className="text-gray-700">جاري تحميل مقدمي الخدمات...</p>
        </div>
      ) : error ? (
        <div className="text-center p-8 bg-white rounded-lg shadow-md border-t-4 border-red-600">
          <h2 className="text-xl font-bold text-red-600 mb-4">خطأ في تحميل البيانات</h2>
          <p className="text-gray-700">حدث خطأ أثناء جلب مقدمي الخدمات. يرجى المحاولة مرة أخرى.</p>
        </div>
      ) : allProviders && allProviders.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {allProviders.map((provider: any) => (
            <div key={provider._id} className="bg-white rounded-xl shadow-md overflow-hidden transform transition duration-300 hover:scale-105 hover:shadow-lg cursor-pointer border-b-4 border-primary-500">
              <div className="p-6">
                <h3 className="font-bold text-xl text-primary-700 mb-2">{provider.businessName}</h3>
                <p className="text-sm text-gray-600 mb-1">التصنيف: {provider.category}</p>
                <p className="text-sm text-gray-500 mb-2">العنوان: {provider.location?.address || 'غير محدد'}</p>
                <div className="flex items-center text-sm text-gray-700">
                  <span className="ml-1">{provider.rating?.toFixed(1) || 'جديد'}</span>
                  <span>⭐</span>
                  <span className="text-xs text-gray-500 mr-2">({provider.totalRatings || 0} تقييم)</span>
                </div>
                {provider.services && provider.services.length > 0 && (
                  <div className="mt-2 text-sm text-gray-700">
                    <span className="font-semibold">الخدمات:</span> {provider.services.map((s: any) => s.name).join(', ')}
                  </div>
                )}
                <Link href={`/providers/${provider._id}`} className="mt-4 inline-block bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 text-center text-sm font-semibold transition">
                  عرض التفاصيل
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center p-8 bg-white rounded-lg shadow-md border-t-4 border-gray-400">
          <p className="text-lg text-gray-700">لا يوجد مقدمو خدمات مطابقون لمعايير البحث حالياً.</p>
        </div>
      )}
    </div>
  );
}