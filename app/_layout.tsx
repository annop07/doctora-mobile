import { SplashScreen, Stack } from "expo-router";
import { QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { createQueryClient, setupAppStateListener } from '@/config/queryClient';
import { BackgroundSyncProvider } from '@/components/BackgroundSyncProvider';

import "../global.css"
import { useFonts } from "expo-font"
import { useEffect } from "react";

// Create enhanced query client
const queryClient = createQueryClient();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    "Rubik-Bold": require("../assets/fonts/Rubik-Bold.ttf"),
    "Rubik-ExtraBold": require("../assets/fonts/Rubik-ExtraBold.ttf"),
    "Rubik-Regular": require("../assets/fonts/Rubik-Regular.ttf"),
    "Rubik-Medium": require("../assets/fonts/Rubik-Medium.ttf"),
    "Rubik-Light": require("../assets/fonts/Rubik-Light.ttf"),
    "Rubik-semiBold": require("../assets/fonts/Rubik-SemiBold.ttf")
  })

  useEffect(() => {
    if (fontsLoaded){
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  // Setup AppState listener for background sync
  useEffect(() => {
    const cleanup = setupAppStateListener(queryClient);
    return cleanup;
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BackgroundSyncProvider>
          <Stack screenOptions={{ headerShown: false }} />
        </BackgroundSyncProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
