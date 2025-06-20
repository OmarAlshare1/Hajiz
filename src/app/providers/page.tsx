'use client';

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { providers, search as searchApi } from '../../lib/api'; // API imports
import Link from 'next/link'; // For navigation to provider details
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'; // Icon for search button
import CustomSelect from '../../components/CustomSelect'; // Custom dropdown component

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
  const [searchQuery, setSearchQuery] = useState(''); // State for text search query
  const [selectedCategory, setSelectedCategory] = useState('الكل'); // State for selected category filter
  const [minRating, setMinRating] = useState(0); // State for minimum rating filter

  // Fetch all providers based on current filters
  const { data: allProviders, isLoading, error } = useQuery({
    queryKey: ['all-providers', searchQuery, selectedCategory, minRating], // Query key updates with filter changes
    queryFn: async () => {
      // Prepare parameters for the API call
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
      // Call the providers API with the constructed parameters
      const res = await providers.getAll(params);
      // Return the providers data, handling potential differences in API response structure
      return res.data?.providers || res.data;
    },
    enabled: typeof window !== 'undefined', // Only run query if in a browser environment
    staleTime: 60 * 1000, // Data considered fresh for 1 minute
    gcTime: 5 * 60 * 1000, // Data garbage collected after 5 minutes of inactivity
  });

  // Handle form submission (mainly for accessibility, as filters trigger refetch via queryKey change)
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // No explicit action here as useQuery handles data fetching on queryKey change
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 bg-gray-100 min-h-screen font-inter">
      <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-8 text-center">استكشف مقدمي الخدمات</h1>

      {/* Filter and Search Section Card */}
      <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 mb-8 border-t-4 border-blue-600">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-6 text-right">البحث والتصفية</h2>
        <form onSubmit={handleSearchSubmit} className="space-y-6 md:space-y-0 md:flex md:gap-4 items-end">
          {/* Search Input */}
          <div className="flex-1 w-full"> {/* flex-1 to allow it to grow, w-full for stacking */}
            <label htmlFor="search-query" className="block text-sm sm:text-base font-medium text-gray-700 text-right mb-1">بحث بالاسم أو الوصف:</label>
            <input
              id="search-query"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="اسم العمل، الخدمة، الوصف..."
              className="w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500 text-right text-base placeholder-gray-400 transition duration-150 ease-in-out"
            />
          </div>

          {/* Category Filter - Using CustomSelect */}
          <div className="flex-1 w-full">
            <label htmlFor="category-filter" className="sr-only">التصنيف:</label> {/* SR-only label for CustomSelect which has its own label prop */}
            <CustomSelect
              label="التصنيف" // Label displayed by CustomSelect
              options={filterCategories}
              value={selectedCategory}
              onChange={(value) => setSelectedCategory(String(value))}
              className="w-full" // Passed to CustomSelect's root div
              containerClasses="rounded-md shadow-sm border border-gray-300 focus-within:ring-blue-500 focus-within:border-blue-500"
              selectClasses="py-3 px-3 text-base text-gray-900 focus:outline-none"
              placeholder="اختر التصنيف"
              id="category-filter" // Explicit ID for accessibility
            />
          </div>

          {/* Rating Filter - Using CustomSelect */}
          <div className="flex-1 w-full">
            <label htmlFor="rating-filter" className="sr-only">التقييم الأدنى:</label> {/* SR-only label for CustomSelect */}
            <CustomSelect
              label="التقييم الأدنى" // Label displayed by CustomSelect
              options={ratingOptions}
              value={minRating}
              onChange={(value) => setMinRating(Number(value))}
              className="w-full"
              containerClasses="rounded-md shadow-sm border border-gray-300 focus-within:ring-blue-500 focus-within:border-blue-500"
              selectClasses="py-3 px-3 text-base text-gray-900 focus:outline-none"
              placeholder="أي تقييم"
              id="rating-filter" // Explicit ID for accessibility
            />
          </div>

          {/* Filter Button */}
          <button
            type="submit"
            className="flex-none w-full md:w-auto bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition duration-150 ease-in-out font-semibold text-base shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={isLoading} // Disable button while loading
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 text-white rtl:ml-2 ltr:mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                جاري التصفية...
              </span>
            ) : (
              <>
                <MagnifyingGlassIcon className="h-5 w-5 inline-block rtl:ml-2 ltr:mr-2" aria-hidden="true" /> تصفية
              </>
            )}
          </button>
        </form>
      </div>

      {/* Providers List Section */}
      {isLoading ? (
        <div className="text-center p-8 bg-white rounded-xl shadow-lg border-t-4 border-blue-400">
          <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-blue-500 mb-6 mx-auto border-opacity-75"></div>
          <p className="text-gray-700 text-lg">جاري تحميل مقدمي الخدمات...</p>
        </div>
      ) : error ? (
        <div className="text-center p-8 bg-white rounded-xl shadow-lg border-t-4 border-red-600">
          <h2 className="text-xl sm:text-2xl font-bold text-red-600 mb-4">خطأ في تحميل البيانات</h2>
          <p className="text-gray-700 text-lg">حدث خطأ أثناء جلب مقدمي الخدمات. يرجى المحاولة مرة أخرى.</p>
        </div>
      ) : allProviders && allProviders.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {allProviders.map((provider: any) => (
            <div key={provider._id} className="bg-white rounded-xl shadow-md overflow-hidden transform transition duration-300 hover:scale-105 hover:shadow-lg cursor-pointer border-b-4 border-blue-500">
              {/* Optional: Provider image or placeholder */}
              {provider.images && provider.images[0] ? (
                <img src={provider.images[0]} alt={provider.businessName} className="w-full h-48 object-cover" />
              ) : (
                <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-500 text-lg font-semibold">
                  {provider.category} {provider.businessName}
                </div>
              )}
              <div className="p-6 text-right"> {/* Added text-right for RTL alignment */}
                <h3 className="font-bold text-xl text-blue-700 mb-2">{provider.businessName}</h3>
                <p className="text-sm text-gray-600 mb-1">التصنيف: {provider.category}</p>
                <p className="text-sm text-gray-500 mb-2">العنوان: {provider.location?.address || 'غير محدد'}</p>
                <div className="flex items-center text-sm text-gray-700 rtl:justify-end ltr:justify-start"> {/* RTL/LTR alignment for rating */}
                  <span className="rtl:ml-1 ltr:mr-1">{provider.rating?.toFixed(1) || 'جديد'}</span>
                  <span className="text-yellow-400">⭐</span>
                  <span className="text-xs text-gray-500 rtl:mr-2 ltr:ml-2">({provider.totalRatings || 0} تقييم)</span>
                </div>
                {provider.services && provider.services.length > 0 && (
                  <div className="mt-2 text-sm text-gray-700">
                    <span className="font-semibold">الخدمات:</span> {provider.services.map((s: any) => s.name).join(', ')}
                  </div>
                )}
                <Link href={`/providers/${provider._id}`} className="mt-4 inline-block bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 text-center text-base font-semibold transition shadow-sm">
                  عرض التفاصيل
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center p-8 bg-white rounded-xl shadow-lg border-t-4 border-gray-400">
          <p className="text-lg text-gray-700">لا يوجد مقدمو خدمات مطابقون لمعايير البحث حالياً.</p>
          <p className="text-md text-gray-500 mt-2">حاول تغيير معايير البحث أو تصفح الفئات المختلفة.</p>
        </div>
      )}
    </div>
  );
}
