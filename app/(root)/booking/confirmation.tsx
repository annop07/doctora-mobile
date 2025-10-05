import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useDoctors } from '@/services/medical/hooks';
import { useBookAppointment } from '@/services/appointments/hooks';
import { Button, Input } from '@/components/ui';
import { Header, DoctorCard } from '@/components';
import { BookAppointmentRequest, BookAppointmentWithPatientInfoRequest } from '@/types/medical';
import { appointmentService } from '@/services/appointments';

export default function BookingConfirmation() {
  const params = useLocalSearchParams<{
    appointmentId?: string;
    doctorId: string;
    date: string;
    time: string;
    message?: string;
    notes?: string;
    // Patient data from patient-form
    prefix?: string;
    firstName?: string;
    lastName?: string;
    gender?: string;
    dateOfBirth?: string;
    nationality?: string;
    citizenId?: string;
    phone?: string;
    email?: string;
  }>();

  const { appointmentId, doctorId, date, time, message, notes: additionalNotes } = params;

  const { user } = useAuth();
  const [notes, setNotes] = useState(additionalNotes || '');
  const [isBooking, setIsBooking] = useState(false);

  // Get doctors data
  const { data: doctorsResponse } = useDoctors({ limit: 100 });

  // Booking mutation
  const bookAppointmentMutation = useBookAppointment();

  // Find doctor by ID
  const doctor = useMemo(() => {
    if (doctorId && doctorsResponse?.doctors) {
      // Try both string and number comparison
      return doctorsResponse.doctors.find(d =>
        d.id === doctorId || d.id === parseInt(doctorId) || d.id.toString() === doctorId
      ) || null;
    }
    return null;
  }, [doctorId, doctorsResponse?.doctors]);

  // Auto-redirect if this is a successful booking (has appointmentId)
  useEffect(() => {
    if (appointmentId && message) {
      const timer = setTimeout(() => {
        Alert.alert(
          '🎉 จองนัดหมายสำเร็จ!',
          `${message}\n\nหมายเลขการจอง: ${appointmentId}`,
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
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [appointmentId, message]);

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

  const doctorName = doctor ? doctor.name : 'ไม่ระบุ';
  const appointmentDate = new Date(date);

  // Use patient data from form params, fallback to user data
  const patientName = params.firstName && params.lastName
    ? `${params.prefix || ''} ${params.firstName} ${params.lastName}`.trim()
    : user ? `${user.firstName} ${user.lastName}` : 'ไม่ระบุ';

  const patientEmail = params.email || user?.email || 'ไม่ระบุ';
  const patientPhone = params.phone || user?.phone || 'ไม่ระบุ';

  // If this is a successful booking, don't show the form
  if (appointmentId && message) {
    return (
      <SafeAreaView className="bg-background-secondary h-full">
        <View className="flex-1 items-center justify-center px-5">
          <View className="bg-white rounded-xl p-8 w-full items-center">
            <View className="w-20 h-20 bg-success-100 rounded-full items-center justify-center mb-6">
              <Text className="text-4xl">🎉</Text>
            </View>
            <Text className="text-2xl font-rubik-bold text-success-600 text-center mb-4">
              จองนัดหมายสำเร็จ!
            </Text>
            <Text className="text-base font-rubik text-text-primary text-center mb-2">
              {message}
            </Text>
            <Text className="text-sm font-rubik text-secondary-600 text-center mb-8">
              หมายเลขการจอง: {appointmentId}
            </Text>

            <View className="w-full space-y-3">
              <Button
                title="ดูการนัดหมาย"
                onPress={() => router.replace('/(root)/(tabs)/appointments')}
                variant="primary"
                size="lg"
              />
              <Button
                title="กลับหน้าแรก"
                onPress={() => router.replace('/(root)/(tabs)')}
                variant="outline"
                size="lg"
              />
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const handleEditAppointment = () => {
    router.back();
  };

  const handleConfirmBooking = async () => {
    if (!doctor || !date || !time) return;

    setIsBooking(true);

    try {
      // Create booking request
      const appointmentDateTime = new Date(date);
      const [hours, minutes] = time.split(':').map(Number);
      appointmentDateTime.setHours(hours, minutes, 0, 0);

      // Convert to local timezone format
      const year = appointmentDateTime.getFullYear();
      const month = String(appointmentDateTime.getMonth() + 1).padStart(2, '0');
      const day = String(appointmentDateTime.getDate()).padStart(2, '0');
      const hour = String(appointmentDateTime.getHours()).padStart(2, '0');
      const minute = String(appointmentDateTime.getMinutes()).padStart(2, '0');
      const second = String(appointmentDateTime.getSeconds()).padStart(2, '0');

      const localDateTimeString = `${year}-${month}-${day}T${hour}:${minute}:${second}`;

      // Check if we have patient info from patient-form
      if (params.firstName && params.lastName) {
        // Use with-patient-info endpoint
        const bookingRequest: BookAppointmentWithPatientInfoRequest = {
          doctorId: doctor.id,
          appointmentDateTime: localDateTimeString,
          durationMinutes: 60,
          notes: notes || '',
          // Patient info
          patientPrefix: params.prefix,
          patientFirstName: params.firstName,
          patientLastName: params.lastName,
          patientGender: params.gender,
          patientDateOfBirth: params.dateOfBirth,
          patientNationality: params.nationality,
          patientCitizenId: params.citizenId,
          patientPhone: params.phone,
          patientEmail: params.email,
          // Additional info
          symptoms: params.notes,
          bookingType: 'manual'
        };

        console.log('🔍 DEBUG: Booking with Patient Info:', bookingRequest);

        const result = await appointmentService.bookAppointmentWithPatientInfo(bookingRequest);

        Alert.alert(
          '🎉 จองนัดหมายสำเร็จ!',
          `หมายเลขการจอง: ${result.id}\nข้อมูลผู้ป่วยถูกบันทึกเรียบร้อยแล้ว`,
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
      } else {
        // Use regular endpoint (no patient info)
        const bookingRequest: BookAppointmentRequest = {
          doctorId: doctor.id,
          appointmentDateTime: localDateTimeString,
          durationMinutes: 60,
          notes: notes || ''
        };

        console.log('🔍 DEBUG: Regular Booking Request:', bookingRequest);

        const result = await bookAppointmentMutation.mutateAsync(bookingRequest);

        Alert.alert(
          '🎉 จองนัดหมายสำเร็จ!',
          `หมายเลขการจอง: ${result.id}\n${result.message}`,
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
      }
    } catch (error) {
      console.error('❌ Booking Error:', error);
      Alert.alert(
        'เกิดข้อผิดพลาด',
        error instanceof Error ? error.message : 'ไม่สามารถจองนัดหมายได้ กรุณาลองใหม่อีกครั้ง',
        [{ text: 'ตกลง' }]
      );
    } finally {
      setIsBooking(false);
    }
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
                <Text className="text-sm font-rubik text-secondary-600">วันและเวลา</Text>
                <Text className="text-sm font-rubik-semiBold text-text-primary">
                  {appointmentDate.toLocaleDateString('th-TH', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })} {time} น.
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
                  {patientEmail}
                </Text>
              </View>

              <View className="flex-row justify-between py-2 border-b border-secondary-100">
                <Text className="text-sm font-rubik text-secondary-600">เบอร์โทรศัพท์</Text>
                <Text className="text-sm font-rubik-semiBold text-text-primary">
                  {patientPhone}
                </Text>
              </View>

              {params.gender && (
                <View className="flex-row justify-between py-2 border-b border-secondary-100">
                  <Text className="text-sm font-rubik text-secondary-600">เพศ</Text>
                  <Text className="text-sm font-rubik-semiBold text-text-primary">
                    {params.gender}
                  </Text>
                </View>
              )}

              {params.citizenId && (
                <View className="flex-row justify-between py-2">
                  <Text className="text-sm font-rubik text-secondary-600">เลขบัตรประชาชน</Text>
                  <Text className="text-sm font-rubik-semiBold text-text-primary">
                    {params.citizenId}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Show notes if this is from API (read-only) */}
          {notes && (
            <View className="mb-6">
              <Text className="text-base font-rubik-semiBold text-text-primary mb-3">
                หมายเหตุ
              </Text>
              <View className="bg-secondary-50 p-4 rounded-xl">
                <Text className="text-sm font-rubik text-text-primary">
                  {notes}
                </Text>
              </View>
            </View>
          )}

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

      {/* Fixed Bottom Actions - Only show for non-API bookings */}
      {!appointmentId && (
        <View className="bg-white border-t border-secondary-200 p-5">
          {/* Price Summary */}
          <View className="mb-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-base font-rubik text-secondary-600">
                ยอดรวมทั้งสิ้น
              </Text>
              <Text className="text-2xl font-rubik-bold text-primary-600">
                ฿{doctor?.consultationFee || 0}
              </Text>
            </View>
            <Text className="text-xs font-rubik text-secondary-500 text-right mt-1">
              ชำระได้ที่โรงพยาบาลหรือผ่านแอป
            </Text>
          </View>

          <View className="flex-row space-x-3">
            <Button
              title="กลับไป"
              onPress={() => router.back()}
              variant="outline"
              size="lg"
              style={{ flex: 1 }}
            />

            <Button
              title={isBooking ? 'กำลังจอง...' : 'ยืนยันการจอง'}
              onPress={handleConfirmBooking}
              variant="primary"
              size="lg"
              disabled={isBooking}
              loading={isBooking}
              style={{ flex: 2 }}
            />
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}