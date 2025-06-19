'use client';

import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function OnboardingModal({ open, onClose }: { open: boolean; onClose?: () => void }) {
  const [role, setRole] = useState<'customer' | 'provider' | null>(null);
  const router = useRouter();

  const handlePick = (pickedRole: 'customer' | 'provider') => {
    setRole(pickedRole);
  };

  const handleLogin = (role: 'customer' | 'provider') => {
    if (onClose) onClose();
    if (role === 'customer') {
      router.push('/auth/login');
    } else {
      router.push('/auth/login?role=provider');
    }
  };

  const handleRegister = (role: 'customer' | 'provider') => {
    if (onClose) onClose();
    if (role === 'customer') {
      router.push('/auth/register-customer');
    } else {
      router.push('/auth/register-provider');
    }
  };

  return (
    <Dialog open={open} onClose={() => {}} className="fixed z-50 inset-0 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <Dialog.Panel className="relative bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-auto flex flex-col items-center">
        <button
          onClick={onClose}
          className="absolute top-4 left-4 text-gray-400 hover:text-red-600 text-2xl font-bold focus:outline-none"
          aria-label="إغلاق"
        >
          ×
        </button>
        <img src="/hajiz logo.jpeg" alt="Hajiz" className="h-24 w-auto mb-4" />
        <Dialog.Title className="text-2xl font-bold mb-4 text-primary-700">مرحباً بك في حجز</Dialog.Title>
        {!role && (
          <div className="space-y-4 w-full">
            <p className="mb-4 text-gray-700">هل أنت:</p>
            <button onClick={() => handlePick('customer')} className="w-full py-2 px-4 rounded bg-primary-600 text-white font-semibold hover:bg-primary-700">عميل (أبحث عن خدمة)</button>
            <button onClick={() => handlePick('provider')} className="w-full py-2 px-4 rounded bg-secondary-500 text-white font-semibold hover:bg-secondary-600">مقدم خدمة</button>
          </div>
        )}
        {role && (
          <div className="space-y-4 w-full">
            <p className="mb-2 text-gray-700">تسجيل الدخول أو إنشاء حساب ك{role === 'customer' ? 'عميل' : 'مقدم خدمة'}</p>
            <button onClick={() => handleLogin(role)} className="block w-full py-2 px-4 rounded bg-primary-600 text-white text-center font-semibold hover:bg-primary-700">تسجيل الدخول</button>
            <button onClick={() => handleRegister(role)} className="block w-full py-2 px-4 rounded bg-secondary-500 text-white text-center font-semibold hover:bg-secondary-600">إنشاء حساب</button>
            <button onClick={() => setRole(null)} className="mt-2 text-sm text-gray-500 underline">رجوع</button>
          </div>
        )}
      </Dialog.Panel>
    </Dialog>
  );
} 