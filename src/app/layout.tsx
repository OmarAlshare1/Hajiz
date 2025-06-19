import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Navbar from '../components/Navbar';
import ReactQueryProvider from '../components/ReactQueryProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Hajiz',
  description: 'منصة حجز مقدمي الخدمات',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body className={inter.className + ' bg-gray-50 min-h-screen'}>
        <ReactQueryProvider>
          <Navbar />
          <main>{children}</main>
        </ReactQueryProvider>
      </body>
    </html>
  );
}