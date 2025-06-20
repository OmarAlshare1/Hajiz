'use client';
import React, { useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth'; // Assuming useAuth hook path is correct
import { useRouter } from 'next/navigation';

export default function LoadingPage() {
  const { user, isLoading, isAuthenticated } = useAuth(); // Added isAuthenticated for more explicit checks
  const router = useRouter();

  useEffect(() => {
    // Only redirect if authentication loading is complete
    if (!isLoading) {
      if (user) {
        // User is authenticated and data is loaded, redirect to home
        router.push('/home');
      } else {
        // User is not authenticated AND loading is complete.
        // Check if a token exists locally, which might indicate a stale/invalid session.
        // If a token exists but no user object, clear it and redirect to login for re-authentication.
        if (typeof window !== 'undefined' && localStorage.getItem('token')) {
          localStorage.removeItem('token'); // Clear potentially bad token
          router.push('/auth/login?sessionExpired=true'); // Redirect to login with a flag
        } else {
          // No user and no token, or user explicitly logged out (handled elsewhere),
          // ensure they are on the login page or equivalent.
          router.push('/auth/login');
        }
      }
    }
  }, [user, isLoading, isAuthenticated, router]); // Added isAuthenticated to dependency array

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 font-inter p-4 sm:p-6">
      <div className="flex flex-col items-center justify-center p-8 bg-white rounded-xl shadow-2xl border-t-4 border-blue-600 max-w-sm w-full text-center">
        {/* Modern, larger spinner */}
        <div className="animate-spin rounded-full h-24 w-24 border-t-4 border-b-4 border-blue-500 mb-6 border-opacity-75"></div>

        {/* Stronger, responsive message */}
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3">
          جاري تجهيز حسابك...
        </h2>

        {/* Dynamic welcome message */}
        {user ? (
          <p className="text-md sm:text-lg text-gray-700 mt-2">
            مرحباً بك، <span className="font-semibold text-blue-700">{user.name}</span>!
            <br />
            أنت الآن مسجل كـ <span className="font-semibold text-blue-700">{user.role === 'provider' ? 'مقدم خدمة' : 'عميل'}</span>.
          </p>
        ) : (
          <p className="text-md sm:text-lg text-gray-700 mt-2">
            لحظات من فضلك... يتم تحميل البيانات.
          </p>
        )}
      </div>
    </div>
  );
}
