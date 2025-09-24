import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { Button, Card, Input } from '@/components/ui';
import { Header, DoctorCard } from '@/components';
import { mockDoctors, Doctor } from '@/constants/mockMedicalData';
import icons from '@/constants/icons';

export default function BookingConfirmation() {
  const { doctorId, date, time } = useLocalSearchParams<{
    doctorId: string;
    date: string;
    time: string;
  }>();

  const { user } = useAuth();
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Find doctor by ID
  const doctor = doctorId ? mockDoctors.find(d => d.id === doctorId) : null;

  if (!doctor || !date || !time) {
    return (
      <SafeAreaView className="bg-white h-full">
        <Header
          title="ข้อผิดพลาด"
          showBackButton={true}
        />
        <View className="flex-1 items-center justify-center px-5">
          <Text className="text-lg font-rubik-semiBold text-text-primary mb-4">
            ข้อมูลการจองไม่ครบถ้วน
          </Text>
          <Button
            title="กลับไปจองใหม่"
            onPress={() => router.push('/book-appointment')}
            variant="primary"
            size="lg"
          />
        </View>
      </SafeAreaView>
    );
  }

  const doctorName = `${doctor.user.firstName} ${doctor.user.lastName}`;
  const appointmentDate = new Date(date);
  const patientName = user ? `${user.firstName} ${user.lastName}` : 'ไม่ระบุ';

  const handleConfirmBooking = async () => {
    if (!user) {
      Alert.alert(
        'กรุณาเข้าสู่ระบบ',
        'คุณต้องเข้าสู่ระบบก่อนจองนัดหมาย',
        [
          { text: 'ยกเลิก', style: 'cancel' },
          { text: 'เข้าสู่ระบบ', onPress: () => router.push('/sign-in') }
        ]
      );
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Show success message
      Alert.alert(
        '🎉 จองนัดหมายสำเร็จ!',
        `การนัดหมายของคุณได้รับการยืนยันแล้ว\n\nหมายเลขการจอง: #APT${Date.now().toString().slice(-6)}\n\nแพทย์: ${doctorName}\nวันที่: ${appointmentDate.toLocaleDateString('th-TH', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}\nเวลา: ${time}`,
        [
          {
            text: 'ดูการนัดหมาย',
            onPress: () => router.replace('/(root)/(tabs)/appointments')
          },
          {
            text: 'กลับหน้าแรก',
            onPress: () => router.replace('/(root)/(tabs)'),
            style: 'cancel'
          }
        ]
      );
    } catch (error) {
      Alert.alert(
        'เกิดข้อผิดพลาด',
        'ไม่สามารถจองนัดหมายได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง',
        [{ text: 'ตกลง' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditAppointment = () => {
    router.back();
  };

  return (
    <SafeAreaView className="bg-background-secondary h-full">
      <Header
        title="ยืนยันการจองนัดหมาย"
        subtitle="ตรวจสอบข้อมูลและยืนยันการจอง"
        showBackButton={true}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* Booking Summary Card */}
        <View className="bg-white mx-5 mt-4 rounded-xl p-6 border border-secondary-100">
          <View className="items-center mb-6">
            <View className="w-16 h-16 bg-success-100 rounded-full items-center justify-center mb-4">
              <Text className="text-2xl">📅</Text>
            </View>
            <Text className="text-xl font-rubik-bold text-text-primary text-center">
              สรุปการจองนัดหมาย
            </Text>
            <Text className="text-sm font-rubik text-secondary-600 text-center mt-1">
              กรุณาตรวจสอบข้อมูลให้ถูกต้องก่อนยืนยัน
            </Text>
          </View>

          {/* Doctor Information */}
          <View className="mb-6">
            <Text className="text-base font-rubik-semiBold text-text-primary mb-3">
              ข้อมูลแพทย์
            </Text>
            <DoctorCard
              doctor={doctor}
              variant="list"
              onPress={() => {}}
            />
          </View>

          {/* Appointment Details */}
          <View className="mb-6">
            <Text className="text-base font-rubik-semiBold text-text-primary mb-3">
              รายละเอียดการนัดหมาย
            </Text>

            <View className="space-y-3">
              <View className="flex-row justify-between py-2 border-b border-secondary-100">
                <Text className="text-sm font-rubik text-secondary-600">วันที่</Text>
                <Text className="text-sm font-rubik-semiBold text-text-primary">
                  {appointmentDate.toLocaleDateString('th-TH', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Text>
              </View>

              <View className="flex-row justify-between py-2 border-b border-secondary-100">
                <Text className="text-sm font-rubik text-secondary-600">เวลา</Text>
                <Text className="text-sm font-rubik-semiBold text-text-primary">
                  {time} น.
                </Text>
              </View>

              <View className="flex-row justify-between py-2 border-b border-secondary-100">
                <Text className="text-sm font-rubik text-secondary-600">ระยะเวลา</Text>
                <Text className="text-sm font-rubik-semiBold text-text-primary">
                  30 นาที
                </Text>
              </View>

              <View className="flex-row justify-between py-2 border-b border-secondary-100">
                <Text className="text-sm font-rubik text-secondary-600">ห้องตรวจ</Text>
                <Text className="text-sm font-rubik-semiBold text-text-primary">
                  {doctor.roomNumber ? `ห้อง ${doctor.roomNumber}` : 'จะแจ้งให้ทราบ'}
                </Text>
              </View>

              <View className="flex-row justify-between py-2">
                <Text className="text-base font-rubik-semiBold text-text-primary">ค่าตรวจ</Text>
                <Text className="text-xl font-rubik-bold text-primary-600">
                  ฿{doctor.consultationFee}
                </Text>
              </View>
            </View>
          </View>

          {/* Patient Information */}
          <View className="mb-6">
            <Text className="text-base font-rubik-semiBold text-text-primary mb-3">
              ข้อมูลผู้ป่วย
            </Text>

            <View className="space-y-3">
              <View className="flex-row justify-between py-2 border-b border-secondary-100">
                <Text className="text-sm font-rubik text-secondary-600">ชื่อ-นามสกุล</Text>
                <Text className="text-sm font-rubik-semiBold text-text-primary">
                  {patientName}
                </Text>
              </View>

              <View className="flex-row justify-between py-2 border-b border-secondary-100">
                <Text className="text-sm font-rubik text-secondary-600">อีเมล</Text>
                <Text className="text-sm font-rubik-semiBold text-text-primary">
                  {user?.email || 'ไม่ระบุ'}
                </Text>
              </View>

              <View className="flex-row justify-between py-2">
                <Text className="text-sm font-rubik text-secondary-600">เบอร์โทรศัพท์</Text>
                <Text className="text-sm font-rubik-semiBold text-text-primary">
                  {user?.phone || 'ไม่ระบุ'}
                </Text>
              </View>
            </View>
          </View>

          {/* Additional Notes */}
          <View className="mb-6">
            <Text className="text-base font-rubik-semiBold text-text-primary mb-3">
              หมายเหตุเพิ่มเติม (ไม่บังคับ)
            </Text>
            <Input
              placeholder="ระบุอาการหรือข้อมูลเพิ่มเติมที่ต้องการให้แพทย์ทราบ..."
              value={notes}
              onChangeText={setNotes}
              multiline
              style={{ height: 80, textAlignVertical: 'top' }}
            />
          </View>

          {/* Terms & Conditions */}
          <View className="bg-warning-50 p-4 rounded-xl border border-warning-200 mb-6">
            <Text className="text-sm font-rubik-semiBold text-warning-800 mb-2">
              📋 ข้อควรทราบ
            </Text>
            <View className="space-y-1">
              <Text className="text-xs font-rubik text-warning-700">
                • กรุณามาถึงก่อนเวลานัด 15 นาที
              </Text>
              <Text className="text-xs font-rubik text-warning-700">
                • หากต้องการยกเลิก กรุณาแจ้งล่วงหน้าอย่างน้อย 2 ชั่วโมง
              </Text>
              <Text className="text-xs font-rubik text-warning-700">
                • การชำระเงินสามารถทำได้ที่โรงพยาบาลหรือผ่านแอป
              </Text>
              <Text className="text-xs font-rubik text-warning-700">
                • แพทย์สามารถปรับเวลาได้ในกรณีฉุกเฉิน
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="mx-5 mt-4">
          <TouchableOpacity
            onPress={handleEditAppointment}
            className="bg-white p-4 rounded-xl border border-secondary-200 mb-4"
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View className="w-10 h-10 bg-secondary-100 rounded-full items-center justify-center mr-3">
                  <Text className="text-lg">✏️</Text>
                </View>
                <View>
                  <Text className="text-sm font-rubik-semiBold text-text-primary">
                    แก้ไขวันที่หรือเวลา
                  </Text>
                  <Text className="text-xs font-rubik text-secondary-600">
                    เปลี่ยนวันหรือเวลานัดหมาย
                  </Text>
                </View>
              </View>
              <Text className="text-primary-600 text-lg">›</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Fixed Bottom Actions */}
      <View className="bg-white border-t border-secondary-200 p-5">
        <View className="space-y-3">
          <Button
            title={isLoading ? "กำลังจองนัดหมาย..." : "ยืนยันการจองนัดหมาย"}
            onPress={handleConfirmBooking}
            variant="primary"
            size="lg"
            loading={isLoading}
            disabled={isLoading}
          />

          <Button
            title="ยกเลิก"
            onPress={() => router.back()}
            variant="outline"
            size="lg"
            disabled={isLoading}
          />
        </View>

        {/* Price Summary */}
        <View className="mt-4 pt-4 border-t border-secondary-100">
          <View className="flex-row items-center justify-between">
            <Text className="text-base font-rubik text-secondary-600">
              ยอดรวมทั้งสิ้น
            </Text>
            <Text className="text-2xl font-rubik-bold text-primary-600">
              ฿{doctor.consultationFee}
            </Text>
          </View>
          <Text className="text-xs font-rubik text-secondary-500 text-right mt-1">
            ชำระได้ที่โรงพยาบาลหรือผ่านแอป
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}