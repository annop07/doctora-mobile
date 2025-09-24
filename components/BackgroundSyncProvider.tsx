import React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useBackgroundSync } from '@/services/backgroundSync';

interface BackgroundSyncProviderProps {
  children: React.ReactNode;
}

export const BackgroundSyncProvider: React.FC<BackgroundSyncProviderProps> = ({ children }) => {
  const queryClient = useQueryClient();

  // Initialize background sync
  useBackgroundSync(queryClient, {
    appointmentInterval: 30 * 1000, // 30 seconds
    doctorInterval: 5 * 60 * 1000, // 5 minutes
    enableBackgroundSync: true
  });

  return <>{children}</>;
};

export default BackgroundSyncProvider;