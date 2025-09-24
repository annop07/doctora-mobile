import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui';
import { SpecialtyCard } from '@/components/SpecialtyCard';
import { mockSpecialties } from '@/constants/mockMedicalData';

interface FilterSheetProps {
  isVisible: boolean;
  onClose: () => void;
  selectedSpecialty: string;
  onSpecialtySelect: (specialty: string) => void;
  minFee: number;
  maxFee: number;
  onFeeChange: (min: number, max: number) => void;
  minRating: number;
  onRatingChange: (rating: number) => void;
  experienceYears: number;
  onExperienceChange: (years: number) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
}

const feeRanges = [
  { label: 'ทั้งหมด', min: 0, max: 10000 },
  { label: '฿0 - ฿500', min: 0, max: 500 },
  { label: '฿500 - ฿1,000', min: 500, max: 1000 },
  { label: '฿1,000 - ฿2,000', min: 1000, max: 2000 },
  { label: '฿2,000+', min: 2000, max: 10000 }
];

const ratingOptions = [
  { label: 'ทั้งหมด', value: 0 },
  { label: '4.5+ ดาว', value: 4.5 },
  { label: '4.0+ ดาว', value: 4.0 },
  { label: '3.5+ ดาว', value: 3.5 },
  { label: '3.0+ ดาว', value: 3.0 }
];

const experienceOptions = [
  { label: 'ทั้งหมด', value: 0 },
  { label: '1+ ปี', value: 1 },
  { label: '3+ ปี', value: 3 },
  { label: '5+ ปี', value: 5 },
  { label: '10+ ปี', value: 10 }
];

export const FilterSheet = ({
  isVisible,
  onClose,
  selectedSpecialty,
  onSpecialtySelect,
  minFee,
  maxFee,
  onFeeChange,
  minRating,
  onRatingChange,
  experienceYears,
  onExperienceChange,
  onApplyFilters,
  onClearFilters
}: FilterSheetProps) => {
  const selectedFeeRange = feeRanges.find(range => range.min === minFee && range.max === maxFee);
  const selectedRating = ratingOptions.find(rating => rating.value === minRating);
  const selectedExperience = experienceOptions.find(exp => exp.value === experienceYears);

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView className="flex-1 bg-background-secondary">
        {/* Header */}
        <View className="bg-white px-5 py-4 border-b border-secondary-200">
          <View className="flex-row items-center justify-between">
            <Text className="text-xl font-rubik-bold text-text-primary">
              ตัวกรอง
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Text className="text-base font-rubik-medium text-primary-600">
                เสร็จ
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Specialty Filter */}
          <View className="bg-white px-5 py-6 mb-4">
            <Text className="text-lg font-rubik-semiBold text-text-primary mb-4">
              แผนกแพทย์
            </Text>

            <View className="flex-row flex-wrap">
              <TouchableOpacity
                onPress={() => onSpecialtySelect('')}
                className={`px-4 py-2 rounded-full border mr-2 mb-2 ${
                  selectedSpecialty === ''
                    ? 'bg-primary-600 border-primary-600'
                    : 'bg-white border-secondary-200'
                }`}
              >
                <Text
                  className={`text-sm font-rubik-medium ${
                    selectedSpecialty === ''
                      ? 'text-white'
                      : 'text-text-primary'
                  }`}
                >
                  ทั้งหมด
                </Text>
              </TouchableOpacity>

              {mockSpecialties.map((specialty) => (
                <TouchableOpacity
                  key={specialty.id}
                  onPress={() => onSpecialtySelect(specialty.name)}
                  className="mr-2 mb-2"
                >
                  <SpecialtyCard
                    specialty={specialty}
                    variant="chip"
                    isSelected={selectedSpecialty === specialty.name}
                    onPress={() => onSpecialtySelect(specialty.name)}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Fee Range Filter */}
          <View className="bg-white px-5 py-6 mb-4">
            <Text className="text-lg font-rubik-semiBold text-text-primary mb-4">
              ค่าตรวจ
            </Text>

            <View className="space-y-2">
              {feeRanges.map((range) => (
                <TouchableOpacity
                  key={range.label}
                  onPress={() => onFeeChange(range.min, range.max)}
                  className={`px-4 py-3 rounded-xl border ${
                    selectedFeeRange?.label === range.label
                      ? 'bg-primary-50 border-primary-600'
                      : 'bg-white border-secondary-200'
                  }`}
                >
                  <Text
                    className={`text-base font-rubik-medium ${
                      selectedFeeRange?.label === range.label
                        ? 'text-primary-600'
                        : 'text-text-primary'
                    }`}
                  >
                    {range.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Rating Filter */}
          <View className="bg-white px-5 py-6 mb-4">
            <Text className="text-lg font-rubik-semiBold text-text-primary mb-4">
              คะแนนรีวิว
            </Text>

            <View className="space-y-2">
              {ratingOptions.map((rating) => (
                <TouchableOpacity
                  key={rating.label}
                  onPress={() => onRatingChange(rating.value)}
                  className={`px-4 py-3 rounded-xl border ${
                    selectedRating?.value === rating.value
                      ? 'bg-primary-50 border-primary-600'
                      : 'bg-white border-secondary-200'
                  }`}
                >
                  <Text
                    className={`text-base font-rubik-medium ${
                      selectedRating?.value === rating.value
                        ? 'text-primary-600'
                        : 'text-text-primary'
                    }`}
                  >
                    {rating.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Experience Filter */}
          <View className="bg-white px-5 py-6 mb-4">
            <Text className="text-lg font-rubik-semiBold text-text-primary mb-4">
              ประสบการณ์
            </Text>

            <View className="space-y-2">
              {experienceOptions.map((experience) => (
                <TouchableOpacity
                  key={experience.label}
                  onPress={() => onExperienceChange(experience.value)}
                  className={`px-4 py-3 rounded-xl border ${
                    selectedExperience?.value === experience.value
                      ? 'bg-primary-50 border-primary-600'
                      : 'bg-white border-secondary-200'
                  }`}
                >
                  <Text
                    className={`text-base font-rubik-medium ${
                      selectedExperience?.value === experience.value
                        ? 'text-primary-600'
                        : 'text-text-primary'
                    }`}
                  >
                    {experience.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Bottom Spacing */}
          <View className="h-20" />
        </ScrollView>

        {/* Action Buttons */}
        <View className="bg-white border-t border-secondary-200 p-5">
          <View className="flex-row space-x-3">
            <Button
              title="ล้างตัวกรอง"
              onPress={onClearFilters}
              variant="outline"
              size="lg"
              style={{ flex: 1 }}
            />
            <Button
              title="ใช้ตัวกรอง"
              onPress={onApplyFilters}
              variant="primary"
              size="lg"
              style={{ flex: 1 }}
            />
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};