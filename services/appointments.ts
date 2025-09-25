import { apiClient } from './api/client';
import { Appointment, AppointmentStatus, BookAppointmentRequest, ApiResponse, MessageResponse } from '@/types';

export interface AppointmentSearchParams {
  status?: AppointmentStatus;
  page?: number;
  size?: number;
  startDate?: string;
  endDate?: string;
}

export interface AppointmentsResponse {
  appointments: Appointment[];
  currentPage?: number;
  totalItems?: number;
  totalPages?: number;
  hasNext?: boolean;
  hasPrevious?: boolean;
}

export interface BookAppointmentResponse extends Appointment {
  message: string;
}

export interface RescheduleAppointmentRequest {
  appointmentDateTime: string; // ISO string format
  notes?: string;
}

export interface CancelAppointmentRequest {
  reason?: string;
}

class AppointmentService {
  /**
   * จองนัดหมายใหม่ (คนไข้เท่านั้น)
   * POST /api/appointments
   */
  async bookAppointment(request: BookAppointmentRequest): Promise<BookAppointmentResponse> {
    // แปลง frontend format ไป backend format
    const backendRequest = {
      doctorId: parseInt(request.doctorId),
      appointmentDateTime: request.appointmentDateTime,
      durationMinutes: 30, // default 30 minutes
      notes: request.notes || ''
    };

    const response = await apiClient.post<BookAppointmentResponse>('/api/appointments', backendRequest);
    return response.data;
  }

  /**
   * ดูนัดหมายของตัวเอง (คนไข้)
   * GET /api/appointments/my
   */
  async getMyAppointments(params: AppointmentSearchParams = {}): Promise<Appointment[]> {
    let url = '/api/appointments/my';
    const queryParams = new URLSearchParams();

    if (params.status) queryParams.append('status', params.status);
    if (params.page !== undefined) queryParams.append('page', params.page.toString());
    if (params.size !== undefined) queryParams.append('size', params.size.toString());
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);

    if (queryParams.toString()) {
      url += `?${queryParams.toString()}`;
    }

