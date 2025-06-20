"use client"; // This component must run on the client side

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'; // Importing necessary components from React Query
import React, { useState } from 'react'; // Importing React and useState hook

/**
 * ReactQueryProvider component.
 * This component sets up the QueryClient and makes it available
 * to all child components via the QueryClientProvider.
 * It's essential for managing data fetching, caching, and synchronization
 * throughout your Next.js application.
 */
export default function ReactQueryProvider({ children }: { children: React.ReactNode }) {
  // Use useState to create a new QueryClient instance only once when the component mounts.
  // This ensures the same client is used across all re-renders and prevents re-initialization.
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Disable refetching data automatically when the browser window regains focus.
            // This is often preferred for better user experience, especially on mobile,
            // to avoid unexpected data refreshes. Data can still be manually refetched.
            refetchOnWindowFocus: false,
            // Configure queries to retry failed requests a maximum of 1 time.
            // This helps handle transient network issues without overwhelming the server.
            retry: 1,
          },
        },
      })
  );

  // Provide the created QueryClient to all children components.
  // Any component wrapped by this provider can now use React Query hooks (e.g., useQuery, useMutation).
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
