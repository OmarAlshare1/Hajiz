// D:\Hajiz\client\src\app\layout.tsx
import './globals.css'; // Global CSS imports (e.g., Tailwind's base styles)
import type { Metadata } from 'next'; // Type import for Metadata
import { Inter } from 'next/font/google'; // Google Font import
import Navbar from '../components/Navbar'; // Your global Navbar component
import ReactQueryProvider from '../components/ReactQueryProvider'; // React Query context provider

// Initialize the Inter font with latin subset
const inter = Inter({ subsets: ['latin'] });

// Define metadata for the application (for SEO and browser tabs)
export const metadata: Metadata = {
  title: 'Hajiz',
  description: 'منصة حجز مقدمي الخدمات', // Arabic description
};

// RootLayout component that wraps all pages
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // Set HTML language to Arabic and direction to Right-to-Left
    <html lang="ar" dir="rtl">
      {/*
        Next.js automatically injects a responsive viewport meta tag in the <head>
        for the App Router, so you don't typically need to add it here explicitly.
        It ensures the page scales correctly on all devices.
      */}
      <body
        // Apply Inter font, set a minimum height for consistent background,
        // and a general light gray background.
        // `font-inter` class assumes you have configured `Inter` in your tailwind.config.js
        // or a global CSS file, aligning with what we've done in other components.
        className={`${inter.className} bg-gray-100 min-h-screen antialiased`}
      >
        {/* ReactQueryProvider to enable React Query throughout the application */}
        <ReactQueryProvider>
          {/* Your global Navbar component */}
          <Navbar />
          {/*
            Main content area. Pages often need top padding (e.g., pt-24)
            to clear the fixed Navbar. This is handled on individual pages.
          */}
          <main className="flex-grow">
            {children}
          </main>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
