"use client";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import React, { useState, useContext, createContext, useEffect } from 'react';
import { auth } from '../lib/api';
import { useRouter } from 'next/navigation';

// Define the shape of our authentication context
interface AuthContextType {
  user: any | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: { phone: string; password: string }) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  updateProfile: (userData: any) => Promise<void>;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  updateProfile: async () => {}
});

// Custom hook to use the auth context
export function useAuth<T = any>() {
  return useContext(AuthContext) as AuthContextType & { user: T | null };
}

// Provider component that wraps your app and makes auth object available to any child component that calls useAuth().
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const router = useRouter();

  // Use React Query to fetch the current user
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      try {
        // Only attempt to get user if we have a token
        if (typeof window !== 'undefined' && localStorage.getItem('token')) {
          const response = await auth.getCurrentUser();
          return response.data;
        }
        return null;
      } catch (error) {
        // If there's an error (like 401), clear the token and return null
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
        }
        return null;
      }
    },
    retry: false
  });

  // Update user state when data changes
  useEffect(() => {
    setUser(data);
  }, [data]);

  // Login function
  const login = async (credentials: { phone: string; password: string }) => {
    console.log('🚀 useAuth.login function called with:', credentials);
    console.log('🚀 About to call auth.login from api.ts');
    try {
      console.log('🚀 Calling auth.login...');
      const response = await auth.login(credentials);
      console.log('🚀 Login response received:', response);
      if (response.data.token) {
        console.log('Token received, setting in localStorage');
        localStorage.setItem('token', response.data.token);
        console.log('Refetching user data');
        await refetch(); // Refetch user data after login
        console.log('Redirecting to home page');
        
        // Ensure we're in a browser environment
        if (typeof window !== 'undefined') {
          // First try using the Next.js router
          if (router) {
            console.log('Router is available, navigating to /home');
            try {
              // Force a hard navigation to ensure page reload
              window.location.href = '/home';
            } catch (navError) {
              console.error('Navigation error with router:', navError);
              // Fallback to direct location change
              window.location.href = '/home';
            }
          } else {
            console.error('Router is not available');
            // Direct location change
            window.location.href = '/home';
          }
        } else {
          console.error('Not in browser environment, cannot navigate');
        }
      } else {
        console.error('No token received in response');
      }
    } catch (error: any) {
      console.error('🚨 Error in useAuth.login function:', error);
      console.error('🚨 Error type:', typeof error);
      console.error('🚨 Error details:', {
        message: error?.message,
        response: error?.response,
        request: error?.request,
        code: error?.code
      });
      throw error; // Re-throw the error to be caught by the component
    }
  };

  // Register function
  const register = async (userData: any) => {
    const response = await auth.register(userData);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      await refetch(); // Refetch user data after registration
      router.push('/home'); // Redirect to home page after successful registration
    }
  };

  // Logout function
  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      setUser(null);
    }
  };

  // Update profile function
  const updateProfile = async (userData: any) => {
    const response = await auth.updateProfile(userData);
    await refetch(); // Refetch user data after profile update
    return response.data;
  };

  // Create the context value object
  const contextValue = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateProfile
  };

  // Return the provider component
  return React.createElement(AuthContext.Provider, { value: contextValue }, children);
}

/**
 * ReactQueryProvider component.
 * This component sets up the QueryClient and makes it available
 * to all child components via the QueryClientProvider.
 */
export default function ReactQueryProvider({ children }: { children: React.ReactNode }) {
  // Create a new QueryClient instance
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

  // Return the provider component
  return React.createElement(
    QueryClientProvider,
    { client: queryClient },
    React.createElement(AuthProvider, { children }, children)
  );
}
