
import React from 'react';
import { Image, Text, TouchableOpacity, View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui';
import icons from "@/constants/icons";
import images from "@/constants/images";

// Mock data for development
const mockUpcomingAppointments = [
  {
    id: '1',
    doctorName: 'นพ.สมชาย ใจดี',
    specialty: 'อายุรกรรม',
    date: '2024-01-20',
    time: '14:00',
    type: 'ตรวจร่างกาย'
  },
  {
    id: '2',
    doctorName: 'นพ.วีรวัฒน์ สุขใส',
    specialty: 'โรคหัวใจ',
    date: '2024-01-22',
    time: '10:30',
    type: 'ตรวจติดตาม'
  }
];

const mockPopularDoctors = [
  {
    id: '1',
    name: 'นพ.สมชาย ใจดี',
    specialty: 'อายุรกรรม',
    rating: 4.8,
    experience: '15 ปี'
  },
  {
    id: '2',
    name: 'นพ.วีรวัฒน์ สุขใส',
    specialty: 'โรคหัวใจ',
    rating: 4.9,
    experience: '12 ปี'
  }
];

export default function Dashboard() {
  const { user } = useAuth();

  const handleBookAppointment = () => {
    router.push('/book-appointment');
  };

  const handleFindDoctor = () => {
    router.push('/doctors');
  };

  const handleViewAllAppointments = () => {
    router.push('/appointments');
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

          {mockUpcomingAppointments.length > 0 ? (
            mockUpcomingAppointments.map((appointment) => (
              <Card key={appointment.id} variant="outlined" padding="md" margin="sm">
                <View className="flex-row justify-between items-center">
                  <View className="flex-1">
                    <Text className="text-base font-rubik-semiBold text-text-primary">
                      {appointment.doctorName}
                    </Text>
                    <Text className="text-sm font-rubik text-secondary-600 mt-1">
                      {appointment.specialty}
                    </Text>
                    <Text className="text-sm font-rubik text-secondary-600">
                      {appointment.date} เวลา {appointment.time}
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-xs font-rubik text-primary-600 bg-primary-50 px-2 py-1 rounded">
                      {appointment.type}
                    </Text>
                  </View>
                </View>
              </Card>
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

        {/* Popular Doctors */}
        <View className="px-5 mt-6">
          <View className="flex flex-row items-center justify-between mb-4">
            <Text className="text-xl font-rubik-bold text-text-primary">
              แพทย์ยอดนิยม
            </Text>
            <TouchableOpacity onPress={handleFindDoctor}>
              <Text className="text-base font-rubik-bold text-primary-600">
                ดูทั้งหมด
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {mockPopularDoctors.map((doctor, index) => (
              <Card
                key={doctor.id}
                variant="elevated"
                padding="md"
                style={{
                  marginRight: index < mockPopularDoctors.length - 1 ? 16 : 0,
                  width: 200
                }}
              >
                <View className="items-center">
                  <Image
                    source={images.avatar}
                    className="size-16 rounded-full mb-3"
                  />
                  <Text className="text-sm font-rubik-semiBold text-text-primary text-center">
                    {doctor.name}
                  </Text>
                  <Text className="text-xs font-rubik text-secondary-600 mt-1">
                    {doctor.specialty}
                  </Text>
                  <View className="flex-row items-center mt-2">
                    <Image source={icons.star} className="size-3 mr-1" />
                    <Text className="text-xs font-rubik text-secondary-600">
                      {doctor.rating} • {doctor.experience}
                    </Text>
                  </View>
                </View>
              </Card>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
