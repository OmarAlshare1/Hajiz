'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import OnboardingModal from "@/components/OnboardingModal";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  const [showModal, setShowModal] = useState(false);
  useEffect(() => {
    if (typeof window !== 'undefined' && !localStorage.getItem('token')) {
      setShowModal(true);
    } else {
      setShowModal(false);
    }
  }, []);

  return (
    <>
      {showModal && <OnboardingModal open={true} onClose={() => setShowModal(false)} />}
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </>
  );
} 