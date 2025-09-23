import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { DoctorCard } from '@/components/Cards';
import { SpecialtyCard } from '@/components/SpecialtyCard';
import { mockDoctors, getSpecialtyWithDoctorCount, getDoctorsBySpecialty } from '@/constants/mockMedicalData';
import { Doctor } from '@/types/medical';
import icons from '@/constants/icons';

export default function Explore() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>(mockDoctors);

  const specialtiesWithCount = getSpecialtyWithDoctorCount();

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    filterDoctors(query, selectedSpecialty);
  };

  const handleSpecialtySelect = (specialtyId: string | null) => {
    setSelectedSpecialty(specialtyId);
    filterDoctors(searchQuery, specialtyId);
  };

  const filterDoctors = (query: string, specialtyId: string | null) => {
    let filteredDoctors = mockDoctors;

    // Filter by specialty
    if (specialtyId) {
      filteredDoctors = getDoctorsBySpecialty(specialtyId);
    }

    // Filter by search query
    if (query) {
      filteredDoctors = filteredDoctors.filter(doctor =>
        `${doctor.user.firstName} ${doctor.user.lastName}`.toLowerCase().includes(query.toLowerCase()) ||
        doctor.specialty.name.toLowerCase().includes(query.toLowerCase())
      );
    }

    setDoctors(filteredDoctors);
  };

  const handleDoctorPress = (doctorId: string) => {
    router.push(`/(root)/doctors/${doctorId}`);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedSpecialty(null);
    setDoctors(mockDoctors);
  };

  return (
    <SafeAreaView className="bg-background-secondary h-full">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* Header */}
        <View className="px-5 py-4 bg-white border-b border-secondary-200">
          <Text className="text-2xl font-rubik-bold text-text-primary mb-2">
            ค้นหาแพทย์
          </Text>
          <Text className="text-base font-rubik text-secondary-600">
            ค้นหาแพทย์ที่ตรงกับความต้องการของคุณ
          </Text>
        </View>

        {/* Search Bar */}
        <View className="px-5 py-4 bg-white">
          <View className="flex-row items-center bg-secondary-50 rounded-xl px-4 py-3 border border-secondary-200">
            <Image source={icons.search} className="size-5 mr-3" tintColor="#64748b" />
            <TextInput
              value={searchQuery}
              onChangeText={handleSearch}
              placeholder="ค้นหาชื่อแพทย์หรือแผนก..."
              placeholderTextColor="#94a3b8"
              className="flex-1 text-base font-rubik text-text-primary"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => handleSearch('')}>
                <Text className="text-secondary-500 ml-2">✕</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Specialty Filter */}
        <View className="bg-white px-5 py-4 border-b border-secondary-100">
          <Text className="text-lg font-rubik-semiBold text-text-primary mb-3">
            เลือกแผนก
          </Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {/* All Option */}
            <TouchableOpacity
              onPress={() => handleSpecialtySelect(null)}
              className={`px-4 py-2 rounded-full border mr-3 ${
                selectedSpecialty === null
                  ? 'bg-primary-600 border-primary-600'
                  : 'bg-white border-secondary-200'
              }`}
            >
              <Text
                className={`text-sm font-rubik-medium ${
                  selectedSpecialty === null ? 'text-white' : 'text-text-primary'
                }`}
              >
                ทั้งหมด ({mockDoctors.length})
              </Text>
            </TouchableOpacity>

            {/* Specialty Options */}
            {specialtiesWithCount.map((specialty) => (
              <SpecialtyCard
                key={specialty.id}
                specialty={specialty}
                selected={selectedSpecialty === specialty.id}
                doctorCount={specialty.doctorCount}
                variant="chip"
                onPress={() => handleSpecialtySelect(specialty.id)}
              />
            ))}
          </ScrollView>
        </View>

        {/* Results Header */}
        <View className="px-5 py-4 bg-white border-b border-secondary-100">
          <View className="flex-row items-center justify-between">
            <Text className="text-lg font-rubik-semiBold text-text-primary">
              ผลการค้นหา ({doctors.length} คน)
            </Text>
            {(searchQuery || selectedSpecialty) && (
              <TouchableOpacity onPress={clearFilters}>
                <Text className="text-sm font-rubik-medium text-primary-600">
                  ล้างตัวกรอง
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Results */}
        <View className="px-5 py-2">
          {doctors.length > 0 ? (
            doctors.map((doctor) => (
              <DoctorCard
                key={doctor.id}
                doctor={doctor}
                variant="list"
                onPress={() => handleDoctorPress(doctor.id)}
              />
            ))
          ) : (
            <View className="items-center py-12">
              <Text className="text-lg font-rubik-semiBold text-text-primary mb-2">
                ไม่พบแพทย์ที่ตรงกับเงื่อนไข
              </Text>
              <Text className="text-base font-rubik text-secondary-600 text-center">
                ลองเปลี่ยนคำค้นหาหรือเลือกแผนกอื่น
              </Text>
              <TouchableOpacity
                onPress={clearFilters}
                className="mt-4 px-6 py-2 bg-primary-600 rounded-full"
              >
                <Text className="text-sm font-rubik-medium text-white">
                  ดูแพทย์ทั้งหมด
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}