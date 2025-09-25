import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { ApiError } from '@/types';

interface ErrorStateProps {
  error: Error | ApiError | null;
  onRetry?: () => void;
  title?: string;
  message?: string;
  showRetry?: boolean;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  error,
  onRetry,
  title,
  message,
  showRetry = true
}) => {
  const getErrorMessage = (): { title: string; message: string } => {
    if (title && message) {
      return { title, message };
    }

    if (error && 'status' in error) {
      // API Error
      const apiError = error as ApiError;
      switch (apiError.status) {
        case 0:
          return {
            title: 'ไม่สามารถเชื่อมต่ออินเทอร์เน็ตได้',
            message: 'กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ตและลองใหม่อีกครั้ง'
          };
        case 401:
          return {
            title: 'จำเป็นต้องเข้าสู่ระบบ',
            message: 'กรุณาเข้าสู่ระบบเพื่อใช้งานฟีเจอร์นี้'
          };
        case 403:
          return {
            title: 'ไม่ได้รับอนุญาต',
            message: 'คุณไม่มีสิทธิ์ในการเข้าถึงข้อมูลนี้'
          };
        case 404:
          return {
            title: 'ไม่พบข้อมูล',
            message: 'ข้อมูลที่ค้นหาไม่พบในระบบ'
          };
        case 500:
          return {
            title: 'ปัญหาระบบเซิร์ฟเวอร์',
            message: 'เกิดปัญหาในระบบ กรุณาลองใหม่อีกครั้งในภายหลัง'
          };
        default:
          return {
            title: 'เกิดข้อผิดพลาด',
            message: apiError.message || 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ'
          };
      }
    }

    return {
      title: 'เกิดข้อผิดพลาด',
      message: error?.message || 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ'
    };
  };

  const { title: errorTitle, message: errorMessage } = getErrorMessage();

  const handleContactSupport = () => {
    Alert.alert(
      'ติดต่อฝ่ายสนับสนุน',
      'หากปัญหายังคงมีอยู่ สามารถติดต่อฝ่ายสนับสนุนผ่านทางโทรศัพท์ 02-XXX-XXXX หรือ อีเมล support@doctora.com',
      [{ text: 'ตกลง' }]
    );
  };

  return (
    <View className="flex-1 justify-center items-center px-6">
      <View className="bg-white rounded-xl p-6 w-full max-w-sm shadow-sm">
        <View className="items-center mb-4">
          <View className="w-16 h-16 bg-red-100 rounded-full items-center justify-center mb-3">
            <Text className="text-2xl">⚠️</Text>
          </View>
          <Text className="text-lg font-rubik-bold text-text-primary text-center">
            {errorTitle}
          </Text>
        </View>

        <Text className="text-base font-rubik text-secondary-600 text-center mb-6">
          {errorMessage}
        </Text>

        {__DEV__ && error && (
          <View className="bg-red-50 p-3 rounded-lg mb-4">
            <Text className="text-xs font-mono text-red-800">
              {error instanceof Error ? error.stack : JSON.stringify(error, null, 2)}
            </Text>
          </View>
        )}

        <View className="space-y-3">
          {showRetry && onRetry && (
            <TouchableOpacity
              onPress={onRetry}
              className="bg-primary-600 py-3 px-6 rounded-xl"
            >
              <Text className="text-white font-rubik-semiBold text-center">
                ลองใหม่อีกครั้ง
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={handleContactSupport}
            className="border border-secondary-200 py-3 px-6 rounded-xl"
          >
            <Text className="text-secondary-600 font-rubik-medium text-center">
              ติดต่อฝ่ายสนับสนุน
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

interface NetworkErrorProps {
  onRetry?: () => void;
}

export const NetworkError: React.FC<NetworkErrorProps> = ({ onRetry }) => (
  <ErrorState
    error={null}
    title="ไม่สามารถเชื่อมต่อได้"
    message="กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ตและลองใหม่อีกครั้ง"
    onRetry={onRetry}
  />
);

interface EmptyStateProps {
  title: string;
  message: string;
  actionText?: string;
  onAction?: () => void;
  icon?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  message,
  actionText,
  onAction,
  icon = "📭"
}) => (
  <View className="flex-1 justify-center items-center px-6">
    <View className="items-center">
      <View className="w-20 h-20 bg-secondary-100 rounded-full items-center justify-center mb-4">
        <Text className="text-3xl">{icon}</Text>
      </View>
      <Text className="text-lg font-rubik-bold text-text-primary text-center mb-2">
        {title}
      </Text>
      <Text className="text-base font-rubik text-secondary-600 text-center mb-6">
        {message}
      </Text>

      {actionText && onAction && (
        <TouchableOpacity
          onPress={onAction}
          className="bg-primary-600 py-3 px-6 rounded-xl"
        >
          <Text className="text-white font-rubik-semiBold text-center">
            {actionText}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  </View>
);

// Add displayName for better debugging
ErrorState.displayName = 'ErrorState';
NetworkError.displayName = 'NetworkError';
EmptyState.displayName = 'EmptyState';

export default ErrorState;