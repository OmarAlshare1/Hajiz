'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslations } from '../hooks/useTranslations';
import '../styles/syrian-theme.css';

const SyrianHomepage: React.FC = () => {
  const { t } = useTranslations();

  return (
    <div className="min-h-screen">
      {/* Hero Section with Syrian Wave Background */}
      <section className="syrian-hero syrian-wave-bg relative py-20 px-4">
        <div className="container mx-auto text-center relative z-10">
          {/* Hajiz Logo */}
          <div className="mb-12 animate-fadeInDown">
            <img 
              src="/hajiz logo.jpeg" 
              alt="Hajiz Logo" 
              className="h-20 md:h-24 mx-auto rounded-lg shadow-lg"
            />
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold text-white mb-8 animate-fadeInUp">
            <span className="syrian-heading">{t('welcome')}</span>
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-white/90 mb-10 max-w-4xl mx-auto animate-fadeInUp leading-relaxed">
            {t('heroDescription', 'منصة الحجز الشاملة الأولى في سوريا - احجز كل ما تحتاجه من فعاليات، فيلات، حفلات، أطباء، مطاعم وأكثر')}
          </p>
          
          {/* Quick Service Categories */}
          <div className="flex flex-wrap justify-center gap-3 mb-8 animate-fadeInUp">
            <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm font-medium">
              {t('events', 'فعاليات')}
            </span>
            <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm font-medium">
              {t('villas', 'فيلات')}
            </span>
            <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm font-medium">
              {t('parties', 'حفلات')}
            </span>
            <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm font-medium">
              {t('doctors', 'أطباء')}
            </span>
            <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm font-medium">
              {t('restaurants', 'مطاعم')}
            </span>
            <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm font-medium">
              {t('hotels', 'فنادق')}
            </span>
            <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm font-medium">
              +70 {t('categories', 'فئة')}
            </span>
          </div>
          
          {/* Syrian Ribbon CTA */}
          <div className="syrian-ribbon inline-block animate-fadeInUp">
            <Link href="/providers" className="btn-syrian-primary inline-block text-white no-underline transform hover:scale-105 active:scale-95 transition-all duration-300">
              {t('bookAppointment', 'احجز موعدك الآن')}
            </Link>
          </div>
        </div>
        
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          
        </div>
      </section>

      {/* Featured Categories Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">{t('featuredCategories', 'الفئات المميزة')}</h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-4xl mx-auto">
              {t('comprehensiveDesc', 'أكثر من 70 فئة خدمة في مكان واحد - من الفعاليات والحفلات إلى الخدمات الطبية والسياحة')}
            </p>
          </div>
          
          {/* Main Categories Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-16">
            {/* Events */}
            <div className="text-center p-6 rounded-xl bg-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 group cursor-pointer">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-gray-800 mb-2">{t('events', 'فعاليات')}</h3>
              <p className="text-xs text-gray-600">{t('weddings', 'أعراس')} • {t('conferences', 'مؤتمرات')}</p>
            </div>

            {/* Villas */}
            <div className="text-center p-6 rounded-xl bg-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 group cursor-pointer">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-gray-800 mb-2">{t('villas', 'فيلات')}</h3>
              <p className="text-xs text-gray-600">{t('luxury_villas', 'فاخرة')} • {t('beach_villas', 'شاطئية')}</p>
            </div>

            {/* Doctors */}
            <div className="text-center p-6 rounded-xl bg-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 group cursor-pointer">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-gray-800 mb-2">{t('doctors', 'أطباء')}</h3>
              <p className="text-xs text-gray-600">{t('general_medicine', 'عام')} • {t('cardiology', 'قلب')}</p>
            </div>

            {/* Restaurants */}
            <div className="text-center p-6 rounded-xl bg-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 group cursor-pointer">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-gray-800 mb-2">{t('restaurants', 'مطاعم')}</h3>
              <p className="text-xs text-gray-600">{t('syrian_cuisine', 'شامي')} • {t('grills', 'مشاوي')}</p>
            </div>

            {/* Hotels */}
            <div className="text-center p-6 rounded-xl bg-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 group cursor-pointer">
              <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-gray-800 mb-2">{t('hotels', 'فنادق')}</h3>
              <p className="text-xs text-gray-600">{t('luxury_hotels', 'فاخرة')} • {t('family_hotels', 'عائلية')}</p>
            </div>

            {/* More Categories */}
            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-200 group cursor-pointer">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-500 to-gray-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-gray-800 mb-2">+65 {t('categories', 'فئة')}</h3>
              <p className="text-xs text-gray-600">{t('viewAllCategories', 'عرض الكل')}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="text-center p-8 rounded-xl bg-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">{t('homepage.features.easyBooking')}</h3>
              <p className="text-gray-600 leading-relaxed">{t('homepage.features.easyBookingDesc')}</p>
            </div>

            {/* Feature 2 */}
            <div className="text-center p-8 rounded-xl bg-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">{t('homepage.features.nearbyProviders')}</h3>
              <p className="text-gray-600 leading-relaxed">{t('homepage.features.nearbyProvidersDesc')}</p>
            </div>

            {/* Feature 3 */}
            <div className="text-center p-8 rounded-xl bg-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">{t('homepage.features.verifiedProviders')}</h3>
              <p className="text-gray-600 leading-relaxed">{t('homepage.features.verifiedProvidersDesc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 px-4 syrian-wave-bg">
        <div className="container mx-auto">
          {/* Syrian Flag Header */}
          <div className="text-center mb-12">
            
            <h2 className="text-4xl font-bold text-white drop-shadow-2xl stroke-text">{t('ourAchievements', 'إنجازاتنا')}</h2>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className="text-white syrian-slide-in">
              <div className="text-5xl font-bold mb-2 drop-shadow-2xl stroke-text">500+</div>
              <div className="text-xl font-semibold drop-shadow-lg bg-black/30 rounded-lg px-3 py-1 inline-block">{t('providers', 'مقدم خدمة')}</div>
            </div>
            <div className="text-white syrian-slide-in" style={{animationDelay: '0.1s'}}>
              <div className="text-5xl font-bold mb-2 drop-shadow-2xl stroke-text">50+</div>
              <div className="text-xl font-semibold drop-shadow-lg bg-black/30 rounded-lg px-3 py-1 inline-block">{t('categories', 'فئة خدمة')}</div>
            </div>
            <div className="text-white syrian-slide-in" style={{animationDelay: '0.2s'}}>
              <div className="text-5xl font-bold mb-2 drop-shadow-2xl stroke-text">10,000+</div>
              <div className="text-xl font-semibold drop-shadow-lg bg-black/30 rounded-lg px-3 py-1 inline-block">{t('appointments', 'موعد')}</div>
            </div>
            <div className="text-white syrian-slide-in" style={{animationDelay: '0.3s'}}>
              <div className="text-5xl font-bold mb-2 drop-shadow-2xl stroke-text">15+</div>
              <div className="text-xl font-semibold drop-shadow-lg bg-black/30 rounded-lg px-3 py-1 inline-block">{t('cities', 'مدينة')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Syrian Telecom Partners Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 syrian-heading">
            {t('ourPartners', 'شركاؤنا')}
          </h2>
          
          <div className="flex justify-center items-center gap-8 md:gap-16">
            <div className="syrian-card p-6 text-center syrian-fade-in">
              <img 
                src="/MTN_Logo.svg.png" 
                alt="MTN Syria" 
                className="h-16 mx-auto mb-4"
              />
              <p className="text-sm text-gray-600">{t('paymentPartner', 'شريك الدفع')}</p>
            </div>
            
            <div className="syrian-card p-6 text-center syrian-fade-in" style={{animationDelay: '0.2s'}}>
              <img 
                src="/Syriatel_logo.png" 
                alt="Syriatel" 
                className="h-16 mx-auto mb-4"
              />
              <p className="text-sm text-gray-600">{t('telecomPartner', 'شريك الاتصالات')}</p>
            </div>
          </div>
          
          <div className="text-center mt-8">
            <p className="text-gray-600 max-w-2xl mx-auto">
              {t('partnersDescription', 'نتعاون مع أفضل الشركات السورية لتقديم خدمات دفع آمنة وموثوقة لجميع عملائنا')}
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 syrian-heading">
            {t('howItWorks', 'كيف يعمل الموقع')}
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center syrian-fade-in">
              <div className="syrian-ribbon inline-block mb-6">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-4 syrian-accent-text">
                {t('step1', 'اختر الخدمة')}
              </h3>
              <p className="text-gray-600">
                {t('step1Desc', 'اختر نوع الخدمة التي تحتاجها من أكثر من 70 فئة متاحة')}
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center syrian-fade-in" style={{animationDelay: '0.2s'}}>
              <div className="syrian-ribbon inline-block mb-6">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-4 syrian-accent-text">
                {t('step2', 'اختر مقدم الخدمة')}
              </h3>
              <p className="text-gray-600">
                {t('step2Desc', 'تصفح قائمة مقدمي الخدمات المتاحين واختر الأنسب لك')}
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center syrian-fade-in" style={{animationDelay: '0.4s'}}>
              <div className="syrian-ribbon inline-block mb-6">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-4 syrian-accent-text">
                {t('step3', 'احجز موعدك')}
              </h3>
              <p className="text-gray-600">
                {t('step3Desc', 'اختر الوقت المناسب لك واحجز خدمتك بسهولة وأمان')}
              </p>
            </div>
          </div>
        </div>
      </section>



      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-br from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">{t('testimonials', 'آراء العملاء')}</h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              {t('testimonialsDesc', 'ما يقوله عملاؤنا عن تجربتهم معنا')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed">
                "{t('testimonial1', 'منصة رائعة ساعدتني في حجز قاعة أفراح مميزة لابنتي. الخدمة سريعة والأسعار منافسة.')}"
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg ml-4">
                  أ
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">{t('customer1', 'أحمد السوري')}</h4>
                  <p className="text-gray-600 text-sm">{t('damascus', 'دمشق')}</p>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed">
                "{t('testimonial2', 'حجزت موعد مع طبيب قلب ممتاز من خلال التطبيق. سهولة في الاستخدام ومواعيد متاحة.')}"
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold text-lg ml-4">
                  ف
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">{t('customer2', 'فاطمة الحلبية')}</h4>
                  <p className="text-gray-600 text-sm">{t('aleppo', 'حلب')}</p>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed">
                "{t('testimonial3', 'استأجرت فيلا رائعة لقضاء عطلة العائلة. المكان كان أفضل من المتوقع والحجز كان سهل جداً.')}"
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg ml-4">
                  م
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">{t('customer3', 'محمد الشامي')}</h4>
                  <p className="text-gray-600 text-sm">{t('lattakia', 'اللاذقية')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <section className="py-20 bg-gray-800">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          {/* Title */}
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            جاهز للبدء؟
          </h2>
          
          {/* Description */}
          <p className="text-lg text-gray-200 mb-8 max-w-2xl mx-auto leading-relaxed">
            احجز كل ما تحتاجه من الشخصين الذين يقومون بمساعدتك لحجز خدماتك
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-gray-800 px-8 py-3 rounded-full font-semibold text-lg hover:bg-gray-100 transition-all duration-300 shadow-lg">
              تعرف أكثر
            </button>
            <button className="bg-red-600 text-white px-8 py-3 rounded-full font-semibold text-lg hover:bg-red-700 transition-all duration-300 shadow-lg">
              ابدأ الحجز الآن
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SyrianHomepage;