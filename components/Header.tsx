import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { router } from 'expo-router';
import icons from '@/constants/icons';

interface HeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  rightComponent?: React.ReactNode;
  onBackPress?: () => void;
  style?: any;
}

export const Header = ({
  title,
  subtitle,
  showBackButton = false,
  rightComponent,
  onBackPress,
  style
}: HeaderProps) => {
  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  return (
    <View className={`bg-white px-5 py-4 border-b border-secondary-200 ${style || ''}`}>
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          {showBackButton && (
            <TouchableOpacity onPress={handleBackPress} className="mr-4">
              <Image source={icons.backArrow} className="size-6" tintColor="#64748b" />
            </TouchableOpacity>
          )}

          <View className="flex-1">
            <Text className="text-xl font-rubik-bold text-text-primary">
              {title}
            </Text>
            {subtitle && (
              <Text className="text-base font-rubik text-secondary-600 mt-1">
                {subtitle}
              </Text>
            )}
          </View>
        </View>

        {rightComponent && (
          <View className="ml-4">
            {rightComponent}
          </View>
        )}
      </View>
    </View>
  );
};