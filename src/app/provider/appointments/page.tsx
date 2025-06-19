'use client';

import dynamic from 'next/dynamic';

// Dynamically import the actual page component with no SSR
const ProviderAppointments = dynamic(
  () => import('@/components/ProviderAppointments'),
  { ssr: false }
);

export default function ProviderAppointmentsPage() {
  return <ProviderAppointments />;

}