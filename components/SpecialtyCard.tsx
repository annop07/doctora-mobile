import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Specialty } from '@/types/medical';

interface SpecialtyCardProps {
  specialty: Specialty;
  onPress?: () => void;
  selected?: boolean;
  doctorCount?: number;
  variant?: 'grid' | 'chip';
}

const specialtyIcons: { [key: string]: string } = {
  'Internal Medicine': '🩺',
  'อายุรกรรม': '🩺',
  'Surgery': '🔪',
  'ศัลยกรรม': '🔪',
  'Pediatrics': '👶',
  'กุมารเวชกรรม': '👶',
  'Cardiology': '❤️',
  'โรคหัวใจ': '❤️',
  'Emergency Medicine': '🚑',
  'แพทย์ฉุกเฉิน': '🚑',
  'Dermatology': '🧴',
  'โรคผิวหนัง': '🧴',
  'Orthopedics': '🦴',
  'กระดูกและข้อ': '🦴',
  'Neurology': '🧠',
  'โรคระบบประสาท': '🧠',
  'Psychiatry': '🧘',
  'จิตเวชกรรม': '🧘'
};

export const SpecialtyCard: React.FC<SpecialtyCardProps> = ({
  specialty,
  onPress,
  selected = false,
  doctorCount,
  variant = 'grid'
}) => {
  const icon = specialtyIcons[specialty.name] || '🏥';

  if (variant === 'chip') {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        className={`px-4 py-2 rounded-full border mr-3 mb-2 ${
          selected
            ? 'bg-primary-600 border-primary-600'
            : 'bg-white border-secondary-200'
        }`}
      >
        <View className="flex-row items-center">
          <Text className="text-sm mr-2">{icon}</Text>
          <Text
            className={`text-sm font-rubik-medium ${
              selected ? 'text-white' : 'text-text-primary'
            }`}
          >
            {specialty.name}
          </Text>
          {doctorCount !== undefined && (
            <Text
              className={`text-xs font-rubik ml-2 ${
                selected ? 'text-white/80' : 'text-secondary-500'
              }`}
            >
              ({doctorCount})
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className={`w-full p-4 rounded-xl border-2 mb-3 ${
        selected
          ? 'bg-primary-50 border-primary-600'
          : 'bg-white border-secondary-200'
      }`}
    >
      <View className="flex-row items-center">
        {/* Icon Container */}
        <View
          className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${
            selected ? 'bg-primary-600' : 'bg-primary-50'
          }`}
        >
          <Text className="text-xl">{icon}</Text>
        </View>

        {/* Specialty Info */}
        <View className="flex-1">
          <Text
            className={`text-base font-rubik-semiBold ${
              selected ? 'text-primary-600' : 'text-text-primary'
            }`}
            numberOfLines={1}
          >
            {specialty.name}
          </Text>

          {specialty.description && (
            <Text
              className={`text-sm font-rubik mt-1 ${
                selected ? 'text-primary-500' : 'text-secondary-600'
              }`}
              numberOfLines={2}
            >
              {specialty.description}
            </Text>
          )}

          {/* Doctor Count */}
          {doctorCount !== undefined && (
            <View className="mt-2">
              <Text
                className={`text-xs font-rubik-medium ${
                  selected ? 'text-primary-600' : 'text-secondary-500'
                }`}
              >
                {doctorCount} แพทย์ที่มีอยู่
              </Text>
            </View>
          )}
        </View>

        {/* Selection Indicator */}
        {selected && (
          <View className="w-6 h-6 bg-primary-600 rounded-full items-center justify-center">
            <Text className="text-white text-xs font-bold">✓</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default SpecialtyCard;