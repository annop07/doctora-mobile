import { QueryClient } from '@tanstack/react-query';
import { AppState, AppStateStatus } from 'react-native';
import { queryKeys } from '@/config/queryClient';

interface BackgroundSyncConfig {
  appointmentInterval: number; // milliseconds
  doctorInterval: number; // milliseconds
  enableBackgroundSync: boolean;
}

class BackgroundSyncService {
  private queryClient: QueryClient;
  private config: BackgroundSyncConfig;
  private intervals: { [key: string]: NodeJS.Timeout } = {};
  private appStateSubscription: any;

  constructor(queryClient: QueryClient, config?: Partial<BackgroundSyncConfig>) {
    this.queryClient = queryClient;
    this.config = {
      appointmentInterval: 30 * 1000, // 30 seconds
      doctorInterval: 5 * 60 * 1000, // 5 minutes
      enableBackgroundSync: true,
      ...config
    };

    this.setupAppStateListener();
  }

  private setupAppStateListener() {
    this.appStateSubscription = AppState.addEventListener('change', this.handleAppStateChange);
  }

  private handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (nextAppState === 'active') {
      this.startForegroundSync();
    } else if (nextAppState === 'background' || nextAppState === 'inactive') {
      this.stopAllSync();
    }
  };

  // Start syncing when app comes to foreground
  public startForegroundSync() {
    if (!this.config.enableBackgroundSync) return;

    console.log('🔄 Starting foreground sync...');

    // Immediately invalidate critical data
    this.queryClient.invalidateQueries({
      queryKey: queryKeys.appointments,
      refetchType: 'active'
    });

    // Start appointment sync interval
    this.startAppointmentSync();

    // Start doctor sync interval (less frequent)
    this.startDoctorSync();
  }

  private startAppointmentSync() {
    this.clearInterval('appointments');

    this.intervals.appointments = setInterval(() => {
      if (AppState.currentState === 'active') {
        console.log('🔄 Background sync: appointments');
        this.queryClient.invalidateQueries({
          queryKey: queryKeys.appointments,
          refetchType: 'active'
        });
      }
    }, this.config.appointmentInterval);
  }

  private startDoctorSync() {
    this.clearInterval('doctors');

    this.intervals.doctors = setInterval(() => {
      if (AppState.currentState === 'active') {
        console.log('🔄 Background sync: doctors');
        this.queryClient.invalidateQueries({
          queryKey: queryKeys.doctors,
          refetchType: 'active'
        });
      }
    }, this.config.doctorInterval);
  }

  // Stop all sync intervals
  public stopAllSync() {
    console.log('⏸️ Stopping background sync...');

    Object.keys(this.intervals).forEach(key => {
      this.clearInterval(key);
    });
  }

  private clearInterval(key: string) {
    if (this.intervals[key]) {
      clearInterval(this.intervals[key]);
      delete this.intervals[key];
    }
  }

  // Manual sync trigger
  public triggerManualSync() {
    console.log('🔄 Manual sync triggered');

    return Promise.all([
      this.queryClient.invalidateQueries({ queryKey: queryKeys.appointments }),
      this.queryClient.invalidateQueries({ queryKey: queryKeys.doctors }),
      this.queryClient.refetchQueries({ queryKey: queryKeys.specialties })
    ]);
  }

  // Sync specific data types
  public syncAppointments() {
    return this.queryClient.invalidateQueries({ queryKey: queryKeys.appointments });
  }

  public syncDoctors() {
    return this.queryClient.invalidateQueries({ queryKey: queryKeys.doctors });
  }

  public syncSpecialties() {
    return this.queryClient.refetchQueries({ queryKey: queryKeys.specialties });
  }

  // Configuration methods
  public updateConfig(newConfig: Partial<BackgroundSyncConfig>) {
    this.config = { ...this.config, ...newConfig };

    // Restart sync with new intervals
    if (AppState.currentState === 'active' && this.config.enableBackgroundSync) {
      this.stopAllSync();
      this.startForegroundSync();
    }
  }

  public enableSync() {
    this.config.enableBackgroundSync = true;
    if (AppState.currentState === 'active') {
      this.startForegroundSync();
    }
  }

  public disableSync() {
    this.config.enableBackgroundSync = false;
    this.stopAllSync();
  }

  // Cleanup
  public destroy() {
    this.stopAllSync();
    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
    }
  }

  // Get sync status
  public getSyncStatus() {
    return {
      isEnabled: this.config.enableBackgroundSync,
      activeIntervals: Object.keys(this.intervals),
      config: this.config,
      appState: AppState.currentState
    };
  }
}

// Singleton instance
let backgroundSyncInstance: BackgroundSyncService | null = null;

export const createBackgroundSyncService = (
  queryClient: QueryClient,
  config?: Partial<BackgroundSyncConfig>
): BackgroundSyncService => {
  if (backgroundSyncInstance) {
    backgroundSyncInstance.destroy();
  }

  backgroundSyncInstance = new BackgroundSyncService(queryClient, config);
  return backgroundSyncInstance;
};

export const getBackgroundSyncService = (): BackgroundSyncService | null => {
  return backgroundSyncInstance;
};

// React hook for using background sync
import { useEffect } from 'react';

export const useBackgroundSync = (queryClient: QueryClient, config?: Partial<BackgroundSyncConfig>) => {
  useEffect(() => {
    const syncService = createBackgroundSyncService(queryClient, config);

    // Auto-start if app is currently active
    if (AppState.currentState === 'active') {
      syncService.startForegroundSync();
    }

    return () => {
      syncService.destroy();
    };
  }, [queryClient]);

  return {
    syncService: backgroundSyncInstance,
    manualSync: () => backgroundSyncInstance?.triggerManualSync(),
    syncAppointments: () => backgroundSyncInstance?.syncAppointments(),
    syncDoctors: () => backgroundSyncInstance?.syncDoctors(),
    enableSync: () => backgroundSyncInstance?.enableSync(),
    disableSync: () => backgroundSyncInstance?.disableSync(),
    getSyncStatus: () => backgroundSyncInstance?.getSyncStatus()
  };
};

export default BackgroundSyncService;