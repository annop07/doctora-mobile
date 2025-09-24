import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { AppointmentCard } from '@/components/Cards';
import { useMyAppointments } from '@/services/medical/hooks';
import { AppointmentStatus } from '@/types/medical';

type AppointmentFilter = 'all' | 'upcoming' | 'completed' | 'cancelled';

export default function Appointments() {
  const [selectedFilter, setSelectedFilter] = useState<AppointmentFilter>('all');

  // Get all appointments from API
  const { data: allAppointments = [], isLoading } = useMyAppointments();

  // Filter and count appointments based on status
  const appointmentsByStatus = useMemo(() => {
    const upcoming = allAppointments.filter(apt =>
      apt.status === AppointmentStatus.CONFIRMED || apt.status === AppointmentStatus.PENDING
    );
    const completed = allAppointments.filter(apt =>
      apt.status === AppointmentStatus.COMPLETED
    );
    const cancelled = allAppointments.filter(apt =>
      apt.status === AppointmentStatus.CANCELLED || apt.status === AppointmentStatus.REJECTED
    );

    return {
      all: allAppointments,
      upcoming,
      completed,
      cancelled
    };
  }, [allAppointments]);

  const filteredAppointments = appointmentsByStatus[selectedFilter];

  // Count for each filter
  const counts = {
    all: appointmentsByStatus.all.length,
    upcoming: appointmentsByStatus.upcoming.length,
    completed: appointmentsByStatus.completed.length,
    cancelled: appointmentsByStatus.cancelled.length
  };

  const handleAppointmentPress = (appointmentId: string) => {
    router.push(`/(root)/appointments/${appointmentId}`);
  };

  const handleBookNewAppointment = () => {
    router.push('/book-appointment');
  };

  const filterButtons = [
    { key: 'all' as AppointmentFilter, title: 'ทั้งหมด', count: counts.all },
    { key: 'upcoming' as AppointmentFilter, title: 'กำลังมา', count: counts.upcoming },
    { key: 'completed' as AppointmentFilter, title: 'เสร็จสิ้น', count: counts.completed },
    { key: 'cancelled' as AppointmentFilter, title: 'ยกเลิก', count: counts.cancelled }
  ];

  return (
    <SafeAreaView className="bg-background-secondary h-full">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="bg-white px-5 py-4 border-b border-secondary-200">
          <Text className="text-2xl font-rubik-bold text-text-primary mb-2">
            การนัดหมายของฉัน
          </Text>
          <Text className="text-base font-rubik text-secondary-600">
            ดูและจัดการนัดหมายทั้งหมดของคุณ
          </Text>
        </View>

        {/* Filter Tabs */}
        <View className="bg-white px-5 py-4 border-b border-secondary-100">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row space-x-3">
              {filterButtons.map((filter) => (
                <TouchableOpacity
                  key={filter.key}
                  onPress={() => setSelectedFilter(filter.key)}
                  className={`px-4 py-2 rounded-full border ${
                    selectedFilter === filter.key
                      ? 'bg-primary-600 border-primary-600'
                      : 'bg-white border-secondary-200'
                  }`}
                >
                  <Text
                    className={`text-sm font-rubik-medium ${
                      selectedFilter === filter.key
                        ? 'text-white'
                        : 'text-text-primary'
                    }`}
                  >
                    {filter.title} ({filter.count})
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Appointments List */}
        <View className="px-5 py-2">
          {isLoading ? (
            <View className="items-center py-12">
              <View className="bg-white rounded-xl p-8 w-full">
                <Text className="text-lg font-rubik-semiBold text-text-primary text-center mb-2">
                  กำลังโหลดนัดหมาย...
                </Text>
                <Text className="text-base font-rubik text-secondary-600 text-center">
                  โปรดรอสักครู่
                </Text>
              </View>
            </View>
          ) : filteredAppointments.length > 0 ? (
            filteredAppointments.map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                onPress={() => handleAppointmentPress(appointment.id)}
                showActions={true}
              />
            ))
          ) : (
            <View className="items-center py-12">
              <View className="bg-white rounded-xl p-8 w-full">
                <Text className="text-lg font-rubik-semiBold text-text-primary text-center mb-2">
                  {selectedFilter === 'all' && 'ยังไม่มีการนัดหมาย'}
                  {selectedFilter === 'upcoming' && 'ไม่มีนัดหมายที่จะมาถึง'}
                  {selectedFilter === 'completed' && 'ไม่มีการนัดหมายที่เสร็จสิ้น'}
                  {selectedFilter === 'cancelled' && 'ไม่มีการนัดหมายที่ยกเลิก'}
                </Text>
                <Text className="text-base font-rubik text-secondary-600 text-center mb-6">
                  {selectedFilter === 'all' && 'เริ่มต้นโดยการจองนัดหมายกับแพทย์'}
                  {selectedFilter === 'upcoming' && 'จองนัดหมายใหม่เพื่อพบแพทย์'}
                  {selectedFilter === 'completed' && 'การนัดหมายที่เสร็จสิ้นจะแสดงที่นี่'}
                  {selectedFilter === 'cancelled' && 'การนัดหมายที่ยกเลิกจะแสดงที่นี่'}
                </Text>

                {(selectedFilter === 'all' || selectedFilter === 'upcoming') && (
                  <TouchableOpacity
                    onPress={handleBookNewAppointment}
                    className="bg-primary-600 py-3 px-6 rounded-xl"
                  >
                    <Text className="text-white font-rubik-semiBold text-center">
                      จองนัดหมายใหม่
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
        </View>

        {/* Quick Action - Book New Appointment */}
        {filteredAppointments.length > 0 && (
          <View className="px-5 py-4">
            <TouchableOpacity
              onPress={handleBookNewAppointment}
              className="bg-primary-600 py-4 px-6 rounded-xl flex-row items-center justify-center"
            >
              <Text className="text-white font-rubik-semiBold text-base mr-2">
                + จองนัดหมายใหม่
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Bottom Spacing */}
        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}