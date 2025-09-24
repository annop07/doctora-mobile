import { useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { Alert } from 'react-native';

export interface NetworkState {
  isConnected: boolean;
  isInternetReachable: boolean;
  type: string;
}

// Hook to get current network status
export const useNetworkStatus = () => {
  const [networkState, setNetworkState] = useState<NetworkState>({
    isConnected: true,
    isInternetReachable: true,
    type: 'unknown'
  });

  useEffect(() => {
    // Get initial network state
    NetInfo.fetch().then(state => {
      setNetworkState({
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable ?? false,
        type: state.type
      });
    });

    // Subscribe to network state changes
    const unsubscribe = NetInfo.addEventListener(state => {
      setNetworkState({
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable ?? false,
        type: state.type
      });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return networkState;
};

// Hook to show offline indicator
export const useOfflineNotification = (showAlert = true) => {
  const networkState = useNetworkStatus();
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    if (!networkState.isConnected) {
      setWasOffline(true);
      if (showAlert) {
        Alert.alert(
          'ไม่มีการเชื่อมต่ออินเทอร์เน็ต',
          'บางฟีเจอร์อาจไม่สามารถใช้งานได้ กรุณาตรวจสอบการเชื่อมต่อ',
          [{ text: 'ตกลง' }]
        );
      }
    } else if (wasOffline && networkState.isConnected) {
      // Back online
      setWasOffline(false);
      if (showAlert) {
        Alert.alert(
          'เชื่อมต่ออินเทอร์เน็ตแล้ว',
          'ข้อมูลจะถูกซิงค์อัตโนมัติ',
          [{ text: 'ตกลง' }]
        );
      }
    }
  }, [networkState.isConnected, showAlert, wasOffline]);

  return {
    ...networkState,
    wasOffline
  };
};

// Check if we should retry failed requests
export const shouldRetryRequest = (networkState: NetworkState): boolean => {
  return networkState.isConnected && networkState.isInternetReachable;
};

// Get offline cache key for data
export const getOfflineCacheKey = (endpoint: string, params?: any): string => {
  const paramString = params ? JSON.stringify(params) : '';
  return `offline_cache_${endpoint}_${paramString}`;
};

// Network-aware fetch wrapper
export const networkAwareFetch = async <T>(
  fetchFn: () => Promise<T>,
  cacheKey?: string,
  useCache = true
): Promise<T> => {
  const netInfo = await NetInfo.fetch();

  if (!netInfo.isConnected) {
    if (useCache && cacheKey) {
      // Try to get from cache
      const cachedData = await getCachedData<T>(cacheKey);
      if (cachedData) {
        return cachedData;
      }
    }
    throw new Error('No internet connection and no cached data available');
  }

  try {
    const result = await fetchFn();

    // Cache the result if successful
    if (useCache && cacheKey) {
      await setCachedData(cacheKey, result);
    }

    return result;
  } catch (error) {
    // If request fails, try cache as fallback
    if (useCache && cacheKey) {
      const cachedData = await getCachedData<T>(cacheKey);
      if (cachedData) {
        console.warn('Using cached data due to network error:', error);
        return cachedData;
      }
    }
    throw error;
  }
};

// Simple cache implementation using AsyncStorage
import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_PREFIX = '@doctora_cache_';
const CACHE_EXPIRY_KEY = '_expiry';

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

export const setCachedData = async <T>(
  key: string,
  data: T,
  expiryMinutes = 60
): Promise<void> => {
  try {
    const cacheItem: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      expiry: Date.now() + (expiryMinutes * 60 * 1000)
    };

    await AsyncStorage.setItem(
      `${CACHE_PREFIX}${key}`,
      JSON.stringify(cacheItem)
    );
  } catch (error) {
    console.error('Error caching data:', error);
  }
};

export const getCachedData = async <T>(key: string): Promise<T | null> => {
  try {
    const cachedJson = await AsyncStorage.getItem(`${CACHE_PREFIX}${key}`);
    if (!cachedJson) return null;

    const cacheItem: CacheItem<T> = JSON.parse(cachedJson);

    // Check if cache has expired
    if (Date.now() > cacheItem.expiry) {
      // Remove expired cache
      await AsyncStorage.removeItem(`${CACHE_PREFIX}${key}`);
      return null;
    }

    return cacheItem.data;
  } catch (error) {
    console.error('Error retrieving cached data:', error);
    return null;
  }
};

export const clearCache = async (keyPattern?: string): Promise<void> => {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const cacheKeys = allKeys.filter(key => key.startsWith(CACHE_PREFIX));

    const keysToRemove = keyPattern
      ? cacheKeys.filter(key => key.includes(keyPattern))
      : cacheKeys;

    await AsyncStorage.multiRemove(keysToRemove);
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
};

// Network status constants
export const NetworkType = {
  CELLULAR: 'cellular',
  WIFI: 'wifi',
  BLUETOOTH: 'bluetooth',
  ETHERNET: 'ethernet',
  WIMAX: 'wimax',
  VPN: 'vpn',
  UNKNOWN: 'unknown',
  NONE: 'none'
} as const;