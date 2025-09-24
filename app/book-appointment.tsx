import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Button, Card, Input } from '@/components/ui';
import { Header, TimeSlotPicker, DoctorCard, SpecialtyCard } from '@/components';
import { mockSpecialties, mockDoctors, Doctor } from '@/constants/mockMedicalData';

export default function BookAppointment() {
  const { doctorId } = useLocalSearchParams<{ doctorId?: string }>();
  // เมื่อมี doctorId ให้ไป step 2.5 (เลือกเวลา) แทน step 3
  const [currentStep, setCurrentStep] = useState(doctorId ? 2.5 : 1);
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [recommendedDoctors, setRecommendedDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(
    doctorId ? mockDoctors.find(d => d.id === doctorId) || null : null
  );
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>('');

  const handleSpecialtyToggle = (specialtyName: string) => {
    setSelectedSpecialties(prev => {
      const newSpecialties = prev.includes(specialtyName)
        ? prev.filter(name => name !== specialtyName)
        : [...prev, specialtyName];
      return newSpecialties;
    });
  };

  const handleFindDoctors = () => {
    // Find doctors based on selected specialties
    let recommended = mockDoctors.filter(doctor =>
      selectedSpecialties.includes(doctor.specialty.name)
    );

    // If no specific match, show all doctors
    if (recommended.length === 0) {
      recommended = [...mockDoctors];
    }

    // Sort by rating and experience
    recommended.sort((a, b) => (b.rating || 0) - (a.rating || 0));

    setRecommendedDoctors(recommended);
    setCurrentStep(2);
  };

  const handleBookWithDoctor = (doctorId: string) => {
    const doctor = recommendedDoctors.find(d => d.id === doctorId);
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

  const handleConfirmBooking = () => {
    if (!selectedDoctor || !selectedTime) return;

    // Navigate to confirmation page with booking details
    router.push({
      pathname: '/(root)/booking/confirmation',
      params: {
        doctorId: selectedDoctor.id,
        date: selectedDate.toISOString(),
        time: selectedTime
      }
    });
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

        <View className="flex-row flex-wrap">
          {mockSpecialties.map((specialty) => (
            <TouchableOpacity
              key={specialty.id}
              onPress={() => handleSpecialtyToggle(specialty.name)}
              className="w-1/2 mb-3 pr-2"
            >
              <SpecialtyCard
                specialty={specialty}
                variant="grid"
                selected={selectedSpecialties.includes(specialty.name)}
                onPress={() => handleSpecialtyToggle(specialty.name)}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Selected Count */}
        {selectedSpecialties.length > 0 && (
          <View className="mt-4 p-3 bg-primary-50 rounded-xl">
            <Text className="text-sm font-rubik text-primary-600 text-center">
              เลือกแล้ว {selectedSpecialties.length} แผนก: {selectedSpecialties.join(', ')}
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
          disabled={selectedSpecialties.length === 0}
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
        {recommendedDoctors.map((doctor, index) => (
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
        ))}
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
                {selectedDoctor ? `${selectedDoctor.user.firstName} ${selectedDoctor.user.lastName}` : '-'}
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
          title="ดำเนินการต่อ"
          onPress={handleConfirmBooking}
          disabled={!selectedTime}
          variant="primary"
          size="lg"
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