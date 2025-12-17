import { apiClient } from './api/client';

export interface DoctorAvailability {
  dayOfWeek: number;
  dayName: string;
  startTime: string;
  endTime: string;
  timeRange: string;
}

export interface AvailableTimeSlotsResponse {
  doctorId: number;
  date: string;
  availableSlots: string[];
  totalSlots: number;
}

export interface TimeSlotCheckResponse {
  doctorId: number;
  date: string;
  time: string;
  isAvailable: boolean;
}

class AvailabilityService {
  async getDoctorAvailabilities(doctorId: string): Promise<DoctorAvailability[]> {
    const response = await apiClient.get<DoctorAvailability[]>(
      `/availability/doctor/${doctorId}`
    );
    return response;
  }

  async getDoctorAvailabilitiesByDay(
    doctorId: string,
    dayOfWeek: number
  ): Promise<DoctorAvailability[]> {
    const response = await apiClient.get<DoctorAvailability[]>(
      `/availability/doctor/${doctorId}?dayOfWeek=${dayOfWeek}`
    );
    return response;
  }

  async getBookedTimeSlots(doctorId: string, date: string): Promise<string[]> {
    try {
      const response = await apiClient.get<{
        doctorId: number;
        date: string;
        bookedSlots: Array<{
          appointmentId: number;
          startTime: string; // ISO datetime
          durationMinutes: number;
          status: string;
        }>;
      }>(`/appointments/doctor/${doctorId}/booked-slots?date=${date}`);

      // Extract time from ISO datetime and filter only confirmed/pending appointments
      const bookedTimes = response.bookedSlots
        .filter(slot => slot.status === 'CONFIRMED' || slot.status === 'PENDING')
        .map(slot => {
          const datetime = new Date(slot.startTime);
          const hours = String(datetime.getHours()).padStart(2, '0');
          const minutes = String(datetime.getMinutes()).padStart(2, '0');
          return `${hours}:${minutes}`;
        });

      console.log(`📅 Booked slots for doctor ${doctorId} on ${date}:`, bookedTimes);
      return bookedTimes;
    } catch (error) {
      console.error('❌ Error fetching booked slots:', error);
      return []; // Return empty array if fails
    }
  }

  async getAvailableTimeSlots(
    doctorId: string,
    date: string // YYYY-MM-DD format
  ): Promise<AvailableTimeSlotsResponse> {
    try {
      // Try to get slots from API first (may require authentication)
      const response = await apiClient.get<AvailableTimeSlotsResponse>(
        `/availability/doctor/${doctorId}/slots?date=${date}`
      );
      return response;
    } catch (error: any) {
      // Fallback: Generate slots from availability schedule
      console.log('✅ FALLBACK ACTIVE: Generating time slots from doctor schedule (API requires auth)');

      // Get the day of week from the date
      const selectedDate = new Date(date);
      const dayOfWeek = selectedDate.getDay() === 0 ? 7 : selectedDate.getDay();

      // Get doctor's availability for that day
      const availabilities = await this.getDoctorAvailabilities(doctorId);
      console.log(`📅 Doctor ${doctorId} schedule for day ${dayOfWeek}:`, availabilities);

      const daySchedule = availabilities.find(av => av.dayOfWeek === dayOfWeek);

      if (!daySchedule) {
        console.log('⚠️ No schedule found for this day');
        return {
          doctorId: parseInt(doctorId),
          date: date,
          availableSlots: [],
          totalSlots: 0
        };
      }

      // Generate all possible time slots from startTime to endTime
      const allSlots = this.generateTimeSlots(daySchedule.startTime, daySchedule.endTime);
      console.log(`✅ Generated ${allSlots.length} time slots from ${daySchedule.startTime} to ${daySchedule.endTime}`);

      // Get booked slots and filter them out
      const bookedSlots = await this.getBookedTimeSlots(doctorId, date);
      const availableSlots = allSlots.filter(slot => !bookedSlots.includes(slot));

      console.log(`✅ Available slots after filtering: ${availableSlots.length}/${allSlots.length}`);

      return {
        doctorId: parseInt(doctorId),
        date: date,
        availableSlots: availableSlots,
        totalSlots: availableSlots.length
      };
    }
  }

  async isTimeSlotAvailable(
    doctorId: string,
    date: string, // YYYY-MM-DD format
    time: string  // HH:mm format
  ): Promise<TimeSlotCheckResponse> {
    const response = await apiClient.get<TimeSlotCheckResponse>(
      `/availability/doctor/${doctorId}/check?date=${date}&time=${time}`
    );
    return response;
  }

  formatDateForApi(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  jsDateToDayOfWeek(date: Date): number {
    const jsDay = date.getDay(); // 0=Sunday, 1=Monday, ..., 6=Saturday
    return jsDay === 0 ? 7 : jsDay; // Convert to 1=Monday, ..., 7=Sunday
  }

  generateTimeSlots(startTime: string, endTime: string): string[] {
    const slots: string[] = [];

    const start = new Date(`1970-01-01T${startTime}`);
    const end = new Date(`1970-01-01T${endTime}`);

    let current = new Date(start);

    while (current < end) {
      const hours = String(current.getHours()).padStart(2, '0');
      const minutes = String(current.getMinutes()).padStart(2, '0');
      const timeString = `${hours}:${minutes}`; // HH:mm format
      slots.push(timeString);

      // เพิ่ม 1 ชั่วโมง (60 นาที)
      current.setMinutes(current.getMinutes() + 60);
    }

    return slots;
  }

  isTimeInRange(time: string, startTime: string, endTime: string): boolean {
    return time >= startTime && time < endTime;
  }

  getDayNameTh(dayOfWeek: number): string {
    const days = ['', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์', 'อาทิตย์'];
    return days[dayOfWeek] || 'ไม่ระบุ';
  }

  formatTimeForDisplay(time: string): string {
    return `${time} น.`;
  }
}

export const availabilityService = new AvailabilityService();