'use client';

import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { 
            staleTime: 5 * 60 * 1000, 
            retry: (failureCount, error: any) => {
              if (error?.response?.status === 401) return false;
              return failureCount < 1;
            }, 
            refetchOnWindowFocus: false 
          },
        },
      })
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
