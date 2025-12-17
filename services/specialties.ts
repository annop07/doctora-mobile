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
  async getSpecialties(): Promise<Specialty[]> {
    const response = await apiClient.get<SpecialtiesResponse>('/specialties');
    return response.specialties;
  }

  async getSpecialtyById(id: string | number): Promise<SpecialtyDetailResponse> {
    const response = await apiClient.get<SpecialtyDetailResponse>(`/specialties/${id}`);
    return response;
  }

  async getSpecialtiesWithDoctorCount(): Promise<SpecialtyWithDoctorCount[]> {
    const response = await apiClient.get<SpecialtiesWithCountResponse>('/specialties/with-count');
    return response.specialties;
  }

  async searchSpecialtiesByName(name: string): Promise<Specialty[]> {
    const response = await apiClient.get<SpecialtiesResponse>(
      `/specialties/search?name=${encodeURIComponent(name)}`
    );
    return response.specialties;
  }

  async getPopularSpecialties(limit: number = 6): Promise<SpecialtyWithDoctorCount[]> {
    const specialties = await this.getSpecialtiesWithDoctorCount();

    // Sort by doctor count (descending) และจำกัดจำนวน
    return specialties
      .sort((a, b) => b.doctorCount - a.doctorCount)
      .slice(0, limit);
  }

  async getAvailableSpecialties(): Promise<SpecialtyWithDoctorCount[]> {
    const specialties = await this.getSpecialtiesWithDoctorCount();

    // กรองเอาแค่แผนกที่มีแพทย์
    return specialties.filter(specialty => specialty.doctorCount > 0);
  }

  transformSpecialtyData(specialty: any): Specialty {
    return {
      id: specialty.id.toString(),
      name: specialty.name,
      description: specialty.description || '',
      createdAt: specialty.createdAt || new Date().toISOString(),
    };
  }

  transformSpecialtyWithCountData(specialty: any): SpecialtyWithDoctorCount {
    return {
      ...this.transformSpecialtyData(specialty),
      doctorCount: specialty.doctorCount || 0,
    };
  }

  invalidateCache(): void {
    // จะใช้กับ React Query queryClient.invalidateQueries(['specialties'])
    console.log('Specialty cache invalidated');
  }
}

export const specialtyService = new SpecialtyService();