'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth(); // login from useAuth is mutateAsync
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false); // New loading state for button

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); // Clear previous errors
    setIsLoading(true); // Start loading

    try {
      await login({ phone, password });
      // On success, redirection is handled by useAuth hook
    } catch (err: any) {
      setError(err.response?.data?.message || 'فشل تسجيل الدخول. يرجى التحقق من رقم الهاتف وكلمة المرور.');
    } finally {
      setIsLoading(false); // Stop loading
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 pt-24"> {/* Added pt-24 for fixed navbar */}
      <div className="max-w-md w-full space-y-8 bg-white rounded-lg shadow-xl p-8 border-t-4 border-primary-600"> {/* Enhanced styling */}
        <div className="flex flex-col items-center">
          <img className="h-24 w-auto mb-4" src="/hajiz logo.jpeg" alt="Hajiz" /> {/* Added logo */}
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            تسجيل الدخول إلى حسابك
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
             ادخل معلومات حسابك للمتابعة.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="phone" className="sr-only">
                رقم الهاتف
              </label>
              <input
                id="phone"
                name="phone"
                type="tel" // Use type="tel" for phone numbers
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary-600 focus:border-primary-600 focus:z-10 sm:text-sm"
                placeholder="رقم الهاتف"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                dir="ltr" // Ensure LTR for phone numbers
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                كلمة المرور
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary-600 focus:border-primary-600 focus:z-10 sm:text-sm"
                placeholder="كلمة المرور"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link
                href="/auth/forgot-password"
                className="font-medium text-primary-600 hover:text-primary-800"
              >
                هل نسيت كلمة المرور؟
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-600 disabled:opacity-50"
              disabled={isLoading} // Disable button while loading
            >
              {isLoading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              ليس لديك حساب؟{' '}
              <Link
                href="/auth/register-customer"
                className="font-medium text-primary-600 hover:text-primary-800"
              >
                سجل كعميل
              </Link>{' '}
              أو{' '}
              <Link
                href="/auth/register-provider"
                className="font-medium text-primary-600 hover:text-primary-800"
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