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

export const useDoctors = (filters?: DoctorSearchFilters) => {
  return useQuery({
    queryKey: queryKeys.doctorSearch(filters || {}),
    queryFn: () => doctorService.getDoctors(filters),
    ...queryOptions.doctors,
    enabled: true,
    refetchInterval: 5 * 60 * 1000,
    refetchIntervalInBackground: false
  });
};

export const useDoctor = (id: string) => {
  return useQuery({
    queryKey: queryKeys.doctor(id),
    queryFn: () => doctorService.getDoctorById(id),
    ...queryOptions.doctors,
    enabled: !!id
  });
};

export const useFeaturedDoctors = (limit = 5) => {
  return useQuery({
    queryKey: queryKeys.featuredDoctors(limit),
    queryFn: () => doctorService.getDoctors({ limit, featured: true }),
    ...queryOptions.doctors,
    select: (data) => data.doctors?.slice(0, limit) || []
  });
};

export const useDoctorsBySpecialty = (specialtyId: string) => {
  return useQuery({
    queryKey: queryKeys.doctorsBySpecialty(specialtyId),
    queryFn: () => doctorService.getDoctorsBySpecialty(specialtyId),
    ...queryOptions.doctors,
    enabled: !!specialtyId
  });
};

export const useSpecialties = () => {
  return useQuery({
    queryKey: queryKeys.specialties,
    queryFn: () => specialtyService.getSpecialties(),
    ...queryOptions.specialties,
    select: (data) => data.specialties || []
  });
};

export const useSpecialtiesWithCount = () => {
  return useQuery({
    queryKey: queryKeys.specialtiesWithCount(),
    queryFn: () => specialtyService.getSpecialtiesWithDoctorCount(),
    ...queryOptions.specialties,
    select: (data) => data || []
  });
};

export const useSpecialty = (id: string) => {
  return useQuery({
    queryKey: queryKeys.specialty(id),
    queryFn: () => specialtyService.getSpecialtyById(id),
    ...queryOptions.specialties,
    enabled: !!id
  });
};

export const useMyAppointments = (status?: AppointmentStatus) => {
  return useQuery({
    queryKey: queryKeys.myAppointments(status),
    queryFn: () => appointmentService.getMyAppointments(status),
    ...queryOptions.appointments,
    select: (data) => data.appointments || [],
    // Background refetch more frequently for appointments
    refetchInterval: 30 * 1000, // 30 seconds
    refetchIntervalInBackground: false
  });
};

export const useUpcomingAppointments = (limit = 3) => {
  return useQuery({
    queryKey: queryKeys.upcomingAppointments(limit),
    queryFn: () => appointmentService.getMyAppointments('CONFIRMED'),
    ...queryOptions.appointments,
    select: (data) => {
      const appointments = data.appointments || [];
      return appointments
        .filter(apt => new Date(apt.appointmentDateTime) > new Date())
        .sort((a, b) => new Date(a.appointmentDateTime).getTime() - new Date(b.appointmentDateTime).getTime())
        .slice(0, limit);
    },
    refetchInterval: 15 * 1000,
    refetchOnWindowFocus: true
  });
};

export const useAppointment = (id: string) => {
  return useQuery({
    queryKey: queryKeys.appointment(id),
    queryFn: () => appointmentService.getAppointmentById(id),
    ...queryOptions.appointments,
    enabled: !!id
  });
};

