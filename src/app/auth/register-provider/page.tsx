'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
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
  const [error, setError] = useState('');
  const { register } = useAuth(); // register from useAuth is mutateAsync
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false); // New loading state

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); // Clear previous errors
    setIsLoading(true); // Start loading

    try {
      await register({
        ...formData,
        role: 'provider', // Ensure role is set for provider registration
      });
      // On success, redirection to /home is handled by useAuth hook
    } catch (err: any) {
      setError(err.response?.data?.message || 'فشل إنشاء الحساب. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsLoading(false); // Stop loading
    }
  };

  // handleChange now specifically for input fields
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // handleCategoryChange specifically for CustomSelect
  const handleCategoryChange = (value: string | number) => {
    setFormData({
      ...formData,
      category: value as string, // Cast to string as category is string
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 pt-24">
      <div className="max-w-md w-full space-y-8 bg-white rounded-lg shadow-xl p-8 border-t-4 border-primary-600">
        <div className="flex flex-col items-center">
          <img className="h-24 w-auto mb-4" src="/hajiz logo.jpeg" alt="Hajiz" />
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            إنشاء حساب كمقدم خدمة
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            سجل الآن لعرض خدماتك للعملاء!
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          <div className="rounded-md shadow-sm -space-y-px">
            {/* Personal Details */}
            <h3 className="text-lg font-semibold text-gray-700 mb-2 mt-4 text-right">معلومات الحساب الشخصي</h3>
            <div>
              <label htmlFor="name" className="sr-only">الاسم الكامل</label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary-600 focus:border-primary-600 focus:z-10 sm:text-sm"
                placeholder="الاسم الكامل"
                value={formData.name}
                onChange={handleInputChange} // Use handleInputChange
              />
            </div>
            <div>
              <label htmlFor="email" className="sr-only">البريد الإلكتروني</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-600 focus:border-primary-600 focus:z-10 sm:text-sm"
                placeholder="البريد الإلكتروني"
                value={formData.email}
                onChange={handleInputChange} // Use handleInputChange
              />
            </div>
            <div>
              <label htmlFor="phone" className="sr-only">رقم الهاتف</label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-600 focus:border-primary-600 focus:z-10 sm:text-sm"
                placeholder="رقم الهاتف (مثال: 09XXXXXXXX)"
                value={formData.phone}
                onChange={handleInputChange} // Use handleInputChange
                dir="ltr"
              />
            </div>

            {/* Business Details */}
            <h3 className="text-lg font-semibold text-gray-700 mb-2 mt-6 pt-4 border-t border-gray-200 text-right">معلومات العمل</h3>
            <div>
              <label htmlFor="businessName" className="sr-only">اسم العمل</label>
              <input
                id="businessName"
                name="businessName"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-600 focus:border-primary-600 focus:z-10 sm:text-sm"
                placeholder="اسم العمل (مثل: صالون الأمل، مطعم الوردة)"
                value={formData.businessName}
                onChange={handleInputChange} // Use handleInputChange
              />
            </div>
            <div>
              {/* Using CustomSelect for Category */}
              <CustomSelect
                label="فئة الخدمة" // Label passed to CustomSelect
                options={providerCategories}
                value={formData.category}
                onChange={handleCategoryChange} // Use handleCategoryChange
                className="w-full" // Pass full width class
                placeholder="اختر الفئة" // Placeholder
              />
            </div>

            {/* Password */}
            <h3 className="text-lg font-semibold text-gray-700 mb-2 mt-6 pt-4 border-t border-gray-200 text-right">معلومات تسجيل الدخول</h3>
            <div>
              <label htmlFor="password" className="sr-only">كلمة المرور</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary-600 focus:border-primary-600 focus:z-10 sm:text-sm"
                placeholder="كلمة المرور (8 أحرف على الأقل)"
                value={formData.password}
                onChange={handleInputChange} // Use handleInputChange
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-600 disabled:opacity-50"
              disabled={isLoading} // Disable button while loading
            >
              {isLoading ? 'جاري إنشاء الحساب...' : 'إنشاء حساب'}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              لديك حساب بالفعل؟{' '}
              <Link
                href="/auth/login"
                className="font-medium text-primary-600 hover:text-primary-800"
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