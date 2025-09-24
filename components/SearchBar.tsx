import React from 'react';
import { View, TextInput, TouchableOpacity, Image } from 'react-native';
import icons from '@/constants/icons';

interface SearchBarProps {
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  onFilterPress?: () => void;
  showFilter?: boolean;
  style?: any;
}

export const SearchBar = ({
  placeholder = "ค้นหาแพทย์...",
  value,
  onChangeText,
  onFilterPress,
  showFilter = true,
  style
}: SearchBarProps) => {
  return (
    <View className={`flex-row items-center bg-white border border-secondary-200 rounded-xl px-4 py-3 ${style || ''}`}>
      <Image
        source={icons.search}
        className="size-5 mr-3"
        tintColor="#94a3b8"
      />

      <TextInput
        className="flex-1 text-base font-rubik text-text-primary"
        placeholder={placeholder}
        placeholderTextColor="#94a3b8"
        value={value}
        onChangeText={onChangeText}
        autoCorrect={false}
        autoCapitalize="none"
      />

      {value.length > 0 && (
        <TouchableOpacity
          onPress={() => onChangeText('')}
          className="mr-3"
        >
          <Image
            source={icons.close}
            className="size-4"
            tintColor="#94a3b8"
          />
        </TouchableOpacity>
      )}

      {showFilter && onFilterPress && (
        <TouchableOpacity
          onPress={onFilterPress}
          className="p-1"
        >
          <Image
            source={icons.filter}
            className="size-5"
            tintColor="#64748b"
          />
        </TouchableOpacity>
      )}
    </View>
  );
};