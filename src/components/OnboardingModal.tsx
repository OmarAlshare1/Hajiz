'use client'; // This component uses client-side hooks and interactions

import React, { useState } from 'react'; // Importing React and useState hook
import { Dialog, Transition } from '@headlessui/react'; // Headless UI components for accessible dialogs and transitions
import Link from 'next/link'; // Next.js Link component for client-side navigation
import { useRouter } from 'next/navigation'; // Next.js useRouter hook for navigation

export default function OnboardingModal({ open, onClose }: { open: boolean; onClose?: () => void }) {
  // State to manage the current step of the onboarding modal: null (role selection), 'customer', or 'provider'
  const [role, setRole] = useState<'customer' | 'provider' | null>(null);
  const router = useRouter(); // Initialize Next.js router

  // Function to handle the role selection
  const handlePick = (pickedRole: 'customer' | 'provider') => {
    setRole(pickedRole); // Set the selected role to show the next step
  };

  // Function to handle navigation to the login page based on the selected role
  const handleLogin = (selectedRole: 'customer' | 'provider') => {
    if (onClose) onClose(); // Close the modal if onClose function is provided
    if (selectedRole === 'customer') {
      router.push('/auth/login'); // Navigate to general login for customers
    } else {
      router.push('/auth/login?role=provider'); // Navigate to login, potentially indicating provider role
    }
  };

  // Function to handle navigation to the registration page based on the selected role
  const handleRegister = (selectedRole: 'customer' | 'provider') => {
    if (onClose) onClose(); // Close the modal
    if (selectedRole === 'customer') {
      router.push('/auth/register-customer'); // Navigate to customer registration
    } else {
      router.push('/auth/register-provider'); // Navigate to provider registration
    }
  };

  return (
    // Dialog component from Headless UI for the modal functionality
    <Dialog open={open} onClose={() => {}} className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 font-inter">
      {/* Background overlay with a smooth transition */}
      <Transition.Child
        as={React.Fragment}
        enter="ease-out duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="ease-in duration-200"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className="fixed inset-0 bg-black bg-opacity-60" aria-hidden="true" />
      </Transition.Child>

      {/* Modal Panel (The actual content of the modal) */}
      <Transition.Child
        as={React.Fragment}
        enter="ease-out duration-300"
        enterFrom="opacity-0 scale-95"
        enterTo="opacity-100 scale-100"
        leave="ease-in duration-200"
        leaveFrom="opacity-100 scale-100"
        leaveTo="opacity-0 scale-95"
      >
        <Dialog.Panel className="relative bg-white rounded-xl shadow-2xl p-6 sm:p-8 w-full max-w-sm mx-auto flex flex-col items-center text-center transform transition-all">
          {/* Close Button - positioned absolutely for easy access */}
          {onClose && ( // Only render close button if onClose prop is provided
            <button
              onClick={onClose}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-3xl transition duration-150 ease-in-out"
              aria-label="إغلاق"
            >
              &times; {/* HTML entity for multiplication sign, commonly used for close */}
            </button>
          )}

          {/* Logo */}
          <img src="/hajiz logo.jpeg" alt="Hajiz" className="h-20 w-auto mb-4 rounded-full shadow-md" /> {/* Responsive size, rounded, and shadow */}

          {/* Modal Title */}
          <Dialog.Title className="text-2xl sm:text-3xl font-bold mb-6 text-gray-900">مرحباً بك في حجز</Dialog.Title>

          {!role && ( // Step 1: Role Selection
            <div className="space-y-4 w-full">
              <p className="mb-4 text-gray-700 text-lg sm:text-xl font-medium">هل أنت:</p>
              {/* Customer Role Button */}
              <button
                onClick={() => handlePick('customer')}
                className="w-full py-3 px-4 rounded-lg bg-blue-600 text-white font-semibold text-lg hover:bg-blue-700 transition duration-150 ease-in-out shadow-md"
              >
                عميل (أبحث عن خدمة)
              </button>
              {/* Provider Role Button */}
              <button
                onClick={() => handlePick('provider')}
                className="w-full py-3 px-4 rounded-lg bg-green-600 text-white font-semibold text-lg hover:bg-green-700 transition duration-150 ease-in-out shadow-md"
              >
                مقدم خدمة
              </button>
            </div>
          )}

          {role && ( // Step 2: Login/Register based on selected role
            <div className="space-y-4 w-full">
              <p className="mb-4 text-gray-700 text-lg sm:text-xl font-medium">
                تسجيل الدخول أو إنشاء حساب ك<span className="font-bold text-blue-800">{role === 'customer' ? 'عميل' : 'مقدم خدمة'}</span>
              </p>
              {/* Login Button */}
              <button
                onClick={() => handleLogin(role)}
                className="w-full py-3 px-4 rounded-lg bg-blue-600 text-white font-semibold text-lg hover:bg-blue-700 transition duration-150 ease-in-out shadow-md"
              >
                تسجيل الدخول
              </button>
              {/* Register Button */}
              <button
                onClick={() => handleRegister(role)}
                className="w-full py-3 px-4 rounded-lg bg-gray-500 text-white font-semibold text-lg hover:bg-gray-600 transition duration-150 ease-in-out shadow-md"
              >
                إنشاء حساب
              </button>
              {/* Back Button */}
              <button
                onClick={() => setRole(null)} // Go back to role selection
                className="mt-4 text-base font-semibold text-gray-600 hover:text-gray-800 hover:underline transition duration-150 ease-in-out"
              >
                &larr; رجوع
              </button>
            </div>
          )}
        </Dialog.Panel>
      </Transition.Child>
    </Dialog>
  );
}
