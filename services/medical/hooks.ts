import { useQuery, useMutation, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { doctorService } from '../doctors';
import { specialtyService } from '../specialties';
import { appointmentService } from '../appointments';
import { queryKeys, queryOptions } from '@/config/queryClient';
import type {
  Doctor,
  Specialty,
  Appointment,
  AppointmentStatus,
  DoctorSearchFilters,
  BookAppointmentRequest,
} from '@/types';
import { Alert } from 'react-native';

// Query Keys
export const QUERY_KEYS = {
  doctors: ['doctors'] as const,
  doctor: (id: string) => ['doctors', id] as const,
  doctorsBySpecialty: (specialtyId: string) => ['doctors', 'specialty', specialtyId] as const,
  doctorsInfinite: (filters: DoctorSearchFilters) => ['doctors', 'infinite', filters] as const,
  featuredDoctors: ['doctors', 'featured'] as const,

  specialties: ['specialties'] as const,
  specialty: (id: string) => ['specialties', id] as const,
  specialtiesWithCount: ['specialties', 'with-count'] as const,
  popularSpecialties: ['specialties', 'popular'] as const,

  appointments: ['appointments'] as const,
  appointment: (id: string) => ['appointments', id] as const,
  myAppointments: (status?: AppointmentStatus) => ['appointments', 'my', status] as const,
  appointmentHistory: ['appointments', 'history'] as const,
  upcomingAppointments: ['appointments', 'upcoming'] as const,
  todayAppointments: ['appointments', 'today'] as const,
} as const;

// ============= DOCTOR HOOKS =============

/**
 * Hook for fetching doctors with search and filtering
 */
export const useDoctors = (filters: DoctorSearchFilters = {}) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.doctors, filters],
    queryFn: () => doctorService.searchDoctors(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (was cacheTime)
  });
};

/**
 * Hook for infinite scroll doctors list
 */
export const useDoctorsInfinite = (filters: DoctorSearchFilters = {}) => {
  return useInfiniteQuery({
    queryKey: QUERY_KEYS.doctorsInfinite(filters),
    queryFn: ({ pageParam = 0 }) =>
      doctorService.getDoctorsInfinite(pageParam, filters),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

/**
 * Hook for fetching single doctor details
 */
export const useDoctor = (id: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: QUERY_KEYS.doctor(id),
    queryFn: () => doctorService.getDoctorById(id),
    enabled: enabled && !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes for doctor details
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};

/**
 * Hook for searching doctors by name
 */
export const useDoctorSearch = (query: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.doctors, 'search', query],
    queryFn: () => doctorService.searchDoctorsByName(query),
    enabled: enabled && query.trim().length >= 2,
    staleTime: 2 * 60 * 1000, // 2 minutes for search results
  });
};

/**
 * Hook for fetching doctors by specialty
 */
export const useDoctorsBySpecialty = (
  specialtyId: string,
  page: number = 0,
  size: number = 10,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.doctorsBySpecialty(specialtyId), page, size],
    queryFn: () => doctorService.getDoctorsBySpecialty(specialtyId, page, size),
    enabled: enabled && !!specialtyId,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook for fetching featured doctors
 */
export const useFeaturedDoctors = (limit: number = 5) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.featuredDoctors, limit],
    queryFn: () => doctorService.getFeaturedDoctors(limit),
    staleTime: 15 * 60 * 1000, // 15 minutes for featured content
    gcTime: 30 * 60 * 1000,
  });
};

// ============= SPECIALTY HOOKS =============

/**
 * Hook for fetching all specialties
 */
export const useSpecialties = () => {
  return useQuery({
    queryKey: QUERY_KEYS.specialties,
    queryFn: () => specialtyService.getSpecialties(),
    staleTime: 30 * 60 * 1000, // 30 minutes - specialties don't change often
    gcTime: 60 * 60 * 1000, // 1 hour
  });
};

/**
 * Hook for fetching single specialty
 */
export const useSpecialty = (id: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: QUERY_KEYS.specialty(id),
    queryFn: () => specialtyService.getSpecialtyById(id),
    enabled: enabled && !!id,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });
};

/**
 * Hook for fetching specialties with doctor count
 */
export const useSpecialtiesWithCount = () => {
  return useQuery({
    queryKey: QUERY_KEYS.specialtiesWithCount,
    queryFn: () => specialtyService.getSpecialtiesWithDoctorCount(),
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 30 * 60 * 1000,
  });
};

/**
 * Hook for fetching popular specialties
 */
export const usePopularSpecialties = (limit: number = 6) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.popularSpecialties, limit],
    queryFn: () => specialtyService.getPopularSpecialties(limit),
    staleTime: 15 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
};

// ============= APPOINTMENT HOOKS =============

/**
 * Hook for fetching user's appointments
 */
export const useMyAppointments = (status?: AppointmentStatus) => {
  return useQuery({
    queryKey: QUERY_KEYS.myAppointments(status),
    queryFn: () => appointmentService.getMyAppointments({ status }),
    staleTime: 1 * 60 * 1000, // 1 minute - appointments need fresh data
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true, // Refetch when app becomes active
  });
};

/**
 * Hook for fetching single appointment
 */
export const useAppointment = (id: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: QUERY_KEYS.appointment(id),
    queryFn: () => appointmentService.getAppointmentById(id),
    enabled: enabled && !!id,
    staleTime: 30 * 1000, // 30 seconds for individual appointment
    gcTime: 5 * 60 * 1000,
  });
};

