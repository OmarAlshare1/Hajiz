'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useTranslations } from '../hooks/useTranslations';
import { providers, search } from '../lib/api';
import '../styles/syrian-theme.css';

interface ServiceProvider {
  _id: string;
  businessName: string;
  category: string;
  location: {
    address: string;
    coordinates: [number, number];
  };
  rating: number;
  experience?: number;
  images?: string[];
  isActive: boolean;
  services: {
    _id: string;
    name: string;
    price: number;
    duration: number;
    description?: string;
  }[];
  workingHours: {
    day: string;
    open: string;
    close: string;
    isOpen: boolean;
  }[];
  description: string;
  phone: string;
  email?: string;
}

const SyrianProvidersPage: React.FC = () => {
  const { t } = useTranslations();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  const handleBooking = (providerId: string) => {
    router.push(`/booking/${providerId}`);
  };

  const handleViewDetails = (providerId: string) => {
    router.push(`/provider/${providerId}`);
  };

  // Fetch providers from API with debounced search
  const { data: providersData, isLoading: providersLoading, error: providersError } = useQuery({
    queryKey: ['providers', selectedCategory, searchTerm],
    queryFn: async () => {
      const params: any = {};
      if (selectedCategory !== 'all') {
        params.category = selectedCategory;
      }
      if (searchTerm.trim()) {
        params.query = searchTerm.trim();
      }
      const response = await providers.getAll(params);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: true, // Always enabled to fetch data
  });

  // Fetch categories from API
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await search.categories();
      return response.data;
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
  });

  const allProviders: ServiceProvider[] = providersData || [];

  // Use API data or fallback to empty array
  const displayProviders = allProviders.length > 0 ? allProviders : [];

  // Use API categories or fallback to default categories
  const defaultCategories = [
    { value: 'all', label: 'جميع الخدمات', icon: '🏪' },
    { value: 'events', label: 'المناسبات والحفلات', icon: '🎉' },
    { value: 'villas', label: 'الفلل والشاليهات', icon: '🏡' },
    { value: 'doctors', label: 'الخدمات الطبية', icon: '👨‍⚕️' },
    { value: 'restaurants', label: 'المطاعم والمقاهي', icon: '🍽️' },
    { value: 'hotels', label: 'الفنادق والمنتجعات', icon: '🏨' },
    { value: 'beauty', label: 'التجميل والعناية', icon: '💄' },
    { value: 'education', label: 'التعليم والتدريب', icon: '📚' },
    { value: 'sports', label: 'الرياضة واللياقة', icon: '⚽' },
    { value: 'transportation', label: 'النقل والمواصلات', icon: '🚗' }
  ];

  const categories = categoriesData && categoriesData.length > 0 
    ? [{ value: 'all', label: 'جميع الخدمات', icon: '🏪' }, ...categoriesData.map((cat: any) => ({
        value: cat.value || cat.name?.toLowerCase(),
        label: cat.label || cat.name,
        icon: cat.icon || '📋'
      }))]
    : defaultCategories;

  const filteredProviders = displayProviders.filter(provider => {
    const matchesCategory = selectedCategory === 'all' || provider.category === selectedCategory;
    const matchesSearch = provider.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         provider.location.address.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <svg
        key={index}
        className={`w-4 h-4 ${index < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="syrian-hero py-12 sm:py-16 px-4 relative">
        <div className="container mx-auto text-center relative z-10">
          {/* Hajiz Logo */}
          <div className="mb-4 sm:mb-6 syrian-fade-in">
            <img 
              src="/hajiz logo.jpeg" 
              alt="Hajiz Logo" 
              className="h-12 sm:h-16 md:h-20 mx-auto rounded-lg shadow-lg"
            />
          </div>
          
          <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 syrian-fade-in px-2">
            {t('findYourProvider', 'اعثر على مقدم الخدمة')}
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-white/90 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
            {t('providersDescription', 'اختر من بين أفضل مقدمي الخدمات المعتمدين في سوريا')}
          </p>
        </div>
        
        {/* Syrian Flag Decorations */}
        
        
        
      </section>

      {/* Search and Filter Section */}
      <section className="py-6 sm:py-8 px-4 bg-white shadow-sm">
        <div className="container mx-auto">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
            {/* Search Input */}
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('searchProviders', 'ابحث عن مقدم خدمة أو مدينة...')}
                className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-lg focus:outline-none transition-colors text-sm sm:text-base"
              />
              <svg className="absolute right-3 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Category Filter */}
            <div className="w-full sm:w-auto sm:min-w-[200px] lg:min-w-[250px]">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none transition-colors syrian-flag-border text-sm sm:text-base"
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Providers Grid */}
      <section className="py-8 sm:py-12 px-4">
        <div className="container mx-auto">
          {/* Loading State */}
          {providersLoading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
              <span className="mr-3 text-gray-600">جاري التحميل...</span>
            </div>
          )}

          {/* Error State */}
          {providersError && (
            <div className="text-center py-12">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
                <svg className="mx-auto h-12 w-12 text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <h3 className="text-lg font-medium text-red-800 mb-2">خطأ في تحميل البيانات</h3>
                <p className="text-red-600">حدث خطأ أثناء تحميل مقدمي الخدمات. يرجى المحاولة مرة أخرى.</p>
              </div>
            </div>
          )}

          {/* Results Count */}
          {!providersLoading && !providersError && (
            <div className="mb-6 sm:mb-8">
              <div className="syrian-ribbon inline-block">
                <span className="text-white font-semibold text-sm sm:text-base">
                  {t('foundProviders', `تم العثور على ${filteredProviders.length} مقدم خدمة`)}
                </span>
              </div>
            </div>
          )}

          {/* Providers Grid */}
          {!providersLoading && !providersError && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              {filteredProviders.map((provider, index) => (
              <div key={provider._id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
                <div className="p-4 sm:p-6">
                  {/* Mobile-first layout: Stack vertically on small screens */}
                  <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-4 rtl:sm:space-x-reverse">
                    {/* Provider Image */}
                    <div className="relative flex-shrink-0">
                      <img
                        src={provider.images?.[0] || '/api/placeholder/150/150'}
                        alt={provider.businessName}
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-4 border-gray-100 shadow-md"
                      />
                      <div className={`absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 border-white ${
                        provider.isActive ? 'bg-green-500' : 'bg-yellow-500'
                      }`}></div>
                    </div>
                    
                    {/* Provider Info */}
                    <div className="flex-1 text-center sm:text-right w-full">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-1 hover:text-red-600 transition-colors line-clamp-2">{provider.businessName}</h3>
                      <p className="text-red-600 font-medium mb-2 text-sm sm:text-base">
                        {categories.find(c => c.value === provider.category)?.label}
                      </p>
                      
                      {/* Location */}
                      <div className="flex items-center justify-center sm:justify-start space-x-2 rtl:space-x-reverse mb-3">
                        <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-xs sm:text-sm text-gray-600 font-medium truncate">{provider.location.address}</span>
                      </div>
                      
                      {/* Rating and Experience - Stack on mobile */}
                      <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start space-y-2 sm:space-y-0 sm:space-x-4 rtl:sm:space-x-reverse mb-4">
                        <div className="flex items-center bg-yellow-50 px-2 py-1 rounded-lg">
                          <div className="flex text-yellow-400 mr-1">{renderStars(provider.rating)}</div>
                          <span className="text-xs sm:text-sm text-gray-700 font-medium">({provider.rating})</span>
                        </div>
                        <div className="flex items-center text-xs sm:text-sm text-gray-600 bg-gray-50 px-2 py-1 rounded-lg">
                          <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="whitespace-nowrap">{provider.experience || 0} سنوات خبرة</span>
                        </div>
                      </div>
                      
                      {/* Status, Price and Button - Stack on mobile */}
                      <div className="space-y-3">
                        {/* Status and Price */}
                        <div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            provider.isActive
                              ? 'bg-green-100 text-green-800 border border-green-200' 
                              : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                          }`}>
                            {provider.isActive ? t('available', 'متاح') : t('notAvailable', 'غير متاح')}
                          </span>
                          <div className="text-center sm:text-right">
                            <span className="text-lg sm:text-xl lg:text-2xl font-bold text-red-600">
                              {provider.services?.[0]?.price ? `${provider.services[0].price} ل.س` : 'السعر عند الطلب'}
                            </span>
                          </div>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-2">
                          <button
                            onClick={() => handleViewDetails(provider._id)}
                            className="flex-1 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300"
                          >
                            عرض التفاصيل
                          </button>
                          <button
                            onClick={() => handleBooking(provider._id)}
                            className={`flex-1 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg ${
                              provider.isActive
                                ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                            disabled={!provider.isActive}
                          >
                            {provider.isActive ? t('bookNow', 'احجز الآن') : t('notAvailable', 'غير متاح')}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              ))}
            </div>
          )}

          {/* No Results */}
          {!providersLoading && !providersError && filteredProviders.length === 0 && (
            <div className="text-center py-12 sm:py-16 lg:py-20">
              <div className="max-w-md mx-auto">
                <div className="mb-6 sm:mb-8">
                  <svg className="mx-auto h-16 w-16 sm:h-20 sm:w-20 lg:h-24 lg:w-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33" />
                  </svg>
                </div>
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-3 sm:mb-4">
                  {t('noResults', 'لا توجد نتائج')}
                </h3>
                <p className="text-sm sm:text-base lg:text-lg text-gray-600 mb-6 sm:mb-8 leading-relaxed">
                  {t('noResultsMessage', 'لم نتمكن من العثور على مقدمي خدمات يطابقون معايير البحث الخاصة بك. جرب تعديل البحث أو اختيار فئة أخرى.')}
                </p>
                <button 
                  onClick={() => {
                    setSelectedCategory('all');
                    setSearchTerm('');
                  }}
                  className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl text-sm sm:text-base"
                >
                  {t('clearFilters', 'مسح الفلاتر')}
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 px-4 syrian-wave-bg">
        <div className="container mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4 sm:mb-6 px-2">
            {t('joinAsProviderTitle', 'هل تقدم خدمات؟')}
          </h2>
          <p className="text-base sm:text-lg text-white/90 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
            {t('joinAsProviderDesc', 'انضم إلى منصتنا وابدأ في استقبال العملاء اليوم')}
          </p>
          <button 
            onClick={() => router.push('/register?type=provider')}
            className="btn-syrian-secondary text-sm sm:text-base px-6 sm:px-8 py-3 sm:py-4"
          >
            {t('joinAsProvider', 'انضم كمقدم خدمة')}
          </button>
        </div>
      </section>
    </div>
  );
};

export default SyrianProvidersPage;