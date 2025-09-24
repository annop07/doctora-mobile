import React, { useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Button, Card } from '@/components/ui';
import { mockAppointments } from '@/constants/mockMedicalData';
import { AppointmentStatus } from '@/types/medical';
import icons from '@/constants/icons';
import images from '@/constants/images';

export default function AppointmentDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [isLoading, setIsLoading] = useState(false);

  // Find appointment by ID
  const appointment = mockAppointments.find(apt => apt.id === id);

  if (!appointment) {
    return (
      <SafeAreaView className="bg-white h-full">
        <View className="flex-1 items-center justify-center">
          <Text className="text-lg font-rubik-semiBold text-text-primary">
            ไม่พบข้อมูลการนัดหมาย
          </Text>
          <Button
            title="กลับ"
            onPress={() => router.back()}
            variant="outline"
            size="sm"
            style={{ marginTop: 16 }}
          />
        </View>
      </SafeAreaView>
    );
  }

  const doctorName = `${appointment.doctor.user.firstName} ${appointment.doctor.user.lastName}`;
  const appointmentDate = new Date(appointment.appointmentDateTime);
  const isUpcoming = appointmentDate > new Date();
  const canCancel = appointment.status === AppointmentStatus.PENDING ||
                   appointment.status === AppointmentStatus.CONFIRMED;

  const getStatusColor = (status: AppointmentStatus) => {
    switch (status) {
      case AppointmentStatus.CONFIRMED:
        return 'bg-success-50 text-success-600 border-success-200';
      case AppointmentStatus.PENDING:
        return 'bg-warning-50 text-warning-600 border-warning-200';
      case AppointmentStatus.CANCELLED:
      case AppointmentStatus.REJECTED:
        return 'bg-error-50 text-error-600 border-error-200';
      case AppointmentStatus.COMPLETED:
        return 'bg-secondary-50 text-secondary-600 border-secondary-200';
      default:
        return 'bg-secondary-50 text-secondary-600 border-secondary-200';
    }
  };

  const getStatusText = (status: AppointmentStatus) => {
    switch (status) {
      case AppointmentStatus.CONFIRMED:
        return 'ยืนยันแล้ว';
      case AppointmentStatus.PENDING:
        return 'รอยืนยัน';
      case AppointmentStatus.CANCELLED:
        return 'ยกเลิกแล้ว';
      case AppointmentStatus.REJECTED:
        return 'ปฏิเสธ';
      case AppointmentStatus.COMPLETED:
        return 'เสร็จสิ้น';
      default:
        return status;
    }
  };

  const handleCancelAppointment = () => {
    Alert.alert(
      'ยกเลิกการนัดหมาย',
      'คุณแน่ใจหรือไม่ที่จะยกเลิกการนัดหมายนี้?',
      [
        { text: 'ไม่ยกเลิก', style: 'cancel' },
        {
          text: 'ยกเลิก',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            // Simulate API call
            setTimeout(() => {
              setIsLoading(false);
              Alert.alert('สำเร็จ', 'ยกเลิกการนัดหมายเรียบร้อยแล้ว', [
                { text: 'ตกลง', onPress: () => router.back() }
              ]);
            }, 1000);
          }
        }
      ]
    );
  };

  const handleReschedule = () => {
    Alert.alert(
      'เลื่อนการนัดหมาย',
      'ฟีเจอร์นี้จะเปิดใช้งานในเร็วๆ นี้'
    );
  };

  const handleViewDoctorProfile = () => {
    router.push(`/(root)/doctors/${appointment.doctor.id}`);
  };

  const handleContactDoctor = () => {
    Alert.alert(
      'ติดต่อแพทย์',
      'ฟีเจอร์นี้จะเปิดใช้งานในเร็วๆ นี้'
    );
  };

  return (
    <SafeAreaView className="bg-background-secondary h-full">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="bg-white px-5 py-4 border-b border-secondary-200">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => router.back()} className="mr-4">
              <Image source={icons.backArrow} className="size-6" tintColor="#64748b" />
            </TouchableOpacity>
            <Text className="text-xl font-rubik-bold text-text-primary">
              รายละเอียดการนัดหมาย
            </Text>
          </View>
        </View>

        {/* Status Badge */}
        <View className="bg-white px-5 py-4 border-b border-secondary-100">
          <View className="items-center">
            <View className={`px-4 py-2 rounded-full border ${getStatusColor(appointment.status)}`}>
              <Text className="text-base font-rubik-semiBold">
                {getStatusText(appointment.status)}
              </Text>
            </View>
          </View>
        </View>

        {/* Appointment Info */}
        <View className="bg-white px-5 py-6 mb-4">
          <Text className="text-lg font-rubik-semiBold text-text-primary mb-4">
            ข้อมูลการนัดหมาย
          </Text>

          <View className="space-y-4">
            {/* Date & Time */}
            <View className="flex-row items-center">
              <Image source={icons.calendar} className="size-5 mr-3" tintColor="#64748b" />
              <View className="flex-1">
                <Text className="text-sm font-rubik text-secondary-600">วันที่และเวลา</Text>
                <Text className="text-base font-rubik-semiBold text-text-primary">
                  {appointmentDate.toLocaleDateString('th-TH', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Text>
                <Text className="text-base font-rubik-semiBold text-primary-600">
                  {appointmentDate.toLocaleTimeString('th-TH', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })} ({appointment.durationMinutes} นาที)
                </Text>
              </View>
            </View>

            {/* Doctor Info */}
            <View className="flex-row items-center">
              <Image source={icons.person} className="size-5 mr-3" tintColor="#64748b" />
              <View className="flex-1">
                <Text className="text-sm font-rubik text-secondary-600">แพทย์ผู้ตรวจ</Text>
                <Text className="text-base font-rubik-semiBold text-text-primary">
                  {doctorName}
                </Text>
                <Text className="text-sm font-rubik text-secondary-600">
                  {appointment.doctor.specialty.name}
                </Text>
              </View>
            </View>

            {/* Room Number */}
            {appointment.doctor.roomNumber && (
              <View className="flex-row items-center">
                <Image source={icons.location} className="size-5 mr-3" tintColor="#64748b" />
                <View className="flex-1">
                  <Text className="text-sm font-rubik text-secondary-600">ห้องตรวจ</Text>
                  <Text className="text-base font-rubik-semiBold text-text-primary">
                    ห้อง {appointment.doctor.roomNumber}
                  </Text>
                </View>
              </View>
            )}

            {/* Fee */}
            <View className="flex-row items-center">
              <Image source={icons.wallet} className="size-5 mr-3" tintColor="#64748b" />
              <View className="flex-1">
                <Text className="text-sm font-rubik text-secondary-600">ค่าตรวจ</Text>
                <Text className="text-base font-rubik-semiBold text-primary-600">
                  ฿{appointment.doctor.consultationFee}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Doctor Card */}
        <View className="bg-white px-5 py-6 mb-4">
          <Text className="text-lg font-rubik-semiBold text-text-primary mb-4">
            ข้อมูลแพทย์
          </Text>

          <TouchableOpacity onPress={handleViewDoctorProfile}>
            <Card variant="outlined" padding="md">
              <View className="flex-row items-center">
                <Image
                  source={appointment.doctor.profileImage ? { uri: appointment.doctor.profileImage } : images.avatar}
                  className="w-16 h-16 rounded-full border-2 border-primary-100"
                />

                <View className="flex-1 ml-4">
                  <Text className="text-lg font-rubik-semiBold text-text-primary">
                    {doctorName}
                  </Text>
                  <Text className="text-sm font-rubik text-primary-600 mt-1">
                    {appointment.doctor.specialty.name}
                  </Text>

                  <View className="flex-row items-center mt-2">
                    <Image source={icons.star} className="size-4 mr-1" tintColor="#f59e0b" />
                    <Text className="text-sm font-rubik text-secondary-600">
                      {appointment.doctor.rating?.toFixed(1) || 'N/A'}
                      ({appointment.doctor.totalRatings || 0} รีวิว)
                    </Text>
                  </View>
                </View>

                <Image source={icons.rightArrow} className="size-4" tintColor="#94a3b8" />
              </View>
            </Card>
          </TouchableOpacity>
        </View>

        {/* Notes */}
        {(appointment.notes || appointment.doctorNotes) && (
          <View className="bg-white px-5 py-6 mb-4">
            <Text className="text-lg font-rubik-semiBold text-text-primary mb-4">
              หมายเหตุ
            </Text>

            {appointment.notes && (
              <View className="mb-4">
                <Text className="text-sm font-rubik-semiBold text-secondary-600 mb-2">
                  หมายเหตุจากคุณ:
                </Text>
                <Text className="text-base font-rubik text-text-primary">
                  {appointment.notes}
                </Text>
              </View>
            )}

            {appointment.doctorNotes && (
              <View>
                <Text className="text-sm font-rubik-semiBold text-secondary-600 mb-2">
                  หมายเหตุจากแพทย์:
                </Text>
                <Text className="text-base font-rubik text-text-primary">
                  {appointment.doctorNotes}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Bottom Spacing */}
        <View className="h-20" />
      </ScrollView>

      {/* Action Buttons */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-secondary-200 p-5">
        {isUpcoming && canCancel ? (
          <View className="space-y-3">
            <View className="flex-row space-x-3">
              <Button
                title="เลื่อนเวลา"
                onPress={handleReschedule}
                variant="outline"
                size="lg"
                style={{ flex: 1 }}
              />
              <Button
                title="ติดต่อแพทย์"
                onPress={handleContactDoctor}
                variant="outline"
                size="lg"
                style={{ flex: 1 }}
              />
            </View>
            <Button
              title="ยกเลิกการนัดหมาย"
              onPress={handleCancelAppointment}
              variant="outline"
              size="lg"
              loading={isLoading}
              style={{
                borderColor: '#ef4444',
                backgroundColor: 'transparent'
              }}
              textStyle={{ color: '#ef4444' }}
            />
          </View>
        ) : (
          <Button
            title="ดูข้อมูลแพทย์"
            onPress={handleViewDoctorProfile}
            variant="primary"
            size="lg"
          />
        )}
      </View>
    </SafeAreaView>
  );
}