import { apiClient } from './api/client';
import { Appointment, BookAppointmentRequest, AppointmentStatus } from '@/types/medical';

export interface AppointmentsResponse {
  appointments: Appointment[];
}

export interface BookAppointmentResponse {
  id: string;
  message: string;
  appointment: Appointment;
}

class AppointmentService {
  /**
   * จองนัดหมายกับแพทย์
   * POST /api/appointments
   */
  async bookAppointment(request: BookAppointmentRequest): Promise<BookAppointmentResponse> {
    const response = await apiClient.post<BookAppointmentResponse>('/appointments', {
      doctorId: parseInt(request.doctorId),
      appointmentDateTime: request.appointmentDateTime,
      durationMinutes: request.durationMinutes || 30,
      notes: request.notes || ''
    });

    return response;
  }

  /**
   * ดูรายการนัดหมายของผู้ป่วยตัวเอง
   * GET /api/appointments/my
   */
  async getMyAppointments(): Promise<Appointment[]> {
    const response = await apiClient.get<AppointmentsResponse>('/appointments/my');
    return response.appointments;
  }

  /**
   * ยกเลิกนัดหมาย
   * PUT /api/appointments/{id}/cancel
   */
  async cancelAppointment(appointmentId: string): Promise<{ message: string }> {
    const response = await apiClient.put<{ message: string }>(`/appointments/${appointmentId}/cancel`);
    return response;
  }

  /**
   * ดูรายการนัดหมายของหมอ (สำหรับแพทย์เท่านั้น)
   * GET /api/appointments/my-patients
   */
  async getDoctorAppointments(): Promise<Appointment[]> {
    const response = await apiClient.get<AppointmentsResponse>('/appointments/my-patients');
    return response.appointments;
  }

  /**
   * อนุมัตินัดหมาย (สำหรับแพทย์เท่านั้น)
   * PUT /api/appointments/{id}/confirm
   */
  async confirmAppointment(appointmentId: string): Promise<{ message: string }> {
    const response = await apiClient.put<{ message: string }>(`/appointments/${appointmentId}/confirm`);
    return response;
  }

  /**
   * ปฏิเสธนัดหมาย (สำหรับแพทย์เท่านั้น)
   * PUT /api/appointments/{id}/reject
   */
  async rejectAppointment(appointmentId: string, reason: string): Promise<{ message: string }> {
    const response = await apiClient.put<{ message: string }>(`/appointments/${appointmentId}/reject`, {
      reason
    });
    return response;
  }

  /**
   * กรองนัดหมายตาม status
   */
  filterAppointmentsByStatus(appointments: Appointment[], status?: AppointmentStatus): Appointment[] {
    if (!status) return appointments;
    return appointments.filter(apt => apt.status === status);
  }

  /**
   * กรองนัดหมายที่กำลังจะมาถึง
   */
  getUpcomingAppointments(appointments: Appointment[]): Appointment[] {
    const now = new Date();
    return appointments.filter(apt => {
      const appointmentDate = new Date(apt.appointmentDateTime);
      return appointmentDate > now &&
             (apt.status === AppointmentStatus.CONFIRMED || apt.status === AppointmentStatus.PENDING);
    });
  }

  /**
   * กรองนัดหมายที่เสร็จสิ้นแล้ว
   */
  getCompletedAppointments(appointments: Appointment[]): Appointment[] {
    return appointments.filter(apt => apt.status === AppointmentStatus.COMPLETED);
  }

  /**
   * กรองนัดหมายที่ยกเลิก
   */
  getCancelledAppointments(appointments: Appointment[]): Appointment[] {
    return appointments.filter(apt =>
      apt.status === AppointmentStatus.CANCELLED ||
      apt.status === AppointmentStatus.REJECTED
    );
  }

  /**
   * ตรวจสอบว่านัดหมายสามารถยกเลิกได้หรือไม่
   */
  canCancelAppointment(appointment: Appointment): boolean {
    const appointmentDate = new Date(appointment.appointmentDateTime);
    const now = new Date();
    const hoursDiff = (appointmentDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    // ต้องยกเลิกล่วงหน้าอย่างน้อย 2 ชั่วโมง และสถานะต้องเป็น PENDING หรือ CONFIRMED
    return hoursDiff > 2 &&
           (appointment.status === AppointmentStatus.PENDING || appointment.status === AppointmentStatus.CONFIRMED);
  }

  /**
   * ตรวจสอบว่าเป็นนัดหมายในวันนี้หรือไม่
   */
  isToday(appointment: Appointment): boolean {
    const appointmentDate = new Date(appointment.appointmentDateTime);
    const today = new Date();
    return appointmentDate.toDateString() === today.toDateString();
  }

  /**
   * จัดเรียงนัดหมายตามวันที่ (ใหม่ล่าสุดก่อน)
   */
  sortAppointmentsByDate(appointments: Appointment[]): Appointment[] {
    return [...appointments].sort((a, b) => {
      const dateA = new Date(a.appointmentDateTime);
      const dateB = new Date(b.appointmentDateTime);
      return dateB.getTime() - dateA.getTime();
    });
  }
}

export const appointmentService = new AppointmentService();