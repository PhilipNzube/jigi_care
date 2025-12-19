import React, { useEffect } from "react";
import * as SplashScreen from "expo-splash-screen";
import { loadFonts } from "../../../shared/utils/fontUtils";
import { useAuth } from "../../../shared/context/AuthContext";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function AppSplashScreen({ navigation }) {
  const { isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    // Wait for auth context to load stored auth data
    if (!isLoading) {
      checkAuthAndNavigate();
    }
  }, [isLoading, isAuthenticated]);

  const checkAuthAndNavigate = async () => {
    try {
      // Pre-load fonts
      await loadFonts();
      
      // Additional loading time for better UX (minimum 1 second)
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Tell the application to render
      await SplashScreen.hideAsync();
      
      // Navigate based on authentication status from context
      if (isAuthenticated) {
        // User is authenticated, go to main app
        navigation.replace("MainApp");
      } else {
        // User is not authenticated, go to onboarding
        navigation.replace("Onboarding");
      }
    } catch (e) {
      console.warn(e);
      // On error, default to onboarding
      await SplashScreen.hideAsync();
      navigation.replace("Onboarding");
    }
  };

  // Return null - the native splash screen will be visible
  return null;
}
