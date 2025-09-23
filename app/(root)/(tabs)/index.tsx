
import React from 'react';
import { Image, Text, TouchableOpacity, View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui';
import { DoctorCard, AppointmentCard } from '@/components/Cards';
import { getFeaturedDoctors, getAppointmentsByPatient } from '@/constants/mockMedicalData';
import icons from "@/constants/icons";
import images from "@/constants/images";

export default function Dashboard() {
  const { user } = useAuth();

  // Get featured doctors and user's appointments
  const featuredDoctors = getFeaturedDoctors();
  const upcomingAppointments = getAppointmentsByPatient('pat-001')
    .filter(apt => apt.status === 'CONFIRMED' || apt.status === 'PENDING')
    .slice(0, 2);

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
            บริการของเรา
          </Text>

          <View className="flex-row space-x-4">
            <TouchableOpacity
              className="flex-1"
              onPress={handleBookAppointment}
            >
              <Card variant="elevated" padding="lg">
                <View className="items-center">
                  <Image source={icons.calendar} className="size-8 mb-3" />
                  <Text className="text-sm font-rubik-medium text-text-primary">
                    จองนัดหมาย
                  </Text>
                </View>
              </Card>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-1"
              onPress={handleFindDoctor}
            >
              <Card variant="elevated" padding="lg">
                <View className="items-center">
                  <Image source={icons.search} className="size-8 mb-3" />
                  <Text className="text-sm font-rubik-medium text-text-primary">
                    หาแพทย์
                  </Text>
                </View>
              </Card>
            </TouchableOpacity>
          </View>
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
            upcomingAppointments.map((appointment) => (
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
            {featuredDoctors.map((doctor) => (
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
