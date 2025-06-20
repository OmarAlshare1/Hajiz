'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth'; // Assuming this hook provides the register functionality
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import CustomSelect from '../../../components/CustomSelect'; // Import CustomSelect

// Define categories to match your backend's expected categories for providers
const providerCategories = [
  { value: '', label: 'اختر الفئة' }, // Placeholder/initial option
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

export default function RegisterProviderPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    businessName: '',
    category: '', // This will be managed by CustomSelect now
  });
  const [error, setError] = useState(''); // State to manage registration error messages
  const [isLoading, setIsLoading] = useState(false); // State to manage loading indicator for button

  const { register } = useAuth(); // Destructuring the register function from your authentication hook
  const router = useRouter(); // Next.js router for navigation

  // Handles the form submission for service provider registration
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission behavior
    setError('');       // Clear any previous error messages
    setIsLoading(true); // Set loading state to true, disabling the button

    try {
      // Attempt to register the new service provider
      await register({
        ...formData,
        role: 'provider', // Explicitly setting the role for provider registration
      });
      // On successful registration, redirect to a relevant page (e.g., login or provider dashboard)
      router.push('/auth/login?registrationSuccess=true'); // Example redirection
    } catch (err: any) {
      // If registration fails, display the error message from the API, or a generic one
      setError(err.response?.data?.message || 'فشل إنشاء الحساب. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsLoading(false); // Reset loading state, re-enabling the button
    }
  };

  // Handles changes for standard input fields
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prevFormData => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  // Handles changes for the CustomSelect component
  const handleCategoryChange = (value: string | number) => {
    setFormData(prevFormData => ({
      ...prevFormData,
      category: value as string, // Cast to string as category is string
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8 bg-gray-100 font-inter">
      <div className="max-w-md w-full bg-white rounded-xl shadow-2xl p-6 sm:p-8 space-y-6 border-t-4 border-teal-600">
        <div className="flex flex-col items-center">
          {/* Responsive logo */}
          <img className="h-16 sm:h-20 w-auto mb-4 rounded-full shadow-md" src="/hajiz logo.jpeg" alt="Hajiz" />
          <h2 className="text-center text-2xl sm:text-3xl font-extrabold text-gray-900">
            إنشاء حساب كمقدم خدمة
          </h2>
          <p className="mt-2 text-center text-sm sm:text-base text-gray-600">
            سجل الآن لعرض خدماتك للعملاء!
          </p>
        </div>

        {/* Display error message if present */}
        {error && (
          <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg relative text-sm sm:text-base" role="alert">
            <span className="block text-right">{error}</span>
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Section: Personal Details */}
          <div className="space-y-4"> {/* Added space-y for internal section spacing */}
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 text-right pb-2 border-b border-gray-200">معلومات الحساب الشخصي</h3>
            <div>
              <label htmlFor="name" className="sr-only">الاسم الكامل</label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="appearance-none block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm text-base"
                placeholder="الاسم الكامل"
                value={formData.name}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label htmlFor="email" className="sr-only">البريد الإلكتروني</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm text-base"
                placeholder="البريد الإلكتروني"
                value={formData.email}
                onChange={handleInputChange}
                dir="ltr"
              />
            </div>
            <div>
              <label htmlFor="phone" className="sr-only">رقم الهاتف</label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                className="appearance-none block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm text-base"
                placeholder="رقم الهاتف (مثال: 09XXXXXXXX)"
                value={formData.phone}
                onChange={handleInputChange}
                dir="ltr"
              />
            </div>
          </div>

          {/* Section: Business Details */}
          <div className="space-y-4 pt-4 border-t border-gray-200"> {/* Added space-y for internal spacing, border-t for visual separation */}
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 text-right pb-2 border-b border-gray-200">معلومات العمل</h3>
            <div>
              <label htmlFor="businessName" className="sr-only">اسم العمل</label>
              <input
                id="businessName"
                name="businessName"
                type="text"
                required
                className="appearance-none block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm text-base"
                placeholder="اسم العمل (مثل: صالون الأمل، مطعم الوردة)"
                value={formData.businessName}
                onChange={handleInputChange}
              />
            </div>
            <div>
              {/* CustomSelect for Category */}
              <CustomSelect
                label="فئة الخدمة" // Label for accessibility and display
                options={providerCategories}
                value={formData.category}
                onChange={handleCategoryChange}
                // Pass styling props that CustomSelect can use to match theme
                className="w-full"
                containerClasses="rounded-md shadow-sm border border-gray-300 focus-within:ring-teal-500 focus-within:border-teal-500" // Example of how to pass styling for the select container
                selectClasses="py-3 px-3 text-base text-gray-900 focus:outline-none" // Example for the actual select element
                placeholder="اختر الفئة"
              />
            </div>
          </div>

          {/* Section: Login Information */}
          <div className="space-y-4 pt-4 border-t border-gray-200"> {/* Added space-y for internal spacing, border-t for visual separation */}
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 text-right pb-2 border-b border-gray-200">معلومات تسجيل الدخول</h3>
            <div>
              <label htmlFor="password" className="sr-only">كلمة المرور</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={8} // Enforce minimum password length for security
                className="appearance-none block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm text-base"
                placeholder="كلمة المرور (8 أحرف على الأقل)"
                value={formData.password}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-base font-semibold rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition duration-150 ease-in-out disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={isLoading} // Disable button while loading
            >
              {isLoading ? 'جاري إنشاء الحساب...' : 'إنشاء حساب'}
            </button>
          </div>

          {/* Existing Account Link */}
          <div className="text-center pt-4"> {/* Added pt-4 for spacing */}
            <p className="text-sm sm:text-base text-gray-600">
              لديك حساب بالفعل؟{' '}
              <Link
                href="/auth/login"
                className="font-medium text-teal-600 hover:text-teal-800 transition duration-150 ease-in-out"
              >
                تسجيل الدخول
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
