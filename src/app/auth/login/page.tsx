'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth'; // Assuming this hook provides the login functionality
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import WhatsAppVerification from '../../../components/WhatsAppVerification';

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); // State to manage login error messages
  const [isLoading, setIsLoading] = useState(false); // State to manage loading indicator for button
  const [loginMethod, setLoginMethod] = useState<'traditional' | 'whatsapp'>('traditional');

  const { login } = useAuth(); // Destructuring the login function from your authentication hook
  const router = useRouter(); // Next.js router for navigation

  // Handles the form submission for login
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      console.log('🔥 Starting login process with:', { phone, password });
      await login({ phone, password });
      console.log('🔥 Login successful');
      // The login function handles redirection internally
    } catch (error: any) {
      console.error('🔥 Login error:', error);
      setError(error.response?.data?.message || 'فشل في تسجيل الدخول. يرجى التحقق من بياناتك.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWhatsAppSuccess = async (data: any) => {
    try {
      if (data && data.token) {
        // Store the token and redirect - the useAuth hook will handle the rest
        localStorage.setItem('token', data.token);
        router.push('/'); // Redirect to home page after successful login
      }
    } catch (error: any) {
      setError('فشل في تسجيل الدخول عبر واتساب. يرجى المحاولة مرة أخرى.');
    }
  };

  const handleWhatsAppError = (errorMessage: string) => {
    setError(errorMessage);
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8 bg-gray-100 font-inter">
      <div className="max-w-md w-full bg-white rounded-xl shadow-2xl p-6 sm:p-8 space-y-6 border-t-4 border-blue-600">
        <div className="flex flex-col items-center">
          {/* Responsive logo */}
          <div className="flex flex-col items-center space-y-2 mb-4">
            <img className="h-16 sm:h-20 w-auto rounded-full shadow-md" src="/hajiz logo.jpeg" alt="Hajiz" />
          </div>
          <h2 className="text-center text-2xl sm:text-3xl font-extrabold text-gray-900">
            تسجيل الدخول
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            أدخل بياناتك لتسجيل الدخول إلى حسابك
          </p>
          
          {/* Login Method Selection */}
          <div className="mt-6 flex rounded-lg border border-gray-300 overflow-hidden">
            <button
              type="button"
              onClick={() => setLoginMethod('traditional')}
              className={`flex-1 py-2 px-4 text-sm font-medium ${
                loginMethod === 'traditional'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              تسجيل دخول تقليدي
            </button>
            <button
              type="button"
              onClick={() => setLoginMethod('whatsapp')}
              className={`flex-1 py-2 px-4 text-sm font-medium ${
                loginMethod === 'whatsapp'
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              تسجيل دخول عبر واتساب
            </button>
          </div>
        </div>

        {/* Display error message if present */}
        {error && (
          <div className="mt-6 rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        {loginMethod === 'traditional' ? (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  رقم الهاتف
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="أدخل رقم الهاتف"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  كلمة المرور
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="أدخل كلمة المرور"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Link
                href="/auth/forgot-password"
                className="text-sm text-blue-600 hover:text-blue-800 transition duration-150 ease-in-out"
              >
                نسيت كلمة المرور؟
              </Link>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    جاري تسجيل الدخول...
                  </div>
                ) : (
                  'تسجيل الدخول'
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="mt-8">
            <WhatsAppVerification
              type="login"
              onSuccess={handleWhatsAppSuccess}
              onError={handleWhatsAppError}
            />
          </div>
        )}

        {/* Registration Links */}
        <div className="mt-6 text-center">
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
      </div>
    </div>
  );
}
