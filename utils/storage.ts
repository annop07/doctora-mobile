import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '@/types';

const STORAGE_KEYS = {
  AUTH_TOKEN: '@doctora_auth_token',
  USER_DATA: '@doctora_user_data',
  REMEMBER_EMAIL: '@doctora_remember_email',
} as const;

class StorageService {
  async setAuthToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    } catch (error) {
      console.error('Error storing auth token:', error);
      throw new Error('Failed to store authentication token');
    }
  }

  async getAuthToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    } catch (error) {
      console.error('Error retrieving auth token:', error);
      return null;
    }
  }

  async removeAuthToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    } catch (error) {
      console.error('Error removing auth token:', error);
    }
  }

  async setUserData(userData: User): Promise<void> {
    try {
      const jsonData = JSON.stringify(userData);
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, jsonData);
    } catch (error) {
      console.error('Error storing user data:', error);
      throw new Error('Failed to store user data');
    }
  }

  async getUserData(): Promise<User | null> {
    try {
      const jsonData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      return jsonData ? JSON.parse(jsonData) : null;
    } catch (error) {
      console.error('Error retrieving user data:', error);
      return null;
    }
  }

  async removeUserData(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
    } catch (error) {
      console.error('Error removing user data:', error);
    }
  }

  async setRememberEmail(email: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.REMEMBER_EMAIL, email);
    } catch (error) {
      console.error('Error storing remember email:', error);
    }
  }

  async getRememberEmail(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.REMEMBER_EMAIL);
    } catch (error) {
      console.error('Error retrieving remember email:', error);
      return null;
    }
  }

  async removeRememberEmail(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.REMEMBER_EMAIL);
    } catch (error) {
      console.error('Error removing remember email:', error);
    }
  }

  async clearAllAuthData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.AUTH_TOKEN,
        STORAGE_KEYS.USER_DATA,
      ]);
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
  }

  async isLoggedIn(): Promise<boolean> {
    try {
      const token = await this.getAuthToken();
      const userData = await this.getUserData();
      return !!(token && userData);
    } catch (error) {
      console.error('Error checking login status:', error);
      return false;
    }
  }

  async getAllKeys(): Promise<string[]> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      return [...keys];
    } catch (error) {
      console.error('Error getting all keys:', error);
      return [];
    }
  }

  async clearAllStorage(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing all storage:', error);
    }
  }
}

export const storageService = new StorageService();

export const {
  setAuthToken,
  getAuthToken,
  removeAuthToken,
  setUserData,
  getUserData,
  removeUserData,
  setRememberEmail,
  getRememberEmail,
  removeRememberEmail,
  clearAllAuthData,
  isLoggedIn,
  getAllKeys,
  clearAllStorage,
} = storageService;