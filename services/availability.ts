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
  /**
   * ดูตารางเวลาทำงานของหมอ
   * GET /api/availability/doctor/{doctorId}
   */
  async getDoctorAvailabilities(doctorId: string): Promise<DoctorAvailability[]> {
    const response = await apiClient.get<DoctorAvailability[]>(
      `/availability/doctor/${doctorId}`
    );
    return response;
  }

  /**
   * ดูตารางเวลาทำงานของหมอในวันเจาะจง
   * GET /api/availability/doctor/{doctorId}?dayOfWeek=1
   */
  async getDoctorAvailabilitiesByDay(
    doctorId: string,
    dayOfWeek: number
  ): Promise<DoctorAvailability[]> {
    const response = await apiClient.get<DoctorAvailability[]>(
      `/availability/doctor/${doctorId}?dayOfWeek=${dayOfWeek}`
    );
    return response;
  }

  /**
   * ดูช่วงเวลาว่างของหมอในวันที่เจาะจง
   * GET /api/availability/doctor/{doctorId}/slots?date=2024-01-15
   */
  async getAvailableTimeSlots(
    doctorId: string,
    date: string // YYYY-MM-DD format
  ): Promise<AvailableTimeSlotsResponse> {
    const response = await apiClient.get<AvailableTimeSlotsResponse>(
      `/availability/doctor/${doctorId}/slots?date=${date}`
    );
    return response;
  }

  /**
   * ตรวจสอบว่าช่วงเวลาว่างหรือไม่
   * GET /api/availability/doctor/{doctorId}/check?date=2024-01-15&time=09:30
   */
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

  /**
   * Helper: แปลง Date object เป็น string format สำหรับ API
   */
  formatDateForApi(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Helper: แปลงวันในสัปดาห์จาก JS (0=Sunday) เป็น Backend format (1=Monday)
   */
  jsDateToDayOfWeek(date: Date): number {
    const jsDay = date.getDay(); // 0=Sunday, 1=Monday, ..., 6=Saturday
    return jsDay === 0 ? 7 : jsDay; // Convert to 1=Monday, ..., 7=Sunday
  }

  /**
   * Helper: สร้าง time slots ทุก 30 นาทีระหว่างเวลาที่กำหนด
   */
  generateTimeSlots(startTime: string, endTime: string): string[] {
    const slots: string[] = [];
    const start = new Date(`1970-01-01T${startTime}:00`);
    const end = new Date(`1970-01-01T${endTime}:00`);

    let current = new Date(start);

    while (current < end) {
      const timeString = current.toTimeString().substring(0, 5); // HH:mm format
      slots.push(timeString);

      // เพิ่ม 30 นาที
      current.setMinutes(current.getMinutes() + 30);
    }

    return slots;
  }

  /**
   * Helper: ตรวจสอบว่าเวลาอยู่ในช่วงที่กำหนดหรือไม่
   */
  isTimeInRange(time: string, startTime: string, endTime: string): boolean {
    return time >= startTime && time < endTime;
  }

  /**
   * Helper: แปลงหมายเลขวันเป็นชื่อวัน (ภาษาไทย)
   */
  getDayNameTh(dayOfWeek: number): string {
    const days = ['', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์', 'อาทิตย์'];
    return days[dayOfWeek] || 'ไม่ระบุ';
  }

  /**
   * Helper: แปลงเวลา 24 ชม. เป็นรูปแบบแสดงผล (เช่น 09:00 น.)
   */
  formatTimeForDisplay(time: string): string {
    return `${time} น.`;
  }
}

export const availabilityService = new AvailabilityService();