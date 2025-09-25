import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Button, Card, Input } from '@/components/ui';
import { Header, TimeSlotPicker, DoctorCard, SpecialtyCard } from '@/components';
import { useSpecialtiesWithCount, useDoctorsBySpecialty, useDoctors } from '@/services/medical/hooks';
import { useBookAppointment } from '@/services/appointments/hooks';
import { ErrorState } from '@/components/ErrorStates';
import { Doctor, Specialty, BookAppointmentRequest } from '@/types/medical';

export default function BookAppointment() {
  const { doctorId } = useLocalSearchParams<{ doctorId?: string }>();

  // State management
  const [currentStep, setCurrentStep] = useState(doctorId ? 2.5 : 1);
  const [selectedSpecialtyIds, setSelectedSpecialtyIds] = useState<string[]>([]);
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>('');

  // API Queries
  const { data: specialtiesWithCount, isLoading: specialtiesLoading, error: specialtiesError } = useSpecialtiesWithCount();

  // Get doctors based on selected specialty
  const firstSpecialtyId = selectedSpecialtyIds[0] || null;
  const {
    data: doctorsBySpecialty,
    isLoading: doctorsLoading,
    error: doctorsError
  } = useDoctorsBySpecialty(firstSpecialtyId);

  // Get specific doctor if doctorId is provided
  const { data: allDoctorsResponse } = useDoctors({ limit: 100 });

  // Appointment booking mutation
  const bookAppointmentMutation = useBookAppointment();

  // Find selected doctor when doctorId is provided
  const initialDoctor = useMemo(() => {
    if (doctorId && allDoctorsResponse?.doctors) {
      // Try both string and number comparison
      return allDoctorsResponse.doctors.find(d =>
        d.id === doctorId || d.id === parseInt(doctorId) || d.id.toString() === doctorId
      ) || null;
    }
    return null;
  }, [doctorId, allDoctorsResponse?.doctors]);

  // Set initial doctor when data loads
  React.useEffect(() => {
    if (initialDoctor && !selectedDoctor) {
      setSelectedDoctor(initialDoctor);
    }
  }, [initialDoctor, selectedDoctor]);

  const handleSpecialtyToggle = (specialtyId: string) => {
    setSelectedSpecialtyIds(prev => {
      const newSpecialtyIds = prev.includes(specialtyId)
        ? prev.filter(id => id !== specialtyId)
        : [specialtyId]; // Only allow single selection for now
      return newSpecialtyIds;
    });
  };

  const handleFindDoctors = () => {
    if (selectedSpecialtyIds.length === 0) {
      Alert.alert('กรุณาเลือกแผนกที่ต้องการ', 'เลือกอย่างน้อย 1 แผนกเพื่อค้นหาแพทย์ที่เหมาะสม');
      return;
    }
    setCurrentStep(2);
  };

  const handleBookWithDoctor = (doctorId: string) => {
    const doctor = doctorsBySpecialty?.find(d => d.id === doctorId);
    if (doctor) {
      setSelectedDoctor(doctor);
      setCurrentStep(2.5); // ไปเลือกเวลาก่อน
    }
  };

  const handleTimeSelectionComplete = () => {
    if (selectedTime) {
      setCurrentStep(3); // ไปยืนยันการจอง
    }
  };

  const handleManualSelection = () => {
    router.push('/doctors');
  };

  const handleConfirmBooking = async () => {
    if (!selectedDoctor || !selectedTime) return;

    // Create booking request
    const appointmentDateTime = new Date(selectedDate);
    const [hours, minutes] = selectedTime.split(':').map(Number);
    appointmentDateTime.setHours(hours, minutes, 0, 0);

    const bookingRequest: BookAppointmentRequest = {
      doctorId: selectedDoctor.id,
      appointmentDateTime: appointmentDateTime.toISOString(),
      durationMinutes: 30,
      notes: additionalInfo || ''
    };

    try {
      const result = await bookAppointmentMutation.mutateAsync(bookingRequest);

      // Navigate to confirmation page with booking details
      router.push({
        pathname: '/(root)/booking/confirmation',
        params: {
          appointmentId: result.id,
          doctorId: selectedDoctor.id,
          date: selectedDate.toISOString(),
          time: selectedTime,
          message: result.message
        }
      });
    } catch (error) {
      Alert.alert(
        'เกิดข้อผิดพลาด',
        error instanceof Error ? error.message : 'ไม่สามารถจองนัดหมายได้ กรุณาลองใหม่อีกครั้ง',
        [{ text: 'ตกลง' }]
      );
    }
  };

  const renderStep1 = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View className="px-5 py-6">
        <Text className="text-2xl font-rubik-bold text-text-primary text-center mb-2">
          ระบบแนะนำแพทย์อัตโนมัติ
        </Text>
        <Text className="text-base font-rubik text-secondary-600 text-center leading-6">
          ตอบคำถามเพื่อให้เราแนะนำแพทย์ที่เหมาะสมกับอาการของคุณ
        </Text>
      </View>

      {/* Progress Indicator */}
      <View className="px-5 mb-6">
        <View className="flex-row justify-between mb-2">
          <Text className="text-sm font-rubik text-primary-600">ขั้นตอนที่ 1</Text>
          <Text className="text-sm font-rubik text-secondary-500">จาก 3</Text>
        </View>
        <View className="h-2 bg-secondary-100 rounded-full">
          <View className="h-2 bg-primary-600 rounded-full" style={{ width: '33%' }} />
        </View>
      </View>

      {/* Medical Specialties Selection */}
      <View className="px-5 mb-6">
        <Text className="text-lg font-rubik-semiBold text-text-primary mb-4">
          เลือกความชำนาญของแพทย์ที่ต้องการ
        </Text>

        {specialtiesLoading ? (
          <View className="items-center py-8">
            <ActivityIndicator size="large" color="#0066CC" />
            <Text className="text-base font-rubik text-secondary-600 mt-4">
              กำลังโหลดแผนก...
            </Text>
          </View>
        ) : specialtiesError ? (
          <ErrorState
            error={specialtiesError}
            title="เกิดข้อผิดพลาด"
            message="ไม่สามารถโหลดข้อมูลแผนกได้"
            showRetry={false}
          />
        ) : (
          <View className="flex-row flex-wrap">
            {(specialtiesWithCount || []).map((specialty) => (
              <TouchableOpacity
                key={specialty.id}
                onPress={() => handleSpecialtyToggle(specialty.id)}
                className="w-1/2 mb-3 pr-2"
              >
                <SpecialtyCard
                  specialty={specialty}
                  variant="grid"
                  selected={selectedSpecialtyIds.includes(specialty.id)}
                  onPress={() => handleSpecialtyToggle(specialty.id)}
                  doctorCount={specialty.doctorCount}
                />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Selected Count */}
        {selectedSpecialtyIds.length > 0 && (
          <View className="mt-4 p-3 bg-primary-50 rounded-xl">
            <Text className="text-sm font-rubik text-primary-600 text-center">
              เลือกแล้ว {selectedSpecialtyIds.length} แผนก
              {specialtiesWithCount && `: ${selectedSpecialtyIds.map(id =>
                specialtiesWithCount.find(s => s.id === id)?.name
              ).filter(Boolean).join(', ')}`}
            </Text>
          </View>
        )}
      </View>

      {/* Date and Time Selection */}
      <View className="mb-6">
        <TimeSlotPicker
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
          selectedTime={selectedTime}
          onTimeSelect={setSelectedTime}
          doctorId={selectedDoctor?.id}
        />
      </View>

      {/* Additional Information */}
      <View className="px-5 mb-6">
        <Text className="text-lg font-rubik-semiBold text-text-primary mb-4">
          ข้อมูลเพิ่มเติม (ไม่บังคับ)
        </Text>
        <Input
          placeholder="อธิบายอาการเพิ่มเติม..."
          value={additionalInfo}
          onChangeText={setAdditionalInfo}
          multiline
          style={{ height: 80, textAlignVertical: 'top' }}
        />
      </View>

      {/* Action Buttons */}
      <View className="px-5 pb-8">
        <Button
          title="ค้นหาแพทย์ที่เหมาะสม"
          onPress={handleFindDoctors}
          disabled={selectedSpecialtyIds.length === 0 || specialtiesLoading}
          variant="primary"
          size="lg"
        />

        <TouchableOpacity onPress={handleManualSelection} className="mt-4">
          <Text className="text-center text-base font-rubik-medium text-primary-600">
            หรือเลือกแพทย์เอง
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderStep2 = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View className="px-5 py-6">
        <Text className="text-2xl font-rubik-bold text-text-primary text-center mb-2">
          แพทย์ที่แนะนำ
        </Text>
        <Text className="text-base font-rubik text-secondary-600 text-center">
          เรา ได้คัดเลือกแพทย์ที่เหมาะสมกับอาการของคุณแล้ว
        </Text>
      </View>

      {/* Progress Indicator */}
      <View className="px-5 mb-6">
        <View className="flex-row justify-between mb-2">
          <Text className="text-sm font-rubik text-primary-600">ขั้นตอนที่ 2</Text>
          <Text className="text-sm font-rubik text-secondary-500">จาก 3</Text>
        </View>
        <View className="h-2 bg-secondary-100 rounded-full">
          <View className="h-2 bg-primary-600 rounded-full" style={{ width: '67%' }} />
        </View>
      </View>

      {/* Recommended Doctors */}
      <View className="px-5">
        {doctorsLoading ? (
          <View className="items-center py-8">
            <ActivityIndicator size="large" color="#0066CC" />
            <Text className="text-base font-rubik text-secondary-600 mt-4">
              กำลังค้นหาแพทย์...
            </Text>
          </View>
        ) : doctorsError ? (
          <ErrorState
            error={doctorsError}
            title="เกิดข้อผิดพลาด"
            message="ไม่สามารถโหลดข้อมูลแพทย์ได้"
            showRetry={false}
          />
        ) : doctorsBySpecialty && doctorsBySpecialty.length > 0 ? (
          doctorsBySpecialty.map((doctor, index) => (
            <View key={doctor.id} className="mb-4 relative">
              {/* Recommended Badge */}
              {index === 0 && (
                <View className="absolute -top-2 -right-2 bg-success-500 px-3 py-1 rounded-full z-10">
                  <Text className="text-xs font-rubik-semiBold text-white">
                    แนะนำ
                  </Text>
                </View>
              )}

              <DoctorCard
                doctor={doctor}
                variant="list"
                onPress={() => handleBookWithDoctor(doctor.id)}
              />
            </View>
          ))
        ) : (
          <View className="items-center py-8">
            <Text className="text-lg font-rubik-semiBold text-text-primary mb-2">
              ไม่พบแพทย์ในแผนกนี้
            </Text>
            <Text className="text-base font-rubik text-secondary-600 text-center">
              ลองเลือกแผนกอื่น หรือเลือกแพทย์ด้วยตนเอง
            </Text>
          </View>
        )}
      </View>

      {/* Back Button */}
      <View className="px-5 py-8">
        <TouchableOpacity onPress={() => setCurrentStep(1)}>
          <Text className="text-center text-base font-rubik-medium text-primary-600">
            กลับไปแก้ไขอาการ
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleManualSelection} className="mt-4">
          <Text className="text-center text-base font-rubik-medium text-secondary-600">
            เลือกแพทย์เอง
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderStep3 = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View className="px-5 py-6">
        <Text className="text-2xl font-rubik-bold text-text-primary text-center mb-2">
          ยืนยันการจองนัดหมาย
        </Text>
        <Text className="text-base font-rubik text-secondary-600 text-center">
          ตรวจสอบข้อมูลและยืนยันการจองนัดหมายของคุณ
        </Text>
      </View>

      {/* Progress Indicator */}
      <View className="px-5 mb-6">
        <View className="flex-row justify-between mb-2">
          <Text className="text-sm font-rubik text-primary-600">ยืนยันการจอง</Text>
          <Text className="text-sm font-rubik text-secondary-500">ขั้นตอนสุดท้าย</Text>
        </View>
        <View className="h-2 bg-secondary-100 rounded-full">
          <View className="h-2 bg-primary-600 rounded-full" style={{ width: '100%' }} />
        </View>
      </View>

      {/* Selected Doctor Info */}
      {selectedDoctor && (
        <View className="px-5 mb-6">
          <DoctorCard
            doctor={selectedDoctor}
            variant="list"
            onPress={() => {}}
          />
        </View>
      )}



      {/* Booking Summary */}
      <View className="px-5 mb-6">
        <Text className="text-lg font-rubik-semiBold text-text-primary mb-4">
          สรุปการจองนัดหมาย
        </Text>

        <Card variant="outlined" padding="md">
          <View className="space-y-2">
            <View className="flex-row justify-between">
              <Text className="text-sm font-rubik text-secondary-600">แพทย์:</Text>
              <Text className="text-sm font-rubik-medium text-text-primary">
                {selectedDoctor ? selectedDoctor.name : '-'}
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-sm font-rubik text-secondary-600">วันที่:</Text>
              <Text className="text-sm font-rubik-medium text-text-primary">
                {selectedDate.toLocaleDateString('th-TH', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-sm font-rubik text-secondary-600">เวลา:</Text>
              <Text className="text-sm font-rubik-medium text-text-primary">
                {selectedTime || '-'}
              </Text>
            </View>
            <View className="h-px bg-secondary-200 my-2" />
            <View className="flex-row justify-between">
              <Text className="text-base font-rubik-semiBold text-text-primary">ค่าบริการ:</Text>
              <Text className="text-base font-rubik-bold text-primary-600">
                ฿{selectedDoctor?.consultationFee}
              </Text>
            </View>
          </View>
        </Card>
      </View>

      {/* Action Buttons */}
      <View className="px-5 pb-8">
        <Button
          title="ยืนยันการจอง"
          onPress={handleConfirmBooking}
          disabled={!selectedTime || bookAppointmentMutation.isPending}
          variant="primary"
          size="lg"
          loading={bookAppointmentMutation.isPending}
        />

        <TouchableOpacity onPress={() => setCurrentStep(2.5)} className="mt-4">
          <Text className="text-center text-base font-rubik-medium text-primary-600">
            กลับไปเลือกเวลา
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderTimeSelection = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View className="px-5 py-6">
        <Text className="text-2xl font-rubik-bold text-text-primary text-center mb-2">
          เลือกวันที่และเวลา
        </Text>
        <Text className="text-base font-rubik text-secondary-600 text-center">
          เลือกวันที่และเวลาที่ต้องการนัดหมายกับแพทย์
        </Text>
      </View>

      {/* Progress Indicator */}
      <View className="px-5 mb-6">
        <View className="flex-row justify-between mb-2">
          <Text className="text-sm font-rubik text-primary-600">เลือกเวลา</Text>
          <Text className="text-sm font-rubik text-secondary-500">ขั้นต่อไป: ยืนยัน</Text>
        </View>
        <View className="h-2 bg-secondary-100 rounded-full">
          <View className="h-2 bg-primary-600 rounded-full" style={{ width: '75%' }} />
        </View>
      </View>

      {/* Selected Doctor Info */}
      {selectedDoctor && (
        <View className="px-5 mb-6">
          <Text className="text-lg font-rubik-semiBold text-text-primary mb-4">
            แพทย์ที่เลือก
          </Text>
          <DoctorCard
            doctor={selectedDoctor}
            variant="list"
            onPress={() => {}}
          />
        </View>
      )}

      {/* Date and Time Selection */}
      <View className="mb-6">
        <TimeSlotPicker
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
          selectedTime={selectedTime}
          onTimeSelect={setSelectedTime}
        />
      </View>

      {/* Action Buttons */}
      <View className="px-5 pb-8">
        <Button
          title="ดำเนินการต่อ"
          onPress={handleTimeSelectionComplete}
          disabled={!selectedTime}
          variant="primary"
          size="lg"
        />

        <TouchableOpacity
          onPress={() => currentStep === 2.5 && doctorId ? router.back() : setCurrentStep(2)}
          className="mt-4"
        >
          <Text className="text-center text-base font-rubik-medium text-primary-600">
            {currentStep === 2.5 && doctorId ? 'กลับไปเลือกแพทย์' : 'เลือกแพทย์คนอื่น'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView className="bg-white h-full">
      <Header
        title="จองนัดหมาย"
        showBackButton={true}
      />

      {currentStep === 1 ? renderStep1() :
       currentStep === 2 ? renderStep2() :
       currentStep === 2.5 ? renderTimeSelection() :
       renderStep3()}
    </SafeAreaView>
  );
}