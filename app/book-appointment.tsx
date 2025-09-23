import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Button, Card, Input } from '@/components/ui';
import icons from '@/constants/icons';
import images from '@/constants/images';

// Medical specialties for doctor selection
const medicalSpecialties = [
  { id: 'internal', name: 'อายุรกรรม', icon: '🩺', description: 'โรคทั่วไป ไข้ ปวดหัว ปวดท้อง' },
  { id: 'cardiology', name: 'โรคหัวใจ', icon: '❤️', description: 'โรคหัวใจและหลอดเลือด' },
  { id: 'pediatrics', name: 'กุมารเวชกรรม', icon: '👶', description: 'แพทย์เด็ก อายุ 0-18 ปี' },
  { id: 'surgery', name: 'ศัลยกรรม', icon: '🔪', description: 'ผ่าตัด หัตถการต่างๆ' },
  { id: 'dermatology', name: 'โรคผิวหนัง', icon: '🧴', description: 'ผิวหนัง ผมและเล็บ' },
  { id: 'orthopedics', name: 'กระดูกและข้อ', icon: '🦴', description: 'กระดูก ข้อ กล้ามเนื้อ' },
  { id: 'neurology', name: 'โรคระบบประสาท', icon: '🧠', description: 'สมอง ประสาท ปวดศีรษะ' },
  { id: 'psychiatry', name: 'จิตเวชกรรม', icon: '🧘', description: 'สุขภาพจิต ความเครียด' }
];


const mockDoctors = [
  {
    id: '1',
    name: 'นพ.สมชาย ใจดี',
    specialty: 'อายุรกรรม',
    hospital: 'โรงพยาบาลสุขใจ',
    experience: '15 ปี',
    rating: 4.8,
    reviewCount: 256,
    price: 500,
    nextAvailable: '2024-01-20',
    image: images.avatar,
    matchScore: 95
  },
  {
    id: '2',
    name: 'นพ.วีรวัฒน์ สุขใส',
    specialty: 'โรคหัวใจ',
    hospital: 'โรงพยาบาลหัวใจแข็งแรง',
    experience: '12 ปี',
    rating: 4.9,
    reviewCount: 189,
    price: 800,
    nextAvailable: '2024-01-22',
    image: images.avatar,
    matchScore: 90
  },
  {
    id: '3',
    name: 'นพ.ดวงใจ รักษาดี',
    specialty: 'กุมารเวชกรรม',
    hospital: 'โรงพยาบาลเด็กแข็งแรง',
    experience: '8 ปี',
    rating: 4.7,
    reviewCount: 145,
    price: 450,
    nextAvailable: '2024-01-21',
    image: images.avatar,
    matchScore: 88
  }
];

