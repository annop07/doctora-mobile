
import React from 'react';
import { Image, Text, TouchableOpacity, View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { Card, LoadingSpinner } from '@/components/ui';
import { DoctorCard, AppointmentCard } from '@/components/Cards';
import { useDoctors } from '@/services/medical/hooks';
import { useMyAppointments } from '@/services/appointments/hooks';
import { Appointment, Doctor, AppointmentStatus } from '@/types/medical';
import icons from "@/constants/icons";
import images from "@/constants/images";

export default function Dashboard() {
  const { user } = useAuth();

  // API Queries
  const { data: doctorsResponse, isLoading: doctorsLoading } = useDoctors();
  const { data: allAppointments, isLoading: appointmentsLoading } = useMyAppointments();

  // Get featured doctors
  const featuredDoctors = doctorsResponse?.doctors?.slice(0, 5) || [];

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

  const isLoading = doctorsLoading || appointmentsLoading;

  const handleBookAppointment = () => {
    router.push('/book-appointment');
  };

  const handleFindDoctor = () => {
    router.push('/doctors');
  };

  const handleViewAllAppointments = () => {
    router.push('/appointments');
  };

  const handleDoctorPress = (doctorId: string) => {
    router.push(`/(root)/doctors/${doctorId}`);
  };

  const handleAppointmentPress = (appointmentId: string) => {
    router.push(`/(root)/appointments/${appointmentId}`);
  };

  // Loading state
  if (isLoading && !featuredDoctors.length && !upcomingAppointments.length) {
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

        {/* Featured Doctors */}
        <View className="mt-6">
          <View className="flex flex-row items-center justify-between mb-4 px-5">
            <Text className="text-xl font-rubik-bold text-text-primary">
              แพทย์ยอดนิยม
            </Text>
            <TouchableOpacity onPress={handleFindDoctor}>
              <Text className="text-base font-rubik-bold text-primary-600">
                ดูทั้งหมด
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20 }}
          >
            {featuredDoctors.map((doctor: Doctor) => (
              <DoctorCard
                key={doctor.id}
                doctor={doctor}
                variant="featured"
                onPress={() => handleDoctorPress(doctor.id)}
              />
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
