import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  color?: string;
  message?: string;
  overlay?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'large',
  color = '#0891b2',
  message,
  overlay = false,
}) => {
  const containerClasses = overlay
    ? 'absolute inset-0 bg-black/20 flex-1 justify-center items-center z-50'
    : 'flex-1 justify-center items-center py-8';

  return (
    <View className={containerClasses}>
      <ActivityIndicator size={size} color={color} />
      {message && (
        <Text className="text-center text-secondary-600 font-rubik mt-2">
          {message}
        </Text>
      )}
    </View>
  );
};

export default LoadingSpinner;