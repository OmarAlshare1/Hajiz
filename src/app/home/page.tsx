'use client';
import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useRouter } from 'next/navigation';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// FIX: Explicitly import search and providers as providersApi
import { search, providers as providersApi } from '../../lib/api'; 

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
  interface AuthUser { _id: string; name: string; email?: string; phone: string; role: 'customer' | 'provider'; }
  const { user, isLoading: userLoading, isAuthenticated } = useAuth<AuthUser>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // State for the "Add Service" modal form
  const [addServiceFormData, setAddServiceFormData] = useState({
    name: '',
    duration: 0,
    price: 0,
    description: '',
  });
  const [addServiceError, setAddServiceError] = useState('');
  const [addServiceSuccess, setAddServiceSuccess] = useState('');

  const { data: popularProviders, isLoading: popularLoading } = useQuery({
    queryKey: ['popularProviders'],
    queryFn: async () => {
      const res = await search.providers(''); // 'search' should now be recognized
      return res.data?.providers || [];
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    enabled: typeof window !== 'undefined',
  });

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    try {
      const res = await search.providers(searchQuery); // 'search' should now be recognized
      setSearchResults(res.data?.providers || []);
    } catch (error) {
      console.error('Error during search:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Mutation for adding a new service
  const addServiceMutation = useMutation({
    mutationFn: providersApi.addService,
    onSuccess: () => {
      setAddServiceSuccess('تمت إضافة الخدمة بنجاح!');
      setAddServiceError('');
      queryClient.invalidateQueries({ queryKey: ['provider-profile'] });
      setAddServiceFormData({ name: '', duration: 0, price: 0, description: '' });
      setTimeout(() => setShowModal(false), 1500);
    },
    onError: (err: any) => {
      setAddServiceError(err.response?.data?.message || 'فشل إضافة الخدمة.');
      setAddServiceSuccess('');
      console.error('Add service error:', err);
    },
  });

  const handleAddServiceModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addServiceFormData.name || addServiceFormData.duration <= 0 || addServiceFormData.price <= 0) {
      setAddServiceError('الرجاء ملء جميع الحقول المطلوبة (الاسم، المدة، السعر).');
      return;
    }
    setAddServiceError('');
    addServiceMutation.mutate(addServiceFormData);
  };

  const handleAddServiceChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setAddServiceFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }));
  };

  return (
    <div className="relative min-h-screen bg-gray-50 pt-24 pb-16">
      {/* Hero Section */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center py-12 sm:py-16">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4 animate-fade-in-down">
          مرحباً {user?.name || ''} 👋
        </h1>
        <p className="text-lg sm:text-xl text-gray-600 mb-8 animate-fade-in">
          اختر تصنيف الخدمة التي تبحث عنها، أو أضف خدمتك الخاصة!
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto flex gap-x-4 mb-12 animate-fade-in-up">
          <label htmlFor="search-input" className="sr-only">
            البحث عن خدمات
          </label>
          <input
            id="search-input"
            name="search-input"
            type="text"
            required
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="min-w-0 flex-auto rounded-md border-0 bg-white/50 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
            placeholder="ابحث عن اسم عمل، خدمة، أو تصنيف..."
          />
          <button
            type="submit"
            className="flex-none rounded-md bg-primary-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
          >
            <MagnifyingGlassIcon className="h-5 w-5 inline-block -mt-1" aria-hidden="true" /> بحث
          </button>
        </form>

        {/* Search Results Display */}
        {isSearching && (
          <div className="text-center text-primary-600 mb-8">جاري البحث...</div>
        )}
        {searchResults.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 max-w-4xl mx-auto mb-12 text-right">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">نتائج البحث:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {searchResults.map((provider: any) => (
                <div key={provider._id} className="border border-gray-200 rounded-lg p-4 bg-gray-50 hover:shadow-md transition">
                  <h4 className="font-bold text-lg text-primary-700">{provider.businessName}</h4>
                  <p className="text-sm text-gray-600">التصنيف: {provider.category}</p>
                  <p className="text-sm text-gray-500">العنوان: {provider.location?.address || 'غير محدد'}</p>
                  <p className="text-sm text-gray-500">التقييم: {provider.rating?.toFixed(1) || 'جديد'} ⭐</p>
                  {provider.services && provider.services.length > 0 && (
                    <div className="mt-2 text-sm text-gray-700">
                      <span className="font-semibold">الخدمات:</span> {provider.services.map((s: any) => s.name).join(', ')}
                    </div>
                  )}
                  <button onClick={() => router.push(`/providers/${provider._id}`)} className="mt-4 text-primary-600 hover:underline text-sm">عرض التفاصيل</button>
                </div>
              ))}
            </div>
          </div>
        )}
        {searchQuery && !isSearching && searchResults.length === 0 && (
            <div className="text-center text-gray-600 mb-8">لا توجد نتائج مطابقة لبحثك.</div>
        )}
      </div>

      {/* Categories Section */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 mb-16">
        <h2 className="text-3xl font-bold text-gray-800 text-center mb-8">استكشف الفئات</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {categories.map((cat) => (
            <div
              key={cat.name}
              onClick={() => router.push(`/providers?category=${cat.name}`)}
              className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center justify-center text-center transform transition duration-300 hover:scale-105 hover:shadow-lg cursor-pointer border-b-4 border-primary-500 hover:border-primary-600"
            >
              <span className="text-4xl mb-3">{cat.icon}</span>
              <span className="font-semibold text-gray-700 text-lg">{cat.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended Providers Section */}
      {isAuthenticated && popularProviders?.length > 0 && (
        <div className="mx-auto max-w-7xl px-6 lg:px-8 mb-16">
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-8">مقدمو خدمات ننصح بهم</h2>
          {popularLoading ? (
            <div className="text-center text-gray-600">جاري تحميل التوصيات...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {popularProviders.slice(0, 3).map((provider: any) => (
                <div key={provider._id} className="bg-white rounded-xl shadow-md overflow-hidden transform transition duration-300 hover:scale-105 hover:shadow-lg cursor-pointer">
                  <div className="p-6">
                    <h3 className="font-bold text-xl text-primary-700 mb-2">{provider.businessName}</h3>
                    <p className="text-sm text-gray-600 mb-1">التصنيف: {provider.category}</p>
                    <p className="text-sm text-gray-500 mb-2">العنوان: {provider.location?.address || 'غير محدد'}</p>
                    <div className="flex items-center text-sm text-gray-700">
                      <span className="ml-1">{provider.rating?.toFixed(1) || 'جديد'}</span>
                      <span>⭐</span>
                      <span className="text-xs text-gray-500 mr-2">({provider.totalRatings} تقييم)</span>
                    </div>
                    <button onClick={() => router.push(`/providers/${provider._id}`)} className="mt-4 text-primary-600 hover:underline text-sm font-semibold">عرض التفاصيل</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* + Button for providers only */}
      {user?.role === 'provider' && (
        <>
          <button
            onClick={() => {
              setShowModal(true);
              setAddServiceError('');
              setAddServiceSuccess('');
            }}
            className="fixed bottom-8 right-8 bg-green-700 text-white rounded-full w-16 h-16 flex items-center justify-center text-4xl shadow-lg hover:bg-green-800 transition z-40"
            title="أضف خدمة جديدة"
          >
            +
          </button>
          {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative">
                <button
                  className="absolute top-2 left-2 text-gray-500 hover:text-gray-700 text-2xl"
                  onClick={() => setShowModal(false)}
                  title="إغلاق"
                >
                  ×
                </button>
                <h2 className="text-xl font-bold mb-4 text-center">إضافة خدمة جديدة</h2>
                {addServiceMutation.isPending && <div className="text-center text-primary-600 mb-4">جاري الإضافة...</div>}
                {addServiceError && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                    <span className="block sm:inline">{addServiceError}</span>
                  </div>
                )}
                {addServiceSuccess && (
                  <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
                    <span className="block sm:inline">{addServiceSuccess}</span>
                  </div>
                )}
                <form onSubmit={handleAddServiceModalSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="serviceName" className="block text-sm font-medium text-gray-700 text-right mb-1">اسم الخدمة:</label>
                    <input
                      id="serviceName"
                      name="name"
                      type="text"
                      value={addServiceFormData.name}
                      onChange={handleAddServiceChange}
                      className="w-full border rounded p-2 focus:ring-primary-500 focus:border-primary-500 text-right"
                      placeholder="صالون حلاقة، استشارة طبية..."
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="servicePrice" className="block text-sm font-medium text-gray-700 text-right mb-1">السعر (ل.س):</label>
                    <input
                      id="servicePrice"
                      name="price"
                      type="number"
                      value={addServiceFormData.price === 0 ? '' : addServiceFormData.price}
                      onChange={handleAddServiceChange}
                      className="w-full border rounded p-2 focus:ring-primary-500 focus:border-primary-500 text-right"
                      placeholder="5000"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="serviceDuration" className="block text-sm font-medium text-gray-700 text-right mb-1">المدة (دقائق):</label>
                    <input
                      id="serviceDuration"
                      name="duration"
                      type="number"
                      value={addServiceFormData.duration === 0 ? '' : addServiceFormData.duration}
                      onChange={handleAddServiceChange}
                      className="w-full border rounded p-2 focus:ring-primary-500 focus:border-primary-500 text-right"
                      placeholder="30"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="serviceDescription" className="block text-sm font-medium text-gray-700 text-right mb-1">الوصف (اختياري):</label>
                    <textarea
                      id="serviceDescription"
                      name="description"
                      value={addServiceFormData.description}
                      onChange={handleAddServiceChange}
                      rows={3}
                      className="w-full border rounded p-2 focus:ring-primary-500 focus:border-primary-500 text-right"
                      placeholder="وصف تفصيلي للخدمة..."
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 transition disabled:opacity-50"
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