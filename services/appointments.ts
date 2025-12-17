import { apiClient } from './api/client';
import { Appointment, BookAppointmentRequest, BookAppointmentWithPatientInfoRequest, AppointmentStatus, Doctor } from '@/types/medical';

export interface AppointmentsResponse {
  appointments: Appointment[];
}

export interface BookAppointmentResponse {
  id: string;
  message: string;
  appointment: Appointment;
}

class AppointmentService {
  private transformDoctor(doctor: any): Doctor {
    if (!doctor) return {} as Doctor;

    return {
      ...doctor,
      id: doctor.id?.toString() || '',
      name: doctor.doctorName || doctor.name || '',
      firstName: doctor.firstName || doctor.doctorName?.split(' ')[0] || '',
      lastName: doctor.lastName || doctor.doctorName?.split(' ').slice(1).join(' ') || '',
      consultationFee: doctor.consultationFee || 0,
      experienceYears: doctor.experienceYears || 0,
      specialty: {
        id: doctor.specialty?.id?.toString() || '',
        name: doctor.specialty?.name || '',
        description: doctor.specialty?.description || '',
        createdAt: doctor.specialty?.createdAt || new Date().toISOString()
      },
      createdAt: doctor.createdAt || new Date().toISOString()
    };
  }

  private transformAppointment(appointment: any): Appointment {
    return {
      ...appointment,
      id: appointment.id?.toString() || '',
      appointmentDateTime: appointment.appointmentDatetime || appointment.appointmentDateTime || '',
      doctor: this.transformDoctor(appointment.doctor),
      patient: appointment.patient ? {
        id: appointment.patient.id?.toString() || '',
        firstName: appointment.patient.firstName || '',
        lastName: appointment.patient.lastName || '',
        email: appointment.patient.email || '',
        phone: appointment.patient.phone
      } : undefined
    };
  }
  async bookAppointment(request: BookAppointmentRequest): Promise<BookAppointmentResponse> {
    const response = await apiClient.post<BookAppointmentResponse>('/appointments', {
      doctorId: parseInt(request.doctorId),
      appointmentDateTime: request.appointmentDateTime,
      durationMinutes: request.durationMinutes || 30,
      notes: request.notes || ''
    });

    return response;
  }

  async bookAppointmentWithPatientInfo(request: BookAppointmentWithPatientInfoRequest): Promise<BookAppointmentResponse> {
    let patientDateOfBirth = request.patientDateOfBirth;
    if (patientDateOfBirth && patientDateOfBirth.includes('/')) {
      const [day, month, yearBE] = patientDateOfBirth.split('/');
      const yearCE = parseInt(yearBE) - 543; // Convert พ.ศ. to ค.ศ.
      patientDateOfBirth = `${yearCE}-${month}-${day}`;
    }

    const response = await apiClient.post<BookAppointmentResponse>('/appointments/with-patient-info', {
      doctorId: parseInt(request.doctorId),
      appointmentDateTime: request.appointmentDateTime,
      durationMinutes: request.durationMinutes || 60,
      notes: request.notes || '',
      // Patient info
      patientPrefix: request.patientPrefix,
      patientFirstName: request.patientFirstName,
      patientLastName: request.patientLastName,
      patientGender: request.patientGender,
      patientDateOfBirth: patientDateOfBirth,
      patientNationality: request.patientNationality,
      patientCitizenId: request.patientCitizenId,
      patientPhone: request.patientPhone,
      patientEmail: request.patientEmail,
      // Additional info
      symptoms: request.symptoms,
      bookingType: request.bookingType || 'manual',
      queueNumber: request.queueNumber
    });

    return response;
  }

  async getMyAppointments(): Promise<Appointment[]> {
    const response = await apiClient.get<{ appointments: any[] }>('/appointments/my');
    return response.appointments?.map((a: any) => this.transformAppointment(a)) || [];
  }

  async cancelAppointment(appointmentId: string): Promise<{ message: string }> {
    const response = await apiClient.put<{ message: string }>(`/appointments/${appointmentId}/cancel`);
    return response;
  }

  async getDoctorAppointments(): Promise<Appointment[]> {
    const response = await apiClient.get<{ appointments: any[] }>('/appointments/my-patients');
    return response.appointments?.map((a: any) => this.transformAppointment(a)) || [];
  }

  async confirmAppointment(appointmentId: string): Promise<{ message: string }> {
    const response = await apiClient.put<{ message: string }>(`/appointments/${appointmentId}/confirm`);
    return response;
  }

  async rejectAppointment(appointmentId: string, reason: string): Promise<{ message: string }> {
    const response = await apiClient.put<{ message: string }>(`/appointments/${appointmentId}/reject`, {
      reason
    });
    return response;
  }

  filterAppointmentsByStatus(appointments: Appointment[], status?: AppointmentStatus): Appointment[] {
    if (!status) return appointments;
    return appointments.filter(apt => apt.status === status);
  }

  getUpcomingAppointments(appointments: Appointment[]): Appointment[] {
    const now = new Date();
    return appointments.filter(apt => {
      const appointmentDate = new Date(apt.appointmentDateTime);
      return appointmentDate > now &&
        (apt.status === AppointmentStatus.CONFIRMED || apt.status === AppointmentStatus.PENDING);
    });
  }

  getCompletedAppointments(appointments: Appointment[]): Appointment[] {
    return appointments.filter(apt => apt.status === AppointmentStatus.COMPLETED);
  }

  getCancelledAppointments(appointments: Appointment[]): Appointment[] {
    return appointments.filter(apt =>
      apt.status === AppointmentStatus.CANCELLED ||
      apt.status === AppointmentStatus.REJECTED
    );
  }

  canCancelAppointment(appointment: Appointment): boolean {
    const appointmentDate = new Date(appointment.appointmentDateTime);
    const now = new Date();
    const hoursDiff = (appointmentDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    return hoursDiff > 2 &&
      (appointment.status === AppointmentStatus.PENDING || appointment.status === AppointmentStatus.CONFIRMED);
  }

  isToday(appointment: Appointment): boolean {
    const appointmentDate = new Date(appointment.appointmentDateTime);
    const today = new Date();
    return appointmentDate.toDateString() === today.toDateString();
  }

  sortAppointmentsByDate(appointments: Appointment[]): Appointment[] {
    return [...appointments].sort((a, b) => {
      const dateA = new Date(a.appointmentDateTime);
      const dateB = new Date(b.appointmentDateTime);
      return dateB.getTime() - dateA.getTime();
    });
  }
}

export const appointmentService = new AppointmentService();