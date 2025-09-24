import { QueryClient, MutationCache, QueryCache } from '@tanstack/react-query';
import { Alert, AppState } from 'react-native';
import { ErrorHandler } from '@/services/api/errorHandler';
import { ApiError } from '@/types';

// Configure React Query Client with advanced settings
export const createQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Stale time: 5 minutes for doctors, 1 minute for appointments
        staleTime: 5 * 60 * 1000, // 5 minutes (default)

        // Cache time: 10 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)

        // Retry: 3 times with exponential backoff
        retry: (failureCount, error) => {
          // Don't retry on certain errors
          if (error && typeof error === 'object' && 'status' in error) {
            const apiError = error as ApiError;
            // Don't retry on 4xx errors (except network issues)
            if (apiError.status >= 400 && apiError.status < 500 && apiError.status !== 0) {
              return false;
            }
          }

          return failureCount < 3;
        },

        // Retry delay with exponential backoff
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

        // Refetch on window focus for appointments
        refetchOnWindowFocus: false, // We'll handle this per query

        // Refetch on reconnect
        refetchOnReconnect: true,

        // Don't refetch on mount if data is fresh
        refetchOnMount: true,

        // Network mode: retry requests when online
        networkMode: 'online'
      },
      mutations: {
        // Retry mutations once on failure
        retry: 1,

        // Network mode for mutations
        networkMode: 'online',

        // Retry delay for mutations
        retryDelay: 2000
      }
    },

    // Query cache for handling query errors globally
    queryCache: new QueryCache({
      onError: (error, query) => {
        // Log error for monitoring
        const apiError = error && typeof error === 'object' && 'status' in error
          ? error as ApiError
          : { message: error?.message || 'Unknown error', status: 0, code: 'UNKNOWN_ERROR' } as ApiError;

        ErrorHandler.logError(apiError, `Query: ${query.queryKey.join('/')}`);

        // Don't show alerts for background refetches
        if (query.meta?.errorPolicy !== 'silent') {
          // Handle API errors appropriately
          if (ErrorHandler.shouldShowUserError(apiError)) {
            ErrorHandler.handleApiError(apiError);
          }
        } else {
          // Handle non-API errors
          console.error('Query error:', error);
        }
      }
    }),

    // Mutation cache for handling mutation errors globally
    mutationCache: new MutationCache({
      onError: (error, _variables, _context, mutation) => {
        // Log error
        const mutationApiError = error && typeof error === 'object' && 'status' in error
          ? error as ApiError
          : { message: error?.message || 'Unknown mutation error', status: 0, code: 'UNKNOWN_ERROR' } as ApiError;

        ErrorHandler.logError(mutationApiError, `Mutation: ${mutation.options.mutationKey?.join('/') || 'unknown'}`);

        // Show error to user unless explicitly silenced
        if (mutation.meta?.errorPolicy !== 'silent') {
          if (error && typeof error === 'object' && 'status' in error) {
            const apiError = error as ApiError;
            ErrorHandler.handleApiError(apiError);
          } else {
            Alert.alert(
              'เกิดข้อผิดพลาด',
              'ไม่สามารถดำเนินการได้ กรุณาลองใหม่อีกครั้ง',
              [{ text: 'ตกลง' }]
            );
          }
        }
      },

      onSuccess: (_data, _variables, _context, mutation) => {
        // Log successful mutations in development
        if (__DEV__) {
          console.log(`✅ Mutation success: ${mutation.options.mutationKey?.join('/') || 'unknown'}`);
        }
      }
    })
  });
};

// Query key factories for consistent key generation
export const queryKeys = {
  // Doctors
  doctors: ['doctors'] as const,
  doctor: (id: string) => [...queryKeys.doctors, id] as const,
  doctorsBySpecialty: (specialtyId: string) => [...queryKeys.doctors, 'specialty', specialtyId] as const,
  doctorSearch: (params: any) => [...queryKeys.doctors, 'search', params] as const,
  featuredDoctors: (limit?: number) => [...queryKeys.doctors, 'featured', limit] as const,

  // Specialties
  specialties: ['specialties'] as const,
  specialty: (id: string) => [...queryKeys.specialties, id] as const,
  specialtiesWithCount: () => [...queryKeys.specialties, 'with-count'] as const,

  // Appointments
  appointments: ['appointments'] as const,
  myAppointments: (status?: string) => [...queryKeys.appointments, 'my', status] as const,
  upcomingAppointments: (limit?: number) => [...queryKeys.appointments, 'upcoming', limit] as const,
  appointment: (id: string) => [...queryKeys.appointments, id] as const,

  // User
  user: ['user'] as const,
  profile: () => [...queryKeys.user, 'profile'] as const,
} as const;

// Query options with specific configurations
export const queryOptions = {
  // Doctors - cache for 5 minutes, stale after 5 minutes
  doctors: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false
  },

  // Appointments - cache for 1 minute, refresh frequently
  appointments: {
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
    refetchInterval: 30 * 1000 // 30 seconds when focused
  },

  // Specialties - cache for 30 minutes, rarely changes
  specialties: {
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
    refetchOnWindowFocus: false
  },

  // User profile - cache for 10 minutes
  profile: {
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false
  }
} as const;

// App state listener for background/foreground transitions
export const setupAppStateListener = (queryClient: QueryClient) => {
  const handleAppStateChange = (nextAppState: string) => {
    if (nextAppState === 'active') {
      // App came to foreground, refetch critical data
      queryClient.invalidateQueries({
        queryKey: queryKeys.appointments,
        refetchType: 'active'
      });
    }
  };

  const subscription = AppState.addEventListener('change', handleAppStateChange);

  return () => subscription?.remove();
};

export default createQueryClient;