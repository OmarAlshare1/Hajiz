'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { forgotPassword } from '@/lib/api'; // Assuming this provides the API calls

export default function ForgotPasswordPage() {
  const [phone, setPhone] = useState('');
  const [step, setStep] = useState<'request' | 'verify' | 'reset' | 'done'>('request');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [formError, setFormError] = useState('');   // For displaying errors related to form submission
  const [formSuccess, setFormSuccess] = useState(''); // For displaying success messages related to form submission
  const [isLoading, setIsLoading] = useState(false); // To manage loading state for API calls

  const router = useRouter();

  // Function to handle the request reset password step
  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(''); // Clear any previous errors
    setFormSuccess(''); // Clear any previous success messages
    setIsLoading(true); // Set loading state to true

    try {
      // Call the API to request a password reset code
      await forgotPassword.requestReset(phone);
      setStep('verify'); // Move to the verification step
      setFormSuccess('تم إرسال رمز التحقق إلى رقم هاتفك. الرجاء التحقق من رسائلك.'); // Show success message
    } catch (err: any) {
      // Handle API errors and display a user-friendly message
      setFormError(err.response?.data?.message || 'فشل إرسال رمز التحقق. يرجى التأكد من رقم الهاتف والمحاولة مرة أخرى.');
    } finally {
      setIsLoading(false); // Reset loading state
    }
  };

  // Function to handle the verify code step
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    setIsLoading(true);

    try {
      // Call the API to verify the provided code
      await forgotPassword.verifyCode(phone, code);
      setStep('reset'); // Move to the reset password step
      setFormSuccess('تم التحقق من الرمز بنجاح. يمكنك الآن تعيين كلمة مرور جديدة.'); // Show success message
    } catch (err: any) {
      // Handle API errors
      setFormError(err.response?.data?.message || 'رمز التحقق غير صحيح أو منتهي الصلاحية. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle the reset password step
  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    setIsLoading(true);

    try {
      // Call the API to reset the password with the new password
      await forgotPassword.resetPassword(phone, code, newPassword);
      setFormSuccess('تم إعادة تعيين كلمة المرور بنجاح! سيتم تحويلك لصفحة تسجيل الدخول.'); // Show success message
      setStep('done'); // Set step to done
      // Redirect to login page after a short delay
      setTimeout(() => router.push('/auth/login'), 2000);
    } catch (err: any) {
      // Handle API errors
      setFormError(err.response?.data?.message || 'فشل إعادة تعيين كلمة المرور. يرجى المحاولة لاحقاً.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8 bg-gray-100 font-inter">
      <div className="max-w-md w-full bg-white rounded-xl shadow-2xl p-6 sm:p-8 space-y-6 border-t-4 border-blue-600">
        <div className="flex flex-col items-center">
          {/* Responsive logo size */}
          <img className="h-16 sm:h-20 w-auto mb-4 rounded-full shadow-md" src="/hajiz logo.jpeg" alt="Hajiz" />
          <h2 className="text-center text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2">استعادة كلمة المرور</h2>
          <p className="text-center text-sm sm:text-base text-gray-600">
            {step === 'request' && 'الرجاء إدخال رقم هاتفك لاستعادة كلمة المرور.'}
            {step === 'verify' && 'الرجاء إدخال رمز التحقق الذي تم إرساله إلى هاتفك.'}
            {step === 'reset' && 'الرجاء تعيين كلمة مرور جديدة لحسابك.'}
            {step === 'done' && 'عملية استعادة كلمة المرور اكتملت.'}
          </p>
        </div>

        {/* Display form-wide error or success messages */}
        {formError && (
          <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg relative text-sm sm:text-base" role="alert">
            <span className="block text-right">{formError}</span>
          </div>
        )}
        {formSuccess && (
          <div className="bg-green-50 border border-green-300 text-green-700 px-4 py-3 rounded-lg relative text-sm sm:text-base" role="alert">
            <span className="block text-right">{formSuccess}</span>
          </div>
        )}

        {/* Step: Request Phone */}
        {step === 'request' && (
          <form className="space-y-6" onSubmit={handleRequest}>
            <div>
              <label htmlFor="phone" className="block text-sm sm:text-base font-medium text-gray-700 text-right mb-1">رقم الهاتف:</label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full rounded-md border border-gray-300 shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500 text-right placeholder-gray-400 text-base"
                placeholder="مثال: 09XXXXXXXX"
                dir="ltr"
                required
              />
            </div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-base font-semibold rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? 'جاري الإرسال...' : 'إرسال رمز التحقق'}
            </button>
            <Link href="/auth/login" className="block text-center text-sm sm:text-base text-blue-600 hover:text-blue-800 hover:underline transition duration-150 ease-in-out mt-4">
              العودة لتسجيل الدخول
            </Link>
          </form>
        )}

        {/* Step: Verify Code */}
        {step === 'verify' && (
          <form className="space-y-6" onSubmit={handleVerify}>
            <div>
              <label htmlFor="code" className="block text-sm sm:text-base font-medium text-gray-700 text-right mb-1">رمز التحقق:</label>
              <input
                id="code"
                type="text"
                value={code}
                onChange={e => setCode(e.target.value)}
                className="w-full rounded-md border border-gray-300 shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500 text-right placeholder-gray-400 text-base"
                placeholder="أدخل الرمز المكون من 6 أرقام"
                dir="ltr"
                required
                maxLength={6} // Added max length for verification code
              />
            </div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-base font-semibold rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? 'جاري التحقق...' : 'تحقق من الرمز'}
            </button>
            <button
              type="button"
              onClick={() => { setStep('request'); setCode(''); setFormSuccess(''); setFormError(''); }}
              className="w-full text-center text-sm sm:text-base text-blue-600 hover:text-blue-800 hover:underline transition duration-150 ease-in-out mt-4"
            >
              لم أستلم الرمز أو أريد تغيير الرقم
            </button>
          </form>
        )}

        {/* Step: Reset Password */}
        {step === 'reset' && (
          <form className="space-y-6" onSubmit={handleReset}>
            <div>
              <label htmlFor="newPassword" className="block text-sm sm:text-base font-medium text-gray-700 text-right mb-1">كلمة المرور الجديدة:</label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="w-full rounded-md border border-gray-300 shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500 text-right placeholder-gray-400 text-base"
                placeholder="كلمة المرور يجب أن تكون 8 أحرف على الأقل"
                required
                minLength={8} // Added min length for password
              />
            </div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-base font-semibold rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? 'جاري إعادة التعيين...' : 'إعادة تعيين كلمة المرور'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
