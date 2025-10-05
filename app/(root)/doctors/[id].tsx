import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { Button, Card, LoadingSpinner, ErrorStates } from "@/components/ui";
import { useDoctor, useDoctorAvailability } from "@/services/medical/hooks";
import { Availability } from "@/types";
import icons from "@/constants/icons";
import images from "@/constants/images";

const dayNames = {
  1: "จันทร์",
  2: "อังคาร",
  3: "พุธ",
  4: "พฤหัสบดี",
  5: "ศุกร์",
  6: "เสาร์",
  7: "อาทิตย์",
};

export default function DoctorDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState<
    "about" | "availability" | "reviews"
  >("about");

  // Fetch doctor data from API
  const { data: doctor, isLoading, error, refetch } = useDoctor(id as string);

  // Fetch doctor availability schedule from API
  const { data: availabilities, isLoading: availabilityLoading } = useDoctorAvailability(id as string);

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView className="bg-white h-full">
        <LoadingSpinner message="กำลังโหลดข้อมูลแพทย์..." />
      </SafeAreaView>
    );
  }

  // Error state
  if (error || !doctor) {
    return (
      <SafeAreaView className="bg-white h-full">
        <ErrorStates
          title="ไม่พบข้อมูลแพทย์"
          message="ไม่สามารถโหลดข้อมูลแพทย์ได้"
          onRetry={refetch}
          onBack={() => router.back()}
        />
      </SafeAreaView>
    );
  }

  const doctorName = doctor.name || `${doctor.firstName} ${doctor.lastName}`;

  // Use real availability data from API
  const doctorAvailability = availabilities || [];

  // Mock statistics for now (will be replaced with real API data later)
  const completedAppointments = 25; // Mock data

  const handleBookAppointment = () => {
    if (!user) {
      Alert.alert("กรุณาเข้าสู่ระบบ", "คุณต้องเข้าสู่ระบบก่อนจองนัดหมาย", [
        { text: "ยกเลิก", style: "cancel" },
        { text: "เข้าสู่ระบบ", onPress: () => router.push("/sign-in") },
      ]);
      return;
    }

    router.push({
      pathname: "/book-appointment",
      params: { doctorId: doctor.id },
    });
  };

  const renderAboutTab = () => (
    <View className="px-5 py-4">
      {/* Bio */}
      <View className="mb-6">
        <Text className="text-lg font-rubik-semiBold text-text-primary mb-3">
          เกี่ยวกับแพทย์
        </Text>
        <Text className="text-base font-rubik text-secondary-600 leading-6">
          {doctor.bio || "ไม่มีข้อมูลประวัติแพทย์"}
        </Text>
      </View>

      {/* Qualifications */}
      <View className="mb-6">
        <Text className="text-lg font-rubik-semiBold text-text-primary mb-3">
          คุณสมบัติ
        </Text>
        <View className="space-y-2">
          <View className="flex-row items-center">
            <View className="w-2 h-2 bg-primary-600 rounded-full mr-3" />
            <Text className="text-base font-rubik text-secondary-600">
              ใบอนุญาตแพทย์: {doctor.licenseNumber}
            </Text>
          </View>
          <View className="flex-row items-center">
            <View className="w-2 h-2 bg-primary-600 rounded-full mr-3" />
            <Text className="text-base font-rubik text-secondary-600">
              ประสบการณ์: {doctor.experienceYears} ปี
            </Text>
          </View>
          <View className="flex-row items-center">
            <View className="w-2 h-2 bg-primary-600 rounded-full mr-3" />
            <Text className="text-base font-rubik text-secondary-600">
              ความเชี่ยวชาญ: {doctor.specialty?.name || "ไม่ระบุแผนก"}
            </Text>
          </View>
          {doctor.roomNumber && (
            <View className="flex-row items-center">
              <View className="w-2 h-2 bg-primary-600 rounded-full mr-3" />
              <Text className="text-base font-rubik text-secondary-600">
                ห้องตรวจ: {doctor.roomNumber}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Contact Info */}
      <View className="mb-6">
        <Text className="text-lg font-rubik-semiBold text-text-primary mb-3">
          ติดต่อ
        </Text>
        <View className="space-y-2">
          <View className="flex-row items-center">
            <Image
              source={icons.person}
              className="size-4 mr-3"
              tintColor="#64748b"
            />
            <Text className="text-base font-rubik text-secondary-600">
              {doctor.email}
            </Text>
          </View>
          {doctor.phone && (
            <View className="flex-row items-center">
              <Image
                source={icons.phone}
                className="size-4 mr-3"
                tintColor="#64748b"
              />
              <Text className="text-base font-rubik text-secondary-600">
                {doctor.phone}
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );

  const renderAvailabilityTab = () => (
    <View className="px-5 py-4">
      <Text className="text-lg font-rubik-semiBold text-text-primary mb-4">
        ตารางเวลาทำการ
      </Text>

      {availabilityLoading ? (
        <View className="py-8">
          <LoadingSpinner message="กำลังโหลดตารางเวลา..." />
        </View>
      ) : doctorAvailability.length > 0 ? (
        <View className="space-y-3">
          {doctorAvailability.map((schedule, index) => (
            <Card key={`${schedule.dayOfWeek}-${index}`} variant="outlined" padding="md">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <View className="w-3 h-3 bg-success-500 rounded-full mr-3" />
                  <Text className="text-base font-rubik-semiBold text-text-primary">
                    {dayNames[schedule.dayOfWeek as keyof typeof dayNames] || schedule.dayName}
                  </Text>
                </View>
                <Text className="text-base font-rubik text-secondary-600">
                  {schedule.timeRange || `${schedule.startTime} - ${schedule.endTime}`}
                </Text>
              </View>
            </Card>
          ))}
        </View>
      ) : (
        <Card variant="outlined" padding="lg">
          <View className="items-center">
            <Text className="text-base font-rubik text-secondary-600">
              ไม่มีตารางเวลาทำการ
            </Text>
          </View>
        </Card>
      )}
    </View>
  );

  return (
    <SafeAreaView className="bg-background-secondary h-full">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="bg-white px-5 py-4 border-b border-secondary-200">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => router.back()} className="mr-4">
              <Image
                source={icons.backArrow}
                className="size-6"
                tintColor="#64748b"
              />
            </TouchableOpacity>
            <Text className="text-xl font-rubik-bold text-text-primary">
              ข้อมูลแพทย์
            </Text>
          </View>
        </View>

        {/* Doctor Profile Header */}
        <View className="bg-white px-5 py-6 border-b border-secondary-100">
          <View className="flex-row">
            {/* Doctor Image */}
            <Image
              source={
                doctor.profileImage
                  ? { uri: doctor.profileImage }
                  : images.avatar
              }
              className="w-20 h-20 rounded-full border-2 border-primary-100"
            />

            {/* Doctor Info */}
            <View className="flex-1 ml-4">
              <Text className="text-xl font-rubik-bold text-text-primary">
                {doctorName}
              </Text>
              <Text className="text-base font-rubik text-primary-600 mt-1">
                {doctor.specialty?.name || "ไม่ระบุแผนก"}
              </Text>

              <View className="flex-row items-center mt-2">
                <View className="bg-primary-50 px-2 py-1 rounded mr-2">
                  <Text className="text-xs font-rubik-semiBold text-primary-600">
                    {doctor.experienceYears} ปี
                  </Text>
                </View>
                <View className="bg-success-50 px-2 py-1 rounded">
                  <Text className="text-xs font-rubik-semiBold text-success-600">
                    {completedAppointments} คนไข้
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Consultation Fee */}
          <View className="mt-4 p-3 bg-primary-50 rounded-xl">
            <View className="flex-row items-center justify-between">
              <Text className="text-base font-rubik-semiBold text-text-primary">
                ค่าตรวจ
              </Text>
              <Text className="text-xl font-rubik-bold text-primary-600">
                ฿{doctor.consultationFee}
              </Text>
            </View>
          </View>
        </View>

        {/* Tab Navigation */}
        <View className="bg-white border-b border-secondary-100">
          <View className="flex-row">
            <TouchableOpacity
              onPress={() => setSelectedTab("about")}
              className={`flex-1 py-4 border-b-2 ${
                selectedTab === "about"
                  ? "border-primary-600"
                  : "border-transparent"
              }`}
            >
              <Text
                className={`text-center font-rubik-medium ${
                  selectedTab === "about"
                    ? "text-primary-600"
                    : "text-secondary-600"
                }`}
              >
                เกี่ยวกับ
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setSelectedTab("availability")}
              className={`flex-1 py-4 border-b-2 ${
                selectedTab === "availability"
                  ? "border-primary-600"
                  : "border-transparent"
              }`}
            >
              <Text
                className={`text-center font-rubik-medium ${
                  selectedTab === "availability"
                    ? "text-primary-600"
                    : "text-secondary-600"
                }`}
              >
                ตารางเวลา
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tab Content */}
        <View className="bg-white">
          {selectedTab === "about" && renderAboutTab()}
          {selectedTab === "availability" && renderAvailabilityTab()}
        </View>

        {/* Spacing for floating button */}
        <View className="h-20" />
      </ScrollView>

      {/* Floating Book Appointment Button */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-secondary-200 p-5">
        <Button
          title="จองนัดหมาย"
          onPress={handleBookAppointment}
          variant="primary"
          size="lg"
        />
      </View>
    </SafeAreaView>
  );
}