/**
 * Hook for fetching upcoming appointments
 */
export const useUpcomingAppointments = (limit: number = 5) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.upcomingAppointments, limit],
    queryFn: () => appointmentService.getUpcomingAppointments(limit),
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000,
    refetchInterval: 60 * 1000, // Auto-refetch every minute when focused
    refetchIntervalInBackground: false,
  });
};

/**
 * Hook for fetching today's appointments
 */
export const useTodayAppointments = () => {
  return useQuery({
    queryKey: QUERY_KEYS.todayAppointments,
    queryFn: () => appointmentService.getTodayAppointments(),
    staleTime: 30 * 1000,
    gcTime: 2 * 60 * 1000,
    refetchInterval: 30 * 1000, // Auto-refetch every 30 seconds
    refetchIntervalInBackground: false,
  });
};

/**
 * Hook for fetching appointment history
 */
export const useAppointmentHistory = (page: number = 0, size: number = 10) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.appointmentHistory, page, size],
    queryFn: () => appointmentService.getAppointmentHistory(page, size),
    staleTime: 5 * 60 * 1000, // 5 minutes for history
    gcTime: 15 * 60 * 1000,
  });
};

// ============= MUTATION HOOKS =============

/**
 * Hook for booking appointments
 */
export const useBookAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: BookAppointmentRequest) =>
      appointmentService.bookAppointment(request),
    onSuccess: (data, variables) => {
      // Invalidate and refetch appointment queries
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.appointments });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.upcomingAppointments });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.todayAppointments });

      Alert.alert(
        'จองนัดหมายสำเร็จ',
        'การจองนัดหมายของคุณถูกส่งไปยังแพทย์แล้ว รอการยืนยัน',
        [{ text: 'ตกลง' }]
      );
    },
    onError: (error: any) => {
      console.error('Booking appointment error:', error);
      Alert.alert(
        'จองนัดหมายไม่สำเร็จ',
        error.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง',
        [{ text: 'ตกลง' }]
      );
    },
  });
};

/**
 * Hook for cancelling appointments
 */
export const useCancelAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      appointmentService.cancelAppointment(id, { reason }),
    onMutate: async ({ id }) => {
      // Optimistically update the UI
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.appointments });

      // Snapshot previous data
      const previousAppointments = queryClient.getQueryData(QUERY_KEYS.appointments);

      // Optimistically update
      queryClient.setQueryData(QUERY_KEYS.appointments, (old: any) => {
        if (!old) return old;
        return old.filter((apt: Appointment) => apt.id !== id);
      });

      return { previousAppointments };
    },
    onSuccess: () => {
      // Invalidate queries after successful cancellation
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.appointments });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.upcomingAppointments });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.todayAppointments });

      Alert.alert(
        'ยกเลิกนัดหมายสำเร็จ',
        'การนัดหมายของคุณถูกยกเลิกแล้ว',
        [{ text: 'ตกลง' }]
      );
    },
    onError: (error: any, variables, context) => {
      // Rollback optimistic update on error
      if (context?.previousAppointments) {
        queryClient.setQueryData(QUERY_KEYS.appointments, context.previousAppointments);
      }

      Alert.alert(
        'ยกเลิกนัดหมายไม่สำเร็จ',
        error.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง',
        [{ text: 'ตกลง' }]
      );
    },
  });
};

/**
 * Hook for rescheduling appointments
 */
export const useRescheduleAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, appointmentDateTime, notes }: {
      id: string;
      appointmentDateTime: string;
      notes?: string;
    }) => appointmentService.rescheduleAppointment(id, { appointmentDateTime, notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.appointments });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.upcomingAppointments });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.todayAppointments });

      Alert.alert(
        'เลื่อนนัดหมายสำเร็จ',
        'คำขอเลื่อนนัดหมายของคุณถูกส่งไปยังแพทย์แล้ว',
        [{ text: 'ตกลง' }]
      );
    },
    onError: (error: any) => {
      Alert.alert(
        'เลื่อนนัดหมายไม่สำเร็จ',
        error.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง',
        [{ text: 'ตกลง' }]
      );
    },
  });
};

// ============= UTILITY HOOKS =============

/**
 * Hook to invalidate all medical queries
 */
export const useInvalidateQueries = () => {
  const queryClient = useQueryClient();

  return {
    invalidateAll: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.doctors });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.specialties });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.appointments });
    },
    invalidateDoctors: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.doctors });
    },
    invalidateSpecialties: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.specialties });
    },
    invalidateAppointments: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.appointments });
    },
  };
};

/**
 * Hook for prefetching data
 */
export const usePrefetch = () => {
  const queryClient = useQueryClient();

  return {
    prefetchDoctor: (id: string) => {
      queryClient.prefetchQuery({
        queryKey: QUERY_KEYS.doctor(id),
        queryFn: () => doctorService.getDoctorById(id),
        staleTime: 10 * 60 * 1000,
      });
    },
    prefetchSpecialty: (id: string) => {
      queryClient.prefetchQuery({
        queryKey: QUERY_KEYS.specialty(id),
        queryFn: () => specialtyService.getSpecialtyById(id),
        staleTime: 30 * 60 * 1000,
      });
    },
  };
};