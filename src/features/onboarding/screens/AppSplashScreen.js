import React, { useEffect } from "react";
import * as SplashScreen from "expo-splash-screen";
import { loadFonts } from "../../../shared/utils/fontUtils";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function AppSplashScreen({ navigation }) {
  useEffect(() => {
    // Simulate loading time (like checking user auth, loading data, etc.)
    const prepare = async () => {
      try {
        // Pre-load fonts
        await loadFonts();
        // Additional loading time for better UX
        await new Promise((resolve) => setTimeout(resolve, 2000)); // 2 second delay
      } catch (e) {
        console.warn(e);
      } finally {
        // Tell the application to render
        await SplashScreen.hideAsync();
        // Navigate to onboarding after splash
        navigation.replace("Onboarding");
      }
    };

    prepare();
  }, [navigation]);

  // Return null - the native splash screen will be visible
  return null;
}
