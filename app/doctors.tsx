import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Input, Card, Button } from '@/components/ui';
import icons from '@/constants/icons';
import images from '@/constants/images';

// Mock data for development
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
    about: 'แพทย์ผู้เชี่ยวชาญด้านอายุรกรรม มีประสบการณ์การรักษาผู้ป่วยมากว่า 15 ปี'
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
    about: 'ผู้เชี่ยวชาญด้านโรคหัวใจและหลอดเลือด ได้รับการรับรองจากสมาคมแพทย์โรคหัวใจ'
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
    about: 'แพทย์เด็กที่มีประสบการณ์ดูแลเด็กทารกถึงวัยรุ่น'
  },
  {
    id: '4',
    name: 'นพ.สุขสันต์ ยิ้มใส',
    specialty: 'ศัลยกรรม',
    hospital: 'โรงพยาบาลศัลยกรรมชั้นนำ',
    experience: '20 ปี',
    rating: 4.9,
    reviewCount: 324,
    price: 1200,
    nextAvailable: '2024-01-25',
    image: images.avatar,
    about: 'ศัลยแพทย์ผู้เชี่ยวชาญด้านศัลยกรรมท่อง เฉพาะทาง มีประสบการณ์มากกว่า 20 ปี'
  }
];

const specialties = [
  { id: 'all', name: 'ทั้งหมด' },
  { id: 'internal', name: 'อายุรกรรม' },
  { id: 'cardiology', name: 'โรคหัวใจ' },
  { id: 'pediatrics', name: 'กุมารเวชกรรม' },
  { id: 'surgery', name: 'ศัลยกรรม' },
  { id: 'dermatology', name: 'ผิวหนัง' },
  { id: 'orthopedics', name: 'กระดูกและข้อ' }
];

export default function DoctorList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [doctors, setDoctors] = useState(mockDoctors);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    filterDoctors(query, selectedSpecialty);
  };

  const handleSpecialtyFilter = (specialtyId: string) => {
    setSelectedSpecialty(specialtyId);
    filterDoctors(searchQuery, specialtyId);
  };

  const filterDoctors = (query: string, specialty: string) => {
    let filtered = mockDoctors;

    // Filter by search query
    if (query.trim()) {
      filtered = filtered.filter(doctor =>
        doctor.name.toLowerCase().includes(query.toLowerCase()) ||
        doctor.specialty.toLowerCase().includes(query.toLowerCase()) ||
        doctor.hospital.toLowerCase().includes(query.toLowerCase())
      );
    }

    // Filter by specialty
    if (specialty !== 'all') {
      const specialtyMap: Record<string, string> = {
        'internal': 'อายุรกรรม',
        'cardiology': 'โรคหัวใจ',
        'pediatrics': 'กุมารเวชกรรม',
        'surgery': 'ศัลยกรรม',
        'dermatology': 'ผิวหนัง',
        'orthopedics': 'กระดูกและข้อ'
      };

      filtered = filtered.filter(doctor =>
        doctor.specialty === specialtyMap[specialty]
      );
    }

    setDoctors(filtered);
  };

  const handleBookAppointment = (doctorId: string) => {
    router.push(`/book-appointment?doctorId=${doctorId}`);
  };

  const handleDoctorPress = (doctorId: string) => {
    router.push(`/doctor-detail?id=${doctorId}`);
  };

  const renderDoctor = ({ item }: { item: typeof mockDoctors[0] }) => (
    <TouchableOpacity
      onPress={() => handleDoctorPress(item.id)}
      activeOpacity={0.8}
    >
      <Card variant="outlined" padding="md" margin="sm">
        <View className="flex-row">
          {/* Doctor Image */}
          <Image
            source={item.image}
            className="size-20 rounded-full"
            resizeMode="cover"
          />

          {/* Doctor Info */}
          <View className="flex-1 ml-4">
            <Text className="text-lg font-rubik-semiBold text-text-primary">
              {item.name}
            </Text>
            <Text className="text-sm font-rubik text-secondary-600 mt-1">
              {item.specialty}
            </Text>
            <Text className="text-xs font-rubik text-secondary-500 mt-1">
              {item.hospital}
            </Text>

            {/* Rating and Experience */}
            <View className="flex-row items-center mt-2">
              <View className="flex-row items-center">
                <Image source={icons.star} className="size-3 mr-1" />
                <Text className="text-xs font-rubik text-secondary-600">
                  {item.rating} ({item.reviewCount} รีวิว)
                </Text>
              </View>
              <Text className="text-xs font-rubik text-secondary-400 mx-2">•</Text>
              <Text className="text-xs font-rubik text-secondary-600">
                {item.experience}
              </Text>
            </View>

            {/* Price and Availability */}
            <View className="flex-row items-center justify-between mt-3">
              <View>
                <Text className="text-sm font-rubik-semiBold text-primary-600">
                  ฿{item.price}
                </Text>
                <Text className="text-xs font-rubik text-secondary-500">
                  ว่าง: {item.nextAvailable}
                </Text>
              </View>

              <Button
                title="จองนัด"
                size="sm"
                variant="primary"
                onPress={() => handleBookAppointment(item.id)}
              />
            </View>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
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
            หาแพทย์
          </Text>
        </View>
      </View>

      {/* Search */}
      <View className="px-5 py-4">
        <Input
          placeholder="ค้นหาแพทย์, แผนก, หรือโรงพยาบาล"
          value={searchQuery}
          onChangeText={handleSearch}
          leftIcon={icons.search}
        />
      </View>

      {/* Specialty Filter */}
      <View className="px-5 pb-4">
        <Text className="text-base font-rubik-medium text-text-primary mb-3">
          เลือกแผนก
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {specialties.map((specialty, index) => (
            <TouchableOpacity
              key={specialty.id}
              onPress={() => handleSpecialtyFilter(specialty.id)}
              style={{
                marginRight: index < specialties.length - 1 ? 12 : 0
              }}
            >
              <View
                className={`px-4 py-2 rounded-full border ${
                  selectedSpecialty === specialty.id
                    ? 'bg-primary-600 border-primary-600'
                    : 'bg-white border-secondary-200'
                }`}
              >
                <Text
                  className={`text-sm font-rubik-medium ${
                    selectedSpecialty === specialty.id
                      ? 'text-white'
                      : 'text-secondary-600'
                  }`}
                >
                  {specialty.name}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Results Count */}
      <View className="px-5 pb-2">
        <Text className="text-sm font-rubik text-secondary-600">
          พบ {doctors.length} แพทย์
        </Text>
      </View>

      {/* Doctor List */}
      <FlatList
        data={doctors}
        renderItem={renderDoctor}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
        ListEmptyComponent={
          <View className="items-center py-8">
            <Text className="text-base font-rubik text-secondary-600">
              ไม่พบแพทย์ที่ตรงกับการค้นหา
            </Text>
            <TouchableOpacity onPress={() => {
              setSearchQuery('');
              setSelectedSpecialty('all');
              setDoctors(mockDoctors);
            }} className="mt-2">
              <Text className="text-sm font-rubik-medium text-primary-600">
                แสดงทั้งหมด
              </Text>
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
}