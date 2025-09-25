import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appointmentService } from '../appointments';
import { Appointment, BookAppointmentRequest } from '@/types/medical';

// Query keys
export const appointmentKeys = {
  all: ['appointments'] as const,
  my: () => [...appointmentKeys.all, 'my'] as const,
  doctor: () => [...appointmentKeys.all, 'doctor'] as const,
  byId: (id: string) => [...appointmentKeys.all, 'detail', id] as const,
};

/**
 * Hook สำหรับดึงรายการนัดหมายของผู้ป่วย
 */
export function useMyAppointments() {
  return useQuery({
    queryKey: appointmentKeys.my(),
    queryFn: () => appointmentService.getMyAppointments(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook สำหรับดึงรายการนัดหมายของหมอ (สำหรับแพทย์เท่านั้น)
 */
export function useDoctorAppointments() {
  return useQuery({
    queryKey: appointmentKeys.doctor(),
    queryFn: () => appointmentService.getDoctorAppointments(),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * Hook สำหรับจองนัดหมาย
 */
export function useBookAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: BookAppointmentRequest) =>
      appointmentService.bookAppointment(request),
    onSuccess: () => {
      // Invalidate และ refetch นัดหมายของผู้ป่วย
      queryClient.invalidateQueries({ queryKey: appointmentKeys.my() });
      // Invalidate นัดหมายของหมอด้วย (กรณีหมอเปิดหน้าดูนัดหมายพร้อมกัน)
      queryClient.invalidateQueries({ queryKey: appointmentKeys.doctor() });
    },
  });
}

/**
 * Hook สำหรับยกเลิกนัดหมาย
 */
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

/**
 * Hook สำหรับอนุมัตินัดหมาย (สำหรับแพทย์เท่านั้น)
 */
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

/**
 * Hook สำหรับปฏิเสธนัดหมาย (สำหรับแพทย์เท่านั้น)
 */
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

/**
 * Hook สำหรับกรองนัดหมายตาม status (client-side)
 * ใช้กับข้อมูลที่ได้จาก useMyAppointments หรือ useDoctorAppointments
 */
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