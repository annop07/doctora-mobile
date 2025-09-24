import React, { useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';

interface LoadingSkeletonProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: any;
}

export const LoadingSkeleton = ({
  width = '100%',
  height = 20,
  borderRadius = 8,
  style
}: LoadingSkeletonProps) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ])
    );
    animation.start();

    return () => animation.stop();
  }, [animatedValue]);

  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['#e2e8f0', '#cbd5e1'],
  });

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          backgroundColor,
          borderRadius,
        },
        style,
      ]}
    />
  );
};

export const DoctorCardSkeleton = () => (
  <View className="bg-white rounded-xl p-4 mb-4 border border-secondary-100">
    <View className="flex-row">
      <LoadingSkeleton width={60} height={60} borderRadius={30} />

      <View className="flex-1 ml-4">
        <LoadingSkeleton width="70%" height={16} style={{ marginBottom: 8 }} />
        <LoadingSkeleton width="50%" height={14} style={{ marginBottom: 8 }} />
        <LoadingSkeleton width="40%" height={12} style={{ marginBottom: 8 }} />

        <View className="flex-row items-center mt-2">
          <LoadingSkeleton width={60} height={12} style={{ marginRight: 8 }} />
          <LoadingSkeleton width={80} height={12} />
        </View>
      </View>

      <View className="items-end">
        <LoadingSkeleton width={60} height={16} style={{ marginBottom: 8 }} />
        <LoadingSkeleton width={40} height={12} />
      </View>
    </View>
  </View>
);

export const AppointmentCardSkeleton = () => (
  <View className="bg-white rounded-xl p-4 mb-4 border border-secondary-100">
    <View className="flex-row items-center justify-between mb-3">
      <LoadingSkeleton width={80} height={20} borderRadius={10} />
      <LoadingSkeleton width={60} height={14} />
    </View>

    <View className="flex-row items-center mb-3">
      <LoadingSkeleton width={16} height={16} borderRadius={8} style={{ marginRight: 12 }} />
      <View className="flex-1">
        <LoadingSkeleton width="60%" height={14} style={{ marginBottom: 4 }} />
        <LoadingSkeleton width="40%" height={12} />
      </View>
    </View>

    <View className="flex-row items-center">
      <LoadingSkeleton width={16} height={16} borderRadius={8} style={{ marginRight: 12 }} />
      <LoadingSkeleton width="50%" height={14} />
    </View>
  </View>
);

export const SpecialtyCardSkeleton = () => (
  <View className="items-center p-4 bg-white rounded-xl border border-secondary-100 mr-3 mb-3" style={{ width: 100 }}>
    <LoadingSkeleton width={40} height={40} borderRadius={20} style={{ marginBottom: 8 }} />
    <LoadingSkeleton width="80%" height={12} style={{ marginBottom: 4 }} />
    <LoadingSkeleton width="60%" height={10} />
  </View>
);

export const SearchBarSkeleton = () => (
  <View className="flex-row items-center bg-white border border-secondary-200 rounded-xl px-4 py-3">
    <LoadingSkeleton width={20} height={20} borderRadius={10} style={{ marginRight: 12 }} />
    <LoadingSkeleton width="70%" height={16} />
    <LoadingSkeleton width={20} height={20} borderRadius={10} style={{ marginLeft: 12 }} />
  </View>
);