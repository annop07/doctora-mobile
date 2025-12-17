import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appointmentService } from '../appointments';
import { Appointment, BookAppointmentRequest } from '@/types/medical';

export const appointmentKeys = {
  all: ['appointments'] as const,
  my: () => [...appointmentKeys.all, 'my'] as const,
  doctor: () => [...appointmentKeys.all, 'doctor'] as const,
  byId: (id: string) => [...appointmentKeys.all, 'detail', id] as const,
};

export function useMyAppointments() {
  return useQuery({
    queryKey: appointmentKeys.my(),
    queryFn: () => appointmentService.getMyAppointments(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useDoctorAppointments() {
  return useQuery({
    queryKey: appointmentKeys.doctor(),
    queryFn: () => appointmentService.getDoctorAppointments(),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

export function useBookAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: BookAppointmentRequest) =>
      appointmentService.bookAppointment(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.my() });
      queryClient.invalidateQueries({ queryKey: appointmentKeys.doctor() });
    },
  });
}

export function useCancelAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (appointmentId: string) =>
      appointmentService.cancelAppointment(appointmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.my() });
      queryClient.invalidateQueries({ queryKey: appointmentKeys.doctor() });
    },
  });
}

export function useConfirmAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (appointmentId: string) =>
      appointmentService.confirmAppointment(appointmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.doctor() });
      queryClient.invalidateQueries({ queryKey: appointmentKeys.my() });
    },
  });
}

export function useRejectAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ appointmentId, reason }: { appointmentId: string; reason: string }) =>
      appointmentService.rejectAppointment(appointmentId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.doctor() });
      queryClient.invalidateQueries({ queryKey: appointmentKeys.my() });
    },
  });
}

export function useAppointmentById(id: string) {
  const { data: appointments, isLoading, error } = useMyAppointments();

  const appointment = appointments?.find(apt => apt.id === id);

  return {
    data: appointment,
    isLoading,
    error,
    notFound: !isLoading && !appointment && !error,
  };
}

export function useAppointmentFilters() {
  return {
    filterByStatus: appointmentService.filterAppointmentsByStatus,
    getUpcoming: appointmentService.getUpcomingAppointments,
    getCompleted: appointmentService.getCompletedAppointments,
    getCancelled: appointmentService.getCancelledAppointments,
    canCancel: appointmentService.canCancelAppointment,
    isToday: appointmentService.isToday,
    sortByDate: appointmentService.sortAppointmentsByDate,
  };
}