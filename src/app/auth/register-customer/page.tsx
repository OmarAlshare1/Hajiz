'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth'; // Assuming this hook provides the register functionality
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import WhatsAppVerification from '@/components/WhatsAppVerification';

export default function RegisterCustomerPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });
  const [error, setError] = useState(''); // State to manage registration error messages
  const [isLoading, setIsLoading] = useState(false); // State to manage loading indicator for button
  const [registrationMethod, setRegistrationMethod] = useState<'traditional' | 'whatsapp'>('traditional');

  const { register } = useAuth(); // Destructuring the register function from your authentication hook
  const router = useRouter(); // Next.js router for navigation

  // Handles the form submission for customer registration
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission behavior
    setError('');       // Clear any previous error messages
    setIsLoading(true); // Set loading state to true, disabling the button

    try {
      // Attempt to register the new customer with the provided form data
      await register({
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        password: formData.password,
        role: 'customer', // Explicitly setting the role for customer registration
      });
      // On successful registration, you might want to redirect to a confirmation page or login
      router.push('/auth/login?registrationSuccess=true'); // Example redirection
    } catch (err: any) {
      // If registration fails, display the error message from the API, or a generic one
      setError(err.response?.data?.message || 'فشل إنشاء الحساب. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsLoading(false); // Reset loading state, re-enabling the button
    }
  };

  // Handles changes in form input fields
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prevFormData => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  // Handle WhatsApp verification success
  const handleWhatsAppSuccess = (token: string) => {
    // Store the token and redirect to dashboard or profile completion
    localStorage.setItem('token', token);
    router.push('/dashboard');
  };

  // Handle WhatsApp verification error
  const handleWhatsAppError = (error: string) => {
    setError(error);
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8 bg-gray-100 font-inter">
      <div className="max-w-md w-full bg-white rounded-xl shadow-2xl p-6 sm:p-8 space-y-6 border-t-4 border-green-600">
        <div className="flex flex-col items-center">
          {/* Responsive logo */}
          <img className="h-16 sm:h-20 w-auto mb-4 rounded-full shadow-md" src="/hajiz logo.jpeg" alt="Hajiz" />
          <h2 className="text-center text-2xl sm:text-3xl font-extrabold text-gray-900">
            إنشاء حساب جديد كعميل
          </h2>
          <p className="mt-2 text-center text-sm sm:text-base text-gray-600">
            لديك حساب بالفعل؟{' '}
            <Link
              href="/auth/login"
              className="font-medium text-green-600 hover:text-green-800 transition duration-150 ease-in-out"
            >
              تسجيل الدخول
            </Link>
          </p>
        </div>

        {/* Registration Method Selection */}
        <div className="flex space-x-4 rtl:space-x-reverse">
          <button
            onClick={() => setRegistrationMethod('traditional')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              registrationMethod === 'traditional'
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            التسجيل التقليدي
          </button>
          <button
            onClick={() => setRegistrationMethod('whatsapp')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              registrationMethod === 'whatsapp'
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            التسجيل عبر واتساب
          </button>
        </div>

        {/* Display error message if present */}
        {error && (
          <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg relative text-sm sm:text-base" role="alert">
            <span className="block text-right">{error}</span>
          </div>
        )}

        {registrationMethod === 'traditional' ? (
          <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Full Name Input */}
          <div>
            <label htmlFor="name" className="sr-only">الاسم الكامل</label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm text-base"
              placeholder="الاسم الكامل"
              value={formData.name}
              onChange={handleChange}
            />
          </div>
          {/* Email Input */}
          <div>
            <label htmlFor="email" className="sr-only">البريد الإلكتروني</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm text-base"
              placeholder="البريد الإلكتروني"
              value={formData.email}
              onChange={handleChange}
              dir="ltr" // Ensure LTR for email input
            />
          </div>
          {/* Phone Number Input */}
          <div>
            <label htmlFor="phone" className="sr-only">رقم الهاتف</label>
            <input
              id="phone"
              name="phone"
              type="tel" // Use type="tel" for better mobile keyboard
              required
              className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm text-base"
              placeholder="رقم الهاتف (مثال: 09XXXXXXXX)"
              value={formData.phone}
              onChange={handleChange}
              dir="ltr" // Ensure LTR for phone number input
            />
          </div>
          {/* Password Input */}
          <div>
            <label htmlFor="password" className="sr-only">كلمة المرور</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={8} // Suggesting a minimum password length for security
              className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm text-base"
              placeholder="كلمة المرور (8 أحرف على الأقل)"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-base font-semibold rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150 ease-in-out disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={isLoading} // Disable button while loading
              >
                {isLoading ? 'جاري إنشاء الحساب...' : 'إنشاء حساب'}
              </button>
            </div>
          </form>
        ) : (
          <div className="mt-6">
            <WhatsAppVerification
              type="register"
              onSuccess={handleWhatsAppSuccess}
              onError={handleWhatsAppError}
            />
          </div>
        )}
      </div>
    </div>
  );
}
