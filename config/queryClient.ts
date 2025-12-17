import { QueryClient, MutationCache, QueryCache } from '@tanstack/react-query';
import { Alert, AppState } from 'react-native';
import { ErrorHandler } from '@/services/api/errorHandler';
import { ApiError } from '@/types';

export const createQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        retry: (failureCount, error) => {
          if (error && typeof error === 'object' && 'status' in error) {
            const apiError = error as ApiError;
            if (apiError.status >= 400 && apiError.status < 500 && apiError.status !== 0) {
              return false;
            }
          }

          return failureCount < 3;
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
        refetchOnMount: true,
        networkMode: 'online'
      },
      mutations: {
        retry: 1,
        networkMode: 'online',
        retryDelay: 2000
      }
    },
    queryCache: new QueryCache({
      onError: (error, query) => {
        const apiError = error && typeof error === 'object' && 'status' in error
          ? error as ApiError
          : { message: error?.message || 'Unknown error', status: 0, code: 'UNKNOWN_ERROR' } as ApiError;

        ErrorHandler.logError(apiError, `Query: ${query.queryKey.join('/')}`);

        if (query.meta?.errorPolicy !== 'silent') {
          if (ErrorHandler.shouldShowUserError(apiError)) {
            ErrorHandler.handleApiError(apiError);
          }
        } else {
          console.error('Query error:', error);
        }
      }
    }),
    mutationCache: new MutationCache({
      onError: (error, _variables, _context, mutation) => {
        const mutationApiError = error && typeof error === 'object' && 'status' in error
          ? error as ApiError
          : { message: error?.message || 'Unknown mutation error', status: 0, code: 'UNKNOWN_ERROR' } as ApiError;

        ErrorHandler.logError(mutationApiError, `Mutation: ${mutation.options.mutationKey?.join('/') || 'unknown'}`);

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
        if (__DEV__) {
          console.log(`✅ Mutation success: ${mutation.options.mutationKey?.join('/') || 'unknown'}`);
        }
      }
    })
  });
};

export const queryKeys = {
  doctors: ['doctors'] as const,
  doctor: (id: string) => [...queryKeys.doctors, id] as const,
  doctorsBySpecialty: (specialtyId: string) => [...queryKeys.doctors, 'specialty', specialtyId] as const,
  doctorSearch: (params: any) => [...queryKeys.doctors, 'search', params] as const,
  featuredDoctors: (limit?: number) => [...queryKeys.doctors, 'featured', limit] as const,
  specialties: ['specialties'] as const,
  specialty: (id: string) => [...queryKeys.specialties, id] as const,
  specialtiesWithCount: () => [...queryKeys.specialties, 'with-count'] as const,
  appointments: ['appointments'] as const,
  myAppointments: (status?: string) => [...queryKeys.appointments, 'my', status] as const,
  upcomingAppointments: (limit?: number) => [...queryKeys.appointments, 'upcoming', limit] as const,
  appointment: (id: string) => [...queryKeys.appointments, id] as const,
  user: ['user'] as const,
  profile: () => [...queryKeys.user, 'profile'] as const,
} as const;

export const queryOptions = {
  doctors: {
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false
  },
  appointments: {
    staleTime: 1 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchInterval: 30 * 1000
  },
  specialties: {
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false
  },
  profile: {
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false
  }
} as const;

export const setupAppStateListener = (queryClient: QueryClient) => {
  const handleAppStateChange = (nextAppState: string) => {
    if (nextAppState === 'active') {
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