import { apiClient } from './api/client';
import { Specialty, ApiResponse } from '@/types';

export interface SpecialtyWithDoctorCount extends Specialty {
  doctorCount: number;
}

export interface SpecialtiesResponse {
  specialties: Specialty[];
}

export interface SpecialtiesWithCountResponse {
  specialties: SpecialtyWithDoctorCount[];
}

export interface SpecialtyDetailResponse extends Specialty {
  doctorCount: number;
}

class SpecialtyService {
  /**
   * ดึงรายการแผนกทั้งหมด
   * GET /api/specialties
   */
  async getSpecialties(): Promise<Specialty[]> {
    const response = await apiClient.get<SpecialtiesResponse>('/api/specialties');
    return response.data.specialties;
  }

  /**
   * ดึงข้อมูลแผนกตาม ID พร้อมจำนวนแพทย์
   * GET /api/specialties/{id}
   */
  async getSpecialtyById(id: string | number): Promise<SpecialtyDetailResponse> {
    const response = await apiClient.get<SpecialtyDetailResponse>(`/api/specialties/${id}`);
    return response.data;
  }

  /**
   * ดึงรายการแผนกพร้อมจำนวนแพทย์ในแต่ละแผนก
   * GET /api/specialties/with-count
   */
  async getSpecialtiesWithDoctorCount(): Promise<SpecialtyWithDoctorCount[]> {
    const response = await apiClient.get<SpecialtiesWithCountResponse>('/api/specialties/with-count');
    return response.data.specialties;
  }

  /**
   * ค้นหาแผนกด้วยชื่อ
   * GET /api/specialties/search?name={name}
   */
  async searchSpecialtiesByName(name: string): Promise<Specialty[]> {
    const response = await apiClient.get<SpecialtiesResponse>(
      `/api/specialties/search?name=${encodeURIComponent(name)}`
    );
    return response.data.specialties;
  }

  /**
   * ดึงแผนกยอดนิยม (แผนกที่มีแพทย์เยอะที่สุด)
   * ใช้ API เดียวกับ getSpecialtiesWithDoctorCount แต่ sort ด้วย doctorCount
   */
  async getPopularSpecialties(limit: number = 6): Promise<SpecialtyWithDoctorCount[]> {
    const specialties = await this.getSpecialtiesWithDoctorCount();

    // Sort by doctor count (descending) และจำกัดจำนวน
    return specialties
      .sort((a, b) => b.doctorCount - a.doctorCount)
      .slice(0, limit);
  }

  /**
   * ดึงแผนกที่มีแพทย์พร้อมให้บริการ (doctorCount > 0)
   */
  async getAvailableSpecialties(): Promise<SpecialtyWithDoctorCount[]> {
    const specialties = await this.getSpecialtiesWithDoctorCount();

    // กรองเอาแค่แผนกที่มีแพทย์
    return specialties.filter(specialty => specialty.doctorCount > 0);
  }

  /**
   * Helper method สำหรับ map specialty data ให้ตรงกับ frontend format
   */
  transformSpecialtyData(specialty: any): Specialty {
    return {
      id: specialty.id.toString(),
      name: specialty.name,
      description: specialty.description || '',
      createdAt: specialty.createdAt || new Date().toISOString(),
    };
  }

  /**
   * Helper method สำหรับ map specialty with count data
   */
  transformSpecialtyWithCountData(specialty: any): SpecialtyWithDoctorCount {
    return {
      ...this.transformSpecialtyData(specialty),
      doctorCount: specialty.doctorCount || 0,
    };
  }

  /**
   * Cache management - invalidate specialty cache
   * ใช้เมื่อมีการเปลี่ยนแปลงข้อมูลแพทย์หรือแผนก
   */
  invalidateCache(): void {
    // จะใช้กับ React Query queryClient.invalidateQueries(['specialties'])
    console.log('Specialty cache invalidated');
  }
}

export const specialtyService = new SpecialtyService();