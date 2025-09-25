export interface Specialty {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

export interface Doctor {
  id: string;
  name: string; // Full name from backend
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  specialty: Specialty;
  specialtyName?: string; // Fallback field
  licenseNumber: string;
  bio?: string;
  experienceYears: number;
  consultationFee: number;
  roomNumber?: string;
  isActive: boolean;
  rating?: number;
  totalRatings?: number;
  profileImage?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Availability {
  id: string;
  doctorId: string;
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  isActive: boolean;
  createdAt: string;
}

export interface Appointment {
  id: string;
  doctor: Doctor;
  patient: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  appointmentDateTime: string;
  durationMinutes: number;
  status: AppointmentStatus;
  notes?: string;
  doctorNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export enum AppointmentStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  REJECTED = 'REJECTED'
}

export interface TimeSlot {
  time: string; // HH:mm format
  available: boolean;
  appointmentId?: string;
}

export interface DoctorSearchFilters {
  specialtyId?: string;
  minRating?: number;
  maxFee?: number;
  sortBy?: 'name' | 'rating' | 'experience' | 'fee';
  sortOrder?: 'asc' | 'desc';
  query?: string;
}

export interface BookAppointmentRequest {
  doctorId: string;
  appointmentDateTime: string;
  notes?: string;
}

export interface DoctorStats {
  totalAppointments: number;
  completedAppointments: number;
  averageRating: number;
  totalReviews: number;
}