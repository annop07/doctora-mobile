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
  private transformDoctor(doctor: any): Doctor {
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

  async getDoctors(params: DoctorSearchParams = {}): Promise<DoctorsResponse> {
    const queryParams = new URLSearchParams();

    if (params.page !== undefined) queryParams.append('page', params.page.toString());
    if (params.size !== undefined) queryParams.append('size', params.size.toString());
    if (params.sort) queryParams.append('sort', params.sort);
    if (params.name) queryParams.append('name', params.name);
    if (params.specialty) queryParams.append('specialty', params.specialty.toString());
    if (params.minFee) queryParams.append('minFee', params.minFee.toString());
    if (params.maxFee) queryParams.append('maxFee', params.maxFee.toString());

    const url = `/doctors${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await apiClient.get<any>(url);

    // Transform doctors array
    return {
      ...response,
      doctors: response.doctors?.map((d: any) => this.transformDoctor(d)) || []
    };
  }

  async getDoctorById(id: string | number): Promise<Doctor> {
    const response = await apiClient.get<any>(`/doctors/${id}`);
    return this.transformDoctor(response);
  }

  async searchDoctorsByName(name: string): Promise<Doctor[]> {
    const response = await apiClient.get<{ doctors: any[] }>(`/doctors/search?name=${encodeURIComponent(name)}`);
    return response.doctors?.map((d: any) => this.transformDoctor(d)) || [];
  }

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

    // Sort mapping - เปลี่ยนเป็น property names ที่ถูกต้อง
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case 'name':
          params.sort = filters.sortOrder === 'desc' ? 'id,desc' : 'id';
          break;
        case 'experience':
          params.sort = filters.sortOrder === 'desc' ? 'experienceYears,desc' : 'experienceYears';
          break;
        case 'fee':
          params.sort = filters.sortOrder === 'desc' ? 'consultationFee,desc' : 'consultationFee';
          break;
        case 'rating':
        default:
          params.sort = filters.sortOrder === 'desc' ? 'id,desc' : 'id';
          break;
      }
    } else {
      params.sort = 'id';
    }

    return this.getDoctors(params);
  }

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
      doctors: any[];
      currentPage: number;
      totalItems: number;
      totalPages: number;
    }>(`/doctors/specialty/${specialtyId}?page=${page}&size=${size}`);

    return {
      ...response,
      doctors: response.doctors?.map((d: any) => this.transformDoctor(d)) || []
    };
  }

  async getDoctorStats(): Promise<DoctorStats> {
    const response = await apiClient.get<DoctorStats>('/doctors/stats');
    return response;
  }

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

  async getFeaturedDoctors(limit: number = 5): Promise<Doctor[]> {
    const response = await this.getDoctors({ page: 0, size: limit, sort: 'id,desc' });
    return response.doctors;
  }
}

export const doctorService = new DoctorService();