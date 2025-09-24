import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Button } from '@/components/ui';
import icons from '@/constants/icons';

interface EmptyStateProps {
  icon?: any;
  title: string;
  description: string;
  actionText?: string;
  onActionPress?: () => void;
  secondaryActionText?: string;
  onSecondaryActionPress?: () => void;
  style?: any;
}

export const EmptyState = ({
  icon = icons.search,
  title,
  description,
  actionText,
  onActionPress,
  secondaryActionText,
  onSecondaryActionPress,
  style
}: EmptyStateProps) => {
  return (
    <View className={`items-center justify-center py-12 px-8 ${style || ''}`}>
      <View className="bg-white rounded-xl p-8 w-full items-center">
        <View className="w-16 h-16 bg-secondary-100 rounded-full items-center justify-center mb-4">
          <Image
            source={icon}
            className="size-8"
            tintColor="#94a3b8"
          />
        </View>

        <Text className="text-lg font-rubik-semiBold text-text-primary text-center mb-2">
          {title}
        </Text>

        <Text className="text-base font-rubik text-secondary-600 text-center mb-6 leading-6">
          {description}
        </Text>

        {actionText && onActionPress && (
          <View className="w-full space-y-3">
            <Button
              title={actionText}
              onPress={onActionPress}
              variant="primary"
              size="lg"
            />

            {secondaryActionText && onSecondaryActionPress && (
              <Button
                title={secondaryActionText}
                onPress={onSecondaryActionPress}
                variant="outline"
                size="lg"
              />
            )}
          </View>
        )}
      </View>
    </View>
  );
};