export const useBookAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: BookAppointmentRequest) => appointmentService.bookAppointment(request),
    onMutate: async (newAppointment) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.appointments });

      // Snapshot the previous value
      const previousAppointments = queryClient.getQueryData(queryKeys.myAppointments());
      const optimisticAppointment = {
        id: `temp-${Date.now()}`,
        doctorId: parseInt(newAppointment.doctorId),
        appointmentDateTime: newAppointment.appointmentDateTime,
        status: 'PENDING' as AppointmentStatus,
        notes: newAppointment.notes || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        doctor: {
          id: parseInt(newAppointment.doctorId),
          firstName: 'Doctor',
          lastName: 'Loading...',
          specialtyId: 1,
          specialty: { id: 1, name: 'Loading...', description: '', createdAt: '' }
        }
      };

      if (previousAppointments && 'appointments' in previousAppointments) {
        queryClient.setQueryData(queryKeys.myAppointments(), {
          ...previousAppointments,
          appointments: [optimisticAppointment, ...(previousAppointments.appointments || [])]
        });
      }

      return { previousAppointments };
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.appointments });
      queryClient.invalidateQueries({ queryKey: queryKeys.upcomingAppointments() });

      Alert.alert('จองนัดหมายสำเร็จ', 'การจองนัดหมายของคุณถูกส่งไปยังแพทย์แล้ว รอการยืนยัน');
    },
    onError: (error, newAppointment, context) => {
      if (context?.previousAppointments) {
        queryClient.setQueryData(queryKeys.myAppointments(), context.previousAppointments);
      }

      Alert.alert('ไม่สามารถจองนัดหมายได้', 'กรุณาลองใหม่อีกครั้ง');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.appointments });
    }
  });
};

export const useCancelAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => appointmentService.cancelAppointment(id),
    onMutate: async (appointmentId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.appointments });
      const previousAppointments = queryClient.getQueryData(queryKeys.myAppointments());
      if (previousAppointments && 'appointments' in previousAppointments) {
        const updatedAppointments = (previousAppointments.appointments || []).map(apt =>
          apt.id === appointmentId ? { ...apt, status: 'CANCELLED' as AppointmentStatus } : apt
        );

        queryClient.setQueryData(queryKeys.myAppointments(), {
          ...previousAppointments,
          appointments: updatedAppointments
        });
      }

      return { previousAppointments };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.appointments });
      queryClient.invalidateQueries({ queryKey: queryKeys.upcomingAppointments() });

      Alert.alert('ยกเลิกนัดหมายแล้ว', 'การนัดหมายของคุณถูกยกเลิกเรียบร้อยแล้ว');
    },
    onError: (error, appointmentId, context) => {
      if (context?.previousAppointments) {
        queryClient.setQueryData(queryKeys.myAppointments(), context.previousAppointments);
      }

      Alert.alert('ไม่สามารถยกเลิกนัดหมายได้', 'กรุณาลองใหม่อีกครั้ง');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.appointments });
    }
  });
};

export const usePrefetchCriticalData = () => {
  const queryClient = useQueryClient();

  const prefetchData = () => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.specialties,
      queryFn: () => specialtyService.getSpecialties(),
      staleTime: queryOptions.specialties.staleTime
    });

    queryClient.prefetchQuery({
      queryKey: queryKeys.featuredDoctors(3),
      queryFn: () => doctorService.getDoctors({ limit: 3, featured: true }),
      staleTime: queryOptions.doctors.staleTime
    });
  };

  return { prefetchData };
};

export const useRefreshAllData = () => {
  const queryClient = useQueryClient();

  const refreshAll = async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.appointments });
    await queryClient.invalidateQueries({ queryKey: queryKeys.doctors });
    await queryClient.refetchQueries({ queryKey: queryKeys.specialties });
  };

  const refreshAppointments = async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.appointments });
  };

  const refreshDoctors = async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.doctors });
  };

  return {
    refreshAll,
    refreshAppointments,
    refreshDoctors
  };
};

export const useQueryStats = () => {
  const queryClient = useQueryClient();

  const getStats = () => {
    const cache = queryClient.getQueryCache();
    const queries = cache.getAll();

    return {
      totalQueries: queries.length,
      staleQueries: queries.filter(q => q.isStale()).length,
      fetchingQueries: queries.filter(q => q.isFetching()).length,
      errorQueries: queries.filter(q => q.state.status === 'error').length
    };
  };

  return { getStats };
};

export * from './hooks';