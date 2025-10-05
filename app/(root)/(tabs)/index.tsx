
import React from 'react';
import { Image, Text, TouchableOpacity, View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { Card, LoadingSpinner } from '@/components/ui';
import { AppointmentCard } from '@/components/Cards';
import { useMyAppointments } from '@/services/appointments/hooks';
import { Appointment, AppointmentStatus } from '@/types/medical';
import icons from "@/constants/icons";
import images from "@/constants/images";

export default function Dashboard() {
  const { user } = useAuth();

  // API Queries
  const { data: allAppointments, isLoading: appointmentsLoading } = useMyAppointments();

  // Get upcoming appointments (filter for PENDING and CONFIRMED status, future dates)
  const upcomingAppointments = allAppointments ?
    allAppointments
      .filter(apt => {
        const isUpcoming = new Date(apt.appointmentDateTime) > new Date();
        const validStatus = apt.status === AppointmentStatus.PENDING ||
                           apt.status === AppointmentStatus.CONFIRMED;
        return isUpcoming && validStatus;
      })
      .slice(0, 2) : [];

  // Calculate health statistics
  const healthStats = {
    totalAppointments: allAppointments?.length || 0,
    completedAppointments: allAppointments?.filter(apt => apt.status === AppointmentStatus.COMPLETED).length || 0,
    uniqueDoctors: allAppointments ? new Set(allAppointments.map(apt => apt.doctor.id)).size : 0,
    pendingAppointments: allAppointments?.filter(apt => apt.status === AppointmentStatus.PENDING).length || 0
  };

  const isLoading = appointmentsLoading;

  const handleBookAppointment = () => {
    router.push('/book-appointment');
  };

  const handleViewAllAppointments = () => {
    router.push('/appointments');
  };

  const handleAppointmentPress = (appointmentId: string) => {
    router.push(`/(root)/appointments/${appointmentId}`);
  };

  // Loading state
  if (isLoading && !upcomingAppointments.length) {
    return (
      <SafeAreaView className="bg-white h-full">
        <LoadingSpinner message="กำลังโหลดข้อมูล..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="bg-white h-full">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* Header */}
        <View className="px-5 pt-5">
          <View className="flex flex-row items-center justify-between">
            <View className="flex flex-row items-center">
              <Image
                source={images.avatar}
                className="size-12 rounded-full"
              />
              <View className="flex flex-col items-start ml-3 justify-center">
                <Text className="text-xs font-rubik text-secondary-600">
                  สวัสดี
                </Text>
                <Text className="text-base font-rubik-medium text-text-primary">
                  {user?.firstName || 'ผู้ใช้'}
                </Text>
              </View>
            </View>
            <TouchableOpacity>
              <Image source={icons.bell} className="size-6" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="px-5 mt-6">
          <Text className="text-xl font-rubik-bold text-text-primary mb-4">
            เริ่มจองนัดหมายแพทย์
          </Text>

          <TouchableOpacity onPress={handleBookAppointment}>
            <Card variant="elevated" padding="lg">
              <View className="flex-row items-center">
                <Image source={icons.calendar} className="size-10 mr-4" />
                <View className="flex-1">
                  <Text className="text-base font-rubik-semiBold text-text-primary">
                    เลือกแพทย์ให้ฉัน
                  </Text>
                  <Text className="text-sm font-rubik text-secondary-600 mt-1">
                    ระบบจะแนะนำแพทย์ที่เหมาะสมตามอาการ
                  </Text>
                </View>
                <Image source={icons.rightArrow} className="size-5" />
              </View>
            </Card>
          </TouchableOpacity>
        </View>

        {/* Upcoming Appointments */}
        <View className="px-5 mt-6">
          <View className="flex flex-row items-center justify-between mb-4">
            <Text className="text-xl font-rubik-bold text-text-primary">
              นัดหมายที่จะมาถึง
            </Text>
            <TouchableOpacity onPress={handleViewAllAppointments}>
              <Text className="text-base font-rubik-bold text-primary-600">
                ดูทั้งหมด
              </Text>
            </TouchableOpacity>
          </View>

          {upcomingAppointments.length > 0 ? (
            upcomingAppointments.map((appointment: Appointment) => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                onPress={() => handleAppointmentPress(appointment.id)}
              />
            ))
          ) : (
            <Card variant="outlined" padding="lg">
              <View className="items-center">
                <Text className="text-base font-rubik text-secondary-600">
                  ไม่มีนัดหมายที่จะมาถึง
                </Text>
                <TouchableOpacity
                  onPress={handleBookAppointment}
                  className="mt-3"
                >
                  <Text className="text-sm font-rubik-medium text-primary-600">
                    จองนัดหมายใหม่
                  </Text>
                </TouchableOpacity>
              </View>
            </Card>
          )}
        </View>

        {/* Health Statistics */}
        <View className="px-5 mt-6">
          <Text className="text-xl font-rubik-bold text-text-primary mb-4">
            สถิติของฉัน
          </Text>

          <Card variant="elevated" padding="lg">
            <View className="flex-row justify-between">
              {/* Total Appointments */}
              <View className="flex-1 items-center">
                <View className="bg-primary-50 w-12 h-12 rounded-full items-center justify-center mb-2">
                  <Ionicons name="calendar" size={24} color="#0066CC" />
                </View>
                <Text className="text-2xl font-rubik-bold text-text-primary">
                  {healthStats.totalAppointments}
                </Text>
                <Text className="text-xs font-rubik text-secondary-600 text-center mt-1">
                  นัดหมายทั้งหมด
                </Text>
              </View>

              {/* Completed Appointments */}
              <View className="flex-1 items-center border-l border-r border-secondary-100">
                <View className="bg-success-50 w-12 h-12 rounded-full items-center justify-center mb-2">
                  <Ionicons name="checkmark-circle" size={24} color="#22c55e" />
                </View>
                <Text className="text-2xl font-rubik-bold text-text-primary">
                  {healthStats.completedAppointments}
                </Text>
                <Text className="text-xs font-rubik text-secondary-600 text-center mt-1">
                  เสร็จสิ้น
                </Text>
              </View>

              {/* Unique Doctors */}
              <View className="flex-1 items-center">
                <View className="bg-secondary-50 w-12 h-12 rounded-full items-center justify-center mb-2">
                  <Ionicons name="people" size={24} color="#6b7280" />
                </View>
                <Text className="text-2xl font-rubik-bold text-text-primary">
                  {healthStats.uniqueDoctors}
                </Text>
                <Text className="text-xs font-rubik text-secondary-600 text-center mt-1">
                  แพทย์ที่เคยพบ
                </Text>
              </View>
            </View>

            {/* Pending indicator if any */}
            {healthStats.pendingAppointments > 0 && (
              <View className="mt-4 pt-4 border-t border-secondary-100">
                <View className="flex-row items-center justify-center bg-warning-50 py-2 px-3 rounded-lg">
                  <Ionicons name="time-outline" size={16} color="#d97706" style={{ marginRight: 6 }} />
                  <Text className="text-sm font-rubik-medium text-warning-700">
                    มี {healthStats.pendingAppointments} นัดที่รอยืนยัน
                  </Text>
                </View>
              </View>
            )}
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
