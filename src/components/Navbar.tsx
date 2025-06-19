'use client';
import Link from 'next/link';
import { useAuth } from '../hooks/useAuth';
import React from 'react';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  return (
    <nav className="bg-green-700 text-white p-4 flex items-center justify-between z-10 fixed top-0 left-0 w-full shadow">
      {/* Hajiz Logo in the right corner */}
      <div className="flex items-center gap-2">
        <img src="/hajiz%20logo.jpeg" alt="Hajiz Logo" className="w-10 h-10 rounded" />
        <span className="font-bold text-lg">Hajiz</span>
      </div>
      {/* Navigation buttons */}
      <div className="flex gap-4 items-center">
        <Link href="/" legacyBehavior passHref><a className="font-bold px-3 py-1 rounded hover:bg-green-800 transition-colors">الرئيسية</a></Link>
        {isAuthenticated && ( // New: "لوحة التحكم" button, visible only when authenticated
          <Link href="/home" legacyBehavior passHref>
            <a className="px-3 py-1 rounded hover:bg-green-800 transition-colors">لوحة التحكم</a>
          </Link>
        )}
        <Link href="/providers" legacyBehavior passHref><a className="px-3 py-1 rounded hover:bg-green-800 transition-colors">مقدمو الخدمات</a></Link>
        {isAuthenticated && (
          <>
            <Link href="/appointments" legacyBehavior passHref><a className="px-3 py-1 rounded hover:bg-green-800 transition-colors">مواعيدي</a></Link>
            <Link href="/profile" legacyBehavior passHref><a className="px-3 py-1 rounded hover:bg-green-800 transition-colors">الملف الشخصي</a></Link>
            <button onClick={logout} className="px-3 py-1 rounded hover:bg-red-700 transition-colors bg-red-600 ml-2">تسجيل الخروج</button>
          </>
        )}
        {!isAuthenticated && (
          <Link href="/auth/login" legacyBehavior passHref><a className="px-3 py-1 rounded hover:bg-green-800 transition-colors">تسجيل الدخول</a></Link>
        )}
      </div>
    </nav>
  );
}