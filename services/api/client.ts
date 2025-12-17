import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { storageService } from '@/utils/storage';
import { ApiError, ApiResponse } from '@/types';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const getBaseUrl = () => {
  const debuggerHost = Constants.expoConfig?.hostUri?.split(':')[0];
  if (debuggerHost) return `http://${debuggerHost}:8082/api`;
  if (Platform.OS === 'android') return 'http://10.0.2.2:8082/api';
  return 'http://localhost:8082/api';
};

const BASE_URL = getBaseUrl();

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    this.client.interceptors.request.use(
      async (config) => {
        try {
          const token = await storageService.getAuthToken();
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        } catch (error) {
          console.warn('Failed to get auth token:', error);
        }

        console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url || 'undefined'}`);
        console.log('🚀 Base URL:', config.baseURL || 'undefined');
        console.log('🚀 Full URL:', (config.baseURL || '') + (config.url || ''));
        if (config.data) {
          console.log('📦 Request Data:', config.data);
        }

        return config;
      },
      (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor - handle common responses
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        if (__DEV__) {
          console.log(`✅ API Response: ${response.status} ${response.config.url}`);
          console.log('📦 Response Data:', response.data);
        }

        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config;

        const authRequiredEndpoints = [
          '/slots',
          '/recommend',
          '/smart-select',
          '/appointments/my',
          '/appointments/my-patients'
        ];
        const isExpected403 = error.response?.status === 403 &&
          authRequiredEndpoints.some(endpoint => originalRequest?.url?.includes(endpoint));

        if (__DEV__ && !isExpected403) {
          console.error(`❌ API Error: ${error.response?.status} ${originalRequest?.url}`);
          console.error('📦 Error Data:', error.response?.data);
        } else if (__DEV__ && isExpected403) {
          console.log(`ℹ️ API requires auth: ${originalRequest?.url} - using fallback`);
        }

        if (error.response?.status === 401) {
          await storageService.clearAllAuthData();
        }

        if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
          const apiError: ApiError = {
            message: 'เชื่อมต่ออินเทอร์เน็ตไม่ได้ กรุณาตรวจสอบการเชื่อมต่อ',
            status: 0,
            code: 'NETWORK_ERROR'
          };
          return Promise.reject(apiError);
        }

        if (error.code === 'ECONNABORTED') {
          const apiError: ApiError = {
            message: 'การเชื่อมต่อหมดเวลา กรุณาลองใหม่อีกครั้ง',
            status: 0,
            code: 'TIMEOUT_ERROR'
          };
          return Promise.reject(apiError);
        }

        if (error.response) {
          const responseData = error.response.data as any;
          const apiError: ApiError = {
            message: responseData?.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง',
            status: error.response.status,
            code: responseData?.code,
            details: responseData
          };
          return Promise.reject(apiError);
        }

        return Promise.reject({
          message: 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ',
          status: 0,
          code: 'UNKNOWN_ERROR'
        } as ApiError);
      }
    );
  }

  async get<T = any>(url: string, params?: any): Promise<ApiResponse<T>> {
    const response = await this.client.get(url, { params });
    return response.data;
  }

  async post<T = any>(url: string, data?: any): Promise<ApiResponse<T>> {
    const response = await this.client.post(url, data);
    return response.data;
  }

  async put<T = any>(url: string, data?: any): Promise<ApiResponse<T>> {
    const response = await this.client.put(url, data);
    return response.data;
  }

  async patch<T = any>(url: string, data?: any): Promise<ApiResponse<T>> {
    const response = await this.client.patch(url, data);
    return response.data;
  }

  async delete<T = any>(url: string): Promise<ApiResponse<T>> {
    const response = await this.client.delete(url);
    return response.data;
  }

  async uploadFile<T = any>(url: string, file: FormData): Promise<ApiResponse<T>> {
    const response = await this.client.post(url, file, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000,
    });
    return response.data;
  }

  updateBaseURL(newBaseURL: string): void {
    this.client.defaults.baseURL = newBaseURL;
  }

  getBaseURL(): string {
    return this.client.defaults.baseURL || BASE_URL;
  }
}

export const apiClient = new ApiClient();
export const axiosInstance = apiClient;