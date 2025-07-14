'use client';
import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useRouter } from 'next/navigation';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { search, providers as providersApi } from '../../lib/api';
import { useTranslations } from '../../hooks/useTranslations';
import '../../styles/syrian-theme.css';

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

// Defining the expected user structure for type safety
interface AuthUser { 
  _id: string; 
  name: string; 
  email?: string; 
  phone: string; 
  role: 'customer' | 'provider'; 
}

export default function HomePage() {
  const { user, isLoading: userLoading, isAuthenticated } = useAuth<AuthUser>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { t } = useTranslations();

  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const [addServiceFormData, setAddServiceFormData] = useState({
    name: '',
    duration: 0,
    price: 0,
    description: '',
  });
  const [addServiceError, setAddServiceError] = useState('');
  const [addServiceSuccess, setAddServiceSuccess] = useState('');

  // useQuery hook to fetch popular providers
  const { data: popularProviders, isLoading: popularLoading } = useQuery({
    queryKey: ['popularProviders'],
    queryFn: async () => {
      const res = await search.providers('');
      return res.data?.providers || [];
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    enabled: typeof window !== 'undefined',
  });

  // Handles the submission of the main search bar
  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    setSearchResults([]);

    try {
      const res = await search.providers(searchQuery);
      setSearchResults(res.data?.providers || []);
    } catch (error) {
      console.error('Error during search:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // useMutation hook for adding a new service via the modal
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
      setAddServiceError(err.response?.data?.message || 'فشل إضافة الخدمة. يرجى التأكد من البيانات والمحاولة مرة أخرى.');
      setAddServiceSuccess('');
      console.error('Add service error:', err);
    },
  });

  // Handles submission of the "Add Service" modal form
  const handleAddServiceModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addServiceFormData.name || addServiceFormData.duration <= 0 || addServiceFormData.price <= 0) {
      setAddServiceError('الرجاء ملء جميع الحقول المطلوبة (الاسم، المدة، السعر) بشكل صحيح.');
      return;
    }
    setAddServiceError('');
    addServiceMutation.mutate(addServiceFormData);
  };

  // Handles changes in "Add Service" modal input fields
  const handleAddServiceChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setAddServiceFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }));
  };

  return (
    <div className="relative min-h-screen bg-gray-100 font-inter">
      {/* Hero Section */}
      <div className="syrian-hero relative overflow-hidden">
        {/* Syrian Wave Background */}
        <div className="syrian-wave-bg"></div>
      
        
        {/* Hajiz Logo */}
        <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-24 h-24">
          <img src="/hajiz logo.jpeg" alt="Hajiz Logo" className="w-full h-full object-contain rounded-full shadow-lg" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 pt-40 pb-20 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-12 drop-shadow-lg">
            {t('welcome')}
          </h1>
          

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن الخدمات..."
                className="w-full px-6 py-4 text-lg rounded-full border-2 border-white/30 bg-white/90 backdrop-blur-sm focus:outline-none transition-all duration-300"
              />
              <button
                type="submit"
                disabled={isSearching}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-syrian-red hover:bg-syrian-red-dark text-white p-3 rounded-full transition-colors duration-300 disabled:opacity-50"
              >
                <MagnifyingGlassIcon className="w-6 h-6" />
              </button>
            </div>
          </form>

          {/* Categories */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4 max-w-4xl mx-auto">
            {categories.map((category, index) => (
              <button
                key={index}
                onClick={() => {
                  setSearchQuery(category.name);
                  handleSearchSubmit({ preventDefault: () => {} } as React.FormEvent);
                }}
                className="bg-white/90 backdrop-blur-sm hover:bg-white hover:scale-105 transition-all duration-300 rounded-xl p-4 text-center shadow-lg hover:shadow-xl"
              >
                <div className="text-2xl mb-2">{category.icon}</div>
                <div className="text-sm font-medium text-gray-800">{category.name}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="max-w-6xl mx-auto px-4 py-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">نتائج البحث</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {searchResults.map((provider: any) => (
              <div key={provider._id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{provider.name}</h3>
                <p className="text-gray-600 mb-4">{provider.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-syrian-red font-bold">{provider.category}</span>
                  <button
                    onClick={() => router.push(`/providers/${provider._id}`)}
                    className="bg-syrian-red hover:bg-syrian-red-dark text-white px-4 py-2 rounded-lg transition-colors duration-300"
                  >
                    عرض التفاصيل
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Popular Providers */}
      {!searchResults.length && (
        <div className="max-w-6xl mx-auto px-4 py-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">مقدمو الخدمات المميزون</h2>
          {popularLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-syrian-red mx-auto"></div>
              <p className="mt-4 text-gray-600">جاري التحميل...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {popularProviders?.slice(0, 6).map((provider: any) => (
                <div key={provider._id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">{provider.name}</h3>
                  <p className="text-gray-600 mb-4">{provider.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-syrian-red font-bold">{provider.category}</span>
                    <button
                      onClick={() => router.push(`/providers/${provider._id}`)}
                      className="bg-syrian-red hover:bg-syrian-red-dark text-white px-4 py-2 rounded-lg transition-colors duration-300"
                    >
                      عرض التفاصيل
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Service Button for Providers */}
      {isAuthenticated && user?.role === 'provider' && (
        <>
          <button
            onClick={() => setShowModal(true)}
            className="fixed bottom-6 right-6 bg-syrian-red hover:bg-syrian-red-dark text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-50"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>

          {/* Add Service Modal */}
          {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg max-w-md w-full p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">إضافة خدمة جديدة</h3>
                
                {addServiceError && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {addServiceError}
                  </div>
                )}
                
                {addServiceSuccess && (
                  <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                    {addServiceSuccess}
                  </div>
                )}

                <form onSubmit={handleAddServiceModalSubmit}>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">اسم الخدمة</label>
                    <input
                      type="text"
                      name="name"
                      value={addServiceFormData.name}
                      onChange={handleAddServiceChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none"
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">المدة (بالدقائق)</label>
                    <input
                      type="number"
                      name="duration"
                      value={addServiceFormData.duration}
                      onChange={handleAddServiceChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none"
                      min="1"
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">السعر</label>
                    <input
                      type="number"
                      name="price"
                      value={addServiceFormData.price}
                      onChange={handleAddServiceChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  
                  <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-bold mb-2">الوصف</label>
                    <textarea
                      name="description"
                      value={addServiceFormData.description}
                      onChange={handleAddServiceChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none"
                      rows={3}
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-300"
                    >
                      إلغاء
                    </button>
                    <button
                      type="submit"
                      disabled={addServiceMutation.isPending}
                      className="bg-syrian-red hover:bg-syrian-red-dark text-white px-6 py-2 rounded-lg transition-colors duration-300 disabled:opacity-50"
                    >
                      {addServiceMutation.isPending ? 'جاري الإضافة...' : 'إضافة'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
