// Export appointment service
export { appointmentService } from '../appointments';
export type { AppointmentsResponse, BookAppointmentResponse } from '../appointments';

// Export appointment hooks
export {
  useMyAppointments,
  useDoctorAppointments,
  useBookAppointment,
  useCancelAppointment,
  useConfirmAppointment,
  useRejectAppointment,
  useAppointmentFilters,
  appointmentKeys
} from './hooks';