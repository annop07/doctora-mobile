import { apiClient } from './api/client';
import { Doctor, DoctorSearchFilters, ApiResponse, PaginatedResponse, DoctorStats } from '@/types';

export interface DoctorSearchParams {
  page?: number;
  size?: number;
  sort?: string;
  name?: string;
  specialty?: number;
  minFee?: number;
  maxFee?: number;
}

export interface DoctorsResponse {
  doctors: Doctor[];
  currentPage: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

class DoctorService {
  /**
   * ดึงรายการแพทย์ทั้งหมดพร้อม pagination และ filtering
   * GET /api/doctors/me
   */
  async getDoctors(params: DoctorSearchParams = {}): Promise<DoctorsResponse> {
    const queryParams = new URLSearchParams();

    if (params.page !== undefined) queryParams.append('page', params.page.toString());
    if (params.size !== undefined) queryParams.append('size', params.size.toString());
    if (params.sort) queryParams.append('sort', params.sort);
    if (params.name) queryParams.append('name', params.name);
    if (params.specialty) queryParams.append('specialty', params.specialty.toString());
    if (params.minFee) queryParams.append('minFee', params.minFee.toString());
    if (params.maxFee) queryParams.append('maxFee', params.maxFee.toString());

    const url = `/doctors/me${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await apiClient.get<DoctorsResponse>(url);
    return response.data;
  }

  /**
   * ดึงข้อมูลแพทย์รายบุคคล
   * GET /api/doctors/me/{id}
   */
  async getDoctorById(id: string | number): Promise<Doctor> {
    const response = await apiClient.get<Doctor>(`/doctors/me/${id}`);
    return response.data;
  }

  /**
   * ค้นหาแพทย์ด้วยชื่อ
   * GET /api/doctors/me/search?name={name}
   */
  async searchDoctorsByName(name: string): Promise<Doctor[]> {
    const response = await apiClient.get<{doctors: Doctor[]}>(`/doctors/me/search?name=${encodeURIComponent(name)}`);
    return response.data.doctors;
  }

  /**
   * ค้นหาแพทย์ด้วยเงื่อนไขต่างๆ (Advanced Search)
   * GET /api/doctors/me with multiple filters
   */
  async searchDoctors(filters: DoctorSearchFilters & { page?: number; size?: number }): Promise<DoctorsResponse> {
    const params: DoctorSearchParams = {
      page: filters.page || 0,
      size: filters.size || 10,
    };

    if (filters.query) params.name = filters.query;
    if (filters.specialtyId) params.specialty = parseInt(filters.specialtyId);
    if (filters.minRating) {
      // Note: Backend ยังไม่รองรับ rating filter, จะต้องเพิ่มใน backend หรือ filter ใน frontend
    }
    if (filters.maxFee) params.maxFee = filters.maxFee;

    // Sort mapping
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case 'name':
          params.sort = 'user.firstName';
          break;
        case 'experience':
          params.sort = 'experienceYears';
          break;
        case 'fee':
          params.sort = 'consultationFee';
          break;
        case 'rating':
        default:
          params.sort = 'id'; // Default sort, rating จะต้องเพิ่มใน backend
          break;
      }

      if (filters.sortOrder === 'desc') {
        params.sort = `${params.sort},desc`;
      }
    }

    return this.getDoctors(params);
  }

  /**
   * ดึงแพทย์ตามแผนก
   * GET /api/doctors/me/specialty/{specialtyId}
   */
  async getDoctorsBySpecialty(
    specialtyId: string | number,
    page: number = 0,
    size: number = 10
  ): Promise<{
    specialty: {
      id: number;
      name: string;
      description: string;
    };
    doctors: Doctor[];
    currentPage: number;
    totalItems: number;
    totalPages: number;
  }> {
    const response = await apiClient.get<{
      specialty: { id: number; name: string; description: string };
      doctors: Doctor[];
      currentPage: number;
      totalItems: number;
      totalPages: number;
    }>(`/api/doctors/me/specialty/${specialtyId}?page=${page}&size=${size}`);

    return response.data;
  }

  /**
   * ดึงสถิติแพทย์ทั้งหมด
   * GET /api/doctors/me/stats
   */
  async getDoctorStats(): Promise<DoctorStats> {
    const response = await apiClient.get<DoctorStats>('/api/doctors/me/stats');
    return response.data;
  }

  /**
   * Helper method สำหรับ infinite scroll
   * ใช้กับ React Query infinite queries
   */
  async getDoctorsInfinite(
    pageParam: number = 0,
    filters: DoctorSearchFilters = {},
    pageSize: number = 10
  ): Promise<{
    doctors: Doctor[];
    nextCursor: number | null;
    hasMore: boolean;
  }> {
    const searchParams: DoctorSearchFilters & { page?: number; size?: number } = {
      ...filters,
      page: pageParam,
      size: pageSize,
    };

    const response = await this.searchDoctors(searchParams);

    return {
      doctors: response.doctors,
      nextCursor: response.hasNext ? pageParam + 1 : null,
      hasMore: response.hasNext,
    };
  }

  /**
   * ดึงแพทย์ที่แนะนำ (Featured Doctors)
   * ใช้ API เดียวกับ getDoctors แต่ sort ด้วย rating และจำกัด 3-5 คน
   */
  async getFeaturedDoctors(limit: number = 5): Promise<Doctor[]> {
    const response = await this.getDoctors({
      page: 0,
      size: limit,
      sort: 'id,desc' // จะเปลี่ยนเป็น rating เมื่อ backend รองรับ
    });

    return response.doctors;
  }
}

export const doctorService = new DoctorService();