import React from 'react';
import { View, Text } from 'react-native';
import { useNetworkStatus } from '@/utils/networkStatus';

interface OfflineIndicatorProps {
  showWhenConnected?: boolean;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({
  showWhenConnected = false
}) => {
  const networkState = useNetworkStatus();

  // Don't show if connected and showWhenConnected is false
  if (networkState.isConnected && !showWhenConnected) {
    return null;
  }

  return (
    <View
      className={`px-4 py-2 ${
        networkState.isConnected
          ? 'bg-green-500'
          : 'bg-red-500'
      }`}
    >
      <Text className="text-white text-center text-sm font-rubik-medium">
        {networkState.isConnected
          ? '🟢 เชื่อมต่ออินเทอร์เน็ตแล้ว'
          : '🔴 ไม่มีการเชื่อมต่ออินเทอร์เน็ต'
        }
      </Text>
    </View>
  );
};

export default OfflineIndicator;