import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  Header,
  SearchBar,
  FilterSheet,
  DoctorCard,
  SpecialtyCard,
  EmptyState,
  DoctorCardSkeleton
} from '@/components';
import {
  mockDoctors,
  getSpecialtyWithDoctorCount,
  getDoctorsBySpecialty,
  Doctor
} from '@/constants/mockMedicalData';
import icons from '@/constants/icons';

type SortOption = 'rating' | 'price_low' | 'price_high' | 'experience' | 'availability';

export default function DoctorList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>(mockDoctors);
  const [isLoading] = useState(false);
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('rating');

  // Filter states
  const [minFee, setMinFee] = useState(0);
  const [maxFee, setMaxFee] = useState(10000);
  const [minRating, setMinRating] = useState(0);
  const [experienceYears, setExperienceYears] = useState(0);

  const specialtiesWithCount = getSpecialtyWithDoctorCount();

  // Mock recent doctors (in real app would come from user's history)
  const recentDoctors = mockDoctors.slice(0, 2);

  // Mock favorite doctors (in real app would come from user's favorites)
  const favoriteDoctors = mockDoctors.slice(1, 3);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    filterAndSortDoctors(query, selectedSpecialty);
  };

  const handleSpecialtySelect = (specialtyId: string | null) => {
    setSelectedSpecialty(specialtyId);
    filterAndSortDoctors(searchQuery, specialtyId);
  };

  const filterAndSortDoctors = (query: string, specialtyId: string | null) => {
    let filteredDoctors = mockDoctors;

    // Filter by specialty
    if (specialtyId) {
      filteredDoctors = getDoctorsBySpecialty(specialtyId);
    }

    // Filter by search query
    if (query.trim()) {
      filteredDoctors = filteredDoctors.filter(doctor =>
        `${doctor.user.firstName} ${doctor.user.lastName}`.toLowerCase().includes(query.toLowerCase()) ||
        doctor.specialty.name.toLowerCase().includes(query.toLowerCase())
      );
    }

    // Apply advanced filters
    filteredDoctors = filteredDoctors.filter(doctor => {
      const feeMatch = doctor.consultationFee >= minFee && doctor.consultationFee <= maxFee;
      const ratingMatch = (doctor.rating || 0) >= minRating;
      const experienceMatch = doctor.experienceYears >= experienceYears;
      return feeMatch && ratingMatch && experienceMatch;
    });

    // Sort doctors
    filteredDoctors = sortDoctors(filteredDoctors, sortBy);

    setDoctors(filteredDoctors);
  };

  const sortDoctors = (doctorList: Doctor[], sortOption: SortOption): Doctor[] => {
    const sorted = [...doctorList];

    switch (sortOption) {
      case 'rating':
        return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case 'price_low':
        return sorted.sort((a, b) => a.consultationFee - b.consultationFee);
      case 'price_high':
        return sorted.sort((a, b) => b.consultationFee - a.consultationFee);
      case 'experience':
        return sorted.sort((a, b) => b.experienceYears - a.experienceYears);
      case 'availability':
        // Mock availability sorting - in real app would check actual availability
        return sorted.sort((a, b) => a.user.firstName.localeCompare(b.user.firstName));
      default:
        return sorted;
    }
  };

  const handleDoctorPress = (doctorId: string) => {
    router.push(`/(root)/doctors/${doctorId}`);
  };

  const handleSort = (option: SortOption) => {
    setSortBy(option);
    filterAndSortDoctors(searchQuery, selectedSpecialty);
  };

  const handleApplyFilters = () => {
    setShowFilterSheet(false);
    filterAndSortDoctors(searchQuery, selectedSpecialty);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedSpecialty(null);
    setMinFee(0);
    setMaxFee(10000);
    setMinRating(0);
    setExperienceYears(0);
    setSortBy('rating');
    setDoctors(mockDoctors);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedSpecialty(null);
    setDoctors(mockDoctors);
  };

  const getSortDisplayName = (option: SortOption): string => {
    switch (option) {
      case 'rating': return 'คะแนนสูงสุด';
      case 'price_low': return 'ราคาต่ำสุด';
      case 'price_high': return 'ราคาสูงสุด';
      case 'experience': return 'ประสบการณ์สูงสุด';
      case 'availability': return 'ว่างเร็วสุด';
      default: return 'คะแนนสูงสุด';
    }
  };

  return (
    <SafeAreaView className="bg-background-secondary h-full">
      <Header
        title="หาแพทย์"
        subtitle="ค้นหาและเลือกแพทย์ที่ตรงกับความต้องการ"
        showBackButton={true}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* Search and Filters */}
        <View className="bg-white px-5 py-4 border-b border-secondary-100">
          <SearchBar
            value={searchQuery}
            onChangeText={handleSearch}
            placeholder="ค้นหาแพทย์หรือแผนก..."
            onFilterPress={() => setShowFilterSheet(true)}
          />
        </View>

        {/* Sort and Specialty Filters */}
        <View className="bg-white px-5 py-4 border-b border-secondary-100">
          {/* Sort Options */}
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-base font-rubik-semiBold text-text-primary">
              เรียงตาม: {getSortDisplayName(sortBy)}
            </Text>
            <View className="flex-row space-x-2">
              {(['rating', 'price_low', 'experience'] as SortOption[]).map((option) => (
                <TouchableOpacity
                  key={option}
                  onPress={() => handleSort(option)}
                  className={`px-3 py-1 rounded-full border ${
                    sortBy === option
                      ? 'bg-primary-600 border-primary-600'
                      : 'bg-white border-secondary-200'
                  }`}
                >
                  <Text
                    className={`text-xs font-rubik-medium ${
                      sortBy === option ? 'text-white' : 'text-secondary-600'
                    }`}
                  >
                    {getSortDisplayName(option)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Specialty Filter */}
          <Text className="text-base font-rubik-semiBold text-text-primary mb-3">
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
        <View className="bg-white px-5 py-4 border-b border-secondary-100">
          <View className="flex-row items-center justify-between">
            <Text className="text-lg font-rubik-semiBold text-text-primary">
              ผลการค้นหา ({doctors.length} คน)
            </Text>
            {(searchQuery || selectedSpecialty || minFee > 0 || maxFee < 10000 || minRating > 0 || experienceYears > 0) && (
              <TouchableOpacity onPress={clearFilters}>
                <Text className="text-sm font-rubik-medium text-primary-600">
                  ล้างตัวกรอง
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Recent & Favorites - Show only when no search/filter active */}
        {!searchQuery && !selectedSpecialty && (
          <>
            {/* Recent Doctors */}
            {recentDoctors.length > 0 && (
              <View className="bg-white px-5 py-4 mb-4">
                <View className="flex-row items-center justify-between mb-4">
                  <Text className="text-lg font-rubik-semiBold text-text-primary">
                    แพทย์ที่เพิ่งดู
                  </Text>
                  <TouchableOpacity>
                    <Text className="text-sm font-rubik-medium text-primary-600">
                      ดูทั้งหมด
                    </Text>
                  </TouchableOpacity>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {recentDoctors.map((doctor, index) => (
                    <View
                      key={doctor.id}
                      className="mr-4"
                      style={{ width: 280 }}
                    >
                      <DoctorCard
                        doctor={doctor}
                        variant="list"
                        onPress={() => handleDoctorPress(doctor.id)}
                      />
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Favorite Doctors */}
            {favoriteDoctors.length > 0 && (
              <View className="bg-white px-5 py-4 mb-4">
                <View className="flex-row items-center justify-between mb-4">
                  <Text className="text-lg font-rubik-semiBold text-text-primary">
                    แพทย์ที่ชื่นชอบ
                  </Text>
                  <TouchableOpacity>
                    <Text className="text-sm font-rubik-medium text-primary-600">
                      จัดการ
                    </Text>
                  </TouchableOpacity>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {favoriteDoctors.map((doctor, index) => (
                    <View
                      key={doctor.id}
                      className="mr-4"
                      style={{ width: 280 }}
                    >
                      <DoctorCard
                        doctor={doctor}
                        variant="list"
                        onPress={() => handleDoctorPress(doctor.id)}
                      />
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Quick Specialty Access */}
            <View className="bg-white px-5 py-4 mb-4">
              <Text className="text-lg font-rubik-semiBold text-text-primary mb-4">
                เข้าถึงแผนกยอดนิยม
              </Text>

              <View className="flex-row flex-wrap">
                {specialtiesWithCount.slice(0, 6).map((specialty) => (
                  <TouchableOpacity
                    key={specialty.id}
                    onPress={() => handleSpecialtySelect(specialty.id)}
                    className="w-1/2 mb-3 pr-2"
                  >
                    <SpecialtyCard
                      specialty={specialty}
                      variant="grid"
                      selected={false}
                      doctorCount={specialty.doctorCount}
                      onPress={() => handleSpecialtySelect(specialty.id)}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </>
        )}

        {/* Search Results */}
        <View className="px-5 py-2">
          {isLoading ? (
            // Loading skeletons
            Array.from({ length: 3 }, (_, index) => (
              <DoctorCardSkeleton key={index} />
            ))
          ) : doctors.length > 0 ? (
            doctors.map((doctor) => (
              <DoctorCard
                key={doctor.id}
                doctor={doctor}
                variant="list"
                onPress={() => handleDoctorPress(doctor.id)}
              />
            ))
          ) : (searchQuery || selectedSpecialty) ? (
            <EmptyState
              icon={icons.search}
              title="ไม่พบแพทย์ที่ตรงกับเงื่อนไข"
              description="ลองเปลี่ยนคำค้นหาหรือปรับตัวกรองใหม่"
              actionText="ดูแพทย์ทั้งหมด"
              onActionPress={clearFilters}
            />
          ) : null}
        </View>
      </ScrollView>

      {/* Filter Sheet */}
      <FilterSheet
        isVisible={showFilterSheet}
        onClose={() => setShowFilterSheet(false)}
        selectedSpecialty={selectedSpecialty || ''}
        onSpecialtySelect={(specialty) => setSelectedSpecialty(specialty)}
        minFee={minFee}
        maxFee={maxFee}
        onFeeChange={(min, max) => {
          setMinFee(min);
          setMaxFee(max);
        }}
        minRating={minRating}
        onRatingChange={setMinRating}
        experienceYears={experienceYears}
        onExperienceChange={setExperienceYears}
        onApplyFilters={handleApplyFilters}
        onClearFilters={handleClearFilters}
      />
    </SafeAreaView>
  );
}