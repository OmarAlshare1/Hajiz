'use client';
import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useRouter } from 'next/navigation';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'; // Using Heroicons for search icon
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { search, providers as providersApi } from '../../lib/api'; // Explicitly importing for clarity

// Define categories with names and emojis for visual appeal
const categories = [
  { name: 'حلاق', icon: '💈' },
  { name: 'فندق', icon: '🏨' },
  { name: 'مطعم', icon: '🍽️' },
  { name: 'عيادة', icon: '🏥' },
  { name: 'منتجع صحي', icon: '💆‍♀️' },
  { name: 'رياضة', icon: '🏋️‍♂️' },
  { name: 'تعليم', icon: '📚' },
  { name: 'فعاليات', icon: '🎉' },
  { name: 'تنظيف', icon: '🧹' },
  { name: 'صيانة', icon: '🛠️' },
  { name: 'أخرى', icon: '✨' },
];

export default function HomePage() {
  // Defining the expected user structure for type safety
  interface AuthUser { _id: string; name: string; email?: string; phone: string; role: 'customer' | 'provider'; }

  const { user, isLoading: userLoading, isAuthenticated } = useAuth<AuthUser>();
  const router = useRouter();
  const queryClient = useQueryClient(); // For invalidating queries after mutations

  const [showModal, setShowModal] = useState(false); // State to control the visibility of the "Add Service" modal
  const [searchQuery, setSearchQuery] = useState(''); // State for the search input field
  const [searchResults, setSearchResults] = useState<any[]>([]); // State to store search results
  const [isSearching, setIsSearching] = useState(false); // State to indicate if a search is in progress

  // State for the "Add Service" modal form
  const [addServiceFormData, setAddServiceFormData] = useState({
    name: '',
    duration: 0, // Default to 0, input type number handles empty string to 0 if needed
    price: 0,    // Default to 0
    description: '',
  });
  const [addServiceError, setAddServiceError] = useState('');     // Error message for add service form
  const [addServiceSuccess, setAddServiceSuccess] = useState(''); // Success message for add service form

  // useQuery hook to fetch popular providers
  const { data: popularProviders, isLoading: popularLoading } = useQuery({
    queryKey: ['popularProviders'],
    queryFn: async () => {
      // Fetch popular providers (empty query string typically fetches all or popular by default)
      const res = await search.providers('');
      return res.data?.providers || [];
    },
    // Keep data fresh for 5 minutes, and garbage collect after 5 minutes of inactivity
    staleTime: 5 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    // Only enable query if window object is defined (client-side rendering)
    enabled: typeof window !== 'undefined',
  });

  // Handles the submission of the main search bar
  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true); // Indicate search is in progress
    setSearchResults([]); // Clear previous search results

    try {
      // Call the search API with the current query
      const res = await search.providers(searchQuery);
      setSearchResults(res.data?.providers || []); // Update results
    } catch (error) {
      console.error('Error during search:', error);
      setSearchResults([]); // Clear results on error
      // Optionally, show a user-facing error message here
    } finally {
      setIsSearching(false); // End search
    }
  };

  // useMutation hook for adding a new service via the modal
  const addServiceMutation = useMutation({
    mutationFn: providersApi.addService, // The API function to call
    onSuccess: () => {
      setAddServiceSuccess('تمت إضافة الخدمة بنجاح!'); // Show success message
      setAddServiceError(''); // Clear any previous errors
      // Invalidate queries to refetch provider profile data (e.g., to show the new service)
      queryClient.invalidateQueries({ queryKey: ['provider-profile'] });
      // Reset form fields
      setAddServiceFormData({ name: '', duration: 0, price: 0, description: '' });
      // Close modal after a short delay
      setTimeout(() => setShowModal(false), 1500);
    },
    onError: (err: any) => {
      // Display error message from the API or a generic one
      setAddServiceError(err.response?.data?.message || 'فشل إضافة الخدمة. يرجى التأكد من البيانات والمحاولة مرة أخرى.');
      setAddServiceSuccess(''); // Clear any success message
      console.error('Add service error:', err);
    },
  });

  // Handles submission of the "Add Service" modal form
  const handleAddServiceModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Basic client-side validation
    if (!addServiceFormData.name || addServiceFormData.duration <= 0 || addServiceFormData.price <= 0) {
      setAddServiceError('الرجاء ملء جميع الحقول المطلوبة (الاسم، المدة، السعر) بشكل صحيح.');
      return;
    }
    setAddServiceError(''); // Clear previous error before mutation
    addServiceMutation.mutate(addServiceFormData); // Trigger the mutation
  };

  // Handles changes in "Add Service" modal input fields
  const handleAddServiceChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setAddServiceFormData((prev) => ({
      ...prev,
      // Convert to number for 'number' type inputs, otherwise keep as string
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }));
  };

  return (
    <div className="relative min-h-screen bg-gray-100 font-inter">
      {/* Hero Section */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center py-12 sm:py-16 pt-24">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4 leading-tight">
          مرحباً {user?.name || ''} 👋
        </h1>
        <p className="text-md sm:text-lg lg:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          اختر تصنيف الخدمة التي تبحث عنها، أو أضف خدمتك الخاصة!
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto flex flex-col sm:flex-row gap-y-3 sm:gap-y-0 sm:gap-x-4 mb-12">
          <label htmlFor="search-input" className="sr-only">البحث عن خدمات</label>
          <input
            id="search-input"
            name="search-input"
            type="text"
            required
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-md border border-gray-300 bg-white px-4 py-2.5 text-gray-900 shadow-sm placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm text-base transition duration-150 ease-in-out"
            placeholder="ابحث عن اسم عمل، خدمة، أو تصنيف..."
          />
          <button
            type="submit"
            className="flex-none rounded-md bg-blue-600 px-4 py-2.5 text-base font-semibold text-white shadow-md hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition duration-150 ease-in-out disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={isSearching}
          >
            {isSearching ? 'جاري البحث...' : (
              <>
                <MagnifyingGlassIcon className="h-5 w-5 inline-block rtl:ml-2 ltr:mr-2" aria-hidden="true" /> بحث
              </>
            )}
          </button>
        </form>

        {/* Search Results Display */}
        {isSearching && (
          <div className="text-center text-blue-600 text-lg mb-8">جاري البحث...</div>
        )}
        {!isSearching && searchQuery && searchResults.length === 0 && (
          <div className="text-center text-gray-600 text-lg mb-8">لا توجد نتائج مطابقة لبحثك.</div>
        )}
        {searchResults.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-4xl mx-auto mb-12 text-right border border-gray-200">
            <h3 className="text-xl sm:text-2xl font-bold mb-4 text-gray-800">نتائج البحث:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {searchResults.map((provider: any) => (
                <div key={provider._id} className="bg-gray-50 rounded-lg shadow-sm p-4 hover:shadow-md transition duration-200 border border-gray-100">
                  <h4 className="font-bold text-lg text-blue-700 mb-1">{provider.businessName}</h4>
                  <p className="text-sm text-gray-600">التصنيف: {provider.category}</p>
                  <p className="text-sm text-gray-500">العنوان: {provider.location?.address || 'غير محدد'}</p>
                  <p className="text-sm text-gray-500 flex items-center">
                    التقييم: {provider.rating?.toFixed(1) || 'جديد'}
                    <span className="text-yellow-400 rtl:mr-1 ltr:ml-1">⭐</span>
                  </p>
                  {provider.services && provider.services.length > 0 && (
                    <div className="mt-2 text-sm text-gray-700">
                      <span className="font-semibold">الخدمات:</span> {provider.services.map((s: any) => s.name).join(', ')}
                    </div>
                  )}
                  <button onClick={() => router.push(`/providers/${provider._id}`)} className="mt-4 text-blue-600 hover:underline text-sm font-semibold transition duration-150 ease-in-out">عرض التفاصيل</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Categories Section */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center mb-8">استكشف الفئات</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {categories.map((cat) => (
            <div
              key={cat.name}
              onClick={() => router.push(`/providers?category=${cat.name}`)}
              className="bg-white rounded-xl shadow-md p-4 sm:p-6 flex flex-col items-center justify-center text-center transform transition duration-300 hover:scale-105 hover:shadow-lg cursor-pointer border-b-4 border-blue-500 hover:border-blue-600"
            >
              <span className="text-3xl sm:text-4xl mb-3">{cat.icon}</span>
              <span className="font-semibold text-gray-700 text-base sm:text-lg">{cat.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended Providers Section */}
      {isAuthenticated && popularProviders?.length > 0 && (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center mb-8">مقدمو خدمات ننصح بهم</h2>
          {popularLoading ? (
            <div className="text-center text-gray-600 text-lg">جاري تحميل التوصيات...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {popularProviders.slice(0, 3).map((provider: any) => ( // Limiting to 3 for brevity on home page
                <div key={provider._id} className="bg-white rounded-xl shadow-md overflow-hidden transform transition duration-300 hover:scale-105 hover:shadow-lg cursor-pointer border border-gray-200">
                  <div className="p-6">
                    <h3 className="font-bold text-xl text-blue-700 mb-2">{provider.businessName}</h3>
                    <p className="text-sm text-gray-600 mb-1">التصنيف: {provider.category}</p>
                    <p className="text-sm text-gray-500 mb-2">العنوان: {provider.location?.address || 'غير محدد'}</p>
                    <div className="flex items-center text-sm text-gray-700">
                      <span className="rtl:ml-1 ltr:mr-1">{provider.rating?.toFixed(1) || 'جديد'}</span>
                      <span className="text-yellow-400">⭐</span>
                      <span className="text-xs text-gray-500 rtl:mr-2 ltr:ml-2">({provider.totalRatings || 0} تقييم)</span>
                    </div>
                    <button onClick={() => router.push(`/providers/${provider._id}`)} className="mt-4 text-blue-600 hover:underline text-sm font-semibold transition duration-150 ease-in-out">عرض التفاصيل</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Floating Add Service Button (for providers only) */}
      {user?.role === 'provider' && (
        <>
          <button
            onClick={() => {
              setShowModal(true); // Open modal
              setAddServiceError(''); // Clear errors when opening
              setAddServiceSuccess(''); // Clear success when opening
              setAddServiceFormData({ name: '', duration: 0, price: 0, description: '' }); // Reset form
            }}
            className="fixed bottom-8 right-8 z-40 bg-green-600 text-white rounded-full w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center text-3xl sm:text-4xl shadow-lg hover:bg-green-700 transition transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            title="أضف خدمة جديدة"
          >
            +
          </button>

          {/* Add Service Modal */}
          {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 sm:p-6">
              <div className="bg-white rounded-xl shadow-2xl p-6 sm:p-8 w-full max-w-md relative animate-fade-in-scale">
                <button
                  className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-3xl transition"
                  onClick={() => setShowModal(false)}
                  title="إغلاق"
                >
                  &times; {/* HTML entity for multiplication sign, often used for close */}
                </button>
                <h2 className="text-xl sm:text-2xl font-bold mb-6 text-center text-gray-800">إضافة خدمة جديدة</h2>

                {addServiceMutation.isPending && <div className="text-center text-blue-600 text-lg mb-4">جاري الإضافة...</div>}
                {addServiceError && (
                  <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg relative mb-4 text-sm sm:text-base text-right" role="alert">
                    <span className="block">{addServiceError}</span>
                  </div>
                )}
                {addServiceSuccess && (
                  <div className="bg-green-50 border border-green-300 text-green-700 px-4 py-3 rounded-lg relative mb-4 text-sm sm:text-base text-right" role="alert">
                    <span className="block">{addServiceSuccess}</span>
                  </div>
                )}

                <form onSubmit={handleAddServiceModalSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="serviceName" className="block text-sm sm:text-base font-medium text-gray-700 text-right mb-1">اسم الخدمة:</label>
                    <input
                      id="serviceName"
                      name="name"
                      type="text"
                      value={addServiceFormData.name}
                      onChange={handleAddServiceChange}
                      className="w-full border border-gray-300 rounded-md p-3 focus:ring-blue-500 focus:border-blue-500 text-right text-base placeholder-gray-400"
                      placeholder="اسم الخدمة، مثل: قص شعر، تدليك"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="servicePrice" className="block text-sm sm:text-base font-medium text-gray-700 text-right mb-1">السعر (ل.س):</label>
                    <input
                      id="servicePrice"
                      name="price"
                      type="number"
                      value={addServiceFormData.price === 0 ? '' : addServiceFormData.price} // Display empty string for 0 to make placeholder visible
                      onChange={handleAddServiceChange}
                      className="w-full border border-gray-300 rounded-md p-3 focus:ring-blue-500 focus:border-blue-500 text-right text-base placeholder-gray-400"
                      placeholder="5000"
                      required
                      min="0" // Ensure price is not negative
                    />
                  </div>
                  <div>
                    <label htmlFor="serviceDuration" className="block text-sm sm:text-base font-medium text-gray-700 text-right mb-1">المدة (دقائق):</label>
                    <input
                      id="serviceDuration"
                      name="duration"
                      type="number"
                      value={addServiceFormData.duration === 0 ? '' : addServiceFormData.duration} // Display empty string for 0
                      onChange={handleAddServiceChange}
                      className="w-full border border-gray-300 rounded-md p-3 focus:ring-blue-500 focus:border-blue-500 text-right text-base placeholder-gray-400"
                      placeholder="30"
                      required
                      min="1" // Ensure duration is at least 1 minute
                    />
                  </div>
                  <div>
                    <label htmlFor="serviceDescription" className="block text-sm sm:text-base font-medium text-gray-700 text-right mb-1">الوصف (اختياري):</label>
                    <textarea
                      id="serviceDescription"
                      name="description"
                      value={addServiceFormData.description}
                      onChange={handleAddServiceChange}
                      rows={4} // Increased rows for better usability on mobile
                      className="w-full border border-gray-300 rounded-md p-3 focus:ring-blue-500 focus:border-blue-500 text-right text-base placeholder-gray-400 resize-y" // Added resize-y
                      placeholder="وصف تفصيلي للخدمة، مثل: قص شعر رجالي مع غسيل وتصفيف."
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed text-base font-semibold"
                    disabled={addServiceMutation.isPending}
                  >
                    {addServiceMutation.isPending ? 'جاري الإضافة...' : 'حفظ الخدمة'}
                  </button>
                </form>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
