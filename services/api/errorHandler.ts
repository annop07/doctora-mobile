import { Alert } from 'react-native';
import { ApiError } from '@/types';
import { storageService } from '@/utils/storage';
import { router } from 'expo-router';

export class ErrorHandler {
  // Handle different types of API errors
  static handleApiError(error: ApiError): void {
    switch (error.status) {
      case 401:
        this.handleUnauthorizedError(error);
        break;
      case 403:
        this.handleForbiddenError(error);
        break;
      case 404:
        this.handleNotFoundError(error);
        break;
      case 422:
        this.handleValidationError(error);
        break;
      case 500:
      case 502:
      case 503:
        this.handleServerError(error);
        break;
      case 0:
        this.handleNetworkError(error);
        break;
      default:
        this.handleGenericError(error);
        break;
    }
  }

  // 401 - Unauthorized: Auto logout and redirect to login
  private static async handleUnauthorizedError(error: ApiError): Promise<void> {
    console.warn('401 Unauthorized - Logging out user');

    // Clear auth data
    await storageService.clearAllAuthData();

    // Show alert and redirect to login
    Alert.alert(
      'เซสชันหมดอายุ',
      'กรุณาเข้าสู่ระบบใหม่อีกครั้ง',
      [
        {
          text: 'ตกลง',
          onPress: () => {
            // Redirect to sign-in
            router.replace('/sign-in');
          }
        }
      ]
    );
  }

  // 403 - Forbidden: Show permission error
  private static handleForbiddenError(error: ApiError): void {
    Alert.alert(
      'ไม่ได้รับอนุญาต',
      'คุณไม่มีสิทธิ์ในการเข้าถึงข้อมูลนี้',
      [{ text: 'ตกลง' }]
    );
  }

  // 404 - Not Found: Show not found error
  private static handleNotFoundError(error: ApiError): void {
    Alert.alert(
      'ไม่พบข้อมูล',
      'ข้อมูลที่คุณค้นหาไม่พบในระบบ',
      [{ text: 'ตกลง' }]
    );
  }

  // 422 - Validation Error: Show field-specific errors
  private static handleValidationError(error: ApiError): void {
    const message = error.details?.errors
      ? Object.values(error.details.errors).flat().join('\n')
      : error.message || 'ข้อมูลที่ส่งไม่ถูกต้อง';

    Alert.alert(
      'ข้อมูลไม่ถูกต้อง',
      message,
      [{ text: 'ตกลง' }]
    );
  }

  // 500+ - Server Error: Show retry option
  private static handleServerError(error: ApiError): void {
    Alert.alert(
      'ปัญหาระบบเซิร์ฟเวอร์',
      'เกิดปัญหาในระบบ กรุณาลองใหม่อีกครั้งในภายหลัง',
      [
        { text: 'ตกลง', style: 'default' },
        {
          text: 'ลองใหม่',
          style: 'default',
          onPress: () => {
            // The caller should handle retry logic
            console.log('User requested retry');
          }
        }
      ]
    );
  }

  // Network Error: Show network connectivity error
  private static handleNetworkError(error: ApiError): void {
    Alert.alert(
      'ไม่สามารถเชื่อมต่อได้',
      'กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ตและลองใหม่อีกครั้ง',
      [
        { text: 'ตกลง', style: 'default' },
        {
          text: 'ลองใหม่',
          style: 'default',
          onPress: () => {
            console.log('User requested retry for network error');
          }
        }
      ]
    );
  }

  // Generic Error: Show generic error message
  private static handleGenericError(error: ApiError): void {
    Alert.alert(
      'เกิดข้อผิดพลาด',
      error.message || 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ',
      [{ text: 'ตกลง' }]
    );
  }

  // Silent error logging (for analytics/monitoring)
  static logError(error: ApiError, context?: string): void {
    const errorLog = {
      message: error.message,
      status: error.status,
      code: error.code,
      context,
      timestamp: new Date().toISOString(),
      details: error.details
    };

    if (__DEV__) {
      console.error('API Error:', errorLog);
    }

    // TODO: Send to error monitoring service (Sentry, Crashlytics, etc.)
    // ErrorReportingService.logError(errorLog);
  }

  // Check if error should show user-facing message
  static shouldShowUserError(error: ApiError): boolean {
    // Don't show user errors for certain status codes
    const silentErrors = [401]; // 401 is handled specially with logout
    return !silentErrors.includes(error.status);
  }

  // Get user-friendly error message without showing alert
  static getErrorMessage(error: ApiError): { title: string; message: string } {
    switch (error.status) {
      case 0:
        return {
          title: 'ไม่สามารถเชื่อมต่อได้',
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
      case 422:
        return {
          title: 'ข้อมูลไม่ถูกต้อง',
          message: error.message || 'ข้อมูลที่ส่งไม่ถูกต้อง'
        };
      case 500:
      case 502:
      case 503:
        return {
          title: 'ปัญหาระบบเซิร์ฟเวอร์',
          message: 'เกิดปัญหาในระบบ กรุณาลองใหม่อีกครั้งในภายหลัง'
        };
      default:
        return {
          title: 'เกิดข้อผิดพลาด',
          message: error.message || 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ'
        };
    }
  }
}

// Export for easy use
export const { handleApiError, logError, shouldShowUserError, getErrorMessage } = ErrorHandler;