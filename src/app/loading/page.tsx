'use client';
import React, { useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useRouter } from 'next/navigation';

export default function LoadingPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // FIX: Redirect immediately once user data is loaded and available
    // No fixed setTimeout, for better responsiveness
    if (!isLoading && user) {
      router.push('/home');
    }
    // Also, if the user somehow becomes null/unauthenticated, redirect them away from loading page
    if (!isLoading && !user && typeof window !== 'undefined' && localStorage.getItem('token')) {
        // If localStorage has a token but user is null after loading, something is wrong with token/session
        // or user role check failed; redirect to login for re-authentication.
        localStorage.removeItem('token'); // Clear potentially bad token
        router.push('/auth/login');
    }
  }, [user, isLoading, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 pt-20">
      <div className="flex flex-col items-center p-8 bg-white rounded-lg shadow-md border-t-4 border-primary-600"> {/* Added styling */}
        <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-primary-600 mb-6"></div> {/* Larger, bolder spinner */}
        <h2 className="text-3xl font-bold text-gray-800 mb-3">جاري تجهيز حسابك...</h2> {/* Stronger message */}
        {user ? ( // Display user info only if available
          <p className="text-lg text-gray-700 mt-2 text-center">
            مرحباً بك، <span className="font-semibold text-primary-700">{user.name}</span>!
            أنت الآن مسجل كـ <span className="font-semibold text-primary-700">{user.role === 'provider' ? 'مقدم خدمة' : 'عميل'}</span>.
          </p>
        ) : (
          <p className="text-lg text-gray-700 mt-2 text-center">
            لحظات من فضلك...
          </p>
        )}
        {/* Optional: Add a simple progress bar or more details here later */}
      </div>
    </div>
  );
}