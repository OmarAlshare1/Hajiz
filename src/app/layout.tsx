import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../styles/globals.css";
import Providers from './providers';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Hajiz - حاجز",
  description: "منصة حجز المواعيد الأولى في سوريا",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
