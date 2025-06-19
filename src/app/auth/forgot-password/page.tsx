'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { forgotPassword } from '@/lib/api'; // Assuming this provides the API calls

export default function ForgotPasswordPage() {
  const [phone, setPhone] = useState('');
  const [step, setStep] = useState<'request' | 'verify' | 'reset' | 'done'>('request');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState(''); // Existing error state for specific step
  const [success, setSuccess] = useState(''); // Existing success state for specific step
  const [isLoading, setIsLoading] = useState(false);

  // FIX: Add formError and formSuccess state variables
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  const router = useRouter();

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(''); // Clear form-wide error
    setFormSuccess(''); // Clear form-wide success
    setError(''); // Clear specific step error
    setSuccess(''); // Clear specific step success
    setIsLoading(true);
    try {
      await forgotPassword.requestReset(phone);
      setStep('verify');
      setFormSuccess('تم إرسال رمز التحقق إلى رقم هاتفك.'); // Use formSuccess
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'فشل إرسال رمز التحقق. يرجى التأكد من رقم الهاتف.'); // Use formError
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    setError('');
    setSuccess('');
    setIsLoading(true);
    try {
      await forgotPassword.verifyCode(phone, code);
      setStep('reset');
      setFormSuccess('تم التحقق من الرمز بنجاح. يمكنك الآن تعيين كلمة مرور جديدة.'); // Use formSuccess
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'رمز التحقق غير صحيح أو منتهي الصلاحية.'); // Use formError
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    setError('');
    setSuccess('');
    setIsLoading(true);
    try {
      await forgotPassword.resetPassword(phone, code, newPassword);
      setFormSuccess('تم إعادة تعيين كلمة المرور بنجاح! سيتم تحويلك لصفحة تسجيل الدخول.'); // Use formSuccess
      setStep('done');
      setTimeout(() => router.push('/auth/login'), 2000);
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'فشل إعادة تعيين كلمة المرور. يرجى المحاولة لاحقاً.'); // Use formError
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 pt-24">
      <div className="max-w-md w-full space-y-8 bg-white rounded-lg shadow-xl p-8 border-t-4 border-primary-600">
        <div className="flex flex-col items-center">
          <img className="h-24 w-auto mb-4" src="/hajiz logo.jpeg" alt="Hajiz" />
          <h2 className="text-center text-3xl font-extrabold text-gray-900 mb-2">استعادة كلمة المرور</h2>
          <p className="text-center text-sm text-gray-600">
            {step === 'request' && 'الرجاء إدخال رقم هاتفك لاستعادة كلمة المرور.'}
            {step === 'verify' && 'الرجاء إدخال رمز التحقق الذي تم إرساله إلى هاتفك.'}
            {step === 'reset' && 'الرجاء تعيين كلمة مرور جديدة لحسابك.'}
            {step === 'done' && 'عملية استعادة كلمة المرور اكتملت.'}
          </p>
        </div>

        {/* Display form-wide error or success messages */}
        {formError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{formError}</span>
          </div>
        )}
        {formSuccess && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{formSuccess}</span>
          </div>
        )}

        {/* Step: Request Phone */}
        {step === 'request' && (
          <form className="mt-8 space-y-6" onSubmit={handleRequest}>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 text-right mb-1">رقم الهاتف:</label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full rounded-md border border-gray-300 shadow-sm p-2 focus:ring-primary-500 focus:border-primary-500 text-right"
                placeholder="مثال: 09XXXXXXXX"
                dir="ltr"
                required
              />
            </div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-600 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'جاري الإرسال...' : 'إرسال رمز التحقق'}
            </button>
            <Link href="/auth/login" className="block text-center text-sm text-primary-600 hover:underline mt-4">العودة لتسجيل الدخول</Link>
          </form>
        )}

        {/* Step: Verify Code */}
        {step === 'verify' && (
          <form className="mt-8 space-y-6" onSubmit={handleVerify}>
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 text-right mb-1">رمز التحقق:</label>
              <input
                id="code"
                type="text"
                value={code}
                onChange={e => setCode(e.target.value)}
                className="w-full rounded-md border border-gray-300 shadow-sm p-2 focus:ring-primary-500 focus:border-primary-500 text-right"
                placeholder="أدخل الرمز المكون من 6 أرقام"
                dir="ltr"
                required
              />
            </div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-600 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'جاري التحقق...' : 'تحقق من الرمز'}
            </button>
            <button
              type="button"
              onClick={() => { setStep('request'); setCode(''); setFormSuccess(''); setFormError(''); }} // Reset formError/Success too
              className="w-full text-center text-sm text-primary-600 hover:underline mt-4"
            >
              لم أستلم الرمز أو أريد تغيير الرقم
            </button>
          </form>
        )}

        {/* Step: Reset Password */}
        {step === 'reset' && (
          <form className="mt-8 space-y-6" onSubmit={handleReset}>
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 text-right mb-1">كلمة المرور الجديدة:</label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="w-full rounded-md border border-gray-300 shadow-sm p-2 focus:ring-primary-500 focus:border-primary-500 text-right"
                placeholder="كلمة المرور يجب أن تكون 8 أحرف على الأقل"
                required
              />
            </div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-600 disabled:opacity-50"
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