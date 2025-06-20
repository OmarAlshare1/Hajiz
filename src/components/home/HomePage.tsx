'use client';

import React, { useState } from 'react'; // Importing React and useState hook
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'; // Importing search icon from Heroicons
import { search } from '../../lib/api'; // Assuming 'search' API provides search functionality
import { useRouter } from 'next/navigation'; // Next.js router for navigation

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState(''); // State for the search input field
  const [results, setResults] = useState<any[]>([]);   // State to store search results
  const [loading, setLoading] = useState(false);     // State to indicate if a search is in progress
  const [error, setError] = useState<string | null>(null); // State to store any search error messages
  const router = useRouter(); // Initialize Next.js router

  // Function to handle the search submission
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission behavior
    setLoading(true);   // Set loading state to true
    setError(null);     // Clear any previous error messages
    setResults([]);     // Clear previous results before new search

    try {
      // Call the search API with the current query
      const res = await search.providers(searchQuery);
      setResults(res.data?.providers || []); // Update results with providers data
      if (res.data?.providers?.length === 0) {
        setError('لا توجد نتائج مطابقة لبحثك.'); // Set specific message if no results
      }
    } catch (err) {
      console.error('Error during search:', err);
      setError('حدث خطأ أثناء البحث. يرجى المحاولة مرة أخرى.'); // Display a generic error message
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  return (
    <div className="relative isolate min-h-screen bg-gray-100 font-inter pt-24 pb-16">
      {/* Decorative Background Element (Keep if intended for visual flair) */}
      {/* Note: Complex clipPath might have minor performance implications on very old/low-end mobile devices */}
      <div
        className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
        aria-hidden="true"
      >
        <div
          className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-blue-200 to-indigo-200 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
          style={{
            clipPath:
              'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
          }}
        />
      </div>

      {/* Hero Section */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 text-center">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 mb-4 leading-tight">
            حجز - احجز موعدك بسهولة
          </h1>
          <p className="mt-4 text-lg sm:text-xl leading-relaxed text-gray-600">
            منصة حجز المواعيد الأولى في سوريا. احجز موعدك مع أفضل مقدمي الخدمات في مجالات متعددة.
          </p>
          <div className="mt-10">
            {/* Search Bar Form */}
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-y-4 sm:gap-y-0 sm:gap-x-4">
              <label htmlFor="search-input" className="sr-only">البحث عن خدمة أو مقدم خدمة</label>
              <div className="flex-1 relative">
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                  <MagnifyingGlassIcon
                    className="h-5 w-5 text-gray-400 rtl:ml-0 ltr:mr-0" // RTL/LTR adjustment
                    aria-hidden="true"
                  />
                </div>
                <input
                  type="text"
                  name="search"
                  id="search-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full rounded-md border border-gray-300 py-3 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm text-base text-right transition duration-150 ease-in-out"
                  placeholder="ابحث عن خدمة أو مقدم خدمة..."
                  required
                />
              </div>
              <button
                type="submit"
                className="flex-none rounded-md bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow-md hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition duration-150 ease-in-out disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={loading} // Disable button during loading
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 text-white rtl:ml-2 ltr:mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    جاري البحث...
                  </span>
                ) : (
                  'بحث'
                )}
              </button>
            </form>

            {/* Search Feedback: Loading, Error, Results */}
            {error && <div className="mt-6 text-red-600 text-base text-center p-3 bg-red-50 rounded-md border border-red-300">{error}</div>}
            
            {results.length > 0 && (
              <div className="mt-8 text-right bg-white rounded-xl shadow-lg p-6 border-t-4 border-blue-400">
                <h3 className="text-xl sm:text-2xl font-bold mb-4 text-gray-800">نتائج البحث:</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6"> {/* Responsive grid for results */}
                  {results.map((provider) => (
                    <div key={provider._id} className="p-4 border border-gray-200 rounded-lg bg-gray-50 shadow-sm hover:shadow-md transition duration-200 cursor-pointer"
                         onClick={() => router.push(`/providers/${provider._id}`)}>
                      <h4 className="font-bold text-lg text-blue-700 mb-1">{provider.businessName}</h4>
                      <p className="text-sm text-gray-600 mb-1">التصنيف: {provider.category}</p>
                      <p className="text-sm text-gray-500 mb-2">{provider.description || 'لا يوجد وصف.'}</p>
                      {provider.services && provider.services.length > 0 && (
                        <div className="mt-2 text-sm text-gray-700">
                          <span className="font-semibold">الخدمات:</span>{' '}
                          {provider.services.slice(0, 3).map((service: any) => service.name).join(', ')} {/* Limit services shown */}
                          {provider.services.length > 3 && '...'}
                        </div>
                      )}
                      <div className="flex items-center text-sm text-gray-700 mt-2 rtl:justify-end ltr:justify-start">
                        <span className="rtl:ml-1 ltr:mr-1">{provider.rating?.toFixed(1) || 'جديد'}</span>
                        <span className="text-yellow-500">⭐</span>
                        <span className="text-xs text-gray-500 rtl:mr-2 ltr:ml-2">({provider.totalRatings || 0} تقييم)</span>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); router.push(`/providers/${provider._id}`); }}
                              className="mt-4 inline-block text-blue-600 hover:underline text-sm font-semibold transition duration-150 ease-in-out">
                        عرض التفاصيل
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h2
            className="text-base font-semibold leading-7 text-blue-600 cursor-pointer hover:underline mb-2"
            onClick={() => router.push('/policy')}
          >
            لماذا حجز؟
          </h2>
          <p className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 leading-tight">
            كل ما تحتاجه لإدارة مواعيدك
          </p>
          <p className="mt-6 text-lg leading-relaxed text-gray-600">
            نقدم لك منصة متكاملة لحجز وإدارة المواعيد بكل سهولة وأمان.
          </p>
        </div>
        {/* You can add more feature cards/icons here if desired */}
      </div>

      {/* Decorative Background (bottom) - Keep if symmetrical design is desired */}
      <div
        className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
        aria-hidden="true"
      >
        <div
          className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-blue-200 to-indigo-200 opacity-20 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
          style={{
            clipPath:
              'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
          }}
        />
      </div>
    </div>
  );
}
