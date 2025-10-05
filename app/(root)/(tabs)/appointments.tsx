import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { AppointmentCard } from '@/components/Cards';
import { useMyAppointments, useAppointmentFilters, useCancelAppointment } from '@/services/appointments/hooks';
import { ErrorState } from '@/components/ErrorStates';
import { AppointmentStatus } from '@/types/medical';

type AppointmentFilter = 'all' | 'confirmed' | 'pending' | 'cancelled';

export default function Appointments() {
  const [selectedFilter, setSelectedFilter] = useState<AppointmentFilter>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // API Queries
  const { data: allAppointments, isLoading, error, refetch } = useMyAppointments();
  const filters = useAppointmentFilters();
  const cancelMutation = useCancelAppointment();

  // Filter and sort appointments
  const filteredAppointments = useMemo(() => {
    if (!allAppointments) return [];

    let filtered: typeof allAppointments = [];

    switch (selectedFilter) {
      case 'confirmed':
        filtered = allAppointments.filter(apt => apt.status === AppointmentStatus.CONFIRMED);
        break;
      case 'pending':
        filtered = allAppointments.filter(apt => apt.status === AppointmentStatus.PENDING);
        break;
      case 'cancelled':
        filtered = filters.getCancelled(allAppointments);
        break;
      default:
        filtered = allAppointments;
    }

    // Sort: PENDING first, then CONFIRMED, then others
    return filtered.sort((a, b) => {
      const statusOrder: Record<AppointmentStatus, number> = {
        [AppointmentStatus.PENDING]: 1,
        [AppointmentStatus.CONFIRMED]: 2,
        [AppointmentStatus.COMPLETED]: 3,
        [AppointmentStatus.CANCELLED]: 4,
        [AppointmentStatus.REJECTED]: 5
      };

      return (statusOrder[a.status] || 99) - (statusOrder[b.status] || 99);
    });
  }, [allAppointments, selectedFilter, filters]);

  // Count for each filter
  const counts = useMemo(() => {
    if (!allAppointments) {
      return { all: 0, confirmed: 0, pending: 0, cancelled: 0 };
    }

    return {
      all: allAppointments.length,
      confirmed: allAppointments.filter(apt => apt.status === AppointmentStatus.CONFIRMED).length,
      pending: allAppointments.filter(apt => apt.status === AppointmentStatus.PENDING).length,
      cancelled: filters.getCancelled(allAppointments).length
    };
  }, [allAppointments, filters]);

  const handleCancelAppointment = (appointmentId: string) => {
    const appointment = allAppointments?.find(apt => apt.id === appointmentId);
    if (!appointment) return;

    const doctorName = appointment.doctor.name || `${appointment.doctor.firstName} ${appointment.doctor.lastName}`;
    const appointmentDate = new Date(appointment.appointmentDateTime);
    const dateStr = appointmentDate.toLocaleDateString('th-TH', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const timeStr = appointmentDate.toLocaleTimeString('th-TH', {
      hour: '2-digit',
      minute: '2-digit'
    });

    Alert.alert(
      'ยืนยันการยกเลิกนัดหมาย',
      `คุณต้องการยกเลิกนัดหมายกับ ${doctorName}\nวันที่ ${dateStr}\nเวลา ${timeStr} น.\n\nการยกเลิกนี้ไม่สามารถยกเลิกได้`,
      [
        {
          text: 'ยกเลิก',
          style: 'cancel',
        },
        {
          text: 'ยืนยันการยกเลิก',
          style: 'destructive',
          onPress: () => {
            cancelMutation.mutate(appointmentId);
          },
        },
      ]
    );
  };

  const handleAppointmentPress = (appointmentId: string) => {
    router.push(`/(root)/appointments/${appointmentId}`);
  };

  const handleBookNewAppointment = () => {
    router.push('/book-appointment');
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  const filterButtons = [
    { key: 'all' as AppointmentFilter, title: 'ทั้งหมด', count: counts.all },
    { key: 'confirmed' as AppointmentFilter, title: 'ยืนยันแล้ว', count: counts.confirmed },
    { key: 'pending' as AppointmentFilter, title: 'รอยืนยัน', count: counts.pending },
    { key: 'cancelled' as AppointmentFilter, title: 'ยกเลิก', count: counts.cancelled }
  ];

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView className="bg-background-secondary h-full">
        <View className="bg-white px-5 py-4 border-b border-secondary-200">
          <Text className="text-2xl font-rubik-bold text-text-primary mb-2">
            การนัดหมายของฉัน
          </Text>
          <Text className="text-base font-rubik text-secondary-600">
            ดูและจัดการนัดหมายทั้งหมดของคุณ
          </Text>
        </View>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#0066CC" />
          <Text className="text-base font-rubik text-secondary-600 mt-4">
            กำลังโหลดการนัดหมาย...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error) {
    return (
      <SafeAreaView className="bg-background-secondary h-full">
        <View className="bg-white px-5 py-4 border-b border-secondary-200">
          <Text className="text-2xl font-rubik-bold text-text-primary mb-2">
            การนัดหมายของฉัน
          </Text>
          <Text className="text-base font-rubik text-secondary-600">
            ดูและจัดการนัดหมายทั้งหมดของคุณ
          </Text>
        </View>
        <ErrorState
          error={error}
          title="เกิดข้อผิดพลาด"
          message="ไม่สามารถโหลดข้อมูลการนัดหมายได้"
          onRetry={refetch}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="bg-background-secondary h-full">
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor="#0066CC"
            colors={['#0066CC']}
          />
        }
      >
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
          {filteredAppointments.length > 0 ? (
            filteredAppointments.map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                onPress={() => handleAppointmentPress(appointment.id)}
                showActions={false}
              />
            ))
          ) : (
            <View className="items-center py-12">
              <View className="bg-white rounded-xl p-8 w-full">
                <Text className="text-lg font-rubik-semiBold text-text-primary text-center mb-2">
                  {selectedFilter === 'all' && 'ยังไม่มีการนัดหมาย'}
                  {selectedFilter === 'confirmed' && 'ไม่มีนัดหมายที่ยืนยันแล้ว'}
                  {selectedFilter === 'pending' && 'ไม่มีนัดหมายที่รอยืนยัน'}
                  {selectedFilter === 'cancelled' && 'ไม่มีการนัดหมายที่ยกเลิก'}
                </Text>
                <Text className="text-base font-rubik text-secondary-600 text-center mb-6">
                  {selectedFilter === 'all' && 'เริ่มต้นโดยการจองนัดหมายกับแพทย์'}
                  {selectedFilter === 'confirmed' && 'นัดหมายที่ยืนยันแล้วจะแสดงที่นี่'}
                  {selectedFilter === 'pending' && 'นัดหมายที่รอยืนยันจะแสดงที่นี่'}
                  {selectedFilter === 'cancelled' && 'การนัดหมายที่ยกเลิกจะแสดงที่นี่'}
                </Text>

                {(selectedFilter === 'all' || selectedFilter === 'pending') && (
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