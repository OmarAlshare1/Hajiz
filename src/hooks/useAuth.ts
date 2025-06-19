// client/src/hooks/useAuth.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { AxiosError } from 'axios';
import { auth } from '@/lib/api';

interface User {
  _id: string;
  name: string;
  email?: string;
  phone: string;
  role: 'customer' | 'provider';
  // Add other user properties you expect from your backend /api/auth/profile
}

interface RegisterData {
  name: string;
  phone: string;
  email: string; // Required based on api.ts
  password: string;
  role: 'customer' | 'provider';
  businessName?: string;
  category?: string;
}

export const useAuth = <T extends User>() => {
  const queryClient = useQueryClient();
  const router = useRouter();

  // Function to fetch user profile, handles token check and 401 errors
  const fetchUserProfile = async (): Promise<T | null> => {
    if (typeof window === 'undefined' || !localStorage.getItem('token')) {
      return null; // Don't fetch if not in browser or no token
    }
    try {
      const response = await auth.getProfile();
      return response.data as T; // Explicitly cast to generic type
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token'); // Clear invalid token
        }
        return null; // Return null to indicate no authenticated user
      }
      throw error; // Re-throw other errors
    }
  };

  // Main user data query
  const {
    data: user,
    isLoading,
    isError,
    error,
  } = useQuery<T | null, AxiosError>({
    queryKey: ['user'],
    queryFn: fetchUserProfile,
    enabled: typeof window !== 'undefined',
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retry: false
  });

  // Mutation for user login
  const loginMutation = useMutation<any, AxiosError, { phone: string; password: string }>({
    mutationFn: auth.login,
    onSuccess: (response) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', response.data.token);
      }
      queryClient.setQueryData(['user'], response.data.user as T);
      router.push('/home');
    },
    onError: (err: AxiosError) => {
      console.error('Login failed:', err.response?.data || err.message);
      throw err;
    },
  });

  // Mutation for user registration
  const registerMutation = useMutation<any, AxiosError, RegisterData>({
    mutationFn: auth.register,
    onSuccess: (response) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', response.data.token);
      }
      queryClient.setQueryData(['user'], response.data.user as T);
      router.push('/home');
    },
    onError: (err: AxiosError) => {
      console.error('Registration failed:', err.response?.data || err.message);
      throw err;
    },
  });

  // Logout function
  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token'); // Clear token from localStorage
    }
    // Use resetQueries to aggressively clear and reset the 'user' query state
    queryClient.resetQueries({ queryKey: ['user'] });
    router.push('/auth/login'); // Redirect to login page
  };

  // Mutation for updating user profile
  const updateProfileMutation = useMutation<any, AxiosError, { name?: string; email?: string; password?: string }>({
    mutationFn: auth.updateProfile,
    onSuccess: (response) => {
      if (response.data.user) {
         queryClient.setQueryData(['user'], response.data.user as T);
      }
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
    onError: (err: AxiosError) => {
      console.error('Profile update failed:', err.response?.data || err.message);
      throw err;
    }
  });


  return {
    user: user as T | null,
    isLoading,
    isAuthenticating: isLoading,
    isAuthenticated: !!user && !isLoading, // User is authenticated if data exists and not loading
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout,
    updateProfile: updateProfileMutation.mutateAsync,
  };
};
