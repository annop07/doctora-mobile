import React from 'react';
import { View, Text } from 'react-native';
import { useDoctorAvailability } from '@/services/medical/hooks';
import { LoadingSpinner } from './ui';

interface DoctorScheduleProps {
  doctorId: string;
}

const DAY_NAMES_TH: { [key: number]: string } = {
  1: 'จันทร์',
  2: 'อังคาร',
  3: 'พุธ',
  4: 'พฤหัสบดี',
  5: 'ศุกร์',
  6: 'เสาร์',
  7: 'อาทิตย์',
};

export const DoctorSchedule: React.FC<DoctorScheduleProps> = ({ doctorId }) => {
  const { data: availabilities, isLoading, error } = useDoctorAvailability(doctorId);

  if (isLoading) {
    return <LoadingSpinner message="กำลังโหลดตารางเวลา..." />;
  }

  if (error || !availabilities || availabilities.length === 0) {
    return (
      <View className="p-4 bg-secondary-50 rounded-xl">
        <Text className="text-sm font-rubik text-secondary-600 text-center">
          ไม่มีข้อมูลตารางเวลา
        </Text>
      </View>
    );
  }

  return (
    <View className="bg-white rounded-xl p-4">
      <Text className="text-lg font-rubik-bold text-text-primary mb-3">
        ตารางเวลาทำงาน
      </Text>

      <View className="space-y-2">
        {availabilities.map((schedule) => (
          <View
            key={schedule.dayOfWeek}
            className="flex-row justify-between items-center py-2 border-b border-secondary-100"
          >
            <Text className="text-base font-rubik-medium text-text-primary">
              {DAY_NAMES_TH[schedule.dayOfWeek] || schedule.dayName}
            </Text>
            <Text className="text-base font-rubik text-primary-600">
              {schedule.timeRange} น.
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};