export default function BookAppointment() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [recommendedDoctors, setRecommendedDoctors] = useState<typeof mockDoctors>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<typeof mockDoctors[0] | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');

  const handleSpecialtyToggle = (specialtyId: string) => {
    console.log('Specialty toggle clicked:', specialtyId);
    try {
      setSelectedSpecialties(prev => {
        const newSpecialties = prev.includes(specialtyId)
          ? prev.filter(id => id !== specialtyId)
          : [...prev, specialtyId];
        console.log('New specialties:', newSpecialties);
        return newSpecialties;
      });
    } catch (error) {
      console.error('Error in handleSpecialtyToggle:', error);
    }
  };

  const handleFindDoctors = () => {
    // Find doctors based on selected specialties
    const selectedSpecialtyNames = selectedSpecialties.map(specialtyId => {
      const specialty = medicalSpecialties.find(s => s.id === specialtyId);
      return specialty?.name;
    }).filter(Boolean);

    let recommended = mockDoctors.filter(doctor =>
      selectedSpecialtyNames.includes(doctor.specialty)
    );

    // If no specific match, show all doctors
    if (recommended.length === 0) {
      recommended = [...mockDoctors];
    }

    // Sort by match score and rating
    recommended.sort((a, b) => b.rating - a.rating);

    setRecommendedDoctors(recommended);
    setCurrentStep(2);
  };

  const handleBookWithDoctor = (doctorId: string) => {
    const doctor = recommendedDoctors.find(d => d.id === doctorId);
    if (doctor) {
      setSelectedDoctor(doctor);
      setCurrentStep(3);
    }
  };

  const handleManualSelection = () => {
    router.push('/doctors');
  };

  // Generate next 14 days for calendar
  const generateAvailableDates = () => {
    const dates = [];
    const today = new Date();

    for (let i = 1; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      // Skip Sundays (0) for this example
      if (date.getDay() !== 0) {
        dates.push({
          date: date.toISOString().split('T')[0],
          day: date.getDate(),
          month: date.getMonth(),
          dayName: date.toLocaleDateString('th-TH', { weekday: 'short' }),
          monthName: date.toLocaleDateString('th-TH', { month: 'short' })
        });
      }
    }
    return dates;
  };

  // Generate available time slots
  const generateTimeSlots = (): { time: string; available: boolean }[] => {
    const slots: { time: string; available: boolean }[] = [];
    const times = [
      '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
      '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
    ];

    times.forEach(time => {
      // Make all slots available
      const isAvailable = true;
      slots.push({ time, available: isAvailable });
    });

    return slots;
  };

  const handleConfirmBooking = () => {
    // Here you would normally send the booking to your API
    alert(`จองนัดหมายสำเร็จ!\n\nแพทย์: ${selectedDoctor?.name}\nวันที่: ${selectedDate}\nเวลา: ${selectedTime}`);
    router.replace('/(root)/(tabs)');
  };

  const availableDates = generateAvailableDates();
  const timeSlots = generateTimeSlots();

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

        {/* Grid Layout - 2 columns */}
        <View className="flex-row flex-wrap justify-between">
          {medicalSpecialties.map((specialty) => (
            <TouchableOpacity
              key={specialty.id}
              onPress={() => handleSpecialtyToggle(specialty.id)}
              activeOpacity={0.7}
              style={{
                width: '48%',
                marginBottom: 12,
                padding: 16,
                borderRadius: 16,
                borderWidth: 2,
                backgroundColor: selectedSpecialties.includes(specialty.id) ? '#0891b2' : '#ffffff',
                borderColor: selectedSpecialties.includes(specialty.id) ? '#0891b2' : '#e2e8f0',
                shadowColor: selectedSpecialties.includes(specialty.id) ? '#0891b2' : 'transparent',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 8,
                elevation: selectedSpecialties.includes(specialty.id) ? 6 : 0,
              }}
            >
              {/* Icon Badge */}
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 12,
                  backgroundColor: selectedSpecialties.includes(specialty.id)
                    ? 'rgba(255, 255, 255, 0.2)'
                    : '#f0f9ff'
                }}
              >
                <Text className="text-2xl">{specialty.icon}</Text>
              </View>

              {/* Specialty Name */}
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '600',
                  marginBottom: 8,
                  color: selectedSpecialties.includes(specialty.id) ? '#ffffff' : '#1f2937'
                }}
                numberOfLines={1}
              >
                {specialty.name}
              </Text>

              {/* Description */}
              <Text
                style={{
                  fontSize: 12,
                  lineHeight: 16,
                  color: selectedSpecialties.includes(specialty.id) ? '#ffffff' : '#6b7280',
                  opacity: selectedSpecialties.includes(specialty.id) ? 0.9 : 1
                }}
                numberOfLines={2}
              >
                {specialty.description}
              </Text>

              {/* Selected Indicator */}
              {selectedSpecialties.includes(specialty.id) && (
                <View style={{ position: 'absolute', top: 12, right: 12 }}>
                  <View style={{
                    width: 24,
                    height: 24,
                    backgroundColor: '#ffffff',
                    borderRadius: 12,
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Text style={{ color: '#0891b2', fontSize: 14, fontWeight: 'bold' }}>✓</Text>
                  </View>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Selected Count */}
        {selectedSpecialties.length > 0 && (
          <View className="mt-4 p-3 bg-primary-50 rounded-xl">
            <Text className="text-sm font-rubik text-primary-600 text-center">
              เลือกแล้ว {selectedSpecialties.length} แผนก: {' '}
              {selectedSpecialties.map(id => {
                const specialty = medicalSpecialties.find(s => s.id === id);
                return specialty?.name;
              }).join(', ')}
            </Text>
          </View>
        )}
      </View>

      {/* Preferred Date */}
      <View className="px-5 mb-6">
        <Text className="text-lg font-rubik-semiBold text-text-primary mb-4">
          เลือกวันที่ต้องการ
        </Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {availableDates.map((dateInfo, index) => (
            <TouchableOpacity
              key={dateInfo.date}
              onPress={() => setSelectedDate(dateInfo.date)}
              style={{
                marginRight: index < availableDates.length - 1 ? 12 : 0
              }}
            >
              <View
                className={`w-16 h-20 rounded-xl border items-center justify-center ${
                  selectedDate === dateInfo.date
                    ? 'bg-primary-600 border-primary-600'
                    : 'bg-white border-secondary-200'
                }`}
              >
                <Text
                  className={`text-xs font-rubik ${
                    selectedDate === dateInfo.date
                      ? 'text-white'
                      : 'text-secondary-600'
                  }`}
                >
                  {dateInfo.dayName}
                </Text>
                <Text
                  className={`text-lg font-rubik-bold mt-1 ${
                    selectedDate === dateInfo.date
                      ? 'text-white'
                      : 'text-text-primary'
                  }`}
                >
                  {dateInfo.day}
                </Text>
                <Text
                  className={`text-xs font-rubik ${
                    selectedDate === dateInfo.date
                      ? 'text-white'
                      : 'text-secondary-500'
                  }`}
                >
                  {dateInfo.monthName}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Time Selection */}
      {selectedDate && (
        <View className="px-5 mb-6">
          <Text className="text-lg font-rubik-semiBold text-text-primary mb-4">
            เลือกเวลาที่ต้องการ
          </Text>

          <View className="flex-row flex-wrap">
            {timeSlots.map((slot) => (
              <TouchableOpacity
                key={slot.time}
                onPress={() => slot.available && setSelectedTime(slot.time)}
                disabled={!slot.available}
                style={{
                  marginRight: 12,
                  marginBottom: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  borderRadius: 12,
                  borderWidth: 1,
                  backgroundColor: !slot.available
                    ? '#f1f5f9'
                    : selectedTime === slot.time
                      ? '#0891b2'
                      : '#ffffff',
                  borderColor: !slot.available
                    ? '#e2e8f0'
                    : selectedTime === slot.time
                      ? '#0891b2'
                      : '#e2e8f0',
                  opacity: !slot.available ? 0.5 : 1
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: '500',
                    color: !slot.available
                      ? '#9ca3af'
                      : selectedTime === slot.time
                        ? '#ffffff'
                        : '#6b7280'
                  }}
                >
                  {slot.time}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

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
          <Card key={doctor.id} variant="outlined" padding="md" margin="sm">
            <View className="flex-row">
              {/* Match Badge */}
              {index === 0 && (
                <View className="absolute -top-2 -right-2 bg-green-500 px-3 py-1 rounded-full z-10">
                  <Text className="text-xs font-rubik-semiBold text-white">
                    แนะนำ
                  </Text>
                </View>
              )}

              {/* Doctor Image */}
              <Image
                source={doctor.image}
                className="size-20 rounded-full"
                resizeMode="cover"
              />

              {/* Doctor Info */}
              <View className="flex-1 ml-4">
                <Text className="text-lg font-rubik-semiBold text-text-primary">
                  {doctor.name}
                </Text>
                <Text className="text-sm font-rubik text-secondary-600 mt-1">
                  {doctor.specialty}
                </Text>
                <Text className="text-xs font-rubik text-secondary-500 mt-1">
                  {doctor.hospital}
                </Text>

                {/* Match Score */}
                <View className="flex-row items-center mt-2">
                  <View className="bg-green-100 px-2 py-1 rounded">
                    <Text className="text-xs font-rubik-semiBold text-green-600">
                      ตรงกับอาการ {doctor.matchScore}%
                    </Text>
                  </View>
                </View>

                {/* Rating and Experience */}
                <View className="flex-row items-center mt-2">
                  <View className="flex-row items-center">
                    <Image source={icons.star} className="size-3 mr-1" />
                    <Text className="text-xs font-rubik text-secondary-600">
                      {doctor.rating} ({doctor.reviewCount} รีวิว)
                    </Text>
                  </View>
                  <Text className="text-xs font-rubik text-secondary-400 mx-2">•</Text>
                  <Text className="text-xs font-rubik text-secondary-600">
                    {doctor.experience}
                  </Text>
                </View>

                {/* Price and Availability */}
                <View className="flex-row items-center justify-between mt-3">
                  <View>
                    <Text className="text-sm font-rubik-semiBold text-primary-600">
                      ฿{doctor.price}
                    </Text>
                    <Text className="text-xs font-rubik text-secondary-500">
                      ว่าง: {doctor.nextAvailable}
                    </Text>
                  </View>

                  <Button
                    title="จองนัดหมาย"
                    size="sm"
                    variant={index === 0 ? "primary" : "outline"}
                    onPress={() => handleBookWithDoctor(doctor.id)}
                  />
                </View>
              </View>
            </View>
          </Card>
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
          <Text className="text-sm font-rubik text-primary-600">ขั้นตอนที่ 3</Text>
          <Text className="text-sm font-rubik text-secondary-500">จาก 3</Text>
        </View>
        <View className="h-2 bg-secondary-100 rounded-full">
          <View className="h-2 bg-primary-600 rounded-full" style={{ width: '100%' }} />
        </View>
      </View>

      {/* Selected Doctor Info */}
      {selectedDoctor && (
        <View className="px-5 mb-6">
          <Card variant="outlined" padding="md">
            <View className="flex-row items-center">
              <Image
                source={selectedDoctor.image}
                className="size-16 rounded-full"
                resizeMode="cover"
              />
              <View className="flex-1 ml-4">
                <Text className="text-lg font-rubik-semiBold text-text-primary">
                  {selectedDoctor.name}
                </Text>
                <Text className="text-sm font-rubik text-secondary-600">
                  {selectedDoctor.specialty}
                </Text>
                <Text className="text-sm font-rubik-semiBold text-primary-600 mt-1">
                  ฿{selectedDoctor.price}
                </Text>
              </View>
            </View>
          </Card>
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
                {selectedDoctor?.name}
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-sm font-rubik text-secondary-600">วันที่:</Text>
              <Text className="text-sm font-rubik-medium text-text-primary">
                {selectedDate ? new Date(selectedDate).toLocaleDateString('th-TH', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : '-'}
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
                ฿{selectedDoctor?.price}
              </Text>
            </View>
          </View>
        </Card>
      </View>

      {/* Action Buttons */}
      <View className="px-5 pb-8">
        <Button
          title="ยืนยันการจองนัดหมาย"
          onPress={handleConfirmBooking}
          disabled={!selectedDate || !selectedTime}
          variant="primary"
          size="lg"
        />

        <TouchableOpacity onPress={() => setCurrentStep(2)} className="mt-4">
          <Text className="text-center text-base font-rubik-medium text-primary-600">
            กลับไปเลือกแพทย์
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView className="bg-white h-full">
      {/* Header */}
      <View className="px-5 py-4 border-b border-secondary-100">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Image source={icons.backArrow} className="size-6" />
          </TouchableOpacity>
          <Text className="text-xl font-rubik-bold text-text-primary">
            จองนัดหมาย
          </Text>
        </View>
      </View>

      {currentStep === 1 ? renderStep1() : currentStep === 2 ? renderStep2() : renderStep3()}
    </SafeAreaView>
  );
}