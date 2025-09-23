import { useMutation, useQuery } from '@tanstack/react-query';
import { authService } from './index';
import { LoginRequest, RegisterRequest, User } from '@/types';

// Auth Mutations
export const useLogin = () => {
  return useMutation({
    mutationFn: (credentials: LoginRequest) => authService.login(credentials),
    onError: (error) => {
      console.error('Login mutation error:', error);
    },
  });
};

export const useRegister = () => {
  return useMutation({
    mutationFn: (userData: RegisterRequest) => authService.register(userData),
    onError: (error) => {
      console.error('Register mutation error:', error);
    },
  });
};

export const useLogout = () => {
  return useMutation({
    mutationFn: () => authService.logout(),
    onError: (error) => {
      console.error('Logout mutation error:', error);
    },
  });
};

// Auth Queries
export const useCurrentUser = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: () => authService.getCurrentUser(),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false, // Don't retry on auth errors
  });
};
