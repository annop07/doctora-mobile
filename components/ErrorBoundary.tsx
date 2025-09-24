import React, { Component, ReactNode, ErrorInfo } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  handleReportError = () => {
    Alert.alert(
      'รายงานปัญหา',
      'คุณต้องการรายงานปัญหานี้ให้ทีมพัฒนาหรือไม่?',
      [
        { text: 'ยกเลิก', style: 'cancel' },
        {
          text: 'รายงาน',
          onPress: () => {
            // TODO: Implement error reporting
            Alert.alert('ขอบคุณ', 'ได้รับรายงานปัญหาแล้ว');
          }
        }
      ]
    );
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View className="flex-1 justify-center items-center px-6 bg-background-secondary">
          <View className="bg-white rounded-xl p-6 w-full max-w-sm shadow-sm">
            <Text className="text-xl font-rubik-bold text-text-primary text-center mb-2">
              เกิดข้อผิดพลาด
            </Text>
            <Text className="text-base font-rubik text-secondary-600 text-center mb-6">
              ขออภัยในความไม่สะดวก แอพพลิเคชันพบปัญหาที่ไม่คาดคิด
            </Text>

            {__DEV__ && this.state.error && (
              <View className="bg-red-50 p-3 rounded-lg mb-4">
                <Text className="text-xs font-mono text-red-800">
                  {this.state.error.message}
                </Text>
              </View>
            )}

            <View className="space-y-3">
              <TouchableOpacity
                onPress={this.handleRetry}
                className="bg-primary-600 py-3 px-6 rounded-xl"
              >
                <Text className="text-white font-rubik-semiBold text-center">
                  ลองใหม่อีกครั้ง
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={this.handleReportError}
                className="border border-secondary-200 py-3 px-6 rounded-xl"
              >
                <Text className="text-secondary-600 font-rubik-medium text-center">
                  รายงานปัญหา
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;