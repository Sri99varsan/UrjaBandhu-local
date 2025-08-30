'use client'

import { QueryClient, QueryClientProvider, useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import React from 'react'

// Create a client
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            gcTime: 1000 * 60 * 30, // 30 minutes (was cacheTime in v4)
            retry: 3,
            retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
            refetchOnWindowFocus: false,
            refetchOnReconnect: true,
        },
        mutations: {
            retry: 1,
            onError: (error) => {
                console.error('Mutation error:', error)
            },
        },
    },
})

// Query Client Provider Component
export function QueryProvider({ children }: { children: React.ReactNode }) {
    return (
        <QueryClientProvider client= { queryClient } >
        { children }
    {
        process.env.NODE_ENV === 'development' && (
            <ReactQueryDevtools initialIsOpen={ false } />
      )
    }
    </QueryClientProvider>
  )
}

// Export hooks and client for use throughout the app
export { useQuery, useMutation, useQueryClient }
export default queryClient
