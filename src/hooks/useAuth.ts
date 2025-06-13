import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { auth } from '../lib/api';

export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: 'customer' | 'provider';
}

export function useAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery<User>({
    queryKey: ['user'],
    queryFn: async () => {
      try {
        const response = await auth.getProfile();
        return response.data;
      } catch (error) {
        // If not authenticated, clear token
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
        }
        throw error;
      }
    },
    retry: false,
    enabled: !!localStorage.getItem('token'),
  });

  const login = useMutation({
    mutationFn: auth.login,
    onSuccess: (response) => {
      localStorage.setItem('token', response.data.token);
      queryClient.invalidateQueries({ queryKey: ['user'] });
      router.push('/');
    },
  });

  const register = useMutation({
    mutationFn: auth.register,
    onSuccess: (response) => {
      localStorage.setItem('token', response.data.token);
      queryClient.invalidateQueries({ queryKey: ['user'] });
      router.push('/');
    },
  });

  const logout = () => {
    localStorage.removeItem('token');
    queryClient.clear();
    router.push('/auth/login');
  };

  const updateProfile = useMutation({
    mutationFn: auth.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateProfile,
  };
} 