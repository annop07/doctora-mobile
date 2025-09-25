import { useQuery } from '@tanstack/react-query';
import { specialtyService } from '@/services/specialties';
import { queryKeys, queryOptions } from '@/config/queryClient';

export const useSpecialties = () => {
  return useQuery({
    queryKey: queryKeys.specialties,
    queryFn: () => specialtyService.getSpecialties(),
    ...queryOptions.specialties,
  });
};

export const useSpecialty = (id: string) => {
  return useQuery({
    queryKey: queryKeys.specialty(id),
    queryFn: () => specialtyService.getSpecialtyById(id),
    ...queryOptions.specialties,
    enabled: !!id,
  });
};

export const useSpecialtiesWithCount = () => {
  return useQuery({
    queryKey: queryKeys.specialtiesWithCount(),
    queryFn: () => specialtyService.getSpecialtiesWithDoctorCount(),
    ...queryOptions.specialties,
  });
};