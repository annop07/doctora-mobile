import { useQuery } from '@tanstack/react-query';
import { doctorService } from '@/services/doctors';
import { queryKeys, queryOptions } from '@/config/queryClient';
import { Doctor, DoctorSearchFilters } from '@/types';

export const useDoctors = (params?: {
  page?: number;
  size?: number;
  sort?: string;
  name?: string;
  specialty?: number;
}) => {
  return useQuery({
    queryKey: queryKeys.doctorSearch(params || {}),
    queryFn: () => doctorService.getDoctors(params),
    ...queryOptions.doctors,
  });
};

export const useDoctor = (id: string) => {
  return useQuery({
    queryKey: queryKeys.doctor(id),
    queryFn: () => doctorService.getDoctorById(id),
    ...queryOptions.doctors,
    enabled: !!id,
  });
};

export const useFeaturedDoctors = (limit: number = 5) => {
  return useQuery({
    queryKey: queryKeys.featuredDoctors(limit),
    queryFn: () => doctorService.getFeaturedDoctors(limit),
    ...queryOptions.doctors,
  });
};

export const useDoctorsBySpecialty = (specialtyId: string, page: number = 0, size: number = 10) => {
  return useQuery({
    queryKey: queryKeys.doctorsBySpecialty(specialtyId),
    queryFn: () => doctorService.getDoctorsBySpecialty(specialtyId, page, size),
    ...queryOptions.doctors,
    enabled: !!specialtyId,
  });
};

export const useSearchDoctors = (filters: DoctorSearchFilters & { page?: number; size?: number }) => {
  return useQuery({
    queryKey: queryKeys.doctorSearch(filters),
    queryFn: () => doctorService.searchDoctors(filters),
    ...queryOptions.doctors,
    enabled: !!(filters.query || filters.specialtyId || filters.maxFee),
  });
};