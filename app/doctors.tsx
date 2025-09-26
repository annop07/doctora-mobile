import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import {
  Header,
  SearchBar,
  FilterSheet,
  DoctorCard,
  SpecialtyCard,
  EmptyState,
  DoctorCardSkeleton,
} from "@/components";
import { useDoctors, useDoctorsInfinite, useSpecialtiesWithCount } from "@/services/medical/hooks";
import { Doctor } from "@/types/medical";
import icons from "@/constants/icons";

type SortOption =
  | "rating"
  | "price_low"
  | "price_high"
  | "experience"
  | "availability";

export default function DoctorList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("rating");
  const [useInfiniteScroll, setUseInfiniteScroll] = useState(false); // Toggle for pagination type

  // Filter states
  const [minFee, setMinFee] = useState(0);
  const [maxFee, setMaxFee] = useState(10000);
  const [minRating, setMinRating] = useState(0);
  const [experienceYears, setExperienceYears] = useState(0);

  // API calls - Regular pagination
  const {
    data: doctorsResponse,
    isLoading: doctorsLoading,
    error: doctorsError
  } = useDoctors({
    specialtyId: selectedSpecialty || undefined,
    query: searchQuery.trim() || undefined,
    sortBy: sortBy === 'rating' ? 'rating' :
           sortBy === 'price_low' ? 'consultationFee' :
           sortBy === 'price_high' ? 'consultationFee' :
           sortBy === 'experience' ? 'experienceYears' : undefined,
    sortOrder: sortBy === 'price_low' ? 'asc' : 'desc',
    minRating,
    maxFee: maxFee < 10000 ? maxFee : undefined,
    page: 0,
    size: 10
  });

  // API calls - Infinite scroll pagination
  const {
    data: infiniteData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: infiniteLoading,
    error: infiniteError,
    refetch: refetchInfinite
  } = useDoctorsInfinite({
    specialtyId: selectedSpecialty || undefined,
    query: searchQuery.trim() || undefined,
    sortBy: sortBy === 'rating' ? 'rating' :
           sortBy === 'price_low' ? 'consultationFee' :
           sortBy === 'price_high' ? 'consultationFee' :
           sortBy === 'experience' ? 'experienceYears' : undefined,
    sortOrder: sortBy === 'price_low' ? 'asc' : 'desc',
    minRating,
    maxFee: maxFee < 10000 ? maxFee : undefined
  });

  const {
    data: specialtiesWithCount,
    isLoading: specialtiesLoading,
    error: specialtiesError
  } = useSpecialtiesWithCount();

  // Get doctors from API response based on pagination type
  const doctors = useInfiniteScroll
    ? (infiniteData?.pages.flatMap(page => page.doctors) || [])
    : (doctorsResponse?.doctors || []);
  const isLoading = (useInfiniteScroll ? infiniteLoading : doctorsLoading) || specialtiesLoading;
  const error = useInfiniteScroll ? infiniteError : doctorsError;
  const totalItems = useInfiniteScroll
    ? (infiniteData?.pages[0]?.doctors.length || 0)
    : (doctorsResponse?.totalItems || 0);


  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // API will automatically refetch with new query
  };

  const handleSpecialtySelect = (specialtyId: string | null) => {
    setSelectedSpecialty(specialtyId);
    // API will automatically refetch with new specialty filter
  };

  const handleDoctorPress = (doctorId: string) => {
    router.push(`/(root)/doctors/${doctorId}`);
  };

  const handleSort = (option: SortOption) => {
    setSortBy(option);
    // API will automatically refetch with new sort option
  };

  const handleApplyFilters = () => {
    setShowFilterSheet(false);
    // API will automatically refetch with new filters
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedSpecialty(null);
    setMinFee(0);
    setMaxFee(10000);
    setMinRating(0);
    setExperienceYears(0);
    setSortBy("rating");
    // API will automatically refetch with cleared filters
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedSpecialty(null);
    // API will automatically refetch
  };

  const getSortDisplayName = (option: SortOption): string => {
    switch (option) {
      case "rating":
        return "คะแนนสูงสุด";
      case "price_low":
        return "ราคาต่ำสุด";
      case "price_high":
        return "ราคาสูงสุด";
      case "experience":
        return "ประสบการณ์สูงสุด";
      case "availability":
        return "ว่างเร็วสุด";
      default:
        return "คะแนนสูงสุด";
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
              {(["rating", "price_low", "experience"] as SortOption[]).map(
                (option) => (
                  <TouchableOpacity
                    key={option}
                    onPress={() => handleSort(option)}
                    className={`px-3 py-1 rounded-full border ${
                      sortBy === option
                        ? "bg-primary-600 border-primary-600"
                        : "bg-white border-secondary-200"
                    }`}
                  >
                    <Text
                      className={`text-xs font-rubik-medium ${
                        sortBy === option ? "text-white" : "text-secondary-600"
                      }`}
                    >
                      {getSortDisplayName(option)}
                    </Text>
                  </TouchableOpacity>
                )
              )}
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
                  ? "bg-primary-600 border-primary-600"
                  : "bg-white border-secondary-200"
              }`}
            >
              <Text
                className={`text-sm font-rubik-medium ${
                  selectedSpecialty === null
                    ? "text-white"
                    : "text-text-primary"
                }`}
              >
                ทั้งหมด ({totalItems})
              </Text>
            </TouchableOpacity>

            {/* Specialty Options */}
            {specialtiesError ? (
              <Text className="text-sm font-rubik text-red-600 px-3 py-2">
                ไม่สามารถโหลดแผนกได้
              </Text>
            ) : (
              (specialtiesWithCount || []).map((specialty) => (
                <SpecialtyCard
                  key={specialty.id}
                  specialty={specialty}
                  selected={selectedSpecialty === specialty.id}
                  doctorCount={specialty.doctorCount}
                  variant="chip"
                  onPress={() => handleSpecialtySelect(specialty.id)}
                />
              ))
            )}
          </ScrollView>
        </View>

        {/* Results Header */}
        <View className="bg-white px-5 py-4 border-b border-secondary-100">
          <View className="flex-row items-center justify-between">
            <Text className="text-lg font-rubik-semiBold text-text-primary">
              ผลการค้นหา ({doctors.length} คน)
            </Text>
            {(searchQuery ||
              selectedSpecialty ||
              minFee > 0 ||
              maxFee < 10000 ||
              minRating > 0 ||
              experienceYears > 0) && (
              <TouchableOpacity onPress={clearFilters}>
                <Text className="text-sm font-rubik-medium text-primary-600">
                  ล้างตัวกรอง
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>


        {/* Pagination Type Toggle - สำหรับ Demo */}
        {(!searchQuery && !selectedSpecialty) && (
          <View className="bg-white px-5 py-4 border-b border-secondary-100">
            <Text className="text-base font-rubik-semiBold text-text-primary mb-3">
              รูปแบบการโหลดข้อมูล
            </Text>
            <View className="flex-row space-x-3">
              <TouchableOpacity
                onPress={() => setUseInfiniteScroll(false)}
                className={`flex-1 px-4 py-3 rounded-xl border ${
                  !useInfiniteScroll
                    ? 'bg-primary-600 border-primary-600'
                    : 'bg-white border-secondary-200'
                }`}
              >
                <Text
                  className={`text-sm font-rubik-medium text-center ${
                    !useInfiniteScroll ? 'text-white' : 'text-text-primary'
                  }`}
                >
                  หน้าธรรมดา
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setUseInfiniteScroll(true)}
                className={`flex-1 px-4 py-3 rounded-xl border ${
                  useInfiniteScroll
                    ? 'bg-primary-600 border-primary-600'
                    : 'bg-white border-secondary-200'
                }`}
              >
                <Text
                  className={`text-sm font-rubik-medium text-center ${
                    useInfiniteScroll ? 'text-white' : 'text-text-primary'
                  }`}
                >
                  โหลดต่อเนื่อง
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Search Results */}
        <View className="px-5 py-2">
          {error ? (
            // Error state
            <EmptyState
              icon={icons.search}
              title="เกิดข้อผิดพลาด"
              description="ไม่สามารถโหลดข้อมูลแพทย์ได้ กรุณาลองใหม่อีกครั้ง"
              actionText="ลองใหม่"
              onActionPress={() => {
                if (useInfiniteScroll) {
                  refetchInfinite();
                } else {
                  // Clear filters to trigger refetch
                  setSearchQuery("");
                  setSelectedSpecialty(null);
                }
              }}
            />
          ) : isLoading && doctors.length === 0 ? (
            // Loading skeletons
            Array.from({ length: 3 }, (_, index) => (
              <DoctorCardSkeleton key={index} />
            ))
          ) : doctors.length > 0 ? (
            <>
              {doctors.map((doctor) => (
                <DoctorCard
                  key={doctor.id}
                  doctor={doctor}
                  variant="list"
                  onPress={() => handleDoctorPress(doctor.id)}
                />
              ))}

              {/* Load More Button - สำหรับ Infinite Scroll */}
              {useInfiniteScroll && hasNextPage && (
                <View className="items-center py-4">
                  <TouchableOpacity
                    onPress={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                    className={`px-6 py-3 rounded-xl border ${
                      isFetchingNextPage
                        ? 'bg-secondary-100 border-secondary-200'
                        : 'bg-primary-600 border-primary-600'
                    }`}
                  >
                    {isFetchingNextPage ? (
                      <View className="flex-row items-center space-x-2">
                        <ActivityIndicator size="small" color="#666" />
                        <Text className="text-sm font-rubik-medium text-secondary-600">
                          กำลังโหลด...
                        </Text>
                      </View>
                    ) : (
                      <Text className="text-base font-rubik-medium text-white">
                        โหลดเพิ่มเติม
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </>
          ) : searchQuery || selectedSpecialty ? (
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
        selectedSpecialty={selectedSpecialty || ""}
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