    const response = await apiClient.get<AppointmentsResponse>(url);
    return response.appointments;
  }

  /**
   * ดูรายละเอียดนัดหมายเฉพาะ
   * GET /api/appointments/{id}
   */
  async getAppointmentById(id: string | number): Promise<Appointment> {
    const response = await apiClient.get<Appointment>(`/api/appointments/${id}`);
    return response.data;
  }

  /**
   * ยกเลิกนัดหมาย (คนไข้เท่านั้น)
   * PUT /api/appointments/{id}/cancel
   */
  async cancelAppointment(id: string | number, request?: CancelAppointmentRequest): Promise<MessageResponse> {
    const response = await apiClient.put<MessageResponse>(`/api/appointments/${id}/cancel`, request || {});
    return response.data;
  }

  /**
   * แก้ไขเวลานัดหมาย (reschedule)
   * PUT /api/appointments/{id}/reschedule
   * หมายเหตุ: ต้องเพิ่ม endpoint นี้ใน backend
   */
  async rescheduleAppointment(
    id: string | number,
    request: RescheduleAppointmentRequest
  ): Promise<MessageResponse> {
    const response = await apiClient.put<MessageResponse>(`/api/appointments/${id}/reschedule`, request);
    return response.data;
  }

  /**
   * ดูประวัติการนัดหมาย (เฉพาะที่เสร็จสิ้นแล้ว)
   */
  async getAppointmentHistory(page: number = 0, size: number = 10): Promise<Appointment[]> {
    const params: AppointmentSearchParams = {
      status: AppointmentStatus.COMPLETED,
      page,
      size
    };

    return this.getMyAppointments(params);
  }

  /**
   * ดูนัดหมายที่รออนุมัติ
   */
  async getPendingAppointments(): Promise<Appointment[]> {
    const params: AppointmentSearchParams = {
      status: AppointmentStatus.PENDING
    };

    return this.getMyAppointments(params);
  }

  /**
   * ดูนัดหมายที่ได้รับการยืนยันแล้ว
   */
  async getConfirmedAppointments(): Promise<Appointment[]> {
    const params: AppointmentSearchParams = {
      status: AppointmentStatus.CONFIRMED
    };

    return this.getMyAppointments(params);
  }

  /**
   * ดูนัดหมายวันนี้
   */
  async getTodayAppointments(): Promise<Appointment[]> {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

    const params: AppointmentSearchParams = {
      startDate: startOfDay.toISOString(),
      endDate: endOfDay.toISOString()
    };

    return this.getMyAppointments(params);
  }

  /**
   * ดูนัดหมายที่จะมาถึง (upcoming)
   */
  async getUpcomingAppointments(limit: number = 5): Promise<Appointment[]> {
    const now = new Date();
    const params: AppointmentSearchParams = {
      startDate: now.toISOString(),
      size: limit
    };

    const appointments = await this.getMyAppointments(params);

    // Filter เอาเฉพาะ CONFIRMED และ PENDING
    return appointments
      .filter(apt =>
        apt.status === AppointmentStatus.CONFIRMED ||
        apt.status === AppointmentStatus.PENDING
      )
      .sort((a, b) => new Date(a.appointmentDateTime).getTime() - new Date(b.appointmentDateTime).getTime())
      .slice(0, limit);
  }

  /**
   * ตรวจสอบว่าสามารถยกเลิกนัดหมายได้หรือไม่
   */
  canCancelAppointment(appointment: Appointment): boolean {
    const now = new Date();
    const appointmentTime = new Date(appointment.appointmentDateTime);

    // ต้องยกเลิกอย่างน้อย 2 ชั่วโมงก่อนเวลานัด
    const minCancelTime = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
    const timeDiff = appointmentTime.getTime() - now.getTime();

    return (
      (appointment.status === AppointmentStatus.PENDING ||
       appointment.status === AppointmentStatus.CONFIRMED) &&
      timeDiff > minCancelTime
    );
  }

  /**
   * ตรวจสอบว่าสามารถ reschedule นัดหมายได้หรือไม่
   */
  canRescheduleAppointment(appointment: Appointment): boolean {
    const now = new Date();
    const appointmentTime = new Date(appointment.appointmentDateTime);

    // ต้อง reschedule อย่างน้อย 24 ชั่วโมงก่อนเวลานัด
    const minRescheduleTime = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    const timeDiff = appointmentTime.getTime() - now.getTime();

    return (
      appointment.status === AppointmentStatus.PENDING &&
      timeDiff > minRescheduleTime
    );
  }

  /**
   * Helper method สำหรับ format appointment data
   */
  transformAppointmentData(appointment: any): Appointment {
    return {
      id: appointment.id.toString(),
      doctor: appointment.doctor,
      patient: appointment.patient,
      appointmentDateTime: appointment.appointmentDateTime,
      durationMinutes: appointment.durationMinutes || 30,
      status: appointment.status,
      notes: appointment.notes || '',
      doctorNotes: appointment.doctorNotes || '',
      createdAt: appointment.createdAt,
      updatedAt: appointment.updatedAt
    };
  }

  /**
   * Helper method สำหรับจัดกลุ่มนัดหมายตาม status
   */
  groupAppointmentsByStatus(appointments: Appointment[]): {
    pending: Appointment[];
    confirmed: Appointment[];
    completed: Appointment[];
    cancelled: Appointment[];
    rejected: Appointment[];
  } {
    return {
      pending: appointments.filter(apt => apt.status === AppointmentStatus.PENDING),
      confirmed: appointments.filter(apt => apt.status === AppointmentStatus.CONFIRMED),
      completed: appointments.filter(apt => apt.status === AppointmentStatus.COMPLETED),
      cancelled: appointments.filter(apt => apt.status === AppointmentStatus.CANCELLED),
      rejected: appointments.filter(apt => apt.status === AppointmentStatus.REJECTED)
    };
  }

  /**
   * Cache management - invalidate appointment cache
   */
  invalidateCache(): void {
    // จะใช้กับ React Query queryClient.invalidateQueries(['appointments'])
    console.log('Appointment cache invalidated');
  }
}

export const appointmentService = new AppointmentService();