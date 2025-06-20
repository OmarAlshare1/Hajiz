'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth'; // Assuming this hook provides the login functionality
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); // State to manage login error messages
  const [isLoading, setIsLoading] = useState(false); // State to manage loading indicator for button

  const { login } = useAuth(); // Destructuring the login function from your authentication hook
  const router = useRouter(); // Next.js router for navigation

  // Handles the form submission for login
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission behavior
    setError('');       // Clear any previous error messages
    setIsLoading(true); // Set loading state to true, disabling the button

    try {
      // Attempt to log in using the provided phone and password
      await login({ phone, password });
      // On successful login, the useAuth hook should handle redirection (e.g., to dashboard)
    } catch (err: any) {
      // If login fails, display the error message from the API, or a generic one
      setError(err.response?.data?.message || 'فشل تسجيل الدخول. يرجى التحقق من رقم الهاتف وكلمة المرور.');
    } finally {
      setIsLoading(false); // Reset loading state, re-enabling the button
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8 bg-gray-100 font-inter">
      <div className="max-w-md w-full bg-white rounded-xl shadow-2xl p-6 sm:p-8 space-y-6 border-t-4 border-blue-600">
        <div className="flex flex-col items-center">
          {/* Responsive logo */}
          <img className="h-16 sm:h-20 w-auto mb-4 rounded-full shadow-md" src="/hajiz logo.jpeg" alt="Hajiz" />
          <h2 className="text-center text-2xl sm:text-3xl font-extrabold text-gray-900">
            تسجيل الدخول إلى حسابك
          </h2>
          <p className="mt-2 text-center text-sm sm:text-base text-gray-600">
            ادخل معلومات حسابك للمتابعة.
          </p>
        </div>

        {/* Display error message if present */}
        {error && (
          <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg relative text-sm sm:text-base" role="alert">
            <span className="block text-right">{error}</span>
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Phone Number Input */}
          <div>
            <label htmlFor="phone" className="sr-only">رقم الهاتف</label>
            <input
              id="phone"
              name="phone"
              type="tel" // Use type="tel" for better mobile keyboard experience
              required
              className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm text-base"
              placeholder="رقم الهاتف"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              dir="ltr" // Ensure LTR for phone numbers input
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
              className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm text-base"
              placeholder="كلمة المرور"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-end"> {/* Changed to justify-end for RTL support */}
            <div className="text-sm">
              <Link
                href="/auth/forgot-password"
                className="font-medium text-blue-600 hover:text-blue-800 transition duration-150 ease-in-out"
              >
                هل نسيت كلمة المرور؟
              </Link>
            </div>
          </div>

          {/* Login Button */}
          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-base font-semibold rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={isLoading} // Disable button while loading
            >
              {isLoading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
            </button>
          </div>

          {/* Registration Links */}
          <div className="text-center">
            <p className="text-sm sm:text-base text-gray-600">
              ليس لديك حساب؟{' '}
              <Link
                href="/auth/register-customer"
                className="font-medium text-blue-600 hover:text-blue-800 transition duration-150 ease-in-out"
              >
                سجل كعميل
              </Link>{' '}
              أو{' '}
              <Link
                href="/auth/register-provider"
                className="font-medium text-blue-600 hover:text-blue-800 transition duration-150 ease-in-out"
              >
                سجل كمقدم خدمة
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
